# ECDAT 2-Minute Live Demo & Stage Pitch Script (SIH26164 - NTRO)

Use this word-for-word pitch during your university internal round presentation.

---

### Part 1: The Pitch & Live Demo (Total: 2 Minutes)

#### Step 1: The Hook (0:00 - 0:30)
> *"Respected judges, hostile intelligence agencies are executing **'Harvest Now, Decrypt Later'** attacks right now—intercepting encrypted Indian banking and defense data to decrypt once quantum computers arrive.  
> 
> The Government of India has mandated migration to Post-Quantum Cryptography. But enterprises face a critical barrier: **they have no idea where classical cryptography like RSA or ECC is hidden across their codebases.**  
> 
> For **SIH26164 (NTRO)**, we built **ECDAT**—an Enterprise Cryptographic Discovery & Analysis Tool that inventories cryptography into a standard **CBOM**, calculates the exact quantum migration deadline using **Mosca's Theorem**, and provides drop-in code patches."*

#### Step 2: The Cinematic Demo (0:30 - 1:30)
*(Click the top preset button: **"🏦 FinTech Banking App"**)*

> *"Notice what our engine discovered in under 200 milliseconds:
> 
> 1. **Enterprise Impact Banner:** Look at the top summary: **'Your codebase has 8 cryptographic dependencies. 5 require immediate migration planning.'**
> 2. **Quantum Readiness Score:** The application scored **20% (Grade D — High Quantum Exposure)**.
> 3. **The Inventory:** We detected **RSA-2048**, **ECDSA P-256**, and an embedded private key—all critically broken by **Shor's Algorithm**—as well as classically broken **MD5** and Grover-weakened **AES-128**.
> 4. **Mosca's Inequality ($X + Y > Z$):** For banking records with a 15-year shelf-life, $X(15) + Y(3) = 18$, which exceeds the 10-year quantum horizon. The deadline has **already passed**—this system is actively vulnerable to HNDL attacks."*

#### Step 3: The Deliverables & PQC Migration (1:30 - 2:00)
*(Scroll down to the Recommendations and point to the Code Diffs)*

> *"Most importantly, we don't just alert—we remediate. Look at our side-by-side code diffs:
> - We show developers the exact replacement for RSA using the new NIST **FIPS 203 ML-KEM-768 (CRYSTALS-Kyber)**.
> - We replace ECDSA with **FIPS 204 ML-DSA-65 (CRYSTALS-Dilithium)**.
> 
> With one click, an audit team can download the official **CycloneDX v1.6 CBOM (JSON)** or a formal **PDF Quantum Risk Dossier**.  
> 
> *(Point to the Limitations Panel)*: We also explicitly document our static analysis boundaries: ~85% detection accuracy, with dynamic runtime inspection scoped for Phase 2. Thank you, we are open for questions!"*

---

### Part 2: Defense Against Tough Judge Questions

#### Q1: "What is Mosca's Theorem and why does it matter?"
* **Your Winning Answer:**
  > *"Sir, Michele Mosca's theorem ($X + Y > Z$) states that if the time your data must stay confidential ($X$) plus the time needed to migrate your systems ($Y$) exceeds the time until a quantum computer arrives ($Z$), then your data is ALREADY at risk today from 'Harvest Now, Decrypt Later'. It provides mathematical justification for why organizations must migrate today rather than waiting for 2030."*

#### Q2: "Can you detect all cryptography statically?"
* **Your Winning Answer:**
  > *"No scanner can achieve 100% statically, and we are transparent about that. Our tool achieves ~85% coverage on standard libraries across Python, Java, JS, Go, and C. For dynamic runtime imports or proprietary custom ciphers, static AST analysis is insufficient. That is why our Phase 2 roadmap includes dynamic eBPF and runtime symbol instrumentation."*

#### Q3: "What are Kyber and Dilithium?"
* **Your Winning Answer:**
  > *"They are the official Post-Quantum Cryptography standards finalized by NIST in August 2024. ML-KEM (formerly CRYSTALS-Kyber) is standardized under FIPS 203 for key exchange, and ML-DSA (CRYSTALS-Dilithium) under FIPS 204 for digital signatures. Both are based on Module Learning with Errors (lattice-based cryptography), which quantum computers cannot solve in polynomial time."*
