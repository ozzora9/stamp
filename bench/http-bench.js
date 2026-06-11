#!/usr/bin/env node
const { performance } = require("perf_hooks");
const { argv } = require("process");

const getArg = (name, fallback) => {
  const prefix = `--${name}=`;
  const arg = argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : fallback;
};

const url = getArg("url", "http://localhost:3000/api/hello");
const concurrency = Number(getArg("concurrency", "50"));
const totalRequests = Number(getArg("requests", "1000"));
const durationSeconds = Number(getArg("duration", "15"));
const method = getArg("method", "GET");
const body = getArg("body", "");
const headersArg = getArg("headers", "");

const headers = headersArg
  ? Object.fromEntries(
      headersArg
        .split(";")
        .map((item) => item.split(":").map((part) => part.trim())),
    )
  : {};

if (!url) {
  console.error("Error: --url is required.");
  process.exit(1);
}

const stats = {
  requests: 0,
  success: 0,
  failed: 0,
  totalLatency: 0,
  minLatency: Number.POSITIVE_INFINITY,
  maxLatency: 0,
};

const shouldRun = () => {
  if (durationSeconds > 0) {
    return performance.now() < endTime;
  }
  return stats.requests < totalRequests;
};

let endTime = Infinity;
if (durationSeconds > 0) {
  endTime = performance.now() + durationSeconds * 1000;
}

const sendRequest = async () => {
  while (shouldRun()) {
    const start = performance.now();
    try {
      const init = { method, headers };
      if (body && method !== "GET") {
        init.body = body;
      }
      const response = await fetch(url, init);
      const latency = performance.now() - start;
      stats.requests += 1;
      stats.totalLatency += latency;
      stats.minLatency = Math.min(stats.minLatency, latency);
      stats.maxLatency = Math.max(stats.maxLatency, latency);

      if (response.ok) {
        stats.success += 1;
      } else {
        stats.failed += 1;
      }
    } catch (error) {
      const latency = performance.now() - start;
      stats.requests += 1;
      stats.failed += 1;
      stats.totalLatency += latency;
      stats.minLatency = Math.min(stats.minLatency, latency);
      stats.maxLatency = Math.max(stats.maxLatency, latency);
    }

    if (totalRequests > 0 && stats.requests >= totalRequests) {
      break;
    }
  }
};

(async () => {
  console.log("HTTP benchmark starting");
  console.log(`url: ${url}`);
  console.log(`concurrency: ${concurrency}`);
  console.log(`requests: ${totalRequests}`);
  console.log(`duration: ${durationSeconds}s`);
  console.log(`method: ${method}`);

  const workers = [];
  for (let i = 0; i < concurrency; i += 1) {
    workers.push(sendRequest());
  }

  await Promise.all(workers);

  const totalSeconds =
    durationSeconds > 0
      ? durationSeconds
      : Math.max(
          1,
          (performance.now() - (endTime - durationSeconds * 1000)) / 1000,
        );
  const avgLatency =
    stats.requests > 0 ? stats.totalLatency / stats.requests : 0;

  console.log("\nHTTP benchmark results");
  console.log(`requests: ${stats.requests}`);
  console.log(`success: ${stats.success}`);
  console.log(`failed: ${stats.failed}`);
  console.log(
    `throughput: ${(stats.requests / totalSeconds).toFixed(2)} req/sec`,
  );
  console.log(`avg latency: ${avgLatency.toFixed(2)} ms`);
  console.log(`min latency: ${stats.minLatency.toFixed(2)} ms`);
  console.log(`max latency: ${stats.maxLatency.toFixed(2)} ms`);
})();
