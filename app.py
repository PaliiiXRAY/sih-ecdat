"""
ECDAT Core Server (SIH26164)
Enterprise Cryptographic Discovery & Analysis Tool - NTRO
Zero-dependency HTTP Server exposing REST API and serving the Quantum Risk Dashboard.
"""
import os
import sys
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.scanner import CryptoScanner
from backend.classifier import QuantumClassifier
from backend.mosca import MoscaCalculator
from backend.remediation import RemediationEngine
from backend.cbom import CBOMGenerator
from backend.samples import SAMPLES

PORT = 5001
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")


class ECDATRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/" or path == "/entry.html":
            self.serve_file(os.path.join(STATIC_DIR, "entry.html"), "text/html")
            return

        if path == "/workspace" or path == "/index.html" or path == "/app":
            self.serve_file(os.path.join(STATIC_DIR, "index.html"), "text/html")
            return

        if path.startswith("/static/"):
            file_name = path.replace("/static/", "")
            file_path = os.path.join(STATIC_DIR, file_name)
            if os.path.isfile(file_path):
                ctype = "text/css" if file_name.endswith(".css") else \
                        "application/javascript" if file_name.endswith(".js") else \
                        "text/html"
                self.serve_file(file_path, ctype)
                return

        if path == "/api/samples":
            sample_list = [
                {"id": s["id"], "title": s["title"], "description": s["description"]}
                for s in SAMPLES.values()
            ]
            self.send_json({"samples": sample_list})
            return

        if path.startswith("/api/sample/"):
            sample_id = path.replace("/api/sample/", "").strip()
            if sample_id in SAMPLES:
                self.send_json(SAMPLES[sample_id])
            else:
                self.send_json({"error": "Sample not found"}, 404)
            return

        if path == "/api/presets":
            self.send_json(MoscaCalculator.get_presets())
            return

        self.send_error(404, "Not Found")

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/scan":
            try:
                body = self.read_body()
                data = json.loads(body)

                # Mode 1: Scan a sample codebase
                sample_id = data.get("sample_id")
                # Mode 2: Scan raw pasted code
                raw_code = data.get("code", "")
                language = data.get("language", "python")
                project_name = data.get("project_name", "User Scan")

                # Mosca parameters
                sector = data.get("sector", "enterprise")
                horizon = data.get("horizon", "moderate")

                all_findings = []

                if sample_id and sample_id in SAMPLES:
                    sample = SAMPLES[sample_id]
                    project_name = sample["title"]
                    lang = sample.get("language", "python")
                    for filename, code in sample["files"].items():
                        findings = CryptoScanner.scan_text(code, filename, lang)
                        all_findings.extend(findings)
                elif raw_code.strip():
                    all_findings = CryptoScanner.scan_text(raw_code, "user_input", language)
                else:
                    self.send_json({"error": "No code or sample provided"}, 400)
                    return

                # Pipeline: Classify -> Score -> Remediate -> CBOM
                classified = QuantumClassifier.classify_all(all_findings)
                readiness = QuantumClassifier.compute_readiness_score(classified)
                recommendations = RemediationEngine.get_all_recommendations(classified)
                cbom = CBOMGenerator.generate(classified, project_name)

                # Mosca evaluation for each finding
                mosca_results = []
                for f in classified:
                    mosca = MoscaCalculator.evaluate_for_finding(f, sector, horizon)
                    mosca_results.append(mosca)

                # Summary statistics
                family_counts = {}
                for f in classified:
                    fam = f["classification"]["algorithm_family"]
                    if fam not in family_counts:
                        family_counts[fam] = {"count": 0, "risk_level": f["classification"]["risk_level"]}
                    family_counts[fam]["count"] += 1

                response = {
                    "project_name": project_name,
                    "findings": classified,
                    "readiness": readiness,
                    "recommendations": recommendations,
                    "mosca": mosca_results[0] if mosca_results else None,
                    "mosca_all": mosca_results,
                    "cbom": cbom,
                    "summary": {
                        "total_findings": len(classified),
                        "family_counts": family_counts,
                        "critical_algorithms": [f["algorithm"] for f in all_findings if f["algorithm_family"] in ("RSA", "ECC", "DH", "DES", "SECRET")],
                    }
                }

                self.send_json(response)

            except Exception as e:
                import traceback
                traceback.print_exc()
                self.send_json({"error": str(e)}, 500)
            return

        if path == "/api/mosca":
            try:
                body = self.read_body()
                data = json.loads(body)
                result = MoscaCalculator.evaluate(
                    x_shelf_life=int(data.get("x", 10)),
                    y_migration_time=int(data.get("y", 3)),
                    z_quantum_horizon=int(data.get("z", 10)),
                    algorithm_family=data.get("algorithm", "RSA")
                )
                self.send_json(result)
            except Exception as e:
                self.send_json({"error": str(e)}, 500)
            return

        self.send_error(404, "Not Found")

    def read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        return self.rfile.read(length).decode("utf-8")

    def serve_file(self, filepath, content_type):
        self.send_response(200)
        self.send_header("Content-Type", f"{content_type}; charset=utf-8")
        self.end_headers()
        with open(filepath, "rb") as f:
            self.wfile.write(f.read())

    def send_json(self, data, status=200):
        body = json.dumps(data, indent=2, default=str).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)


def run():
    httpd = HTTPServer(("", PORT), ECDATRequestHandler)
    print(f"\n=======================================================")
    print(f" [*] ECDAT Platform Online!")
    print(f" [*] SIH26164 NTRO - Enterprise Cryptographic Discovery")
    print(f" [*] Dashboard: http://localhost:{PORT}")
    print(f"=======================================================\n")
    httpd.serve_forever()


if __name__ == "__main__":
    run()
