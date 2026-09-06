"""
Cryptographic Code Scanner for SIH26164 ECDAT
Scans source code files using regex pattern matching to discover cryptographic primitives,
algorithms, key sizes, hash functions, and certificate/TLS configurations.
Supports Python, JavaScript/TypeScript, Java, Go, C/C++, and configuration files.
"""
import re
import os

# Master Cryptographic Pattern Database
# Each pattern: (regex, algorithm_family, algorithm_name, default_key_size, language_hint)
CRYPTO_PATTERNS = [
    # ============ RSA ============
    (r'rsa\.generate[_-]?private[_-]?key\s*\(\s*(?:public_exponent\s*=\s*\d+\s*,\s*)?key_size\s*=\s*(\d+)', 'RSA', 'RSA-{0}', None, 'python'),
    (r'RSA\.generate\s*\(\s*(\d+)', 'RSA', 'RSA-{0}', None, 'python'),
    (r'from\s+(?:Crypto(?:dome)?\.PublicKey|cryptography\.hazmat\.primitives\.asymmetric)\s+import\s+rsa', 'RSA', 'RSA (Import Detected)', '2048', 'python'),
    (r'KeyPairGenerator\.getInstance\s*\(\s*["\']RSA["\']\s*\)', 'RSA', 'RSA', '2048', 'java'),
    (r'\.initialize\s*\(\s*(\d+)\s*\)', 'RSA', 'RSA-{0}', None, 'java'),
    (r'crypto\.generateKeyPairSync\s*\(\s*["\']rsa["\']\s*,\s*\{[^}]*modulusLength\s*:\s*(\d+)', 'RSA', 'RSA-{0}', None, 'javascript'),
    (r'rsa\.GenerateKey\s*\(\s*\w+\s*,\s*(\d+)\s*\)', 'RSA', 'RSA-{0}', None, 'go'),
    (r'RSA_generate_key(?:_ex)?\s*\(\s*(\d+)', 'RSA', 'RSA-{0}', None, 'c'),
    (r'openssl\s+genrsa\s+.*?(\d{3,4})', 'RSA', 'RSA-{0}', None, 'config'),

    # ============ ECC / Elliptic Curve ============
    (r'ec\.generate_private_key\s*\(\s*ec\.(SECP\w+)\s*\(\s*\)', 'ECC', 'ECC-{0}', None, 'python'),
    (r'from\s+cryptography\.hazmat\.primitives\.asymmetric\s+import\s+ec', 'ECC', 'ECC (Import Detected)', '256', 'python'),
    (r'EC\.generate_key_pair\s*\(\s*["\'](\w+)["\']\s*\)', 'ECC', 'ECC-{0}', None, 'python'),
    (r'KeyPairGenerator\.getInstance\s*\(\s*["\']EC["\']\s*\)', 'ECC', 'ECDSA', '256', 'java'),
    (r'ECGenParameterSpec\s*\(\s*["\'](secp\w+)["\']\s*\)', 'ECC', 'ECC-{0}', None, 'java'),
    (r'crypto\.createECDH\s*\(\s*["\'](secp\w+)["\']\s*\)', 'ECC', 'ECDH-{0}', None, 'javascript'),
    (r'elliptic\.P(\d+)\s*\(\s*\)', 'ECC', 'ECC-P{0}', None, 'go'),
    (r'EC_KEY_new_by_curve_name\s*\(\s*NID_(\w+)\s*\)', 'ECC', 'ECC-{0}', None, 'c'),

    # ============ AES ============
    (r'algorithms\.AES\s*\(\s*\w+\s*\)', 'AES', 'AES', '256', 'python'),
    (r'AES\.new\s*\(\s*\w+\s*,\s*AES\.MODE_(\w+)', 'AES', 'AES-{0}', '128', 'python'),
    (r'Cipher\.getInstance\s*\(\s*["\']AES/(\w+)/\w+["\']\s*\)', 'AES', 'AES-{0}', '128', 'java'),
    (r'crypto\.createCipher(?:iv)?\s*\(\s*["\']aes-(\d+)-(\w+)["\']\s*', 'AES', 'AES-{0}-{1}', None, 'javascript'),
    (r'aes\.NewCipher\s*\(', 'AES', 'AES', '128', 'go'),
    (r'EVP_aes_(\d+)_(\w+)\s*\(\s*\)', 'AES', 'AES-{0}-{1}', None, 'c'),

    # ============ 3DES / DES (Legacy / Deprecated) ============
    (r'algorithms\.TripleDES\s*\(', '3DES', 'Triple-DES (3DES)', '168', 'python'),
    (r'DES3\.new\s*\(', '3DES', 'Triple-DES (3DES)', '168', 'python'),
    (r'DES\.new\s*\(', 'DES', 'DES', '56', 'python'),
    (r'Cipher\.getInstance\s*\(\s*["\']DESede', '3DES', 'Triple-DES (3DES)', '168', 'java'),
    (r'Cipher\.getInstance\s*\(\s*["\']DES/', 'DES', 'DES', '56', 'java'),

    # ============ Hash Functions ============
    (r'hashlib\.md5\s*\(', 'HASH', 'MD5', 'N/A', 'python'),
    (r'hashlib\.sha1\s*\(', 'HASH', 'SHA-1', 'N/A', 'python'),
    (r'hashlib\.sha256\s*\(', 'HASH', 'SHA-256', 'N/A', 'python'),
    (r'hashlib\.sha384\s*\(', 'HASH', 'SHA-384', 'N/A', 'python'),
    (r'hashlib\.sha512\s*\(', 'HASH', 'SHA-512', 'N/A', 'python'),
    (r'MessageDigest\.getInstance\s*\(\s*["\']MD5["\']\s*\)', 'HASH', 'MD5', 'N/A', 'java'),
    (r'MessageDigest\.getInstance\s*\(\s*["\']SHA-?1["\']\s*\)', 'HASH', 'SHA-1', 'N/A', 'java'),
    (r'MessageDigest\.getInstance\s*\(\s*["\']SHA-?256["\']\s*\)', 'HASH', 'SHA-256', 'N/A', 'java'),
    (r'crypto\.createHash\s*\(\s*["\']md5["\']\s*\)', 'HASH', 'MD5', 'N/A', 'javascript'),
    (r'crypto\.createHash\s*\(\s*["\']sha1["\']\s*\)', 'HASH', 'SHA-1', 'N/A', 'javascript'),
    (r'crypto\.createHash\s*\(\s*["\']sha256["\']\s*\)', 'HASH', 'SHA-256', 'N/A', 'javascript'),
    (r'MD5\.Create\s*\(\s*\)', 'HASH', 'MD5', 'N/A', 'csharp'),
    (r'SHA1\.Create\s*\(\s*\)', 'HASH', 'SHA-1', 'N/A', 'csharp'),
    (r'md5\.New\s*\(\s*\)', 'HASH', 'MD5', 'N/A', 'go'),
    (r'sha1\.New\s*\(\s*\)', 'HASH', 'SHA-1', 'N/A', 'go'),
    (r'sha256\.New\s*\(\s*\)', 'HASH', 'SHA-256', 'N/A', 'go'),
    (r'MD5_Init\s*\(', 'HASH', 'MD5', 'N/A', 'c'),
    (r'SHA1_Init\s*\(', 'HASH', 'SHA-1', 'N/A', 'c'),

    # ============ HMAC ============
    (r'hmac\.new\s*\(\s*\w+\s*,.*?hashlib\.(sha\w+)', 'HMAC', 'HMAC-{0}', 'N/A', 'python'),
    (r'hmac\.HMAC\s*\(\s*\w+\s*,\s*hashes\.(SHA\w+)', 'HMAC', 'HMAC-{0}', 'N/A', 'python'),

    # ============ Diffie-Hellman ============
    (r'dh\.generate_parameters\s*\(\s*generator\s*=\s*\d+\s*,\s*key_size\s*=\s*(\d+)', 'DH', 'DH-{0}', None, 'python'),
    (r'DHParameterSpec\s*\(', 'DH', 'Diffie-Hellman', '2048', 'java'),
    (r'crypto\.createDiffieHellman\s*\(\s*(\d+)', 'DH', 'DH-{0}', None, 'javascript'),

    # ============ TLS / SSL Configurations ============
    (r'ssl\.PROTOCOL_TLSv1(?:_[12])?\b', 'TLS', 'TLS 1.0/1.1 (Deprecated)', 'N/A', 'python'),
    (r'SSLv3', 'TLS', 'SSLv3 (Broken)', 'N/A', 'any'),
    (r'TLSv1\.0', 'TLS', 'TLS 1.0 (Deprecated)', 'N/A', 'any'),
    (r'TLSv1\.1', 'TLS', 'TLS 1.1 (Deprecated)', 'N/A', 'any'),
    (r'MinVersion:\s*tls\.VersionTLS10', 'TLS', 'TLS 1.0 (Deprecated)', 'N/A', 'go'),

    # ============ Hardcoded Secrets / Private Keys ============
    (r'-----BEGIN\s+RSA\s+PRIVATE\s+KEY-----', 'SECRET', 'Hardcoded RSA Private Key', 'N/A', 'any'),
    (r'-----BEGIN\s+EC\s+PRIVATE\s+KEY-----', 'SECRET', 'Hardcoded EC Private Key', 'N/A', 'any'),
    (r'-----BEGIN\s+PRIVATE\s+KEY-----', 'SECRET', 'Hardcoded Generic Private Key', 'N/A', 'any'),
]

