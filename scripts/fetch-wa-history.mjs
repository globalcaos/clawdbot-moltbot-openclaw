#!/usr/bin/env node
/**
 * Fetch WhatsApp message history by calling the gateway's tools-invoke HTTP API.
 * This bypasses the LLM tool schema validation.
 */

import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const GATEWAY_PORT = 18789;

// Read gateway token from config
const configPath = path.join(process.env.HOME, ".openclaw", "openclaw.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const token = config.gateway?.auth?.token;

if (!token) {
  console.error("No gateway token found in config");
  process.exit(1);
}

const chatJid = process.argv[2] || "14084975095@s.whatsapp.net";
const count = parseInt(process.argv[3] || "50", 10);

const body = JSON.stringify({
  tool: "message",
  action: "fetchHistory",
  args: {
    action: "fetchHistory",
    target: chatJid,
    channel: "whatsapp",
    count,
  },
});

const options = {
  hostname: "127.0.0.1",
  port: GATEWAY_PORT,
  path: "/tools/invoke",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "Content-Length": Buffer.byteLength(body),
  },
};

const req = http.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch {
      console.log(data);
    }
  });
});

req.on("error", (e) => {
  console.error("Request failed:", e.message);
});

req.write(body);
req.end();
