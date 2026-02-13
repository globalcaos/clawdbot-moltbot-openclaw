import type { AgentToolResult } from "@mariozechner/pi-agent-core";
import type { OpenClawConfig } from "../../config/config.js";
import { sendReactionWhatsApp } from "../../web/outbound.js";
import { createActionGate, jsonResult, readReactionParams, readStringParam } from "./common.js";

export async function handleWhatsAppAction(
  params: Record<string, unknown>,
  cfg: OpenClawConfig,
): Promise<AgentToolResult<unknown>> {
  const action = readStringParam(params, "action", { required: true });
  const isActionEnabled = createActionGate(cfg.channels?.whatsapp?.actions);

  if (action === "react") {
    if (!isActionEnabled("reactions")) {
      throw new Error("WhatsApp reactions are disabled.");
    }
    const chatJid = readStringParam(params, "chatJid", { required: true });
    const messageId = readStringParam(params, "messageId", { required: true });
    const { emoji, remove, isEmpty } = readReactionParams(params, {
      removeErrorMessage: "Emoji is required to remove a WhatsApp reaction.",
    });
    const participant = readStringParam(params, "participant");
    const accountId = readStringParam(params, "accountId");
    const fromMeRaw = params.fromMe;
    const fromMe = typeof fromMeRaw === "boolean" ? fromMeRaw : undefined;
    const resolvedEmoji = remove ? "" : emoji;
    await sendReactionWhatsApp(chatJid, messageId, resolvedEmoji, {
      verbose: false,
      fromMe,
      participant: participant ?? undefined,
      accountId: accountId ?? undefined,
    });
    if (!remove && !isEmpty) {
      return jsonResult({ ok: true, added: emoji });
    }
    return jsonResult({ ok: true, removed: true });
  }

  if (action === "fetchHistory") {
    const chatJid = readStringParam(params, "chatJid") || readStringParam(params, "target");
    if (!chatJid) {
      throw new Error("chatJid or target is required for fetchHistory action");
    }
    const count = typeof params.count === "number" ? params.count : 50;
    const oldestMsgId = readStringParam(params, "oldestMsgId");
    const oldestMsgFromMe = params.oldestMsgFromMe === true;
    const oldestMsgTimestamp =
      typeof params.oldestMsgTimestamp === "number" ? params.oldestMsgTimestamp : undefined;
    const accountId = readStringParam(params, "accountId");

    const { requireActiveWebListener } = await import("../../web/active-listener.js");
    const { listener } = requireActiveWebListener(accountId);
    if (!listener.fetchMessageHistory) {
      throw new Error("fetchMessageHistory not available on current listener");
    }
    const result = await listener.fetchMessageHistory(
      chatJid,
      count,
      oldestMsgId,
      oldestMsgFromMe,
      oldestMsgTimestamp,
    );
    return jsonResult(result);
  }

  throw new Error(`Unsupported WhatsApp action: ${action}`);
}
