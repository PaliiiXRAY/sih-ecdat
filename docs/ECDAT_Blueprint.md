# ECDAT v2 — Product & Technical Blueprint

**SIH26164 · Enterprise Cryptographic Discovery & Analysis Tool · NTRO**

---

## Design Law

> **"Cinematic, not cryptic."**

Visuals: unconventional. Interaction: familiar. Information: dense. Navigation: obvious. Motion: meaningful.

**Netra usage rule:** Netra (Cyberdrishti) is a reference for *experiential principles only* — spatial storytelling, scroll-linked transitions, ambient motion, progressive revelation, visual continuity. Never copy its layouts, components, branding, or decorative patterns. ECDAT's visual language must communicate **cryptographic relationships, threat, and migration**.

**Acceptance test for every screen:** if you remove all the text, the animation must still explain what happened. And a first-time user must complete the main workflow without a tutorial.

---

## 01 · Product Vision

ECDAT is an **explorable cryptographic intelligence environment**: it reveals the cryptography hidden inside a codebase, maps how primitives relate to services, exposes quantum exposure, and choreographs the migration to NIST PQC — cinematic outside, analytical inside.

## 02 · Feature Audit

| Tag | Meaning |
|---|---|
| KEEP | Existing functionality remains |
| REWORK | Same capability, new UX |
| NEW | Capability doesn't exist yet |
| DEFER | Valuable, intentionally postponed |
| ROADMAP | Future technical capability |

| Feature | Tag |
|---|---|
| Pattern/AST crypto scanner (6 languages, `/api/scan`) | KEEP |
| Quantum classifier (Shor/Grover, risk levels) | KEEP |
| Mosca's Theorem engine (sector shelf-life) | KEEP |
| CycloneDX 1.6 CBOM export | KEEP |
| Executive PDF report | KEEP |
| Live Scan (paste real code) | KEEP |
| Horizon Simulator (2026–2040) | KEEP |
| Migration timeline + business criticality | KEEP |
| Mark-as-Migrated remediation tracking | KEEP |
| Repo persistence, theme persistence | KEEP |
| 4-view console (Scan/Dashboard/Plan/Fixes) | REWORK → 5-mode workspace |
| Static sidebar + card layout | REWORK → icon rail + typographic hierarchy |
| Cinematic entry experience | NEW (v2) |
| Universe / Cryptographic Surface graph | NEW (v2) |
| Trace impact / blast radius | NEW (v2, inferred edges) |
| Aurora risk field | NEW (v2, performance-tiered) |
| Import/call-graph dependency correlation | ROADMAP (Phase 2 engine) |
| Data-flow analysis | ROADMAP |
| FP/FN benchmark harness (labeled corpus) | ROADMAP |
| Reproducible scan manifests (hash-pinned CBOM) | ROADMAP |
| Binary / container / SBOM-ingestion scanning | DEFER |

## 03 · SRS (condensed)

**Users:** SIH judge (5-min evaluation), security analyst (inventory + risk), dev lead (migration planning).
**Goals:** discover crypto artefacts; classify quantum risk via Mosca; visualise the cryptographic surface; plan & track PQC migration; export standardised CBOM.
**Non-functional:** zero-build vanilla stack; global edge deployment; graceful performance degradation; honesty about detection coverage (~85% stdlib patterns; dynamic/obfuscated crypto = Phase 2).

## 04 · User Workflow (the product)

```
CONNECT → ANALYZE → DISCOVER → MAP → IDENTIFY → TRACE → UNDERSTAND → PLAN → REMEDIATE → VERIFY
```

UI is organised around this workflow, not around pages.

## 05 · UX Architecture

**The 4-question rule (hard acceptance criterion).** Every major workspace state must answer:
1. WHERE AM I? — breadcrumb, e.g. `REPOSITORY → CRYPTOGRAPHY → RSA-2048`
2. WHAT AM I LOOKING AT? — name + role
3. WHY DOES IT MATTER? — quantum relevance
4. WHAT CAN I DO? — actions: `[Trace impact] [Plan migration]`

