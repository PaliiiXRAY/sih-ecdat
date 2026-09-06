"""
Post-Quantum Cryptography (PQC) Remediation & Migration Engine for SIH26164 ECDAT
Maps vulnerable cryptographic primitives to NIST-standardized Post-Quantum replacements.

NIST PQC Standards (Finalized August 2024):
  - ML-KEM (CRYSTALS-Kyber): Key Encapsulation Mechanism (replaces RSA/DH key exchange)
  - ML-DSA (CRYSTALS-Dilithium): Digital Signature Algorithm (replaces RSA/ECDSA signatures)
  - SLH-DSA (SPHINCS+): Stateless Hash-Based Signatures (backup for ML-DSA)
  - FN-DSA (FALCON): Fast Compact Signatures (standardized 2025)
"""

PQC_RECOMMENDATIONS = {
    "RSA": {
        "pqc_replacement": "ML-KEM-768 (CRYSTALS-Kyber) for encryption; ML-DSA-65 (CRYSTALS-Dilithium) for signatures",
        "nist_standard": "FIPS 203 (ML-KEM) / FIPS 204 (ML-DSA)",
        "migration_priority": "IMMEDIATE",
        "code_before": '''from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.asymmetric import padding

# VULNERABLE: RSA-2048 Key Generation
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048
)
# Sign with RSA
signature = private_key.sign(message, padding.PKCS1v15(), hashes.SHA256())''',
        "code_after": '''# POST-QUANTUM SAFE: ML-KEM-768 (Kyber) + ML-DSA-65 (Dilithium)
# Using liboqs-python (Open Quantum Safe Project)
import oqs

# Key Encapsulation (replaces RSA encryption)
kem = oqs.KeyEncapsulation("ML-KEM-768")
public_key_kem = kem.generate_keypair()
ciphertext, shared_secret = kem.encap_secret(public_key_kem)

# Digital Signature (replaces RSA signing)
signer = oqs.Signature("ML-DSA-65")
public_key_sig = signer.generate_keypair()
signature = signer.sign(message)
is_valid = signer.verify(message, signature, public_key_sig)''',
        "libraries": ["liboqs-python (Open Quantum Safe)", "pqcrypto", "oqs-provider for OpenSSL 3.x"],
        "references": ["NIST FIPS 203", "NIST FIPS 204", "https://openquantumsafe.org"]
    },

    "ECC": {
        "pqc_replacement": "ML-KEM-768 (CRYSTALS-Kyber) for ECDH; ML-DSA-65 (CRYSTALS-Dilithium) for ECDSA",
        "nist_standard": "FIPS 203 (ML-KEM) / FIPS 204 (ML-DSA)",
        "migration_priority": "IMMEDIATE",
        "code_before": '''from cryptography.hazmat.primitives.asymmetric import ec

# VULNERABLE: ECDSA P-256 Signature
private_key = ec.generate_private_key(ec.SECP256R1())
signature = private_key.sign(data, ec.ECDSA(hashes.SHA256()))''',
        "code_after": '''# POST-QUANTUM SAFE: ML-DSA-65 (Dilithium) Signature
import oqs

signer = oqs.Signature("ML-DSA-65")
public_key = signer.generate_keypair()
signature = signer.sign(data)
is_valid = signer.verify(data, signature, public_key)''',
        "libraries": ["liboqs-python", "pqcrypto"],
        "references": ["NIST FIPS 204"]
    },

    "DH": {
        "pqc_replacement": "ML-KEM-768 (CRYSTALS-Kyber) Key Encapsulation Mechanism",
        "nist_standard": "FIPS 203 (ML-KEM)",
        "migration_priority": "IMMEDIATE",
        "code_before": '''# VULNERABLE: Classical Diffie-Hellman
from cryptography.hazmat.primitives.asymmetric import dh
parameters = dh.generate_parameters(generator=2, key_size=2048)
private_key = parameters.generate_private_key()
shared_key = private_key.exchange(peer_public_key)''',
        "code_after": '''# POST-QUANTUM SAFE: ML-KEM-768 Key Encapsulation
import oqs

kem = oqs.KeyEncapsulation("ML-KEM-768")
public_key = kem.generate_keypair()
ciphertext, shared_secret = kem.encap_secret(public_key)
# Peer decapsulates:
# shared_secret = kem.decap_secret(ciphertext)''',
        "libraries": ["liboqs-python"],
        "references": ["NIST FIPS 203"]
    },

    "AES": {
        "pqc_replacement": "Upgrade to AES-256-GCM (retains 128-bit post-quantum security via Grover's bound)",
        "nist_standard": "NIST SP 800-38D (GCM); No PQC replacement needed for AES-256",
        "migration_priority": "MODERATE",
        "code_before": '''# WEAKENED: AES-128 (64-bit effective security under Grover's)
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
cipher = Cipher(algorithms.AES(key_128bit), modes.CBC(iv))''',
        "code_after": '''# QUANTUM-RESILIENT: AES-256-GCM (128-bit post-quantum security)
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
key = AESGCM.generate_key(bit_length=256)  # 256-bit key
aesgcm = AESGCM(key)
ciphertext = aesgcm.encrypt(nonce, plaintext, associated_data)''',
        "libraries": ["cryptography (Python)", "javax.crypto (Java)", "crypto (Node.js)"],
        "references": ["NIST SP 800-38D"]
    },

    "3DES": {
        "pqc_replacement": "Replace with AES-256-GCM immediately",
        "nist_standard": "NIST SP 800-131A Rev.2 (3DES Deprecated 2023)",
        "migration_priority": "IMMEDIATE",
        "code_before": '''# DEPRECATED: Triple-DES
from Crypto.Cipher import DES3
cipher = DES3.new(key, DES3.MODE_CBC, iv)''',
        "code_after": '''# MODERN: AES-256-GCM
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
key = AESGCM.generate_key(bit_length=256)
aesgcm = AESGCM(key)
ct = aesgcm.encrypt(nonce, plaintext, aad)''',
        "libraries": ["cryptography"],
        "references": ["NIST SP 800-131A Rev.2"]
    },

    "DES": {
        "pqc_replacement": "Replace with AES-256-GCM immediately (DES is trivially broken)",
        "nist_standard": "Withdrawn from all standards",
        "migration_priority": "EMERGENCY",
        "code_before": "# BROKEN: DES (56-bit key, brute-forced since 1998)",
        "code_after": "# Use AES-256-GCM as shown in AES recommendation above",
        "libraries": ["cryptography"],
        "references": ["NIST SP 800-67 Rev.2 (Withdrawn)"]
    },

    "HASH": {
        "pqc_replacement": "Replace MD5/SHA-1 with SHA-256 or SHA-3-256 (quantum-resilient hash)",
        "nist_standard": "NIST FIPS 180-4 (SHA-2) / FIPS 202 (SHA-3)",
        "migration_priority": "HIGH (for MD5/SHA-1), NONE (for SHA-256+)",
        "code_before": '''# BROKEN: MD5 Hash
import hashlib
digest = hashlib.md5(data).hexdigest()''',
        "code_after": '''# QUANTUM-RESILIENT: SHA-256
import hashlib
digest = hashlib.sha256(data).hexdigest()
# Or SHA-3:
digest = hashlib.sha3_256(data).hexdigest()''',
        "libraries": ["hashlib (Python stdlib)", "java.security.MessageDigest"],
        "references": ["NIST FIPS 180-4", "NIST FIPS 202"]
    },

    "HMAC": {
        "pqc_replacement": "Ensure HMAC uses SHA-256+ with 256-bit keys (already quantum-resilient)",
        "nist_standard": "NIST SP 800-107 Rev.1",
        "migration_priority": "LOW",
        "code_before": "# HMAC with SHA-1 key derivation",
        "code_after": "# HMAC-SHA256 with 256-bit key (quantum-safe)",
        "libraries": ["hmac (Python stdlib)"],
        "references": ["NIST SP 800-107"]
    },

    "TLS": {
        "pqc_replacement": "Upgrade to TLS 1.3 with hybrid PQC key exchange (X25519+ML-KEM-768)",
        "nist_standard": "IETF RFC 8446 (TLS 1.3) + draft-ietf-tls-hybrid-design",
        "migration_priority": "HIGH",
        "code_before": '''# DEPRECATED: TLS 1.0
import ssl
ctx = ssl.SSLContext(ssl.PROTOCOL_TLSv1)''',
        "code_after": '''# MODERN: TLS 1.3 with PQC hybrid
import ssl
ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
ctx.minimum_version = ssl.TLSVersion.TLSv1_3
# For PQC hybrid: Use oqs-provider with OpenSSL 3.x
# ctx.set_ciphers("TLS_AES_256_GCM_SHA384:X25519MLKEM768")''',
        "libraries": ["ssl (Python)", "oqs-provider (OpenSSL 3.x)", "s2n-tls (AWS)"],
        "references": ["IETF RFC 8446", "IETF RFC 8996"]
    },

    "SECRET": {
        "pqc_replacement": "Remove hardcoded keys immediately. Use a secrets manager (AWS KMS, HashiCorp Vault, Azure Key Vault)",
        "nist_standard": "NIST SP 800-57 (Key Management)",
        "migration_priority": "EMERGENCY",
        "code_before": "# CRITICAL: Private key embedded in source code",
        "code_after": '''# Use environment variables or secrets manager
import os
private_key_pem = os.environ["APP_PRIVATE_KEY"]
# Or: vault_client.secrets.kv.v2.read_secret_version(path="myapp/keys")''',
        "libraries": ["python-dotenv", "hvac (HashiCorp Vault)", "boto3 (AWS KMS)"],
        "references": ["NIST SP 800-57"]
    }
}


