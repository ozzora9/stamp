#!/usr/bin/env node
const WebSocket = require("ws");
const { performance } = require("perf_hooks");
const { argv } = require("process");

const getArg = (name, fallback) => {
  const prefix = `--${name}=`;
  const arg = argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : fallback;
};

const url = getArg("url", "ws://localhost:3000");
const clients = Number(getArg("clients", "50"));
const messagesPerClient = Number(getArg("messages", "20"));
const messageText = getArg("message", "ping");
const echoMode = getArg("mode", "echo") === "echo";

const stats = {
  connected: 0,
  failedConnections: 0,
  sent: 0,
  received: 0,
  errors: 0,
  totalLatency: 0,
  minLatency: Number.POSITIVE_INFINITY,
  maxLatency: 0,
};

const clientsState = [];

const createClient = (index) => {
  const ws = new WebSocket(url);
  const state = {
    index,
    sent: 0,
    received: 0,
    lastSentAt: 0,
  };
  clientsState[index] = state;

  ws.on("open", () => {
    stats.connected += 1;
    if (echoMode) {
      sendMessage(ws, state);
    } else {
      for (let i = 0; i < messagesPerClient; i += 1) {
        ws.send(messageText);
        stats.sent += 1;
      }
      ws.close();
    }
  });

  ws.on("message", () => {
    state.received += 1;
    stats.received += 1;
    const latency = performance.now() - state.lastSentAt;
    stats.totalLatency += latency;
    stats.minLatency = Math.min(stats.minLatency, latency);
    stats.maxLatency = Math.max(stats.maxLatency, latency);

    if (state.sent < messagesPerClient) {
      sendMessage(ws, state);
    } else {
      ws.close();
    }
  });

  ws.on("error", () => {
    stats.errors += 1;
    stats.failedConnections += 1;
  });

  ws.on("close", () => {
    // no-op
  });
};

const sendMessage = (ws, state) => {
  if (state.sent >= messagesPerClient) return;
  state.lastSentAt = performance.now();
  ws.send(`${messageText} ${state.index}-${state.sent}`);
  state.sent += 1;
  stats.sent += 1;
};

(async () => {
  console.log("WebSocket benchmark starting");
  console.log(`url: ${url}`);
  console.log(`clients: ${clients}`);
  console.log(`messagesPerClient: ${messagesPerClient}`);
  console.log(`mode: ${echoMode ? "echo" : "fire-and-forget"}`);

  for (let i = 0; i < clients; i += 1) {
    createClient(i);
  }

  const watchStart = performance.now();
  const checkFinish = () => {
    const allDone = clientsState.every(
      (state) => state && state.received === messagesPerClient,
    );
    if (allDone) {
      const totalSeconds = (performance.now() - watchStart) / 1000;
      const avgLatency =
        stats.received > 0 ? stats.totalLatency / stats.received : 0;

      console.log("\nWebSocket benchmark results");
      console.log(`connected: ${stats.connected}`);
      console.log(`failedConnections: ${stats.failedConnections}`);
      console.log(`sent: ${stats.sent}`);
      console.log(`received: ${stats.received}`);
      console.log(`errors: ${stats.errors}`);
      console.log(
        `throughput: ${(stats.received / totalSeconds).toFixed(2)} msg/sec`,
      );
      console.log(`avg latency: ${avgLatency.toFixed(2)} ms`);
      console.log(`min latency: ${stats.minLatency.toFixed(2)} ms`);
      console.log(`max latency: ${stats.maxLatency.toFixed(2)} ms`);
      process.exit(0);
    }
    setTimeout(checkFinish, 200);
  };

  checkFinish();
})();
