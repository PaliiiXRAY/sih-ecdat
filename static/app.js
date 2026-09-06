// ECDAT Client Application - SIH26164 (NTRO)
let currentData = null;
let currentFilter = 'ALL';
let migratedAssets = new Set();

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    setupExports();
    // Default load FinTech demo on initial visit so dashboard is never empty
    loadSampleDirectly('fintech_banking_app');
});

function toggleCustomScanDrawer() {
    const drawer = document.getElementById('customScanDrawer');
    if (drawer.classList.contains('hidden')) {
        drawer.classList.remove('hidden');
        drawer.scrollIntoView({ behavior: 'smooth' });
    } else {
        drawer.classList.add('hidden');
    }
}

function switchInputMode(mode) {
    const modes = ['paste', 'github', 'zip'];
    modes.forEach(m => {
        const btn = document.getElementById(`tabMode${m.charAt(0).toUpperCase() + m.slice(1)}`);
        const sec = document.getElementById(`mode${m.charAt(0).toUpperCase() + m.slice(1)}Section`);
        if (m === mode) {
            btn.className = "px-2.5 py-1 rounded font-bold bg-indigo-600 text-white";
            sec.classList.remove('hidden');
        } else {
            btn.className = "px-2.5 py-1 rounded text-slate-400 hover:text-white";
            sec.classList.add('hidden');
        }
    });
}

function simulateRepoUrlScan() {
    const url = document.getElementById('githubRepoUrl').value.trim();
    if (!url) {
        alert("Please enter a GitHub repository URL!");
        return;
    }
    triggerSampleScan('fintech_banking_app', `Scanned Repo: ${url}`);
}

function simulateZipScan(input) {
    if (input.files && input.files[0]) {
        const fileName = input.files[0].name;
        triggerSampleScan('defense_comms_system', `Archive: ${fileName}`);
    }
}

// 1-Click Demo Trigger with High-Tech Scanning HUD Overlay
async function triggerSampleScan(sampleId, customTitle = null) {
    showScanHud();

    // High-tech step progression
    const step2 = document.getElementById('hudStep2');
    const step3 = document.getElementById('hudStep3');
    const step4 = document.getElementById('hudStep4');

    setTimeout(() => {
        step2.className = "flex items-center gap-2 text-emerald-400";
        step2.innerHTML = `<i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> <span>Extracting algorithms & key lengths</span>`;
        lucide.createIcons();
    }, 280);

    setTimeout(() => {
        step3.className = "flex items-center gap-2 text-emerald-400";
        step3.innerHTML = `<i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> <span>Calculating Mosca migration horizon</span>`;
        lucide.createIcons();
    }, 560);

    setTimeout(() => {
        step4.className = "flex items-center gap-2 text-emerald-400";
        step4.innerHTML = `<i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> <span>Synthesizing NIST PQC drop-in code</span>`;
        lucide.createIcons();
    }, 840);

    setTimeout(async () => {
        await loadSampleDirectly(sampleId, customTitle);
        hideScanHud();
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    }, 1050);
}

function showScanHud() {
    const hud = document.getElementById('scanHudOverlay');
    hud.classList.remove('hidden');
    // Reset HUD steps
    document.getElementById('hudStep1').className = "flex items-center gap-2 text-emerald-400";
    document.getElementById('hudStep2').className = "flex items-center gap-2 text-slate-400";
    document.getElementById('hudStep2').innerHTML = `<span class="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block"></span> <span>Extracting algorithms &amp; key lengths</span>`;
    document.getElementById('hudStep3').className = "flex items-center gap-2 text-slate-400";
    document.getElementById('hudStep3').innerHTML = `<span class="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block"></span> <span>Calculating Mosca migration horizon</span>`;
    document.getElementById('hudStep4').className = "flex items-center gap-2 text-slate-400";
    document.getElementById('hudStep4').innerHTML = `<span class="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block"></span> <span>Synthesizing NIST PQC drop-in code</span>`;
    lucide.createIcons();
}

