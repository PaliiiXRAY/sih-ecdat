// ECDAT Front-End Controller - Exact Match to Video Prototype 100%

// ============================================================================
// DATA REPOSITORIES & ASSETS INVENTORY
// ============================================================================
const REPOSITORIES = {
    fintech: {
        id: 'fintech',
        name: 'FinTech API Gateway',
        runtime: 'Node.js • Payment processing',
        codeLang: 'JavaScript (Node.js)',
        sampleCode: `const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Generating 2048-bit RSA keypair for JWT signing
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// Ephemeral ECDH key agreement over curve P-256
const ecdh = crypto.createECDH('prime256v1');
ecdh.generateKeys();

// Legacy Diffie-Hellman session exchange
const dh = crypto.createDiffieHellman(2048);
dh.generateKeys();

// Data payload symmetric encryption
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);`,
        score: 20,
        scoreBadge: 'CRITICAL',
        exposureDesc: '4 assets critically vulnerable within 7 years. Recommendation: begin migration within 6 months to beat Mosca\'s Theorem deadline.',
        totalAssets: 10,
        criticalCount: 4,
        highCount: 3,
        pqcReadyCount: 2,
        topRisks: [
            {
                name: 'RSA-2048',
                category: 'Key Exchange / Encryption',
                risk: 'CRITICAL',
                desc: "Vulnerable to Shor's Algorithm. Breaks under 2,048 logical qubits. Harvest Now, Decrypt Later (HNDL) active risk.",
                target: 'ML-KEM-768 (NIST FIPS 203)',
                assetId: 'asset-1'
            },
            {
                name: 'ECDH P-256',
                category: 'Key Agreement',
                risk: 'CRITICAL',
                desc: 'Elliptic Curve Discrete Log breaks with quantum Fourier transform. Session forward secrecy compromised.',
                target: 'ML-KEM-1024 / X25519Kyber768',
                assetId: 'asset-2'
            },
            {
                name: 'DH-2048',
                category: 'Key Exchange',
                risk: 'CRITICAL',
                desc: 'Finite Field Diffie-Hellman vulnerable to quantum factorisation. High exposure in legacy TLS handshakes.',
                target: 'ML-KEM-768',
                assetId: 'asset-5'
            }
        ],
        assets: [
            {
                id: 'asset-1',
                name: 'RSA-2048',
                role: 'JWT Sign & Key Exchange',
                location: '/src/auth/jwt.js:42',
                keyLength: '2048-bit',
                family: 'Asymmetric (Factorization)',
                risk: 'CRITICAL',
                status: 'Not Started',
                moscaFormula: 'X (10y) + Y (3y) = 13y > Z (7y / 2031) — EXCEEDED',
                moscaDesc: 'Financial audit data has a shelf life of 10 years. Migration takes 3 years. Since 10 + 3 > 7, adversary capturing traffic today can decrypt it once a CRQC arrives.',
                purpose: 'Used for signing session JSON Web Tokens (JWT) and client asymmetric key exchange during user authentication.',
                riskReason: "Shor's Algorithm on a Cryptanalytically Relevant Quantum Computer (CRQC) solves integer factorisation in polynomial time O((log N)^3). An adversary running Shor's algorithm can derive the private key from public modulus N, compromising all historical and active sessions.",
                replacement: 'ML-KEM-768 (NIST FIPS 203) & ML-DSA-65 (NIST FIPS 204)',
                beforeCode: `// VULNERABLE: Classical RSA-2048 signing
const crypto = require('crypto');
const token = jwt.sign(payload, rsaPrivateKey, {
  algorithm: 'RS256',
  expiresIn: '24h'
});`,
                afterCode: `// PQC-READY: NIST FIPS 204 ML-DSA-65 (Dilithium3)
import { MLDSA65 } from '@openquantumsafe/oqs';
const pqcToken = await MLDSA65.signPayload(payload, pqcSecretKey, {
  algorithm: 'ML-DSA-65',
  hybridFallback: 'ECDSA-P384'
});`
            },
            {
                id: 'asset-2',
                name: 'ECDH P-256',
                role: 'Session Key Agreement',
                location: '/src/crypto/handshake.js:18',
                keyLength: '256-bit',
                family: 'Asymmetric (Elliptic Curve)',
                risk: 'CRITICAL',
                status: 'Not Started',
                moscaFormula: 'X (5y) + Y (3y) = 8y > Z (7y / 2031) — EXCEEDED',
                moscaDesc: 'Session key establishment exposes transit payload to HNDL. 5 + 3 > 7 years.',
                purpose: 'Generates ephemeral shared secrets for encrypting client-server WebSocket payloads.',
                riskReason: "Shor's discrete logarithm attack breaks ECDLP with ~1,500 logical qubits. Any recorded session keys can be retroactively derived by quantum adversaries.",
                replacement: 'X25519 + ML-KEM-768 Hybrid Key Exchange',
                beforeCode: `// VULNERABLE: Classical ECDH P-256
const ecdh = crypto.createECDH('prime256v1');
ecdh.generateKeys();
const sharedSecret = ecdh.computeSecret(clientPublicKey);`,
                afterCode: `// PQC-READY: Hybrid X25519 + ML-KEM-768
import { HybridKEM } from '@openquantumsafe/oqs';
const kem = new HybridKEM('X25519-ML-KEM-768');
const { ciphertext, sharedSecret } = await kem.encapsulate(clientPqcKey);`
            },
            {
                id: 'asset-3',
                name: 'RSA-4096',
                role: 'Root Certificate Authority',
                location: '/certs/ca-root.pem:1',
                keyLength: '4096-bit',
                family: 'Asymmetric (Factorization)',
                risk: 'HIGH',
                status: 'In Progress',
                moscaFormula: 'X (15y) + Y (4y) = 19y > Z (7y / 2031) — HIGH RISK',
                moscaDesc: 'Root certificates have long lifetimes. Quantum computers will break 4096-bit RSA shortly after 2048-bit.',
                purpose: 'Signs intermediate CA and TLS leaf certificates for production cluster nodes.',
                riskReason: "Increasing modulus to 4096-bit only doubles Shor's qubit requirement (~4,096 logical qubits), offering negligible quantum resistance.",
                replacement: 'ML-DSA-87 (NIST FIPS 204 / Dilithium5)',
                beforeCode: `openssl req -x509 -newkey rsa:4096 -keyout ca-key.pem -out ca-cert.pem -days 3650`,
                afterCode: `oqs-openssl req -x509 -newkey mldsa87 -keyout ca-key.pem -out ca-cert.pem -days 3650`
            },
            {
                id: 'asset-4',
                name: 'ECDSA P-384',
                role: 'Microservice Inter-comm Signing',
                location: '/src/rpc/signer.js:88',
                keyLength: '384-bit',
                family: 'Asymmetric (Elliptic Curve)',
                risk: 'HIGH',
                status: 'Not Started',
                moscaFormula: 'X (7y) + Y (2y) = 9y > Z (7y / 2031) — EXCEEDED',
                moscaDesc: 'RPC authentication tokens vulnerable to forgery once CRQC emerges.',
                purpose: 'Mutual TLS and JSON token signing between microservices in the Kubernetes mesh.',
                riskReason: 'Quantum discrete logarithm algorithms bypass elliptic curves of any standard size in polynomial time.',
                replacement: 'Falcon-512 (FN-DSA) or ML-DSA-44',
                beforeCode: `const sign = crypto.createSign('SHA384');
sign.update(rpcPayload);
const signature = sign.sign(ecPrivateKey);`,
                afterCode: `import { MLDSA44 } from '@openquantumsafe/oqs';
const signature = await MLDSA44.sign(rpcPayload, pqcPrivateKey);`
            },
            {
                id: 'asset-5',
                name: 'DH-2048',
                role: 'Legacy TLS Key Exchange',
                location: '/config/tls-options.json:14',
                keyLength: '2048-bit',
                family: 'Asymmetric (Finite Field)',
                risk: 'CRITICAL',
                status: 'Not Started',
                moscaFormula: 'X (10y) + Y (2y) = 12y > Z (7y / 2031) — CRITICAL',
                moscaDesc: 'Legacy cipher suites configured in nginx ingress allow eavesdropping recordings.',
                purpose: 'Diffie-Hellman parameters used in fallback TLS 1.2 handshakes for legacy partner integrations.',
                riskReason: "Shor's algorithm breaks finite field discrete logarithm in sub-exponential quantum time.",
                replacement: 'Enforce TLS 1.3 with ML-KEM-768 (X25519Kyber768Draft00)',
                beforeCode: `ssl_dhparam /etc/ssl/certs/dhparam2048.pem;
ssl_ciphers 'ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384';`,
                afterCode: `ssl_protocols TLSv1.3;
ssl_curves X25519MLKEM768:x25519:secp256r1;`
            },
            {
                id: 'asset-6',
                name: 'MD5',
                role: 'Password Checksum Legacy',
                location: '/src/legacy/hash.js:12',
                keyLength: '128-bit',
                family: 'Cryptographic Hash',
                risk: 'CRITICAL',
                status: 'Not Started',
                moscaFormula: 'COLLISION BROKEN (Classical & Quantum Zero Resistance)',
                moscaDesc: 'Broken classically since 2004; trivially broken quantumly.',
                purpose: 'Internal file hash verification and legacy password hashing check.',
                riskReason: 'Completely broken hash function vulnerable to collision and preimage attacks.',
                replacement: 'Argon2id for passwords; SHA3-256 for data checksums',
                beforeCode: `const hash = crypto.createHash('md5').update(password).digest('hex');`,
                afterCode: `const argon2 = require('argon2');
const hash = await argon2.hash(password, { type: argon2.argon2id });`
            },
            {
                id: 'asset-7',
                name: 'AES-256-GCM',
                role: 'Database Column Encryption',
                location: '/src/db/encryption.js:33',
                keyLength: '256-bit',
                family: 'Symmetric Block Cipher',
                risk: 'SAFE',
                status: 'Migrated',
                moscaFormula: '256-bit key -> Grover provides 128-bit security margin. SAFE.',
                moscaDesc: "Grover's algorithm halves effective symmetric key length from 256 to 128 bits, which remains computationally infeasible.",
                purpose: 'Encrypts credit card PAN and personal identifier columns at rest in PostgreSQL.',
                riskReason: 'Quantum safe: 128 bits of post-quantum security margin is recognized by NIST as secure beyond 2050.',
                replacement: 'No migration required. Retain AES-256-GCM.',
                beforeCode: `// SAFE: AES-256-GCM meets NIST PQC standard
const cipher = crypto.createCipheriv('aes-256-gcm', key256, iv);`,
                afterCode: `// Already PQC-Compliant: No change necessary
const cipher = crypto.createCipheriv('aes-256-gcm', key256, iv);`
            },
            {
                id: 'asset-8',
                name: 'SHA-256',
                role: 'HMAC Webhook Signatures',
                location: '/src/webhooks/sign.js:29',
                keyLength: '256-bit',
                family: 'Cryptographic Hash',
                risk: 'SAFE',
                status: 'Migrated',
                moscaFormula: 'Grover collision cost O(2^128). Post-Quantum Safe.',
                moscaDesc: "NIST evaluates SHA-256 as possessing sufficient quantum collision resistance.",
                purpose: 'Verifies webhook payload integrity sent to third-party payment merchants.',
                riskReason: 'Quantum-safe: Collision resistance under Grover attack remains 2^128 operations.',
                replacement: 'Retain SHA-256 or optionally adopt SHA3-256.',
                beforeCode: `const hmac = crypto.createHmac('sha256', secret).update(body).digest('hex');`,
                afterCode: `// PQC Compliant: Retain HMAC-SHA256
const hmac = crypto.createHmac('sha256', secret).update(body).digest('hex');`
            },
            {
                id: 'asset-9',
                name: 'RSA-2048',
                role: 'Outbound TLS Client Auth',
                location: '/certs/client-tls.crt:1',
                keyLength: '2048-bit',
                family: 'Asymmetric (Factorization)',
                risk: 'CRITICAL',
                status: 'Not Started',
                moscaFormula: 'X (5y) + Y (2y) = 7y = Z (7y / 2031) — DEADLINE AT RISK',
                moscaDesc: 'M2M mutual TLS authentication will fail validation once quantum attackers can forge certificates.',
                purpose: 'Authenticates backend microservices to external bank core settlement networks.',
                riskReason: "Vulnerable to quantum private key recovery via Shor's algorithm.",
                replacement: 'Stateful Hash-Based Signature SLH-DSA (FIPS 205) or ML-DSA',
                beforeCode: `const agent = new https.Agent({
  cert: fs.readFileSync('client-rsa2048.crt'),
  key: fs.readFileSync('client-rsa2048.key')
});`,
                afterCode: `const agent = new pqcHttps.Agent({
  cert: fs.readFileSync('client-mldsa65.crt'),
  key: fs.readFileSync('client-mldsa65.key')
});`
            },
            {
                id: 'asset-10',
                name: 'PBKDF2-SHA1',
                role: 'Key Derivation Function',
                location: '/src/crypto/kdf.js:54',
                keyLength: '160-bit hash',
                family: 'Password KDF',
                risk: 'HIGH',
                status: 'Not Started',
                moscaFormula: 'SHA-1 collision + low iterations creates acute vulnerability.',
                moscaDesc: 'Classical collision attacks plus quantum preimage speedup mandate immediate replacement.',
                purpose: 'Derives encryption keys from master passphrase for local backup archives.',
                riskReason: 'SHA-1 has known collision weaknesses and low iteration count facilitates quantum brute-force.',
                replacement: 'HKDF with SHA3-512 or Argon2id',
                beforeCode: `crypto.pbkdf2(pass, salt, 10000, 32, 'sha1', (err, key) => { ... });`,
                afterCode: `// PQC Standard: Argon2id or HKDF-SHA384
const key = await argon2.hash(pass, { salt, hashLength: 32, type: argon2.argon2id });`
            }
        ]
    },

    health: {
        id: 'health',
        name: 'Healthcare Records API',
        runtime: 'Java • EHR data store',
        codeLang: 'Java (Spring Boot)',
        sampleCode: `// Java Cryptography Architecture (JCA)
KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
kpg.initialize(2048);
KeyPair kp = kpg.generateKeyPair();

KeyAgreement ka = KeyAgreement.getInstance("ECDH");
ka.init(kp.getPrivate());

Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
cipher.init(Cipher.ENCRYPT_MODE, secretKey);`,
        score: 15,
        scoreBadge: 'CRITICAL',
        exposureDesc: 'Patient EHR records have 30+ year retention legal requirements. High vulnerability to HNDL.',
        totalAssets: 10,
        criticalCount: 5,
        highCount: 3,
        pqcReadyCount: 1,
        topRisks: [
            {
                name: 'RSA-2048',
                category: 'HIPAA Record Encryption',
                risk: 'CRITICAL',
                desc: 'Patient health information retained for 30 years. Captured data will be decrypted during patient lifespan.',
                target: 'ML-KEM-1024',
                assetId: 'asset-1'
            },
            {
                name: 'ECDH P-256',
                category: 'FHIR API Key Exchange',
                risk: 'CRITICAL',
                desc: 'FHIR REST interface session keys vulnerable to quantum eavesdropping.',
                target: 'ML-KEM-768',
                assetId: 'asset-2'
            },
            {
                name: 'DH-2048',
                category: 'HL7 Legacy Tunnel',
                risk: 'CRITICAL',
                desc: 'Hospital interconnect VPN relies on classical Diffie-Hellman.',
                target: 'ML-KEM-768',
                assetId: 'asset-5'
            }
        ],
        assets: [
            {
                id: 'health-1',
                name: 'RSA-2048',
                role: 'HIPAA Record Encryption',
                location: '/src/records/Encryptor.java:31',
                keyLength: '2048-bit',
                family: 'Asymmetric (Factorization)',
                risk: 'CRITICAL',
                status: 'Not Started',
                x: 30, y: 3,
                moscaFormula: 'X (30y) + Y (3y) = 33y > Z (7y / 2031) — EXCEEDED',
                moscaDesc: 'Patient records must be retained 30+ years under HIPAA. Data encrypted today will be decryptable during the patient\'s lifetime.',
                purpose: 'Encrypts patient health records (EHR) at rest in the hospital data warehouse.',
                riskReason: "Shor's algorithm factors RSA-2048 in polynomial time. With a 30-year data shelf life, every record captured today is exposed to Harvest Now, Decrypt Later.",
                replacement: 'ML-KEM-1024 (NIST FIPS 203) for record envelope encryption',
                beforeCode: `KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
kpg.initialize(2048);
// wraps per-record AES data keys with RSA-OAEP`,
                afterCode: `KEM.getInstance("ML-KEM-1024");
// NIST FIPS 203: encapsulate per-record AES-256 data keys
// hybrid mode: X25519 + ML-KEM-1024 during transition`
            },
            {
                id: 'health-2',
                name: 'ECDH P-256',
                role: 'FHIR API Session Keys',
                location: '/src/fhir/SessionManager.java:52',
                keyLength: '256-bit',
                family: 'Asymmetric (Elliptic Curve)',
                risk: 'CRITICAL',
                status: 'Not Started',
                x: 25, y: 3,
                moscaFormula: 'X (25y) + Y (3y) = 28y > Z (7y / 2031) — EXCEEDED',
                moscaDesc: 'FHIR REST interface sessions carry clinical data retained for decades.',
                purpose: 'Establishes ephemeral session keys for FHIR R4 clinical API traffic.',
                riskReason: 'ECDLP is broken by Shor\'s algorithm; recorded FHIR sessions can be retroactively decrypted.',
                replacement: 'X25519 + ML-KEM-768 hybrid key exchange',
                beforeCode: `KeyAgreement ka = KeyAgreement.getInstance("ECDH");
ka.init(ecPrivateKey);`,
                afterCode: `HybridKEM kem = HybridKEM.getInstance("X25519-ML-KEM-768");
SharedSecret ss = kem.encapsulate(peerPqcKey);`
            },
            {
                id: 'health-3',
                name: 'AES-128-CBC',
                role: 'Legacy Ward Terminal DB',
                location: '/src/legacy/WardDb.java:88',
                keyLength: '128-bit',
                family: 'Symmetric Block Cipher',
                risk: 'HIGH',
                status: 'Not Started',
                x: 20, y: 2,
                moscaFormula: 'Grover halves 128-bit keys to 64-bit effective security — INSECURE',
                moscaDesc: 'AES-128 offers only 64-bit post-quantum security; NIST mandates AES-256 for data beyond 2030.',
                purpose: 'Encrypts legacy ward-terminal database volumes (unmaintained Pascal-era system).',
                riskReason: 'Grover\'s algorithm quadratically speeds brute-force; 128-bit keys fall to 64-bit effective strength. CBC mode is also malleable.',
                replacement: 'AES-256-GCM (re-key via PQC KEM envelope)',
                beforeCode: `Cipher c = Cipher.getInstance("AES/CBC/PKCS5Padding");
c.init(Cipher.ENCRYPT_MODE, aes128Key);`,
                afterCode: `Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
c.init(Cipher.ENCRYPT_MODE, aes256Key, gcmIv);`
            },
            {
                id: 'health-4',
                name: 'DH-2048',
                role: 'HL7 Hospital Interconnect VPN',
                location: '/config/hl7-vpn.conf:9',
                keyLength: '2048-bit',
                family: 'Asymmetric (Finite Field)',
                risk: 'CRITICAL',
                status: 'Not Started',
                x: 25, y: 2,
                moscaFormula: 'X (25y) + Y (2y) = 27y > Z (7y / 2031) — EXCEEDED',
                moscaDesc: 'Hospital-to-hospital HL7 tunnels carry records with decades-long confidentiality requirements.',
                purpose: 'Diffie-Hellman parameters for legacy inter-hospital HL7 message tunnels.',
                riskReason: "Finite-field Diffie-Hellman falls to Shor's algorithm; recorded VPN traffic is decryptable retroactively.",
                replacement: 'TLS 1.3 with ML-KEM-768 (X25519MLKEM768 group)',
                beforeCode: `dhparam /etc/ssl/hl7-dh2048.pem;
ssl_ciphers 'DHE-RSA-AES256-GCM-SHA384';`,
                afterCode: `ssl_protocols TLSv1.3;
ssl_ecdh_curve X25519MLKEM768;`
            },
            {
                id: 'health-5',
                name: 'SHA-1',
                role: 'Legacy Image Integrity Checks',
                location: '/src/pacs/DicomHash.java:64',
                keyLength: '160-bit',
                family: 'Cryptographic Hash',
                risk: 'CRITICAL',
                status: 'Not Started',
                broken: true,
                moscaFormula: 'COLLISION BROKEN (classically, since 2017)',
                moscaDesc: 'SHA-1 collision attacks are practical; PACS image deduplication can be spoofed.',
                purpose: 'Integrity fingerprints for DICOM radiology images in the PACS archive.',
                riskReason: 'Chosen-prefix collisions against SHA-1 are practical; attackers can substitute medical imaging data.',
                replacement: 'SHA3-256 (FIPS 202)',
                beforeCode: `MessageDigest md = MessageDigest.getInstance("SHA-1");`,
                afterCode: `MessageDigest md = MessageDigest.getInstance("SHA3-256");`
            },
            {
                id: 'health-6',
                name: 'ECDSA P-384',
                role: 'Clinical Device Attestation',
                location: '/src/devices/Attestation.java:19',
                keyLength: '384-bit',
                family: 'Asymmetric (Elliptic Curve)',
                risk: 'HIGH',
                status: 'Not Started',
                x: 15, y: 2,
                moscaFormula: 'X (15y) + Y (2y) = 17y > Z (7y / 2031) — EXCEEDED',
                moscaDesc: 'Infusion pump and monitor attestation signatures forgeable post-CRQC.',
                purpose: 'Signs firmware and configuration attestations for connected clinical devices.',
                riskReason: 'Quantum ECDLP breaks P-384; forged device attestations become possible.',
                replacement: 'ML-DSA-87 (NIST FIPS 204)',
                beforeCode: `Signature s = Signature.getInstance("SHA384withECDSA");`,
                afterCode: `Signature s = Signature.getInstance("ML-DSA-87");`
            },
            {
                id: 'health-7',
                name: 'TLS 1.2 (ECDHE-RSA)',
                role: 'Patient Portal TLS',
                location: '/config/portal-tls.conf:3',
                keyLength: 'RSA-2048 cert',
                family: 'Protocol Configuration',
                risk: 'CRITICAL',
                status: 'Not Started',
                x: 20, y: 1,
                moscaFormula: 'Cert chain RSA-2048 — Shor-broken; sessions recorded via HNDL',
                moscaDesc: 'Patient portal sessions use classical ECDHE-RSA handshakes.',
                purpose: 'TLS termination for the public patient portal (appointments, results).',
                riskReason: 'Handshakes recorded today can be decrypted once a CRQC exists; portal traffic includes identity data.',
                replacement: 'TLS 1.3 + ML-KEM-768 hybrid groups, ML-DSA certificate chain',
                beforeCode: `ssl_protocols TLSv1.2;
ssl_ciphers 'ECDHE-RSA-AES256-GCM-SHA384';`,
                afterCode: `ssl_protocols TLSv1.3;
ssl_ecdh_curve X25519MLKEM768;`
            },
            {
                id: 'health-8',
                name: 'AES-256-GCM',
                role: 'Modern EHR Volume Encryption',
                location: '/src/records/VolumeCrypto.java:140',
                keyLength: '256-bit',
                family: 'Symmetric Block Cipher',
                risk: 'SAFE',
                status: 'Migrated',
                safe: true,
                moscaFormula: '256-bit key → 128-bit post-quantum security. SAFE.',
                moscaDesc: 'Grover only halves symmetric strength; AES-256 remains secure beyond 2050.',
                purpose: 'Encrypts the modern EHR storage volumes and backups at rest.',
                riskReason: 'Quantum-safe: 128-bit post-quantum security margin meets NIST guidance.',
                replacement: 'No migration required. Retain AES-256-GCM.',
                beforeCode: `Cipher c = Cipher.getInstance("AES/GCM/NoPadding");`,
                afterCode: `// Already quantum-resilient — retain AES-256-GCM
Cipher c = Cipher.getInstance("AES/GCM/NoPadding");`
            }
        ]
    },

    gov: {
        id: 'gov',
        name: 'Gov Identity Service',
        runtime: 'Python • PKI authentication',
        codeLang: 'Python (Cryptography / PKI)',
        sampleCode: `from cryptography.hazmat.primitives.asymmetric import rsa, ec
from cryptography.hazmat.primitives import hashes

# Citizen identity signature keypair
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048
)

# National ID ECDSA Token
ec_key = ec.generate_private_key(ec.SECP256R1())`,
        score: 25,
        scoreBadge: 'CRITICAL',
        exposureDesc: 'Government classified identity credentials require immediate migration per OMB M-23-02 directive.',
        totalAssets: 10,
        criticalCount: 4,
        highCount: 4,
        pqcReadyCount: 2,
        topRisks: [
            {
                name: 'RSA-2048',
                category: 'National ID Digital Signature',
                risk: 'CRITICAL',
                desc: "Citizen signature keys vulnerable to retroactive forgery via Shor's algorithm.",
                target: 'ML-DSA-65',
                assetId: 'asset-1'
            },
            {
                name: 'ECDSA P-256',
                category: 'Passport Biometric Token',
                risk: 'CRITICAL',
                desc: 'Biometric authorization tokens compromised under CRQC.',
                target: 'Falcon-512 / ML-DSA',
                assetId: 'asset-2'
            },
            {
                name: 'DH-2048',
                category: 'GovCloud VPN Tunnel',
                risk: 'CRITICAL',
                desc: 'Classified payload captures subject to HNDL exploitation.',
                target: 'ML-KEM-1024',
                assetId: 'asset-5'
            }
        ],
        assets: [
            {
                id: 'gov-1',
                name: 'RSA-2048',
                role: 'National ID Signing Key',
                location: '/pki/national_id/signer.py:24',
                keyLength: '2048-bit',
                family: 'Asymmetric (Factorization)',
                risk: 'CRITICAL',
                status: 'Not Started',
                x: 30, y: 3,
                moscaFormula: 'X (30y) + Y (3y) = 33y > Z (7y / 2031) — EXCEEDED',
                moscaDesc: 'National ID signatures must remain trustworthy for the document lifetime (decades). Retroactive forgery invalidates issued credentials.',
                purpose: 'Signs national identity documents and citizen credential payloads.',
                riskReason: "Shor's algorithm enables private-key recovery from the public modulus; issued signatures can be forged post-CRQC.",
                replacement: 'ML-DSA-65 (NIST FIPS 204) with ML-KEM-1024 key transport',
                beforeCode: `private_key = rsa.generate_private_key(
    public_exponent=65537, key_size=2048)
sig = private_key.sign(payload, padding.PKCS1v15(), hashes.SHA256())`,
                afterCode: `private_key = oqs.KeyGen(MlDsa65)
sig = private_key.sign(payload)  # FIPS 204`
            },
            {
                id: 'gov-2',
                name: 'ECDSA P-256',
                role: 'Passport Biometric Token',
                location: '/pki/passport/biometric.py:57',
                keyLength: '256-bit',
                family: 'Asymmetric (Elliptic Curve)',
                risk: 'CRITICAL',
                status: 'Not Started',
                x: 25, y: 3,
                moscaFormula: 'X (25y) + Y (3y) = 28y > Z (7y / 2031) — EXCEEDED',
                moscaDesc: 'Biometric authorization tokens embedded in passports have 10-year validity but archives persist 25+ years.',
                purpose: 'Signs biometric template tokens bound to e-passport chips.',
                riskReason: 'ECDLP broken by Shor\'s algorithm; archived tokens can be forged to impersonate citizens.',
                replacement: 'Falcon-512 (FN-DSA, FIPS 206 draft) or ML-DSA-44',
                beforeCode: `ec_key = ec.generate_private_key(ec.SECP256R1())
sig = ec_key.sign(token, ec.ECDSA(hashes.SHA256()))`,
                afterCode: `falcon_key = oqs.KeyGen(Falcon512)
sig = falcon_key.sign(token)`
            },
            {
                id: 'gov-3',
                name: 'DH-2048',
                role: 'GovCloud VPN Tunnels',
                location: '/config/govcloud_vpn.py:12',
                keyLength: '2048-bit',
                family: 'Asymmetric (Finite Field)',
                risk: 'CRITICAL',
                status: 'Not Started',
                x: 30, y: 2,
                moscaFormula: 'X (30y) + Y (2y) = 32y > Z (7y / 2031) — EXCEEDED',
                moscaDesc: 'Classified inter-agency traffic is a prime HNDL target; tunnel keys recorded today are retroactively breakable.',
                purpose: 'Diffie-Hellman key agreement for inter-agency GovCloud IPsec tunnels.',
                riskReason: "Shor's algorithm breaks finite-field DH; captured classified traffic becomes decryptable.",
                replacement: 'ML-KEM-1024 (FIPS 203) in IKEv2 hybrid mode',
                beforeCode: `dh = dh.generate_parameters(generator=2, key_size=2048)`,
                afterCode: `kem = oqs.KeyEncapsulation(MlKem1024)
ct, ss = kem.encap_secret(peer_pqc_pubkey)`
            },
            {
                id: 'gov-4',
                name: 'RSA-4096',
                role: 'Root CA (National PKI)',
                location: '/pki/root/ca_root.pem:1',
                keyLength: '4096-bit',
                family: 'Asymmetric (Factorization)',
                risk: 'CRITICAL',
                status: 'In Progress',
                x: 30, y: 5,
                moscaFormula: 'X (30y) + Y (5y) = 35y > Z (7y / 2031) — EXCEEDED',
                moscaDesc: 'The root CA anchors every downstream certificate. Root rotation is a 5+ year program on its own.',
                purpose: 'National PKI root of trust — signs intermediate CAs for all government services.',
                riskReason: "RSA-4096 only raises Shor's qubit requirement marginally; the root must move to PQC before intermediates can.",
                replacement: 'ML-DSA-87 root (FIPS 204) with hybrid RSA-4096 bridge certs',
                beforeCode: `openssl req -x509 -newkey rsa:4096 -keyout ca-root.pem -days 7300`,
                afterCode: `oqs-openssl req -x509 -newkey mldsa87 -keyout ca-root-pqc.pem -days 7300`
            },
            {
                id: 'gov-5',
                name: 'SHA-256',
                role: 'Document Registry Integrity',
                location: '/services/registry/hash_chain.py:41',
                keyLength: '256-bit',
                family: 'Cryptographic Hash',
                risk: 'SAFE',
                status: 'Migrated',
                safe: true,
                moscaFormula: 'Grover collision cost O(2^128) — SAFE',
                moscaDesc: 'Registry hash chains remain quantum-resistant under Grover.',
                purpose: 'Hash-chain integrity for the national document registry.',
                riskReason: 'Quantum-safe: 128-bit collision resistance survives Grover.',
                replacement: 'Retain SHA-256 (optionally SHA3-256 for new chains).',
                beforeCode: `hashlib.sha256(record_bytes).hexdigest()`,
                afterCode: `# Quantum-safe — retain
hashlib.sha256(record_bytes).hexdigest()`
            },
            {
                id: 'gov-6',
                name: 'PBKDF2-SHA1',
                role: 'Officer Portal KDF',
                location: '/auth/officer_portal/kdf.py:33',
                keyLength: '160-bit / 10k iter',
                family: 'Password KDF',
                risk: 'HIGH',
                status: 'Not Started',
                brokenHigh: true,
                moscaFormula: 'SHA-1 collision + low iteration count — WEAK',
                moscaDesc: 'Officer portal password derivation uses deprecated SHA-1 with only 10,000 iterations.',
                purpose: 'Derives authentication keys for the internal officer portal login.',
                riskReason: 'SHA-1 collision weakness plus low iteration count makes offline brute-force tractable.',
                replacement: 'Argon2id (memory-hard) or HKDF-SHA3-512',
                beforeCode: `hashlib.pbkdf2_hmac('sha1', pwd, salt, 10000)`,
                afterCode: `argon2.PasswordHasher()  # Argon2id, memory-hard`
            },
            {
                id: 'gov-7',
                name: 'TLS 1.0/1.1 (Legacy)',
                role: 'Legacy Agency Gateway',
                location: '/config/legacy_gateway.conf:2',
                keyLength: 'N/A',
                family: 'Protocol Configuration',
                risk: 'CRITICAL',
                status: 'Not Started',
                broken: true,
                moscaFormula: 'PROTOCOL BROKEN (classically deprecated)',
                moscaDesc: 'TLS 1.0/1.1 are deprecated classically and offer no post-quantum path.',
                purpose: 'Legacy protocol gateway still serving two agencies with 2008-era clients.',
                riskReason: 'Deprecated protocol with known weaknesses; no PQC upgrade path exists — must be retired.',
                replacement: 'Retire legacy gateway; terminate on TLS 1.3 + ML-KEM-768 endpoint',
                beforeCode: `SSLProtocol ALL -SSLv3
# (TLSv1.0/1.1 still accepted)`,
                afterCode: `ssl_protocols TLSv1.3;
ssl_ecdh_curve X25519MLKEM768;`
            },
            {
                id: 'gov-8',
                name: 'AES-256-GCM',
                role: 'Classified Storage Encryption',
                location: '/services/vault/aes_gcm.py:77',
                keyLength: '256-bit',
                family: 'Symmetric Block Cipher',
                risk: 'SAFE',
                status: 'Migrated',
                safe: true,
                moscaFormula: '256-bit key → 128-bit post-quantum security. SAFE.',
                moscaDesc: 'Storage encryption remains secure under Grover; key delivery must move to ML-KEM.',
                purpose: 'Encrypts classified document storage volumes.',
                riskReason: 'Quantum-safe symmetric strength; only the key-wrapping path needs PQC.',
                replacement: 'Retain AES-256-GCM; wrap data keys with ML-KEM-1024.',
                beforeCode: `Cipher(algorithms.AES(key256), modes.GCM(iv))`,
                afterCode: `# Retain AES-256-GCM; ML-KEM-wrapped data keys
Cipher(algorithms.AES(key256), modes.GCM(iv))`
            }
        ]
    }
};

