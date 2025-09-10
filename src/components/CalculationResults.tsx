import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Download, 
  RotateCcw,
  Calculator,
  Shield,
  Clock
} from 'lucide-react'
import { CalculationReport } from '../types/calculator'

interface CalculationResultsProps {
  results: CalculationReport
  onReset: () => void
}

const CalculationResults: React.FC<CalculationResultsProps> = ({ results, onReset }) => {
  const { dose_recommendation, contraindications, warnings, max_duration_days, uncertainty_factors_applied, calculation_details, constituent_analysis, why_this_limit } = results

  const generateReport = async () => {
    try {
      const jsPDF = (await import('jspdf')).default
      const autoTable = (await import('jspdf-autotable')).default
      
      const doc = new jsPDF()
      let yPosition = 20
      
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('RAPPORT DE CALCUL DE DOSE D\'HUILE ESSENTIELLE', 20, yPosition)
      yPosition += 15
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Date du calcul: ${new Date().toLocaleString('fr-FR')}`, 20, yPosition)
      yPosition += 15
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('DOSE RECOMMANDÉE', 20, yPosition)
      yPosition += 8
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`• Dose finale: ${dose_recommendation.final_dose_mg.toFixed(3)} mg`, 20, yPosition)
      yPosition += 6
      doc.text(`• Concentration: ${dose_recommendation.concentration_percentage.toFixed(4)}%`, 20, yPosition)
      yPosition += 6
      doc.text(`• Plage de sécurité: ${dose_recommendation.min_dose_mg.toFixed(3)} - ${dose_recommendation.max_dose_mg.toFixed(3)} mg`, 20, yPosition)
      yPosition += 6
      doc.text(`• Marge de sécurité: ${dose_recommendation.safety_margin.margin_percentage}%`, 20, yPosition)
      yPosition += 6
      doc.text(`• Facteur limitant: ${dose_recommendation.limiting_factor}`, 20, yPosition)
      yPosition += 6
      
      if (dose_recommendation.limiting_constituent) {
        doc.text(`• Constituant limitant: ${dose_recommendation.limiting_constituent}`, 20, yPosition)
        yPosition += 6
      }
      
      if (dose_recommendation.sed_ael_ratio) {
        doc.text(`• Ratio SED/AEL: ${(dose_recommendation.sed_ael_ratio * 100).toFixed(1)}%`, 20, yPosition)
        yPosition += 6
      }
      
      yPosition += 10
      
      if (dose_recommendation.monte_carlo_result) {
        doc.setFont('helvetica', 'bold')
        doc.text('ANALYSE MONTE-CARLO', 20, yPosition)
        yPosition += 8
        
        doc.setFont('helvetica', 'normal')
        doc.text(`• Moyenne: ${dose_recommendation.monte_carlo_result.mean.toFixed(3)} mg`, 20, yPosition)
        yPosition += 6
        doc.text(`• Écart-type: ${dose_recommendation.monte_carlo_result.std.toFixed(3)} mg`, 20, yPosition)
        yPosition += 6
        doc.text(`• ${dose_recommendation.monte_carlo_result.confidence_interval}`, 20, yPosition)
        yPosition += 15
      }
      
      if (constituent_analysis && Object.keys(constituent_analysis).length > 0) {
        doc.setFont('helvetica', 'bold')
        doc.text('ANALYSE DES CONSTITUANTS', 20, yPosition)
        yPosition += 10
        
        const tableData = Object.entries(constituent_analysis).map(([name, data]) => [
          name,
          data.sed?.toFixed(4) || 'N/A',
          data.ael?.toFixed(4) || 'N/A',
          data.ratio ? (data.ratio * 100).toFixed(1) + '%' : 'N/A',
          data.budget_consumed?.toFixed(1) + '%' || 'N/A'
        ])
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Constituant', 'SED (mg/kg/j)', 'AEL (mg/kg/j)', 'Ratio (%)', 'Budget AEL (%)']],
          body: tableData,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [66, 139, 202] }
        })
        
        yPosition = (doc as any).lastAutoTable.finalY + 15
      }
      
      if (Object.keys(uncertainty_factors_applied).length > 0) {
        doc.setFont('helvetica', 'bold')
        doc.text('FACTEURS D\'INCERTITUDE APPLIQUÉS', 20, yPosition)
        yPosition += 8
        
        doc.setFont('helvetica', 'normal')
        Object.entries(uncertainty_factors_applied).forEach(([factor, value]) => {
          doc.text(`• ${factor}: ${value}`, 20, yPosition)
          yPosition += 6
        })
        yPosition += 10
      }
      
      if (Object.keys(calculation_details).length > 0) {
        doc.setFont('helvetica', 'bold')
        doc.text('DÉTAILS DE CALCUL', 20, yPosition)
        yPosition += 8
        
        doc.setFont('helvetica', 'normal')
        Object.entries(calculation_details).forEach(([key, value]) => {
          doc.text(`• ${key}: ${value}`, 20, yPosition)
          yPosition += 6
        })
        yPosition += 10
      }
      
      // Contraindications
      doc.setFont('helvetica', 'bold')
      doc.text('CONTRE-INDICATIONS', 20, yPosition)
      yPosition += 8
      
      doc.setFont('helvetica', 'normal')
      if (contraindications.length > 0) {
        contraindications.forEach(ci => {
          doc.text(`• ${ci.type.toUpperCase()}: ${ci.reason}`, 20, yPosition)
          yPosition += 6
          doc.text(`  Recommandation: ${ci.recommendation}`, 20, yPosition)
          yPosition += 8
        })
      } else {
        doc.text('• Aucune contre-indication identifiée', 20, yPosition)
        yPosition += 8
      }
      
      doc.setFont('helvetica', 'bold')
      doc.text('AVERTISSEMENTS', 20, yPosition)
      yPosition += 8
      
      doc.setFont('helvetica', 'normal')
      if (warnings.length > 0) {
        warnings.forEach(warning => {
          doc.text(`• ${warning}`, 20, yPosition)
          yPosition += 6
        })
      } else {
        doc.text('• Aucun avertissement spécifique', 20, yPosition)
        yPosition += 6
      }
      yPosition += 10
      
      doc.setFont('helvetica', 'bold')
      doc.text('DURÉE MAXIMALE RECOMMANDÉE', 20, yPosition)
      yPosition += 8
      
      doc.setFont('helvetica', 'normal')
      doc.text(`• ${max_duration_days} jours`, 20, yPosition)
      yPosition += 15
      
      if (why_this_limit) {
        doc.setFont('helvetica', 'bold')
        doc.text('POURQUOI CETTE LIMITE ?', 20, yPosition)
        yPosition += 8
        
        doc.setFont('helvetica', 'normal')
        const splitText = doc.splitTextToSize(why_this_limit, 170)
        doc.text(splitText, 20, yPosition)
        yPosition += splitText.length * 6 + 10
      }
      
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text('AVERTISSEMENT GÉNÉRAL', 20, yPosition)
      yPosition += 6
      
      doc.setFont('helvetica', 'normal')
      doc.text('Ce calculateur est un outil d\'aide à la décision, pas une prescription médicale.', 20, yPosition)
      yPosition += 4
      doc.text('Toute administration orale doit être validée par un médecin/pharmacien.', 20, yPosition)
      yPosition += 4
      doc.text('Consultez un spécialiste pour les nourrissons, femmes enceintes ou patients avec comorbidités.', 20, yPosition)
      
      doc.save(`rapport_dose_he_${new Date().toISOString().split('T')[0]}.pdf`)
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      const reportContent = `
RAPPORT DE CALCUL DE DOSE D'HUILE ESSENTIELLE
============================================

DOSE RECOMMANDÉE
----------------
• Dose finale : ${dose_recommendation.final_dose_mg.toFixed(3)} mg
• Concentration : ${dose_recommendation.concentration_percentage.toFixed(4)}%
• Plage de sécurité : ${dose_recommendation.min_dose_mg.toFixed(3)} - ${dose_recommendation.max_dose_mg.toFixed(3)} mg
• Marge de sécurité : ${dose_recommendation.safety_margin.margin_percentage}%
• Facteur limitant : ${dose_recommendation.limiting_factor}
${dose_recommendation.limiting_constituent ? `• Constituant limitant : ${dose_recommendation.limiting_constituent}` : ''}

FACTEURS D'INCERTITUDE APPLIQUÉS
--------------------------------
${Object.entries(uncertainty_factors_applied).map(([key, value]) => `• ${key} : ${value}`).join('\n')}

DÉTAILS DE CALCUL
-----------------
${Object.entries(calculation_details).map(([key, value]) => `• ${key} : ${value}`).join('\n')}

CONTRE-INDICATIONS
------------------
${contraindications.length > 0 ? contraindications.map(ci => `• ${ci.type.toUpperCase()} : ${ci.reason} - ${ci.recommendation}`).join('\n') : '• Aucune contre-indication identifiée'}

AVERTISSEMENTS
--------------
${warnings.length > 0 ? warnings.map(w => `• ${w}`).join('\n') : '• Aucun avertissement spécifique'}

DURÉE MAXIMALE RECOMMANDÉE
--------------------------
• ${max_duration_days} jours

AVERTISSEMENT GÉNÉRAL
--------------------
Ce calculateur est un outil d'aide à la décision, pas une prescription médicale.
Toute administration orale doit être validée par un médecin/pharmacien.
Consultez un spécialiste pour les nourrissons, femmes enceintes ou patients avec comorbidités.

Date du calcul : ${new Date().toLocaleString('fr-FR')}
      `.trim()

      const blob = new Blob([reportContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport_dose_he_${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const getSafetyLevel = () => {
    if (contraindications.some(ci => ci.type === 'absolute')) {
      return { level: 'danger', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
    }
    if (contraindications.length > 0 || warnings.length > 0) {
      return { level: 'warning', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' }
    }
    return { level: 'safe', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
  }

  const safety = getSafetyLevel()
  const SafetyIcon = safety.icon

  return (
    <div className="space-y-6">
      {/* Safety Status */}
      <Card className={`${safety.border} ${safety.bg}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${safety.color}`}>
            <SafetyIcon className="h-6 w-6" />
            {safety.level === 'safe' && 'Calcul Validé - Dose Sécurisée'}
            {safety.level === 'warning' && 'Attention - Précautions Requises'}
            {safety.level === 'danger' && 'Contre-indication - Usage Déconseillé'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {dose_recommendation.final_dose_mg.toFixed(3)} mg
              </div>
              <div className="text-sm text-gray-600">Dose finale recommandée</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {dose_recommendation.concentration_percentage.toFixed(4)}%
              </div>
              <div className="text-sm text-gray-600">Concentration dans le produit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {dose_recommendation.safety_margin.margin_percentage}%
              </div>
              <div className="text-sm text-gray-600">Marge de sécurité</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dose Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Détails de la Dose
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Plage de sécurité</Label>
              <div className="text-lg">
                {dose_recommendation.min_dose_mg.toFixed(3)} - {dose_recommendation.max_dose_mg.toFixed(3)} mg
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Facteur limitant</Label>
              <div className="text-lg">{dose_recommendation.limiting_factor}</div>
              {dose_recommendation.limiting_constituent && (
                <div className="text-sm text-gray-600">
                  Constituant : {dose_recommendation.limiting_constituent}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Facteurs d'incertitude appliqués</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(uncertainty_factors_applied).map(([factor, value]) => (
                <div key={factor} className="flex justify-between">
                  <span className="text-sm capitalize">{factor.replace('_', ' ')}</span>
                  <Badge variant="outline">×{value}</Badge>
                </div>
              ))}
            </div>
          </div>

          {dose_recommendation.monte_carlo_result && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Analyse Monte-Carlo</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Moyenne:</span>
                  <span className="ml-2 font-medium">{dose_recommendation.monte_carlo_result.mean.toFixed(3)} mg</span>
                </div>
                <div>
                  <span className="text-blue-700">Écart-type:</span>
                  <span className="ml-2 font-medium">{dose_recommendation.monte_carlo_result.std.toFixed(3)} mg</span>
                </div>
                <div className="col-span-2">
                  <span className="text-blue-700">Intervalle de confiance 95%:</span>
                  <span className="ml-2 font-medium">{dose_recommendation.monte_carlo_result.confidence_interval}</span>
                </div>
              </div>
            </div>
          )}

          {dose_recommendation.sed_ael_ratio && (
            <div className="bg-amber-50 p-4 rounded-lg">
              <h4 className="font-medium text-amber-900 mb-2">Ratio SED/AEL</h4>
              <div className="text-sm text-amber-800">
                <p>Constituant limitant: <strong>{dose_recommendation.limiting_constituent}</strong></p>
                <p>Ratio SED/AEL: <strong>{(dose_recommendation.sed_ael_ratio * 100).toFixed(1)}%</strong></p>
                <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-amber-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(dose_recommendation.sed_ael_ratio * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {dose_recommendation.dose_drops_per_kg && (
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold text-green-800">
                {dose_recommendation.dose_drops_per_kg.toFixed(2)} gouttes/kg
              </div>
              <div className="text-sm text-green-600">Équivalent en gouttes par kg de poids corporel</div>
            </div>
          )}

          {dose_recommendation.monte_carlo_result && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Analyse Monte-Carlo</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Moyenne:</span>
                  <span className="ml-2 font-medium">{dose_recommendation.monte_carlo_result.mean.toFixed(3)} mg</span>
                </div>
                <div>
                  <span className="text-blue-700">Écart-type:</span>
                  <span className="ml-2 font-medium">{dose_recommendation.monte_carlo_result.std.toFixed(3)} mg</span>
                </div>
                <div className="col-span-2">
                  <span className="text-blue-700">Intervalle de confiance 95%:</span>
                  <span className="ml-2 font-medium">{dose_recommendation.monte_carlo_result.confidence_interval}</span>
                </div>
              </div>
            </div>
          )}

          {dose_recommendation.sed_ael_ratio && (
            <div className="bg-amber-50 p-4 rounded-lg">
              <h4 className="font-medium text-amber-900 mb-2">Ratio SED/AEL</h4>
              <div className="text-sm text-amber-800">
                <p>Constituant limitant: <strong>{dose_recommendation.limiting_constituent}</strong></p>
                <p>Ratio SED/AEL: <strong>{(dose_recommendation.sed_ael_ratio * 100).toFixed(1)}%</strong></p>
                <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-amber-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(dose_recommendation.sed_ael_ratio * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {dose_recommendation.dose_drops_per_kg && (
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold text-green-800">
                {dose_recommendation.dose_drops_per_kg.toFixed(2)} gouttes/kg
              </div>
              <div className="text-sm text-green-600">Équivalent en gouttes par kg de poids corporel</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contraindications */}
      {contraindications.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              Contre-indications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contraindications.map((ci, index) => (
                <Alert key={index} className={ci.type === 'absolute' ? 'border-red-500 bg-red-50' : 'border-amber-500 bg-amber-50'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">
                      {ci.type === 'absolute' ? 'CONTRE-INDICATION ABSOLUE' : 'CONTRE-INDICATION RELATIVE'}
                    </div>
                    <div className="mt-1">
                      <strong>Raison :</strong> {ci.reason}
                    </div>
                    <div className="mt-1">
                      <strong>Recommandation :</strong> {ci.recommendation}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              Avertissements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {warnings.map((warning, index) => (
                <Alert key={index} className="border-amber-200 bg-amber-50">
                  <Info className="h-4 w-4" />
                  <AlertDescription>{warning}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Constituent Analysis */}
      {constituent_analysis && Object.keys(constituent_analysis).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Analyse des Constituants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Constituant</th>
                    <th className="text-right p-2">SED (mg/kg/j)</th>
                    <th className="text-right p-2">AEL (mg/kg/j)</th>
                    <th className="text-right p-2">Ratio (%)</th>
                    <th className="text-right p-2">Budget AEL (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(constituent_analysis).map(([name, data]) => (
                    <tr key={name} className="border-b">
                      <td className="p-2 font-medium">{name}</td>
                      <td className="text-right p-2">{data.sed?.toFixed(4) || 'N/A'}</td>
                      <td className="text-right p-2">{data.ael?.toFixed(4) || 'N/A'}</td>
                      <td className="text-right p-2">{data.ratio ? (data.ratio * 100).toFixed(1) : 'N/A'}</td>
                      <td className="text-right p-2">
                        <Badge variant={data.budget_consumed > 100 ? "destructive" : data.budget_consumed > 80 ? "secondary" : "outline"}>
                          {data.budget_consumed?.toFixed(1) || 'N/A'}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Why This Limit */}
      {why_this_limit && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Info className="h-5 w-5" />
              Pourquoi cette limite ?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">{why_this_limit}</p>
          </CardContent>
        </Card>
      )}

      {/* Duration and Safety */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Recommandations d'Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">Durée maximale</div>
                <div className="text-lg">{max_duration_days} jours</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Marge de sécurité</div>
                <div className="text-lg">{dose_recommendation.safety_margin.applied_factor * 100}% de la dose maximale</div>
              </div>
            </div>
          </div>

          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Rappel important :</strong> Ce calculateur est un outil d'aide à la décision. 
              Pour toute administration orale ou usage chez des populations sensibles, 
              consultez un professionnel de santé qualifié.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={generateReport} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Télécharger le Rapport
        </Button>
        <Button variant="outline" onClick={onReset} className="flex-1">
          <RotateCcw className="h-4 w-4 mr-2" />
          Nouveau Calcul
        </Button>
      </div>
    </div>
  )
}

const Label: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={className}>{children}</div>
)

export default CalculationResults
