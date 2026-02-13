import type { OpenClawPluginApi } from "openclaw/plugin-sdk";

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
        const wa = api.runtime.channel.whatsapp as Record<string, unknown>;
        const getActiveWebListener = wa.getActiveWebListener as (
          accountId?: string | null,
        ) => unknown | null;
        const listener = getActiveWebListener() as Record<string, unknown> | null;

        if (!listener) {
          res.writeHead(503, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "No active WhatsApp listener" }));
          return;
        }

        const fetchFn = listener.fetchMessageHistory as (
          chatJid: string,
          count: number,
          oldestMsgId?: string,
          oldestMsgFromMe?: boolean,
          oldestMsgTimestamp?: number,
        ) => Promise<{ ok: boolean; requestId?: string; error?: string }> | undefined;

        if (!fetchFn) {
          res.writeHead(501, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "fetchMessageHistory not available on listener" }));
          return;
        }

        const result = await fetchFn(
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
