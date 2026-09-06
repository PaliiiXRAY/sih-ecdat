"""
Preloaded Sample Vulnerable Codebases for SIH26164 ECDAT Live Demos
Each sample simulates a realistic enterprise codebase with deliberate cryptographic weaknesses.
"""

SAMPLES = {
    "fintech_banking_app": {
        "id": "fintech_banking_app",
        "title": "Indian FinTech Banking Application",
        "description": "RBI-compliant payment gateway with RSA-2048, MD5 hashing, AES-128, and a hardcoded private key.",
        "language": "python",
        "files": {
            "auth/jwt_handler.py": '''import jwt
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import hashes

# JWT Token signing with RSA-2048
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048
)

def sign_token(payload: dict) -> str:
    """Signs a JWT with RSA-2048 (Vulnerable to Shor's Algorithm)."""
    return jwt.encode(payload, private_key, algorithm="RS256")

def hash_otp(otp: str) -> str:
    """Hashes OTP for storage using MD5 (Classically Broken!)."""
    import hashlib
    return hashlib.md5(otp.encode()).hexdigest()
''',
            "payments/encryption.py": '''from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.asymmetric import ec
import hashlib
import os

# AES-128 for payment data encryption
def encrypt_card_data(card_number: str, key: bytes) -> bytes:
    """Encrypts credit card data with AES-128-CBC (Weakened by Grover's)."""
    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(key[:16]), modes.CBC(iv))
    encryptor = cipher.encryptor()
    padded = card_number.ljust(32).encode()
    return iv + encryptor.update(padded) + encryptor.finalize()

# ECDSA P-256 for transaction signing
def sign_transaction(txn_data: bytes) -> bytes:
    """Signs transaction with ECDSA P-256 (Broken by Shor's ECDLP)."""
    private_key = ec.generate_private_key(ec.SECP256R1())
    signature = private_key.sign(txn_data, ec.ECDSA(hashes.SHA256()))
    return signature

def legacy_checksum(data: bytes) -> str:
    """Legacy SHA-1 checksum for backward compatibility."""
    return hashlib.sha1(data).hexdigest()
''',
            "config/keys.py": '''# WARNING: Hardcoded RSA Private Key (CRITICAL SECURITY VIOLATION)
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA2a2rwplBQLhNhrRzP7ykCXNXwCvD9q3gOa5hQzGm4C1z7A8F
nFuK3vU9v4B5xR8CuLbdOj+9v8sMqhVE7v0MaZ0YNkKR3q9oJNRLYz5a1hfOvSR
THIS_IS_A_DEMO_KEY_NOT_REAL_BUT_PATTERN_TRIGGERS_DETECTION
-----END RSA PRIVATE KEY-----

API_SECRET_KEY = "super_secret_production_key_12345"
DATABASE_PASSWORD = "admin123"
''',
            "utils/hashing.py": '''import hashlib

def hash_password(password: str) -> str:
    """Hashes user password with SHA-256 (Quantum-Resilient)."""
    return hashlib.sha256(password.encode()).hexdigest()

def hash_session_id(session: str) -> str:
    """Creates session token with SHA-512 (Quantum-Safe)."""
    return hashlib.sha512(session.encode()).hexdigest()
'''
        }
    },

    "defense_comms_system": {
        "id": "defense_comms_system",
        "title": "Military-Grade Secure Communications System",
        "description": "Defense messaging platform with RSA-4096, DH key exchange, 3DES, and deprecated TLS.",
        "language": "python",
        "files": {
            "crypto/key_exchange.py": '''from cryptography.hazmat.primitives.asymmetric import rsa, dh
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding

# RSA-4096 for message encryption (Still broken by Shor's, just needs more qubits)
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=4096
)

def encrypt_message(public_key, plaintext: bytes) -> bytes:
    """Encrypts classified message with RSA-4096 OAEP."""
    return public_key.encrypt(
        plaintext,
        padding.OAEP(mgf=padding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=None)
    )

# Diffie-Hellman key agreement (Broken by Shor's DLP attack)
def establish_session_key():
    """DH-2048 key exchange for secure channel establishment."""
    parameters = dh.generate_parameters(generator=2, key_size=2048)
    private_key = parameters.generate_private_key()
    return private_key
''',
            "crypto/legacy_cipher.py": '''from Crypto.Cipher import DES3
import os

# Triple-DES for backward compatibility with legacy terminals
def encrypt_legacy(data: bytes, key: bytes) -> bytes:
    """3DES-CBC encryption for legacy field terminals (NIST Deprecated 2023)."""
    iv = os.urandom(8)
    cipher = DES3.new(key[:24], DES3.MODE_CBC, iv)
    padded = data + b'\\x00' * (8 - len(data) % 8)
    return iv + cipher.encrypt(padded)
''',
            "network/tls_config.py": '''import ssl

# DEPRECATED: TLS 1.0 configuration for legacy radio bridge
def create_legacy_context():
    """TLS 1.0 for backward compatibility (CRITICAL: Deprecated by RFC 8996)."""
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLSv1)
    return ctx

def create_modern_context():
    """TLS 1.3 for modern endpoints (secure)."""
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    ctx.minimum_version = ssl.TLSVersion.TLSv1_3
    return ctx
'''
        }
    },

    "quantum_safe_reference": {
        "id": "quantum_safe_reference",
        "title": "Quantum-Safe Reference Application",
        "description": "A properly hardened application using only AES-256 and SHA-256/512. Demonstrates a clean scan.",
        "language": "python",
        "files": {
            "crypto/encryption.py": '''from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

# AES-256-GCM: Quantum-Resilient Symmetric Encryption
def encrypt_data(plaintext: bytes, aad: bytes = b"") -> tuple:
    """AES-256-GCM authenticated encryption (128-bit post-quantum security)."""
    key = AESGCM.generate_key(bit_length=256)
    nonce = os.urandom(12)
    aesgcm = AESGCM(key)
    ciphertext = aesgcm.encrypt(nonce, plaintext, aad)
    return key, nonce, ciphertext
''',
            "crypto/hashing.py": '''import hashlib
import hmac

# SHA-256: Quantum-Safe Hash
def secure_hash(data: bytes) -> str:
    """SHA-256 digest (128-bit post-quantum collision resistance)."""
    return hashlib.sha256(data).hexdigest()

# SHA-384: Higher security margin
def high_security_hash(data: bytes) -> str:
    """SHA-384 digest (192-bit post-quantum collision resistance)."""
    return hashlib.sha384(data).hexdigest()

# HMAC-SHA256 with proper key
def create_mac(key: bytes, message: bytes) -> str:
    """HMAC-SHA256 message authentication (quantum-resilient)."""
    return hmac.new(key, message, hashlib.sha256).hexdigest()
'''
        }
    }
}
