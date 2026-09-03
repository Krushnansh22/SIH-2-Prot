from typing import List, Dict
from models import Document, DocumentTypeEnum, ExtractedEntities, RoleEnum, AnomalyAlert, AuditLogEntry
from crypto_vault import compute_sha256, encrypt_payload_aes256_gcm, generate_digital_signature
from blockchain import global_ledger
from custody_and_audit import global_audit_manager
from auth import DEMO_USERS

RAW_DOCS = [
    {
        "id": "DOC-FIR-8842",
        "title": "First Information Report (FIR #8842/2024) - Cyber Extortion",
        "case_number": "CR-2024-8842",
        "doc_type": DocumentTypeEnum.FIR,
        "file_name": "FIR_8842_Cyber_Extortion_Malhotra.pdf",
        "file_size_kb": 248.5,
        "station": "Central Cyber Crime PS",
        "district": "Mumbai Central Division",
        "uploaded_by": "usr-police-01",
        "uploader_name": "Inspector Ramesh Sharma",
        "uploader_role": RoleEnum.POLICE_OFFICER,
        "uploader_badge": "POL-4920",
        "upload_timestamp": "2024-05-14 10:30:00",
        "raw_content": """FIRST INFORMATION REPORT (Under Section 154 Cr.P.C / BNSS)
Police Station: Central Cyber Crime PS | District: Mumbai Central
FIR No: 8842/2024 | Date & Time of FIR: 14/05/2024 at 10:15 hrs
Case Reference: CR-2024-8842

1. Complainant / Informant:
   Name: Rohit Sen s/o S.K. Sen, Age: 38 yrs, Occupation: VP FinTech Solutions.
   Address: Flat 402, Sea Breeze Heights, Worli, Mumbai.

2. Details of Known / Suspected / Unknown Accused with Full Particulars:
   Accused Name: Vicky Malhotra @ Goldy, along with unidentified associates operating Darknet syndicate 'ShadowRansom'.

3. Act and Sections:
   - Section 420 IPC (Cheating and dishonestly inducing delivery of property)
   - Section 384 IPC (Punishment for Extortion)
   - Section 66D Information Technology Act (Cheating by personation by using computer resource)
   - Section 43/66 IT Act (Data theft & unauthorized system access)

4. Brief Facts of the Incident:
   The complainant reported that on 10/05/2024, the corporate servers of his fintech company received ransomware infection locking financial ledgers. Ransom demand of 4.5 Bitcoin (approx INR 2.3 Crores) was demanded via encrypted ProtonMail. Forensic IP trace identified IP 185.220.101.5 routed via Tor gateway with physical payout link linked to accused Vicky Malhotra's cold wallet address 0x9B2a...44C1. Immediate seizure of digital evidence and server snapshot was conducted.

Investigating Officer: Inspector Ramesh Sharma (Badge: POL-4920)
Status: FIR Registered, Evidence Enclosed for FSL Examination."""
    },
    {
        "id": "DOC-FSL-8842",
        "title": "Digital Forensic FSL Report - Cold Wallet & Server Logs",
        "case_number": "CR-2024-8842",
        "doc_type": DocumentTypeEnum.FORENSIC_REPORT,
        "file_name": "FSL_Report_ColdWallet_IP_Log_Analysis.pdf",
        "file_size_kb": 512.0,
        "station": "State Forensic Science Laboratory (FSL)",
        "district": "Ballistics & Chemical Division",
        "uploaded_by": "usr-fsl-02",
        "uploader_name": "Dr. Ananya Roy (Senior Scientific Officer)",
        "uploader_role": RoleEnum.FORENSIC_OFFICER,
        "uploader_badge": "FSL-8190",
        "upload_timestamp": "2024-05-18 16:45:00",
        "raw_content": """STATE FORENSIC SCIENCE LABORATORY (FSL)
CYBER & DIGITAL FORENSICS DIVISION
Examination Report No: FSL/CYB/2024/4911
Reference: Forwarding Memo No. 8842/CCPS dated 14/05/2024

Case No: CR-2024-8842 | Police Station: Central Cyber Crime PS
Subject: Forensic Analysis of Seized Hard Disk Drive (Exhibit 1) and Ledger Nano X Hardware Wallet (Exhibit 2).

EXAMINATION METHODOLOGY & FINDINGS:
1. Physical Evidence Condition:
   The parcel was received sealed with police seal bearing impression 'INSP-CCPS'. Seals were found intact.
   
2. Bit-Stream Forensic Imaging:
   Bit-stream duplicate image was created using Tableau Forensic Imager TD3.
   Original SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
   
3. Analysis Findings:
   - Hardware cold wallet contained private keys for Ethereum and Bitcoin addresses receiving illicit extortion inflows.
   - Deleted log files recovered from RAM dump revealed VPN session originating from MAC address corresponding to suspect's Lenovo ThinkPad.
   - Trojan downloader payload matches known ransomware variant 'CrypLock-v4'.

CONCLUSION:
Forensic analysis establishes direct cryptographic and physical link between the extortion communication and suspect Vicky Malhotra's hardware devices.

Dr. Ananya Roy, Senior Scientific Officer (Digital Forensics), FSL."""
    },
    {
        "id": "DOC-BAL-9102",
        "title": "Ballistics & Firearm Trajectory Report (9mm Projectile)",
        "case_number": "CR-2024-9102",
        "doc_type": DocumentTypeEnum.BALLISTICS_REPORT,
        "file_name": "Ballistics_Trajectory_9mm_Striation_Report.pdf",
        "file_size_kb": 380.2,
        "station": "State Forensic Science Laboratory (FSL)",
        "district": "Ballistics & Chemical Division",
        "uploaded_by": "usr-fsl-02",
        "uploader_name": "Dr. Ananya Roy (Senior Scientific Officer)",
        "uploader_role": RoleEnum.FORENSIC_OFFICER,
        "uploader_badge": "FSL-8190",
        "upload_timestamp": "2024-05-20 11:10:00",
        "raw_content": """STATE FORENSIC SCIENCE LABORATORY - BALLISTICS DIVISION
Report Ref: FSL/BAL/9102/2024 | Case: CR-2024-9102
Police Station: Indiranagar Police Station

EXHIBITS RECEIVED:
Exhibit B/1: One fired 9mm Parabellum spent cartridge case recovered from scene of crime near river bank.
Exhibit B/2: One country-made semi-automatic pistol (marked .32/9mm modified) seized from suspect.

LABORATORY MICROSCOPIC EXAMINATION:
1. Striation Line Analysis:
   Comparison microscope examination reveals 6 lands and 6 grooves with right-hand twist (rifling mark angle 8.5 degrees).
2. Firing Pin Impression:
   The firing pin indentation and breach face marks on the primer of Exhibit B/1 match identically with test cartridges fired in the ballistic water recovery tank from Exhibit B/2.
3. Gunshot Residue (GSR):
   Presence of Lead, Barium, and Antimony detected on suspect's right hand swab using SEM-EDX.

CONCLUSION:
Exhibit B/1 cartridge was conclusively fired from the seized weapon Exhibit B/2.

Dr. Ananya Roy, SSO Ballistics."""
    },
    {
        "id": "DOC-CS-8842",
        "title": "Final Investigation Charge Sheet u/s 173 CrPC",
        "case_number": "CR-2024-8842",
        "doc_type": DocumentTypeEnum.CHARGE_SHEET,
        "file_name": "Charge_Sheet_173_State_vs_Vicky_Malhotra.pdf",
        "file_size_kb": 420.8,
        "station": "Central Cyber Crime PS",
        "district": "Mumbai Central Division",
        "uploaded_by": "usr-police-01",
        "uploader_name": "Inspector Ramesh Sharma",
        "uploader_role": RoleEnum.POLICE_OFFICER,
        "uploader_badge": "POL-4920",
        "upload_timestamp": "2024-05-25 14:00:00",
        "raw_content": """IN THE COURT OF CHIEF METROPOLITAN MAGISTRATE, MUMBAI
FINAL REPORT / CHARGE SHEET UNDER SECTION 173 Cr.P.C (BNSS SEC 193)
Case: State of Maharashtra vs. Vicky Malhotra @ Goldy | Case Ref: CR-2024-8842
Police Station: Central Cyber Crime PS | FIR No: 8842/2024

Accused Sent for Trial:
1. Vicky Malhotra s/o Jagdish Malhotra, Age: 34 yrs (In Judicial Custody)
Offenses Charged: IPC 420, 384, 120B, read with IT Act Sections 43, 66, 66D.

PROSECUTION EVIDENCE ENCLOSED:
1. FIR No. 8842/2024 dated 14/05/2024.
2. Statement of Complainant Rohit Sen u/s 161 CrPC.
3. Seizure Panchnama of Lenovo Laptop and Ledger Nano X.
4. FSL Digital Forensic Expert Report #4911 conclusively matching crypto trail.
5. Section 65B Electronic Evidence Certificate from NyayaVault.

PRAYER:
Sufficient evidence having been gathered, accused is placed before the Court for framing of charges and expeditious trial.

Investigating Officer: Inspector Ramesh Sharma | Endorsed by: SP Rajesh Verma, IPS"""
    },
    {
        "id": "DOC-SEIZ-9102",
        "title": "Evidence Seizure Panchnama & Chain of Custody Memo",
        "case_number": "CR-2024-9102",
        "doc_type": DocumentTypeEnum.SEIZURE_MEMO,
        "file_name": "Seizure_Memo_Pistol_Magazine_Panchnama.pdf",
        "file_size_kb": 185.0,
        "station": "Indiranagar Police Station",
        "district": "Mumbai North Zone",
        "uploaded_by": "usr-police-01",
        "uploader_name": "Inspector Ramesh Sharma",
        "uploader_role": RoleEnum.POLICE_OFFICER,
        "uploader_badge": "POL-4920",
        "upload_timestamp": "2024-05-19 08:30:00",
        "raw_content": """SEIZURE PANCHNAMA / RECOVERY MEMO
Date: 19/05/2024 | Time: 07:45 hrs | Case: CR-2024-9102
Place: Under culvert bridge, Mithi River Edge, Indiranagar PS limits.

Panch Witnesses:
1. Mahendra K. Gokhale, Shopkeeper, Indiranagar.
2. Suresh Deshmukh, Civil Engineer, Indiranagar.

Description of Articles Recovered & Seized:
- One country-made 9mm semi-automatic pistol with wooden grip, overall length 19cm.
- One metal magazine containing 3 live 9mm rounds with headstamp 'KF 2022'.
- Weapon was packed in polyethylene sleeve and sealed with brass seal 'POL-INDIRA-PS'.

Signatures of Panchas and IO recorded on spot."""
    },
    {
        "id": "DOC-PM-5412",
        "title": "Post-Mortem Autopsy Examination Report",
        "case_number": "CR-2024-5412",
        "doc_type": DocumentTypeEnum.POST_MORTEM,
        "file_name": "PostMortem_Report_Autopsy_Case5412.pdf",
        "file_size_kb": 310.4,
        "station": "Marine Drive Police Station",
        "district": "Mumbai South Zone",
        "uploaded_by": "usr-fsl-02",
        "uploader_name": "Dr. Ananya Roy (Senior Scientific Officer)",
        "uploader_role": RoleEnum.FORENSIC_OFFICER,
        "uploader_badge": "FSL-8190",
        "upload_timestamp": "2024-05-12 18:00:00",
        "raw_content": """MUNICIPAL MEDICAL COLLEGE & HOSPITAL - FORENSIC MEDICINE DEPT
POST-MORTEM EXAMINATION REPORT #PM-2024/1108
Case Ref: CR-2024-5412 | Police Station: Marine Drive PS
Deceased: Unknown Male, Age approx 40-45 years | Date of Autopsy: 12/05/2024

EXTERNAL EXAMINATION & INJURIES:
1. Ligature mark around neck: 22cm x 1.5cm above thyroid cartilage, parchmentized base with ecchymoses.
2. Ante-mortem contusion 4cm x 2cm on right temporal scalp region.
3. Petechial hemorrhages visible in palpebral conjunctivae.

INTERNAL FINDINGS:
Lungs severely congested and edematous. Hyoid bone intact. Stomach contained 150ml semi-digested food without abnormal odor. Viscera preserved and dispatched to FSL for toxicological screening.

OPINION AS TO CAUSE OF DEATH:
Death occurred due to Asphyxia resulting from mechanical ligature strangulation. Time since death estimated between 18 to 24 hours prior to autopsy.

Dr. S. K. Mahajan, MD (Forensic Medicine) | Forwarded by Dr. Ananya Roy, FSL."""
    },
    {
        "id": "DOC-FLAG-7721",
        "title": "Smudged Hand-Written Complaint (Pending Human Review)",
        "case_number": "CR-2024-7721",
        "doc_type": DocumentTypeEnum.FIR,
        "file_name": "Handwritten_Smudged_Complaint_Station7721.pdf",
        "file_size_kb": 140.0,
        "station": "Dharavi Police Station",
        "district": "Mumbai Central Division",
        "uploaded_by": "usr-police-01",
        "uploader_name": "Inspector Ramesh Sharma",
        "uploader_role": RoleEnum.POLICE_OFFICER,
        "uploader_badge": "POL-4920",
        "upload_timestamp": "2024-05-26 09:15:00",
        "raw_content": """[SCANNED HANDWRITTEN ROUGH COMPLAINT]
To, The Senior Police Inspector, Dharavi PS, Mumbai.
Dated: 25-05-2024
Subject: Complaint regarding robbery of cash and gold chain near 90 Feet Road.

Sir,
I, [unclear smudge] resident of transit camp, state that yesterday evening at 8:30 PM two boys on black Pulsar motorcycle bearing partial number MH-01- [smudged] intercepted me and snatched gold chain weighing 24 grams and cash Rs 15,000/- at knife point. Accused suspect names mentioned locally as [unclear / low OCR resolution: B...b...u].

Please register FIR and take action."""
    }
]

