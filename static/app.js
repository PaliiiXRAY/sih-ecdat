// ECDAT Client Application - SIH26164 (NTRO)
// Full Figma Design Implementation with Dynamic Gauge, Dual Device View & Remediation Engine

let currentRepo = 'finpay-auth';
let currentTab = 'posture';
let currentDevice = 'mobile';
let currentTheme = 'light';

// Repository Database (Matching Figma Prototype 100%)
const REPOSITORIES = {
    'finpay-auth': {
        name: 'finpay-auth',
        branch: 'main',
        grade: 'GRADE D — HIGH QUANTUM EXPOSURE',
        gradeShort: 'GRADE D',
        gradeBadgeClass: 'bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300',
        gaugeColor: '#ef4444',
        score: 20,
        discovered: 8,
        critical: 5,
        urgency: 2,
        sla: '• SLA: 14 days',
        safe: 3,
        summary: "Vulnerable to Shor's algorithm on CRQC. <strong class='text-slate-900 dark:text-white font-semibold'>62% asymmetric crypto</strong> requires urgent migration.",
        hndlTarget: "Exposure Target: High-Value Financial Auth Tokens",
        hndlDescription: "Encrypted traffic intercepted today has an estimated 10-year exposure window against cryptanalytically relevant quantum computers (CRQC).",
        tasks: [
            {
                id: 'task-rsa-2048',
                severity: 'URGENT',
                algorithm: 'RSA-2048',
                cvss: '9.1',
                badgeColor: 'text-red-600 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900',
                file: 'auth/keys.py:18',
                purpose: 'Key Exchange',
                target: 'Migrate to ML-KEM-768 (NIST FIPS 203)',
                targetCalloutClass: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300',
                arrowColor: 'text-emerald-600',
                subtext: 'Shor susceptible • Polynomial-time prime factorization',
                lockColor: 'text-red-500',
                resolved: false,
                codeBefore: `from Crypto.PublicKey import RSA\nfrom Crypto.Cipher import PKCS1_OAEP\n\n# Vulnerable to Shor's Polynomial-time Prime Factorization\nkey = RSA.generate(2048)\ncipher = PKCS1_OAEP.new(key)`,
                codeAfter: `# Quantum-Resilient Module-Lattice Key Encapsulation (FIPS 203)\nfrom pqcrypto.kem.ml_kem_768 import generate_keypair, encrypt, decrypt\n\npublic_key, secret_key = generate_keypair()\nciphertext, shared_secret = encrypt(public_key)`,
                guidance: `Install standard liboqs-python or cryptography>=43.0. Replace asymmetric key generation with ML-KEM-768 module-lattice primitive. Encapsulation ciphertexts are 1088 bytes.`,
                riskyTitle: `Why is RSA-2048 Vulnerable?`,
                riskyExpl: `Shor's Algorithm executed on a Cryptanalytically Relevant Quantum Computer (CRQC) reduces prime factorization from sub-exponential time O(exp(c*n^(1/3))) to polynomial time O(n^3). An adversary capturing current session tokens can store them (HNDL) and decrypt all historical records once a CRQC is built.`
            },
            {
                id: 'task-ecdsa-p256',
                severity: 'HIGH',
                algorithm: 'ECDSA P-256',
                cvss: '8.4',
                badgeColor: 'text-red-600 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900',
                file: 'signing.py:42',
                purpose: 'Digital Signature',
                target: 'Migrate to ML-DSA-65 (NIST FIPS 204)',
                targetCalloutClass: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300',
                arrowColor: 'text-emerald-600',
                subtext: 'Elliptic curve discrete log vulnerable to quantum Fourier transform',
                lockColor: 'text-red-500',
                resolved: false,
                codeBefore: `from ecdsa import SigningKey, NIST256p\n\n# Vulnerable to Quantum Discrete Logarithm Attack\nsk = SigningKey.generate(curve=NIST256p)\nsignature = sk.sign(b"auth_payload")`,
                codeAfter: `# NIST FIPS 204 Module-Lattice Digital Signature Standard\nfrom pqcrypto.sign.ml_dsa_65 import generate_keypair, sign, verify\n\npk, sk = generate_keypair()\nsignature = sign(sk, b"auth_payload")`,
                guidance: `FIPS 204 (ML-DSA-65) provides 128-bit quantum security level. Replace secp256r1 signing with lattice vectors. Public keys are 1952 bytes and signatures are 3309 bytes.`,
                riskyTitle: `Why is ECDSA P-256 at Risk?`,
                riskyExpl: `Elliptic Curve cryptography relies on the discrete logarithm problem. On a quantum computer with ~2330 logical qubits, Shor's algorithm computes the discrete logarithm in seconds, allowing attackers to forge arbitrary digital signatures on financial transfers.`
            },
            {
                id: 'task-dh-2048',
                severity: 'MEDIUM',
                algorithm: 'Diffie-Hellman 2048',
                cvss: '6.8',
                badgeColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900',
                file: 'transport/tls.py:65',
                purpose: 'TLS Handshake',
                target: 'Implement Hybrid X25519 + ML-KEM-768',
                targetCalloutClass: 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-800 dark:text-blue-300',
                arrowColor: 'text-blue-600',
                subtext: 'Ephemeral DH key exchange vulnerable to harvest-now-decrypt-later',
                lockColor: 'text-amber-500',
                resolved: false,
                codeBefore: `from cryptography.hazmat.primitives.asymmetric import dh\n\n# Classical Ephemeral Diffie-Hellman\nparameters = dh.generate_parameters(generator=2, key_size=2048)\nserver_key = parameters.generate_private_key()`,
                codeAfter: `# Hybrid Post-Quantum + Classical Key Agreement (IETF draft)\nfrom pqcrypto.hybrid import X25519_ML_KEM_768\n\nhybrid_client = X25519_ML_KEM_768()\nshared_key = hybrid_client.exchange()`,
                guidance: `Enables backwards compatibility while ensuring quantum resistance. If either algorithm remains secure, communications remain uncrackable.`,
                riskyTitle: `Why is Diffie-Hellman Vulnerable?`,
                riskyExpl: `Classical DH uses modular exponentiation. CRQC solves this via period-finding quantum algorithms. Hybrid key exchanges combine classical elliptic curves with lattice KEMs so existing regulatory audits pass while providing forward secrecy.`
            }
        ]
    },
    'secure-comms': {
        name: 'secure-comms',
        branch: 'main',
        grade: 'GRADE C — MODERATE EXPOSURE',
        gradeShort: 'GRADE C',
        gradeBadgeClass: 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300',
        gaugeColor: '#f59e0b',
        score: 45,
        discovered: 12,
        critical: 7,
        urgency: 3,
        sla: '• SLA: 7 days',
        safe: 5,
        summary: "Hybrid handshake partially active. <strong class='text-slate-900 dark:text-white font-semibold'>42% legacy RSA certificates</strong> and short AES keys require elevation.",
        hndlTarget: "Exposure Target: Tactical Defense IPsec Mesh Tunnels",
        hndlDescription: "Radio telemetry intercepted in transit is subject to government-grade quantum decryption schedules within 7-8 years.",
        tasks: [
            {
                id: 'task-rsa-4096',
                severity: 'HIGH',
                algorithm: 'RSA-4096 Certificate',
                cvss: '8.2',
                badgeColor: 'text-red-600 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900',
                file: 'crypto/handshake.c:112',
                purpose: 'Node Identity',
                target: 'Migrate to ML-DSA-87 (NIST FIPS 204)',
                targetCalloutClass: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300',
                arrowColor: 'text-emerald-600',
                subtext: '4096-bit key length only delays quantum factoring by ~45 seconds',
                lockColor: 'text-red-500',
                resolved: false,
                codeBefore: `EVP_PKEY *pkey = EVP_RSA_gen(4096);\nX509_sign(cert, pkey, EVP_sha256());`,
                codeAfter: `// FIPS 204 High-Security ML-DSA-87\nEVP_PKEY *pkey = EVP_PKEY_Q_keygen(libctx, NULL, "ML-DSA-87");\nX509_sign(cert, pkey, NULL);`,
                guidance: `Upgrades root certificates from vulnerable 4096-bit primes to NIST Category 5 lattice security.`,
                riskyTitle: `Does 4096-bit RSA protect against Quantum Computers?`,
                riskyExpl: `No! Doubling RSA key size from 2048 to 4096 increases classical cracking difficulty exponentially, but only increases quantum cracking time by a cubic polynomial factor. A CRQC breaks 4096-bit RSA in minutes.`
            },
            {
                id: 'task-ecdh-secp384',
                severity: 'MEDIUM',
                algorithm: 'ECDH secp384r1',
                cvss: '7.1',
                badgeColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900',
                file: 'vpn/tunnel.go:88',
                purpose: 'Tunnel Key Exch',
                target: 'Migrate to ML-KEM-1024 (NIST FIPS 203)',
                targetCalloutClass: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300',
                arrowColor: 'text-emerald-600',
                subtext: 'Replace with NIST Category 5 Module-Lattice primitive',
                lockColor: 'text-amber-500',
                resolved: false,
                codeBefore: `curve := elliptic.P384()\nprivKey, _ := ecdh.P384().GenerateKey(rand.Reader)`,
                codeAfter: `// Go Cryptography FIPS 203 ML-KEM-1024\npk, sk, _ := mlkem1024.GenerateKey()`,
                guidance: `Drop-in replacement for high-security government VPN tunnels with 1568-byte ciphertexts.`,
                riskyTitle: `ECDH secp384r1 Vulnerability`,
                riskyExpl: `Elliptic curves of all standard bit lengths (256, 384, 521) are fully breakable under quantum computing.`
            }
        ]
    },
    'pqc-reference': {
        name: 'pqc-reference',
        branch: 'main',
        grade: 'GRADE A — QUANTUM RESILIENT',
        gradeShort: 'GRADE A',
        gradeBadgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300',
        gaugeColor: '#10b981',
        score: 96,
        discovered: 6,
        critical: 0,
        urgency: 0,
        sla: '• All SLAs Met',
        safe: 6,
        summary: "Compliant with NIST Post-Quantum Standards. <strong class='text-slate-900 dark:text-white font-semibold'>100% cryptographic endpoints</strong> verified quantum-resilient.",
        hndlTarget: "Exposure Target: None (Post-Quantum Protected)",
        hndlDescription: "All key encapsulation and digital signature handshakes utilize lattice algorithms immune to known quantum attack algorithms.",
        tasks: []
    }
};

