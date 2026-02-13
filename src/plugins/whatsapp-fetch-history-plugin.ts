/**
 * WhatsApp Fetch History Plugin
 * Exposes /api/whatsapp/fetch-history HTTP endpoint
 * that calls Baileys' fetchMessageHistory on the active socket.
 */
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";

export const id = "whatsapp-fetch-history";
export const name = "WhatsApp Fetch History";
export const description = "HTTP endpoint to fetch older WhatsApp messages";
export const version = "1.0.0";
export const kind = "utility";

export const configSchema = {
  type: "object",
  properties: {},
  additionalProperties: false,
};

export function register(api: OpenClawPluginApi) {
  api.registerHttpRoute({
    path: "/api/whatsapp/fetch-history",
    handler: async (req, res) => {
      if (req.method !== "POST") {
        res.writeHead(405, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      let body = "";
      for await (const chunk of req) {
        body += chunk;
      }

      let params: {
        chatJid: string;
        count?: number;
        oldestMsgId?: string;
        oldestMsgFromMe?: boolean;
        oldestMsgTimestamp?: number;
      };

      try {
        params = JSON.parse(body);
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }

      if (!params.chatJid) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "chatJid is required" }));
        return;
      }

      try {
        const { getActiveWebListener } = api.runtime.channel.whatsapp;
        const listener = getActiveWebListener();
        if (!listener) {
          res.writeHead(503, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "No active WhatsApp listener" }));
          return;
        }

        if (!listener.fetchMessageHistory) {
          res.writeHead(501, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "fetchMessageHistory not available on listener" }));
          return;
        }

        const result = await listener.fetchMessageHistory(
          params.chatJid,
          params.count ?? 50,
          params.oldestMsgId,
          params.oldestMsgFromMe ?? false,
          params.oldestMsgTimestamp,
        );

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: String(err) }));
      }
    },
  });

  api.logger.info(
    "[whatsapp-fetch-history] HTTP endpoint registered at /api/whatsapp/fetch-history",
  );
}
