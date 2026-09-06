"""
Quantum Threat Classifier for SIH26164 ECDAT
Classifies cryptographic primitives by their vulnerability to quantum computing attacks.
Based on:
  - Shor's Algorithm (breaks RSA, ECC, DH, DSA)
  - Grover's Algorithm (halves symmetric key security: AES-128 -> 64-bit effective)
  - Classical vulnerabilities (MD5 collisions, SHA-1 collisions, DES brute-force)
"""

# Quantum Impact Classification Database
# Maps algorithm families/names to quantum vulnerability profiles
QUANTUM_CLASSIFICATION = {
    # === ASYMMETRIC: Broken by Shor's Algorithm ===
    "RSA": {
        "quantum_attack": "Shor's Algorithm",
        "quantum_impact": "BROKEN",
        "risk_level": "CRITICAL",
        "risk_score": 95,
        "explanation": "RSA relies on the difficulty of integer factorization. Shor's algorithm on a CRQC (Cryptographically Relevant Quantum Computer) factors RSA keys in polynomial time, completely breaking all RSA key sizes.",
        "timeline": "Estimated broken by 2030-2035 (IBM/Google roadmaps)",
        "hndl_vulnerable": True,
        "color": "red"
    },
    "ECC": {
        "quantum_attack": "Shor's Algorithm (ECDLP variant)",
        "quantum_impact": "BROKEN",
        "risk_level": "CRITICAL",
        "risk_score": 95,
        "explanation": "Elliptic Curve Cryptography relies on the Elliptic Curve Discrete Logarithm Problem (ECDLP). Shor's algorithm solves ECDLP efficiently, breaking all standardized ECC curves (P-256, P-384, P-521, secp256k1).",
        "timeline": "Estimated broken by 2030-2035",
        "hndl_vulnerable": True,
        "color": "red"
    },
    "DH": {
        "quantum_attack": "Shor's Algorithm (DLP variant)",
        "quantum_impact": "BROKEN",
        "risk_level": "CRITICAL",
        "risk_score": 90,
        "explanation": "Diffie-Hellman key exchange relies on the Discrete Logarithm Problem (DLP). Shor's algorithm solves DLP in polynomial time, breaking all DH parameters regardless of key size.",
        "timeline": "Estimated broken by 2030-2035",
        "hndl_vulnerable": True,
        "color": "red"
    },

    # === SYMMETRIC: Weakened by Grover's Algorithm ===
    "AES": {
        "quantum_attack": "Grover's Algorithm",
        "quantum_impact": "WEAKENED",
        "risk_level": "MEDIUM",
        "risk_score": 40,
        "explanation": "Grover's algorithm provides a quadratic speedup for brute-force key search, effectively halving the security level. AES-128 drops to 64-bit security (insecure). AES-256 drops to 128-bit security (still secure).",
        "timeline": "AES-256 remains quantum-resilient; AES-128 requires upgrade",
        "hndl_vulnerable": False,
        "color": "yellow"
    },

    # === SYMMETRIC LEGACY: Already classically broken ===
    "3DES": {
        "quantum_attack": "Classical Brute-Force + Grover's",
        "quantum_impact": "DEPRECATED",
        "risk_level": "HIGH",
        "risk_score": 80,
        "explanation": "Triple-DES has an effective security of ~112 bits classically, reduced to ~56 bits by Grover's algorithm. NIST deprecated 3DES in 2023.",
        "timeline": "Already deprecated by NIST SP 800-131A Rev.2",
        "hndl_vulnerable": False,
        "color": "orange"
    },
    "DES": {
        "quantum_attack": "Classical Brute-Force",
        "quantum_impact": "BROKEN",
        "risk_level": "CRITICAL",
        "risk_score": 100,
        "explanation": "DES has a 56-bit key, which is trivially brute-forced even by classical computers. Completely insecure.",
        "timeline": "Broken since 1998 (EFF DES Cracker)",
        "hndl_vulnerable": False,
        "color": "red"
    },

    # === HASH FUNCTIONS ===
    "HASH": {
        "quantum_attack": "Grover's Algorithm (preimage), BHT (collisions)",
        "quantum_impact": "VARIES",
        "risk_level": "VARIES",
        "risk_score": 30,
        "explanation": "Hash function security depends on specific algorithm. MD5 and SHA-1 are classically broken. SHA-256+ remain quantum-resilient with sufficient output length.",
        "timeline": "SHA-256+ quantum-safe; MD5/SHA-1 already classically broken",
        "hndl_vulnerable": False,
        "color": "yellow"
    },

    # === HMAC ===
    "HMAC": {
        "quantum_attack": "Grover's Algorithm (key recovery)",
        "quantum_impact": "WEAKENED",
        "risk_level": "LOW",
        "risk_score": 20,
        "explanation": "HMAC security depends on the underlying hash and key length. HMAC-SHA256 with 256-bit keys remains quantum-resilient.",
        "timeline": "Quantum-safe with adequate key sizes",
        "hndl_vulnerable": False,
        "color": "green"
    },

    # === TLS / SSL ===
    "TLS": {
        "quantum_attack": "Protocol Downgrade + Cipher Suite Dependent",
        "quantum_impact": "DEPRECATED",
        "risk_level": "HIGH",
        "risk_score": 75,
        "explanation": "TLS 1.0/1.1 and SSLv3 use deprecated cipher suites and are vulnerable to classical attacks (BEAST, POODLE). Must upgrade to TLS 1.3 with PQC key exchange.",
        "timeline": "TLS 1.0/1.1 deprecated by IETF RFC 8996 (March 2021)",
        "hndl_vulnerable": True,
        "color": "orange"
    },

    # === HARDCODED SECRETS ===
    "SECRET": {
        "quantum_attack": "Credential Exposure (No cryptanalysis needed)",
        "quantum_impact": "CRITICAL EXPOSURE",
        "risk_level": "CRITICAL",
        "risk_score": 100,
        "explanation": "Hardcoded private keys in source code are immediately compromised regardless of algorithm strength. Any person with repository access can extract and use the key.",
        "timeline": "Immediately exploitable",
        "hndl_vulnerable": True,
        "color": "red"
    },
}

