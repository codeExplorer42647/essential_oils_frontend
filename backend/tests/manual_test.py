#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.models import *
from app.calculator import EssentialOilCalculator

def test_single_oil_cinnamon():
    """Test avec cannelle écorce - doit être limité par IFRA"""
    print("=== Test Cannelle Écorce (Single Oil) ===")
    
    individual = Individual(
        body_weight=70.0,
        age_category=AgeCategory.ADULT,
        sex=Sex.MALE,
        physiological_state=PhysiologicalState.NORMAL,
        pathologies=[],
        treatments=[]
    )
    
    cinnamon = EssentialOil(
        name="Cannelle écorce",
        constituents=[
            Constituent(name="cinnamaldéhyde", fraction=0.70, noael=220.0, ifra_limit=0.05, phototoxic=False, cmr_status=False)
        ],
        dominant_family=BiochemicalFamily.ALDEHYDES_AROMATIC
    )
    
    application = Application(
        route=AdministrationRoute.TOPICAL,
        daily_amount=2000.0,  # 2g de produit fini
        duration_days=7,
        application_area=100.0
    )
    
    calculator = EssentialOilCalculator()
    request = CalculationRequest(individual=individual, essential_oil=cinnamon, application=application)
    
    try:
        result = calculator.calculate_dosage(request)
        print(f"Dose finale: {result.dose_recommendation.final_dose_mg:.3f} mg")
        print(f"Concentration: {result.dose_recommendation.concentration_percentage:.4f}%")
        print(f"Facteur limitant: {result.dose_recommendation.limiting_factor}")
        print(f"Constituant limitant: {result.dose_recommendation.limiting_constituent}")
        print(f"Durée max: {result.max_duration_days} jours")
        print()
    except Exception as e:
        print(f"Erreur: {e}")
        print()

def test_multi_oil_formula():
    """Test avec formule multi-huiles"""
    print("=== Test Formule Multi-Huiles ===")
    
    individual = Individual(
        body_weight=70.0,
        age_category=AgeCategory.ADULT,
        sex=Sex.FEMALE,
        physiological_state=PhysiologicalState.NORMAL,
        pathologies=[],
        treatments=[]
    )
    
    lavender = EssentialOil(
        name="Lavande vraie",
        constituents=[
            Constituent(name="linalool", fraction=0.40, noael=500.0, ifra_limit=2.0, phototoxic=False, cmr_status=False)
        ],
        dominant_family=BiochemicalFamily.MONOTERPENOLS
    )
    
    tea_tree = EssentialOil(
        name="Tea tree",
        constituents=[
            Constituent(name="1,8-cinéole", fraction=0.05, noael=500.0, phototoxic=False, cmr_status=False)
        ],
        dominant_family=BiochemicalFamily.OXIDES
    )
    
    from app.models import FormulaItem
    formula = Formula(
        essential_oils=[
            FormulaItem(oil=lavender, percentage=60.0),
            FormulaItem(oil=tea_tree, percentage=40.0)
        ],
        total_percentage=100.0
    )
    
    application = Application(
        route=AdministrationRoute.TOPICAL,
        daily_amount=1000.0,
        duration_days=14,
        application_area=200.0
    )
    
    calculator = EssentialOilCalculator()
    request = CalculationRequest(individual=individual, formula=formula, application=application)
    
    try:
        result = calculator.calculate_dosage(request)
        print(f"Dose finale: {result.dose_recommendation.final_dose_mg:.3f} mg")
        print(f"Concentration: {result.dose_recommendation.concentration_percentage:.4f}%")
        print(f"Facteur limitant: {result.dose_recommendation.limiting_factor}")
        print(f"Monte Carlo IC95: {result.dose_recommendation.monte_carlo_result.confidence_interval if result.dose_recommendation.monte_carlo_result else 'N/A'}")
        print(f"Analyse constituants: {len(result.constituent_analysis)} constituants analysés")
        print()
    except Exception as e:
        print(f"Erreur: {e}")
        print()

def test_inhalation():
    """Test inhalation avec paramètres de pièce"""
    print("=== Test Inhalation ===")
    
    individual = Individual(
        body_weight=60.0,
        age_category=AgeCategory.ADULT,
        sex=Sex.FEMALE,
        physiological_state=PhysiologicalState.NORMAL,
        pathologies=[],
        treatments=[]
    )
    
    eucalyptus = EssentialOil(
        name="Eucalyptus globulus",
        constituents=[
            Constituent(name="1,8-cinéole", fraction=0.80, noael=500.0, phototoxic=False, cmr_status=False)
        ],
        dominant_family=BiochemicalFamily.OXIDES,
        drop_weight_mg=25.0
    )
    
    application = Application(
        route=AdministrationRoute.INHALATION,
        daily_amount=3.0,  # 3 gouttes
        duration_days=7,
        room_volume_m3=20.0,
        exposure_duration_min=30.0,
        air_change_rate=1.0,
        evaporation_rate=0.3
    )
    
    calculator = EssentialOilCalculator()
    request = CalculationRequest(individual=individual, essential_oil=eucalyptus, application=application)
    
    try:
        result = calculator.calculate_dosage(request)
        print(f"Dose finale: {result.dose_recommendation.final_dose_mg:.3f} mg")
        print(f"Concentration: {result.dose_recommendation.concentration_percentage:.4f}%")
        print(f"Facteur limitant: {result.dose_recommendation.limiting_factor}")
        print(f"Durée max: {result.max_duration_days} jours")
        print()
    except Exception as e:
        print(f"Erreur: {e}")
        print()

if __name__ == "__main__":
    test_single_oil_cinnamon()
    test_multi_oil_formula()
    test_inhalation()
    print("Tests terminés!")
