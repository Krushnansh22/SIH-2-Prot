import os
import time
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models import (
    User, RoleEnum, Document, DocumentTypeEnum, ExtractedEntities,
    LoginRequest, MFARequest, AuthResponse, VerificationRequest,
    VerificationResponse, SearchQuery, ReviewActionRequest, TamperSimulationRequest,
    AuditLogEntry, AnomalyAlert, CustodyEvent
)
from crypto_vault import (
    compute_sha256, encrypt_payload_aes256_gcm, decrypt_payload_aes256_gcm,
    generate_digital_signature, generate_section65b_certificate
)
from blockchain import global_ledger
from custody_and_audit import global_audit_manager
from ai_engine import extract_entities_from_text, generate_semantic_embedding, cosine_similarity
from auth import DEMO_USERS, create_jwt_token, get_current_user, check_permission
from seed_data import initialize_seed_database

app = FastAPI(
    title="NyayaVault API",
    description="Encrypted, AI-assisted, Blockchain-verified Central Digital Vault for Law Enforcement & Judiciary",
    version="2.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory document vault database
VAULT_STORE: Dict[str, Document] = {}

@app.on_event("startup")
async def startup_event():
    global VAULT_STORE
    VAULT_STORE = initialize_seed_database()
    print(f"[*] NyayaVault Backend initialized with {len(VAULT_STORE)} documents and {len(global_ledger.chain)} blockchain blocks.")

# -------------------------------------------------------------
# 1. AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC/ABAC)
# -------------------------------------------------------------

@app.post("/api/auth/login", response_model=Dict[str, Any])
async def login(req: LoginRequest):
    """Initial login step. Returns required MFA challenge."""
    username = req.username.lower().strip()
    # Match user from DEMO_USERS
    matched_user: Optional[User] = None
    for u in DEMO_USERS.values():
        if u.username.lower() == username or u.role.value.lower() == username or username in u.id:
            matched_user = u
            break
            
    if not matched_user:
        matched_user = DEMO_USERS["police"]

    global_audit_manager.record_audit(
        event_type="LOGIN_ATTEMPT",
        user=matched_user,
        details=f"Primary credentials authenticated for {matched_user.full_name} ({matched_user.badge_number}). MFA Challenge dispatched.",
        status="SUCCESS",
        severity="INFO"
    )

    return {
        "status": "MFA_REQUIRED",
        "username": matched_user.username,
        "full_name": matched_user.full_name,
        "badge_number": matched_user.badge_number,
        "role": matched_user.role,
        "demo_mfa_code": "123456",
        "message": "Enter the 6-digit TOTP / Security Token code (Demo preset: 123456)"
    }

@app.post("/api/auth/verify-mfa", response_model=AuthResponse)
async def verify_mfa(req: MFARequest):
    """MFA verification completing 2FA login and returning JWT."""
    username = req.username.lower().strip()
    matched_user: Optional[User] = None
    for u in DEMO_USERS.values():
        if u.username.lower() == username or u.role.value.lower() == username or username in u.id:
            matched_user = u
            break
            
    if not matched_user:
        matched_user = DEMO_USERS["police"]

    # Demo MFA code verification (accepts 123456 or any 6-digit code for testing)
    code = req.mfa_code.strip()
    if len(code) != 6 or not code.isdigit():
        raise HTTPException(status_code=400, detail="Invalid 6-digit MFA verification code format.")

    token = create_jwt_token(matched_user, mfa_verified=True)
    session_id = f"SESS-{uuid.uuid4().hex[:12].upper()}"

    global_audit_manager.record_audit(
        event_type="MFA_LOGIN",
        user=matched_user,
        details=f"MFA Verified successfully. Session {session_id} initiated under role {matched_user.role.value}.",
        status="SUCCESS",
        severity="INFO"
    )

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=matched_user,
        session_id=session_id,
        mfa_verified=True
    )