let activeFixTask = null;

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    renderCurrentRepository();
});

// Switch Repository
function switchRepository(repoKey) {
    if (!REPOSITORIES[repoKey]) return;
    currentRepo = repoKey;
    closeRepoDropdown();
    renderCurrentRepository();
}

function renderCurrentRepository() {
    const repo = REPOSITORIES[currentRepo];
    if (!repo) return;

    // Header labels
    document.getElementById('current-repo-name').textContent = repo.name;
    document.getElementById('mobile-repo-label').textContent = repo.name;

    // Notification badge
    const badgeCount = repo.tasks.filter(t => !t.resolved).length;
    document.getElementById('mobile-bell-badge').textContent = badgeCount;
    document.getElementById('nav-fixes-badge').textContent = badgeCount;
    document.getElementById('fixes-count-pill').textContent = `${badgeCount} Actionable Tasks`;

    // 1. Mobile Screen Posture Updates
    document.getElementById('gauge-score-text').textContent = repo.score;
    document.getElementById('posture-grade-text').textContent = repo.grade;
    document.getElementById('posture-grade-pill').className = `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-mono uppercase tracking-wide ${repo.gradeBadgeClass}`;
    document.getElementById('posture-summary-text').innerHTML = repo.summary;

    // Metric counts
    document.getElementById('stat-discovered').textContent = repo.discovered;
    document.getElementById('stat-critical').textContent = repo.critical;
    document.getElementById('stat-urgency').textContent = repo.urgency;
    document.getElementById('stat-sla').textContent = repo.sla;
    document.getElementById('stat-safe').textContent = repo.safe;

    // Threat details
    document.getElementById('hndl-description').textContent = repo.hndlDescription;
    document.getElementById('hndl-target-text').textContent = repo.hndlTarget;

    // 2. Desktop Posture Updates
    document.getElementById('desktop-gauge-score-text').textContent = repo.score;
    document.getElementById('desktop-posture-grade-text').textContent = repo.grade;
    document.getElementById('desktop-posture-grade-pill').className = `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono uppercase ${repo.gradeBadgeClass}`;
    document.getElementById('desktop-posture-summary').innerHTML = repo.summary;
    document.getElementById('desktop-stat-discovered').textContent = repo.discovered;
    document.getElementById('desktop-stat-critical').textContent = repo.critical;
    document.getElementById('desktop-stat-urgency').textContent = repo.urgency;
    document.getElementById('desktop-stat-sla').textContent = repo.sla;
    document.getElementById('desktop-stat-safe').textContent = repo.safe;
    document.getElementById('desktop-hndl-text').textContent = repo.hndlDescription;
    document.getElementById('desktop-hndl-target').innerHTML = `<i data-lucide="box" class="w-3.5 h-3.5"></i><span>${repo.hndlTarget}</span>`;

    // 3. Animate SVG Gauge Arc
    // Dasharray is 290 390; offset goes from 290 (0%) down to 0 (100%)
    const circumference = 290;
    const offset = Math.round(circumference * (1 - repo.score / 100));
    
    const circleEl = document.getElementById('gauge-progress-circle');
    circleEl.style.strokeDashoffset = offset;
    circleEl.setAttribute('stroke', repo.gaugeColor);

    const desktopCircle = document.getElementById('desktop-gauge-progress-circle');
    if (desktopCircle) {
        desktopCircle.style.strokeDashoffset = offset;
        desktopCircle.setAttribute('stroke', repo.gaugeColor);
    }

    // 4. Render Fixes List
    renderFixesList();

    // Re-create icons
    lucide.createIcons();
}

