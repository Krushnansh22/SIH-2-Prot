import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from models import AuditLogEntry, AnomalyAlert, CustodyEvent, User

class CustodyAndAuditManager:
    def __init__(self):
        self.audit_logs: List[AuditLogEntry] = []
        self.anomaly_alerts: List[AnomalyAlert] = []

    def record_audit(
        self,
        event_type: str,
        user: User,
        details: str,
        ip_address: str = "10.42.18.91 (Intranet-SecureVPN)",
        document_id: Optional[str] = None,
        case_number: Optional[str] = None,
        status: str = "SUCCESS",
        severity: str = "INFO"
    ) -> AuditLogEntry:
        """Records an immutable audit event."""
        log_entry = AuditLogEntry(
            id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
            event_type=event_type,
            user_id=user.id,
            user_name=user.full_name,
            user_role=user.role.value,
            user_badge=user.badge_number,
            ip_address=ip_address,
            document_id=document_id,
            case_number=case_number,
            details=details,
            status=status,
            severity=severity
        )
        self.audit_logs.insert(0, log_entry)  # Newest first
        return log_entry

    def raise_anomaly_alert(
        self,
        alert_type: str,
        user: User,
        description: str,
        severity: str = "HIGH",
        evidence_target: Optional[str] = None,
        suggested_action: str = "Isolate session token and notify District SP"
    ) -> AnomalyAlert:
        """Triggers a high-priority anomalous security alert."""
        alert = AnomalyAlert(
            id=f"ALRT-{uuid.uuid4().hex[:6].upper()}",
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
            alert_type=alert_type,
            severity=severity,
            user_id=user.id,
            user_name=user.full_name,
            user_badge=user.badge_number,
            description=description,
            evidence_target=evidence_target,
            suggested_action=suggested_action,
            is_resolved=False
        )
        self.anomaly_alerts.insert(0, alert)
        
        # Also record in audit log as high severity
        self.record_audit(
            event_type="TAMPER_ALERT" if "HASH" in alert_type else "ANOMALY_TRIGGER",
            user=user,
            details=f"SECURITY FLAG: {description}",
            status="ALERT",
            severity="CRITICAL" if severity == "CRITICAL" else "HIGH",
            document_id=evidence_target
        )
        return alert

    def create_default_custody_trail(
        self,
        document_id: str,
        case_number: str,
        uploader_name: str,
        uploader_badge: str,
        uploader_role: str,
        station: str,
        doc_hash: str,
        tx_hash: str,
        created_date: str = "2024-05-14 10:30:00"
    ) -> List[CustodyEvent]:
        """Builds a realistic court-admissible chain of custody sequence."""
        events = [
            CustodyEvent(
                id=f"CST-101-{uuid.uuid4().hex[:4]}",
                document_id=document_id,
                timestamp=f"{created_date} IST",
                action="COLLECTION_AND_SEIZURE",
                actor_id="usr-io-01",
                actor_name="SI Arvind Patil",
                actor_role="Investigating Officer",
                actor_badge="IO-3312",
                location=f"Scene of Incident / {station}",
                notes="Physical evidence secured in tamper-evident sealed evidence bag #EB-9942.",
                digital_signature=f"SIG-ECDSA-{uuid.uuid4().hex[:32].upper()}",
                blockchain_tx_hash=tx_hash,
                verified_status=True
            ),
            CustodyEvent(
                id=f"CST-102-{uuid.uuid4().hex[:4]}",
                document_id=document_id,
                timestamp="2024-05-14 14:15:00 IST",
                action="FSL_DISPATCH_TRANSFER",
                actor_id="usr-courier-01",
                actor_name="Head Constable M. Shinde",
                actor_role="Evidence Custodian",
                actor_badge="HC-5541",
                location="Evidence Locker Room -> State FSL Transit",
                notes="Handover completed under Road Certificate #RC-4418. Seal intact.",
                digital_signature=f"SIG-ECDSA-{uuid.uuid4().hex[:32].upper()}",
                blockchain_tx_hash=tx_hash,
                verified_status=True
            ),
            CustodyEvent(
                id=f"CST-103-{uuid.uuid4().hex[:4]}",
                document_id=document_id,
                timestamp="2024-05-15 09:40:00 IST",
                action="VAULT_INGESTION_AND_BLOCKCHAIN_ANCHOR",
                actor_id="usr-ingest",
                actor_name=uploader_name,
                actor_role=uploader_role,
                actor_badge=uploader_badge,
                location=f"NyayaVault Node @ {station}",
                notes=f"Document OCR extracted, AES-256 encrypted, and SHA-256 ({doc_hash[:16]}...) committed to Blockchain.",
                digital_signature=f"SIG-ECDSA-{uuid.uuid4().hex[:32].upper()}",
                blockchain_tx_hash=tx_hash,
                verified_status=True
            ),
            CustodyEvent(
                id=f"CST-104-{uuid.uuid4().hex[:4]}",
                document_id=document_id,
                timestamp="2024-05-16 11:20:00 IST",
                action="JUDICIAL_SUBMISSION_PREVIEW",
                actor_id="usr-court",
                actor_name="Registrar P. Kulkarni",
                actor_role="Sessions Court Officer",
                actor_badge="CRT-8802",
                location="Hon'ble Sessions Court No. 4, City Civil Court",
                notes="Electronic record Section 65B compliance verification completed successfully.",
                digital_signature=f"SIG-ECDSA-{uuid.uuid4().hex[:32].upper()}",
                blockchain_tx_hash=tx_hash,
                verified_status=True
            )
        ]
        return events

# Global Custody and Audit Singleton
global_audit_manager = CustodyAndAuditManager()