// Live Scan target — populated by the real Python analysis engine via /api/scan
REPOSITORIES.live = {
    id: 'live',
    name: 'Live Scan (Custom Code)',
    runtime: 'Scanned by Python engine',
    codeLang: 'Auto-detect',
    sampleCode: '// Paste your own code here and run a REAL scan.\n// Supports: Python, JavaScript/TypeScript, Java, Go, C/C++\n//\n// Example — try pasting code that uses RSA, ECC, AES, MD5...\nimport ssl\nssl.PROTOCOL_SSLv3\n',
    score: 0,
    scoreBadge: 'PENDING',
    assets: []
};

const REPO_KEYS = ['fintech', 'health', 'gov', 'live'];

// ============================================================================
// MOSCA SIMULATION PARAMETERS (X = data shelf-life, Y = migration time)
// ============================================================================
const ASSET_MOSCA = {
    'asset-1': { x: 10, y: 3 },                        // RSA-2048 JWT
    'asset-2': { x: 5, y: 3 },                         // ECDH P-256
    'asset-3': { x: 15, y: 4 },                        // RSA-4096 Root CA
    'asset-4': { x: 7, y: 2 },                         // ECDSA P-384
    'asset-5': { x: 10, y: 2 },                        // DH-2048
    'asset-6': { broken: true },                       // MD5 — broken classically
    'asset-7': { safe: true },                         // AES-256-GCM
    'asset-8': { safe: true },                         // SHA-256
    'asset-9': { x: 5, y: 2 },                         // RSA-2048 mTLS
    'asset-10': { brokenHigh: true }                   // PBKDF2-SHA1
};