// Render Fixes (Actionable Tasks)
function renderFixesList() {
    const repo = REPOSITORIES[currentRepo];
    const mobileContainer = document.getElementById('fixes-cards-list');
    const desktopContainer = document.getElementById('desktop-fixes-list');

    mobileContainer.innerHTML = '';
    desktopContainer.innerHTML = '';

    if (repo.tasks.length === 0) {
        const emptyHtml = `
            <div class="p-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div class="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                    <i data-lucide="check-circle" class="w-6 h-6"></i>
                </div>
                <h4 class="font-bold text-sm text-slate-900 dark:text-white">Zero Vulnerable Primitives</h4>
                <p class="text-xs text-slate-500">All cryptographic assets comply with NIST FIPS 203/204 Post-Quantum Standards.</p>
            </div>
        `;
        mobileContainer.innerHTML = emptyHtml;
        desktopContainer.innerHTML = emptyHtml;
        return;
    }

    repo.tasks.forEach(task => {
        // Mobile Task Card (Matching Figma Screen 2 100%)
        const mCard = document.createElement('div');
        mCard.className = `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-2.5 text-left transition-all ${task.resolved ? 'opacity-60 bg-slate-50 dark:bg-slate-950' : ''}`;
        
        mCard.innerHTML = `
            <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-1.5 font-bold font-mono">
                    <span class="w-2 h-2 rounded-full ${task.resolved ? 'bg-emerald-500' : 'bg-red-500'}"></span>
                    <span class="${task.resolved ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}">${task.severity} ${task.algorithm}</span>
                </div>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${task.badgeColor}">CVSS ${task.cvss}</span>
            </div>
            
            <div class="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                ${task.file} &bull; ${task.purpose}
            </div>

            <!-- Target Callout Box -->
            <div class="p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${task.targetCalloutClass}">
                <i data-lucide="corner-down-right" class="w-4 h-4 ${task.arrowColor} shrink-0"></i>
                <div>
                    <span class="text-[9px] uppercase font-bold tracking-wider block text-slate-500 dark:text-slate-400 font-mono">TARGET ARCHITECTURE</span>
                    <span class="font-bold text-[11px]">${task.target}</span>
                </div>
            </div>

            <div class="flex items-center gap-1.5 text-[10px] text-slate-500">
                <i data-lucide="lock" class="w-3 h-3 ${task.lockColor}"></i>
                <span>${task.subtext}</span>
            </div>

            <!-- Action Buttons -->
            <div class="pt-1 flex items-center gap-2">
                <button onclick="openFixModal('${task.id}')" class="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs">
                    <i data-lucide="code" class="w-3.5 h-3.5"></i>
                    <span>${task.resolved ? 'View Applied Fix' : 'View Fix'}</span>
                </button>
                <button onclick="openRiskyModal('${task.id}')" class="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Why Risky?
                </button>
                <button onclick="simulateBookmark(this)" class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white" title="Bookmark Task">
                    <i data-lucide="bookmark" class="w-3.5 h-3.5"></i>
                </button>
            </div>
        `;
        mobileContainer.appendChild(mCard);

        // Desktop Task Card
        const dCard = document.createElement('div');
        dCard.className = `p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3 transition-all ${task.resolved ? 'opacity-60 bg-slate-50' : ''}`;
        dCard.innerHTML = `
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full ${task.resolved ? 'bg-emerald-500' : 'bg-red-500'}"></span>
                        <h4 class="font-bold text-sm font-mono text-slate-900 dark:text-white ${task.resolved ? 'line-through' : ''}">${task.severity} ${task.algorithm}</h4>
                        <span class="px-2 py-0.5 rounded text-xs font-mono font-bold border ${task.badgeColor}">CVSS ${task.cvss}</span>
                    </div>
                    <p class="text-xs text-slate-500 font-mono mt-0.5">${task.file} &bull; Purpose: ${task.purpose}</p>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="openRiskyModal('${task.id}')" class="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">
                        Why Risky?
                    </button>
                    <button onclick="openFixModal('${task.id}')" class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                        <i data-lucide="code" class="w-3.5 h-3.5"></i>
                        <span>${task.resolved ? 'View Applied Fix' : 'View Fix & Code Diff'}</span>
                    </button>
                </div>
            </div>
            <div class="p-3 rounded-lg text-xs flex items-center gap-3 ${task.targetCalloutClass}">
                <i data-lucide="corner-down-right" class="w-4 h-4 ${task.arrowColor}"></i>
                <div>
                    <span class="text-[10px] uppercase font-bold font-mono text-slate-400 block">TARGET NIST ARCHITECTURE</span>
                    <span class="font-bold text-xs">${task.target}</span>
                </div>
            </div>
        `;
        desktopContainer.appendChild(dCard);
    });
}