# Specific hash algorithm overrides
HASH_SPECIFIC = {
    "MD5": {"risk_level": "CRITICAL", "risk_score": 95, "color": "red",
            "explanation": "MD5 is completely broken. Collision attacks demonstrated in 2004 (Wang et al.). NIST prohibits MD5 for any security-sensitive application."},
    "SHA-1": {"risk_level": "HIGH", "risk_score": 75, "color": "orange",
              "explanation": "SHA-1 collision resistance broken (Google SHAttered, 2017). NIST deprecated SHA-1 for digital signatures. Forbidden in certificates since 2016."},
    "SHA-256": {"risk_level": "SAFE", "risk_score": 10, "color": "green",
                "explanation": "SHA-256 provides 128-bit post-quantum collision resistance (via BHT algorithm). Considered quantum-resilient for all current applications."},
    "SHA-384": {"risk_level": "SAFE", "risk_score": 5, "color": "green",
                "explanation": "SHA-384 provides 192-bit post-quantum collision resistance. Fully quantum-safe."},
    "SHA-512": {"risk_level": "SAFE", "risk_score": 5, "color": "green",
                "explanation": "SHA-512 provides 256-bit post-quantum collision resistance. Fully quantum-safe."},
}

# AES key-size specific overrides
AES_KEY_OVERRIDES = {
    "128": {"risk_level": "HIGH", "risk_score": 65, "color": "orange",
            "explanation": "AES-128 drops to 64-bit effective security under Grover's algorithm. NIST recommends migrating to AES-256 for post-quantum resilience."},
    "192": {"risk_level": "MEDIUM", "risk_score": 35, "color": "yellow",
            "explanation": "AES-192 drops to 96-bit effective security under Grover's. Acceptable but AES-256 preferred."},
    "256": {"risk_level": "SAFE", "risk_score": 10, "color": "green",
            "explanation": "AES-256 retains 128-bit effective security even under Grover's algorithm. Fully quantum-resilient. No action needed."},
}


