'use client'

import { useState } from 'react'
import { useCreateProgram, CreateProgramData } from '@/hooks/useCreateProgram'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

const DIFFICULTY_OPTIONS = [
  { value: 'beginner' as const, label: 'Principiante', description: 'Para personas nuevas en el entrenamiento' },
  { value: 'intermediate' as const, label: 'Intermedio', description: 'Para quienes tienen experiencia básica' },
  { value: 'advanced' as const, label: 'Avanzado', description: 'Para atletas experimentados' }
]

const GOAL_OPTIONS = [
  { value: 'strength' as const, label: 'Fuerza', description: 'Aumentar la fuerza máxima' },
  { value: 'muscle_gain' as const, label: 'Hipertrofia', description: 'Construir masa muscular' },
  { value: 'endurance' as const, label: 'Resistencia', description: 'Mejorar resistencia cardiovascular' },
  { value: 'general_fitness' as const, label: 'Condición General', description: 'Mejorar condición física general' },
  { value: 'fat_loss' as const, label: 'Pérdida de Peso', description: 'Reducir grasa corporal' },
  { value: 'sport_specific' as const, label: 'Rendimiento Atlético', description: 'Mejorar rendimiento deportivo' }
]

const SPLIT_OPTIONS = [
  { value: 'full_body' as const, label: 'Cuerpo Completo', description: 'Entrenar todo el cuerpo en cada sesión' },
  { value: 'upper_lower' as const, label: 'Tren Superior/Inferior', description: 'Alternar entre tren superior e inferior' },
  { value: 'push_pull_legs' as const, label: 'Push/Pull/Piernas', description: 'Dividir por patrones de movimiento' },
  { value: 'body_part' as const, label: 'División por Grupos', description: 'Enfocar grupos musculares específicos' }
]

interface StepProps {
  data: Partial<CreateProgramData>
  updateData: (updates: Partial<CreateProgramData>) => void
  onNext: () => void
  onBack?: () => void
  isValid: boolean
  errors: Record<string, string>
}

function Step1BasicInfo({ data, updateData, onNext, isValid, errors }: StepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
          Información Básica
        </h2>
        <p className="text-gray-400 text-lg">Define los detalles principales de tu rutina</p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-200 mb-3">
            Nombre de la Rutina *
          </label>
          <Input
            id="name"
            value={data.name || ''}
            onChange={(e) => updateData({ name: e.target.value })}
            placeholder="Ej: Rutina de Fuerza 5x5"
            className={`bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-400 rounded-xl py-3 px-4 text-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all ${
              errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
            }`}
          />
          {errors.name && <p className="text-red-400 text-sm mt-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.name}
          </p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-200 mb-3">
            Descripción
          </label>
          <textarea
            id="description"
            rows={3}
            value={data.description || ''}
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder="Describe el enfoque y características de tu rutina..."
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all resize-none text-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="duration" className="block text-sm font-semibold text-gray-200 mb-3">
              Duración (semanas) *
            </label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="52"
              value={data.duration || ''}
              onChange={(e) => updateData({ duration: parseInt(e.target.value) || 0 })}
              placeholder="12"
              className={`bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-400 rounded-xl py-3 px-4 text-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all ${
                errors.duration ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
              }`}
            />
            {errors.duration && <p className="text-red-400 text-sm mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.duration}
            </p>}
          </div>

          <div>
            <label htmlFor="sessionsPerWeek" className="block text-sm font-semibold text-gray-200 mb-3">
              Sesiones por semana *
            </label>
            <Input
              id="sessionsPerWeek"
              type="number"
              min="1"
              max="7"
              value={data.sessionsPerWeek || ''}
              onChange={(e) => updateData({ sessionsPerWeek: parseInt(e.target.value) || 0 })}
              placeholder="4"
              className={`bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-400 rounded-xl py-3 px-4 text-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all ${
                errors.sessionsPerWeek ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
              }`}
            />
            {errors.sessionsPerWeek && <p className="text-red-400 text-sm mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.sessionsPerWeek}
            </p>}
          </div>
        </div>

        <div>
          <label htmlFor="estimatedDuration" className="block text-sm font-semibold text-gray-200 mb-3">
            Duración estimada por sesión (minutos) *
          </label>
          <Input
            id="estimatedDuration"
            type="number"
            min="15"
            max="180"
            value={data.estimatedDuration || ''}
            onChange={(e) => updateData({ estimatedDuration: parseInt(e.target.value) || 0 })}
            placeholder="60"
            className={`bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-400 rounded-xl py-3 px-4 text-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all ${
              errors.estimatedDuration ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
            }`}
          />
          {errors.estimatedDuration && <p className="text-red-400 text-sm mt-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.estimatedDuration}
          </p>}
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Siguiente
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  )
}

