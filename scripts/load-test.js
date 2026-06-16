/* global process, console, fetch, performance, setTimeout, setInterval, clearInterval */
/**
 * Simple load test using Node.js fetch (Node 18+ required).
 * Usage: node scripts/load-test.js [url] [rps] [duration_seconds]
 * Example: node scripts/load-test.js http://localhost:3000/api/health 50 30
 */

const TARGET = process.argv[2] || (process.env.APP_URL || 'http://localhost:3000') + '/api/health';
const RPS = parseInt(process.argv[3] || '50', 10);
const DURATION_SEC = parseInt(process.argv[4] || '30', 10);
const TOTAL_REQUESTS = RPS * DURATION_SEC;
const INTERVAL_MS = 1000 / RPS;

const latencies = [];
let successes = 0;
let failures = 0;
let running = true;

async function sendRequest() {
  const start = performance.now();
  try {
    const res = await fetch(TARGET);
    const elapsed = performance.now() - start;
    latencies.push(elapsed);
    if (res.ok) successes++;
    else failures++;
  } catch {
    const elapsed = performance.now() - start;
    latencies.push(elapsed);
    failures++;
  }
}

function printStats() {
  const sorted = [...latencies].sort((a, b) => a - b);
  const total = successes + failures;
  const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  const max = sorted[sorted.length - 1];
  const actualRps = (total / DURATION_SEC).toFixed(1);

  console.log(`
=== Load Test Results ===
Target:       ${TARGET}
Duration:     ${DURATION_SEC}s
Requested RPS: ${RPS}
Actual RPS:   ${actualRps}
Total:        ${total}
Successes:    ${successes}
Failures:     ${failures}
Success Rate: ${((successes / total) * 100).toFixed(1)}%

Latencies (ms):
  avg:  ${avg.toFixed(1)}
  p50:  ${p50.toFixed(1)}
  p95:  ${p95.toFixed(1)}
  p99:  ${p99.toFixed(1)}
  max:  ${max.toFixed(1)}
`);
}

console.log(`Starting load test: ${TOTAL_REQUESTS} requests over ${DURATION_SEC}s (${RPS} RPS)...`);

const startTime = Date.now();

// Fire requests at a fixed interval
const interval = setInterval(() => {
  if (!running) return;
  sendRequest();
  const elapsed = (Date.now() - startTime) / 1000;
  if (elapsed >= DURATION_SEC) {
    running = false;
    clearInterval(interval);
    // Wait for in-flight requests to finish
    setTimeout(printStats, 2000);
  }
}, INTERVAL_MS);
