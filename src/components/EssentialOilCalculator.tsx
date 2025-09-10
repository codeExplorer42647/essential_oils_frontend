import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { AlertTriangle, CheckCircle, Beaker, Droplets } from 'lucide-react'
import IndividualForm from './IndividualForm'
import EssentialOilForm from './EssentialOilForm'
import MultiOilForm from './MultiOilForm'
import ApplicationForm from './ApplicationForm'
import CalculationResults from './CalculationResults'
import { CalculationRequest, CalculationReport } from '../types/calculator'

const EssentialOilCalculator = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationData, setCalculationData] = useState<Partial<CalculationRequest>>({})
  const [results, setResults] = useState<CalculationReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isMultiOilMode, setIsMultiOilMode] = useState(false)

  const steps = [
    { id: 1, title: 'Paramètres Individuels', description: 'Poids, âge, sexe, pathologies' },
    { id: 2, title: isMultiOilMode ? 'Formule Multi-Huiles' : 'Huile Essentielle', description: isMultiOilMode ? 'Mélange et pourcentages' : 'Composition et données toxicologiques' },
    { id: 3, title: 'Application', description: 'Voie, dose, durée du traitement' },
    { id: 4, title: 'Résultats', description: 'Calcul et recommandations' }
  ]

  const handleStepComplete = (stepData: any) => {
    const newData = { ...calculationData, ...stepData }
    
    if (isMultiOilMode && stepData.essential_oil) {
      delete newData.essential_oil
    } else if (!isMultiOilMode && stepData.formula) {
      delete newData.formula
    }
    
    setCalculationData(newData)
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      performCalculation(newData)
    }
  }

  const performCalculation = async (data: CalculationRequest) => {
    setIsCalculating(true)
    setError(null)
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erreur de calcul')
      }

      const result: CalculationReport = await response.json()
      setResults(result)
      setCurrentStep(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion au serveur')
    } finally {
      setIsCalculating(false)
    }
  }

  const resetCalculator = () => {
    setCurrentStep(1)
    setCalculationData({})
    setResults(null)
    setError(null)
    setIsMultiOilMode(false)
  }

  const goToStep = (step: number) => {
    if (step <= currentStep || results) {
      setCurrentStep(step)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Étapes du Calcul</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => goToStep(step.id)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep === step.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : currentStep > step.id || results
                      ? 'bg-green-600 border-green-600 text-white cursor-pointer hover:bg-green-700'
                      : 'border-gray-300 text-gray-400'
                  }`}
                  disabled={step.id > currentStep && !results}
                >
                  {currentStep > step.id || results ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </button>
                <div className="ml-3 text-left">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id || results ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Erreur :</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      {currentStep === 1 && (
        <IndividualForm 
          onComplete={handleStepComplete}
          initialData={calculationData.individual}
        />
      )}

      {currentStep === 2 && (
        <>
          {/* Mode Toggle */}
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Droplets className="h-4 w-4" />
                  <Label htmlFor="oil-mode">Huile Simple</Label>
                </div>
                <Switch
                  id="oil-mode"
                  checked={isMultiOilMode}
                  onCheckedChange={setIsMultiOilMode}
                />
                <div className="flex items-center space-x-2">
                  <Beaker className="h-4 w-4" />
                  <Label htmlFor="oil-mode">Formule Multi-Huiles</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {isMultiOilMode ? (
            <MultiOilForm 
              onComplete={handleStepComplete}
              initialData={calculationData.formula}
            />
          ) : (
            <EssentialOilForm 
              onComplete={handleStepComplete}
              initialData={calculationData.essential_oil}
            />
          )}
        </>
      )}

      {currentStep === 3 && (
        <ApplicationForm 
          onComplete={handleStepComplete}
          initialData={calculationData.application}
          isCalculating={isCalculating}
        />
      )}

      {currentStep === 4 && results && (
        <CalculationResults 
          results={results}
          onReset={resetCalculator}
        />
      )}

      {/* Navigation */}
      {currentStep > 1 && currentStep < 4 && (
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            Étape Précédente
          </Button>
        </div>
      )}
    </div>
  )
}

export default EssentialOilCalculator
