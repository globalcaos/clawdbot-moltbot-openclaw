#!/usr/bin/env python3
"""
JarvisOne Knowledge Base - Database Initialization
"""
import sqlite3
import json
import hashlib
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).parent / "jarvis.db"
WORKSPACE = Path(__file__).parent.parent

def get_hash(content: str) -> str:
    return hashlib.md5(content.encode()).hexdigest()

def init_schema(conn: sqlite3.Connection):
    """Create all tables and indexes"""
    conn.executescript("""
    -- Core documents table
    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        path TEXT UNIQUE,
        title TEXT,
        content TEXT,
        hash TEXT,
        created_at TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT
    );

    -- Full-text search on documents
    CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
        title,
        content,
        content='documents',
        content_rowid='id'
    );

    -- Triggers to keep FTS in sync
    CREATE TRIGGER IF NOT EXISTS documents_ai AFTER INSERT ON documents BEGIN
        INSERT INTO documents_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
    END;

    CREATE TRIGGER IF NOT EXISTS documents_ad AFTER DELETE ON documents BEGIN
        INSERT INTO documents_fts(documents_fts, rowid, title, content) VALUES('delete', old.id, old.title, old.content);
    END;

    CREATE TRIGGER IF NOT EXISTS documents_au AFTER UPDATE ON documents BEGIN
        INSERT INTO documents_fts(documents_fts, rowid, title, content) VALUES('delete', old.id, old.title, old.content);
        INSERT INTO documents_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
    END;

    -- Contacts table
    CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT UNIQUE,
        name TEXT,
        source TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- WhatsApp groups
    CREATE TABLE IF NOT EXISTS wa_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jid TEXT UNIQUE NOT NULL,
        name TEXT,
        participant_count INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Group memberships
    CREATE TABLE IF NOT EXISTS wa_memberships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_jid TEXT NOT NULL,
        phone TEXT NOT NULL,
        is_admin INTEGER DEFAULT 0,
        UNIQUE(group_jid, phone)
    );

    -- ChatGPT conversations
    CREATE TABLE IF NOT EXISTS chatgpt_conversations (
        id TEXT PRIMARY KEY,
        title TEXT,
        created_at TEXT,
        updated_at TEXT,
        message_count INTEGER,
        model TEXT
    );

    -- ChatGPT messages
    CREATE TABLE IF NOT EXISTS chatgpt_messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT,
        role TEXT,
        content TEXT,
        created_at TEXT
    );

    -- FTS for ChatGPT messages
    CREATE VIRTUAL TABLE IF NOT EXISTS chatgpt_messages_fts USING fts5(
        content,
        content='chatgpt_messages',
        content_rowid='rowid'
    );

    -- Tags
    CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        doc_id INTEGER,
        tag TEXT
    );

    -- Schema version
    CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY,
        applied_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
    CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
    CREATE INDEX IF NOT EXISTS idx_wa_memberships_phone ON wa_memberships(phone);
    CREATE INDEX IF NOT EXISTS idx_wa_memberships_group ON wa_memberships(group_jid);
    CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
    CREATE INDEX IF NOT EXISTS idx_chatgpt_messages_conv ON chatgpt_messages(conversation_id);
    """)
    
    # Set version
    conn.execute("INSERT OR IGNORE INTO schema_version (version) VALUES (1)")
    conn.commit()
    print("✅ Schema created")

def import_whatsapp_contacts(conn: sqlite3.Connection):
    """Import WhatsApp contacts and groups from JSON"""
    json_path = WORKSPACE / "bank" / "whatsapp-contacts-full.json"
    if not json_path.exists():
        print("⚠️  WhatsApp contacts file not found")
        return
    
    with open(json_path) as f:
        data = json.load(f)
    
    # Import groups
    groups_added = 0
    for group in data.get("groups", []):
        try:
            conn.execute("""
                INSERT OR REPLACE INTO wa_groups (jid, name, participant_count)
                VALUES (?, ?, ?)
            """, (group["id"], group.get("subject", ""), group.get("participantCount", 0)))
            groups_added += 1
        except Exception as e:
            print(f"  Group error: {e}")
    
    # Import contacts and memberships
    contacts_added = 0
    memberships_added = 0
    for contact in data.get("contacts", []):
        phone = contact.get("phone", "").replace("+", "")
        if not phone:
            continue
        
        # Normalize phone
        if not phone.startswith("+"):
            phone = "+" + phone
        
        try:
            conn.execute("""
                INSERT OR IGNORE INTO contacts (phone, source)
                VALUES (?, 'whatsapp')
            """, (phone,))
            contacts_added += 1
        except:
            pass
        
        # Add memberships
        for group in contact.get("groups", []):
            try:
                conn.execute("""
                    INSERT OR IGNORE INTO wa_memberships (group_jid, phone, is_admin)
                    VALUES (?, ?, ?)
                """, (group["id"], phone, 1 if group.get("isAdmin") else 0))
                memberships_added += 1
            except:
                pass
    
    conn.commit()
    print(f"✅ WhatsApp: {groups_added} groups, {contacts_added} contacts, {memberships_added} memberships")

