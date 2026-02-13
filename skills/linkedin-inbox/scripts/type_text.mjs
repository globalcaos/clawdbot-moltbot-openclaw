#!/usr/bin/env node
/**
 * Type text with human-like keystroke timing using ghost-cursor.
 * Usage: node type_text.mjs <text> [--selector=<css>] [--ws-endpoint=ws://...]
 */

import { createCursor } from "ghost-cursor-playwright";
import { chromium } from "playwright";
import { humanDelay, humanType, detectSecurityCheck, connectToLinkedIn } from "./utils.mjs";

const args = process.argv.slice(2);
const text = args.find((a) => !a.startsWith("--"));
const selector = args
  .find((a) => a.startsWith("--selector="))
  ?.split("=")
  .slice(1)
  .join("=");
const wsEndpoint = args.find((a) => a.startsWith("--ws-endpoint="))?.split("=")[1];

if (!text) {
  console.error(
    'Usage: node type_text.mjs "text to type" [--selector=<css>] [--ws-endpoint=ws://...]',
  );
  process.exit(1);
}

async function main() {
  const { page } = await connectToLinkedIn(chromium, wsEndpoint);

  try {
    if (await detectSecurityCheck(page)) {
      console.error("🚨 SECURITY CHECK — aborting.");
      process.exit(2);
    }

    if (selector) {
      const cursor = createCursor(page);
      await page.waitForSelector(selector, { timeout: 10000 });
      await humanDelay(600, 200);
      await cursor.click(selector, { paddingPercentage: 10 });
      await humanDelay(400, 150);
    }

    await humanType(page, text);
    console.log(`✅ Typed ${text.length} characters`);
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  }
}

main();
