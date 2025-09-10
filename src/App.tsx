import { Calculator, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import EssentialOilCalculator from './components/EssentialOilCalculator'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="h-8 w-8 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Calculateur de Doses d'Huiles Essentielles
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Calculateur intelligent basé sur les formules pharmacocinétiques AEL/SED et les données toxicologiques 
            NOAEL, IFRA, CIR pour une aromathérapie sécurisée et personnalisée.
          </p>
        </div>

        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Avertissement important :</strong> Ce calculateur est un outil d'aide à la décision, 
            pas une prescription médicale. Toute administration orale doit être validée par un médecin/pharmacien. 
            Consultez un spécialiste pour les nourrissons, femmes enceintes ou patients avec comorbidités.
          </AlertDescription>
        </Alert>

        <EssentialOilCalculator />

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                Sécurité Validée
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Calculs basés sur les données NOAEL, limites IFRA/CIR et facteurs d'incertitude scientifiquement validés.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Info className="h-5 w-5" />
                Personnalisé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Prise en compte de l'âge, du poids, des pathologies et de l'état physiologique pour des doses adaptées.
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Calculator className="h-5 w-5" />
                Précis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Formules pharmacocinétiques AEL/SED avec marges de sécurité et vérification des contre-indications.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default App
