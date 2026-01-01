import { check } from 'k6';
import { SharedArray } from 'k6/data';
import { group } from 'k6';
import { jUnit } from '../node_modules/k6-junit/index.js';

// Load investors mock data
const investors = new SharedArray('investors', function () {
    return JSON.parse(open('../data/investors.json'));
});

// Security-only options 
export let options = {
    vus: 1,        // Single virtual user
    iterations: 1, // Run once
    thresholds: {
        'checks': ['rate==1.0'],  // Must pass 100% of checks
    },
};

// Function to simulate API response for security tests
function mockApiResponse(investorId, token) {
    if (!token) {
        return { status: 401, body: 'Unauthorized' };
    }
    // Check for malicious input (XSS, SQL injection, etc.)
    if (investorId.includes('<') || investorId.includes('>') || investorId.includes("'") || investorId.includes(';') || investorId.includes('--')) {
        return { status: 400, body: 'Invalid investorId' };
    }
    const investor = investors.find((i) => i.investorId === investorId) || investors[0];
    return {
        status: 200,
        body: JSON.stringify(investor),
    };
}

export default function () {
    console.log('Starting Security Tests...');
    
    // Test data
    const investor = investors[0];  // Use first investor for consistency
    const MOCK_TOKEN = 'MOCK_TOKEN';
    
    group('Authorization Tests', () => {
        // --- Security Test 1: Unauthorized Access ---
        console.log('Test 1: Unauthorized Access');
        let res = mockApiResponse(investor.investorId, null);
        check(res, { 
            '401 for missing token': (r) => r.status === 401,
            'Unauthorized message': (r) => r.body === 'Unauthorized'
        });
    });
    
    group('Input Validation Tests', () => {
        // --- Security Test 2: Input Validation (XSS Prevention) ---
        console.log('Test 2: Input Validation');
        let res = mockApiResponse('<script>alert("XSS")</script>', MOCK_TOKEN);
        check(res, {
            '400 for invalid input': (r) => r.status === 400,
            'Invalid message': (r) => r.body === 'Invalid investorId'
        });
        
        // --- Security Test 3: SQL Injection Simulation ---
        console.log('Test 3: SQL Injection Simulation');
        res = mockApiResponse("'; DROP TABLE users; --", MOCK_TOKEN);
        check(res, {
            '400 for SQL injection': (r) => r.status === 400,
            'Invalid message for SQL': (r) => r.body === 'Invalid investorId'
        });
    });
    
    group('Valid Request Tests', () => {
        // --- Security Test 4: Valid Authorized Request ---
        console.log('Test 4: Valid Authorized Request');
        let res = mockApiResponse(investor.investorId, MOCK_TOKEN);
        check(res, {
            '200 for valid request': (r) => r.status === 200,
            'Contains investor data': (r) => r.body.includes(investor.investorId)
        });
    });
    
    console.log('Security Tests Completed.');
}

export function handleSummary(data) {
    return {
        'Reports/security-results.xml': jUnit(data)
    };
}