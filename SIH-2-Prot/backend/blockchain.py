import hashlib
import time
from datetime import datetime
from typing import List, Optional, Dict, Any

class Block:
    def __init__(
        self,
        index: int,
        timestamp: str,
        document_id: str,
        case_number: str,
        document_type: str,
        doc_sha256: str,
        author_badge: str,
        author_name: str,
        digital_signature: str,
        previous_hash: str,
        nonce: int = 0
    ):
        self.index = index
        self.timestamp = timestamp
        self.document_id = document_id
        self.case_number = case_number
        self.document_type = document_type
        self.doc_sha256 = doc_sha256
        self.author_badge = author_badge
        self.author_name = author_name
        self.digital_signature = digital_signature
        self.previous_hash = previous_hash
        self.nonce = nonce
        self.merkle_root = self.calculate_merkle_root()
        self.hash = self.calculate_hash()

    def calculate_merkle_root(self) -> str:
        """Calculates leaf hash for this block transaction."""
        leaf = f"{self.document_id}:{self.doc_sha256}:{self.digital_signature}"
        return hashlib.sha256(leaf.encode('utf-8')).hexdigest()

    def calculate_hash(self) -> str:
        """Calculates block header hash."""
        block_string = (
            f"{self.index}{self.timestamp}{self.document_id}{self.case_number}"
            f"{self.document_type}{self.doc_sha256}{self.author_badge}"
            f"{self.previous_hash}{self.nonce}{self.merkle_root}"
        )
        return hashlib.sha256(block_string.encode('utf-8')).hexdigest()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "document_id": self.document_id,
            "case_number": self.case_number,
            "document_type": self.document_type,
            "doc_sha256": self.doc_sha256,
            "author_badge": self.author_badge,
            "author_name": self.author_name,
            "digital_signature": self.digital_signature,
            "previous_hash": self.previous_hash,
            "hash": self.hash,
            "nonce": self.nonce,
            "merkle_root": self.merkle_root
        }

class BlockchainLedger:
    def __init__(self):
        self.chain: List[Block] = []
        self.create_genesis_block()

    def create_genesis_block(self):
        genesis_block = Block(
            index=0,
            timestamp="2024-01-01 00:00:00 UTC",
            document_id="GENESIS-NYAYAVAULT-ROOT",
            case_number="SYSTEM-ROOT-001",
            document_type="GENESIS_LEDGER_INIT",
            doc_sha256="0000000000000000000000000000000000000000000000000000000000000000",
            author_badge="GOV-IND-CCA-000",
            author_name="NyayaVault Root Authority",
            digital_signature="SIG-ROOT-GENESIS-IMMUTABLE-LEDGER",
            previous_hash="0000000000000000000000000000000000000000000000000000000000000000",
            nonce=1337
        )
        self.chain.append(genesis_block)

    @property
    def latest_block(self) -> Block:
        return self.chain[-1]

    def add_document_commitment(
        self,
        document_id: str,
        case_number: str,
        document_type: str,
        doc_sha256: str,
        author_badge: str,
        author_name: str,
        digital_signature: str,
        timestamp: Optional[str] = None
    ) -> Block:
        """
        Mints a new blockchain block committing the document's SHA-256 fingerprint.
        Raw file content is strictly NEVER written to the blockchain.
        """
        if not timestamp:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")

        new_index = len(self.chain)
        prev_hash = self.latest_block.hash
        
        # Simple proof-of-authority nonce
        nonce = int(hashlib.sha256(f"{new_index}:{timestamp}".encode()).hexdigest()[:6], 16) % 10000

        new_block = Block(
            index=new_index,
            timestamp=timestamp,
            document_id=document_id,
            case_number=case_number,
            document_type=document_type,
            doc_sha256=doc_sha256,
            author_badge=author_badge,
            author_name=author_name,
            digital_signature=digital_signature,
            previous_hash=prev_hash,
            nonce=nonce
        )

        self.chain.append(new_block)
        return new_block

    def verify_chain_integrity(self) -> bool:
        """Validates that all cryptographic block hashes match and chain is unbroken."""
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            prev = self.chain[i - 1]

            if current.hash != current.calculate_hash():
                return False
            if current.previous_hash != prev.hash:
                return False
        return True

    def find_block_by_doc_id(self, document_id: str) -> Optional[Block]:
        for block in self.chain:
            if block.document_id == document_id:
                return block
        return None

    def find_block_by_hash(self, doc_sha256: str) -> Optional[Block]:
        for block in self.chain:
            if block.doc_sha256.lower() == doc_sha256.lower():
                return block
        return None

    def get_ledger_stats(self) -> Dict[str, Any]:
        return {
            "total_blocks": len(self.chain),
            "latest_block_hash": self.latest_block.hash,
            "chain_valid": self.verify_chain_integrity(),
            "genesis_hash": self.chain[0].hash
        }

# Global Singleton Ledger Instance
global_ledger = BlockchainLedger()
