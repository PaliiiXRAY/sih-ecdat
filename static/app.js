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
        assets: [] // will mirror fintech structure with healthcare adjustments
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
        assets: []
    }
};

// Mirror assets from fintech to health and gov with slight context adjustments if empty
['health', 'gov'].forEach(repoKey => {
    REPOSITORIES[repoKey].assets = JSON.parse(JSON.stringify(REPOSITORIES.fintech.assets));
});

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
    const overrun = (asset.x + asset.y) - z;           // Mosca: X + Y vs Z
    if (overrun >= 1) return 'CRITICAL';
    if (overrun >= -2) return 'HIGH';
    return 'MODERATE';
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
    ['fintech', 'health', 'gov'].forEach(k => {
        const card = document.getElementById(`scan-repo-${k}`);
        if (card) {
            if (k === repoKey) {
                card.className = 'scan-repo-card active p-3 rounded-xl border-2 border-indigo-600 bg-indigo-950/30 text-left transition-all';
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

    let stepIndex = 0;
    const totalSteps = SCAN_STAGES.length;

    // Render placeholder steps
    SCAN_STAGES.forEach((stage, idx) => {
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

    function processNextStep() {
        if (stepIndex >= totalSteps) {
            setTimeout(() => {
                overlay.classList.add('hidden');
                switchView('executive');
            }, 600);
            return;
        }

        const currentStage = SCAN_STAGES[stepIndex];
        const stepDiv = document.getElementById(`scan-step-${stepIndex}`);
        
        if (stepDiv) {
            stepDiv.className = 'flex items-center justify-between p-2 rounded-lg bg-indigo-950/30 border border-indigo-500/40 text-indigo-300';
            stepDiv.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                    <span class="text-white">${currentStage.title}</span>
                </div>
                <span class="text-[10px] font-mono uppercase tracking-wider text-indigo-400">running...</span>
            `;
        }

        setTimeout(() => {
            if (stepDiv) {
                stepDiv.className = 'flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-emerald-900/40 text-slate-300';
                stepDiv.innerHTML = `
                    <div class="flex items-center gap-2">
                        <i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-400"></i>
                        <span>${currentStage.title}</span>
                    </div>
                    <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">DONE</span>
                `;
                if (window.lucide) lucide.createIcons();
            }

            stepIndex++;
            const pct = Math.round((stepIndex / totalSteps) * 100);
            progressBar.style.width = `${pct}%`;
            pctBadge.textContent = `${pct}%`;

            processNextStep();
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
        descElem.textContent = `${counts.CRITICAL} assets critically vulnerable before ${horizonYear} under Mosca's Theorem (X + Y > Z). ${counts.CRITICAL > 0 ? 'Recommendation: begin migration within 6 months to beat the deadline.' : 'Posture holds under this horizon — monitor annually.'}`;
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
        { label: 'Symmetric', match: f => /Symmetric/.test(f), color: '#10b981' }
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
                <select onchange="updateAssetStatus('${asset.id}', this.value)" class="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono font-medium focus:outline-none focus:border-indigo-500 text-slate-300">
                    <option value="Not Started" ${asset.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                    <option value="In Progress" ${asset.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Migrated" ${asset.status === 'Migrated' ? 'selected' : ''}>Migrated</option>
                </select>
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

// ============================================================================
// ANALYST VIEW RENDER & DETAIL INSPECTOR
// ============================================================================
function renderAnalystView() {
    const repo = REPOSITORIES[currentRepoKey];
    const listContainer = document.getElementById('analyst-assets-list');
    listContainer.innerHTML = '';

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
    const currentAsset = repo.assets.find(a => a.id === selectedAssetId) || repo.assets[0];
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
    }

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
// THEME TOGGLING (DARK / LIGHT MODE)
// ============================================================================
function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.getElementById('theme-label').textContent = 'Light mode';
        document.getElementById('theme-toggle-thumb').className = 'w-4 h-4 bg-white rounded-full transition-transform translate-x-0';
        document.getElementById('theme-toggle-btn').className = 'w-11 h-6 bg-slate-300 rounded-full p-1 relative transition-colors focus:outline-none';
        document.getElementById('theme-icon').setAttribute('data-lucide', 'sun');
    } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        document.getElementById('theme-label').textContent = 'Dark mode';
        document.getElementById('theme-toggle-thumb').className = 'w-4 h-4 bg-white rounded-full transition-transform translate-x-5';
        document.getElementById('theme-toggle-btn').className = 'w-11 h-6 bg-indigo-600 rounded-full p-1 relative transition-colors focus:outline-none';
        document.getElementById('theme-icon').setAttribute('data-lucide', 'moon');
    }
    if (window.lucide) lucide.createIcons();
}

// ============================================================================
// EXPORT CYCLONEDX CBOM JSON
// ============================================================================
function exportCBOMJson() {
    const repo = REPOSITORIES[currentRepoKey];
    const cbom = {
        bomFormat: 'CycloneDX',
        specVersion: '1.6',
        serialNumber: `urn:uuid:${Math.random().toString(36).substring(2, 15)}`,
        version: 1,
        metadata: {
            timestamp: new Date().toISOString(),
            tools: [{ vendor: 'ECDAT', name: 'Post-Quantum Scanner', version: '0.1.0' }],
            component: {
                type: 'application',
                name: repo.name,
                version: '1.0.0'
            }
        },
        cryptographicAssets: repo.assets.map(asset => ({
            name: asset.name,
            type: asset.family,
            location: asset.location,
            quantumVulnerability: asset.risk,
            moscaTheoremEvaluation: asset.moscaFormula,
            targetStandard: asset.replacement
        }))
    };

    const blob = new Blob([JSON.stringify(cbom, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cbom-${repo.id}-cyclonedx.json`;
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
    selectScanRepo('fintech');
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
