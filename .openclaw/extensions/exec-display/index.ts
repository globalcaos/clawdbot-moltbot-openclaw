/**
 * Exec Display Enforcer Plugin
 * 
 * Classifies commands using hardcoded patterns from command-patterns.json.
 * Unknown commands are left to AI classification (defaults to MEDIUM).
 * CRITICAL commands are blocked. HIGH commands are warned.
 */

import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const patternsPath = join(__dirname, "command-patterns.json");

type SecurityLevel = "safe" | "low" | "medium" | "high" | "critical";
type LevelConfig = { emoji: string; label: string; description: string; action: string };

interface CommandPatternsDB {
  version: number;
  levels: Record<SecurityLevel, LevelConfig>;
  commands: Record<SecurityLevel, string[]>;
  defaultLevel: SecurityLevel;
}

let db: CommandPatternsDB;

try {
  db = JSON.parse(readFileSync(patternsPath, "utf-8")) as CommandPatternsDB;
} catch (err) {
  console.error(`[exec-display] Failed to load patterns: ${err}`);
  db = {
    version: 0,
    levels: {
      safe: { emoji: "🟢", label: "SAFE", description: "Read-only", action: "allow" },
      low: { emoji: "🔵", label: "LOW", description: "File mod", action: "allow" },
      medium: { emoji: "🟡", label: "MEDIUM", description: "Config change", action: "allow" },
      high: { emoji: "🟠", label: "HIGH", description: "System-level", action: "warn" },
      critical: { emoji: "🔴", label: "CRITICAL", description: "Data loss risk", action: "block" },
    },
    commands: { critical: ["sudo", "rm -rf"], high: [], medium: [], low: [], safe: ["ls", "cat"] },
    defaultLevel: "medium",
  };
}

// Build lookup - check levels in order of severity
const levelOrder: SecurityLevel[] = ["critical", "high", "medium", "low", "safe"];

/**
 * Classify a command using substring matching against the database.
 * Returns { level, isHardcoded, matchedPattern }
 */
function classifyCommand(cmd: string): { level: SecurityLevel; isHardcoded: boolean; matchedPattern?: string } {
  const lower = cmd.toLowerCase().trim();
  
  // Check each level in order (critical first)
  for (const level of levelOrder) {
    const patterns = db.commands[level] || [];
    for (const pattern of patterns) {
      if (lower.includes(pattern.toLowerCase())) {
        return { level, isHardcoded: true, matchedPattern: pattern };
      }
    }
  }
  
  // Not found in database - AI must classify (default to medium)
  return { level: db.defaultLevel, isHardcoded: false };
}

function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max - 3) + "...";
}

const plugin = {
  id: "exec-display",
  name: "Exec Display Enforcer",
  description: "Classifies and enforces command security levels from patterns database.",
  configSchema: {
    type: "object" as const,
    additionalProperties: false,
    properties: {
      enabled: { type: "boolean" as const },
      blockCritical: { type: "boolean" as const },
      warnHigh: { type: "boolean" as const },
    },
  },

  register(api: OpenClawPluginApi): void {
    const cfg = (api.pluginConfig as { enabled?: boolean; blockCritical?: boolean; warnHigh?: boolean }) ?? {};
    if (cfg.enabled === false) return;

    const blockCritical = cfg.blockCritical !== false;
    const warnHigh = cfg.warnHigh !== false;

    const totalPatterns = levelOrder.reduce((sum, l) => sum + (db.commands[l]?.length || 0), 0);
    api.logger.info(`[exec-display] ✓ Loaded ${totalPatterns} command patterns (v${db.version})`);
    api.logger.info(`[exec-display] Enforcement: ${blockCritical ? "🔴 CRITICAL=block" : ""} ${warnHigh ? "🟠 HIGH=warn" : ""}`);

    api.on("before_tool_call", (event) => {
      if (event.toolName !== "exec") return undefined;

      const command = (event.params as Record<string, unknown>)?.command as string;
      if (!command) return undefined;

      const { level, isHardcoded, matchedPattern } = classifyCommand(command);
      const levelCfg = db.levels[level];
      
      const source = isHardcoded ? `[DB: ${matchedPattern}]` : "[AI]";
      api.logger.info(`[exec-display] ${levelCfg.emoji} ${level.toUpperCase()} ${source}: ${truncate(command, 50)}`);

      // Block CRITICAL
      if (level === "critical" && blockCritical) {
        const msg = `${levelCfg.emoji} BLOCKED: Command contains "${matchedPattern}" which is ${level.toUpperCase()}. Run manually if needed.`;
        api.logger.warn(`[exec-display] ${msg}`);
        return { block: true, blockReason: msg };
      }

      // Warn on HIGH
      if (level === "high" && warnHigh) {
        api.logger.warn(`[exec-display] ⚠️ HIGH-risk command: ${levelCfg.description}`);
      }

      return undefined;
    });

    return;
  },
};

export default plugin;