class QuantumClassifier:
    @staticmethod
    def classify(finding: dict) -> dict:
        """Classifies a single cryptographic finding by its quantum vulnerability."""
        family = finding.get("algorithm_family", "")
        algorithm = finding.get("algorithm", "")
        key_size = finding.get("key_size", "")

        base_classification = QUANTUM_CLASSIFICATION.get(family, {
            "quantum_attack": "Unknown",
            "quantum_impact": "UNKNOWN",
            "risk_level": "UNKNOWN",
            "risk_score": 50,
            "explanation": "Insufficient data to classify this cryptographic primitive.",
            "timeline": "Requires manual review",
            "hndl_vulnerable": False,
            "color": "yellow"
        })

        result = dict(base_classification)

        # Apply hash-specific overrides
        if family == "HASH":
            for hash_name, override in HASH_SPECIFIC.items():
                if hash_name in algorithm.upper():
                    result.update(override)
                    break

        # Apply AES key-size overrides
        if family == "AES" and key_size and key_size != "Unknown":
            key_str = str(key_size)
            for ks, override in AES_KEY_OVERRIDES.items():
                if ks in key_str:
                    result.update(override)
                    break

        # RSA key-size nuance (larger keys buy time but are still broken)
        if family == "RSA" and key_size and key_size != "Unknown":
            try:
                ks = int(key_size)
                if ks >= 4096:
                    result["risk_score"] = 80
                    result["explanation"] += " RSA-4096 requires more qubits but is still fundamentally broken by Shor's algorithm."
            except ValueError:
                pass

        result["algorithm_family"] = family
        result["algorithm"] = algorithm
        result["key_size"] = key_size

        return result

    @staticmethod
    def classify_all(findings: list) -> list:
        """Classifies all scanner findings and returns enriched results."""
        classified = []
        for f in findings:
            classification = QuantumClassifier.classify(f)
            enriched = {**f, "classification": classification}
            classified.append(enriched)
        return classified

    @staticmethod
    def compute_readiness_score(classified_findings: list) -> dict:
        """
        Computes an overall Quantum Readiness Score (0-100).
        100 = Fully quantum-safe. 0 = Completely vulnerable.
        """
        if not classified_findings:
            return {
                "score": 100,
                "grade": "A+",
                "label": "No Cryptographic Assets Detected",
                "color": "green"
            }

        total_items = len(classified_findings)
        total_risk = sum(f["classification"]["risk_score"] for f in classified_findings)
        avg_risk = total_risk / total_items

        # Readiness = inverse of risk
        readiness = max(0, min(100, round(100 - avg_risk)))

        # Critical count penalty
        critical_count = sum(1 for f in classified_findings if f["classification"]["risk_level"] == "CRITICAL")
        if critical_count > 0:
            readiness = min(readiness, 40)
        if critical_count >= 3:
            readiness = min(readiness, 20)

        # Grade
        if readiness >= 90:
            grade, label, color = "A+", "Quantum-Resilient Infrastructure", "green"
        elif readiness >= 75:
            grade, label, color = "A", "Mostly Quantum-Safe", "green"
        elif readiness >= 60:
            grade, label, color = "B", "Moderate Quantum Risk", "yellow"
        elif readiness >= 40:
            grade, label, color = "C", "Significant Quantum Vulnerability", "orange"
        elif readiness >= 20:
            grade, label, color = "D", "High Quantum Exposure", "orange"
        else:
            grade, label, color = "F", "Critical Quantum Vulnerability", "red"

        return {
            "score": readiness,
            "grade": grade,
            "label": label,
            "color": color,
            "total_assets": total_items,
            "critical_count": critical_count,
            "high_count": sum(1 for f in classified_findings if f["classification"]["risk_level"] == "HIGH"),
            "safe_count": sum(1 for f in classified_findings if f["classification"]["risk_level"] in ("SAFE", "LOW"))
        }
