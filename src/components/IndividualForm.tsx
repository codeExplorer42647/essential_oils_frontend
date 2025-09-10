import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { User, Weight, Calendar, Heart } from 'lucide-react'
import { Individual } from '../types/calculator'

interface IndividualFormProps {
  onComplete: (data: { individual: Individual }) => void
  initialData?: Individual
}

const IndividualForm: React.FC<IndividualFormProps> = ({ onComplete, initialData }) => {
  const [formData, setFormData] = useState<Individual>(initialData || {
    body_weight: 70,
    age_category: 'adulte',
    sex: 'male',
    physiological_state: 'normal',
    pathologies: [],
    treatments: []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.body_weight || formData.body_weight <= 0) {
      newErrors.body_weight = 'Le poids corporel doit être supérieur à 0'
    }

    if (formData.body_weight > 200) {
      newErrors.body_weight = 'Veuillez vérifier le poids corporel'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onComplete({ individual: formData })
    }
  }

  const handlePathologyChange = (pathology: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      pathologies: checked 
        ? [...prev.pathologies, pathology]
        : prev.pathologies.filter(p => p !== pathology)
    }))
  }

  const handleTreatmentChange = (treatment: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      treatments: checked 
        ? [...prev.treatments, treatment]
        : prev.treatments.filter(t => t !== treatment)
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Paramètres Individuels
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="body_weight" className="flex items-center gap-2">
                <Weight className="h-4 w-4" />
                Poids corporel (kg)
              </Label>
              <Input
                id="body_weight"
                type="number"
                step="0.1"
                min="1"
                max="200"
                value={formData.body_weight}
                onChange={(e) => setFormData(prev => ({ ...prev, body_weight: parseFloat(e.target.value) || 0 }))}
                className={errors.body_weight ? 'border-red-500' : ''}
              />
              {errors.body_weight && (
                <p className="text-sm text-red-600">{errors.body_weight}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Catégorie d'âge
              </Label>
              <Select 
                value={formData.age_category} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, age_category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ageCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sexe</Label>
              <Select 
                value={formData.sex} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, sex: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculin</SelectItem>
                  <SelectItem value="female">Féminin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                État physiologique
              </Label>
              <Select 
                value={formData.physiological_state} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, physiological_state: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="grossesse">Grossesse</SelectItem>
                  <SelectItem value="allaitement">Allaitement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">Pathologies</Label>
            <div className="grid md:grid-cols-2 gap-3">
              {pathologyOptions.map(pathology => (
                <div key={pathology.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={pathology.value}
                    checked={formData.pathologies.includes(pathology.value)}
                    onCheckedChange={(checked) => handlePathologyChange(pathology.value, checked as boolean)}
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
              {treatmentOptions.map(treatment => (
                <div key={treatment.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={treatment.value}
                    checked={formData.treatments.includes(treatment.value)}
                    onCheckedChange={(checked) => handleTreatmentChange(treatment.value, checked as boolean)}
                  />
                  <Label htmlFor={treatment.value} className="text-sm">
                    {treatment.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full">
            Continuer vers l'Huile Essentielle
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default IndividualForm