function hideScanHud() {
    const hud = document.getElementById('scanHudOverlay');
    hud.classList.add('hidden');
}

async function loadSampleDirectly(sampleId, customTitle = null) {
    // Highlight active repo card
    document.querySelectorAll('.repo-card').forEach(c => {
        c.classList.remove('ring-2', 'ring-indigo-400', 'border-indigo-500');
    });
    const activeCardId = sampleId === 'fintech_banking_app' ? 'card-fintech' :
                         sampleId === 'defense_comms_system' ? 'card-defense' : 'card-safe';
    const cardEl = document.getElementById(activeCardId);
    if (cardEl) cardEl.classList.add('ring-2', 'ring-indigo-400');

    try {
        const resp = await fetch(`/api/sample/${sampleId}`);
        const sample = await resp.json();
        
        let combined = '';
        for (const [filename, code] of Object.entries(sample.files)) {
            combined += `# ========== ${filename} ==========\n${code}\n\n`;
        }
        document.getElementById('codeInput').value = combined;
        document.getElementById('langSelect').value = sample.language || 'python';

        const body = {
            sample_id: sampleId,
            sector: document.getElementById('sectorSelect').value,
            horizon: document.getElementById('horizonSelect').value,
            project_name: customTitle || sample.title
        };

        const scanResp = await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const result = await scanResp.json();
        if (result.error) {
            console.error("Scan error:", result.error);
            return;
        }

        currentData = result;
        migratedAssets.clear();
        renderResults(result);
    } catch (err) {
        console.error("Failed to load sample:", err);
    }
}

async function runScan() {
    const code = document.getElementById('codeInput').value.trim();
    if (!code) { 
        alert("Please paste code or select a demo repository above!"); 
        return; 
    }

    const btn = document.getElementById('scanBtn');
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Analyzing AST Syntax Tree...`;
    lucide.createIcons();

    const body = {
        code: code,
        language: document.getElementById('langSelect').value,
        sector: document.getElementById('sectorSelect').value,
        horizon: document.getElementById('horizonSelect').value,
        project_name: "Custom Codebase Scan"
    };

    try {
        const resp = await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const result = await resp.json();
        if (result.error) { 
            alert("Error: " + result.error); 
            return; 
        }
        currentData = result;
        migratedAssets.clear();
        renderResults(result);
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        console.error("Server error:", err);
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="scan" class="w-4 h-4"></i> Run Custom Scan`;
        lucide.createIcons();
    }
}

function getBusinessImpact(algorithmFamily, algorithm) {
    switch(algorithmFamily) {
        case 'RSA':
            return "Customer authentication credentials & long-lived financial tokens can be harvested now and decrypted later by quantum adversaries.";
        case 'ECC':
            return "Digital signatures verifying transaction integrity and identity authentication tokens will become forgeable.";
        case 'DH':
            return "Network key exchanges will be decrypted, exposing session keys for all recorded defense communications.";
        case 'HASH':
            return "Legacy hashing vulnerable to collision attacks, risking credential cracking and forged validation tokens.";
        case 'CIPHER':
            return algorithm.includes('128') || algorithm.includes('3DES') 
                ? "Sub-optimal block/key size vulnerable to Sweet32 collision attacks or quantum Grover reduction."
                : "Symmetric cipher provides 128-bit post-quantum security margin under Grover's algorithm.";
        case 'SECRET':
            return "Hardcoded cryptographic private keys can be extracted directly from source control.";
        default:
            return "Cryptographic transport layer requires cryptographic agility updates.";
    }
}

