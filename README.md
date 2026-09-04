# NyayaVault

NyayaVault is a professional digital evidence vault for law-enforcement and judicial workflows. It combines encrypted document storage, AI-assisted entity extraction, role-based access control, chain-of-custody auditing, blockchain hash anchoring, tamper simulation, and Section 65B certificate generation.

> This repository contains a demonstration application. Do not use the built-in keys, demo accounts, or in-memory storage in production.

## Features

- Role-based access for police, forensic, senior officer, and administrator users
- AI-assisted document ingestion and extracted entities
- SHA-256 integrity checks with blockchain-style ledger anchoring
- Encrypted payload handling and digital signatures
- Searchable evidence vault with document detail views
- Chain-of-custody events and immutable audit logs
- Tamper verification and administrator anomaly monitoring
- Section 65B certificate generation and export workflows

## Project Layout

```text
SIH-2-Prot/
  backend/     FastAPI service and in-memory seed data
  frontend/    React + Vite web application
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm

## Run Locally

Open two terminals from the repository root.

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open the application at <http://localhost:5173/>. API documentation is available at <http://sih-2-prot.onrender.com>.

## Demo Access

Enter any demo username below, then use MFA code `123456`:

| Role | Username |
| --- | --- |
| Police officer | `sharma_police` |
| Forensic officer | `ananya_fsl` |
| Senior officer | `verma_sp` |
| Administrator | `admin_vikram` |

## Frontend Commands

Run these from `/frontend`:

```powershell
npm run dev       # Start the development server
npm run build     # Create a production build
npm run lint      # Run Oxlint
npm run preview   # Preview the production build
```

## API

The FastAPI service exposes authentication, document upload and search, verification, custody, audit, administration, and certificate endpoints under `/api`. Interactive OpenAPI documentation is available at `/docs` while the backend is running.

## Notes

- Application data is initialized in memory from `backend/seed_data.py` and resets when the backend restarts.
- The frontend currently targets `http://sih-2-prot.onrender.com` for API requests.
- Configure secure secrets, persistent storage, production CORS, authentication, and deployment controls before any real-world use.