**Layer model:**
- Layer 1 (familiar controls): Analyze, upload/paste, search, filter, inspect, back, export. Never experimental.
- Layer 2 (innovative visualization): dependency graph, aurora risk field, particles, animated timeline, blast radius. This is the personality.
- Layer 3 (cinematic transitions): click Inspect → node expands → camera drifts toward it → context fades → finding panel emerges. The animation explains the navigation.

## 06 · Information Architecture

Workspace modes (workflow-ordered):
`SURFACE (Universe graph)` → `DASHBOARD (posture)` → `MIGRATION PLAN` → `CODE FIXES` → `NEW SCAN`
Entry experience is separate and always offers an obvious exit into the workspace.

## 07 · Visual Grammar

- **Typography = scale contrast, not font soup.** Instrument Serif for large statements · IBM Plex Mono for labels/data · system sans for body.
- Pattern: tiny mono marker (`01 · THE PROBLEM`) → large statement → gray echo line → small metadata.
- **Color:** ONE brand accent (indigo `#6366f1`) + reserved semantic colors only: RED `#ef4444` critical/vulnerable · AMBER `#f59e0b` high · GREEN `#10b981` safe/migrated · GRAY neutral/unknown. Nothing else gets hue.
- Near-black surface `#05070d`, hairline borders `rgba(148,163,184,.14)`, generous negative space.
- Data-dense is okay; progressive disclosure over deletion.

## 08 · Motion Grammar

| Type | Feel | Rules |
|---|---|---|
| Ambient | slow, continuous, subtle | aurora, node breathing, connection pulses; never competes with reading |
| Interaction | responsive, directional | hover reveals neighborhood; click explains selection |
| Critical event | strong, unmistakable | critical finding, scan complete, deadline breach |

**Performance tiers (mandatory):** HIGH (full particles + graph anim) · MEDIUM (reduced particles) · LOW (static graph) · REDUCED-MOTION (no ambient animation, opacity-only transitions). Auto-degrade by device capability + `prefers-reduced-motion`; ambient loops pause when tab hidden.

## 09 · Cinematic Entry (`/`)

**One persistent visualization layer whose composition, visibility, and interaction state evolve with each scene** — not a fixed backdrop. 7 scenes, ~20–40s of intentional scrolling. **Browser scroll is never hijacked.** Mobile: stacked scenes, graph reduced to essentials.

Choreography (graph is the protagonist, text owns partial territory):
1. `01 · THE PROBLEM` — ambient signals only; graph nearly invisible
2. `02 · DISCOVERY` — primitives emerge in the right territory, labels + code locations readable (HTML overlay, not canvas text)
3. `03 · RELATIONSHIPS` — **graph takes center stage**; statement tucks aside; edges + services animate in
4. `04 · EXPOSURE` — unaffected graph dims, the RSA blast path illuminates with traveling pulses
5. `05 · THE HORIZON` — graph recedes; 2026→2040 axis emerges with 2031 deadline mark
6. `06 · MIGRATION` — red paths settle to green; successors appear **by cryptographic function** (signing→ML-DSA, key establishment→ML-KEM), dashed edges = PQC successor links
7. `07 · ECDAT` — resolve; final CTA

Node legibility: core 5–6.5px + restrained halo (14–24px breathing ring) for critical nodes only. **Canvas** draws particles/aurora/edges/cores; **HTML overlay** draws all labels & annotations (crisp at any DPR).

Aurora: slow flow bands; turbulence follows the story (calm → disturbed at exposure → settles at migration).

**Contextual project chip** (not a permanent card): full at entry, hidden during graph scenes, resolves to "ANALYSIS COMPLETE · CBOM READY" at the end. **One persistent CTA** (header) + big CTA only in the final scene. Legend (evidence vs PQC-successor edges) visible only during graph scenes.