Object.values(REPOSITORIES).forEach(repo =>
    repo.assets.forEach(a => Object.assign(a, ASSET_MOSCA[a.id] || {}))
);

let horizonYear = 2031;

function computeAssetRisk(asset) {
    if (asset.safe) return 'SAFE';
    if (asset.broken) return 'CRITICAL';
    if (asset.brokenHigh) return 'HIGH';
    const z = horizonYear - 2026;                      // planning window in years
    const overrun = (asset.x + effectiveEffortY(asset)) - z;   // Mosca: X + Y vs Z
    if (overrun >= 1) return 'CRITICAL';
    if (overrun >= -2) return 'HIGH';
    return 'MODERATE';
}

// Business criticality feeds migration complexity (Y): mission-critical
// systems take longer to migrate safely; low-impact ones can move faster.
function effectiveEffortY(asset) {
    const base = asset.y || 3;
    if (asset.criticality === 'Mission-Critical') return base + 2;
    if (asset.criticality === 'Low') return Math.max(1, base - 1);
    return base;
}

// ============================================================================
// STATE VARIABLES
// ============================================================================
let currentRepoKey = 'fintech';
let currentView = 'scan';
let selectedAssetId = 'asset-1';
let scanInterval = null;

// ============================================================================
// SCAN STAGES DEFINITION FOR HUD
// ============================================================================
const SCAN_STAGES = [
    { title: 'Parsing Abstract Syntax Tree (AST)...', delay: 350 },
    { title: 'Detecting cryptographic primitives & calls...', delay: 350 },
    { title: 'Identifying RSA-2048 key exchange (Vulnerable)...', delay: 400 },
    { title: 'Identifying ECDH P-256 session exchange (Vulnerable)...', delay: 350 },
    { title: 'Evaluating symmetric key lengths (AES-256-GCM)...', delay: 300 },
    { title: 'Applying Mosca\'s Theorem (X=10yr, Y=3yr, Z=2031)...', delay: 400 },
    { title: 'Checking NIST FIPS 203/204/205 compliance...', delay: 350 },
    { title: 'Calculating Cryptographic Agility score...', delay: 350 },
    { title: 'Generating CycloneDX 1.6 CBOM standard...', delay: 400 },
    { title: 'Synthesizing ML-KEM / ML-DSA remediation code...', delay: 450 }
];

