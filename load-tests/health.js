import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.TEST_URL || 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // ramp-up to 50 VUs
    { duration: '1m', target: 50 },  // hold
    { duration: '10s', target: 0 },  // ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // <1% error rate
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/api/health`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}