// Tab Switching inside Mobile App View
function switchMobileTab(tabId) {
    currentTab = tabId;
    ['posture', 'fixes', 'repos', 'reports'].forEach(t => {
        const tabEl = document.getElementById(`tab-${t}`);
        const btnEl = document.getElementById(`nav-btn-${t}`);
        if (t === tabId) {
            tabEl.classList.remove('hidden');
            btnEl.className = "flex flex-col items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold transition-colors";
        } else {
            tabEl.classList.add('hidden');
            btnEl.className = "flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium transition-colors";
        }
    });
    lucide.createIcons();
}

// Device View Toggle (Mobile vs Desktop)
function setDeviceView(mode) {
    currentDevice = mode;
    const btnMobile = document.getElementById('btn-view-mobile');
    const btnDesktop = document.getElementById('btn-view-desktop');
    const containerMobile = document.getElementById('mobile-view-container');
    const containerDesktop = document.getElementById('desktop-view-container');

    if (mode === 'mobile') {
        btnMobile.className = "px-2.5 py-1 rounded-md bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-white flex items-center gap-1 font-semibold";
        btnDesktop.className = "px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-semibold";
        containerMobile.classList.remove('hidden');
        containerDesktop.classList.add('hidden');
    } else {
        btnDesktop.className = "px-2.5 py-1 rounded-md bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-white flex items-center gap-1 font-semibold";
        btnMobile.className = "px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-semibold";
        containerMobile.classList.add('hidden');
        containerDesktop.classList.remove('hidden');
    }
    lucide.createIcons();
}