## 10 · Workspace Architecture

Thin icon rail (56px, hover labels) · breadcrumb answers Q1–Q4 · content area uses section markers + typographic hierarchy. All v1 features one click away.

## 11 · Universe / Cryptographic Surface

- Nodes: services (JWT AUTH, API GATEWAY, PAYMENTS, TLS EDGE) + crypto assets (from scan data)
- **Edges honesty rule:** edges represent *evidence-backed or inferred* relationships; **inferred edges are dashed** and the legend says so. Full import/call/data-flow correlation = Phase 2. Never visually imply evidence that hasn't been established.
- Interactions: hover → neighborhood highlight; click → node expands to finding panel (purpose, Mosca verdict, blast radius counts) + `TRACE IMPACT` lights affected paths; ambient field tint follows risk mix (calm=green → turbulent=red)
- States: EMPTY ("Connect a repository to reveal its cryptographic surface") · SCANNING (animated sweep) · NO RELATIONSHIPS (no fake edges) · 1000+ nodes (cluster by family) · CRITICAL (emphasis)

## 12 · Interaction & State Model

Every major component defines: EMPTY · LOADING · SUCCESS · ERROR · NO RESULTS · PARTIAL RESULTS · CRITICAL STATE. Implemented in entry + workspace.

## 13 · System Architecture (current)

```
Entry (/)  ──►  Workspace (/workspace)
                   │
                /api/scan  ──►  Scanner → Classifier → Mosca → Remediation → CBOM
                   │
                (canned demo repos OR pasted code)
```

Zero-build vanilla stack; Vercel serverless Python runtime.

## 14 · Data / Graph Contract

```json
{
  "nodes": [{ "id", "kind": "service|asset", "label", "risk": "CRITICAL|HIGH|MODERATE|SAFE", "meta": {...} }],
  "edges": [{ "from", "to", "kind": "evidence|inferred" }]
}
```

## 15 · Performance & Accessibility

Tier system (§08) · `prefers-reduced-motion` respected everywhere · contrast ≥ WCAG AA for text · keyboard-reachable controls · ambient loops pause on `visibilitychange`.

## 16 · Demo Narrative (5-minute judge flow)

| t | beat |
|---|---|
| 00:00 | Open sih-edcat.vercel.app → cinematic story |
| 00:30 | ENTER WORKSPACE |
| 01:00 | Run scan (FinTech scenario) |
| 01:30 | Cryptographic Surface appears |
| 02:00 | Select RSA-2048 → finding panel |
| 02:30 | TRACE IMPACT → affected paths light up |
| 03:15 | Mosca / horizon simulator ("what if 2028?") |
| 04:00 | Migration plan + timeline |
| 04:30 | Code Fixes → Mark as Migrated |
| 05:00 | Export CBOM + executive PDF |

## 17 · Phased Roadmap

- **v2 (this pass):** Blueprint · Entry · Icon rail · Universe (inferred edges) · states
- **v2.1:** Trace impact on real scan data · clustering for large graphs · report screen restyle
- **Phase 2 engine:** import-graph correlation (evidence edges) · call/data-flow analysis · FP/FN benchmark harness (labeled corpus: OpenSSL samples, vulnerable repos) · reproducible scan manifests (hash-pinned CBOM)
- **DEFER:** binary/container scanning · auth/multi-tenant · pricing

## 18 · Acceptance Criteria

1. Judge understands the product within 40s of landing, without a tutorial
2. Every workspace state answers the 4 questions
3. All v1 features still work after restyle (same buttons, same logic)
4. Entry never hijacks scroll; workspace reachable in one obvious click at all times
5. Ambient effects degrade to zero-motion on weak devices / reduced-motion
6. Graph edges never imply evidence that doesn't exist (inferred = dashed + labeled)
7. Both themes + mobile usable end-to-end