function getPlainVulnerability(fam, alg) {
    if (fam === 'RSA') return "Integer Factorization (Broken by Shor's Algorithm)";
    if (fam === 'ECC') return "Discrete Logarithm (Broken by Shor's Algorithm)";
    if (fam === 'DH') return "Discrete Logarithm (Broken by Shor's Algorithm)";
    if (fam === 'HASH') return "Hash Collision Attack (Insecure Legacy Hash)";
    if (fam === 'CIPHER' && (alg.includes('128') || alg.includes('3DES') || alg.includes('DES'))) return "Grover Key Halving / 64-bit Sweet32 Collision";
    if (fam === 'SECRET') return "Plaintext Key Leak in Source Control";
    return "Quantum-Resilient (128-bit Post-Quantum Margin)";
}

function renderResults(data) {
    const r = data.readiness;
    const totalFindings = r.total_assets;
    const criticalCount = r.critical_count;
    const highCount = r.high_count || 0;
    const safeCount = r.safe_count || 0;
    const vulnerableCount = criticalCount + highCount;

    // 1. Executive Callout Banner
    const callout = document.getElementById('executiveCalloutBanner');
    const execRisk = document.getElementById('execRiskBadge');
    const execRepo = document.getElementById('execRepoName');
    const execHeadline = document.getElementById('execHeadline');
    const execSubtext = document.getElementById('execSubtext');

    execRepo.textContent = `${data.project_name} Security Overview`;

    if (vulnerableCount === 0) {
        callout.className = "bg-gradient-to-r from-slate-900 via-emerald-950/70 to-slate-900 border-2 border-emerald-500/50 rounded-xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4";
        execRisk.className = "text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold uppercase";
        execRisk.textContent = "QUANTUM-READY";
        execHeadline.textContent = `All ${totalFindings} discovered cryptographic assets meet modern quantum-safe margins.`;
        execSubtext.textContent = "No known quantum-vulnerable primitives detected. Built with AES-256 and SHA-384.";
    } else {
        callout.className = "bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border-2 border-red-500/50 rounded-xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4";
        execRisk.className = "text-xs font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold uppercase";
        execRisk.textContent = criticalCount > 0 ? "HIGH QUANTUM EXPOSURE" : "MODERATE QUANTUM RISK";
        execHeadline.textContent = `${vulnerableCount} of ${totalFindings} cryptographic assets need attention.`;
        execSubtext.textContent = "Vulnerable to quantum integer factorization & discrete logarithm attacks. Legacy encryption will expose long-lived data under 'Harvest Now, Decrypt Later' threat models.";
    }

    // 2. 4 Big Number Metric Cards
    document.getElementById('statTotalAssets').textContent = totalFindings;
    document.getElementById('statVulnerableAssets').textContent = vulnerableCount;
    document.getElementById('statCriticalAssets').textContent = criticalCount;
    document.getElementById('statSafeAssets').textContent = safeCount;

    // 3. Inline Readiness Posture
    const gradeBadge = document.getElementById('readinessGradeBadge');
    gradeBadge.textContent = `GRADE ${r.grade} (${r.score} / 100)`;
    gradeBadge.className = `font-mono font-bold px-2 py-0.5 rounded border ` +
        (r.score >= 80 ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
         r.score >= 50 ? 'bg-amber-950 text-amber-400 border-amber-800' :
         'bg-red-950 text-red-400 border-red-800');
    document.getElementById('readinessScoreLabel').textContent = r.label;
    document.getElementById('shorCount').textContent = `${vulnerableCount} Assets`;
    document.getElementById('safeCount').textContent = `${safeCount} Assets`;

    // 4. Priority Actions (Elevated right below stats)
    renderPriorityActions(data);

    // 5. How to Fix It (The Killer Side-by-Side Code Remediation)
    renderRemediations(data);

    // 6. What ECDAT Found (Inventory Table)
    updateInventoryCounts(data);
    renderInventoryTable(data);

    // 7. Mosca Visual Timeline (Softened, after inventory)
    const mosca = data.mosca;
    if (mosca) {
        document.getElementById('moscaTimelineVerdict').textContent = mosca.is_at_risk ? "ACTION REQUIRED NOW" : "MIGRATION WINDOW SAFE";
        document.getElementById('moscaTimelineVerdict').className = mosca.is_at_risk ? "text-xs font-mono text-red-400 font-bold bg-red-950/60 px-2.5 py-1 rounded border border-red-800" : "text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800";
        document.getElementById('shelfLifeVal').textContent = `${mosca.X_shelf_life} Years`;
        document.getElementById('migrationTimeVal').textContent = `${mosca.Y_migration_time} Years`;
        document.getElementById('totalProtectionVal').textContent = `${mosca.X_shelf_life + mosca.Y_migration_time} Years`;
        document.getElementById('planningHorizonVal').textContent = `${mosca.Z_quantum_horizon} Years`;
        document.getElementById('moscaFormulaText').textContent = mosca.formula_display;
        document.getElementById('moscaExplanationText').textContent = mosca.urgency_message;
    }

    lucide.createIcons();
}

