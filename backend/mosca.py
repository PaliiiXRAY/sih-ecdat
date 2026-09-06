"""
Mosca's Inequality Theorem Calculator for SIH26164 ECDAT
Implements Mosca's Risk Determination Framework for Post-Quantum Migration Planning.

Mosca's Theorem:
  If X + Y > Z, the cryptographic asset is ALREADY AT RISK from Harvest Now, Decrypt Later (HNDL) attacks.

Where:
  X = Data Shelf-Life (years the data must remain confidential)
  Y = Migration Time (years needed to transition cryptographic infrastructure)
  Z = Quantum Threat Horizon (years until a CRQC capable of breaking the algorithm exists)

Reference: Michele Mosca, "Cybersecurity in an Era with Quantum Computers", IEEE Security & Privacy, 2018.
"""
import datetime

# Default Quantum Threat Horizon estimates from various sources
QUANTUM_HORIZONS = {
    "conservative": {
        "label": "Conservative Estimate (NIST/Academic Consensus)",
        "z_years": 15,
        "source": "NIST PQC Standardization Report, 2024",
        "description": "Most conservative timeline assuming slow progress in error correction."
    },
    "moderate": {
        "label": "Moderate Estimate (Industry Consensus)",
        "z_years": 10,
        "source": "IBM Quantum Roadmap 2033, Google Willow Milestone",
        "description": "Based on current industry roadmaps from IBM, Google, and Chinese quantum programs."
    },
    "aggressive": {
        "label": "Aggressive Estimate (State Actor Threat)",
        "z_years": 5,
        "source": "NSA CNSA 2.0 Advisory, NTRO Threat Brief",
        "description": "Assumes state-sponsored programs (China, US) may achieve CRQC capabilities sooner. This is the threat model used by defense and intelligence agencies."
    }
}

# Default data shelf-life by sector
SECTOR_SHELF_LIFE = {
    "defense": {"x_years": 25, "label": "Defense & Military Intelligence"},
    "healthcare": {"x_years": 20, "label": "Healthcare & Patient Records (HIPAA)"},
    "banking": {"x_years": 15, "label": "Banking & Financial Records (RBI/PCI-DSS)"},
    "government": {"x_years": 20, "label": "Government Classified / PMO Communications"},
    "aadhaar": {"x_years": 30, "label": "Aadhaar & National Identity Infrastructure"},
    "enterprise": {"x_years": 10, "label": "Enterprise SaaS & Cloud Applications"},
    "ecommerce": {"x_years": 5, "label": "E-Commerce & Transaction Data"},
    "general": {"x_years": 7, "label": "General Purpose Application Data"}
}


class MoscaCalculator:
    @staticmethod
    def evaluate(
        x_shelf_life: int = 10,
        y_migration_time: int = 3,
        z_quantum_horizon: int = 10,
        algorithm_family: str = "RSA"
    ) -> dict:
        """
        Evaluates Mosca's Inequality for a given cryptographic asset.

        Returns a comprehensive risk assessment with:
        - Whether the asset is at risk (X + Y > Z)
        - The risk window (how many years past the safe boundary)
        - The deadline by which migration must complete
        - Urgency classification
        """
        current_year = datetime.datetime.now().year
        sum_xy = x_shelf_life + y_migration_time
        is_at_risk = (sum_xy > z_quantum_horizon)
        risk_margin = sum_xy - z_quantum_horizon

        # Calculate key dates
        quantum_deadline_year = current_year + z_quantum_horizon
        migration_must_start_by = quantum_deadline_year - y_migration_time
        data_exposure_until = current_year + x_shelf_life

        # Urgency classification
        years_remaining = migration_must_start_by - current_year
        if is_at_risk:
            if years_remaining <= 0:
                urgency = "IMMEDIATE"
                urgency_color = "red"
                urgency_message = f"Migration deadline has PASSED. Data encrypted today with {algorithm_family} is already exposed to HNDL attacks. Immediate action required."
            elif years_remaining <= 2:
                urgency = "CRITICAL"
                urgency_color = "red"
                urgency_message = f"Only {years_remaining} year(s) remaining before the migration deadline. Initiate PQC transition immediately."
            elif years_remaining <= 5:
                urgency = "HIGH"
                urgency_color = "orange"
                urgency_message = f"{years_remaining} years until migration deadline. Begin planning and pilot testing PQC algorithms now."
            else:
                urgency = "ELEVATED"
                urgency_color = "yellow"
                urgency_message = f"{years_remaining} years remaining. Schedule PQC migration in the next strategic planning cycle."
        else:
            urgency = "MONITOR"
            urgency_color = "green"
            urgency_message = f"Current timeline is safe (X + Y = {sum_xy} <= Z = {z_quantum_horizon}). Re-evaluate annually as quantum computing advances."

        return {
            "is_at_risk": is_at_risk,
            "x_shelf_life": x_shelf_life,
            "y_migration_time": y_migration_time,
            "z_quantum_horizon": z_quantum_horizon,
            "sum_xy": sum_xy,
            "risk_margin": risk_margin,
            "current_year": current_year,
            "quantum_deadline_year": quantum_deadline_year,
            "migration_must_start_by": migration_must_start_by,
            "data_exposure_until": data_exposure_until,
            "urgency": urgency,
            "urgency_color": urgency_color,
            "urgency_message": urgency_message,
            "algorithm_family": algorithm_family,
            "formula_display": f"X({x_shelf_life}) + Y({y_migration_time}) = {sum_xy}  {'>' if is_at_risk else '<='} Z({z_quantum_horizon})",
            "verdict": "AT RISK (HNDL Vulnerable)" if is_at_risk else "WITHIN SAFE WINDOW"
        }

    @staticmethod
    def evaluate_for_finding(finding: dict, sector: str = "enterprise", horizon: str = "moderate") -> dict:
        """Convenience method that uses sector and horizon presets."""
        x = SECTOR_SHELF_LIFE.get(sector, SECTOR_SHELF_LIFE["general"])["x_years"]
        z = QUANTUM_HORIZONS.get(horizon, QUANTUM_HORIZONS["moderate"])["z_years"]
        y = 3  # Default migration time: 3 years (typical enterprise)

        family = finding.get("algorithm_family", finding.get("classification", {}).get("algorithm_family", "RSA"))
        return MoscaCalculator.evaluate(x, y, z, family)

    @staticmethod
    def get_presets():
        """Returns available sector and horizon presets for the UI."""
        return {
            "sectors": SECTOR_SHELF_LIFE,
            "horizons": QUANTUM_HORIZONS
        }