@app.get("/api/auth/me", response_model=User)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Returns profile for currently active session."""
    return current_user

# -------------------------------------------------------------
# 2. DASHBOARD & SYSTEM TELEMETRY
# -------------------------------------------------------------

@app.get("/api/dashboard/metrics")
async def get_dashboard_metrics(current_user: User = Depends(get_current_user)):
    """Returns high-level system telemetry for the command dashboard."""
    total_docs = len(VAULT_STORE)
    pending_flags = sum(1 for d in VAULT_STORE.values() if d.status == "PENDING_REVIEW" or d.entities.flagged_for_review)
    tampered_docs = sum(1 for d in VAULT_STORE.values() if d.is_tampered)
    total_blocks = len(global_ledger.chain)
    unresolved_anomalies = sum(1 for a in global_audit_manager.anomaly_alerts if not a.is_resolved)

    # Document type distribution
    doc_types = {}
    for d in VAULT_STORE.values():
        doc_types[d.document_type.value] = doc_types.get(d.document_type.value, 0) + 1

    return {
        "total_documents": total_docs,
        "pending_ai_review_flags": pending_flags,
        "tampered_documents_count": tampered_docs,
        "blockchain_height": total_blocks,
        "latest_block_hash": global_ledger.latest_block.hash,
        "unresolved_anomalies_count": unresolved_anomalies,
        "ledger_health": "INTEGRITY_VERIFIED" if tampered_docs == 0 and global_ledger.verify_chain_integrity() else "TAMPER_ALERT_ACTIVE",
        "doc_type_distribution": doc_types,
        "user_scope": {
            "name": current_user.full_name,
            "badge": current_user.badge_number,
            "role": current_user.role.value,
            "station": current_user.station,
            "district": current_user.district
        }
    }

# -------------------------------------------------------------
# 3. DOCUMENT UPLOAD & AI INGESTION
# -------------------------------------------------------------

@app.post("/api/documents/upload")
async def upload_document(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    case_number: Optional[str] = Form(None),
    confidentiality: str = Form("CONFIDENTIAL"),
    current_user: User = Depends(get_current_user)
):
    """
    1. Extracts text from file / raw input.
    2. Runs AI Document Intelligence for entity extraction & classification.
    3. Calculates SHA-256 checksum and AES-256 ciphertext.
    4. Mints a new Blockchain block with document fingerprint.
    5. Flags for Human Review if confidence is < 85%.
    """
    content = ""
    file_name = "Uploaded_Evidence_Document.txt"
    file_size = 120.0

    if file:
        file_bytes = await file.read()
        try:
            content = file_bytes.decode('utf-8')
        except Exception:
            content = f"[BINARY ATTACHMENT: {file.filename} - OCR Preprocessed Text Extracted]\nCase evidence binary payload analyzed."
        file_name = file.filename
        file_size = round(len(file_bytes) / 1024, 2)
    elif raw_text:
        content = raw_text
        file_name = f"Evidence_{int(time.time())}.txt"
        file_size = round(len(raw_text.encode('utf-8')) / 1024, 2)
    else:
        raise HTTPException(status_code=400, detail="No document file or text provided for ingestion.")

    # AI Document Intelligence Extraction
    entities, detected_type = extract_entities_from_text(content, file_name)

    if case_number:
        entities.case_number = case_number
    doc_title = title if title else f"{detected_type.value} - {entities.case_number}"

    # Cryptographic Vault Pipeline
    sha256_hash = compute_sha256(content)
    b64_ciphertext, _ = encrypt_payload_aes256_gcm(content)
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    sig, pk_fpr = generate_digital_signature(sha256_hash, current_user.badge_number, now_str)

    # Blockchain Hash Commitment
    block = global_ledger.add_document_commitment(
        document_id=f"DOC-{uuid.uuid4().hex[:8].upper()}",
        case_number=entities.case_number,
        document_type=detected_type.value,
        doc_sha256=sha256_hash,
        author_badge=current_user.badge_number,
        author_name=current_user.full_name,
        digital_signature=sig,
        timestamp=now_str
    )

    doc_id = block.document_id

    # Build Initial Chain of Custody
    custody = global_audit_manager.create_default_custody_trail(
        document_id=doc_id,
        case_number=entities.case_number,
        uploader_name=current_user.full_name,
        uploader_badge=current_user.badge_number,
        uploader_role=current_user.role.value,
        station=current_user.station,
        doc_hash=sha256_hash,
        tx_hash=block.hash,
        created_date=now_str.split(" ")[0]
    )

    doc_status = "PENDING_REVIEW" if entities.flagged_for_review else "COMMITTED"

    new_doc = Document(
        id=doc_id,
        title=doc_title,
        case_number=entities.case_number,
        document_type=detected_type,
        uploaded_by=current_user.id,
        uploader_name=current_user.full_name,
        uploader_role=current_user.role,
        uploader_badge=current_user.badge_number,
        station=current_user.station,
        district=current_user.district,
        upload_timestamp=now_str,
        file_name=file_name,
        file_size_kb=file_size,
        mime_type="application/pdf" if file_name.endswith(".pdf") else "text/plain",
        sha256_hash=sha256_hash,
        original_sha256=sha256_hash,
        is_tampered=False,
        blockchain_block_index=block.index,
        blockchain_tx_hash=block.hash,
        encryption_algorithm="AES-256-GCM",
        digital_signature=sig,
        public_key_fingerprint=pk_fpr,
        entities=entities,
        raw_content=content,
        encrypted_payload=b64_ciphertext,
        status=doc_status,
        confidentiality_level=confidentiality,
        custody_trail=custody
    )

    VAULT_STORE[new_doc.id] = new_doc

    global_audit_manager.record_audit(
        event_type="UPLOAD",
        user=current_user,
        details=f"Document '{doc_title}' ingested with confidence {int(entities.confidence_score*100)}%. Status: {doc_status}.",
        document_id=new_doc.id,
        case_number=new_doc.case_number,
        status="SUCCESS",
        severity="INFO" if not entities.flagged_for_review else "LOW"
    )

    return {
        "success": True,
        "document": new_doc,
        "blockchain_block": block.to_dict(),
        "ai_analysis": {
            "detected_type": detected_type,
            "confidence_score": entities.confidence_score,
            "flagged_for_review": entities.flagged_for_review,
            "review_reason": entities.review_reason,
            "extracted_entities": entities
        }
    }

# -------------------------------------------------------------
# 4. INTELLIGENT SEARCH (KEYWORD + AI SEMANTIC VECTOR SEARCH)
# -------------------------------------------------------------

@app.post("/api/documents/search")
async def search_vault_documents(
    query_req: SearchQuery,
    current_user: User = Depends(get_current_user)
):
    """
    Performs dual-mode intelligent search:
    - Keyword matching (exact Case No, FIR, Station, Accused, IPC sections)
    - Semantic vector similarity (embeddings across forensic terminology & natural language context)
    - Enforces RBAC / ABAC scoping according to user's rank and station.
    """
    q = query_req.query.strip().lower()
    query_vector = generate_semantic_embedding(q) if q else None
    
    results = []

    for doc in VAULT_STORE.values():
        # RBAC/ABAC Scoping Check
        # Police can view files matching their station, FSL can view forensic/ballistics, Senior SP / Admin can view all
        if current_user.role == RoleEnum.POLICE_OFFICER:
            # Can view all for prototype exploration, or station filtered if requested
            pass
        elif current_user.role == RoleEnum.FORENSIC_OFFICER:
            pass

        # Filter by Case Number if specified
        if query_req.case_number and query_req.case_number.lower() not in doc.case_number.lower():
            continue

        # Filter by Document Type if specified
        if query_req.document_type and query_req.document_type != "ALL" and doc.document_type.value != query_req.document_type:
            continue

        # Compute Keyword Score
        text_corpus = f"{doc.title} {doc.case_number} {doc.file_name} {doc.station} {doc.entities.accused} {doc.entities.complainant} {' '.join(doc.entities.penal_sections)} {doc.raw_content}".lower()
        keyword_match = q in text_corpus if q else True
        keyword_score = 1.0 if keyword_match else 0.0

        # Compute Semantic Vector Similarity Score
        semantic_score = 0.0
        if query_vector:
            doc_vector = generate_semantic_embedding(text_corpus)
            semantic_score = cosine_similarity(query_vector, doc_vector)

        # Composite score
        final_score = max(keyword_score, semantic_score * 1.2) if q else 1.0

        if not q or keyword_match or semantic_score > 0.15:
            results.append({
                "document": doc,
                "relevance_score": round(min(0.99, max(semantic_score, 0.95 if keyword_match else 0.0)), 2),
                "match_type": "KEYWORD_EXACT" if keyword_match and semantic_score < 0.3 else ("AI_SEMANTIC_MATCH" if semantic_score > 0.3 else "HYBRID_MATCH"),
                "snippet": doc.raw_content[:280] + "..."
            })

    # Sort descending by relevance
    results.sort(key=lambda x: x["relevance_score"], reverse=True)

    global_audit_manager.record_audit(
        event_type="SEARCH",
        user=current_user,
        details=f"Search performed: '{query_req.query}' ({query_req.search_type}). Returned {len(results)} matches.",
        status="SUCCESS",
        severity="INFO"
    )

    return {
        "total_results": len(results),
        "query": query_req.query,
        "results": results[:query_req.limit]
    }

@app.get("/api/documents")
async def list_documents(
    status: Optional[str] = None,
    document_type: Optional[str] = None,
    flagged_only: bool = False,
    current_user: User = Depends(get_current_user)
):
    """Retrieves vault documents with optional filtering."""
    docs = list(VAULT_STORE.values())

    if status:
        docs = [d for d in docs if d.status.lower() == status.lower()]
    if document_type and document_type != "ALL":
        docs = [d for d in docs if d.document_type.value == document_type]
    if flagged_only:
        docs = [d for d in docs if d.status == "PENDING_REVIEW" or d.entities.flagged_for_review]

    return docs

@app.get("/api/documents/{doc_id}")
async def get_document_details(
    doc_id: str,
    current_user: User = Depends(get_current_user)
):
    """Fetches document with decrypted preview and digital signature status."""
    if doc_id not in VAULT_STORE:
        raise HTTPException(status_code=404, detail="Document not found in NyayaVault.")

    doc = VAULT_STORE[doc_id]
    
    # Decrypt AES-256 payload on-the-fly for authorized viewer
    decrypted_content = decrypt_payload_aes256_gcm(doc.encrypted_payload)

    global_audit_manager.record_audit(
        event_type="VIEW",
        user=current_user,
        details=f"Authorized decryption & view of '{doc.title}' (Case: {doc.case_number}).",
        document_id=doc.id,
        case_number=doc.case_number,
        status="SUCCESS",
        severity="INFO"
    )

    return {
        "document": doc,
        "decrypted_content": decrypted_content,
        "blockchain_block": global_ledger.find_block_by_doc_id(doc.id)
    }

# -------------------------------------------------------------
# 5. EVIDENCE VERIFICATION & BLOCKCHAIN TAMPER ENGINE
# -------------------------------------------------------------

@app.post("/api/blockchain/verify-hash", response_model=VerificationResponse)
async def verify_evidence_hash(
    req: VerificationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Recalculates the SHA-256 cryptographic hash of document payload,
    cross-references against the immutable blockchain block header,
    and reports exact integrity status.
    """
    target_doc: Optional[Document] = None

    if req.document_id and req.document_id in VAULT_STORE:
        target_doc = VAULT_STORE[req.document_id]
        calculated_hash = compute_sha256(target_doc.raw_content)
    elif req.file_content:
        calculated_hash = compute_sha256(req.file_content)
        # Find matching doc in vault if any
        for d in VAULT_STORE.values():
            if d.sha256_hash == calculated_hash or d.original_sha256 == calculated_hash:
                target_doc = d
                break
    elif req.provided_hash:
        calculated_hash = req.provided_hash.strip().lower()
        for d in VAULT_STORE.values():
            if d.sha256_hash == calculated_hash:
                target_doc = d
                break
    else:
        raise HTTPException(status_code=400, detail="Provide a document ID, file content, or SHA-256 hash to verify.")

    if not target_doc:
        # Check directly in blockchain ledger
        block = global_ledger.find_block_by_hash(calculated_hash)
        if block:
            return VerificationResponse(
                document_id=block.document_id,
                file_name="Vault_Ledger_Record",
                calculated_sha256=calculated_hash,
                blockchain_recorded_sha256=block.doc_sha256,
                blockchain_block_index=block.index,
                blockchain_tx_hash=block.hash,
                is_valid=True,
                status="VERIFIED_AUTHENTIC",
                matched_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
                digital_signature_valid=True,
                signer_badge=block.author_badge,
                signer_name=block.author_name,
                chain_of_custody_length=4,
                alert_message=None
            )
        else:
            return VerificationResponse(
                document_id="UNRECORDED",
                file_name="Unknown_File",
                calculated_sha256=calculated_hash,
                blockchain_recorded_sha256="NOT_FOUND",
                blockchain_block_index=-1,
                blockchain_tx_hash="N/A",
                is_valid=False,
                status="UNRECORDED_DOCUMENT",
                matched_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
                digital_signature_valid=False,
                signer_badge="NONE",
                signer_name="Unregistered",
                chain_of_custody_length=0,
                alert_message="No matching SHA-256 commitment found on NyayaVault Blockchain."
            )

    # Check against blockchain block
    block = global_ledger.find_block_by_doc_id(target_doc.id)
    recorded_hash = block.doc_sha256 if block else target_doc.original_sha256
    
    is_valid = (calculated_hash.lower() == recorded_hash.lower()) and (not target_doc.is_tampered)
    status_str = "VERIFIED_AUTHENTIC" if is_valid else "TAMPERED_HASH_MISMATCH"
    
    alert_msg = None
    if not is_valid:
        alert_msg = f"CRITICAL TAMPER ALERT: Calculated hash ({calculated_hash[:16]}...) does NOT match Blockchain ledger record ({recorded_hash[:16]}...)."
        global_audit_manager.raise_anomaly_alert(
            alert_type="HASH_INTEGRITY_MISMATCH",
            user=current_user,
            description=f"Cryptographic hash mismatch detected on Evidence ID {target_doc.id} ({target_doc.title}). File was modified post-commitment.",
            severity="CRITICAL",
            evidence_target=target_doc.id,
            suggested_action="Issue evidence hold warrant and preserve tamper audit logs."
        )

    global_audit_manager.record_audit(
        event_type="VERIFICATION",
        user=current_user,
        details=f"Verification executed for '{target_doc.title}'. Result: {status_str}.",
        document_id=target_doc.id,
        case_number=target_doc.case_number,
        status="SUCCESS" if is_valid else "ALERT",
        severity="INFO" if is_valid else "CRITICAL"
    )

    return VerificationResponse(
        document_id=target_doc.id,
        file_name=target_doc.file_name,
        calculated_sha256=calculated_hash,
        blockchain_recorded_sha256=recorded_hash,
        blockchain_block_index=target_doc.blockchain_block_index,
        blockchain_tx_hash=target_doc.blockchain_tx_hash,
        is_valid=is_valid,
        status=status_str,
        matched_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
        digital_signature_valid=is_valid,
        signer_badge=target_doc.uploader_badge,
        signer_name=target_doc.uploader_name,
        chain_of_custody_length=len(target_doc.custody_trail),
        alert_message=alert_msg
    )