// ============================================================================
// VIEW SWITCHING LOGIC
// ============================================================================
function switchView(viewName) {
    currentView = viewName;

    // Update View Panels
    document.querySelectorAll('.view-panel').forEach(panel => {
        panel.classList.add('hidden');
    });

    const activePanel = document.getElementById(`view-${viewName}`);
    if (activePanel) {
        activePanel.classList.remove('hidden');
        activePanel.classList.add('view-fade');
    }

    // Update Sidebar Item Active States
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });

    const activeNav = document.getElementById(`nav-${viewName}`);
    if (activeNav) {
        activeNav.classList.add('active');
    }

    // Render corresponding view data
    if (viewName === 'executive') {
        renderExecutiveView();
    } else if (viewName === 'risk') {
        renderRiskManagerView();
    } else if (viewName === 'analyst') {
        renderAnalystView();
    }

    // Refresh Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

// ============================================================================
// REPO SELECTION
// ============================================================================
function selectScanRepo(repoKey) {
    currentRepoKey = repoKey;
    const repo = REPOSITORIES[repoKey];

    // Highlight selected card
    REPO_KEYS.forEach(k => {
        const card = document.getElementById(`scan-repo-${k}`);
        if (card) {
            if (k === repoKey) {
                card.className = k === 'live'
                    ? 'scan-repo-card active p-3 rounded-xl border-2 border-emerald-600 bg-emerald-950/30 text-left transition-all'
                    : 'scan-repo-card active p-3 rounded-xl border-2 border-indigo-600 bg-indigo-950/30 text-left transition-all';
            } else if (k === 'live') {
                card.className = 'scan-repo-card p-3 rounded-xl border border-emerald-800/60 bg-emerald-950/20 hover:border-emerald-700 text-left transition-all';
            } else {
                card.className = 'scan-repo-card p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 text-left transition-all';
            }
        }
    });

    // Update Code & Labels
    const codeArea = document.getElementById('scan-source-code');
    const langLabel = document.getElementById('code-lang-label');
    const sidebarLabel = document.getElementById('sidebar-repo-label');

    if (codeArea) codeArea.value = repo.sampleCode;
    if (langLabel) langLabel.textContent = repo.codeLang;
    if (sidebarLabel) {
        sidebarLabel.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ${repo.name}`;
    }

    // Update breadcrumbs across views
    const execBc = document.getElementById('exec-breadcrumb');
    const riskBc = document.getElementById('risk-breadcrumb');
    const analystBc = document.getElementById('analyst-breadcrumb');

    if (execBc) execBc.textContent = `EXECUTIVE VIEW • ${repo.name.toUpperCase()}`;
    if (riskBc) riskBc.textContent = `RISK & MIGRATION MANAGER • ${repo.name.toUpperCase()}`;
    if (analystBc) analystBc.textContent = `SECURITY ANALYST • ${repo.name.toUpperCase()}`;

    try { localStorage.setItem('ecdat-repo', repoKey); } catch (e) {}
}

// ============================================================================
// SCANNING SEQUENCE & HUD CHECKLIST
// ============================================================================
function startScanningSequence() {
    const overlay = document.getElementById('scan-hud-overlay');
    const checklistContainer = document.getElementById('scan-checklist-container');
    const progressBar = document.getElementById('scan-progress-bar');
    const pctBadge = document.getElementById('scan-pct-badge');

    overlay.classList.remove('hidden');
    checklistContainer.innerHTML = '';
    progressBar.style.width = '0%';
    pctBadge.textContent = '0%';

    const stages = [...SCAN_STAGES];
    if (currentRepoKey === 'live') {
        stages.unshift({ title: 'Contacting live analysis engine (Python AST + pattern scan)...', live: true });
    }

    let stepIndex = 0;
    const totalSteps = stages.length;

    // Render placeholder steps
    stages.forEach((stage, idx) => {
        const stepDiv = document.createElement('div');
        stepDiv.id = `scan-step-${idx}`;
        stepDiv.className = 'flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800/60 text-slate-500';
        stepDiv.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                <span>${stage.title}</span>
            </div>
            <span class="text-[10px] font-mono uppercase tracking-wider text-slate-600">pending</span>
        `;
        checklistContainer.appendChild(stepDiv);
    });

    const markStep = (idx, state, stage) => {
        const stepDiv = document.getElementById(`scan-step-${idx}`);
        if (!stepDiv) return;
        if (state === 'running') {
            stepDiv.className = 'flex items-center justify-between p-2 rounded-lg bg-indigo-950/30 border border-indigo-500/40 text-indigo-300';
            stepDiv.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                    <span class="text-white">${stage.title}</span>
                </div>
                <span class="text-[10px] font-mono uppercase tracking-wider text-indigo-400">running...</span>
            `;
        } else if (state === 'done') {
            stepDiv.className = 'flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-emerald-900/40 text-slate-300';
            stepDiv.innerHTML = `
                <div class="flex items-center gap-2">
                    <i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-400"></i>
                    <span>${stage.title}</span>
                </div>
                <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">DONE</span>
            `;
        } else {
            stepDiv.className = 'flex items-center justify-between p-2 rounded-lg bg-red-950/30 border border-red-900/40 text-red-300';
            stepDiv.innerHTML = `
                <div class="flex items-center gap-2">
                    <i data-lucide="x-circle" class="w-3.5 h-3.5 text-red-400"></i>
                    <span>${stage.title}</span>
                </div>
                <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-red-950 text-red-300 border border-red-800">FAILED</span>
            `;
        }
        if (window.lucide) lucide.createIcons();
    };

    const advance = (stage) => {
        stepIndex++;
        const pct = Math.round((stepIndex / totalSteps) * 100);
        progressBar.style.width = `${pct}%`;
        pctBadge.textContent = `${pct}%`;
        processNextStep(stage);
    };

    function processNextStep(prevStage) {
        if (stepIndex >= totalSteps) {
            setTimeout(() => {
                overlay.classList.add('hidden');
                switchView('executive');
            }, 600);
            return;
        }

        const currentStage = stages[stepIndex];
        markStep(stepIndex, 'running', currentStage);

        if (currentStage.live) {
            // Real engine call — result determines whether we continue
            runLiveEngineScan()
                .then((count) => {
                    currentStage.title = `Engine scan complete — ${count} cryptographic assets found`;
                    markStep(stepIndex, 'done', currentStage);
                    advance(currentStage);
                })
                .catch((err) => {
                    currentStage.title = `Live scan failed: ${err.message}`;
                    markStep(stepIndex, 'failed', currentStage);
                    progressBar.style.width = '0%';
                });
            return;
        }

        setTimeout(() => {
            markStep(stepIndex, 'done', currentStage);
            advance(currentStage);
        }, currentStage.delay);
    }

    processNextStep();
}

function skipScanToResults() {
    const overlay = document.getElementById('scan-hud-overlay');
    overlay.classList.add('hidden');
    switchView('executive');
}

// ============================================================================
// LIVE SCAN — real Python analysis engine via /api/scan
// ============================================================================
function detectLanguage(code) {
    if (/def\s+\w+\s*\(|import\s+\w+$|from\s+\w+\s+import/m.test(code)) return 'python';
    if (/require\s*\(|import\s+\{|\w+\.\w+\s*=>|console\.log/m.test(code)) return 'javascript';
    if (/public\s+class|System\.out|KeyPairGenerator|Cipher\.getInstance/m.test(code)) return 'java';
    if (/func\s+\w+\s*\(|package\s+main|import\s+"fmt"/m.test(code)) return 'go';
    if (/#include\s*<|EVP_|RSA_generate|SSL_CTX_/m.test(code)) return 'c';
    if (/(openssl|ssl_ciphers|ssl_protocols)/m.test(code)) return 'config';
    return 'python';
}

function friendlyFamily(family) {
    const map = {
        RSA: 'Asymmetric (Factorization)',
        ECC: 'Asymmetric (Elliptic Curve)',
        DH: 'Asymmetric (Finite Field)',
        DSA: 'Asymmetric (Digital Signature)',
        AES: 'Symmetric Block Cipher',
        '3DES': 'Symmetric (Legacy)',
        DES: 'Symmetric (Legacy)',
        HASH: 'Cryptographic Hash',
        HMAC: 'Cryptographic Hash',
        MD5: 'Cryptographic Hash',
        'SHA-1': 'Cryptographic Hash',
        SHA1: 'Cryptographic Hash',
        TLS: 'Protocol Configuration',
        SSL: 'Protocol Configuration',
        KDF: 'Password KDF'
    };
    if (map[family]) return map[family];
    if (/SHA|MD5|HASH/i.test(family)) return 'Cryptographic Hash';
    if (/RSA|DH|DSA/i.test(family)) return 'Asymmetric (Factorization)';
    if (/EC|ECC/i.test(family)) return 'Asymmetric (Elliptic Curve)';
    if (/AES|DES|SYM/i.test(family)) return 'Symmetric Block Cipher';
    if (/TLS|SSL/i.test(family)) return 'Protocol Configuration';
    return 'Other';
}

function normalizeRisk(classification, algoName) {
    const name = (algoName || '').toUpperCase();
    if (/MD5|SHA-?1\b|DES\b|3DES|SSL|TLS 1\.[01]/.test(name)) return 'BROKEN';
    const level = classification.risk_level;
    if (level === 'CRITICAL' || level === 'HIGH') return 'VULNERABLE';
    if (level === 'MEDIUM' || level === 'VARIES') return 'MODERATE';
    return 'SAFE';
}

function buildLiveAssets(data) {
    const recs = data.recommendations || [];
    return (data.findings || []).map((f, i) => {
        const cls = f.classification || {};
        const rec = recs[i] || {};
        const risk = normalizeRisk(cls, f.algorithm);
        const asset = {
            id: `live-${i}`,
            name: f.algorithm,
            role: `${f.algorithm_family} primitive (${f.language})`,
            location: `${f.file}:${f.line_number}`,
            keyLength: String(f.key_size || 'Unknown'),
            family: friendlyFamily(f.algorithm_family),
            risk: risk === 'SAFE' ? 'SAFE' : (risk === 'MODERATE' ? 'HIGH' : 'CRITICAL'),
            status: 'Not Started',
            moscaFormula: `${f.algorithm_family} → ${cls.quantum_attack || 'quantum analysis'}: ${cls.quantum_impact || 'UNKNOWN'}`,
            moscaDesc: cls.timeline ? `${cls.explanation} ${cls.timeline}` : (cls.explanation || ''),
            purpose: `Detected at ${f.file}:${f.line_number} — matched pattern "${(f.matched_pattern || '').slice(0, 40)}".`,
            riskReason: cls.explanation || 'Quantum impact assessment pending classification.',
            replacement: rec.pqc_replacement ? `${rec.pqc_replacement} (${rec.nist_standard})` : 'Manual review required',
            beforeCode: f.line_content || '',
            afterCode: rec.code_after || `// Migrate to: ${rec.pqc_replacement || 'PQC alternative'}\n${f.line_content || ''}`
        };
        if (risk === 'SAFE') asset.safe = true;
        else if (risk === 'BROKEN') asset.broken = true;
        else asset.x = 10, asset.y = 3;
        return asset;
    });
}