def import_daily_logs(conn: sqlite3.Connection):
    """Import markdown files from memory/"""
    memory_dir = WORKSPACE / "memory"
    if not memory_dir.exists():
        print("⚠️  Memory directory not found")
        return
    
    docs_added = 0
    for md_file in memory_dir.rglob("*.md"):
        try:
            content = md_file.read_text()
            title = md_file.stem
            rel_path = str(md_file.relative_to(WORKSPACE))
            content_hash = get_hash(content)
            
            # Determine type
            if md_file.name.startswith("2026-") or md_file.name.startswith("2025-"):
                doc_type = "log"
            elif "project" in rel_path:
                doc_type = "project"
            else:
                doc_type = "note"
            
            conn.execute("""
                INSERT OR REPLACE INTO documents (type, path, title, content, hash, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (doc_type, rel_path, title, content, content_hash, datetime.now().isoformat()))
            docs_added += 1
        except Exception as e:
            print(f"  Error importing {md_file}: {e}")
    
    conn.commit()
    print(f"✅ Documents: {docs_added} markdown files indexed")

def import_chatgpt_export(conn: sqlite3.Connection):
    """Import ChatGPT conversations"""
    export_dir = WORKSPACE / "chatgpt-export"
    if not export_dir.exists():
        print("⚠️  ChatGPT export directory not found")
        return
    
    convs_added = 0
    msgs_added = 0
    
    for json_file in export_dir.glob("*.json"):
        try:
            with open(json_file) as f:
                data = json.load(f)
            
            # Handle both single conversation and array formats
            conversations = data if isinstance(data, list) else [data]
            
            for conv in conversations:
                if not isinstance(conv, dict):
                    continue
                    
                conv_id = conv.get("id") or conv.get("conversation_id") or str(hash(str(conv)))[:16]
                title = conv.get("title", "Untitled")
                created = conv.get("create_time") or conv.get("created_at")
                updated = conv.get("update_time") or conv.get("updated_at")
                
                # Count messages
                mapping = conv.get("mapping", {})
                msg_count = len([m for m in mapping.values() if m.get("message")])
                
                conn.execute("""
                    INSERT OR REPLACE INTO chatgpt_conversations 
                    (id, title, created_at, updated_at, message_count)
                    VALUES (?, ?, ?, ?, ?)
                """, (conv_id, title, created, updated, msg_count))
                convs_added += 1
                
                # Extract messages
                for node_id, node in mapping.items():
                    msg = node.get("message")
                    if not msg:
                        continue
                    
                    author = msg.get("author", {})
                    role = author.get("role", "unknown")
                    
                    # Get content
                    content_obj = msg.get("content", {})
                    parts = content_obj.get("parts", [])
                    content = "\n".join(str(p) for p in parts if isinstance(p, str))
                    
                    if not content.strip():
                        continue
                    
                    msg_id = msg.get("id", node_id)
                    create_time = msg.get("create_time")
                    
                    try:
                        conn.execute("""
                            INSERT OR REPLACE INTO chatgpt_messages
                            (id, conversation_id, role, content, created_at)
                            VALUES (?, ?, ?, ?, ?)
                        """, (msg_id, conv_id, role, content, create_time))
                        msgs_added += 1
                    except:
                        pass
        
        except Exception as e:
            print(f"  Error importing {json_file.name}: {e}")
    
    conn.commit()
    print(f"✅ ChatGPT: {convs_added} conversations, {msgs_added} messages")

def print_stats(conn: sqlite3.Connection):
    """Print database statistics"""
    print("\n📊 Database Statistics:")
    
    tables = [
        ("contacts", "SELECT COUNT(*) FROM contacts"),
        ("wa_groups", "SELECT COUNT(*) FROM wa_groups"),
        ("wa_memberships", "SELECT COUNT(*) FROM wa_memberships"),
        ("documents", "SELECT COUNT(*) FROM documents"),
        ("chatgpt_conversations", "SELECT COUNT(*) FROM chatgpt_conversations"),
        ("chatgpt_messages", "SELECT COUNT(*) FROM chatgpt_messages"),
    ]
    
    for name, query in tables:
        try:
            count = conn.execute(query).fetchone()[0]
            print(f"  {name}: {count:,}")
        except:
            print(f"  {name}: 0")
    
    # DB file size
    db_size = DB_PATH.stat().st_size / 1024
    print(f"\n  Database size: {db_size:.1f} KB")

def main():
    print(f"🗄️  Initializing JarvisOne Knowledge Base")
    print(f"   Database: {DB_PATH}\n")
    
    conn = sqlite3.connect(DB_PATH)
    
    init_schema(conn)
    import_whatsapp_contacts(conn)
    import_daily_logs(conn)
    import_chatgpt_export(conn)
    print_stats(conn)
    
    conn.close()
    print("\n✅ Knowledge Base ready!")

if __name__ == "__main__":
    main()
