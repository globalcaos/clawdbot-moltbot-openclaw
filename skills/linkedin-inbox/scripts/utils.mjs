/**
 * Shared utilities for LinkedIn automation scripts.
 * Human-like timing, random delays, and security check detection.
 */

/**
 * Gaussian random number (Box-Muller transform).
 * Returns a value centered around mean with given stddev.
 */
export function gaussianRandom(mean, stddev) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.max(0, mean + z * stddev);
}

/**
 * Human-like delay between actions.
 * Uses Gaussian distribution for natural variance.
 * @param {number} meanMs - Mean delay in milliseconds
 * @param {number} stddevMs - Standard deviation in ms
 */
export async function humanDelay(meanMs = 2500, stddevMs = 800) {
  const delay = gaussianRandom(meanMs, stddevMs);
  const clamped = Math.max(meanMs * 0.3, Math.min(delay, meanMs * 3)); // clamp to reasonable range
  await new Promise((r) => setTimeout(r, clamped));
}

/**
 * Delay between keystrokes — variable, not uniform.
 * Occasional longer pauses (simulating thinking).
 */
export async function keystrokeDelay() {
  // 10% chance of a longer "thinking" pause
  if (Math.random() < 0.1) {
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 500));
  } else {
    await new Promise((r) => setTimeout(r, 30 + Math.random() * 90));
  }
}

/**
 * Type text with human-like keystroke timing.
 * Includes occasional typo simulation (backspace + retype) at ~3% rate.
 */
export async function humanType(page, text, { typoRate = 0.03 } = {}) {
  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // Occasional simulated typo (wrong key then backspace)
    if (typoRate > 0 && Math.random() < typoRate && char.match(/[a-z]/i)) {
      const wrongChar = String.fromCharCode(char.charCodeAt(0) + (Math.random() < 0.5 ? 1 : -1));
      await page.keyboard.type(wrongChar, { delay: 0 });
      await keystrokeDelay();
      await page.keyboard.press("Backspace");
      await new Promise((r) => setTimeout(r, 50 + Math.random() * 150));
    }

    await page.keyboard.type(char, { delay: 0 });
    await keystrokeDelay();
  }
}

/**
 * Check if current page shows a security challenge.
 * @returns {boolean} true if security check detected
 */
export async function detectSecurityCheck(page) {
  try {
    const text = await page.evaluate(() => document.body?.innerText?.substring(0, 5000) || "");
    const lower = text.toLowerCase();
    const triggers = [
      "security check",
      "security verification",
      "verify your identity",
      "unusual activity",
      "restricted",
      "captcha",
      "prove you're not a robot",
      "confirm your identity",
      "account has been restricted",
    ];
    return triggers.some((t) => lower.includes(t));
  } catch {
    return false;
  }
}

/**
 * Connect to browser via CDP.
 * Tries common endpoints, returns { browser, page } or throws.
 */
export async function connectToLinkedIn(chromium, wsEndpoint) {
  let browser;
  if (wsEndpoint) {
    browser = await chromium.connectOverCDP(wsEndpoint);
  } else {
    for (const ep of ["http://127.0.0.1:9222", "http://localhost:9222"]) {
      try {
        browser = await chromium.connectOverCDP(ep);
        break;
      } catch {
        /* next */
      }
    }
  }
  if (!browser)
    throw new Error("Could not connect to browser. Ensure CDP is available on port 9222.");

  const context = browser.contexts()[0];
  if (!context) throw new Error("No browser context found.");

  const pages = context.pages();
  const page = pages.find((p) => p.url().includes("linkedin.com")) || pages[0];
  if (!page) throw new Error("No page found.");

  return { browser, page, context };
}

/**
 * Random integer between min and max (inclusive).
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
