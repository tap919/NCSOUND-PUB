# Load Tests

Load tests for the NcSound Publishing API using [k6](https://k6.io/).

## Prerequisites

1. Install [k6](https://k6.io/docs/getting-started/installation/):
   ```bash
   # macOS
   brew install k6
   # Linux (Debian/Ubuntu)
   sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update && sudo apt-get install k6
   # Windows
   choco install k6
   ```

2. Set the `TEST_URL` environment variable to the target environment:
   ```bash
   export TEST_URL=https://staging.ncsound.example.com
   ```

## Running Tests

```bash
npm run load:test              # runs health.js against TEST_URL (default: localhost:3000)
k6 run load-tests/health.js    # same, explicit
k6 run --vus 100 --duration 30s load-tests/health.js   # ad-hoc run
```

## Current Test Scenarios

### `health.js`

- **Target**: `GET /api/health`
- **Stages**: ramp 0→50 VUs (30s) → hold 50 VUs (1m) → ramp-down (10s)
- **Thresholds**:
  - p95 latency < 500 ms
  - Error rate < 1 %

## Adding New Scenarios

Create a new file in `load-tests/`, e.g. `outreach.js`, then add an npm script:

```jsonc
"load:test:outreach": "k6 run load-tests/outreach.js"
```

See the [k6 docs](https://k6.io/docs/) for the full scripting API.