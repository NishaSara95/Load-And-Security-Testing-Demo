# InvestorFlow Load Testing Demo

[![CI](https://github.com/NishaSara95/Load-And-Security-Testing-Demo/actions/workflows/ci.yml/badge.svg)](https://github.com/NishaSara95/Load-And-Security-Testing-Demo/actions/workflows/ci.yml)

This project demonstrates load testing, security testing, and API validation for the InvestorFlow portfolio summary endpoint using [k6](https://k6.io/). It includes mock simulations, real API tests, and security checks to showcase best practices in performance and security testing.

## Project Structure

```
InvestorFlow Demo/
├── README.md                          # This file
├── Json/
│   └── investors.json                 # Mock investor data for tests
├── LoadTests/
│   ├── PortfolioSummaryTest1.js       # Refactored load test with env vars
│   └── PortfolioSummaryMock.js        # Mock load testing (no network calls)
├── SecurityTests/
│   └── PortFolioSummarySecurity.js    # Security validation tests
├── PublicAPI/
│   └── PublicAPIDemo.js               # Demo with public JSONPlaceholder API
├── Reports/
│   └── PortfolioSummaryMock_Report.html  # HTML report from mock test
└── .github/
    └── workflows/
        └── ci.yml                     # GitHub Actions CI/CD pipeline
```

## Prerequisites

- [k6](https://k6.io/docs/get-started/installation/) installed (v1.4.2+ recommended)
- Node.js (optional, for any npm-based tools)

## Setup

1. Clone or navigate to the project directory.
2. Ensure `investors.json` is in the `data/` folder.
3. For tests requiring API access, set environment variables:
   ```bash
   export BASE_URL="https://your-api-endpoint.com"
   export OAUTH_TOKEN="your-valid-token"
   ```

## Running Tests

### Load Tests
- **Mock Load Test** (Recommended for demos):
  ```bash
  k6 run load-tests/PortfolioSummaryMock.js
  ```
  - Simulates load with 100 VUs over 6 minutes.
  - Generates `reports/PortfolioSummaryMock_Report.html`.

- **Refactored Load Test**:
  ```bash
  k6 run load-tests/PortfolioSummaryTest1.js
  ```
  - Requires valid API credentials.

### Security Tests
- **Security Validation**:
  ```bash
  k6 run security-tests/PortfolioSummarySecurity.js
  ```
  - Runs 4 security checks (auth, input validation, SQL injection, valid requests).
  - Mock-based, no external API needed.

### Public API Demo
- **JSONPlaceholder Demo**:
  ```bash
  k6 run public-api/PublicAPIDemo.js
  ```
  - Tests with a public API (no auth required).

## Key Features

- **Modular Design**: Separate folders for data, tests, and reports.
- **Mock Testing**: Avoid external dependencies for development.
- **Security Focus**: Validates auth, input sanitization, and attack prevention.
- **Reporting**: HTML and JSON outputs for analysis.
- **Environment Config**: Uses `__ENV` for flexible API endpoints.

## Test Results Summary

- **Mock Load Test**: 14,330 iterations, 100% checks passed, P95 response time < 675ms.
- **Security Tests**: 8/8 checks passed (100% success rate).
- **Thresholds**: All met (e.g., >95% check rate).

## CI/CD Pipeline

Tests are configured to run in Jenkins with:
- Automated test execution on code push
- HTML report generation
- JUnit XML output for test tracking
- Artifact archiving

### What it does:
- Runs load tests (mock with 10 VUs for 30s), security tests, and public API demos.
- Generates and uploads test reports as artifacts.
- Ensures code quality by validating test scripts.

### Viewing Results:
- Go to the [Actions tab](https://github.com/NishaSara95/Load-And-Security-Testing-Demo/actions) in the repository.
- Check the latest workflow run for logs and downloaded artifacts.

## Troubleshooting

- **"no exported functions in script"**: Ensure `export default function` is present.
- **API Failures**: Check TLS certs, tokens, and network.
- **k6 Version Issues**: Update to latest k6 for full ES6 support.
- **Reports Not Generating**: Ensure write permissions in `reports/` folder.

## Contributing

- Add new tests to appropriate folders.
- Update `investors.json` for more test data.
- Run all tests before committing.

## License

Demo project - No specific license.

---

Generated for InvestorFlow Demo | Date: 29 December 2025