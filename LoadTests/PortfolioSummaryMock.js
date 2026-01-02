
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import { group } from 'k6';
import { jUnit } from '../node_modules/k6-junit/index.js';

// Custom metric to simulate response time
let responseTimeTrend = new Trend('response_time');

// Load investors JSON once for all virtual users
const investors = new SharedArray('investors', function () {
    return JSON.parse(open('../data/investors.json'));
});

// k6 options to simulate load
export let options = {
    scenarios: {
        portfolio_summary_load_test: {
              executor: 'ramping-vus',
                startVUs: 0,
            // QUICK TEST 
            // stages: [
            //     { duration: '10s', target: 10 },
            //     { duration: '10s', target: 0 },
            // ],
            // FULL TEST
    stages: [
        { duration: '1m', target: 20 }, // Ramp-up to 20 virtual users
        { duration: '3m', target: 50 }, // Steady state
        { duration: '1m', target: 100 }, // Spike load
        { duration: '1m', target: 0 }, // Ramp-down
    ],
        }},
    thresholds: {
        'response_time': ['p(95)<2000'],
        'http_req_failed': ['rate<0.01'],
    },
};

// Simulate API call with mock data
function getInvestorData(investor) {
    // Simulate response time (200-700ms)
    let fakeResponseTime = Math.floor(Math.random() * 500) + 200;
    responseTimeTrend.add(fakeResponseTime);
    return investor;
}

export default function () {
    // Pick a random investor each iteration
    const investor = investors[Math.floor(Math.random() * investors.length)];
    const res = getInvestorData(investor);

    group('Load Test Validations', () => {
        // Validate mock response
        const isSuccess = check(res, {
            'investorId exists': (r) => r.investorId !== undefined,
            'investorName exists': (r) => r.expectedName !== undefined,
            'totalCommitment exists': (r) => r.totalCommitment !== undefined,
            'totalCalled exists': (r) => r.totalCalled !== undefined,
            'totalDistributed exists': (r) => r.totalDistributed !== undefined,
            'funds array exists': (r) => Array.isArray(r.funds),
            'first fund name exists': (r) => r.funds.length > 0 && r.funds[0].fundName !== undefined,
        });

        if (!isSuccess) {
            console.log(`Validation failed for investor ${investor.investorId}`);
        }
    });

    sleep(1); // simulate user think time
}

export function handleSummary(data) {
    return {
        'Reports/load-results.xml': jUnit(data)
    };
}
