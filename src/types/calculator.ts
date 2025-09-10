export interface Individual {
  body_weight: number
  age_category: '< 30 mois' | 'enfant 2-6 ans' | 'enfant 6-12 ans' | 'adulte' | 'sujet âgé'
  sex: 'male' | 'female'
  physiological_state: 'normal' | 'grossesse' | 'allaitement'
  pathologies: string[]
  treatments: string[]
}

export interface Constituent {
  name: string
  fraction: number
  noael?: number
  ifra_limit?: number
  cir_limit?: number
  phototoxic: boolean
  cmr_status?: boolean
  additional_uf?: number
  source_oil?: string
}

export interface EssentialOil {
  name: string
  constituents: Constituent[]
  dominant_family: string
  density?: number
  drop_weight_mg?: number
  defurocoumarinated?: boolean
  gc_ms_data?: Record<string, number>
}

export interface Formula {
  essential_oils: Array<{
    oil: EssentialOil
    percentage: number
    lot?: string
  }>
  total_percentage: number
  merged_constituents?: Constituent[]
}

export interface MultiProductExposure {
  products: Array<{
    formula: Formula
    application: Application
    name: string
  }>
  total_sed_by_constituent?: Record<string, number>
  ael_budget_consumed?: Record<string, number>
}

export interface Application {
  route: 'topique' | 'orale' | 'inhalation'
  daily_amount: number
  duration_days: number
  application_area?: number
  
  occlusion?: boolean
  damaged_skin?: boolean
  occlusion_factor?: number
  
  room_volume_m3?: number
  exposure_duration_min?: number
  air_change_rate?: number
  evaporation_rate?: number
}

export interface CalculationRequest {
  individual: Individual
  essential_oil?: EssentialOil
  formula?: Formula
  application: Application
  multi_product_exposure?: MultiProductExposure
}

export interface SafetyMargin {
  applied_factor: number
  margin_percentage: number
}

export interface MonteCarloResult {
  mean: number
  std: number
  p5: number
  p95: number
  confidence_interval: string
}

export interface DoseRecommendation {
  final_dose_mg: number
  concentration_percentage: number
  min_dose_mg: number
  max_dose_mg: number
  safety_margin: SafetyMargin
  limiting_factor: string
  limiting_constituent?: string
  sed_ael_ratio?: number
  dose_drops_per_kg?: number
  monte_carlo_result?: MonteCarloResult
  ifra_category_applied?: string
  cir_limit_applied?: string
}

export interface Contraindication {
  type: 'absolute' | 'relative'
  reason: string
  recommendation: string
}

export interface CalculationReport {
  dose_recommendation: DoseRecommendation
  contraindications: Contraindication[]
  warnings: string[]
  max_duration_days: number
  uncertainty_factors_applied: Record<string, number>
  calculation_details: Record<string, number>
  constituent_analysis?: Record<string, Record<string, number>>
  family_duration_limits?: Record<string, number>
  why_this_limit?: string
  calculation_timestamp?: string
  calculator_version?: string
  references?: string[]
}
