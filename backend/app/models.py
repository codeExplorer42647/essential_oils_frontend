from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal
from enum import Enum
import numpy as np

class AgeCategory(str, Enum):
    INFANT = "< 30 mois"
    CHILD_2_6 = "enfant 2-6 ans"
    CHILD_6_12 = "enfant 6-12 ans"
    ADULT = "adulte"
    ELDERLY = "sujet âgé"

class Sex(str, Enum):
    MALE = "male"
    FEMALE = "female"

class AdministrationRoute(str, Enum):
    TOPICAL = "topique"
    ORAL = "orale"
    INHALATION = "inhalation"

class BiochemicalFamily(str, Enum):
    MONOTERPENES_HYDROCARBONS = "monoterpènes hydrocarbures"
    MONOTERPENOLS = "monoterpénols"
    MONOTERPENE_ALDEHYDES = "aldéhydes monoterpéniques"
    MONOTERPENE_KETONES = "cétones monoterpéniques"
    MONOTERPENE_ESTERS = "esters monoterpéniques"
    
    SESQUITERPENES = "sesquiterpènes"
    SESQUITERPENOLS = "sesquiterpénols"
    
    PHENOLS = "phénols"
    PHENYLPROPANOIDS = "phénylpropanoïdes"
    
    ALDEHYDES_AROMATIC = "aldéhydes aromatiques"
    ALDEHYDES_ALIPHATIC = "aldéhydes aliphatiques"
    
    KETONES_SAFE = "cétones sûres"  # camphre, menthone
    KETONES_TOXIC = "cétones toxiques"  # pulegone, menthofurane, thuyone
    
    OXIDES = "oxydes"
    LACTONES = "lactones"
    FUROCOUMARINS = "furocoumarines"
    ESTERS = "esters"
    ETHERS = "éthers"

class PhysiologicalState(str, Enum):
    NORMAL = "normal"
    PREGNANCY = "grossesse"
    BREASTFEEDING = "allaitement"

class Pathology(str, Enum):
    NONE = "aucune"
    HEPATIC = "hépatique"
    RENAL = "rénale"
    RESPIRATORY = "respiratoire"
    NEUROLOGICAL = "neurologique"
    HEMATOLOGICAL = "hématologique"
    G6PD = "G6PD"
    ASTHMA = "asthme"
    EPILEPSY = "épilepsie"

class Constituent(BaseModel):
    name: str
    fraction: float = Field(..., ge=0, le=1, description="Fraction massique dans l'HE (0-1)")
    noael: Optional[float] = Field(None, description="NOAEL en mg/kg/j")
    ifra_limit: Optional[float] = Field(None, description="Limite IFRA en % dans le produit fini")
    cir_limit: Optional[float] = Field(None, description="Limite CIR en %")
    phototoxic: bool = False
    cmr_status: bool = False  # Cancérogène, Mutagène, Reprotoxique
    additional_uf: float = 1.0  # Facteur d'incertitude additionnel spécifique
    source_oil: Optional[str] = Field(None, description="HE d'origine pour mélanges")

class EssentialOil(BaseModel):
    name: str
    constituents: List[Constituent]
    dominant_family: BiochemicalFamily
    density: float = Field(0.9, description="Densité de l'HE (g/mL)")
    drop_weight_mg: float = Field(30.0, description="Poids d'une goutte en mg")
    defurocoumarinated: bool = Field(False, description="HE défurocoumarinée (pour agrumes)")
    gc_ms_data: Optional[Dict[str, float]] = Field(None, description="Données GC-MS importées")

class FormulaItem(BaseModel):
    """Item dans une formule multi-huiles"""
    oil: EssentialOil
    percentage: float
    lot: Optional[str] = None

