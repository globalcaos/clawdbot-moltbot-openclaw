import { loadConfig } from "../../config/config.js";
import { logVerbose } from "../../globals.js";
import { buildPairingReply } from "../../pairing/pairing-messages.js";
import {
  readChannelAllowFromStore,
  upsertChannelPairingRequest,
} from "../../pairing/pairing-store.js";
import { isSelfChatMode, normalizeE164 } from "../../utils.js";
import { resolveWhatsAppAccount } from "../accounts.js";

export type InboundAccessControlResult = {
  allowed: boolean;
  shouldMarkRead: boolean;
  isSelfChat: boolean;
  resolvedAccountId: string;
  /** Whether the triggerPrefix was stripped from the message body. */
  prefixStripped: boolean;
  /** The message body with the triggerPrefix removed (only set when prefixStripped is true). */
  strippedBody?: string;
};

const PAIRING_REPLY_HISTORY_GRACE_MS = 30_000;

/**
 * Check if a chat is in the allowChats list and, if so, whether the message
 * passes the triggerPrefix gate. Returns `null` if the chat is not in allowChats.
 */
export function checkAllowChats(opts: {
  allowChats: string[] | undefined;
  chatJid: string;
  triggerPrefix: string | undefined;
  messageBody: string | undefined;
}): { allowed: boolean; prefixStripped: boolean; strippedBody?: string } | null {
  if (!opts.allowChats || opts.allowChats.length === 0) {
    return null;
  }
  if (!opts.allowChats.includes(opts.chatJid)) {
    return null;
  }
  // Chat is in allowChats. Check triggerPrefix gate.
  if (!opts.triggerPrefix) {
    // No prefix configured — chat allowlist alone is sufficient.
    return { allowed: true, prefixStripped: false };
  }
  const body = opts.messageBody ?? "";
  const prefixLower = opts.triggerPrefix.toLowerCase();
  const bodyLower = body.toLowerCase();
  // Match prefix followed by end-of-string or whitespace.
  if (bodyLower === prefixLower) {
    return { allowed: true, prefixStripped: true, strippedBody: "" };
  }
  if (bodyLower.startsWith(`${prefixLower} `)) {
    const stripped = body.slice(opts.triggerPrefix.length).trimStart();
    return { allowed: true, prefixStripped: true, strippedBody: stripped };
  }
  // Message doesn't start with prefix — blocked.
  logVerbose(
    `Blocked allowChats message from ${opts.chatJid} (missing triggerPrefix "${opts.triggerPrefix}")`,
  );
  return { allowed: false, prefixStripped: false };
}

