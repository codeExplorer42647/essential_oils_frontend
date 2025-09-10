import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Upload, Beaker } from 'lucide-react'
import { Formula, EssentialOil } from '../types/calculator'

interface MultiOilFormProps {
  onComplete: (data: { formula: Formula }) => void
  initialData?: Formula
}

const MultiOilForm: React.FC<MultiOilFormProps> = ({ onComplete, initialData }) => {
  const [formData, setFormData] = useState<Formula>(initialData || {
    essential_oils: [],
    total_percentage: 0,
    merged_constituents: []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newOil, setNewOil] = useState({
    name: '',
    percentage: 0,
    constituents: [{ name: '', fraction: 0 }]
  })


  const addConstituent = () => {
    setNewOil(prev => ({
      ...prev,
      constituents: [...prev.constituents, { name: '', fraction: 0 }]
    }))
  }

  const removeConstituent = (index: number) => {
    setNewOil(prev => ({
      ...prev,
      constituents: prev.constituents.filter((_, i) => i !== index)
    }))
  }

  const updateConstituent = (index: number, field: string, value: any) => {
    setNewOil(prev => ({
      ...prev,
      constituents: prev.constituents.map((c, i) => 
        i === index ? { ...c, [field]: value } : c
      )
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

    const oil: EssentialOil = {
      name: newOil.name,
      constituents: newOil.constituents.map(c => ({
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

  const removeOilFromFormula = (index: number) => {
    const removedOil = formData.essential_oils[index]
    setFormData(prev => ({
      ...prev,
      essential_oils: prev.essential_oils.filter((_, i) => i !== index),
      total_percentage: prev.total_percentage - removedOil.percentage
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (formData.essential_oils.length === 0) {
      newErrors.formula = 'Au moins une huile essentielle est requise'
    }

    if (Math.abs(formData.total_percentage - 100) > 0.1) {
      newErrors.percentage = `Total: ${formData.total_percentage.toFixed(1)}% (doit être 100%)`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onComplete({ formula: formData })
    }
  }

  const handleGCMSUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        const constituents: { name: string; fraction: number }[] = []

        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map(p => p.trim())
          if (parts.length >= 2) {
            const name = parts[0]
            const percentage = parseFloat(parts[1])
            if (name && !isNaN(percentage)) {
              constituents.push({ name, fraction: percentage / 100 })
            }
          }
        }

        if (constituents.length > 0) {
          setNewOil(prev => ({ ...prev, constituents }))
        }
      } catch (error) {
        setErrors({ gcms: 'Erreur lors de la lecture du fichier GC-MS' })
      }
    }
    reader.readAsText(file)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Beaker className="h-5 w-5" />
          Formule Multi-Huiles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ajout d'une nouvelle huile */}
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
                    onChange={(e) => setNewOil(prev => ({ ...prev, name: e.target.value }))}
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
                    onChange={(e) => setNewOil(prev => ({ ...prev, percentage: parseFloat(e.target.value) || 0 }))}
                    placeholder="Ex: 40"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Constituants principaux</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={addConstituent}>
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".csv,.json"
                        onChange={handleGCMSUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-1" />
                        GC-MS
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {newOil.constituents.map((constituent, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder="Nom du constituant"
                        value={constituent.name}
                        onChange={(e) => updateConstituent(index, 'name', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        placeholder="0.40"
                        value={constituent.fraction}
                        onChange={(e) => updateConstituent(index, 'fraction', parseFloat(e.target.value) || 0)}
                        className="w-24"
                      />
                      <span className="text-sm text-gray-500 w-12">({(constituent.fraction * 100).toFixed(1)}%)</span>
                      {newOil.constituents.length > 1 && (
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
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Total constituants: {(newOil.constituents.reduce((sum, c) => sum + (c.fraction || 0), 0) * 100).toFixed(1)}%
                </p>
              </div>

              <Button type="button" onClick={addOilToFormula} className="w-full">
                Ajouter à la Formule
              </Button>
              {errors.newOil && <p className="text-sm text-red-600">{errors.newOil}</p>}
              {errors.gcms && <p className="text-sm text-red-600">{errors.gcms}</p>}
            </CardContent>
          </Card>

          {/* Formule actuelle */}
          {formData.essential_oils.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Formule Actuelle
                  <Badge variant={Math.abs(formData.total_percentage - 100) < 0.1 ? "default" : "destructive"}>
                    {formData.total_percentage.toFixed(1)}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Huile Essentielle</TableHead>
                      <TableHead>Pourcentage</TableHead>
                      <TableHead>Constituants Principaux</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.essential_oils.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.oil.name}</TableCell>
                        <TableCell>{item.percentage}%</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {item.oil.constituents.slice(0, 3).map((c, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {c.name} ({(c.fraction * 100).toFixed(1)}%)
                              </Badge>
                            ))}
                            {item.oil.constituents.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{item.oil.constituents.length - 3} autres
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOilFromFormula(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {errors.formula && <p className="text-sm text-red-600">{errors.formula}</p>}
          {errors.percentage && <p className="text-sm text-red-600">{errors.percentage}</p>}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={formData.essential_oils.length === 0 || Math.abs(formData.total_percentage - 100) > 0.1}
          >
            Continuer avec cette Formule
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default MultiOilForm