def initialize_seed_database() -> Dict[str, Document]:
    """Populates initial seed documents, blockchain blocks, custody trails, and audit records."""
    vault_db: Dict[str, Document] = {}

    for item in RAW_DOCS:
        raw_text = item["raw_content"]
        sha256_hash = compute_sha256(raw_text)
        b64_enc, _ = encrypt_payload_aes256_gcm(raw_text)
        sig, pk_fpr = generate_digital_signature(sha256_hash, item["uploader_badge"], item["upload_timestamp"])

        # Determine confidence & flagging
        is_flagged = item["id"] == "DOC-FLAG-7721"
        confidence = 0.72 if is_flagged else 0.96
        review_reason = "Low OCR clarity and smudged handwritten suspect name. Requires Senior Officer review." if is_flagged else None

        # Build extracted entities
        entities = ExtractedEntities(
            case_number=item["case_number"],
            fir_number=f"FIR/{item['case_number']}",
            police_station=item["station"],
            date_of_incident="2024-05-10",
            complainant="Rohit Sen / State Informant" if "8842" in item["id"] else "State of Maharashtra",
            accused="Vicky Malhotra @ Goldy" if "8842" in item["id"] else "Unknown Suspects",
            penal_sections=["IPC 420", "IPC 384", "IT ACT 66D"] if "8842" in item["id"] else ["ARMS ACT 25/27", "IPC 307"],
            investigating_officer="Inspector Ramesh Sharma",
            evidence_type=item["doc_type"].value,
            key_findings=f"Verified electronic evidence for {item['doc_type'].value} under {item['case_number']}.",
            confidence_score=confidence,
            flagged_for_review=is_flagged,
            review_reason=review_reason
        )

        # Commit SHA-256 hash to Blockchain ledger
        block = global_ledger.add_document_commitment(
            document_id=item["id"],
            case_number=item["case_number"],
            document_type=item["doc_type"].value,
            doc_sha256=sha256_hash,
            author_badge=item["uploader_badge"],
            author_name=item["uploader_name"],
            digital_signature=sig,
            timestamp=item["upload_timestamp"]
        )

        # Build custody trail
        custody = global_audit_manager.create_default_custody_trail(
            document_id=item["id"],
            case_number=item["case_number"],
            uploader_name=item["uploader_name"],
            uploader_badge=item["uploader_badge"],
            uploader_role=item["uploader_role"].value,
            station=item["station"],
            doc_hash=sha256_hash,
            tx_hash=block.hash,
            created_date=item["upload_timestamp"].split(" ")[0]
        )

        doc = Document(
            id=item["id"],
            title=item["title"],
            case_number=item["case_number"],
            document_type=item["doc_type"],
            uploaded_by=item["uploaded_by"],
            uploader_name=item["uploader_name"],
            uploader_role=item["uploader_role"],
            uploader_badge=item["uploader_badge"],
            station=item["station"],
            district=item["district"],
            upload_timestamp=item["upload_timestamp"],
            file_name=item["file_name"],
            file_size_kb=item["file_size_kb"],
            mime_type="application/pdf",
            sha256_hash=sha256_hash,
            original_sha256=sha256_hash,
            is_tampered=False,
            blockchain_block_index=block.index,
            blockchain_tx_hash=block.hash,
            encryption_algorithm="AES-256-GCM",
            digital_signature=sig,
            public_key_fingerprint=pk_fpr,
            entities=entities,
            raw_content=raw_text,
            encrypted_payload=b64_enc,
            status="PENDING_REVIEW" if is_flagged else "COMMITTED",
            confidentiality_level="CONFIDENTIAL" if "8842" in item["id"] else "RESTRICTED",
            custody_trail=custody
        )

        vault_db[doc.id] = doc

        # Record initial audit entry
        global_audit_manager.record_audit(
            event_type="UPLOAD",
            user=DEMO_USERS["police" if "police" in item["uploaded_by"] else "forensic"],
            details=f"Securely uploaded & AES-256 encrypted '{item['title']}' (Block #{block.index})",
            document_id=doc.id,
            case_number=doc.case_number,
            status="SUCCESS",
            severity="INFO"
        )

    # Pre-seed initial realistic anomalous security alerts
    global_audit_manager.raise_anomaly_alert(
        alert_type="AFTER_HOURS_ACCESS",
        user=DEMO_USERS["police"],
        description="After-hours vault decrypt operation detected at 02:47 AM from external IP 103.21.14.88.",
        severity="MEDIUM",
        evidence_target="DOC-FIR-8842",
        suggested_action="Verify officer on-duty roster log with Station Duty Officer."
    )

    global_audit_manager.raise_anomaly_alert(
        alert_type="BULK_DOWNLOAD_SPIKE",
        user=DEMO_USERS["police"],
        description="Rapid export trigger of 8 confidential case files within 45 seconds detected.",
        severity="HIGH",
        evidence_target="CR-2024-8842",
        suggested_action="Review officer download credentials and require senior SP 2FA approval."
    )

    return vault_db
