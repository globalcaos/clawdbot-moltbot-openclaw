#!/usr/bin/env node
/**
 * Fetch all WhatsApp contacts from groups using Baileys
 * Uses existing OpenClaw credentials
 */

import {
  makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "node:fs";

const AUTH_DIR = process.env.WA_AUTH_DIR || `${process.env.HOME}/.openclaw/credentials/whatsapp/default`;
const OUTPUT_PATH = `${process.env.HOME}/.openclaw/workspace/bank/whatsapp-contacts-full.json`;

async function main() {
  console.log("🔌 Connecting to WhatsApp...");
  
  const logger = pino({ level: "silent" });
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();
  
  const sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    version,
    logger,
    printQRInTerminal: false,
    browser: ["OpenClaw Contact Sync", "Chrome", "1.0.0"],
    markOnlineOnConnect: false,
  });

  // Wait for connection
  await new Promise((resolve, reject) => {
    sock.ev.on("connection.update", (update) => {
      if (update.connection === "open") {
        resolve();
      }
      if (update.connection === "close") {
        reject(new Error("Connection closed"));
      }
    });
    // Timeout after 30 seconds
    setTimeout(() => reject(new Error("Connection timeout")), 30000);
  });

  console.log("✅ Connected! Fetching all groups...");

  try {
    // Fetch ALL groups the user participates in
    const groups = await sock.groupFetchAllParticipating();
    
    const contacts = {};
    const groupList = [];
    
    console.log(`📊 Found ${Object.keys(groups).length} groups`);
    
    for (const [jid, meta] of Object.entries(groups)) {
      groupList.push({
        id: jid,
        subject: meta.subject,
        participantCount: meta.participants?.length || 0,
      });
      
      // Extract contacts from participants
      for (const participant of meta.participants || []) {
        const phone = participant.id?.split("@")[0];
        if (phone && !phone.includes(":")) {
          const phoneFormatted = `+${phone}`;
          if (!contacts[phoneFormatted]) {
            contacts[phoneFormatted] = {
              phone: phoneFormatted,
              groups: [],
              isAdmin: false,
            };
          }
          contacts[phoneFormatted].groups.push({
            id: jid,
            name: meta.subject,
            isAdmin: participant.admin ? true : false,
          });
          if (participant.admin) {
            contacts[phoneFormatted].isAdmin = true;
          }
        }
      }
    }

    // Sort contacts by number of groups (most active first)
    const sortedContacts = Object.values(contacts).sort(
      (a, b) => b.groups.length - a.groups.length
    );

    const output = {
      extracted: new Date().toISOString(),
      source: "whatsapp-groups",
      selfId: sock.user?.id,
      stats: {
        totalGroups: groupList.length,
        totalContacts: sortedContacts.length,
      },
      groups: groupList.sort((a, b) => b.participantCount - a.participantCount),
      contacts: sortedContacts,
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
    
    console.log(`\n📱 Extracted ${sortedContacts.length} contacts from ${groupList.length} groups`);
    console.log(`💾 Saved to: ${OUTPUT_PATH}`);
    
    // Print top contacts
    console.log("\n🔝 Top contacts by group membership:");
    for (const contact of sortedContacts.slice(0, 10)) {
      console.log(`  ${contact.phone}: ${contact.groups.length} groups${contact.isAdmin ? " (admin)" : ""}`);
    }

  } catch (err) {
    console.error("❌ Error:", err.message);
    if (err.message?.includes("not authenticated")) {
      console.error("Please run 'openclaw channels login --channel whatsapp' first");
    }
    throw err;
  } finally {
    sock.ws?.close();
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
