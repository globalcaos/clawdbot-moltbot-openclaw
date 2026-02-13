#!/usr/bin/env node
/**
 * Click an element using ghost-cursor for human-like mouse movement.
 * Usage: node click_element.mjs <css-selector> [--ws-endpoint=ws://...]
 */

import { createCursor } from "ghost-cursor-playwright";
import { chromium } from "playwright";
import { humanDelay, detectSecurityCheck, connectToLinkedIn } from "./utils.mjs";

const args = process.argv.slice(2);
const selector = args.find((a) => !a.startsWith("--"));
const wsEndpoint = args.find((a) => a.startsWith("--ws-endpoint="))?.split("=")[1];

if (!selector) {
  console.error("Usage: node click_element.mjs <css-selector> [--ws-endpoint=ws://...]");
  process.exit(1);
}

async function main() {
  const { page } = await connectToLinkedIn(chromium, wsEndpoint);

  try {
    if (await detectSecurityCheck(page)) {
      console.error("🚨 SECURITY CHECK — aborting.");
      process.exit(2);
    }

    await page.waitForSelector(selector, { timeout: 10000 });
    await humanDelay(800, 300);

    const cursor = createCursor(page);
    await cursor.click(selector, {
      paddingPercentage: 10,
      waitForClick: 100 + Math.random() * 200,
    });

    await humanDelay(500, 200);
    console.log(`✅ Clicked: ${selector}`);
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  }
}

main();
