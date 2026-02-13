#!/usr/bin/env node
/**
 * Send a LinkedIn message with human-like behavior via ghost-cursor.
 * Usage: node send_message.mjs "Person Name" "Message text" [--ws-endpoint=ws://...]
 *
 * Includes:
 * - Bézier curve mouse movements (ghost-cursor)
 * - Variable keystroke timing with occasional typos
 * - Gaussian random delays between actions
 * - Security check detection and abort
 */

import { createCursor } from "ghost-cursor-playwright";
import { chromium } from "playwright";
import { humanDelay, humanType, detectSecurityCheck, connectToLinkedIn } from "./utils.mjs";

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith("--"));
const personName = positional[0];
const messageText = positional[1];
const wsEndpoint = args.find((a) => a.startsWith("--ws-endpoint="))?.split("=")[1];
const dryRun = args.includes("--dry-run");

if (!personName || !messageText) {
  console.error(
    'Usage: node send_message.mjs "Person Name" "Message text" [--ws-endpoint=ws://...] [--dry-run]',
  );
  process.exit(1);
}

async function main() {
  const { browser, page } = await connectToLinkedIn(chromium, wsEndpoint);
  const cursor = createCursor(page);

  try {
    // Security check before starting
    if (await detectSecurityCheck(page)) {
      console.error("🚨 SECURITY CHECK DETECTED — aborting. Solve manually.");
      process.exit(2);
    }

    // Navigate to messaging if not already there
    if (!page.url().includes("linkedin.com/messaging")) {
      await page.goto("https://www.linkedin.com/messaging/", { waitUntil: "domcontentloaded" });
      await humanDelay(3000, 800);

      if (await detectSecurityCheck(page)) {
        console.error("🚨 SECURITY CHECK after navigation — aborting.");
        process.exit(2);
      }
    }

    // Search for conversation
    console.log(`🔍 Searching for: ${personName}`);
    const searchSelector =
      'input.msg-search-form__search-field, input[placeholder*="Search messages"]';
    await page.waitForSelector(searchSelector, { timeout: 10000 });
    await humanDelay(1500, 500);
    await cursor.click(searchSelector, { paddingPercentage: 10 });
    await humanDelay(500, 200);

    // Clear existing search and type name with human timing
    await page.keyboard.press("Control+a");
    await humanDelay(200, 100);
    await humanType(page, personName, { typoRate: 0.02 }); // lower typo rate for search
    await humanDelay(1500, 500); // wait for search results

    // Click first matching result
    const resultSelector = '.msg-search-pill, .msg-conversation-listitem, [role="listitem"]';
    try {
      await page.waitForSelector(resultSelector, { timeout: 5000 });
      await humanDelay(800, 300);
      await cursor.click(resultSelector, { paddingPercentage: 15 });
    } catch {
      await page.keyboard.press("Enter");
      await humanDelay(2000, 500);
      const convSelector = '.msg-conversation-listitem:first-child, [role="listitem"]:first-child';
      await page.waitForSelector(convSelector, { timeout: 5000 });
      await cursor.click(convSelector, { paddingPercentage: 15 });
    }
    await humanDelay(2000, 600);

    // Security check after navigating to conversation
    if (await detectSecurityCheck(page)) {
      console.error("🚨 SECURITY CHECK in conversation — aborting.");
      process.exit(2);
    }

    if (dryRun) {
      console.log(`🏁 DRY RUN — would send to ${personName}: "${messageText}"`);
      return;
    }

    // Find and click message input
    console.log(`💬 Typing message (${messageText.length} chars)...`);
    const msgInputSelector =
      '.msg-form__contenteditable, [role="textbox"][aria-label*="message"], div.msg-form__msg-content-container div[contenteditable="true"]';
    await page.waitForSelector(msgInputSelector, { timeout: 10000 });
    await humanDelay(800, 300);
    await cursor.click(msgInputSelector, { paddingPercentage: 10 });
    await humanDelay(500, 200);

    // Type the message with human-like delays and occasional typos
    await humanType(page, messageText, { typoRate: 0.03 });

    // Brief pause before sending (human reviewing what they typed)
    await humanDelay(1500, 500);

    // Send with Enter
    console.log(`📤 Sending...`);
    await page.keyboard.press("Enter");
    await humanDelay(1000, 300);

    // Verify no security check after sending
    if (await detectSecurityCheck(page)) {
      console.error("🚨 SECURITY CHECK after send — message may not have sent. Check manually.");
      process.exit(2);
    }

    console.log(`✅ Message sent to ${personName}`);
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  }
}

main();
