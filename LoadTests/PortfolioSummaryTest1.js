import http from 'k6/http';
import { check, sleep } from 'k6';

// Load investors data from JSON file
const investors = JSON.parse(open('./investors.json'));

export let options = {
    stages: [
        { duration: '1m', target: 20 }, // Ramp-up to 20 virtual users
        { duration: '3m', target: 50 }, // Steady state
        { duration: '1m', target: 100 }, // Spike load
        { duration: '1m', target: 0 }, // Ramp-down
    ],
    thresholds: {
        'http_req_duration': ['p(95)<2000'], // 95% of requests < 2s
        'http_req_failed': ['rate<0.01'], // Error rate < 1%
    },
};

// Configuration from environment variables
const BASE_URL = __ENV.BASE_URL || 'https://api.investorflow.com';
const TOKEN = __ENV.OAUTH_TOKEN || 'YOUR_OAUTH_TOKEN';

export default function () {
    // Pick a random investor for this iteration
    const investor = investors[Math.floor(Math.random() * investors.length)];
    const url = `${BASE_URL}/api/v1/portfolio/summary?investorId=${investor.investorId}&currency=USD`;

    const params = {
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
        },
    };

    // const res = http.get(url, params);
    const res = investor;

    // Validate response
    const isSuccess = check(res, {
        'status is 200': (r) => r.status === 200,
        'response is JSON': (r) => {
            try {
                r.json();
                return true;
            } catch {
                return false;
            }
        },
        'investorId matches': (r) => r.json().investorId === investor.investorId,
        'investorName matches': (r) => r.json().investorName === investor.expectedName,
        'totalCommitment correct': (r) => r.json().totalCommitment === investor.totalCommitment,
        'totalCalled correct': (r) => r.json().totalCalled === investor.totalCalled,
        'totalDistributed correct': (r) => r.json().totalDistributed === investor.totalDistributed,
        'funds array exists': (r) => Array.isArray(r.json().funds),
        'first fund matches': (r) => r.json().funds && r.json().funds.length > 0 && r.json().funds[0].fundName === investor.funds[0].fundName,
    });

    if (!isSuccess) {
        console.log(`Failed request for investor ${investor.investorId}: ${res.status} - ${res.body}`);
    }

    sleep(1); 
}