// Theme Toggle (Light / Dark)
function toggleTheme() {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        currentTheme = 'light';
    } else {
        html.classList.add('dark');
        currentTheme = 'dark';
    }
}

// Dropdown Controls
function toggleRepoDropdown() {
    const menu = document.getElementById('repo-dropdown-menu');
    menu.classList.toggle('hidden');
}

function closeRepoDropdown() {
    const menu = document.getElementById('repo-dropdown-menu');
    menu.classList.add('hidden');
}

// Modal: View Fix & Code Diff
function openFixModal(taskId) {
    const repo = REPOSITORIES[currentRepo];
    const task = repo.tasks.find(t => t.id === taskId);
    if (!task) return;

    activeFixTask = task;
    document.getElementById('modal-fix-title').textContent = `Remediate ${task.algorithm} → ${task.target.split(' ')[2] || task.target}`;
    document.getElementById('modal-fix-file').textContent = `${task.file} • ${task.purpose}`;
    document.getElementById('modal-code-before').textContent = task.codeBefore;
    document.getElementById('modal-code-after').textContent = task.codeAfter;
    document.getElementById('modal-fix-guidance').textContent = task.guidance;
    
    const applyBtn = document.getElementById('btn-apply-fix');
    if (task.resolved) {
        applyBtn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5"></i> <span>Remediation Already Applied</span>`;
        applyBtn.disabled = true;
        applyBtn.className = "px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-default";
    } else {
        applyBtn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5"></i> <span>Apply Remediation (Simulate Migration)</span>`;
        applyBtn.disabled = false;
        applyBtn.className = "px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm";
    }

    document.getElementById('fix-modal').classList.remove('hidden');
    lucide.createIcons();
}