class Formula(BaseModel):
    """Formule multi-huiles avec pourcentages"""
    essential_oils: List[FormulaItem] = Field(description="Liste des HE avec pourcentages")
    total_percentage: float = Field(100.0, description="Total des pourcentages (doit être 100)")
    merged_constituents: List[Constituent] = Field(default_factory=list, description="Constituants fusionnés")
    
class Individual(BaseModel):
    body_weight: float = Field(..., gt=0, description="Poids corporel en kg")
    age_category: AgeCategory
    sex: Sex
    physiological_state: PhysiologicalState = PhysiologicalState.NORMAL
    pathologies: List[Pathology] = []
    treatments: List[str] = []

class Application(BaseModel):
    route: AdministrationRoute
    daily_amount: float = Field(..., gt=0, description="Quantité quotidienne en mg")
    duration_days: int = Field(7, gt=0, description="Durée prévue en jours")
    application_area: Optional[float] = Field(None, description="Surface d'application en cm² (pour topique)")
    
    occlusion: bool = Field(False, description="Application sous occlusion")
    damaged_skin: bool = Field(False, description="Peau lésée")
    occlusion_factor: float = Field(1.0, description="Facteur multiplicateur occlusion (1.5-3)")
    
    room_volume_m3: Optional[float] = Field(None, description="Volume de la pièce en m³")
    exposure_duration_min: Optional[float] = Field(None, description="Durée d'exposition en minutes")
    air_change_rate: float = Field(0.5, description="Taux de renouvellement d'air (ACH)")
    evaporation_rate: float = Field(0.1, description="% d'évaporation de l'HE")

class MultiProductExposure(BaseModel):
    """Exposition multi-produits pour QRA/IFRA"""
    products: List[Dict[str, float]] = Field(description="Liste des produits utilisés dans la journée")
    total_sed_by_constituent: Dict[str, float] = Field(default_factory=dict)
    ael_budget_consumed: Dict[str, float] = Field(default_factory=dict)

class CalculationRequest(BaseModel):
    individual: Individual
    essential_oil: Optional[EssentialOil] = None  # Pour compatibilité rétroactive
    formula: Optional[Formula] = None  # Nouvelle formule multi-huiles
    application: Application
    multi_product_exposure: Optional[MultiProductExposure] = None

class SafetyMargin(BaseModel):
    applied_factor: float = Field(0.5, ge=0.1, le=1.0, description="Facteur de sécurité appliqué")
    margin_percentage: float = Field(description="Marge d'erreur en %")

class MonteCarloResult(BaseModel):
    mean: float
    std: float
    p5: float  # Percentile 5%
    p95: float  # Percentile 95%
    confidence_interval: str

class DoseRecommendation(BaseModel):
    final_dose_mg: float
    concentration_percentage: float
    min_dose_mg: float
    max_dose_mg: float
    safety_margin: SafetyMargin
    limiting_factor: str
    limiting_constituent: Optional[str] = None
    
    sed_ael_ratio: float = Field(description="Ratio SED/AEL du constituant limitant")
    dose_drops_per_kg: float = Field(description="Dose en gouttes/kg")
    monte_carlo_result: Optional[MonteCarloResult] = None
    ifra_category_applied: Optional[str] = None
    cir_limit_applied: Optional[str] = None

class Contraindication(BaseModel):
    type: Literal["absolute", "relative"]
    reason: str
    recommendation: str

class CalculationReport(BaseModel):
    dose_recommendation: DoseRecommendation
    contraindications: List[Contraindication]
    warnings: List[str]
    max_duration_days: int
    uncertainty_factors_applied: Dict[str, float]
    calculation_details: Dict[str, float]
    
    constituent_analysis: Dict[str, Dict[str, float]] = Field(default_factory=dict)
    
    family_duration_limits: Dict[str, int] = Field(default_factory=dict)
    why_this_limit: str = Field(description="Explication de la limite appliquée")
    
    calculation_timestamp: Optional[str] = None
    calculator_version: str = "2.0"
    references: List[str] = Field(default_factory=list)
