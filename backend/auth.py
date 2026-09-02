import hmac
import hashlib
import json
import base64
import time
from typing import Optional, Dict, List
from fastapi import HTTPException, Header, Depends
from models import User, RoleEnum

SECRET_KEY = "NYAYAVAULT_SUPER_SECRET_JWT_SIGNING_KEY_2024"

DEMO_USERS: Dict[str, User] = {
    "police": User(
        id="usr-police-01",
        username="sharma_police",
        full_name="Inspector Ramesh Sharma",
        badge_number="POL-4920",
        role=RoleEnum.POLICE_OFFICER,
        station="Central Cyber Crime PS",
        district="Mumbai Central Division",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        mfa_enabled=True,
        permissions=["DOC_UPLOAD", "DOC_VIEW_ASSIGNED", "REQUEST_VERIFICATION", "EXPORT_REPORT"]
    ),
    "forensic": User(
        id="usr-fsl-02",
        username="ananya_fsl",
        full_name="Dr. Ananya Roy (Senior Scientific Officer)",
        badge_number="FSL-8190",
        role=RoleEnum.FORENSIC_OFFICER,
        station="State Forensic Science Laboratory (FSL)",
        district="Ballistics & Chemical Division",
        avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        mfa_enabled=True,
        permissions=["DOC_UPLOAD_FORENSIC", "DOC_VIEW_FSL", "SIGN_EVIDENCE", "ADD_BALLISTICS_DATA"]
    ),
    "senior": User(
        id="usr-sp-03",
        username="verma_sp",
        full_name="SP Rajesh Verma, IPS",
        badge_number="IPS-1044",
        role=RoleEnum.SENIOR_OFFICER,
        station="District Police Headquarters",
        district="Mumbai Metropolitan Zone",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        mfa_enabled=True,
        permissions=["DOC_VIEW_ALL_DISTRICT", "APPROVE_FLAGGED_AI", "AUTHORIZE_TRANSFERS", "VIEW_SECURITY_ALERTS"]
    ),
    "admin": User(
        id="usr-admin-04",
        username="admin_vikram",
        full_name="Vikram Aditya (Cyber Cell Director)",
        badge_number="ADM-007",
        role=RoleEnum.ADMINISTRATOR,
        station="Central Police IT Command",
        district="State Cyber Security Grid",
        avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        mfa_enabled=True,
        permissions=["ALL_SYSTEM_ACCESS", "AUDIT_LOG_EXPORT", "TAMPER_MONITORING", "USER_ROLE_MANAGEMENT", "LEDGER_MAINTENANCE"]
    )
}

def create_jwt_token(user: User, mfa_verified: bool = True) -> str:
    """Generates a secure HMAC-SHA256 signed JWT token."""
    header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode().rstrip("=")
    payload_data = {
        "sub": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "badge": user.badge_number,
        "role": user.role.value,
        "station": user.station,
        "district": user.district,
        "mfa_verified": mfa_verified,
        "exp": int(time.time()) + 86400  # 24h
    }
    payload = base64.urlsafe_b64encode(json.dumps(payload_data).encode()).decode().rstrip("=")
    sig_raw = hmac.new(SECRET_KEY.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()
    sig = base64.urlsafe_b64encode(sig_raw).decode().rstrip("=")
    return f"{header}.{payload}.{sig}"

def decode_jwt_token(token: str) -> Optional[Dict]:
    """Validates and decodes JWT token."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header, payload, sig = parts
        expected_sig_raw = hmac.new(SECRET_KEY.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()
        expected_sig = base64.urlsafe_b64encode(expected_sig_raw).decode().rstrip("=")
        if not hmac.compare_digest(sig, expected_sig):
            return None
        
        # Add padding back for b64decode
        payload_padded = payload + "=" * (-len(payload) % 4)
        data = json.loads(base64.urlsafe_b64decode(payload_padded.encode()).decode())
        if data.get("exp", 0) < int(time.time()):
            return None
        return data
    except Exception:
        return None

def get_current_user(authorization: Optional[str] = Header(None)) -> User:
    """Dependency injection to authenticate incoming requests."""
    if not authorization or not authorization.startswith("Bearer "):
        # Default fallback to police officer for frictionless prototype exploration if unauthenticated
        return DEMO_USERS["police"]

    token = authorization.split(" ")[1]
    decoded = decode_jwt_token(token)
    if not decoded:
        return DEMO_USERS["police"]

    for u in DEMO_USERS.values():
        if u.id == decoded.get("sub") or u.username == decoded.get("username"):
            return u

    return DEMO_USERS["police"]

def check_permission(user: User, required_permission: str) -> bool:
    """RBAC / ABAC checker."""
    if user.role == RoleEnum.ADMINISTRATOR:
        return True
    return required_permission in user.permissions
