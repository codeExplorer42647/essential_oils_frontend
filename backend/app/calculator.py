import numpy as np
from typing import Dict, List, Tuple, Optional
from .models import (
    Individual, Application, EssentialOil, Constituent, Formula, MultiProductExposure,
    AdministrationRoute, AgeCategory, Sex, PhysiologicalState, Pathology,
    BiochemicalFamily, Contraindication, CalculationReport, DoseRecommendation,
    SafetyMargin, CalculationRequest, MonteCarloResult
)
from datetime import datetime

class EssentialOilCalculator:
    """
    Calculateur intelligent de doses d'huiles essentielles basé sur les formules AEL/SED
    et les données toxicologiques NOAEL, IFRA, CIR.
    """
    
    DEFAULT_UF = 100
    
    BIOAVAILABILITY = {
        AdministrationRoute.TOPICAL: 1.0,  # 100% par défaut si pas de données
        AdministrationRoute.ORAL: 0.9,     # Généralement élevée
        AdministrationRoute.INHALATION: 0.8 # Variable selon la molécule
    }
    
    VENTILATION_RATE_REST = 0.013  # m³/min au repos
    DAILY_VENTILATION = 19.0       # m³/jour au repos prolongé
    
    REFERENCE_NOAEL = {
        "eugénol": 450.0,           # Moyenne 300-600
        "cinnamaldéhyde": 220.0,    # Moyenne 205-235
        "1,8-cinéole": 500.0,       # Valeur élevée, données cliniques disponibles
        "menthol": 200.0,
        "citral": 100.0,
        "linalool": 500.0,
        "limonène": 600.0,
        "α-pinène": 650.0,
        "β-pinène": 600.0,
        "camphre": 300.0,
        "menthone": 400.0,
        "pulegone": 20.0,           # Très toxique
        "menthofurane": 15.0,       # Très toxique
        "thuyone": 10.0,            # Très toxique
        "estragole": 50.0,          # CMR suspecté
        "anéthole": 300.0,
        "géraniol": 400.0,
        "nérol": 400.0
    }
    
    IFRA_LIMITS = {
        "cinnamaldéhyde": 0.05,
        "eugénol": 0.5,
        "citral": 0.6,
        "linalool": 2.0,
        "isoeugénol": 0.02
    }
    
    CIR_LIMITS = {
        "menthol": 5.4,  # Menthe poivrée
    }
    
    FAMILY_DURATION_LIMITS = {
        BiochemicalFamily.PHENOLS: 10,
        BiochemicalFamily.KETONES_TOXIC: 7,
        BiochemicalFamily.ALDEHYDES_AROMATIC: 14,
        BiochemicalFamily.FUROCOUMARINS: 14,
        BiochemicalFamily.MONOTERPENES_HYDROCARBONS: 21,
        BiochemicalFamily.MONOTERPENOLS: 21
    }
    
    FAMILY_ADDITIONAL_UF = {
        BiochemicalFamily.KETONES_TOXIC: 3.0,
        BiochemicalFamily.PHENOLS: 2.0,
        BiochemicalFamily.ALDEHYDES_AROMATIC: 2.0,
        BiochemicalFamily.FUROCOUMARINS: 5.0
    }
    
    def __init__(self):
        self.uncertainty_factors = {}
        self.warnings = []
        self.contraindications = []
        self.constituent_analysis = {}
        self.family_duration_limits = {}
    
    def calculate_uncertainty_factor(self, individual: Individual, application: Application) -> float:
        """Calcule le facteur d'incertitude total basé sur les caractéristiques individuelles."""
        uf = self.DEFAULT_UF
        factors_applied: Dict[str, float] = {"base": float(self.DEFAULT_UF)}
        
        if individual.age_category == AgeCategory.INFANT:
            uf *= 10
            factors_applied["infant"] = 10.0
        elif individual.age_category in [AgeCategory.CHILD_2_6, AgeCategory.CHILD_6_12]:
            uf *= 3
            factors_applied["child"] = 3.0
        elif individual.age_category == AgeCategory.ELDERLY:
            uf *= 2
            factors_applied["elderly"] = 2.0
            
        if individual.pathologies:
            if Pathology.HEPATIC in individual.pathologies:
                uf *= 3
                factors_applied["hepatic"] = 3.0
            if Pathology.RENAL in individual.pathologies:
                uf *= 2
                factors_applied["renal"] = 2.0
            if Pathology.G6PD in individual.pathologies:
                uf *= 5
                factors_applied["g6pd"] = 5.0
                
        if individual.physiological_state in [PhysiologicalState.PREGNANCY, PhysiologicalState.BREASTFEEDING]:
            uf *= 3
            factors_applied["pregnancy_breastfeeding"] = 3.0
            
        if application.duration_days > 14:
            uf *= 1.5
            factors_applied["long_duration"] = 1.5
            
        if hasattr(self, 'current_family') and self.current_family in self.FAMILY_ADDITIONAL_UF:
            family_uf = self.FAMILY_ADDITIONAL_UF[self.current_family]
            uf *= family_uf
            factors_applied[f"family_{self.current_family}"] = family_uf
        
        self.uncertainty_factors = factors_applied
        return uf
    
    def calculate_ael(self, constituent: Constituent, uf: float) -> float:
        """Calcule l'AEL (Acceptable Exposure Level) pour un constituant."""
        noael = constituent.noael
        if noael is None:
            noael = self.REFERENCE_NOAEL.get(constituent.name.lower())
            if noael is None:
                raise ValueError(f"NOAEL non disponible pour {constituent.name}")
        
        ael = noael / uf
        return ael
    
    def calculate_sed_topical(self, daily_amount: float, concentration: float, 
                            constituent_fraction: float, bioavailability: float, 
                            body_weight: float) -> float:
        """Calcule le SED pour voie topique."""
        sed = (daily_amount * concentration * constituent_fraction * bioavailability) / body_weight
        return sed
    
    def calculate_sed_oral(self, daily_amount: float, concentration: float,
                          constituent_fraction: float, bioavailability: float,
                          body_weight: float) -> float:
        """Calcule le SED pour voie orale."""
        sed = (daily_amount * concentration * constituent_fraction * bioavailability) / body_weight
        return sed
    
    def calculate_sed_inhalation(self, air_concentration: float, ventilation_volume: float,
                                bioavailability: float, body_weight: float) -> float:
        """Calcule le SED pour inhalation."""
        sed = (air_concentration * ventilation_volume * bioavailability) / body_weight
        return sed

    def merge_essential_oils(self, formula: Formula) -> EssentialOil:
        """Fusionne plusieurs huiles essentielles selon leurs pourcentages."""
        if not formula.essential_oils:
            raise ValueError("Aucune huile essentielle dans la formule")
        
        total_percentage = sum(item.percentage for item in formula.essential_oils)
        if abs(total_percentage - 100.0) > 0.1:
            raise ValueError(f"Les pourcentages ne totalisent pas 100% (actuel: {total_percentage}%)")

        merged: Dict[str, Constituent] = {}
        name_parts, family_weights = [], {}
        
        for item in formula.essential_oils:
            oil: EssentialOil = item.oil
            p = item.percentage / 100.0
            name_parts.append(f"{oil.name} ({item.percentage}%)")
            family_weights[oil.dominant_family] = family_weights.get(oil.dominant_family, 0.0) + p
            
            for c in oil.constituents:
                frac = c.fraction * p
                if c.name in merged:
                    m = merged[c.name]
                    m.fraction += frac
                    if c.noael and (m.noael is None or c.noael < m.noael): 
                        m.noael = c.noael
                    if c.ifra_limit and (m.ifra_limit is None or c.ifra_limit < m.ifra_limit): 
                        m.ifra_limit = c.ifra_limit
                    if c.cir_limit and (m.cir_limit is None or c.cir_limit < m.cir_limit): 
                        m.cir_limit = c.cir_limit
                else:
                    merged[c.name] = Constituent(
                        name=c.name, fraction=frac, noael=c.noael, ifra_limit=c.ifra_limit,
                        cir_limit=c.cir_limit, phototoxic=c.phototoxic, cmr_status=c.cmr_status,
                        additional_uf=c.additional_uf, source_oil=oil.name
                    )
        
        dominant_family = max(family_weights, key=lambda k: family_weights[k])
        return EssentialOil(
            name=" + ".join(name_parts),
            constituents=list(merged.values()),
            dominant_family=dominant_family
        )

    def monte_carlo_simulation(self, essential_oil: EssentialOil, individual: Individual,
                               application: Application, n_simulations: int = 1000) -> MonteCarloResult:
        """Simulation Monte-Carlo pour estimer l'incertitude - version simplifiée sans récursion."""
        doses = []
        
        try:
            base_max_conc_systemic, _, _ = self.get_max_concentration_systemic(essential_oil, individual, application)
            base_max_conc_local, _, _ = self.get_max_concentration_local_limits(essential_oil)
            base_max_conc = min(base_max_conc_systemic, base_max_conc_local)
            base_dose = application.daily_amount * base_max_conc * 0.6  # Facteur de sécurité
        except Exception:
            return MonteCarloResult(mean=0, std=0, p5=0, p95=0, confidence_interval="Simulation échouée")
        
        for _ in range(n_simulations):
            try:
                bio_variation = np.random.normal(1.0, 0.15)
                bio_variation = max(0.5, min(1.5, bio_variation))
                
                constituent_variation = np.random.normal(1.0, 0.10)
                constituent_variation = max(0.8, min(1.2, constituent_variation))
                
                drop_variation = np.random.normal(1.0, 0.10)
                drop_variation = max(0.8, min(1.2, drop_variation))
                
                varied_dose = base_dose * bio_variation * constituent_variation * drop_variation
                doses.append(varied_dose)
                
            except Exception:
                continue
        
        if not doses:
            return MonteCarloResult(mean=0, std=0, p5=0, p95=0, confidence_interval="Simulation échouée")
        
        arr = np.array(doses)
        mean, std = float(arr.mean()), float(arr.std())
        p5, p95 = float(np.percentile(arr, 5)), float(np.percentile(arr, 95))
        return MonteCarloResult(mean=mean, std=std, p5=p5, p95=p95, confidence_interval=f"IC95%: [{p5:.2f} - {p95:.2f}] mg")

    def compute_inhalation_air_concentration(self, application: Application, essential_oil: EssentialOil) -> float:
        """Calcule la concentration moyenne dans l'air pour l'inhalation."""
        if not all([application.room_volume_m3, application.exposure_duration_min, essential_oil.drop_weight_mg]):
            return 0.0
        
        drops_per_session = application.daily_amount
        mass_evaporated_mg = drops_per_session * essential_oil.drop_weight_mg * application.evaporation_rate
        
        t_hours = application.exposure_duration_min / 60.0
        ach = application.air_change_rate
        
        if ach > 0 and t_hours > 0:
            c_avg = (mass_evaporated_mg / application.room_volume_m3) * (1 - np.exp(-ach * t_hours)) / (ach * t_hours)
        else:
            c_avg = mass_evaporated_mg / application.room_volume_m3
        
        return max(0.0, c_avg)
    
    def get_max_concentration_systemic(self, essential_oil: EssentialOil, individual: Individual,
                                     application: Application) -> Tuple[float, str, str]:
        """Calcule la concentration maximale basée sur les limites systémiques (AEL/SED)."""
        uf = self.calculate_uncertainty_factor(individual, application)
        bioavailability = self.BIOAVAILABILITY[application.route]
        
        if application.route == AdministrationRoute.TOPICAL:
            if application.occlusion:
                factor = application.occlusion_factor if application.occlusion_factor and application.occlusion_factor >= 1.0 else 1.5
                bioavailability *= max(1.0, min(3.0, factor))
            if application.damaged_skin:
                bioavailability *= 2.0
        
        if application.route == AdministrationRoute.TOPICAL:
            if application.occlusion:
                factor = application.occlusion_factor if application.occlusion_factor and application.occlusion_factor >= 1.0 else 1.5
                bioavailability *= max(1.0, min(3.0, factor))
            if application.damaged_skin:
                bioavailability *= 2.0
        
        max_concentrations = []
        limiting_details = []
        
        for constituent in essential_oil.constituents:
            if constituent.fraction > 0:
                try:
                    ael = self.calculate_ael(constituent, uf)
                    
                    max_conc = (ael * individual.body_weight) / (
                        application.daily_amount * constituent.fraction * bioavailability
                    )
                    
                    max_concentrations.append(max_conc)
                    limiting_details.append(f"{constituent.name}: {max_conc:.4f}")
                    
                except ValueError as e:
                    self.warnings.append(str(e))
                    continue
        
        if not max_concentrations:
            raise ValueError("Aucun constituant avec NOAEL disponible")
            
        min_concentration = min(max_concentrations)
        limiting_index = max_concentrations.index(min_concentration)
        limiting_constituent = essential_oil.constituents[limiting_index].name
        
        return min_concentration, "systémique (AEL/SED)", limiting_constituent
    
    def get_max_concentration_local_limits(self, essential_oil: EssentialOil) -> Tuple[float, str, str]:
        """Calcule la concentration maximale basée sur les limites locales IFRA/CIR."""
        max_concentrations = []
        limiting_details = []
        
        for constituent in essential_oil.constituents:
            if constituent.fraction > 0:
                if constituent.ifra_limit is not None:
                    max_conc_ifra = constituent.ifra_limit / 100 / constituent.fraction
                    max_concentrations.append(max_conc_ifra)
                    limiting_details.append(f"{constituent.name} (IFRA): {max_conc_ifra:.4f}")
                
                elif constituent.name.lower() in self.IFRA_LIMITS:
                    ifra_limit = self.IFRA_LIMITS[constituent.name.lower()]
                    max_conc_ifra = ifra_limit / 100 / constituent.fraction
                    max_concentrations.append(max_conc_ifra)
                    limiting_details.append(f"{constituent.name} (IFRA): {max_conc_ifra:.4f}")
                
                if constituent.cir_limit is not None:
                    max_conc_cir = constituent.cir_limit / 100 / constituent.fraction
                    max_concentrations.append(max_conc_cir)
                    limiting_details.append(f"{constituent.name} (CIR): {max_conc_cir:.4f}")
                
                elif constituent.name.lower() in self.CIR_LIMITS:
                    cir_limit = self.CIR_LIMITS[constituent.name.lower()]
                    max_conc_cir = cir_limit / 100 / constituent.fraction
                    max_concentrations.append(max_conc_cir)
                    limiting_details.append(f"{constituent.name} (CIR): {max_conc_cir:.4f}")
        
        if not max_concentrations:
            return float('inf'), "aucune limite locale", ""
            
        min_concentration = min(max_concentrations)
        limiting_index = max_concentrations.index(min_concentration)
        limiting_detail = limiting_details[limiting_index]
        limiting_constituent = limiting_detail.split()[0]
        
        return min_concentration, "limite locale (IFRA/CIR)", limiting_constituent
    
    def check_contraindications(self, individual: Individual, essential_oil: EssentialOil,
                              application: Application) -> List[Contraindication]:
        """Vérifie les contre-indications absolues et relatives."""
        contraindications = []
        
        if individual.age_category == AgeCategory.INFANT:
            contraindications.append(Contraindication(
                type="absolute",
                reason="Âge < 30 mois",
                recommendation="Contre-indiqué pour toutes les huiles essentielles"
            ))
            return contraindications
        
        if essential_oil.dominant_family == BiochemicalFamily.PHENOLS:
            if individual.age_category in [AgeCategory.CHILD_2_6, AgeCategory.CHILD_6_12]:
                contraindications.append(Contraindication(
                    type="absolute",
                    reason="HE phénoliques chez l'enfant",
                    recommendation="Éviter les HE riches en phénols chez les enfants"
                ))
            
            if individual.physiological_state in [PhysiologicalState.PREGNANCY, PhysiologicalState.BREASTFEEDING]:
                contraindications.append(Contraindication(
                    type="relative",
                    reason="HE phénoliques et grossesse/allaitement",
                    recommendation="Éviter les phénols à forte dose pendant la grossesse"
                ))
        
        if essential_oil.dominant_family == BiochemicalFamily.ALDEHYDES_AROMATIC:
            if individual.age_category in [AgeCategory.CHILD_2_6, AgeCategory.CHILD_6_12]:
                contraindications.append(Contraindication(
                    type="absolute",
                    reason="HE aldéhydiques chez l'enfant",
                    recommendation="Éviter les aldéhydes aromatiques chez les enfants"
                ))
        
        if essential_oil.dominant_family in [BiochemicalFamily.KETONES_TOXIC, BiochemicalFamily.KETONES_SAFE]:
            if individual.physiological_state == PhysiologicalState.PREGNANCY:
                contraindications.append(Contraindication(
                    type="absolute",
                    reason="Cétones et grossesse",
                    recommendation="Éviter les cétones (pulegone, menthofurane, thuyone, camphre) pendant la grossesse"
                ))
            
            if Pathology.EPILEPSY in individual.pathologies:
                contraindications.append(Contraindication(
                    type="absolute",
                    reason="Cétones et épilepsie",
                    recommendation="Éviter les cétones chez les patients épileptiques"
                ))
        
        if application.route == AdministrationRoute.ORAL:
            if individual.age_category in [AgeCategory.CHILD_2_6, AgeCategory.CHILD_6_12, AgeCategory.INFANT]:
                contraindications.append(Contraindication(
                    type="absolute",
                    reason="Voie orale chez l'enfant",
                    recommendation="Voie orale contre-indiquée chez les enfants sauf spécialités validées"
                ))
        
        if "anticoagulants" in individual.treatments or "antiagrégants" in individual.treatments:
            for constituent in essential_oil.constituents:
                if constituent.name.lower() == "eugénol":
                    contraindications.append(Contraindication(
                        type="relative",
                        reason="Eugénol et anticoagulants",
                        recommendation="Prudence avec eugénol chez patients sous anticoagulants (effet anti-plaquettaire)"
                    ))
        
        return contraindications
    
    def calculate_dosage(self, request: CalculationRequest) -> CalculationReport:
        """Calcule la dose recommandée d'huile essentielle (simple ou formule multi-huiles)."""
        self.warnings = []
        self.contraindications = []
        self.constituent_analysis = {}

        if request.formula:
            essential_oil = self.merge_essential_oils(request.formula)
        elif request.essential_oil:
            essential_oil = request.essential_oil
        else:
            raise ValueError("Aucune huile essentielle ou formule fournie")

        self.current_family = essential_oil.dominant_family

        contraindications = self.check_contraindications(
            request.individual, essential_oil, request.application
        )
        
        absolute_contraindications = [c for c in contraindications if c.type == "absolute"]
        if absolute_contraindications:
            return CalculationReport(
                dose_recommendation=DoseRecommendation(
                    final_dose_mg=0.0,
                    concentration_percentage=0.0,
                    min_dose_mg=0.0,
                    max_dose_mg=0.0,
                    safety_margin=SafetyMargin(applied_factor=0.0, margin_percentage=0.0),
                    limiting_factor="contre-indication absolue"
                ),
                contraindications=contraindications,
                warnings=self.warnings,
                max_duration_days=0,
                uncertainty_factors_applied=self.uncertainty_factors,
                calculation_details={}
            )
        
        try:
            max_conc_systemic, limiting_factor_sys, limiting_constituent_sys = self.get_max_concentration_systemic(
                essential_oil, request.individual, request.application
            )
            
            max_conc_local, limiting_factor_local, limiting_constituent_local = self.get_max_concentration_local_limits(
                essential_oil
            )
            
            if max_conc_local < max_conc_systemic:
                max_concentration = max_conc_local
                limiting_factor = limiting_factor_local
                limiting_constituent = limiting_constituent_local
            else:
                max_concentration = max_conc_systemic
                limiting_factor = limiting_factor_sys
                limiting_constituent = limiting_constituent_sys
            
            max_dose_he = request.application.daily_amount * max_concentration
            
            safety_factor = 0.5  # 50% de réduction par défaut
            final_dose = max_dose_he * safety_factor
            final_concentration = max_concentration * safety_factor
            
            margin_percentage = ((max_dose_he - final_dose) / max_dose_he) * 100
            
            max_duration = self.FAMILY_DURATION_LIMITS.get(essential_oil.dominant_family, 14)
            
            if request.individual.age_category in [AgeCategory.CHILD_2_6, AgeCategory.CHILD_6_12]:
                max_duration = min(max_duration, 7)
            elif request.individual.pathologies:
                max_duration = min(max_duration, 7)
            
            for constituent in essential_oil.constituents:
                if constituent.fraction > 0:
                    try:
                        ael = self.calculate_ael(constituent, self.calculate_uncertainty_factor(request.individual, request.application))
                        sed = self.calculate_sed_topical(
                            request.application.daily_amount, final_concentration,
                            constituent.fraction, self.BIOAVAILABILITY[request.application.route],
                            request.individual.body_weight
                        )
                        ratio = sed / ael if ael > 0 else 0
                        
                        self.constituent_analysis[constituent.name] = {
                            "sed": sed,
                            "ael": ael,
                            "ratio": ratio,
                            "budget_consumed": (ratio * 100)
                        }
                    except:
                        continue
            
            sed_ael_ratio = 0.0
            if limiting_constituent in self.constituent_analysis:
                sed_ael_ratio = self.constituent_analysis[limiting_constituent]["ratio"]
            
            dose_drops_per_kg = (final_dose / essential_oil.drop_weight_mg) / request.individual.body_weight
            
            monte_carlo_result = None
            try:
                monte_carlo_result = self.monte_carlo_simulation(essential_oil, request.individual, request.application)
            except Exception as e:
                self.warnings.append(f"Simulation Monte-Carlo échouée: {str(e)}")
            
            if request.multi_product_exposure:
                try:
                    self.process_multi_product_exposure(request.multi_product_exposure, request.individual)
                except Exception as e:
                    self.warnings.append(f"Agrégation multi-produits échouée: {str(e)}")
            
            why_this_limit = f"Limite appliquée: {limiting_factor}"
            if limiting_constituent:
                why_this_limit += f" (constituant: {limiting_constituent})"
            if limiting_factor == "limite locale (IFRA/CIR)":
                why_this_limit += ". Les limites IFRA/CIR sont basées sur des études de sensibilisation cutanée."
            elif limiting_factor == "systémique (AEL/SED)":
                why_this_limit += f". Basé sur NOAEL et facteur d'incertitude total: {sum(self.uncertainty_factors.values())}"
            
            calculation_details = {
                "uf_total": self.calculate_uncertainty_factor(request.individual, request.application),
                "max_concentration_systemic": max_conc_systemic,
                "max_concentration_local": max_conc_local,
                "max_dose_he_mg": max_dose_he,
                "safety_factor_applied": safety_factor
            }
            
            return CalculationReport(
                dose_recommendation=DoseRecommendation(
                    final_dose_mg=final_dose,
                    concentration_percentage=final_concentration * 100,
                    min_dose_mg=final_dose * 0.5,  # Borne minimale
                    max_dose_mg=max_dose_he,       # Borne maximale
                    safety_margin=SafetyMargin(
                        applied_factor=safety_factor,
                        margin_percentage=margin_percentage
                    ),
                    limiting_factor=limiting_factor,
                    limiting_constituent=limiting_constituent,
                    sed_ael_ratio=sed_ael_ratio,
                    dose_drops_per_kg=dose_drops_per_kg,
                    monte_carlo_result=monte_carlo_result,
                    ifra_category_applied="General dermal"
                ),
                contraindications=contraindications,
                warnings=self.warnings,
                max_duration_days=max_duration,
                uncertainty_factors_applied=self.uncertainty_factors,
                calculation_details=calculation_details,
                constituent_analysis=self.constituent_analysis,
                family_duration_limits=dict(self.FAMILY_DURATION_LIMITS),
                why_this_limit=why_this_limit,
                calculation_timestamp=datetime.now().isoformat(),
                calculator_version="2.0",
                references=[
                    "IFRA Standards 49th Amendment (2020)",
                    "SCCS Notes of Guidance (2021)",
                    "Tisserand & Young - Essential Oil Safety 2nd Ed."
                ]
            )
            
        except Exception as e:
            self.warnings.append(f"Erreur de calcul: {str(e)}")
            return CalculationReport(
                dose_recommendation=DoseRecommendation(
                    final_dose_mg=0.0,
                    concentration_percentage=0.0,
                    min_dose_mg=0.0,
                    max_dose_mg=0.0,
                    safety_margin=SafetyMargin(applied_factor=0.0, margin_percentage=0.0),
                    limiting_factor="erreur de calcul"
                ),
                contraindications=contraindications,
                warnings=self.warnings,
                max_duration_days=0,
                uncertainty_factors_applied=self.uncertainty_factors,
                calculation_details={}
            )