async function runLiveEngineScan() {
    const code = document.getElementById('scan-source-code').value;
    if (!code.trim()) throw new Error('Paste some code first — the engine needs input to scan.');
    const language = detectLanguage(code);

    const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, project_name: 'Live Scan (Custom Code)' })
    });
    if (!res.ok) throw new Error(`Analysis engine returned HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    REPOSITORIES.live.assets = buildLiveAssets(data);
    REPOSITORIES.live.sampleCode = code;
    REPOSITORIES.live.codeLang = language;
    selectedAssetId = REPOSITORIES.live.assets.length ? REPOSITORIES.live.assets[0].id : null;
    selectScanRepo('live');
    return REPOSITORIES.live.assets.length;
}

// ============================================================================
// EXECUTIVE VIEW RENDER
// ============================================================================
function computeSimulatedStats() {
    const repo = REPOSITORIES[currentRepoKey];
    const counts = { CRITICAL: 0, HIGH: 0, MODERATE: 0, SAFE: 0 };
    repo.assets.forEach(a => counts[computeAssetRisk(a)]++);
    const score = Math.max(0, Math.min(100, 100 - counts.CRITICAL * 11 - counts.HIGH * 5 - counts.MODERATE * 2));
    const badge = score >= 80 ? 'RESILIENT' : score >= 55 ? 'MODERATE' : score >= 30 ? 'HIGH RISK' : 'CRITICAL';
    return { repo, counts, score, badge };
}

function renderExecutiveView() {
    const { repo, counts, score, badge } = computeSimulatedStats();

    // Score & Badges
    const scoreElem = document.getElementById('exec-readiness-score');
    const badgeElem = document.getElementById('exec-score-badge');
    const descElem = document.getElementById('exec-exposure-desc');

    const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 55 ? 'text-amber-400' : score >= 30 ? 'text-orange-400' : 'text-red-500';
    const badgeTone = score >= 80
        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
        : score >= 55
            ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            : 'bg-red-500/15 border-red-500/30 text-red-400';

    if (scoreElem) {
        scoreElem.textContent = score;
        scoreElem.className = `text-6xl font-black font-mono ${scoreColor}`;
    }
    if (badgeElem) {
        badgeElem.textContent = badge;
        badgeElem.className = `inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-extrabold tracking-wide uppercase ${badgeTone}`;
    }
    if (descElem) {
        if (!repo.assets.length) {
            descElem.textContent = 'No cryptographic assets detected in this scan. Paste code containing crypto primitives (RSA, ECC, AES, hashing...) or try a bundled scenario.';
        } else {
            descElem.textContent = `${counts.CRITICAL} assets critically vulnerable before ${horizonYear} under Mosca's Theorem (X + Y > Z). ${counts.CRITICAL > 0 ? 'Recommendation: begin migration within 6 months to beat the deadline.' : 'Posture holds under this horizon — monitor annually.'}`;
        }
    }
    const scoreDesc = document.getElementById('exec-score-desc');
    if (scoreDesc) {
        scoreDesc.textContent = counts.CRITICAL >= 5
            ? `Severe exposure: ${counts.CRITICAL} classical public-key assets break under Shor's algorithm before the ${horizonYear} horizon.`
            : counts.CRITICAL > 0
                ? `${counts.CRITICAL} classical public-key assets exposed to Shor's algorithm prior to the ${horizonYear} CRQC horizon.`
                : `No Shor-vulnerable assets exceed Mosca's inequality at the ${horizonYear} horizon.`;
    }

    // Stat Cards
    document.getElementById('stat-total-assets').textContent = repo.assets.length;
    document.getElementById('stat-critical-assets').textContent = counts.CRITICAL;
    document.getElementById('stat-high-assets').textContent = counts.HIGH;
    document.getElementById('stat-pqc-ready-assets').textContent = counts.SAFE;

    renderHorizonVerdict(counts, score);
    renderFamilyDonut();

    // Top 3 Risks Cards — highest-urgency assets under current horizon
    const container = document.getElementById('top-risks-container');
    container.innerHTML = '';

    if (!repo.assets.length) {
        container.innerHTML = `
            <div class="md:col-span-3 bg-slate-950/40 border border-dashed border-slate-700 rounded-xl p-6 text-center">
                <i data-lucide="search-x" class="w-6 h-6 text-slate-500 mx-auto"></i>
                <p class="text-xs text-slate-400 mt-2">Nothing to rank yet — no cryptographic artefacts were found in this target.</p>
            </div>`;
        if (window.lucide) lucide.createIcons();
        return;
    }

    const rankOrder = { CRITICAL: 0, HIGH: 1, MODERATE: 2, SAFE: 3 };
    const topAssets = [...repo.assets]
        .sort((a, b) => (rankOrder[computeAssetRisk(a)] - rankOrder[computeAssetRisk(b)]))
        .slice(0, 3);

    topAssets.forEach(asset => {
        const risk = computeAssetRisk(asset);
        const riskTone = risk === 'CRITICAL'
            ? 'bg-red-500/15 border-red-500/30 text-red-400'
            : risk === 'HIGH'
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
        const card = document.createElement('div');
        card.className = 'bg-slate-950/60 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between';
        card.innerHTML = `
            <div>
                <div class="flex items-center justify-between">
                    <span class="font-bold text-sm text-white font-mono">${asset.name}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-extrabold font-mono border uppercase ${riskTone}">${risk}</span>
                </div>
                <div class="text-[11px] font-medium text-slate-400 mt-1">${asset.role}</div>
                <p class="text-xs text-slate-300 mt-2.5 leading-relaxed">${asset.riskReason}</p>
                <div class="mt-3 pt-3 border-t border-slate-800/80 text-[11px]">
                    <span class="text-slate-500 font-mono">Target:</span>
                    <span class="text-emerald-400 font-mono font-semibold ml-1">${asset.replacement}</span>
                </div>
            </div>
            <button onclick="inspectSpecificAsset('${asset.id}')" class="mt-4 w-full py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-indigo-400 flex items-center justify-center gap-1.5 transition-colors">
                <span>Inspect in Analyst</span>
                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </button>
        `;
        container.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
}

// ============================================================================
// QUANTUM HORIZON SIMULATOR & FAMILY EXPOSURE DONUT
// ============================================================================
function renderHorizonVerdict(counts, score) {
    const verdict = document.getElementById('horizon-verdict');
    const label = document.getElementById('horizon-year-label');
    if (label) label.textContent = horizonYear;
    if (!verdict) return;

    const z = horizonYear - 2026;
    let tone, headline, body;
    if (counts.CRITICAL >= 5) {
        tone = 'text-red-400 border-red-900/50 bg-red-950/20';
        headline = 'MOSCA DEADLINE EXCEEDED';
        body = `With only ${z} years to a ${horizonYear} CRQC, ${counts.CRITICAL} assets have X + Y > Z — data captured today will be decryptable. Immediate migration board-level urgency.`;
    } else if (counts.CRITICAL > 0) {
        tone = 'text-amber-400 border-amber-900/50 bg-amber-950/20';
        headline = 'DEADLINE AT RISK';
        body = `${counts.CRITICAL} assets exceed Mosca's inequality at a ${horizonYear} horizon. Start structured migration within 12 months.`;
    } else {
        tone = 'text-emerald-400 border-emerald-900/50 bg-emerald-950/20';
        headline = 'POSTURE HOLDS';
        body = `No assets exceed X + Y > Z at a ${horizonYear} horizon. Maintain crypto-agility and re-evaluate annually.`;
    }
    verdict.className = `rounded-xl border p-3.5 text-xs leading-relaxed ${tone}`;
    verdict.innerHTML = `<span class="font-mono font-bold tracking-wider">${headline}</span><p class="text-slate-300 mt-1">${body}</p>`;
}

function setHorizonPreset(year) {
    const slider = document.getElementById('horizon-slider');
    if (slider) slider.value = year;
    horizonYear = year;
    renderExecutiveView();
}

function renderFamilyDonut() {
    const repo = REPOSITORIES[currentRepoKey];
    const groups = [
        { label: 'Factorization (RSA/DH)', match: f => /Factorization|Finite Field/.test(f), color: '#ef4444' },
        { label: 'Elliptic Curve (ECC)', match: f => /Elliptic Curve/.test(f), color: '#f59e0b' },
        { label: 'Hash / KDF', match: f => /Hash|KDF/.test(f), color: '#8b5cf6' },
        { label: 'Symmetric', match: f => /Symmetric/.test(f), color: '#10b981' },
        { label: 'Protocol / Other', match: f => /Protocol|Other/.test(f), color: '#64748b' }
    ].map(g => ({ ...g, count: repo.assets.filter(a => g.match(a.family)).length }))
     .filter(g => g.count > 0);

    const total = groups.reduce((s, g) => s + g.count, 0) || 1;
    const R = 46, C = 60, circumference = 2 * Math.PI * R;
    let offset = 0;

    const svg = document.getElementById('family-donut-svg');
    if (svg) {
        svg.innerHTML = `
            <circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="#1e293b" stroke-width="16"/>
            ${groups.map(g => {
                const frac = g.count / total;
                const dash = frac * circumference;
                const el = `<circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="${g.color}" stroke-width="16"
                    stroke-dasharray="${dash} ${circumference - dash}" stroke-dashoffset="${-offset}"
                    transform="rotate(-90 ${C} ${C})"/>`;
                offset += dash;
                return el;
            }).join('')}
            <text x="${C}" y="${C - 2}" text-anchor="middle" fill="#f8fafc" font-size="16" font-weight="800" font-family="JetBrains Mono, monospace">${total}</text>
            <text x="${C}" y="${C + 12}" text-anchor="middle" fill="#64748b" font-size="7" font-family="JetBrains Mono, monospace">ASSETS</text>
        `;
    }

    const legend = document.getElementById('family-donut-legend');
    if (legend) {
        legend.innerHTML = groups.map(g => `
            <div class="flex items-center justify-between gap-2">
                <span class="flex items-center gap-2 text-slate-300">
                    <span class="w-2.5 h-2.5 rounded-sm shrink-0" style="background:${g.color}"></span>${g.label}
                </span>
                <span class="font-mono font-bold text-white">${g.count}</span>
            </div>
        `).join('');
    }
}

function inspectSpecificAsset(assetId) {
    selectedAssetId = assetId;
    switchView('analyst');
}

// ============================================================================
// RISK MANAGER VIEW RENDER & PROGRESS TRACKING
// ============================================================================
function renderRiskManagerView() {
    const repo = REPOSITORIES[currentRepoKey];
    const tbody = document.getElementById('risk-table-body');
    tbody.innerHTML = '';

    // Calculate migration progress
    const total = repo.assets.length;
    const migrated = repo.assets.filter(a => a.status === 'Migrated').length;
    const pct = Math.round((migrated / total) * 100);

    document.getElementById('migrated-count-label').textContent = migrated;
    document.getElementById('total-count-label').textContent = total;
    document.getElementById('migrated-pct-label').textContent = `${pct}% complete`;
    document.getElementById('migration-progress-bar').style.width = `${pct}%`;

    renderMigrationTimeline(repo);

    if (!repo.assets.length) {
        tbody.innerHTML = `
            <tr><td colspan="5" class="py-8 text-center text-xs text-slate-400">
                No cryptographic assets to track. Run a scan that discovers crypto primitives first.
            </td></tr>`;
        return;
    }

    repo.assets.forEach(asset => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-800/30 transition-colors';

        const simRisk = computeAssetRisk(asset);

        // Risk badge colors (recomputed under current horizon)
        let riskBadgeClass = 'bg-red-500/15 border-red-500/30 text-red-400';
        if (simRisk === 'HIGH') riskBadgeClass = 'bg-amber-500/15 border-amber-500/30 text-amber-400';
        if (simRisk === 'MODERATE') riskBadgeClass = 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300';
        if (simRisk === 'SAFE') riskBadgeClass = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';

        // Status badge / selector styling
        row.innerHTML = `
            <td class="py-3.5 px-4 font-mono">
                <div class="font-bold text-white text-xs">${asset.name}</div>
                <div class="text-[11px] text-slate-500">${asset.location}</div>
            </td>
            <td class="py-3.5 px-4">
                <span class="px-2 py-0.5 rounded text-[10px] font-extrabold font-mono border ${riskBadgeClass}">
                    ${simRisk}
                </span>
            </td>
            <td class="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                ${asset.moscaFormula}
            </td>
            <td class="py-3.5 px-4">
                <div class="space-y-1.5">
                    <select onchange="updateAssetStatus('${asset.id}', this.value)" class="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono font-medium focus:outline-none focus:border-indigo-500 text-slate-300">
                        <option value="Not Started" ${asset.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                        <option value="In Progress" ${asset.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Migrated" ${asset.status === 'Migrated' ? 'selected' : ''}>Migrated</option>
                    </select>
                    <select onchange="updateAssetCriticality('${asset.id}', this.value)" title="Business criticality — feeds the Mosca migration-effort estimate"
                            class="block w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-mono font-medium focus:outline-none focus:border-indigo-500 text-slate-300">
                        <option value="Low" ${asset.criticality === 'Low' ? 'selected' : ''}>Low impact</option>
                        <option value="Standard" ${!asset.criticality || asset.criticality === 'Standard' ? 'selected' : ''}>Standard</option>
                        <option value="Mission-Critical" ${asset.criticality === 'Mission-Critical' ? 'selected' : ''}>Mission-Critical</option>
                    </select>
                </div>
            </td>
            <td class="py-3.5 px-4 text-right">
                <button onclick="inspectSpecificAsset('${asset.id}')" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold inline-flex items-center gap-1 transition-colors">
                    <span>Inspect</span>
                    <i data-lucide="arrow-up-right" class="w-3 h-3"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    if (window.lucide) lucide.createIcons();
}

function updateAssetStatus(assetId, newStatus) {
    const repo = REPOSITORIES[currentRepoKey];
    const asset = repo.assets.find(a => a.id === assetId);
    if (asset) {
        asset.status = newStatus;
        renderRiskManagerView();
    }
}

function updateAssetCriticality(assetId, newCriticality) {
    const repo = REPOSITORIES[currentRepoKey];
    const asset = repo.assets.find(a => a.id === assetId);
    if (asset) {
        asset.criticality = newCriticality;
        renderRiskManagerView();
    }
}

// ============================================================================
// MIGRATION TIMELINE (GANTT) — effort bars vs quantum deadline
// ============================================================================
function renderMigrationTimeline(repo) {
    const container = document.getElementById('migration-timeline');
    if (!container) return;
    container.innerHTML = '';

    const startYear = 2026;
    const endYear = 2040;
    const span = endYear - startYear;

    const rankOrder = { CRITICAL: 0, HIGH: 1, MODERATE: 2, SAFE: 3 };
    const actionable = [...repo.assets]
        .filter(a => computeAssetRisk(a) !== 'SAFE')
        .sort((a, b) => rankOrder[computeAssetRisk(a)] - rankOrder[computeAssetRisk(b)]);

    if (!actionable.length) {
        container.innerHTML = `
            <div class="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-700 rounded-xl">
                All assets are quantum-safe — nothing to schedule. 🎉
            </div>`;
        return;
    }

    // Year axis aligned with the bar tracks
    const axisTicks = [2026, 2028, 2031, 2034, 2037, 2040];
    const axis = document.createElement('div');
    axis.className = 'flex items-center gap-3';
    axis.innerHTML = `
        <div class="w-36 shrink-0"></div>
        <div class="flex-1 relative h-5">
            ${axisTicks.map(y => {
                const left = ((y - startYear) / span) * 100;
                const isDeadline = y === horizonYear;
                return `<div class="absolute -translate-x-1/2 text-[9px] font-mono ${isDeadline ? 'text-red-400 font-bold' : 'text-slate-500'}" style="left:${left}%">${y}</div>
                        <div class="absolute top-0 bottom-0 w-px ${isDeadline ? 'bg-red-500/50' : 'bg-slate-700/50'}" style="left:${left}%"></div>`;
            }).join('')}
        </div>
        <div class="w-12 shrink-0"></div>`;
    container.appendChild(axis);

    const barColor = { CRITICAL: '#ef4444', HIGH: '#f59e0b', MODERATE: '#6366f1' };

    actionable.forEach(asset => {
        const risk = computeAssetRisk(asset);
        const effort = effectiveEffortY(asset);
        const barPct = Math.max(6, (effort / span) * 100);
        const deadlinePct = Math.min(100, ((horizonYear - startYear) / span) * 100);
        const overdue = startYear + effort > horizonYear;

        const row = document.createElement('div');
        row.className = 'flex items-center gap-3';
        row.innerHTML = `
            <div class="w-36 shrink-0 text-right">
                <div class="text-[11px] font-bold font-mono text-white truncate">${asset.name}</div>
                <div class="text-[10px] text-slate-500 truncate">${asset.location.split('/').pop()}</div>
            </div>
            <div class="flex-1 relative h-6 bg-slate-950/60 rounded-lg border border-slate-800/60 overflow-visible">
                <div class="absolute top-0 bottom-0 rounded-lg flex items-center px-2 transition-all duration-500"
                     style="left:2%;width:${barPct}%;background:${barColor[risk]}33;border:1px solid ${barColor[risk]}66">
                    <span class="text-[9px] font-mono font-bold" style="color:${barColor[risk]}">${effort}y effort</span>
                </div>
                <div class="absolute top-[-4px] bottom-[-4px] w-0.5 bg-red-500/80 rounded-full" style="left:${deadlinePct}%"></div>
                ${overdue ? `<span class="absolute top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold text-red-400" style="left:${Math.min(deadlinePct + 2, 78)}%">overdue</span>` : ''}
            </div>
            <div class="w-12 shrink-0 text-[10px] font-mono font-bold ${overdue ? 'text-red-400' : 'text-emerald-400'} text-right">
                ${horizonYear}
            </div>
        `;
        container.appendChild(row);
    });
}

// ============================================================================
// ANALYST VIEW RENDER & DETAIL INSPECTOR
// ============================================================================
function renderAnalystView() {
    const repo = REPOSITORIES[currentRepoKey];
    const countLabel = document.getElementById('analyst-asset-count');
    if (countLabel) countLabel.textContent = `${repo.assets.length} cryptographic primitives inspected & analyzed under NIST PQC standards.`;
    const listContainer = document.getElementById('analyst-assets-list');
    listContainer.innerHTML = '';

    if (!repo.assets.length) {
        listContainer.innerHTML = `
            <div class="p-6 text-center border border-dashed border-slate-700 rounded-xl">
                <i data-lucide="package-search" class="w-6 h-6 text-slate-500 mx-auto"></i>
                <p class="text-xs text-slate-400 mt-2">No assets yet — run a scan first.</p>
            </div>`;
        if (window.lucide) lucide.createIcons();
        return;
    }

    repo.assets.forEach(asset => {
        const btn = document.createElement('button');
        const isActive = asset.id === selectedAssetId;
        
        let riskColor = 'text-red-400 bg-red-500/10 border-red-500/30';
        if (asset.risk === 'HIGH') riskColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
        if (asset.risk === 'SAFE') riskColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

        btn.className = `w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
            isActive 
                ? 'bg-indigo-950/40 border-indigo-500/60 shadow-md' 
                : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
        }`;
        
        btn.onclick = () => {
            selectedAssetId = asset.id;
            renderAnalystView();
        };

        btn.innerHTML = `
            <div>
                <div class="font-bold text-xs font-mono ${isActive ? 'text-indigo-300' : 'text-white'}">${asset.name}</div>
                <div class="text-[11px] text-slate-400 mt-0.5 truncate">${asset.role}</div>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${riskColor}">${asset.risk}</span>
        `;

        listContainer.appendChild(btn);
    });

    // Populate Right Inspector Pane
    let currentAsset = repo.assets.find(a => a.id === selectedAssetId);
    if (!currentAsset && repo.assets.length) {
        selectedAssetId = repo.assets[0].id;   // e.g. after switching scenarios
        currentAsset = repo.assets[0];
    }
    if (currentAsset) {
        document.getElementById('inspector-name').textContent = currentAsset.name;
        
        const badge = document.getElementById('inspector-badge');
        badge.textContent = currentAsset.risk;
        if (currentAsset.risk === 'CRITICAL') {
            badge.className = 'px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-red-500/15 border border-red-500/30 text-red-400';
        } else if (currentAsset.risk === 'HIGH') {
            badge.className = 'px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-amber-500/15 border border-amber-500/30 text-amber-400';
        } else {
            badge.className = 'px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-emerald-500/15 border border-emerald-500/30 text-emerald-400';
        }

        // Meta chips
        const metaChips = document.getElementById('inspector-meta-chips');
        metaChips.innerHTML = `
            <span class="px-2 py-0.5 rounded bg-slate-800/80">Key Length: ${currentAsset.keyLength}</span>
            <span class="px-2 py-0.5 rounded bg-slate-800/80">Location: ${currentAsset.location}</span>
            <span class="px-2 py-0.5 rounded bg-slate-800/80">Family: ${currentAsset.family}</span>
        `;

        // Finding details tab
        document.getElementById('inspector-purpose').textContent = currentAsset.purpose;
        
        const riskTitle = document.getElementById('inspector-risk-title');
        if (currentAsset.risk === 'SAFE') {
            riskTitle.textContent = 'Why is this safe?';
            riskTitle.className = 'text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-400';
        } else {
            riskTitle.textContent = 'Why is this risky?';
            riskTitle.className = 'text-[10px] uppercase font-mono font-bold tracking-wider text-red-400';
        }

        document.getElementById('inspector-risk-reason').textContent = currentAsset.riskReason;
        document.getElementById('inspector-mosca-formula').textContent = currentAsset.moscaFormula;
        document.getElementById('inspector-mosca-desc').textContent = currentAsset.moscaDesc;
        document.getElementById('inspector-replacement').textContent = currentAsset.replacement;

        // Remediation tab
        document.getElementById('code-filepath-before').textContent = currentAsset.location.split(':')[0];
        document.getElementById('remediation-before-code').textContent = currentAsset.beforeCode;
        document.getElementById('remediation-after-code').textContent = currentAsset.afterCode;

        // Migration status pill + button state
        const statusLabel = document.getElementById('remediation-status-label');
        const migratedBtn = document.getElementById('mark-migrated-btn');
        if (statusLabel && migratedBtn) {
            const migrated = currentAsset.status === 'Migrated';
            statusLabel.textContent = `Status: ${currentAsset.status}`;
            statusLabel.className = `text-[10px] font-mono ${migrated ? 'text-emerald-400 font-bold' : 'text-slate-500'}`;
            migratedBtn.disabled = migrated;
            migratedBtn.className = migrated
                ? 'px-4 py-2 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 font-bold text-xs flex items-center gap-2 cursor-default'
                : 'px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-emerald-600/20';
            migratedBtn.querySelector('span').textContent = migrated ? 'Migrated ✓' : 'Mark as Migrated ✓';
        }
    }

    if (window.lucide) lucide.createIcons();
}

function markSelectedMigrated() {
    const repo = REPOSITORIES[currentRepoKey];
    const asset = repo.assets.find(a => a.id === selectedAssetId);
    if (!asset || asset.status === 'Migrated') return;
    asset.status = 'Migrated';
    renderAnalystView();
    switchInspectorTab('remediation');
    if (window.lucide) lucide.createIcons();
}

function switchInspectorTab(tabName) {
    const findingTab = document.getElementById('inspector-tab-finding');
    const remediationTab = document.getElementById('inspector-tab-remediation');
    const btnFinding = document.getElementById('tab-btn-finding');
    const btnRemediation = document.getElementById('tab-btn-remediation');

    if (tabName === 'finding') {
        findingTab.classList.remove('hidden');
        remediationTab.classList.add('hidden');
        btnFinding.className = 'pb-2.5 border-b-2 border-indigo-500 text-indigo-400 transition-all';
        btnRemediation.className = 'pb-2.5 border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-all flex items-center gap-1.5';
    } else {
        findingTab.classList.add('hidden');
        remediationTab.classList.remove('hidden');
        btnFinding.className = 'pb-2.5 border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-all';
        btnRemediation.className = 'pb-2.5 border-b-2 border-indigo-500 text-indigo-400 transition-all flex items-center gap-1.5';
    }

    if (window.lucide) lucide.createIcons();
}

function copyRemediatedCode() {
    const codeElem = document.getElementById('remediation-after-code');
    const btnLabel = document.getElementById('copy-btn-label');
    if (codeElem) {
        navigator.clipboard.writeText(codeElem.textContent).then(() => {
            btnLabel.textContent = 'Copied!';
            setTimeout(() => {
                btnLabel.textContent = 'Copy Code';
            }, 2000);
        });
    }
}

// ============================================================================
// THEME TOGGLING (DARK / LIGHT MODE, persisted in localStorage)
// ============================================================================
function syncThemeToggleUI(isDark) {
    const label = document.getElementById('theme-label');
    const thumb = document.getElementById('theme-toggle-thumb');
    const btn = document.getElementById('theme-toggle-btn');
    const icon = document.getElementById('theme-icon');
    if (!label || !thumb || !btn) return;
    if (isDark) {
        label.textContent = 'Dark mode';
        thumb.className = 'w-4 h-4 bg-white rounded-full transition-transform translate-x-5';
        btn.className = 'w-11 h-6 bg-indigo-600 rounded-full p-1 relative transition-colors focus:outline-none';
        if (icon) icon.setAttribute('data-lucide', 'moon');
    } else {
        label.textContent = 'Light mode';
        thumb.className = 'w-4 h-4 bg-white rounded-full transition-transform translate-x-0';
        btn.className = 'w-11 h-6 bg-slate-300 rounded-full p-1 relative transition-colors focus:outline-none';
        if (icon) icon.setAttribute('data-lucide', 'sun');
    }
    if (window.lucide) lucide.createIcons();
}

function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
    } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
    }
    try { localStorage.setItem('ecdat-theme', isDark ? 'light' : 'dark'); } catch (e) {}
    syncThemeToggleUI(!isDark);
}

// ============================================================================
// EXPORT EXECUTIVE PDF REPORT
// ============================================================================
function exportExecutivePDF() {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) return;
    const repo = REPOSITORIES[currentRepoKey];
    const { counts, score, badge } = computeSimulatedStats();
    const doc = new jsPDF();

    // Header
    doc.setFillColor(30, 27, 75);
    doc.rect(0, 0, 210, 34, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('ECDAT — Post-Quantum Risk Report', 14, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${repo.name}  |  Generated ${new Date().toLocaleDateString()}  |  CRQC horizon: ${horizonYear}`, 14, 24);

    // Summary box
    doc.setTextColor(30, 30, 40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Executive Summary', 14, 46);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const readiness = score >= 80 ? 'resilient' : score >= 55 ? 'moderately prepared' : 'critically exposed';
    doc.text([
        `NIST PQC Readiness Score: ${score}/100 (${badge}). The application is ${readiness} against`,
        `a quantum computer arriving by ${horizonYear}.`,
        `${counts.CRITICAL} critical, ${counts.HIGH} high-risk and ${counts.MODERATE} moderate assets require migration.`,
        `Assets flagged CRITICAL violate Mosca's Theorem (X + Y > Z): data with a long shelf life,`,
        `captured today by adversaries ("Harvest Now, Decrypt Later"), will be decrypted once a`,
        `cryptanalytically relevant quantum computer exists.`
    ], 14, 54);

    // Asset table
    const rows = repo.assets.map(a => [
        a.name, a.location, computeAssetRisk(a), a.replacement, a.status
    ]);
    doc.autoTable({
        startY: 92,
        head: [['Asset', 'Location', 'Risk', 'Recommended Replacement', 'Status']],
        body: rows,
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: [79, 70, 229] },
        columnStyles: { 1: { cellWidth: 45 }, 3: { cellWidth: 55 } },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 2) {
                if (data.cell.raw === 'CRITICAL') data.cell.styles.textColor = [220, 38, 38];
                else if (data.cell.raw === 'HIGH') data.cell.styles.textColor = [180, 83, 9];
                else data.cell.styles.textColor = [5, 150, 105];
                data.cell.styles.fontStyle = 'bold';
            }
        }
    });

    // Footer
    const endY = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 130);
    doc.text('Generated by ECDAT (SIH26164) — planning assumption, not a deterministic prediction. Standards: NIST FIPS 203/204, CycloneDX CBOM.', 14, endY);

    doc.save(`ecdat-executive-report-${repo.id}.pdf`);
}

