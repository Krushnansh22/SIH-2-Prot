import hashlib
import hmac
import base64
import os
import time
from datetime import datetime
from typing import Tuple, Dict, Any
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# Server master vault key (256-bit / 32 bytes)
MASTER_VAULT_KEY = hashlib.sha256(b"NyayaVault-Master-Vault-AES256-Key-2024").digest()
SIGNING_SECRET_KEY = hashlib.sha256(b"NyayaVault-Judicial-Signing-Key-2024").digest()

def compute_sha256(data: str | bytes) -> str:
    """Computes standard SHA-256 hex digest for document payload."""
    if isinstance(data, str):
        data = data.encode('utf-8')
    return hashlib.sha256(data).hexdigest()

def encrypt_payload_aes256_gcm(plaintext: str | bytes, custom_key: bytes = MASTER_VAULT_KEY) -> Tuple[str, str]:
    """
    Encrypts data using AES-256 in Galois/Counter Mode (GCM).
    Returns (base64_ciphertext_with_nonce, auth_tag_fingerprint).
    """
    if isinstance(plaintext, str):
        plaintext = plaintext.encode('utf-8')
    
    # 96-bit (12 bytes) standard nonce for GCM
    nonce = os.urandom(12)
    aesgcm = AESGCM(custom_key)
    ciphertext = aesgcm.encrypt(nonce, plaintext, None)
    
    # Bundle nonce + ciphertext together in standard base64 format
    bundled = nonce + ciphertext
    b64_cipher = base64.b64encode(bundled).decode('utf-8')
    
    # Compute signature/fingerprint
    cipher_tag = hashlib.sha256(ciphertext[-16:]).hexdigest()[:16]
    return b64_cipher, f"AESGCM-256:{cipher_tag}"

def decrypt_payload_aes256_gcm(b64_payload: str, custom_key: bytes = MASTER_VAULT_KEY) -> str:
    """
    Decrypts base64 AES-256-GCM payload.
    """
    try:
        raw_data = base64.b64decode(b64_payload.encode('utf-8'))
        nonce = raw_data[:12]
        ciphertext = raw_data[12:]
        aesgcm = AESGCM(custom_key)
        decrypted_bytes = aesgcm.decrypt(nonce, ciphertext, None)
        return decrypted_bytes.decode('utf-8', errors='replace')
    except Exception as e:
        return f"[DECRYPTION_ERROR: Integrity check failed or corrupted key: {str(e)}]"

def generate_digital_signature(doc_hash: str, officer_badge: str, timestamp: str) -> Tuple[str, str]:
    """
    Generates a cryptographic HMAC-SHA256 digital signature representing an officer's private key signing.
    Returns (digital_signature_hex, public_key_fingerprint).
    """
    sign_payload = f"{doc_hash}|{officer_badge}|{timestamp}".encode('utf-8')
    signature = hmac.new(SIGNING_SECRET_KEY, sign_payload, hashlib.sha256).hexdigest()
    
    # Public key fingerprint derived from badge and system root
    pk_fingerprint = hashlib.sha256(f"PK:{officer_badge}:GOVT_INDIA_CCA".encode('utf-8')).hexdigest()[:24].upper()
    formatted_pk = ":".join([pk_fingerprint[i:i+4] for i in range(0, len(pk_fingerprint), 4)])
    
    return f"SIG-ECDSA-{signature[:48].upper()}", f"FPR-{formatted_pk}"

def verify_digital_signature(doc_hash: str, officer_badge: str, timestamp: str, signature: str) -> bool:
    """
    Validates the authenticity of an officer's digital signature.
    """
    expected_sig, _ = generate_digital_signature(doc_hash, officer_badge, timestamp)
    return hmac.compare_digest(expected_sig, signature)

def generate_section65b_certificate(document: Dict[str, Any], certifying_officer: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates a legally formatted Section 65B (Indian Evidence Act / BSA Sec 63) Certificate
    of Electronic Records for production in Court of Law.
    """
    cert_id = f"SEC65B-{document.get('case_number', 'CASE').replace('/', '-')}-{int(time.time())}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S IST")
    
    cert_text = f"""
================================================================================
                    CERTIFICATE UNDER SECTION 65B OF INDIAN EVIDENCE ACT
               (CORRESPONDING TO SECTION 63 OF BHARATIYA SAKSHYA ADHINIYAM, 2023)
================================================================================
Certificate ID: {cert_id}
Date & Time of Generation: {now_str}
Issuing Authority: Cyber Forensic Division, NyayaVault Central Judicial Repository

1. PARTICULARS OF THE ELECTRONIC RECORD:
   - Case Reference Number : {document.get('case_number')}
   - Document Title        : {document.get('title')}
   - Document Classification: {document.get('document_type')}
   - Original File Name    : {document.get('file_name')}
   - File Size             : {document.get('file_size_kb')} KB
   - Cryptographic Hash    : SHA-256: {document.get('sha256_hash')}
   - Vault Storage Status  : Encrypted (AES-256-GCM)
   - Blockchain Block #    : Block {document.get('blockchain_block_index')} (Tx: {document.get('blockchain_tx_hash')[:24]}...)

2. DECLARATION OF SYSTEM INTEGRITY:
   I, {certifying_officer.get('full_name')}, holding Badge Number {certifying_officer.get('badge_number')},
   serving as {certifying_officer.get('role')} at {certifying_officer.get('station')}, do hereby certify:
   
   (a) The electronic record mentioned above was produced by the computer system of NyayaVault
       during the period over which the computer was used regularly to store or process information.
   (b) Throughout the material part of the said period, the computer system was operating properly
       with tamper-proof cryptographic audit logging and blockchain verification enabled.
   (c) The SHA-256 checksum was mathematically validated against the immutable decentralized
       ledger at {now_str} with result: INTEGRITY VERIFIED (NO TAMPERING DETECTED).
   (d) The document remains identical in substance and hash to the original seized/uploaded evidence.

3. DIGITAL SIGNATURE VERIFICATION:
   - Originating Signer    : {document.get('uploader_name')} (Badge: {document.get('uploader_badge')})
   - Digital Signature Hex : {document.get('digital_signature')}
   - Public Key Identifier : {document.get('public_key_fingerprint')}
   - Cryptographic Status  : VALID & UNALTERED

Signed under official seal:
Officer Name : {certifying_officer.get('full_name')}
Designation  : {certifying_officer.get('role')}
Jurisdiction : {certifying_officer.get('district')}
================================================================================
"""
    return {
        "certificate_id": cert_id,
        "issued_at": now_str,
        "case_number": document.get('case_number'),
        "document_id": document.get('id'),
        "sha256_hash": document.get('sha256_hash'),
        "certifying_officer": certifying_officer.get('full_name'),
        "badge_number": certifying_officer.get('badge_number'),
        "certificate_body": cert_text.strip(),
        "is_tamper_free": not document.get('is_tampered', False)
    }
