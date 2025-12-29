import http from 'k6/http';
import { check, sleep } from 'k6';

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
const BASE_URL = __ENV.BASE_URL || 'https://jsonplaceholder.typicode.com'; // Changed to public API

// Simplified investors for demo (using post IDs)
const investors = [
    { investorId: '1', expectedTitle: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit' },
    { investorId: '2', expectedTitle: 'qui est esse' },
];

export default function () {
    const investor = investors[Math.floor(Math.random() * investors.length)];
    const url = `${BASE_URL}/posts/${investor.investorId}`; // Public API endpoint

    const params = {}; // No auth needed for public API

    const res = http.get(url, params);

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
        'id matches': (r) => r.json().id == investor.investorId,
        'title matches': (r) => r.json().title === investor.expectedTitle,
    });

    if (!isSuccess) {
        console.log(`Failed request for post ${investor.investorId}: ${res.status} - ${res.body}`);
    }

    sleep(1);
}