function closeFixModal() {
    document.getElementById('fix-modal').classList.add('hidden');
    activeFixTask = null;
}

function applySimulatedFix() {
    if (!activeFixTask) return;
    activeFixTask.resolved = true;
    
    // Increase repo readiness score
    const repo = REPOSITORIES[currentRepo];
    repo.score = Math.min(100, repo.score + 18);
    repo.critical = Math.max(0, repo.critical - 1);
    repo.safe = repo.safe + 1;
    if (repo.score > 75) {
        repo.grade = 'GRADE A — QUANTUM RESILIENT';
        repo.gaugeColor = '#10b981';
    } else if (repo.score > 40) {
        repo.grade = 'GRADE B — MIGRATION IN PROGRESS';
        repo.gaugeColor = '#f59e0b';
    }

    closeFixModal();
    renderCurrentRepository();
}

// Modal: Why Risky?
function openRiskyModal(taskId) {
    const repo = REPOSITORIES[currentRepo];
    const task = repo.tasks.find(t => t.id === taskId);
    if (!task) return;

    document.getElementById('risky-modal-title').textContent = task.riskyTitle;
    document.getElementById('risky-modal-content').innerHTML = `
        <p><strong>Cryptographic Threat:</strong> ${task.riskyExpl}</p>
        <p class="pt-2"><strong>Recommended Action:</strong> ${task.target}. Standardized by NIST FIPS in 2024 to defend against Harvest Now, Decrypt Later (HNDL) attacks.</p>
    `;
    document.getElementById('risky-modal').classList.remove('hidden');
    lucide.createIcons();
}

function closeRiskyModal() {
    document.getElementById('risky-modal').classList.add('hidden');
}

// Modal: Scan Custom Code
function openCustomScanModal() {
    document.getElementById('scan-modal').classList.remove('hidden');
    closeRepoDropdown();
    lucide.createIcons();
}

function closeCustomScanModal() {
    document.getElementById('scan-modal').classList.add('hidden');
}