function Step2Configuration({ data, updateData, onNext, onBack, isValid, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Configuración</h2>
        <p className="text-gray-400">Define el objetivo y estructura de tu rutina</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Objetivo Principal *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {GOAL_OPTIONS.map((goal) => (
              <Card
                key={goal.value}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  data.goal === goal.value
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-blue-500 ring-2 ring-blue-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
                onClick={() => updateData({ goal: goal.value })}
              >
                <h3 className="text-white font-medium mb-1">{goal.label}</h3>
                <p className="text-gray-400 text-sm">{goal.description}</p>
              </Card>
            ))}
          </div>
          {errors.goal && <p className="text-red-400 text-sm mt-1">{errors.goal}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            División de Entrenamiento *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SPLIT_OPTIONS.map((split) => (
              <Card
                key={split.value}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  data.split === split.value
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-blue-500 ring-2 ring-blue-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
                onClick={() => updateData({ split: split.value })}
              >
                <h3 className="text-white font-medium mb-1">{split.label}</h3>
                <p className="text-gray-400 text-sm">{split.description}</p>
              </Card>
            ))}
          </div>
          {errors.split && <p className="text-red-400 text-sm mt-1">{errors.split}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Nivel de Dificultad *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DIFFICULTY_OPTIONS.map((difficulty) => (
              <Card
                key={difficulty.value}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  data.difficulty === difficulty.value
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-blue-500 ring-2 ring-blue-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
                onClick={() => updateData({ difficulty: difficulty.value })}
              >
                <h3 className="text-white font-medium mb-1">{difficulty.label}</h3>
                <p className="text-gray-400 text-sm">{difficulty.description}</p>
              </Card>
            ))}
          </div>
          {errors.difficulty && <p className="text-red-400 text-sm mt-1">{errors.difficulty}</p>}
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
        >
          Anterior
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}

function Step3Privacy({ data, updateData, onNext, onBack, isValid }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Privacidad</h2>
        <p className="text-gray-400">Configura la visibilidad de tu rutina</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <Card
            className={`p-6 cursor-pointer transition-all duration-200 ${
              data.isPublic === false
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-blue-500 ring-2 ring-blue-500/50'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
            }`}
            onClick={() => updateData({ isPublic: false })}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  data.isPublic === false ? 'bg-blue-500 border-blue-500' : 'border-white/40'
                }`} />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Rutina Privada</h3>
                <p className="text-gray-400 text-sm">
                  Solo tú puedes ver y usar esta rutina. Perfecta para rutinas personalizadas y experimentales.
                </p>
              </div>
            </div>
          </Card>

          <Card
            className={`p-6 cursor-pointer transition-all duration-200 ${
              data.isPublic === true
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-blue-500 ring-2 ring-blue-500/50'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
            }`}
            onClick={() => updateData({ isPublic: true })}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  data.isPublic === true ? 'bg-blue-500 border-blue-500' : 'border-white/40'
                }`} />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Rutina Pública</h3>
                <p className="text-gray-400 text-sm">
                  Otros usuarios pueden descubrir y usar tu rutina. Comparte tus mejores entrenamientos con la comunidad.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mt-6">
          <h4 className="text-white font-medium mb-2">Resumen de tu Rutina</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Nombre:</span>
              <span className="text-white">{data.name || 'Sin nombre'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Objetivo:</span>
              <span className="text-white">
                {GOAL_OPTIONS.find(g => g.value === data.goal)?.label || 'No definido'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">División:</span>
              <span className="text-white">
                {SPLIT_OPTIONS.find(s => s.value === data.split)?.label || 'No definido'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Duración:</span>
              <span className="text-white">{data.duration} semanas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sesiones/semana:</span>
              <span className="text-white">{data.sessionsPerWeek}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Dificultad:</span>
              <span className="text-white">
                {DIFFICULTY_OPTIONS.find(d => d.value === data.difficulty)?.label || 'No definido'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
        >
          Anterior
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Crear Rutina
        </Button>
      </div>
    </div>
  )
}

interface CreateProgramProps {
  onBack?: () => void;
}

export default function CreateProgram({ onBack }: CreateProgramProps = {}) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<CreateProgramData>>({
    isPublic: false
  })
  
  const { createProgram, isLoading, error, validateStep } = useCreateProgram()

  const updateFormData = (updates: Partial<CreateProgramData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (validateStep(formData, 3).isValid) {
      const success = await createProgram(formData as CreateProgramData)
      if (success) {
        // Reset form
        setFormData({ isPublic: false })
        setCurrentStep(1)
        
        // If onBack is provided, navigate back to list after successful creation
        if (onBack) {
          setTimeout(() => {
            onBack()
          }, 1500) // Give time to see success message
        }
      }
    }
  }

  const validation = validateStep(formData, currentStep)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Back Button */}
          {onBack && (
            <div className="flex justify-start mb-6">
              <button
                onClick={onBack}
                className="flex items-center text-gray-400 hover:text-white transition-colors group"
              >
                <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver a Mis Rutinas
              </button>
            </div>
          )}
          
          <div className="relative inline-block mb-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Crear Nueva Rutina
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg blur opacity-75"></div>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    currentStep >= step
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white/10 text-gray-400 border border-white/20'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-20 h-1 mx-3 rounded-full transition-all duration-300 ${
                      currentStep > step ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-white/20'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
            <span className={currentStep >= 1 ? 'text-blue-400' : ''}>Información</span>
            <span className={currentStep >= 2 ? 'text-purple-400' : ''}>Configuración</span>
            <span className={currentStep >= 3 ? 'text-pink-400' : ''}>Privacidad</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl blur opacity-75"></div>
          <Card className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl">
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white font-medium">Creando rutina...</p>
                </div>
              </div>
            )}

          {currentStep === 1 && (
            <Step1BasicInfo
              data={formData}
              updateData={updateFormData}
              onNext={handleNext}
              isValid={validation.isValid}
              errors={validation.errors}
            />
          )}

          {currentStep === 2 && (
            <Step2Configuration
              data={formData}
              updateData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
              isValid={validation.isValid}
              errors={validation.errors}
            />
          )}

          {currentStep === 3 && (
            <Step3Privacy
              data={formData}
              updateData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
              isValid={validation.isValid}
              errors={validation.errors}
            />
          )}
          </Card>
        </div>
      </div>
    </div>
  )
}
