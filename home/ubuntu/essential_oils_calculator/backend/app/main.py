from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import CalculationRequest, CalculationReport
from .calculator import EssentialOilCalculator

app = FastAPI(
    title="Calculateur de Doses d'Huiles Essentielles",
    description="Calculateur intelligent basé sur les formules AEL/SED et les données toxicologiques NOAEL, IFRA, CIR",
    version="1.0.0"
)

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

calculator = EssentialOilCalculator()

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/calculate", response_model=CalculationReport)
async def calculate_dosage(request: CalculationRequest):
    """
    Calcule la dose recommandée d'huile essentielle en tenant compte :
    - Des paramètres individuels (poids, âge, sexe, grossesse, pathologies)
    - Des données toxicologiques (NOAEL, AEL, SED)
    - Des limites de sécurité (IFRA, CIR, phototoxicité)
    - De la voie d'administration et de la durée
    """
    try:
        result = calculator.calculate_dosage(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur de calcul: {str(e)}")

@app.get("/reference-data")
async def get_reference_data():
    """Retourne les données de référence toxicologiques et les limites de sécurité."""
    return {
        "noael_reference": calculator.REFERENCE_NOAEL,
        "ifra_limits": calculator.IFRA_LIMITS,
        "cir_limits": calculator.CIR_LIMITS,
        "bioavailability": calculator.BIOAVAILABILITY,
        "default_uf": calculator.DEFAULT_UF
    }
