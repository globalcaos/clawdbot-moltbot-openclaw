#!/usr/bin/env node
/**
 * Open a specific LinkedIn conversation with human-like behavior.
 * Usage: node open_conversation.mjs "Person Name" [--ws-endpoint=ws://...]
 */

import { mkdirSync } from "fs";
import { createCursor } from "ghost-cursor-playwright";
import { chromium } from "playwright";
import { humanDelay, humanType, detectSecurityCheck, connectToLinkedIn } from "./utils.mjs";

const args = process.argv.slice(2);
const personName = args.find((a) => !a.startsWith("--"));
const wsEndpoint = args.find((a) => a.startsWith("--ws-endpoint="))?.split("=")[1];

if (!personName) {
  console.error('Usage: node open_conversation.mjs "Person Name" [--ws-endpoint=ws://...]');
  process.exit(1);
}

async function main() {
  const { page } = await connectToLinkedIn(chromium, wsEndpoint);

  try {
    if (await detectSecurityCheck(page)) {
      console.error("🚨 SECURITY CHECK — aborting.");
      process.exit(2);
    }

    // Navigate to messaging with search term
    const searchUrl = `https://www.linkedin.com/messaging/?searchTerm=${encodeURIComponent(personName)}`;
    await page.goto(searchUrl, { waitUntil: "domcontentloaded" });
    await humanDelay(3500, 800);

    if (await detectSecurityCheck(page)) {
      console.error("🚨 SECURITY CHECK after navigation — aborting.");
      process.exit(2);
    }

    // Click first conversation result
    const cursor = createCursor(page);
    const convSelector = '.msg-conversation-listitem:first-child, [role="listitem"]:first-child';
    try {
      await page.waitForSelector(convSelector, { timeout: 8000 });
      await humanDelay(1000, 400);
      await cursor.click(convSelector, { paddingPercentage: 15 });
      await humanDelay(2000, 600);
    } catch {
      console.log("⚠️ No conversation found for:", personName);
    }

    // Screenshot
    mkdirSync("/tmp/linkedin-inbox", { recursive: true });
    const screenshotPath = `/tmp/linkedin-inbox/conversation_${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath });

    console.log(`✅ Conversation opened: ${personName}`);
    console.log(`📸 Screenshot: ${screenshotPath}`);
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  }
}

main();
