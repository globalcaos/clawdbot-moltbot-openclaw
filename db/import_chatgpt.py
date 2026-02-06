#!/usr/bin/env python3
"""Import ChatGPT conversations from the custom export format"""
import sqlite3
import json
from pathlib import Path

DB_PATH = Path(__file__).parent / "jarvis.db"
EXPORT_PATH = Path(__file__).parent.parent / "chatgpt-export" / "chatgpt-export-2026-02-06.json"

def main():
    print(f"📥 Importing ChatGPT conversations from {EXPORT_PATH.name}")
    
    with open(EXPORT_PATH) as f:
        data = json.load(f)
    
    conversations = data.get("conversations", [])
    print(f"   Found {len(conversations)} conversations")
    
    conn = sqlite3.connect(DB_PATH)
    
    # Clear existing ChatGPT data
    conn.execute("DELETE FROM chatgpt_messages")
    conn.execute("DELETE FROM chatgpt_conversations")
    
    convs_added = 0
    msgs_added = 0
    
    for conv in conversations:
        conv_id = conv.get("id", "")
        title = conv.get("title", "Untitled")
        created = conv.get("created", "")
        messages = conv.get("messages", [])
        
        conn.execute("""
            INSERT OR REPLACE INTO chatgpt_conversations 
            (id, title, created_at, message_count)
            VALUES (?, ?, ?, ?)
        """, (conv_id, title, created, len(messages)))
        convs_added += 1
        
        for i, msg in enumerate(messages):
            role = msg.get("role", "unknown")
            text = msg.get("text", "")
            time = msg.get("time", "")
            
            if not text.strip():
                continue
            
            msg_id = f"{conv_id}_{i}"
            
            conn.execute("""
                INSERT OR REPLACE INTO chatgpt_messages
                (id, conversation_id, role, content, created_at)
                VALUES (?, ?, ?, ?, ?)
            """, (msg_id, conv_id, role, text, time))
            msgs_added += 1
    
    # Rebuild FTS index for messages
    conn.execute("DELETE FROM chatgpt_messages_fts")
    conn.execute("""
        INSERT INTO chatgpt_messages_fts(rowid, content)
        SELECT rowid, content FROM chatgpt_messages
    """)
    
    conn.commit()
    
    # Stats
    total_chars = conn.execute("SELECT SUM(LENGTH(content)) FROM chatgpt_messages").fetchone()[0] or 0
    
    print(f"\n✅ Imported:")
    print(f"   Conversations: {convs_added}")
    print(f"   Messages: {msgs_added}")
    print(f"   Total text: {total_chars:,} characters ({total_chars/1024:.1f} KB)")
    
    # Sample search test
    print(f"\n🔍 Testing FTS search for 'Bashar'...")
    results = conn.execute("""
        SELECT c.title, m.role, SUBSTR(m.content, 1, 100)
        FROM chatgpt_messages_fts f
        JOIN chatgpt_messages m ON m.rowid = f.rowid
        JOIN chatgpt_conversations c ON c.id = m.conversation_id
        WHERE chatgpt_messages_fts MATCH 'Bashar'
        LIMIT 3
    """).fetchall()
    
    for title, role, snippet in results:
        print(f"   [{role}] {title}: {snippet}...")
    
    conn.close()
    print("\n✅ ChatGPT import complete!")

if __name__ == "__main__":
    main()