export async function checkInboundAccessControl(params: {
  accountId: string;
  from: string;
  selfE164: string | null;
  senderE164: string | null;
  group: boolean;
  pushName?: string;
  isFromMe: boolean;
  messageTimestampMs?: number;
  connectedAtMs?: number;
  pairingGraceMs?: number;
  sock: {
    sendMessage: (jid: string, content: { text: string }) => Promise<unknown>;
  };
  remoteJid: string;
  /** Raw message body text for triggerPrefix checking. */
  messageBody?: string;
}): Promise<InboundAccessControlResult> {
  const cfg = loadConfig();
  const account = resolveWhatsAppAccount({
    cfg,
    accountId: params.accountId,
  });
  const dmPolicy = cfg.channels?.whatsapp?.dmPolicy ?? "pairing";
  const configuredAllowFrom = account.allowFrom;
  const storeAllowFrom = await readChannelAllowFromStore("whatsapp").catch(() => []);
  // Without user config, default to self-only DM access so the owner can talk to themselves.
  const combinedAllowFrom = Array.from(
    new Set([...(configuredAllowFrom ?? []), ...storeAllowFrom]),
  );
  const defaultAllowFrom =
    combinedAllowFrom.length === 0 && params.selfE164 ? [params.selfE164] : undefined;
  const allowFrom = combinedAllowFrom.length > 0 ? combinedAllowFrom : defaultAllowFrom;
  const groupAllowFrom =
    account.groupAllowFrom ??
    (configuredAllowFrom && configuredAllowFrom.length > 0 ? configuredAllowFrom : undefined);
  const isSamePhone = params.from === params.selfE164;
  const isSelfChat = isSelfChatMode(params.selfE164, configuredAllowFrom);
  const pairingGraceMs =
    typeof params.pairingGraceMs === "number" && params.pairingGraceMs > 0
      ? params.pairingGraceMs
      : PAIRING_REPLY_HISTORY_GRACE_MS;
  const suppressPairingReply =
    typeof params.connectedAtMs === "number" &&
    typeof params.messageTimestampMs === "number" &&
    params.messageTimestampMs < params.connectedAtMs - pairingGraceMs;

  // Pre-compute normalized allowlists for filtering.
  const dmHasWildcard = allowFrom?.includes("*") ?? false;
  const normalizedAllowFrom =
    allowFrom && allowFrom.length > 0
      ? allowFrom.filter((entry) => entry !== "*").map(normalizeE164)
      : [];
  const groupHasWildcard = groupAllowFrom?.includes("*") ?? false;
  const normalizedGroupAllowFrom =
    groupAllowFrom && groupAllowFrom.length > 0
      ? groupAllowFrom.filter((entry) => entry !== "*").map(normalizeE164)
      : [];

  const blocked = (extra?: Partial<InboundAccessControlResult>): InboundAccessControlResult => ({
    allowed: false,
    shouldMarkRead: false,
    isSelfChat,
    resolvedAccountId: account.accountId,
    prefixStripped: false,
    ...extra,
  });

  const allowed = (extra?: Partial<InboundAccessControlResult>): InboundAccessControlResult => ({
    allowed: true,
    shouldMarkRead: true,
    isSelfChat,
    resolvedAccountId: account.accountId,
    prefixStripped: false,
    ...extra,
  });

  // Resolve allowChats + triggerPrefix for Layer 2/3 checks.
  const allowChats = account.allowChats ?? cfg.channels?.whatsapp?.allowChats;
  const triggerPrefix = account.triggerPrefix ?? cfg.channels?.whatsapp?.triggerPrefix;

  // Helper: attempt allowChats fallback before blocking.
  const tryAllowChats = (): InboundAccessControlResult | null => {
    const result = checkAllowChats({
      allowChats,
      chatJid: params.remoteJid,
      triggerPrefix,
      messageBody: params.messageBody,
    });
    if (!result) {
      return null;
    }
    if (result.allowed) {
      return allowed({
        prefixStripped: result.prefixStripped,
        strippedBody: result.strippedBody,
      });
    }
    return blocked();
  };

  // Group policy filtering:
  // - "open": groups bypass allowFrom, only mention-gating applies
  // - "disabled": block all group messages entirely
  // - "allowlist": only allow group messages from senders in groupAllowFrom/allowFrom
  const defaultGroupPolicy = cfg.channels?.defaults?.groupPolicy;
  const groupPolicy = account.groupPolicy ?? defaultGroupPolicy ?? "open";
  if (params.group && groupPolicy === "disabled") {
    logVerbose("Blocked group message (groupPolicy: disabled)");
    return blocked();
  }
  if (params.group && groupPolicy === "allowlist") {
    if (!groupAllowFrom || groupAllowFrom.length === 0) {
      logVerbose("Blocked group message (groupPolicy: allowlist, no groupAllowFrom)");
      return blocked();
    }
    const senderAllowed =
      groupHasWildcard ||
      (params.senderE164 != null && normalizedGroupAllowFrom.includes(params.senderE164));
    if (!senderAllowed) {
      logVerbose(
        `Blocked group message from ${params.senderE164 ?? "unknown sender"} (groupPolicy: allowlist)`,
      );
      return blocked();
    }
    // Sender is authorized in group. If group is in allowChats with triggerPrefix,
    // apply the prefix gate even for authorized senders.
    if (allowChats?.includes(params.remoteJid)) {
      const chatResult = tryAllowChats();
      if (chatResult) {
        return chatResult;
      }
    }
  }

  // DM access control (secure defaults): "pairing" (default) / "allowlist" / "open" / "disabled".
  if (!params.group) {
    if (params.isFromMe && !isSamePhone) {
      // Owner's outbound message in someone else's DM chat.
      // Allow if chat is in allowChats and message has triggerPrefix — this lets the
      // owner trigger the agent from within another person's DM conversation.
      const chatResult = tryAllowChats();
      if (chatResult) {
        return chatResult;
      }
      logVerbose("Skipping outbound DM (fromMe); no pairing reply needed.");
      return blocked();
    }
    if (dmPolicy === "disabled") {
      logVerbose("Blocked dm (dmPolicy: disabled)");
      return blocked();
    }
    if (dmPolicy !== "open" && !isSamePhone) {
      const candidate = params.from;
      const senderAllowed =
        dmHasWildcard ||
        (normalizedAllowFrom.length > 0 && normalizedAllowFrom.includes(candidate));
      if (!senderAllowed) {
        // Sender not in allowFrom and not the owner — no allowChats fallback.
        // Only the owner (fromMe) can use allowChats to trigger from other chats.
        if (dmPolicy === "pairing") {
          if (suppressPairingReply) {
            logVerbose(`Skipping pairing reply for historical DM from ${candidate}.`);
          } else {
            const { code, created } = await upsertChannelPairingRequest({
              channel: "whatsapp",
              id: candidate,
              meta: { name: (params.pushName ?? "").trim() || undefined },
            });
            if (created) {
              logVerbose(
                `whatsapp pairing request sender=${candidate} name=${params.pushName ?? "unknown"}`,
              );
              try {
                await params.sock.sendMessage(params.remoteJid, {
                  text: buildPairingReply({
                    channel: "whatsapp",
                    idLine: `Your WhatsApp phone number: ${candidate}`,
                    code,
                  }),
                });
              } catch (err) {
                logVerbose(`whatsapp pairing reply failed for ${candidate}: ${String(err)}`);
              }
            }
          }
        } else {
          logVerbose(`Blocked unauthorized sender ${candidate} (dmPolicy=${dmPolicy})`);
        }
        return blocked();
      }
    }
  }

  return allowed();
}
