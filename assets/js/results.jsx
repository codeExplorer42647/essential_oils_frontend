(function() {
const {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Alert,
  AlertDescription,
  Badge,
  Button,
  Label,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Icon
} = window.UI

const formatNumber = (value, digits = 3) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/A'
  }
  return Number(value).toFixed(digits)
}

const CalculationResults = ({ results, onReset }) => {
  const {
    dose_recommendation,
    contraindications = [],
    warnings = [],
    max_duration_days,
    uncertainty_factors_applied = {},
    calculation_details = {},
    constituent_analysis = {},
    why_this_limit
  } = results

  const generateReport = async () => {
    if (!window.jspdf || !window.jspdf.jsPDF) return
    const { jsPDF } = window.jspdf
    const doc = new jsPDF()
    let yPosition = 20

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text("RAPPORT DE CALCUL DE DOSE D'HUILE ESSENTIELLE", 20, yPosition)
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
    doc.text(`• Dose finale: ${formatNumber(dose_recommendation.final_dose_mg)} mg`, 20, yPosition)
    yPosition += 6
    doc.text(`• Concentration: ${formatNumber(dose_recommendation.concentration_percentage, 4)}%`, 20, yPosition)
    yPosition += 6
    doc.text(
      `• Plage de sécurité: ${formatNumber(dose_recommendation.min_dose_mg)} - ${formatNumber(dose_recommendation.max_dose_mg)} mg`,
      20,
      yPosition
    )
    yPosition += 6
    doc.text(
      `• Marge de sécurité: ${dose_recommendation.safety_margin.margin_percentage}%`,
      20,
      yPosition
    )
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
      doc.text(`• Moyenne: ${formatNumber(dose_recommendation.monte_carlo_result.mean)} mg`, 20, yPosition)
      yPosition += 6
      doc.text(`• Écart-type: ${formatNumber(dose_recommendation.monte_carlo_result.std)} mg`, 20, yPosition)
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
        data.sed ? formatNumber(data.sed, 4) : 'N/A',
        data.ael ? formatNumber(data.ael, 4) : 'N/A',
        data.ratio ? `${(data.ratio * 100).toFixed(1)}%` : 'N/A',
        data.budget_consumed ? `${data.budget_consumed.toFixed(1)}%` : 'N/A'
      ])

      doc.autoTable({
        startY: yPosition,
        head: [['Constituant', 'SED (mg/kg/j)', 'AEL (mg/kg/j)', 'Ratio (%)', 'Budget AEL (%)']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] }
      })

      yPosition = doc.lastAutoTable.finalY + 15
    }

    if (uncertainty_factors_applied && Object.keys(uncertainty_factors_applied).length > 0) {
      doc.setFont('helvetica', 'bold')
      doc.text("FACTEURS D'INCERTITUDE APPLIQUÉS", 20, yPosition)
      yPosition += 8

      doc.setFont('helvetica', 'normal')
      Object.entries(uncertainty_factors_applied).forEach(([factor, value]) => {
        doc.text(`• ${factor}: ${value}`, 20, yPosition)
        yPosition += 6
      })
      yPosition += 10
    }

    if (calculation_details && Object.keys(calculation_details).length > 0) {
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

    doc.setFont('helvetica', 'bold')
    doc.text('CONTRE-INDICATIONS', 20, yPosition)
    yPosition += 8

    doc.setFont('helvetica', 'normal')
    if (contraindications.length > 0) {
      contraindications.forEach((ci) => {
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
      warnings.forEach((warning) => {
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
    doc.text("Ce calculateur est un outil d'aide à la décision, pas une prescription médicale.", 20, yPosition)
    yPosition += 4
    doc.text('Consultez un professionnel de santé pour toute utilisation thérapeutique.', 20, yPosition)

    doc.save('rapport-calcul-huile-essentielle.pdf')
  }

  return (
    <div className="space-y-6 fade-in">
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon symbol="✅" className="text-xl" />
            Résumé de la Dose Recommandée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-700">
                {formatNumber(dose_recommendation.final_dose_mg)} mg
              </div>
              <div className="text-sm text-gray-600">Dose finale quotidienne</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-700">
                {formatNumber(dose_recommendation.concentration_percentage, 4)}%
              </div>
              <div className="text-sm text-gray-600">Concentration dans le produit</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {dose_recommendation.safety_margin.margin_percentage}%
              </div>
              <div className="text-sm text-gray-600">Marge de sécurité</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-700">
                {dose_recommendation.limiting_factor}
              </div>
              <div className="text-sm text-gray-600">Facteur limitant</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon symbol="🧮" className="text-xl" />
            Détails de la Dose
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Plage de sécurité</Label>
              <div className="text-lg">
                {formatNumber(dose_recommendation.min_dose_mg)} - {formatNumber(dose_recommendation.max_dose_mg)} mg
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Facteur limitant</Label>
              <div className="text-lg">{dose_recommendation.limiting_factor}</div>
              {dose_recommendation.limiting_constituent && (
                <div className="text-sm text-gray-600">Constituant : {dose_recommendation.limiting_constituent}</div>
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
                  <span className="ml-2 font-medium">{formatNumber(dose_recommendation.monte_carlo_result.mean)} mg</span>
                </div>
                <div>
                  <span className="text-blue-700">Écart-type:</span>
                  <span className="ml-2 font-medium">{formatNumber(dose_recommendation.monte_carlo_result.std)} mg</span>
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

      {Object.keys(constituent_analysis).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon symbol="🧪" className="text-xl" />
              Analyse des constituants limitants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Constituant</TableHead>
                  <TableHead>SED (mg/kg/j)</TableHead>
                  <TableHead>AEL (mg/kg/j)</TableHead>
                  <TableHead>Ratio</TableHead>
                  <TableHead>Budget AEL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(constituent_analysis).map(([name, data]) => (
                  <TableRow key={name}>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell>{data.sed ? formatNumber(data.sed, 4) : 'N/A'}</TableCell>
                    <TableCell>{data.ael ? formatNumber(data.ael, 4) : 'N/A'}</TableCell>
                    <TableCell>
                      {data.ratio ? (
                        <Badge variant={data.ratio > 1 ? 'destructive' : data.ratio > 0.8 ? 'warning' : 'success'}>
                          {(data.ratio * 100).toFixed(1)}%
                        </Badge>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {data.budget_consumed ? (
                        <Badge
                          variant={
                            data.budget_consumed > 100
                              ? 'destructive'
                              : data.budget_consumed > 80
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {data.budget_consumed.toFixed(1)}%
                        </Badge>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {contraindications.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="space-y-2">
            <div className="flex items-center gap-2 text-red-700 font-semibold">
              <Icon symbol="⚠️" /> Contre-indications identifiées
            </div>
            <ul className="space-y-1 text-red-700">
              {contraindications.map((item, index) => (
                <li key={index}>
                  <strong>{item.type.toUpperCase()} :</strong> {item.reason}
                  <div className="text-sm">{item.recommendation}</div>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertDescription className="space-y-2">
            <div className="flex items-center gap-2 text-amber-700 font-semibold">
              <Icon symbol="ℹ️" /> Points de vigilance
            </div>
            <ul className="list-disc pl-4 space-y-1 text-amber-800">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-3">
        <Button variant="outline" onClick={generateReport} className="flex-1">
          <Icon symbol="⬇️" className="mr-2" /> Télécharger le rapport PDF
        </Button>
        <Button onClick={onReset} className="flex-1">
          <Icon symbol="🔄" className="mr-2" /> Recommencer un calcul
        </Button>
      </div>
    </div>
  )
}

window.CalculationResults = CalculationResults
})();
