import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2, Leaf, AlertTriangle } from 'lucide-react'
import { EssentialOil, Constituent } from '../types/calculator'

interface EssentialOilFormProps {
  onComplete: (data: { essential_oil: EssentialOil }) => void
  initialData?: EssentialOil
}

const EssentialOilForm: React.FC<EssentialOilFormProps> = ({ onComplete, initialData }) => {
  const [formData, setFormData] = useState<EssentialOil>(initialData || {
    name: '',
    constituents: [
      {
        name: '',
        fraction: 0,
        noael: undefined,
        ifra_limit: undefined,
        cir_limit: undefined,
        phototoxic: false
      }
    ],
    dominant_family: 'monoterpènes'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de l\'huile essentielle est requis'
    }

    const totalFraction = formData.constituents.reduce((sum, c) => sum + (c.fraction || 0), 0)
    if (totalFraction > 1) {
      newErrors.constituents = 'La somme des fractions ne peut pas dépasser 100%'
    }

    const validConstituents = formData.constituents.filter(c => c.name.trim() && c.fraction > 0)
    if (validConstituents.length === 0) {
      newErrors.constituents = 'Au moins un constituant avec une fraction > 0 est requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      const cleanedData = {
        ...formData,
        constituents: formData.constituents.filter(c => c.name.trim() && c.fraction > 0)
      }
      onComplete({ essential_oil: cleanedData })
    }
  }

  const addConstituent = () => {
    setFormData(prev => ({
      ...prev,
      constituents: [...prev.constituents, {
        name: '',
        fraction: 0,
        noael: undefined,
        ifra_limit: undefined,
        cir_limit: undefined,
        phototoxic: false
      }]
    }))
  }

  const removeConstituent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      constituents: prev.constituents.filter((_, i) => i !== index)
    }))
  }

  const updateConstituent = (index: number, field: keyof Constituent, value: any) => {
    setFormData(prev => ({
      ...prev,
      constituents: prev.constituents.map((constituent, i) => 
        i === index ? { ...constituent, [field]: value } : constituent
      )
    }))
  }

  const loadCommonConstituent = (index: number, constituentName: string) => {
    const common = commonConstituents.find(c => c.name === constituentName)
    if (common) {
      updateConstituent(index, 'name', common.name)
      updateConstituent(index, 'noael', common.noael)
      if (common.ifra_limit) updateConstituent(index, 'ifra_limit', common.ifra_limit)
      if (common.cir_limit) updateConstituent(index, 'cir_limit', common.cir_limit)
    }
  }

  const totalFraction = formData.constituents.reduce((sum, c) => sum + (c.fraction || 0), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5" />
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
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="ex: Cannelle écorce"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Famille biochimique dominante</Label>
              <Select 
                value={formData.dominant_family} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, dominant_family: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {biochemicalFamilies.map(family => (
                    <SelectItem key={family.value} value={family.value}>
                      {family.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Constituants chimiques</Label>
              <div className="text-sm text-gray-600">
                Total: {(totalFraction * 100).toFixed(1)}%
                {totalFraction > 1 && (
                  <span className="text-red-600 ml-2">
                    <AlertTriangle className="h-4 w-4 inline" />
                    Dépasse 100%
                  </span>
                )}
              </div>
            </div>

            {formData.constituents.map((constituent, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Constituant {index + 1}</h4>
                    {formData.constituents.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeConstituent(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nom du constituant</Label>
                      <Select
                        value={constituent.name}
                        onValueChange={(value) => {
                          if (value === 'custom') {
                            updateConstituent(index, 'name', '')
                          } else {
                            loadCommonConstituent(index, value)
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir ou saisir" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Saisie manuelle</SelectItem>
                          {commonConstituents.map(c => (
                            <SelectItem key={c.name} value={c.name}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!commonConstituents.find(c => c.name === constituent.name) && (
                        <Input
                          value={constituent.name}
                          onChange={(e) => updateConstituent(index, 'name', e.target.value)}
                          placeholder="Nom du constituant"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Fraction (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={constituent.fraction * 100}
                        onChange={(e) => updateConstituent(index, 'fraction', parseFloat(e.target.value) / 100 || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>NOAEL (mg/kg/j)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={constituent.noael || ''}
                        onChange={(e) => updateConstituent(index, 'noael', parseFloat(e.target.value) || undefined)}
                        placeholder="Optionnel"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Limite IFRA (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={constituent.ifra_limit || ''}
                        onChange={(e) => updateConstituent(index, 'ifra_limit', parseFloat(e.target.value) || undefined)}
                        placeholder="Optionnel"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`phototoxic_${index}`}
                      checked={constituent.phototoxic}
                      onCheckedChange={(checked) => updateConstituent(index, 'phototoxic', checked as boolean)}
                    />
                    <Label htmlFor={`phototoxic_${index}`} className="text-sm">
                      Constituant phototoxique
                    </Label>
                  </div>
                </div>
              </Card>
            ))}

            {errors.constituents && (
              <p className="text-sm text-red-600">{errors.constituents}</p>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={addConstituent}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un constituant
            </Button>
          </div>

          <Button type="submit" className="w-full">
            Continuer vers l'Application
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default EssentialOilForm
