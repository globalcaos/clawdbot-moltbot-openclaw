#!/usr/bin/env python3
"""Import VCF contacts into jarvis.db"""
import sqlite3
import re
from pathlib import Path

VCF_PATH = Path.home() / "Downloads/can delete later/Contacts.vcf"
DB_PATH = Path(__file__).parent / "jarvis.db"

def parse_vcf(path):
    """Parse VCF file and yield contact dicts"""
    with open(path, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    
    vcards = content.split('BEGIN:VCARD')
    for vcard in vcards[1:]:  # Skip first empty split
        contact = {'phones': [], 'emails': [], 'source': 'google'}
        
        for line in vcard.split('\n'):
            line = line.strip()
            
            # Name
            if line.startswith('FN:') or line.startswith('FN;'):
                contact['name'] = line.split(':', 1)[1].strip()
            
            # Phone - handle various formats
            if 'TEL' in line and ':' in line:
                phone = line.split(':', 1)[1].strip()
                phone = re.sub(r'[^\d+]', '', phone)  # Keep only digits and +
                if phone and len(phone) >= 7:
                    contact['phones'].append(phone)
            
            # Email
            if 'EMAIL' in line and ':' in line:
                email = line.split(':', 1)[1].strip()
                if '@' in email:
                    contact['emails'].append(email)
            
            # Org
            if line.startswith('ORG:') or line.startswith('ORG;'):
                contact['org'] = line.split(':', 1)[1].strip().rstrip(';')
            
            # Note
            if line.startswith('NOTE:'):
                contact['notes'] = line.split(':', 1)[1].strip()
        
        if contact.get('name') or contact.get('phones') or contact.get('emails'):
            yield contact

def import_contacts():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    # Get existing phones to avoid duplicates
    cur.execute("SELECT phone FROM contacts WHERE phone IS NOT NULL")
    existing_phones = {row[0] for row in cur.fetchall()}
    
    imported = 0
    skipped = 0
    
    for contact in parse_vcf(VCF_PATH):
        name = contact.get('name', '')
        phones = contact.get('phones', [])
        emails = contact.get('emails', [])
        org = contact.get('org', '')
        notes = contact.get('notes', '')
        
        # Use first phone/email as primary
        phone = phones[0] if phones else None
        email = emails[0] if emails else None
        
        # Skip if phone already exists
        if phone and phone in existing_phones:
            skipped += 1
            continue
        
        # Skip if no useful data
        if not name and not phone and not email:
            continue
        
        # Combine extra info into notes
        extra = []
        if email: extra.append(f"email: {email}")
        if org: extra.append(f"org: {org}")
        if notes: extra.append(notes)
        combined_notes = '; '.join(extra) if extra else None
        
        cur.execute("""
            INSERT INTO contacts (name, phone, notes, source)
            VALUES (?, ?, ?, 'google')
        """, (name, phone, combined_notes))
        
        if phone:
            existing_phones.add(phone)
        imported += 1
    
    conn.commit()
    
    # Get final count
    cur.execute("SELECT COUNT(*) FROM contacts")
    total = cur.fetchone()[0]
    
    conn.close()
    print(f"Imported: {imported}")
    print(f"Skipped (duplicates): {skipped}")
    print(f"Total contacts now: {total}")

if __name__ == '__main__':
    import_contacts()
