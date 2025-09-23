const { useState } = React
const {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Label,
  Input,
  Checkbox,
  Select,
  Badge,
  Icon,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} = window.UI

const IndividualForm = ({ onComplete, initialData }) => {
  const [formData, setFormData] = useState(
    initialData || {
      body_weight: 70,
      age_category: 'adulte',
      sex: 'male',
      physiological_state: 'normal',
      pathologies: [],
      treatments: []
    }
  )
  const [errors, setErrors] = useState({})

  const ageCategories = [
    { value: '< 30 mois', label: '< 30 mois' },
    { value: 'enfant 2-6 ans', label: 'Enfant 2-6 ans' },
    { value: 'enfant 6-12 ans', label: 'Enfant 6-12 ans' },
    { value: 'adulte', label: 'Adulte' },
    { value: 'sujet âgé', label: 'Sujet âgé' }
  ]

  const pathologyOptions = [
    { value: 'hepatic', label: 'Pathologie hépatique' },
    { value: 'renal', label: 'Pathologie rénale' },
    { value: 'respiratory', label: 'Pathologie respiratoire' },
    { value: 'neurological', label: 'Pathologie neurologique' },
    { value: 'hematological', label: 'Pathologie hématologique' },
    { value: 'g6pd', label: 'Déficit en G6PD' },
    { value: 'asthma', label: 'Asthme' },
    { value: 'epilepsy', label: 'Épilepsie' }
  ]

  const treatmentOptions = [
    { value: 'anticoagulants', label: 'Anticoagulants' },
    { value: 'antiagrégants', label: 'Antiagrégants plaquettaires' },
    { value: 'antiepileptics', label: 'Antiépileptiques' },
    { value: 'immunosuppressors', label: 'Immunosuppresseurs' }
  ]

  const validateForm = () => {
    const newErrors = {}
    if (!formData.body_weight || formData.body_weight <= 0) {
      newErrors.body_weight = 'Le poids corporel doit être supérieur à 0'
    }
    if (formData.body_weight > 200) {
      newErrors.body_weight = 'Veuillez vérifier le poids corporel'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (validateForm()) {
      onComplete({ individual: formData })
    }
  }

  const handlePathologyChange = (pathology, checked) => {
    setFormData((prev) => ({
      ...prev,
      pathologies: checked ? [...prev.pathologies, pathology] : prev.pathologies.filter((p) => p !== pathology)
    }))
  }

  const handleTreatmentChange = (treatment, checked) => {
    setFormData((prev) => ({
      ...prev,
      treatments: checked ? [...prev.treatments, treatment] : prev.treatments.filter((t) => t !== treatment)
    }))
  }

  return (
    <Card className="fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon symbol="🧑" className="text-xl" />
          Paramètres Individuels
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="body_weight" className="flex items-center gap-2">
                <Icon symbol="⚖️" />
                Poids corporel (kg)
              </Label>
              <Input
                id="body_weight"
                type="number"
                step="0.1"
                min="1"
                max="200"
                value={formData.body_weight}
                onChange={(event) => setFormData((prev) => ({ ...prev, body_weight: parseFloat(event.target.value) || 0 }))}
                className={errors.body_weight ? 'border-red-500' : ''}
              />
              {errors.body_weight && <p className="text-sm text-red-600">{errors.body_weight}</p>}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Icon symbol="📅" />
                Catégorie d'âge
              </Label>
              <Select
                value={formData.age_category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, age_category: value }))}
                options={ageCategories}
              />
            </div>

            <div className="space-y-2">
              <Label>Sexe</Label>
              <Select
                value={formData.sex}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, sex: value }))}
                options={[
                  { value: 'male', label: 'Masculin' },
                  { value: 'female', label: 'Féminin' }
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Icon symbol="🫀" />
                État physiologique
              </Label>
              <Select
                value={formData.physiological_state}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, physiological_state: value }))}
                options={[
                  { value: 'normal', label: 'Normal' },
                  { value: 'grossesse', label: 'Grossesse' },
                  { value: 'allaitement', label: 'Allaitement' }
                ]}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">Pathologies</Label>
            <div className="grid md:grid-cols-2 gap-3">
              {pathologyOptions.map((pathology) => (
                <div key={pathology.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={pathology.value}
                    checked={formData.pathologies.includes(pathology.value)}
                    onCheckedChange={(checked) => handlePathologyChange(pathology.value, checked)}
                  />
                  <Label htmlFor={pathology.value} className="text-sm">
                    {pathology.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">Traitements en cours</Label>
            <div className="grid md:grid-cols-2 gap-3">
              {treatmentOptions.map((treatment) => (
                <div key={treatment.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={treatment.value}
                    checked={formData.treatments.includes(treatment.value)}
                    onCheckedChange={(checked) => handleTreatmentChange(treatment.value, checked)}
                  />
                  <Label htmlFor={treatment.value} className="text-sm">
                    {treatment.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">Étape suivante</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

const EssentialOilForm = ({ onComplete, initialData }) => {
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      constituents: [
        { name: '', fraction: 0, noael: undefined, ifra_limit: undefined, cir_limit: undefined, phototoxic: false }
      ],
      dominant_family: 'monoterpènes'
    }
  )
  const [errors, setErrors] = useState({})

  const biochemicalFamilies = [
    { value: 'monoterpènes', label: 'Monoterpènes' },
    { value: 'phénols', label: 'Phénols' },
    { value: 'aldéhydes', label: 'Aldéhydes' },
    { value: 'cétones', label: 'Cétones' },
    { value: 'oxydes', label: 'Oxydes' },
    { value: 'lactones', label: 'Lactones' },
    { value: 'furocoumarines', label: 'Furocoumarines' }
  ]

  const commonConstituents = [
    { name: 'cinnamaldéhyde', noael: 220, ifra_limit: 0.05 },
    { name: 'eugénol', noael: 450, ifra_limit: 0.5 },
    { name: '1,8-cinéole', noael: 500 },
    { name: 'menthol', noael: 200, cir_limit: 5.4 },
    { name: 'citral', noael: 100, ifra_limit: 0.6 },
    { name: 'linalool', noael: 500, ifra_limit: 2.0 },
    { name: 'limonène', noael: 600 }
  ]

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = "Le nom de l'huile essentielle est requis"
    }
    const totalFraction = formData.constituents.reduce((sum, c) => sum + (c.fraction || 0), 0)
    if (totalFraction > 1) {
      newErrors.constituents = 'La somme des fractions ne peut pas dépasser 100%'
    }
    const validConstituents = formData.constituents.filter((c) => c.name.trim() && c.fraction > 0)
    if (validConstituents.length === 0) {
      newErrors.constituents = 'Au moins un constituant avec une fraction > 0 est requis'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (validateForm()) {
      const cleanedData = {
        ...formData,
        constituents: formData.constituents.filter((c) => c.name.trim() && c.fraction > 0)
      }
      onComplete({ essential_oil: cleanedData })
    }
  }

  const addConstituent = () => {
    setFormData((prev) => ({
      ...prev,
      constituents: [
        ...prev.constituents,
        { name: '', fraction: 0, noael: undefined, ifra_limit: undefined, cir_limit: undefined, phototoxic: false }
      ]
    }))
  }

  const removeConstituent = (index) => {
    setFormData((prev) => ({
      ...prev,
      constituents: prev.constituents.filter((_, i) => i !== index)
    }))
  }

  const updateConstituent = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      constituents: prev.constituents.map((constituent, i) => (i === index ? { ...constituent, [field]: value } : constituent))
    }))
  }

  const loadCommonConstituent = (index, constituentName) => {
    if (constituentName === 'custom') return
    const common = commonConstituents.find((c) => c.name === constituentName)
    if (common) {
      updateConstituent(index, 'name', common.name)
      updateConstituent(index, 'noael', common.noael)
      if (common.ifra_limit) updateConstituent(index, 'ifra_limit', common.ifra_limit)
      if (common.cir_limit) updateConstituent(index, 'cir_limit', common.cir_limit)
    }
  }

  const totalFraction = formData.constituents.reduce((sum, c) => sum + (c.fraction || 0), 0)

  return (
    <Card className="fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon symbol="🌿" className="text-xl" />
          Huile Essentielle
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="oil_name">Nom de l'huile essentielle</Label>
              <Input
                id="oil_name"
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="ex: Cannelle écorce"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label>Famille biochimique dominante</Label>
              <Select
                value={formData.dominant_family}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, dominant_family: value }))}
                options={biochemicalFamilies}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Constituants chimiques</Label>
              <div className="text-sm text-gray-600">
                Total: {(totalFraction * 100).toFixed(1)}%
                {totalFraction > 1 && (
                  <span className="text-red-600 ml-2">
                    <Icon symbol="⚠️" className="mr-1" />Dépasse 100%
                  </span>
                )}
              </div>
            </div>

            {formData.constituents.map((constituent, index) => (
              <Card key={index} className="p-4 border border-slate-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Constituant {index + 1}</h4>
                    {formData.constituents.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeConstituent(index)}>
                        <Icon symbol="🗑️" className="mr-1" />Supprimer
                      </Button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nom</Label>
                      <Input
                        value={constituent.name}
                        onChange={(event) => updateConstituent(index, 'name', event.target.value)}
                        placeholder="ex: Cinnamaldéhyde"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fraction (0 - 1)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={constituent.fraction}
                        onChange={(event) => updateConstituent(index, 'fraction', parseFloat(event.target.value) || 0)}
                        placeholder="ex: 0.35"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>NOAEL (mg/kg/j)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={constituent.noael ?? ''}
                        onChange={(event) =>
                          updateConstituent(index, 'noael', event.target.value ? parseFloat(event.target.value) : undefined)
                        }
                        placeholder="ex: 220"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Limite IFRA (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={constituent.ifra_limit ?? ''}
                        onChange={(event) =>
                          updateConstituent(index, 'ifra_limit', event.target.value ? parseFloat(event.target.value) : undefined)
                        }
                        placeholder="ex: 0.05"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Limite CIR (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={constituent.cir_limit ?? ''}
                        onChange={(event) =>
                          updateConstituent(index, 'cir_limit', event.target.value ? parseFloat(event.target.value) : undefined)
                        }
                        placeholder="ex: 5.4"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`phototoxic-${index}`}
                      checked={constituent.phototoxic}
                      onCheckedChange={(checked) => updateConstituent(index, 'phototoxic', checked)}
                    />
                    <Label htmlFor={`phototoxic-${index}`} className="text-sm">
                      Phototoxique
                    </Label>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <Select
                      placeholder="Choisir un constituant type"
                      onValueChange={(value) => loadCommonConstituent(index, value)}
                      options={[
                        { value: 'custom', label: 'Saisie manuelle' },
                        ...commonConstituents.map((c) => ({
                          value: c.name,
                          label: `${c.name} (NOAEL ${c.noael || 'N/A'})`
                        }))
                      ]}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addConstituent}>
                      <Icon symbol="➕" className="mr-1" />Ajouter un constituant
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {errors.constituents && <p className="text-sm text-red-600">{errors.constituents}</p>}

          <div className="flex justify-end">
            <Button type="submit">Étape suivante</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

const MultiOilForm = ({ onComplete, initialData }) => {
  const [formData, setFormData] = useState(
    initialData || {
      essential_oils: [],
      total_percentage: 0,
      merged_constituents: []
    }
  )
  const [errors, setErrors] = useState({})
  const [newOil, setNewOil] = useState({
    name: '',
    percentage: 0,
    constituents: [{ name: '', fraction: 0 }]
  })

  const addConstituent = () => {
    setNewOil((prev) => ({
      ...prev,
      constituents: [...prev.constituents, { name: '', fraction: 0 }]
    }))
  }

  const removeConstituent = (index) => {
    setNewOil((prev) => ({
      ...prev,
      constituents: prev.constituents.filter((_, i) => i !== index)
    }))
  }

  const updateConstituent = (index, field, value) => {
    setNewOil((prev) => ({
      ...prev,
      constituents: prev.constituents.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    }))
  }

  const addOilToFormula = () => {
    if (!newOil.name || newOil.percentage <= 0) {
      setErrors({ newOil: 'Nom et pourcentage requis' })
      return
    }
    const totalFraction = newOil.constituents.reduce((sum, c) => sum + (c.fraction || 0), 0)
    if (Math.abs(totalFraction - 1.0) > 0.01) {
      setErrors({ newOil: 'Les fractions des constituants doivent totaliser 100%' })
      return
    }
    const oil = {
      name: newOil.name,
      constituents: newOil.constituents.map((c) => ({
        name: c.name,
        fraction: c.fraction,
        phototoxic: false,
        cmr_status: false
      })),
      dominant_family: 'monoterpènes hydrocarbures',
      density: 0.9,
      drop_weight_mg: 30.0
    }
    const newFormula = {
      ...formData,
      essential_oils: [...formData.essential_oils, { oil, percentage: newOil.percentage }],
      total_percentage: formData.total_percentage + newOil.percentage
    }
    setFormData(newFormula)
    setNewOil({ name: '', percentage: 0, constituents: [{ name: '', fraction: 0 }] })
    setErrors({})
  }

  const removeOilFromFormula = (index) => {
    const removedOil = formData.essential_oils[index]
    setFormData((prev) => ({
      ...prev,
      essential_oils: prev.essential_oils.filter((_, i) => i !== index),
      total_percentage: prev.total_percentage - removedOil.percentage
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (formData.essential_oils.length === 0) {
      newErrors.formula = 'Au moins une huile essentielle est requise'
    }
    if (Math.abs(formData.total_percentage - 100) > 0.1) {
      newErrors.percentage = `Total: ${formData.total_percentage.toFixed(1)}% (doit être 100%)`
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (validateForm()) {
      onComplete({ formula: formData })
    }
  }

  const handleGCMSUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result
        const lines = text.split('\n').filter((line) => line.trim())
        const constituents = []
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map((p) => p.trim())
          if (parts.length >= 2) {
            const name = parts[0]
            const percentage = parseFloat(parts[1])
            if (name && !isNaN(percentage)) {
              constituents.push({ name, fraction: percentage / 100 })
            }
          }
        }
        if (constituents.length > 0) {
          setNewOil((prev) => ({ ...prev, constituents }))
        }
      } catch (error) {
        setErrors({ gcms: 'Erreur lors de la lecture du fichier GC-MS' })
      }
    }
    reader.readAsText(file)
  }

  return (
    <Card className="fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon symbol="⚗️" className="text-xl" />
          Formule Multi-Huiles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-lg">Ajouter une Huile Essentielle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Nom de l'huile essentielle</Label>
                  <Input
                    value={newOil.name}
                    onChange={(event) => setNewOil((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Ex: Lavande vraie"
                  />
                </div>
                <div>
                  <Label>Pourcentage dans la formule (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    value={newOil.percentage}
                    onChange={(event) => setNewOil((prev) => ({ ...prev, percentage: parseFloat(event.target.value) || 0 }))}
                    placeholder="Ex: 40"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Constituants principaux</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={addConstituent}>
                      <Icon symbol="➕" className="mr-1" />Ajouter
                    </Button>
                    <label className="cursor-pointer text-sm text-blue-600 hover:underline">
                      <input type="file" accept=".csv" className="hidden" onChange={handleGCMSUpload} />
                      Importer GC-MS
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  {newOil.constituents.map((constituent, index) => (
                    <div key={index} className="grid md:grid-cols-3 gap-3">
                      <Input
                        value={constituent.name}
                        onChange={(event) => updateConstituent(index, 'name', event.target.value)}
                        placeholder="Nom du constituant"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={constituent.fraction}
                        onChange={(event) => updateConstituent(index, 'fraction', parseFloat(event.target.value) || 0)}
                        placeholder="Fraction (0-1)"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => removeConstituent(index)}>
                        <Icon symbol="🗑️" className="mr-1" />Retirer
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {errors.newOil && <p className="text-sm text-red-600">{errors.newOil}</p>}
              {errors.gcms && <p className="text-sm text-red-600">{errors.gcms}</p>}

              <Button type="button" onClick={addOilToFormula} className="w-full">
                Ajouter à la formule
              </Button>
            </CardContent>
          </Card>

          {formData.essential_oils.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Formule actuelle</h3>
                <Badge variant={Math.abs(formData.total_percentage - 100) < 0.1 ? 'success' : 'warning'}>
                  Total: {formData.total_percentage.toFixed(1)}%
                </Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Huile</TableHead>
                    <TableHead>Pourcentage</TableHead>
                    <TableHead>Constituants</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.essential_oils.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{entry.oil.name}</TableCell>
                      <TableCell>{entry.percentage}%</TableCell>
                      <TableCell className="space-y-1">
                        {entry.oil.constituents.map((c, i) => (
                          <Badge key={i} variant="outline" className="mr-1">
                            {c.name}: {(c.fraction * 100).toFixed(1)}%
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button type="button" variant="ghost" onClick={() => removeOilFromFormula(index)}>
                          Retirer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {errors.percentage && <p className="text-sm text-red-600">{errors.percentage}</p>}

          <div className="flex justify-end">
            <Button type="submit">Étape suivante</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

const ApplicationForm = ({ onComplete, initialData, isCalculating }) => {
  const [formData, setFormData] = useState(
    initialData || {
      route: 'topique',
      daily_amount: 2000,
      duration_days: 7,
      application_area: 100
    }
  )
  const [errors, setErrors] = useState({})

  const routes = [
    { value: 'topique', label: 'Topique (cutané)' },
    { value: 'orale', label: 'Orale' },
    { value: 'inhalation', label: 'Inhalation' }
  ]

  const validateForm = () => {
    const newErrors = {}
    if (!formData.daily_amount || formData.daily_amount <= 0) {
      newErrors.daily_amount = 'La quantité quotidienne doit être supérieure à 0'
    }
    if (formData.daily_amount > 50000) {
      newErrors.daily_amount = 'Quantité quotidienne trop élevée (max 50g)'
    }
    if (!formData.duration_days || formData.duration_days <= 0) {
      newErrors.duration_days = 'La durée doit être supérieure à 0'
    }
    if (formData.duration_days > 365) {
      newErrors.duration_days = 'Durée maximale : 365 jours'
    }
    if (formData.route === 'topique' && (!formData.application_area || formData.application_area <= 0)) {
      newErrors.application_area = "La surface d'application est requise pour la voie topique"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (validateForm()) {
      onComplete({ application: formData })
    }
  }

  const getAmountUnit = () => {
    if (formData.route === 'topique') return 'mg (produit fini)'
    if (formData.route === 'orale') return "mg (huile essentielle pure)"
    if (formData.route === 'inhalation') return 'gouttes'
    return 'mg'
  }

  const getAmountPlaceholder = () => {
    if (formData.route === 'topique') return '2000 (ex: 2g de crème/huile)'
    if (formData.route === 'orale') return "50 (ex: 50mg d'HE pure)"
    if (formData.route === 'inhalation') return '3 (ex: 3 gouttes dans diffuseur)'
    return '2000'
  }

  const getRecommendedDuration = () => {
    if (formData.route === 'topique') return 'Recommandé : 7-14 jours'
    if (formData.route === 'orale') return 'Recommandé : 3-7 jours (avis médical requis)'
    if (formData.route === 'inhalation') return 'Recommandé : sessions de 30-60 min'
    return ''
  }

  return (
    <Card className="fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon symbol="🛣️" className="text-xl" />
          Paramètres d'Application
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Icon symbol="🛤️" />
                Voie d'administration
              </Label>
              <Select
                value={formData.route}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, route: value }))}
                options={routes}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Icon symbol="💧" />
                Quantité quotidienne ({getAmountUnit()})
              </Label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.daily_amount}
                onChange={(event) => setFormData((prev) => ({ ...prev, daily_amount: parseFloat(event.target.value) || 0 }))}
                placeholder={getAmountPlaceholder()}
                className={errors.daily_amount ? 'border-red-500' : ''}
              />
              {errors.daily_amount && <p className="text-sm text-red-600">{errors.daily_amount}</p>}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Icon symbol="⏱️" />
                Durée du traitement (jours)
              </Label>
              <Input
                type="number"
                min="1"
                max="365"
                value={formData.duration_days}
                onChange={(event) => setFormData((prev) => ({ ...prev, duration_days: parseInt(event.target.value) || 0 }))}
                className={errors.duration_days ? 'border-red-500' : ''}
              />
              <p className="text-xs text-gray-500">{getRecommendedDuration()}</p>
              {errors.duration_days && <p className="text-sm text-red-600">{errors.duration_days}</p>}
            </div>

            {formData.route === 'topique' && (
              <div className="space-y-2">
                <Label>Surface d'application (cm²)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.application_area || ''}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, application_area: parseFloat(event.target.value) || undefined }))
                  }
                  placeholder="100 (ex: paume de main)"
                  className={errors.application_area ? 'border-red-500' : ''}
                />
                <p className="text-xs text-gray-500">
                  Référence : paume = ~100 cm², avant-bras = ~300 cm²
                </p>
                {errors.application_area && <p className="text-sm text-red-600">{errors.application_area}</p>}
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Informations importantes</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>Respecter les recommandations de durée pour limiter les risques de sensibilisation.</li>
              <li>Adapter la surface d'application selon l'âge et la zone du corps.</li>
              <li>Vérifier les contre-indications avant une voie orale.</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isCalculating}>
              {isCalculating ? 'Calcul en cours…' : 'Lancer le calcul'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

window.Forms = {
  IndividualForm,
  EssentialOilForm,
  MultiOilForm,
  ApplicationForm
}