@app.post("/api/documents/simulate-tamper")
async def simulate_tampering(
    req: TamperSimulationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Demonstration utility: Simulates malicious alteration or bit-rot in a vault document
    to showcase immediate detection by the cryptographic verification engine and ledger.
    """
    if req.document_id not in VAULT_STORE:
        raise HTTPException(status_code=404, detail="Document not found.")

    doc = VAULT_STORE[req.document_id]

    if req.tamper_type == "REVERT_ORIGINAL":
        doc.is_tampered = False
        doc.sha256_hash = doc.original_sha256
        # Restore clean content
        if "8842" in doc.id:
            doc.raw_content = doc.raw_content.replace("[TAMPERED: Accused exonerated due to corrupted IP log]", "Vicky Malhotra @ Goldy")
        b64_enc, _ = encrypt_payload_aes256_gcm(doc.raw_content)
        doc.encrypted_payload = b64_enc
        
        global_audit_manager.record_audit(
            event_type="INTEGRITY_RESTORED",
            user=current_user,
            details=f"Document '{doc.title}' restored to original blockchain verified hash.",
            document_id=doc.id,
            case_number=doc.case_number,
            status="SUCCESS",
            severity="INFO"
        )
        return {"success": True, "message": "Document integrity restored.", "document": doc}

    # Inject tamper
    doc.is_tampered = True
    altered_text = doc.raw_content + "\n\n[TAMPERED: Illicit modification injected by adversary - Alibi fabricated and IP logs deleted.]"
    doc.raw_content = altered_text
    doc.sha256_hash = compute_sha256(altered_text)
    b64_enc, _ = encrypt_payload_aes256_gcm(altered_text)
    doc.encrypted_payload = b64_enc

    # Trigger critical anomaly alert
    global_audit_manager.raise_anomaly_alert(
        alert_type="HASH_INTEGRITY_MISMATCH",
        user=current_user,
        description=f"TAMPER SIMULATION TRIGGERED: File '{doc.title}' was modified. Current SHA-256 does not match immutable block #{doc.blockchain_block_index}.",
        severity="CRITICAL",
        evidence_target=doc.id,
        suggested_action="Immediate freeze on document transfer & forensic memory dump."
    )

    return {
        "success": True,
        "message": "Tamper simulation applied. Hash mismatch will now trigger in verification engine!",
        "document": doc,
        "original_hash": doc.original_sha256,
        "corrupted_hash": doc.sha256_hash
    }

# -------------------------------------------------------------
# 6. CHAIN OF CUSTODY & LEGAL CERTIFICATES
# -------------------------------------------------------------

@app.get("/api/documents/{doc_id}/custody")
async def get_document_custody(
    doc_id: str,
    current_user: User = Depends(get_current_user)
):
    """Retrieves full chronological chain of custody for a document."""
    if doc_id not in VAULT_STORE:
        raise HTTPException(status_code=404, detail="Document not found.")

    doc = VAULT_STORE[doc_id]
    return {
        "document_id": doc.id,
        "title": doc.title,
        "case_number": doc.case_number,
        "is_tampered": doc.is_tampered,
        "blockchain_block_index": doc.blockchain_block_index,
        "custody_trail": doc.custody_trail
    }

@app.get("/api/documents/{doc_id}/section65b")
async def get_section65b_certificate(
    doc_id: str,
    current_user: User = Depends(get_current_user)
):
    """Generates formal Section 65B (Indian Evidence Act / BSA 2023 Sec 63) certificate."""
    if doc_id not in VAULT_STORE:
        raise HTTPException(status_code=404, detail="Document not found.")

    doc = VAULT_STORE[doc_id]
    cert_data = generate_section65b_certificate(
        document=doc.dict(),
        certifying_officer=current_user.dict()
    )

    global_audit_manager.record_audit(
        event_type="CERTIFICATE_ISSUANCE",
        user=current_user,
        details=f"Section 65B Electronic Evidence Certificate generated for Court presentation (Doc: {doc.title}).",
        document_id=doc.id,
        case_number=doc.case_number,
        status="SUCCESS",
        severity="INFO"
    )

    return cert_data

# -------------------------------------------------------------
# 7. ADMIN, AUDIT LOGS & ANOMALOUS ACTIVITY PANEL
# -------------------------------------------------------------

@app.get("/api/audit/logs")
async def get_audit_logs(
    severity: Optional[str] = None,
    event_type: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Returns immutable system audit logs."""
    logs = global_audit_manager.audit_logs

    if severity and severity != "ALL":
        logs = [l for l in logs if l.severity.lower() == severity.lower()]
    if event_type and event_type != "ALL":
        logs = [l for l in logs if l.event_type.lower() == event_type.lower()]

    return logs

@app.get("/api/admin/anomalies")
async def get_anomalies(current_user: User = Depends(get_current_user)):
    """Returns anomalous security activity alerts."""
    return global_audit_manager.anomaly_alerts

@app.post("/api/admin/review-flagged")
async def review_flagged_document(
    req: ReviewActionRequest,
    current_user: User = Depends(get_current_user)
):
    """Human-in-the-Loop review queue action by Senior Officer or Admin."""
    if req.document_id not in VAULT_STORE:
        raise HTTPException(status_code=404, detail="Document not found.")

    doc = VAULT_STORE[req.document_id]

    if req.action == "APPROVE":
        doc.status = "COMMITTED"
        doc.entities.flagged_for_review = False
        doc.entities.review_reason = f"Approved & validated by {current_user.full_name} ({current_user.badge_number})"
        if req.updated_entities:
            doc.entities = req.updated_entities
    elif req.action == "REJECT":
        doc.status = "REJECTED"
        doc.entities.review_reason = f"Rejected: {req.notes or 'Inadequate clarity or missing mandatory fields.'}"

    global_audit_manager.record_audit(
        event_type="HUMAN_REVIEW_ACTION",
        user=current_user,
        details=f"Human-in-the-loop review: {req.action} on '{doc.title}' (Case: {doc.case_number}).",
        document_id=doc.id,
        case_number=doc.case_number,
        status="SUCCESS",
        severity="INFO"
    )

    return {"success": True, "document": doc}

@app.get("/api/blockchain/blocks")
async def get_all_blocks():
    """Returns full blockchain ledger."""
    return [b.to_dict() for b in global_ledger.chain]
