"""
CycloneDX Cryptographic Bill of Materials (CBOM) Generator for SIH26164 ECDAT
Exports cryptographic inventory in CycloneDX v1.6 CBOM format (JSON).

CycloneDX is the OWASP standard for Software Bill of Materials.
Version 1.6 introduced native support for cryptographic asset tracking.
"""
import json
import uuid
import datetime


class CBOMGenerator:
    @staticmethod
    def generate(classified_findings: list, project_name: str = "ECDAT-Scan") -> dict:
        """Generates a CycloneDX 1.6 compliant CBOM from classified scan results."""

        components = []
        for idx, finding in enumerate(classified_findings):
            cls = finding.get("classification", {})

            component = {
                "type": "cryptographic-asset",
                "bom-ref": f"crypto-asset-{idx + 1}",
                "name": cls.get("algorithm", finding.get("algorithm", "Unknown")),
                "version": cls.get("key_size", finding.get("key_size", "Unknown")),
                "description": cls.get("explanation", ""),
                "properties": [
                    {
                        "name": "cdx:crypto:algorithmFamily",
                        "value": cls.get("algorithm_family", finding.get("algorithm_family", ""))
                    },
                    {
                        "name": "cdx:crypto:keySize",
                        "value": str(cls.get("key_size", finding.get("key_size", "Unknown")))
                    },
                    {
                        "name": "cdx:crypto:quantumVulnerability",
                        "value": cls.get("quantum_impact", "UNKNOWN")
                    },
                    {
                        "name": "cdx:crypto:quantumAttackVector",
                        "value": cls.get("quantum_attack", "")
                    },
                    {
                        "name": "cdx:crypto:riskLevel",
                        "value": cls.get("risk_level", "UNKNOWN")
                    },
                    {
                        "name": "cdx:crypto:riskScore",
                        "value": str(cls.get("risk_score", 0))
                    },
                    {
                        "name": "cdx:crypto:hndlVulnerable",
                        "value": str(cls.get("hndl_vulnerable", False))
                    },
                    {
                        "name": "cdx:crypto:sourceFile",
                        "value": finding.get("file", "")
                    },
                    {
                        "name": "cdx:crypto:sourceLine",
                        "value": str(finding.get("line_number", 0))
                    },
                    {
                        "name": "cdx:crypto:language",
                        "value": finding.get("language", "")
                    }
                ]
            }
            components.append(component)

        cbom = {
            "bomFormat": "CycloneDX",
            "specVersion": "1.6",
            "serialNumber": f"urn:uuid:{uuid.uuid4()}",
            "version": 1,
            "metadata": {
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                "tools": {
                    "components": [
                        {
                            "type": "application",
                            "name": "ECDAT - Enterprise Cryptographic Discovery & Analysis Tool",
                            "version": "1.0.0",
                            "description": "SIH26164 NTRO: Automated cryptographic asset scanner with quantum risk classification and CBOM generation.",
                            "author": "SIH26164 Team"
                        }
                    ]
                },
                "component": {
                    "type": "application",
                    "name": project_name,
                    "version": "1.0.0"
                }
            },
            "components": components,
            "compositions": [
                {
                    "aggregate": "complete",
                    "assemblies": [c["bom-ref"] for c in components]
                }
            ]
        }

        return cbom

    @staticmethod
    def to_json_string(cbom: dict, indent: int = 2) -> str:
        """Serializes the CBOM to a formatted JSON string."""
        return json.dumps(cbom, indent=indent, ensure_ascii=False)