function loadSampleCode() {
    document.getElementById('custom-code-input').value = `import hashlib\nfrom Crypto.PublicKey import RSA\nfrom Crypto.Cipher import AES\n\n# User custom banking authentication\ndef init_session():\n    rsa_key = RSA.generate(2048)\n    token_hash = hashlib.md5(b"auth_token").hexdigest()\n    cipher = AES.new(b"16bytekey1234567", AES.MODE_CBC)\n    return rsa_key, token_hash, cipher`;
}

function runCustomCodeScan() {
    const code = document.getElementById('custom-code-input').value.trim();
    if (!code) {
        alert("Please paste code before running scan!");
        return;
    }
    
    // Simulate AST scanner
    closeCustomScanModal();
    alert("AST Scan Complete! Identified 3 cryptographic primitives: RSA-2048 (Vulnerable), MD5 (Broken), AES-128 (Upgrade required). Loading report in Posture view.");
    switchRepository('finpay-auth');
    switchMobileTab('fixes');
}

function simulateBookmark(btn) {
    btn.classList.toggle('text-indigo-600');
    btn.classList.toggle('dark:text-indigo-400');
}

// Export CBOM (CycloneDX JSON)
function exportCbomJson() {
    const repo = REPOSITORIES[currentRepo];
    const cbom = {
        bomFormat: "CycloneDX",
        specVersion: "1.6",
        serialNumber: `urn:uuid:${Math.random().toString(36).substring(2, 15)}`,
        version: 1,
        metadata: {
            timestamp: new Date().toISOString(),
            component: {
                name: repo.name,
                type: "application",
                version: "1.0.0"
            },
            tools: [
                { vendor: "ECDAT", name: "Post-Quantum Cryptographic Discovery Tool", version: "2.4.0" }
            ]
        },
        cryptographicAssets: repo.tasks.map(t => ({
            algorithm: t.algorithm,
            purpose: t.purpose,
            file: t.file,
            quantumResistant: t.resolved,
            cvssScore: parseFloat(t.cvss),
            recommendedStandard: t.target
        }))
    };

    const blob = new Blob([JSON.stringify(cbom, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CBOM-${repo.name}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Export Audit PDF Memo
function exportAuditPdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const repo = REPOSITORIES[currentRepo];

    // Header
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 210, 36, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("ECDAT | Post-Quantum Cryptographic Audit Memo", 14, 18);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(`Repository: ${repo.name} | NIST FIPS 203/204 Compliance Assessment | Generated: ${new Date().toLocaleDateString()}`, 14, 28);

    // Executive Summary
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("1. Executive Security Posture", 14, 48);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.text(`Overall Quantum Readiness Score: ${repo.score} / 100 (${repo.gradeShort})`, 14, 56);
    doc.text(`Cryptographic Assets Discovered: ${repo.discovered}`, 14, 62);
    doc.text(`High-Exposure Assets Requiring Immediate Migration: ${repo.critical}`, 14, 68);
    doc.text(`Harvest Now, Decrypt Later (HNDL) Horizon: Critical Risk (Mosca X+Y > Z)`, 14, 74);

    // Table of Findings
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("2. Cryptographic Remediation Schedule", 14, 90);

    const rows = repo.tasks.map(t => [
        t.algorithm,
        t.purpose,
        t.file,
        `CVSS ${t.cvss}`,
        t.target.split(' (')[0],
        t.resolved ? "RESOLVED" : "ACTION REQUIRED"
    ]);

    doc.autoTable({
        startY: 96,
        head: [['Algorithm', 'Purpose', 'Location', 'CVSS', 'NIST Target Architecture', 'Status']],
        body: rows,
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 8 }
    });

    doc.save(`ECDAT-Post-Quantum-Audit-${repo.name}.pdf`);
}

// Close dropdown on click outside
window.addEventListener('click', (e) => {
    const dropdown = document.getElementById('repo-dropdown-menu');
    const btn = document.getElementById('repo-dropdown-btn');
    if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
        closeRepoDropdown();
    }
});
