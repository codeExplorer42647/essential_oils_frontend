import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Route, Clock, Droplets } from 'lucide-react'
import { Application } from '../types/calculator'

interface ApplicationFormProps {
  onComplete: (data: { application: Application }) => void
  initialData?: Application
  isCalculating: boolean
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ onComplete, initialData, isCalculating }) => {
  const [formData, setFormData] = useState<Application>(initialData || {
    route: 'topique',
    daily_amount: 2000,
    duration_days: 7,
    application_area: 100
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const routes = [
    { value: 'topique', label: 'Topique (cutané)' },
    { value: 'orale', label: 'Orale' },
    { value: 'inhalation', label: 'Inhalation' }
  ]

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

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
      newErrors.application_area = 'La surface d\'application est requise pour la voie topique'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onComplete({ application: formData })
    }
  }

  const getAmountUnit = () => {
    switch (formData.route) {
      case 'topique':
        return 'mg (produit fini)'
      case 'orale':
        return 'mg (huile essentielle pure)'
      case 'inhalation':
        return 'gouttes'
      default:
        return 'mg'
    }
  }

  const getAmountPlaceholder = () => {
    switch (formData.route) {
      case 'topique':
        return '2000 (ex: 2g de crème/huile)'
      case 'orale':
        return '50 (ex: 50mg d\'HE pure)'
      case 'inhalation':
        return '3 (ex: 3 gouttes dans diffuseur)'
      default:
        return '2000'
    }
  }

  const getRecommendedDuration = () => {
    switch (formData.route) {
      case 'topique':
        return 'Recommandé : 7-14 jours'
      case 'orale':
        return 'Recommandé : 3-7 jours (avis médical requis)'
      case 'inhalation':
        return 'Recommandé : sessions de 30-60 min'
      default:
        return ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          Paramètres d'Application
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Route className="h-4 w-4" />
                Voie d'administration
              </Label>
              <Select 
                value={formData.route} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, route: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {routes.map(route => (
                    <SelectItem key={route.value} value={route.value}>
                      {route.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Quantité quotidienne ({getAmountUnit()})
              </Label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.daily_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, daily_amount: parseFloat(e.target.value) || 0 }))}
                placeholder={getAmountPlaceholder()}
                className={errors.daily_amount ? 'border-red-500' : ''}
              />
              {errors.daily_amount && (
                <p className="text-sm text-red-600">{errors.daily_amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Durée du traitement (jours)
              </Label>
              <Input
                type="number"
                min="1"
                max="365"
                value={formData.duration_days}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_days: parseInt(e.target.value) || 0 }))}
                className={errors.duration_days ? 'border-red-500' : ''}
              />
              <p className="text-xs text-gray-500">{getRecommendedDuration()}</p>
              {errors.duration_days && (
                <p className="text-sm text-red-600">{errors.duration_days}</p>
              )}
            </div>

            {formData.route === 'topique' && (
              <div className="space-y-2">
                <Label>Surface d'application (cm²)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.application_area || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, application_area: parseFloat(e.target.value) || undefined }))}
                  placeholder="100 (ex: paume de main)"
                  className={errors.application_area ? 'border-red-500' : ''}
                />
                <p className="text-xs text-gray-500">
                  Référence : paume = ~100 cm², avant-bras = ~300 cm²
                </p>
                {errors.application_area && (
                  <p className="text-sm text-red-600">{errors.application_area}</p>
                )}
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Informations importantes</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {formData.route === 'topique' && (
                <>
                  <li>• Toujours diluer l'huile essentielle dans une huile végétale</li>
                  <li>• Éviter les muqueuses et le contour des yeux</li>
                  <li>• Test cutané recommandé avant première utilisation</li>
                </>
              )}
              {formData.route === 'orale' && (
                <>
                  <li>• ⚠️ Avis médical ou pharmaceutique obligatoire</li>
                  <li>• Prendre avec un support (miel, huile végétale)</li>
                  <li>• Ne jamais prendre pure</li>
                </>
              )}
              {formData.route === 'inhalation' && (
                <>
                  <li>• Diffusion : 30-60 minutes maximum par session</li>
                  <li>• Éviter en présence d'asthmatiques</li>
                  <li>• Aérer après utilisation</li>
                </>
              )}
            </ul>
          </div>

          <Button type="submit" className="w-full" disabled={isCalculating}>
            {isCalculating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Calcul en cours...
              </>
            ) : (
              'Calculer la Dose Recommandée'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default ApplicationForm
