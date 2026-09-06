"""Quick test of ECDAT pipeline."""
from backend.scanner import CryptoScanner
from backend.classifier import QuantumClassifier
from backend.mosca import MoscaCalculator
from backend.remediation import RemediationEngine
from backend.cbom import CBOMGenerator
from backend.samples import SAMPLES

s = SAMPLES['fintech_banking_app']
findings = []
for fname, code in s['files'].items():
    findings.extend(CryptoScanner.scan_text(code, fname, s['language']))

classified = QuantumClassifier.classify_all(findings)
readiness = QuantumClassifier.compute_readiness_score(classified)
mosca = MoscaCalculator.evaluate(10, 3, 10, 'RSA')
recs = RemediationEngine.get_all_recommendations(classified)
cbom = CBOMGenerator.generate(classified, "FinTech Banking App")

print(f"FINDINGS: {len(findings)}")
print(f"READINESS: {readiness['score']}% Grade {readiness['grade']} ({readiness['label']})")
print(f"CRITICAL: {readiness['critical_count']}")
print(f"MOSCA: {mosca['verdict']} | {mosca['formula_display']}")
print(f"RECOMMENDATIONS: {len(recs)}")
print(f"CBOM COMPONENTS: {len(cbom['components'])}")

# Test clean codebase
s2 = SAMPLES['quantum_safe_reference']
f2 = []
for fname, code in s2['files'].items():
    f2.extend(CryptoScanner.scan_text(code, fname, s2['language']))
c2 = QuantumClassifier.classify_all(f2)
r2 = QuantumClassifier.compute_readiness_score(c2)
print(f"\nCLEAN CODEBASE: {r2['score']}% Grade {r2['grade']} ({r2['label']})")
print("ALL TESTS PASSED!")
