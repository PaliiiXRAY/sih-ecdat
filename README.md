# ECDAT | Enterprise Cryptographic Discovery & Analysis Tool
### Post-Quantum Cryptographic Migration Platform
**Smart India Hackathon 2024 (SIH26164) &bull; National Technical Research Organisation (NTRO)**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-sih--edcat.vercel.app-6366f1?style=for-the-badge&logo=vercel)](https://sih-edcat.vercel.app)
[![Standards](https://img.shields.io/badge/Standards-NIST%20FIPS%20203%20%2F%20204-10b981?style=for-the-badge)](https://csrc.nist.gov/pubs/fips/203/final)
[![CBOM](https://img.shields.io/badge/Format-CycloneDX%20CBOM-cyan?style=for-the-badge)](https://cyclonedx.org)

---

## 📌 Executive Summary

> **"Know where your cryptography is before quantum computers do."**

Thousands of enterprise applications rely on public-key encryption (RSA, ECC, Diffie-Hellman) that future cryptanalytically relevant quantum computers (CRQCs) can break using Shor's algorithm. Because adversaries are executing **Harvest Now, Decrypt Later** attacks—capturing encrypted network traffic today to decrypt once quantum hardware matures—organizations must begin migration immediately.

**ECDAT** discovers cryptographic assets across software repositories, calculates migration deadlines via data shelf-life modeling, and generates drop-in post-quantum replacement code compliant with **NIST FIPS 203 (ML-KEM)** and **FIPS 204 (ML-DSA)** standards.

---

## ⚡ Core Workflow: 3-Step Architecture

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   01 DISCOVER   │ ───►  │    02 ASSESS    │ ───►  │   03 MIGRATE    │
│  Scan AST Code  │       │ Quantum Threat  │       │ NIST PQC Code   │
│ & Repo Primitives│      │ & Mosca Timeline│       │ & Export CBOM   │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

1. **DISCOVER**: Parses source code Abstract Syntax Trees (AST) across Python, Java, JavaScript, Go, and C/C++ to identify cryptographic function calls, key lengths, cipher modes, legacy hashes, and embedded keys.
2. **ASSESS**: Maps primitives to Shor's and Grover's algorithm vulnerabilities, calculates risk urgency based on sector confidentiality (10–30 years), and evaluates the **Harvest Now, Decrypt Later** threat window.
3. **MIGRATE**: Delivers side-by-side post-quantum replacement code (ML-KEM for key establishment, ML-DSA for digital signatures), updates security posture interactively, and exports a standardized **CycloneDX CBOM (Cryptographic Bill of Materials)** JSON and executive PDF report.

---

## 🎯 Key Features

- 🏦 **1-Click Realistic Enterprise Scenarios**: Instant pre-configured evaluation for FinTech Banking (`finpay-auth`), Defense Comms (`secure-comms`), and Quantum-Resilient reference services (`pqc-reference`).
- ⏰ **Live Quantum Threat Clock**: Real-time T-minus countdown to the 2031 CRQC planning horizon on the scan console.
- 🎛️ **Quantum Horizon Simulator**: Interactive slider (2026–2040) that live-recomputes every asset's Mosca inequality (X + Y > Z), readiness score, urgency badges, and executive narrative — demonstrate "what if quantum arrives in 2028?" in one drag.
- 🍩 **Family Exposure Donut**: Zero-dependency SVG breakdown of exposed algorithm families (factorization, elliptic curve, hash/KDF, symmetric).
- 📊 **Executive Security Dashboard**: Instant 4-metric overview (Discovered Assets, Need Migration, Critical Urgency, Already Resilient) with Quantum Readiness Posture (Grade A to D).
- ⚡ **Priority Actions ("What Should You Fix First?")**: Actionable triage ranking based on exposure and data shelf-life with direct jump-to-fix links and explainable risk modals.
- 🔄 **IDE-Style Side-by-Side Remediation**: Direct before/after comparison between vulnerable legacy code (RSA/ECC) and standardized post-quantum cryptography (ML-KEM/ML-DSA) with 1-click clipboard copy and live *"Mark as Migrated ✓"* recalculation.
- ⏳ **"Why Migrate Now?" Visual Timeline**: Accessible plain-English Mosca timeline displaying data shelf-life vs quantum threat horizon without cognitive math overload.
- 📋 **CycloneDX CBOM & PDF Export**: Instant export of machine-readable Cryptographic Bill of Materials (JSON) and executive stakeholder report (PDF).

---

## 🏗️ Architecture & Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Vanilla JS, Tailwind CSS, Lucide Icons | Zero-dependency, ultra-fast progressive disclosure UI |
| **Analysis Engine** | Python `ast`, regex pattern correlating | Static source analysis identifying crypto imports and calls |
| **PQC Standards** | NIST FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA) | Drop-in replacements for key exchange and signatures |
| **Threat Modeling**| Mosca's Inequality ($X + Y > Z$) | Data shelf-life ($X$) + Migration ($Y$) vs Horizon ($Z$) |
| **Exports** | jsPDF, AutoTable, CycloneDX CBOM JSON | Audit compliance and executive reporting |
| **Deployment** | Vercel Serverless Function | Global edge-cached deployment |

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Python 3.10+
- Modern Web Browser

### Running Locally
```bash
# 1. Clone repository
git clone https://github.com/PaliiiXRAY/sih-ecdat.git
cd sih-ecdat

# 2. Run local server (zero third-party dependencies required for server)
python app.py

# 3. Open in browser
# Navigate to http://localhost:5001
```

---

## 🔬 Scientific & Technical Transparency

- **Prototype Coverage**: Covers ~85% of standard-library cryptographic patterns in tested ecosystems.
- **Planning Horizon**: The 10-year quantum horizon is a configurable planning assumption, not a deterministic date prediction.
- **Phase 2 Scope**: Dynamic runtime secret interception, binary analysis (ELF/PE), and automated pull-request integration are slated for production rollout.

---

## 📜 License
Developed for **Smart India Hackathon 2024** under Problem Statement **SIH26164** (National Technical Research Organisation - NTRO).