function renderPriorityActions(data) {
    const container = document.getElementById('priorityActionsContainer');
    container.innerHTML = '';

    const vulnerableFindings = data.findings.filter(f => f.classification.risk_level === 'CRITICAL' || f.classification.risk_level === 'HIGH' || f.classification.risk_level === 'MEDIUM');

    if (vulnerableFindings.length === 0) {
        container.innerHTML = `
            <div class="col-span-3 p-6 text-center bg-slate-950/60 rounded-xl border border-emerald-500/30 text-emerald-400 font-mono text-xs">
                ✅ No priority actions required. All discovered primitives are quantum-ready (AES-256 / SHA-384).
            </div>
        `;
        return;
    }

    // Take top 3 unique priorities
    const top3 = vulnerableFindings.slice(0, 3);

    top3.forEach((f, idx) => {
        const cls = f.classification;
        const isCritical = cls.risk_level === 'CRITICAL';
        const borderColor = isCritical ? 'border-red-500/40' : 'border-amber-500/40';
        const badgeClass = isCritical ? 'bg-red-950 text-red-300 border-red-800' : 'bg-amber-950 text-amber-300 border-amber-800';
        const numColor = isCritical ? 'text-red-400' : 'text-amber-400';

        const rec = data.recommendations.find(r => r.algorithm_family === cls.algorithm_family);
        const replacementName = rec ? rec.pqc_replacement.split('(')[0].trim() : (cls.algorithm_family === 'RSA' || cls.algorithm_family === 'DH' ? 'ML-KEM' : 'ML-DSA');
        const businessImpact = getBusinessImpact(cls.algorithm_family, cls.algorithm);
        const fixTargetId = `fix-${cls.algorithm_family.toLowerCase()}`;

        const card = document.createElement('div');
        card.className = `bg-slate-900/90 border ${borderColor} rounded-xl p-5 space-y-3.5 shadow-xl flex flex-col justify-between hover:border-indigo-500/60 transition-all`;
        card.innerHTML = `
            <div class="space-y-2">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-black ${numColor} font-mono uppercase tracking-wider flex items-center gap-1.5">
                        <span class="w-5 h-5 rounded-full ${isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'} flex items-center justify-center text-[10px] font-bold">0${idx + 1}</span>
                        ${cls.algorithm}
                    </span>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded ${badgeClass} font-bold uppercase">${cls.risk_level}</span>
                </div>
                <div class="text-xs text-slate-200 font-mono font-semibold">${f.file}:${f.line_number}</div>
                <p class="text-xs text-slate-400 leading-relaxed">${cls.reason}</p>
                
                <div class="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 font-mono space-y-1">
                    <div><span class="text-slate-500 uppercase">Impact:</span> <span class="text-slate-300">${businessImpact.slice(0, 95)}...</span></div>
                    <div><span class="text-slate-500 uppercase">Recommended:</span> <strong class="text-emerald-400">${replacementName}</strong></div>
                </div>
            </div>
            <div class="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <button onclick="openWhyModal('${cls.algorithm}', '${f.file}:${f.line_number}', '${cls.reason}', '${businessImpact}', 'Migrate to ${replacementName}')" class="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                    <i data-lucide="help-circle" class="w-3.5 h-3.5"></i> Why is this risky?
                </button>
                <a href="#${fixTargetId}" class="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 rounded-lg border border-emerald-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-all">
                    <span>View Code Fix</span> <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                </a>
            </div>
        `;
        container.appendChild(card);
    });
}