// ============================================================================
// EXPORT CYCLONEDX 1.6 CBOM (crypto components per CycloneDX crypto spec)
// ============================================================================
function exportCBOMJson() {
    const repo = REPOSITORIES[currentRepoKey];
    const { counts } = computeSimulatedStats();

    const uuid = (crypto.randomUUID && crypto.randomUUID())
        || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });

    const components = repo.assets.map((asset, idx) => ({
        type: 'cryptographic-asset',
        'bom-ref': `crypto-asset-${idx + 1}`,
        name: asset.name,
        version: String(asset.keyLength || 'Unknown'),
        description: asset.riskReason,
        properties: [
            { name: 'cdx:crypto:algorithmFamily', value: asset.family },
            { name: 'cdx:crypto:keySize', value: String(asset.keyLength || 'Unknown') },
            { name: 'cdx:crypto:quantumRiskLevel', value: computeAssetRisk(asset) },
            { name: 'cdx:crypto:businessCriticality', value: asset.criticality || 'Standard' },
            { name: 'cdx:crypto:moscaEvaluation', value: asset.safe
                ? 'X + Y <= Z (within safe window)'
                : `X(${asset.x || 0}) + Y(${effectiveEffortY(asset)}) vs Z(${horizonYear - 2026})` },
            { name: 'cdx:crypto:pqcReplacement', value: asset.replacement },
            { name: 'cdx:crypto:sourceFile', value: (asset.location || '').split(':')[0] },
            { name: 'cdx:crypto:sourceLine', value: (asset.location || '').split(':')[1] || '0' },
            { name: 'cdx:crypto:migrationStatus', value: asset.status },
            { name: 'cdx:crypto:hndlVulnerable', value: String(!asset.safe) }
        ]
    }));

    const cbom = {
        bomFormat: 'CycloneDX',
        specVersion: '1.6',
        serialNumber: `urn:uuid:${uuid}`,
        version: 1,
        metadata: {
            timestamp: new Date().toISOString(),
            tools: {
                components: [{
                    type: 'application',
                    name: 'ECDAT - Enterprise Cryptographic Discovery & Analysis Tool',
                    version: '1.0.0',
                    description: 'SIH26164 NTRO: Quantum risk classification, Mosca assessment and PQC recommendation engine.'
                }]
            },
            component: {
                type: 'application',
                name: repo.name,
                version: '1.0.0'
            },
            properties: [
                { name: 'cdx:crypto:crqcHorizonYear', value: String(horizonYear) },
                { name: 'cdx:crypto:readinessScore', value: String(computeSimulatedStats().score) }
            ]
        },
        components,
        compositions: [{
            aggregate: 'complete',
            assemblies: components.map(c => c['bom-ref'])
        }]
    };

    const blob = new Blob([JSON.stringify(cbom, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cbom-${repo.id}-cyclonedx-1.6.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// ============================================================================
// LIVE QUANTUM THREAT COUNTDOWN (to 2031 CRQC planning horizon)
// ============================================================================
const CRQC_HORIZON = new Date('2031-01-01T00:00:00Z');

function startThreatCountdown() {
    const el = document.getElementById('threat-countdown');
    if (!el) return;
    const tick = () => {
        const ms = Math.max(0, CRQC_HORIZON - Date.now());
        const d = Math.floor(ms / 86400000);
        const h = Math.floor(ms / 3600000) % 24;
        const m = Math.floor(ms / 60000) % 60;
        const s = Math.floor(ms / 1000) % 60;
        el.textContent = `${d}d ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };
    tick();
    setInterval(tick, 1000);
}

// ============================================================================
// INITIALIZATION ON LOAD
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    syncThemeToggleUI(document.documentElement.classList.contains('dark'));

    // Restore last selected target (fall back if it was an empty Live Scan)
    let savedRepo = null;
    try { savedRepo = localStorage.getItem('ecdat-repo'); } catch (e) {}
    if (savedRepo && REPO_KEYS.includes(savedRepo)
        && !(savedRepo === 'live' && !(REPOSITORIES.live.assets || []).length)) {
        selectScanRepo(savedRepo);
    } else {
        selectScanRepo('fintech');
    }
    switchView('scan');
    startThreatCountdown();

    const slider = document.getElementById('horizon-slider');
    if (slider) {
        slider.addEventListener('input', (e) => {
            horizonYear = parseInt(e.target.value, 10);
            renderExecutiveView();
        });
    }
});
