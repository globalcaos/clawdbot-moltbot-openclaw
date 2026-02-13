#!/usr/bin/env node
/**
 * Scan LinkedIn inbox with human-like scrolling and security check detection.
 * Usage: node scan_inbox.mjs [--ws-endpoint=ws://...] [--output=/tmp/linkedin-inbox]
 */

import { writeFileSync, mkdirSync } from "fs";
import { createCursor } from "ghost-cursor-playwright";
import { join } from "path";
import { chromium } from "playwright";
import { humanDelay, detectSecurityCheck, connectToLinkedIn, randomInt } from "./utils.mjs";

const args = process.argv.slice(2);
const wsEndpoint = args.find((a) => a.startsWith("--ws-endpoint="))?.split("=")[1];
const outputDir =
  args.find((a) => a.startsWith("--output="))?.split("=")[1] || "/tmp/linkedin-inbox";

async function main() {
  const { browser, page } = await connectToLinkedIn(chromium, wsEndpoint);

  try {
    mkdirSync(outputDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    // Security check
    if (await detectSecurityCheck(page)) {
      console.error("🚨 SECURITY CHECK DETECTED — aborting scan.");
      process.exit(2);
    }

    // Navigate to messaging if needed
    if (!page.url().includes("linkedin.com/messaging")) {
      await page.goto("https://www.linkedin.com/messaging/", { waitUntil: "domcontentloaded" });
      await humanDelay(3500, 1000);

      if (await detectSecurityCheck(page)) {
        console.error("🚨 SECURITY CHECK after navigation — aborting.");
        process.exit(2);
      }
    }

    const cursor = createCursor(page);

    // Human-like scroll to load more conversations
    const listSelector = '.msg-conversations-container__conversations-list, [role="list"]';
    try {
      await page.waitForSelector(listSelector, { timeout: 10000 });
      await cursor.move(listSelector);

      // Variable number of scrolls (2-4)
      const scrollCount = randomInt(2, 4);
      for (let i = 0; i < scrollCount; i++) {
        const scrollAmount = randomInt(250, 450);
        await page.mouse.wheel(0, scrollAmount);
        await humanDelay(1200, 400);
      }
      // Scroll back to top
      await page.mouse.wheel(0, -3000);
      await humanDelay(800, 300);
    } catch {
      console.log("⚠️ Could not find conversation list, proceeding with screenshot.");
    }

    // Take screenshot
    const screenshotPath = join(outputDir, `inbox_${timestamp}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });

    // Extract conversation data from DOM
    const conversations = await page.evaluate(() => {
      const items = document.querySelectorAll(
        '.msg-conversation-listitem, .msg-conversations-container__pillar [role="listitem"]',
      );
      return Array.from(items)
        .slice(0, 25)
        .map((item) => {
          const name = item
            .querySelector(
              ".msg-conversation-listitem__participant-names, .msg-conversation-card__participant-names",
            )
            ?.textContent?.trim();
          const preview = item
            .querySelector(
              ".msg-conversation-card__message-snippet, .msg-conversation-listitem__message-snippet",
            )
            ?.textContent?.trim();
          const time = item
            .querySelector(
              ".msg-conversation-card__time-stamp, .msg-conversation-listitem__time-stamp, time",
            )
            ?.textContent?.trim();
          const unread =
            item.classList.contains("msg-conversation-card--unread") ||
            item.querySelector(".msg-conversation-card--unread, .notification-badge") !== null;
          return { name, preview, time, unread };
        })
        .filter((c) => c.name);
    });

    // Save data
    const dataPath = join(outputDir, `inbox_${timestamp}.json`);
    writeFileSync(
      dataPath,
      JSON.stringify({ timestamp: new Date().toISOString(), conversations }, null, 2),
    );

    console.log(`✅ Inbox scanned: ${conversations.length} conversations`);
    console.log(`📸 Screenshot: ${screenshotPath}`);
    console.log(`📋 Data: ${dataPath}`);

    const unread = conversations.filter((c) => c.unread);
    if (unread.length > 0) {
      console.log(`\n📩 ${unread.length} unread:`);
      unread.forEach((c) => console.log(`  • ${c.name}: ${c.preview?.slice(0, 60)}...`));
    } else {
      console.log("\n✅ No unread messages.");
    }
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  }
}

main();