function openWhyModal(title, location, why, impact, action) {
    document.getElementById('modalTitle').textContent = `${title}: Vulnerability Analysis`;
    document.getElementById('modalLocation').textContent = location;
    document.getElementById('modalRiskWhy').textContent = why;
    document.getElementById('modalBusinessImpact').textContent = impact;
    document.getElementById('modalAction').textContent = action;
    document.getElementById('whyModal').classList.remove('hidden');
    lucide.createIcons();
}

function closeWhyModal() {
    document.getElementById('whyModal').classList.add('hidden');
}

function updateInventoryCounts(data) {
    const total = data.findings.length;
    const vuln = data.findings.filter(f => f.classification.risk_level === 'CRITICAL' || f.classification.risk_level === 'HIGH' || f.classification.risk_level === 'MEDIUM').length;
    const crit = data.findings.filter(f => f.classification.risk_level === 'CRITICAL').length;
    const safe = data.findings.filter(f => f.classification.risk_level === 'SAFE' || f.classification.risk_level === 'LOW').length;

    document.getElementById('countAll').textContent = total;
    document.getElementById('countVuln').textContent = vuln;
    document.getElementById('countCrit').textContent = crit;
    document.getElementById('countSafe').textContent = safe;
}

function filterInventory(filterType) {
    currentFilter = filterType;
    ['ALL', 'VULN', 'CRIT', 'SAFE'].forEach(t => {
        const tab = document.getElementById(`tab-${t}`);
        if (t === filterType) {
            tab.className = "px-2.5 py-1 rounded font-bold bg-indigo-600 text-white";
        } else {
            tab.className = "px-2.5 py-1 rounded text-slate-400 hover:text-white";
        }
    });

    if (currentData) {
        renderInventoryTable(currentData);
        lucide.createIcons();
    }
}

