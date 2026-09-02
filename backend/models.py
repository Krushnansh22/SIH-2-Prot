from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class RoleEnum(str, Enum):
    POLICE_OFFICER = "POLICE_OFFICER"
    FORENSIC_OFFICER = "FORENSIC_OFFICER"
    SENIOR_OFFICER = "SENIOR_OFFICER"
    ADMINISTRATOR = "ADMINISTRATOR"

class DocumentTypeEnum(str, Enum):
    FIR = "FIR"
    CHARGE_SHEET = "CHARGE_SHEET"
    FORENSIC_REPORT = "FORENSIC_REPORT"
    POST_MORTEM = "POST_MORTEM"
    SEIZURE_MEMO = "SEIZURE_MEMO"
    WITNESS_STATEMENT = "WITNESS_STATEMENT"
    COURT_ORDER = "COURT_ORDER"
    BALLISTICS_REPORT = "BALLISTICS_REPORT"

class User(BaseModel):
    id: str
    username: str
    full_name: str
    badge_number: str
    role: RoleEnum
    station: str
    district: str
    avatar_url: Optional[str] = None
    mfa_secret: Optional[str] = "NYAYA-MFA-2024"
    mfa_enabled: bool = True
    permissions: List[str] = []

class LoginRequest(BaseModel):
    username: str
    password: str

class MFARequest(BaseModel):
    username: str
    mfa_code: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User
    session_id: str
    mfa_verified: bool

class ExtractedEntities(BaseModel):
    case_number: Optional[str] = None
    fir_number: Optional[str] = None
    police_station: Optional[str] = None
    date_of_incident: Optional[str] = None
    complainant: Optional[str] = None
    accused: Optional[str] = None
    penal_sections: List[str] = []
    investigating_officer: Optional[str] = None
    evidence_type: Optional[str] = None
    key_findings: Optional[str] = None
    confidence_score: float = 0.95
    flagged_for_review: bool = False
    review_reason: Optional[str] = None

class CustodyEvent(BaseModel):
    id: str
    document_id: str
    timestamp: str
    action: str  # e.g., "COLLECTION", "SEIZURE", "FSL_TRANSFER", "VAULT_INGESTION", "VERIFIED", "COURT_SUBMISSION"
    actor_id: str
    actor_name: str
    actor_role: str
    actor_badge: str
    location: str
    notes: str
    digital_signature: str
    blockchain_tx_hash: str
    verified_status: bool = True

class Document(BaseModel):
    id: str
    title: str
    case_number: str
    document_type: DocumentTypeEnum
    uploaded_by: str
    uploader_name: str
    uploader_role: RoleEnum
    uploader_badge: str
    station: str
    district: str
    upload_timestamp: str
    file_name: str
    file_size_kb: float
    mime_type: str
    sha256_hash: str
    original_sha256: str
    is_tampered: bool = False
    blockchain_block_index: int
    blockchain_tx_hash: str
    encryption_algorithm: str = "AES-256-GCM"
    digital_signature: str
    public_key_fingerprint: str
    entities: ExtractedEntities
    raw_content: str
    encrypted_payload: str
    status: str = "COMMITTED"  # PENDING_REVIEW, COMMITTED, REJECTED
    confidentiality_level: str = "RESTRICTED"  # RESTRICTED, CONFIDENTIAL, TOP_SECRET
    custody_trail: List[CustodyEvent] = []

class BlockchainBlock(BaseModel):
    index: int
    timestamp: str
    document_id: str
    case_number: str
    document_type: str
    doc_sha256: str
    author_badge: str
    author_name: str
    digital_signature: str
    previous_hash: str
    hash: str
    nonce: int
    merkle_root: str

class AuditLogEntry(BaseModel):
    id: str
    timestamp: str
    event_type: str  # "UPLOAD", "VIEW", "DOWNLOAD", "VERIFICATION", "TAMPER_ALERT", "MFA_LOGIN", "ROLE_SWITCH", "TRANSFER"
    user_id: str
    user_name: str
    user_role: str
    user_badge: str
    ip_address: str
    document_id: Optional[str] = None
    case_number: Optional[str] = None
    details: str
    status: str = "SUCCESS"  # SUCCESS, WARNING, ALERT, BLOCKED
    severity: str = "INFO"   # INFO, LOW, MEDIUM, HIGH, CRITICAL

class AnomalyAlert(BaseModel):
    id: str
    timestamp: str
    alert_type: str  # "AFTER_HOURS_ACCESS", "BULK_DOWNLOAD_SPIKE", "HASH_INTEGRITY_MISMATCH", "UNRECOGNIZED_DEVICE", "CROSS_DISTRICT_PROBE"
    severity: str    # "MEDIUM", "HIGH", "CRITICAL"
    user_id: str
    user_name: str
    user_badge: str
    description: str
    evidence_target: Optional[str] = None
    suggested_action: str
    is_resolved: bool = False

class VerificationRequest(BaseModel):
    document_id: Optional[str] = None
    file_content: Optional[str] = None
    provided_hash: Optional[str] = None

class VerificationResponse(BaseModel):
    document_id: str
    file_name: str
    calculated_sha256: str
    blockchain_recorded_sha256: str
    blockchain_block_index: int
    blockchain_tx_hash: str
    is_valid: bool
    status: str  # "VERIFIED_AUTHENTIC", "TAMPERED_HASH_MISMATCH", "UNRECORDED_DOCUMENT"
    matched_at: str
    digital_signature_valid: bool
    signer_badge: str
    signer_name: str
    chain_of_custody_length: int
    alert_message: Optional[str] = None

class SearchQuery(BaseModel):
    query: str
    search_type: str = "ALL"  # "ALL", "KEYWORD", "SEMANTIC"
    case_number: Optional[str] = None
    document_type: Optional[str] = None
    station: Optional[str] = None
    limit: int = 20

class ReviewActionRequest(BaseModel):
    document_id: str
    action: str  # "APPROVE", "REJECT", "UPDATE"
    updated_entities: Optional[ExtractedEntities] = None
    notes: Optional[str] = None

class TamperSimulationRequest(BaseModel):
    document_id: str
    tamper_type: str  # "ALTER_TEXT", "CORRUPT_PAYLOAD", "REVERT_ORIGINAL"
    tampered_content: Optional[str] = None