class RemediationEngine:
    @staticmethod
    def get_recommendation(finding: dict) -> dict:
        """Returns the PQC migration recommendation for a classified finding."""
        family = finding.get("algorithm_family", "")
        if family not in PQC_RECOMMENDATIONS:
            family = finding.get("classification", {}).get("algorithm_family", "")

        rec = PQC_RECOMMENDATIONS.get(family, {
            "pqc_replacement": "Manual review required",
            "nist_standard": "N/A",
            "migration_priority": "REVIEW",
            "code_before": "",
            "code_after": "",
            "libraries": [],
            "references": []
        })

        return {
            "algorithm_family": family,
            "algorithm": finding.get("algorithm", finding.get("classification", {}).get("algorithm", "")),
            **rec
        }

    @staticmethod
    def get_all_recommendations(classified_findings: list) -> list:
        """Gets PQC recommendations for all classified findings."""
        recommendations = []
        seen_families = set()

        for f in classified_findings:
            family = f.get("algorithm_family", "")
            rec = RemediationEngine.get_recommendation(f)
            rec["file"] = f.get("file", "")
            rec["line_number"] = f.get("line_number", 0)
            rec["is_first_of_family"] = family not in seen_families
            seen_families.add(family)
            recommendations.append(rec)

        return recommendations