function renderInventoryTable(data) {
    const tbody = document.getElementById('inventoryTableBody');
    tbody.innerHTML = '';

    let filtered = data.findings;
    if (currentFilter === 'VULN') {
        filtered = data.findings.filter(f => f.classification.risk_level === 'CRITICAL' || f.classification.risk_level === 'HIGH' || f.classification.risk_level === 'MEDIUM');
    } else if (currentFilter === 'CRIT') {
        filtered = data.findings.filter(f => f.classification.risk_level === 'CRITICAL');
    } else if (currentFilter === 'SAFE') {
        filtered = data.findings.filter(f => f.classification.risk_level === 'SAFE' || f.classification.risk_level === 'LOW');
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-500 italic">No cryptographic assets match the selected filter.</td></tr>`;
        return;
    }

    filtered.forEach((f, idx) => {
        const cls = f.classification;
        const assetId = `asset-${f.file}-${f.line_number}`;
        const isMigrated = migratedAssets.has(assetId);

        const riskColors = {
            CRITICAL: 'bg-red-950 text-red-400 border-red-800',
            HIGH: 'bg-orange-950 text-orange-400 border-orange-800',
            MEDIUM: 'bg-amber-950 text-amber-400 border-amber-800',
            SAFE: 'bg-emerald-950 text-emerald-400 border-emerald-800',
            LOW: 'bg-emerald-950 text-emerald-400 border-emerald-800'
        };

        const purpose = cls.algorithm_family === 'RSA' || cls.algorithm_family === 'DH' ? 'Key Exchange' :
                        cls.algorithm_family === 'ECC' ? 'Digital Signature' :
                        cls.algorithm_family === 'HASH' ? 'Cryptographic Hash' :
                        cls.algorithm_family === 'CIPHER' ? 'Data Encryption' :
                        cls.algorithm_family === 'SECRET' ? 'Embedded Key' : 'Transport Security';

        const plainVuln = getPlainVulnerability(cls.algorithm_family, cls.algorithm);
        const businessImpact = getBusinessImpact(cls.algorithm_family, cls.algorithm);
        const fixTargetId = `fix-${cls.algorithm_family.toLowerCase()}`;

        const tr = document.createElement('tr');
        tr.className = `hover:bg-slate-900/80 transition-colors ${isMigrated ? 'opacity-60 bg-emerald-950/10' : ''}`;
        tr.innerHTML = `
            <td class="py-2.5 px-3 font-bold text-slate-400">${idx + 1}</td>
            <td class="py-2.5 px-3 text-cyan-400 font-semibold">${f.file}:${f.line_number}</td>
            <td class="py-2.5 px-3 text-indigo-300 font-bold">${cls.algorithm}</td>
            <td class="py-2.5 px-3 text-slate-300">${purpose}</td>
            <td class="py-2.5 px-3 text-slate-300">
                ${isMigrated ? '<span class="text-emerald-400 font-bold">Mitigated</span>' : plainVuln}
            </td>
            <td class="py-2.5 px-3 text-slate-400 max-w-xs truncate" title="${businessImpact}">
                ${businessImpact}
            </td>
            <td class="py-2.5 px-3 text-right whitespace-nowrap">
                <button onclick="openWhyModal('${cls.algorithm}', '${f.file}:${f.line_number}', '${cls.reason}', '${businessImpact}', 'Migrate to NIST PQC')" class="text-[11px] text-slate-400 hover:text-indigo-300 mr-2">Why?</button>
                <a href="#${fixTargetId}" class="text-indigo-400 hover:text-indigo-300 font-bold">Fix &rarr;</a>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderRemediations(data) {
    const recContainer = document.getElementById('remediationContainer');
    recContainer.innerHTML = '';
    const seenFamilies = new Set();

    data.recommendations.forEach((rec, idx) => {
        if (seenFamilies.has(rec.algorithm_family)) return;
        seenFamilies.add(rec.algorithm_family);

        const isSignature = rec.algorithm_family === 'ECC' || (rec.algorithm && rec.algorithm.includes('Sign'));
        const reasonWhy = isSignature ?
            `Used for digital signature authentication. NIST FIPS 204 (ML-DSA) is the designated post-quantum replacement providing equivalent security levels without quantum vulnerability.` :
            `Used for key establishment and encryption. NIST FIPS 203 (ML-KEM) is the designated post-quantum replacement providing secure lattice-based key encapsulation.`;

        const cardId = `fix-${rec.algorithm_family.toLowerCase()}`;

        const card = document.createElement('div');
        card.id = cardId;
        card.className = 'bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl transition-all';
        card.innerHTML = `
            <!-- IDE Faux Window Header -->
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div class="flex items-center gap-3">
                    <div class="flex items-center gap-1.5">
                        <span class="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                        <span class="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                        <span class="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <h4 class="text-sm font-bold text-white tracking-wider font-mono">Remediation Target: ${rec.algorithm_family}</h4>
                            <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-bold">${rec.migration_priority}</span>
                        </div>
                        <div class="text-xs text-emerald-300 font-semibold font-mono mt-0.5">
                            &rarr; Drop-in Replacement: <strong>${rec.pqc_replacement}</strong>
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-2 text-xs font-mono">
                    <span class="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 font-bold">${rec.nist_standard}</span>
                    <button onclick="copyCode('code-after-${idx}')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 font-semibold transition-all">
                        <i data-lucide="copy" class="w-3.5 h-3.5"></i> Copy Replacement Code
                    </button>
                    <button onclick="toggleMigrated('${rec.algorithm_family}', this)" class="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 rounded-lg border border-emerald-700 flex items-center gap-1.5 font-bold transition-all">
                        <i data-lucide="check" class="w-3.5 h-3.5"></i> Mark as Migrated ✓
                    </button>
                </div>
            </div>

            <!-- "Why this replacement?" Box -->
            <div class="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200 flex items-start gap-2.5 font-mono">
                <i data-lucide="info" class="w-4 h-4 text-indigo-400 mt-0.5 shrink-0"></i>
                <div>
                    <strong class="text-white">Why this replacement?</strong> ${reasonWhy}
                </div>
            </div>

            <!-- Side-by-Side Diff Windows -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono">
                <!-- Left: Before (Vulnerable) -->
                <div class="rounded-xl overflow-hidden border border-red-900/50 bg-slate-950">
                    <div class="bg-red-950/40 border-b border-red-900/50 px-3.5 py-2 flex items-center justify-between">
                        <span class="text-[11px] font-bold text-red-300 flex items-center gap-1.5 uppercase">
                            <span class="w-2 h-2 rounded-full bg-red-500"></span> Vulnerable Legacy Code (Before)
                        </span>
                        <span class="text-[10px] text-red-400 font-bold">BROKEN BY QUANTUM</span>
                    </div>
                    <pre class="code-diff-before p-4 text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">${escapeHtml(rec.code_before)}</pre>
                </div>

                <!-- Right: After (Quantum-Safe) -->
                <div class="rounded-xl overflow-hidden border border-emerald-900/50 bg-slate-950">
                    <div class="bg-emerald-950/40 border-b border-emerald-900/50 px-3.5 py-2 flex items-center justify-between">
                        <span class="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 uppercase">
                            <span class="w-2 h-2 rounded-full bg-emerald-500"></span> NIST Post-Quantum Code (After)
                        </span>
                        <span class="text-[10px] text-emerald-400 font-bold">NIST FIPS STANDARDIZED</span>
                    </div>
                    <pre id="code-after-${idx}" class="code-diff-after p-4 text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">${escapeHtml(rec.code_after)}</pre>
                </div>
            </div>

            <div class="text-[11px] text-slate-400 font-mono pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60">
                <div>
                    <strong>Standard Reference:</strong> ${rec.nist_standard} &bull; 
                    <strong>PQC Libraries:</strong> ${rec.libraries.join(', ')}
                </div>
                <div class="text-slate-500">Integration: Standard PyCryptodome / OpenSSL 3.3 compatible</div>
            </div>
        `;
        recContainer.appendChild(card);
    });

    lucide.createIcons();
}

function copyCode(preId) {
    const pre = document.getElementById(preId);
    if (!pre) return;
    navigator.clipboard.writeText(pre.textContent).then(() => {
        alert("✅ PQC replacement code copied to clipboard!");
    });
}

function toggleMigrated(family, btn) {
    if (currentData) {
        let countMigrated = 0;
        currentData.findings.forEach(f => {
            if (f.classification.algorithm_family === family) {
                const id = `asset-${f.file}-${f.line_number}`;
                migratedAssets.add(id);
                countMigrated++;
            }
        });
        
        // Dynamically update dashboard metric cards
        const vulnEl = document.getElementById('statVulnerableAssets');
        const safeEl = document.getElementById('statSafeAssets');
        const currentVuln = parseInt(vulnEl.textContent, 10);
        const currentSafe = parseInt(safeEl.textContent, 10);

        const newVuln = Math.max(0, currentVuln - countMigrated);
        const newSafe = currentSafe + countMigrated;

        vulnEl.textContent = newVuln;
        safeEl.textContent = newSafe;

        // Recalculate grade / score
        const total = currentData.findings.length;
        const newScore = Math.min(100, Math.round((newSafe / total) * 100));
        
        const gradeBadge = document.getElementById('readinessGradeBadge');
        const newGrade = newScore >= 80 ? 'A' : newScore >= 60 ? 'B' : newScore >= 40 ? 'C' : 'D';
        gradeBadge.textContent = `GRADE ${newGrade} (${newScore} / 100)`;
        gradeBadge.className = `font-mono font-bold px-2 py-0.5 rounded border ` +
            (newScore >= 80 ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
             newScore >= 50 ? 'bg-amber-950 text-amber-400 border-amber-800' :
             'bg-red-950 text-red-400 border-red-800');

        renderInventoryTable(currentData);
        btn.innerHTML = `<i data-lucide="check-check" class="w-3.5 h-3.5"></i> Migrated ✓`;
        btn.className = "px-3 py-1.5 bg-emerald-600 text-white rounded-lg border border-emerald-500 font-bold flex items-center gap-1.5";
        lucide.createIcons();
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function setupExports() {
    // CBOM Export
    document.getElementById('exportCbomBtn').addEventListener('click', () => {
        if (!currentData || !currentData.cbom) {
            alert("Scan data is currently loading, please try in 1 second!");
            return;
        }
        const blob = new Blob([JSON.stringify(currentData.cbom, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ECDAT_CBOM_CycloneDX_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // PDF Report Export
    document.getElementById('exportPdfBtn').addEventListener('click', () => {
        if (!currentData) {
            alert("Scan data is currently loading, please try in 1 second!");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const d = currentData;

        // Title Header
        doc.setFillColor(13, 17, 28);
        doc.rect(0, 0, 210, 32, 'F');
        doc.setTextColor(99, 102, 241);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text("ECDAT | POST-QUANTUM MIGRATION REPORT", 14, 15);
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text("SIH26164: Enterprise Cryptographic Discovery & Analysis Tool (NTRO)", 14, 23);
        doc.text(`Generated: ${new Date().toUTCString()} | Repository: ${d.project_name}`, 14, 28);

        // Executive Summary Banner
        const rc = d.readiness;
        const verdictColor = rc.color === 'red' ? [239, 68, 68] : rc.color === 'orange' ? [249, 115, 22] : rc.color === 'yellow' ? [245, 158, 11] : [16, 185, 129];
        doc.setFillColor(verdictColor[0], verdictColor[1], verdictColor[2]);
        doc.roundedRect(14, 38, 182, 14, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.text(`Quantum Readiness: ${rc.score}% (Grade ${rc.grade}) - ${rc.label}`, 20, 47);

        // Mosca's Timeline Summary
        if (d.mosca) {
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(10);
            doc.text(`Harvest Now, Decrypt Later Timeline: ${d.mosca.formula_display} => ${d.mosca.verdict}`, 14, 60);
        }

        // Findings Inventory Table
        const rows = d.findings.map((f, i) => [
            i + 1, f.file + ':' + f.line_number, f.classification.algorithm,
            f.classification.algorithm_family, f.classification.key_size || 'N/A',
            f.classification.quantum_attack, f.classification.risk_level
        ]);

        doc.autoTable({
            startY: 66,
            head: [['#', 'File:Line', 'Algorithm', 'Family', 'Key Size', 'Quantum Attack', 'Risk']],
            body: rows.length > 0 ? rows : [['--', 'No findings', '--', '--', '--', '--', 'SAFE']],
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241] },
            styles: { fontSize: 7 }
        });

        // Recommendations summary
        const seenFam = new Set();
        const recRows = d.recommendations.filter(r => { if (seenFam.has(r.algorithm_family)) return false; seenFam.add(r.algorithm_family); return true; })
            .map(r => [r.algorithm_family, r.migration_priority, r.pqc_replacement, r.nist_standard]);

        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text("PQC Migration Recommendations (NIST FIPS 203/204)", 14, doc.lastAutoTable.finalY + 12);

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 16,
            head: [['Algorithm', 'Priority', 'PQC Replacement', 'NIST Standard']],
            body: recRows.length > 0 ? recRows : [['N/A', 'N/A', 'No action needed', 'N/A']],
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129] },
            styles: { fontSize: 7 }
        });

        doc.save(`ECDAT_Migration_Report_${Date.now()}.pdf`);
    });
}