SUPPORTED_EXTENSIONS = {
    '.py': 'python',
    '.js': 'javascript',
    '.ts': 'javascript',
    '.jsx': 'javascript',
    '.tsx': 'javascript',
    '.java': 'java',
    '.go': 'go',
    '.c': 'c',
    '.cpp': 'c',
    '.h': 'c',
    '.cs': 'csharp',
    '.rb': 'ruby',
    '.rs': 'rust',
    '.yaml': 'config',
    '.yml': 'config',
    '.toml': 'config',
    '.conf': 'config',
    '.cfg': 'config',
    '.ini': 'config',
    '.env': 'config',
    '.pem': 'any',
    '.key': 'any',
}

SKIP_DIRS = {
    'node_modules', '.git', '__pycache__', 'venv', '.venv', 'env',
    '.tox', 'dist', 'build', '.next', '.nuxt', 'vendor', 'target',
    '.idea', '.vscode', '.gradle'
}


class CryptoScanner:
    @staticmethod
    def scan_text(source_code: str, filename: str = "input.py", language: str = "python") -> list:
        """Scans a single source code string and returns found cryptographic artifacts."""
        findings = []
        lines = source_code.split('\n')

        for line_num, line in enumerate(lines, 1):
            stripped = line.strip()
            if not stripped or stripped.startswith('#') or stripped.startswith('//'):
                continue

            for pattern, family, algo_template, default_key, lang_hint in CRYPTO_PATTERNS:
                if lang_hint not in ('any', language):
                    continue

                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    groups = match.groups()
                    if groups:
                        algo_name = algo_template.format(*groups)
                        key_size = groups[0] if groups[0] and groups[0].isdigit() else default_key
                    else:
                        algo_name = algo_template
                        key_size = default_key

                    findings.append({
                        "file": filename,
                        "line_number": line_num,
                        "line_content": stripped[:120],
                        "algorithm_family": family,
                        "algorithm": algo_name,
                        "key_size": str(key_size) if key_size else "Unknown",
                        "language": language,
                        "matched_pattern": pattern[:60]
                    })
                    break  # One finding per line to avoid duplicates

        return findings

    @staticmethod
    def scan_directory(directory: str) -> list:
        """Recursively scans a directory for cryptographic usage in all supported files."""
        all_findings = []

        for root, dirs, files in os.walk(directory):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
            for fname in files:
                ext = os.path.splitext(fname)[1].lower()
                if ext not in SUPPORTED_EXTENSIONS:
                    continue

                lang = SUPPORTED_EXTENSIONS[ext]
                filepath = os.path.join(root, fname)
                rel_path = os.path.relpath(filepath, directory)

                try:
                    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
                        content = f.read()
                    findings = CryptoScanner.scan_text(content, rel_path, lang)
                    all_findings.extend(findings)
                except Exception:
                    continue

        return all_findings

    @staticmethod
    def scan_from_input(code_text: str, language: str = "python") -> list:
        """Scans code pasted directly into the dashboard text area."""
        return CryptoScanner.scan_text(code_text, "user_input", language)
