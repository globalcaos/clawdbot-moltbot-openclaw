import { describe, expect, it } from "vitest";
import { checkAllowChats } from "./access-control.js";

describe("checkAllowChats", () => {
  it("returns null when allowChats is empty/undefined", () => {
    expect(
      checkAllowChats({
        allowChats: undefined,
        chatJid: "x@s.whatsapp.net",
        triggerPrefix: undefined,
        messageBody: "hi",
      }),
    ).toBeNull();
    expect(
      checkAllowChats({
        allowChats: [],
        chatJid: "x@s.whatsapp.net",
        triggerPrefix: undefined,
        messageBody: "hi",
      }),
    ).toBeNull();
  });

  it("returns null when chat is not in allowChats", () => {
    expect(
      checkAllowChats({
        allowChats: ["other@s.whatsapp.net"],
        chatJid: "x@s.whatsapp.net",
        triggerPrefix: undefined,
        messageBody: "hi",
      }),
    ).toBeNull();
  });

  it("allows when chat is in allowChats and no triggerPrefix", () => {
    const result = checkAllowChats({
      allowChats: ["x@s.whatsapp.net"],
      chatJid: "x@s.whatsapp.net",
      triggerPrefix: undefined,
      messageBody: "hi",
    });
    expect(result).toEqual({ allowed: true, prefixStripped: false });
  });

  it("allows and strips prefix when message starts with triggerPrefix", () => {
    const result = checkAllowChats({
      allowChats: ["x@s.whatsapp.net"],
      chatJid: "x@s.whatsapp.net",
      triggerPrefix: "Jarvis",
      messageBody: "Jarvis what is the weather?",
    });
    expect(result).toEqual({
      allowed: true,
      prefixStripped: true,
      strippedBody: "what is the weather?",
    });
  });

  it("allows when message is exactly the prefix", () => {
    const result = checkAllowChats({
      allowChats: ["x@s.whatsapp.net"],
      chatJid: "x@s.whatsapp.net",
      triggerPrefix: "Jarvis",
      messageBody: "Jarvis",
    });
    expect(result).toEqual({ allowed: true, prefixStripped: true, strippedBody: "" });
  });

  it("case-insensitive prefix matching", () => {
    const result = checkAllowChats({
      allowChats: ["x@s.whatsapp.net"],
      chatJid: "x@s.whatsapp.net",
      triggerPrefix: "Jarvis",
      messageBody: "jarvis hello",
    });
    expect(result).toEqual({ allowed: true, prefixStripped: true, strippedBody: "hello" });
  });

  it("blocks when message does not start with triggerPrefix", () => {
    const result = checkAllowChats({
      allowChats: ["x@s.whatsapp.net"],
      chatJid: "x@s.whatsapp.net",
      triggerPrefix: "Jarvis",
      messageBody: "hello there",
    });
    expect(result).toEqual({ allowed: false, prefixStripped: false });
  });

  it("blocks when no message body and triggerPrefix is set", () => {
    const result = checkAllowChats({
      allowChats: ["x@s.whatsapp.net"],
      chatJid: "x@s.whatsapp.net",
      triggerPrefix: "Jarvis",
      messageBody: undefined,
    });
    expect(result).toEqual({ allowed: false, prefixStripped: false });
  });

  it("works with group JIDs in allowChats", () => {
    const result = checkAllowChats({
      allowChats: ["120363409030785922@g.us"],
      chatJid: "120363409030785922@g.us",
      triggerPrefix: "Bot",
      messageBody: "Bot do something",
    });
    expect(result).toEqual({ allowed: true, prefixStripped: true, strippedBody: "do something" });
  });
});
