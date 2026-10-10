'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { 
  Mesocycle, 
  WeeklySplit, 
  SessionTemplate, 
  ProgressionRule,
  PhaseType,
  SessionType,
  Program
} from '@/types/program'
import { MesocycleTimeline } from '@/components/planner/MesocycleTimeline'
import { 
  Layers, 
  Calendar, 
  TrendingUp, 
  Eye, 
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useCreateProgram } from '@/hooks/useCreateProgram'
import { updateProgram } from '@/app/actions/programs'

// ==================== CONSTANTES ====================

const SPLIT_TYPE_OPTIONS = [
  { value: 'full_body' as const, label: 'Cuerpo Completo', description: 'Todo el cuerpo en cada sesión' },
  { value: 'upper_lower' as const, label: 'Tren Superior/Inferior', description: 'Alternar entre tren superior e inferior' },
  { value: 'push_pull_legs' as const, label: 'Push/Pull/Piernas', description: 'División por patrones de movimiento' },
  { value: 'body_part' as const, label: 'División por Grupos', description: 'Grupos musculares específicos' }
]

const PHASE_OPTIONS: { value: PhaseType; label: string; description: string; color: string }[] = [
  { value: 'volume', label: 'Volumen', description: 'Alto volumen, intensidad moderada', color: 'blue' },
  { value: 'intensity', label: 'Intensidad', description: 'Alta intensidad, volumen reducido', color: 'orange' },
  { value: 'deload', label: 'Descarga', description: 'Recuperación activa', color: 'green' },
  { value: 'peaking', label: 'Pico', description: 'Máximo rendimiento', color: 'red' },
  { value: 'transition', label: 'Transición', description: 'Cambio de enfoque', color: 'purple' },
]

// ==================== TIPOS ====================

interface StepProps {
  data: Partial<ProgramFormData>
  updateData: (updates: Partial<ProgramFormData>) => void
  onNext: () => void
  onBack?: () => void
  isValid: boolean
  errors: Record<string, string>
}

interface ProgramFormData {
  name: string
  description: string
  totalWeeks: number
  sessionsPerWeek: number
  splitType: WeeklySplit['type']
  mesocycles: Mesocycle[]
  weeklySplit: WeeklySplit
  sessionTemplates: SessionTemplate[]
  progressionRules: ProgressionRule[]
}

// ==================== PASO 1: ESTRUCTURA BÁSICA ====================

function Step1BasicStructure({ data, updateData, onNext, isValid, errors }: StepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center mb-4">
          <Layers className="w-12 h-12 text-blue-400" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
          Estructura Básica
        </h2>
        <p className="text-gray-400 text-lg">Define el esqueleto de tu programa de entrenamiento</p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-200 mb-3">
            Nombre del Programa *
          </label>
          <Input
            id="name"
            value={data.name || ''}
            onChange={(e) => updateData({ name: e.target.value })}
            placeholder="Ej: Programa de Fuerza 12 Semanas"
            className={`bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-400 rounded-xl py-3 px-4 text-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all ${
              errors.name ? 'border-red-500' : ''
            }`}
          />
          {errors.name && <p className="text-red-400 text-sm mt-2">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-200 mb-3">
            Descripción del Programa
          </label>
          <textarea
            id="description"
            rows={3}
            value={data.description || ''}
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder="Describe la filosofía y estructura general del programa..."
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all resize-none text-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="totalWeeks" className="block text-sm font-semibold text-gray-200 mb-3">
              Duración Total (semanas) *
            </label>
            <Input
              id="totalWeeks"
              type="number"
              min="1"
              max="52"
              value={data.totalWeeks || ''}
              onChange={(e) => updateData({ totalWeeks: parseInt(e.target.value) || 0 })}
              placeholder="12"
              className={`bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-400 rounded-xl py-3 px-4 text-lg ${
                errors.totalWeeks ? 'border-red-500' : ''
              }`}
            />
            {errors.totalWeeks && <p className="text-red-400 text-sm mt-2">{errors.totalWeeks}</p>}
          </div>

          <div>
            <label htmlFor="sessionsPerWeek" className="block text-sm font-semibold text-gray-200 mb-3">
              Sesiones por Semana *
            </label>
            <Input
              id="sessionsPerWeek"
              type="number"
              min="1"
              max="7"
              value={data.sessionsPerWeek || ''}
              onChange={(e) => updateData({ sessionsPerWeek: parseInt(e.target.value) || 0 })}
              placeholder="4"
              className={`bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-400 rounded-xl py-3 px-4 text-lg ${
                errors.sessionsPerWeek ? 'border-red-500' : ''
              }`}
            />
            {errors.sessionsPerWeek && <p className="text-red-400 text-sm mt-2">{errors.sessionsPerWeek}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-3">
            Tipo de Split *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SPLIT_TYPE_OPTIONS.map((split) => (
              <Card
                key={split.value}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  data.splitType === split.value
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-blue-500 ring-2 ring-blue-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
                onClick={() => updateData({ splitType: split.value })}
              >
                <h3 className="text-white font-medium mb-1">{split.label}</h3>
                <p className="text-gray-400 text-sm">{split.description}</p>
              </Card>
            ))}
          </div>
          {errors.splitType && <p className="text-red-400 text-sm mt-2">{errors.splitType}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
        >
          Siguiente
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}

// ==================== PASO 2: MESOCICLOS ====================

function Step2Mesocycles({ data, updateData, onNext, onBack, isValid, errors }: StepProps) {
  const [mesocycles, setMesocycles] = useState<Mesocycle[]>(data.mesocycles || [])
  
  const addMesocycle = () => {
    const newMeso: Mesocycle = {
      id: `meso-${Date.now()}`,
      name: `Mesociclo ${mesocycles.length + 1}`,
      phase: 'volume',
      goal: 'Acumulación de volumen',
      durationWeeks: 4,
      weeks: [],
      baseIntensityPercent: 70,
      baseVolumeMultiplier: 1.0,
      color: '#3b82f6',
      order: mesocycles.length,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const updatedMesos = [...mesocycles, newMeso]
    setMesocycles(updatedMesos)
    updateData({ mesocycles: updatedMesos })
  }

  const updateMesocycle = (index: number, updates: Partial<Mesocycle>) => {
    const updated = [...mesocycles]
    updated[index] = { ...updated[index], ...updates, updatedAt: new Date() }
    
    setMesocycles(updated)
    updateData({ mesocycles: updated })
  }

  const removeMesocycle = (index: number) => {
    const updated = mesocycles.filter((_, i) => i !== index)
    setMesocycles(updated)
    updateData({ mesocycles: updated })
  }

  const totalWeeksPlanned = mesocycles.reduce((sum, m) => sum + m.durationWeeks, 0)
  const weeksRemaining = (data.totalWeeks || 0) - totalWeeksPlanned

  return (
    <div className="space-y-8">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center mb-4">
          <Calendar className="w-12 h-12 text-purple-400" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
          Configuración de Mesociclos
        </h2>
        <p className="text-gray-400 text-lg">Diseña las fases de periodización</p>
      </div>

      {/* Resumen */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Programa</p>
            <p className="text-2xl font-bold text-white">{data.totalWeeks || 0} sem</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Planificadas</p>
            <p className="text-2xl font-bold text-blue-400">{totalWeeksPlanned} sem</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Restantes</p>
            <p className={`text-2xl font-bold ${weeksRemaining === 0 ? 'text-green-400' : weeksRemaining > 0 ? 'text-orange-400' : 'text-red-400'}`}>
              {weeksRemaining} sem
            </p>
          </div>
        </div>
        {weeksRemaining !== 0 && (
          <div className={`mt-4 p-3 rounded-lg ${weeksRemaining > 0 ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
            <p className={`text-sm text-center ${weeksRemaining > 0 ? 'text-orange-300' : 'text-red-300'}`}>
              {weeksRemaining > 0 
                ? `⚠️ Debes planificar las ${weeksRemaining} semanas restantes para continuar`
                : `⚠️ Has planificado ${Math.abs(weeksRemaining)} semanas de más. Ajusta la duración de los mesociclos`
              }
            </p>
          </div>
        )}
        {weeksRemaining === 0 && mesocycles.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-center text-green-300">
              ✅ Perfecto! Todas las semanas están planificadas
            </p>
          </div>
        )}
      </div>

      {/* Lista de Mesociclos */}
      <div className="space-y-4">
        {mesocycles.map((meso, index) => (
          <Card key={meso.id} className="bg-white/5 border-white/10 p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <Input
                  value={meso.name}
                  onChange={(e) => updateMesocycle(index, { name: e.target.value })}
                  className="bg-white/10 border-white/20 text-white font-semibold text-lg flex-1 mr-4"
                  placeholder="Nombre del mesociclo"
                />
                <button
                  onClick={() => removeMesocycle(index)}
                  className="text-red-400 hover:text-red-300 p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Fase</label>
                  <select
                    value={meso.phase}
                    onChange={(e) => updateMesocycle(index, { phase: e.target.value as PhaseType })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    {PHASE_OPTIONS.map(phase => (
                      <option key={phase.value} value={phase.value} className="bg-slate-800">
                        {phase.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Duración (semanas)</label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={meso.durationWeeks}
                    onChange={(e) => updateMesocycle(index, { durationWeeks: parseInt(e.target.value) || 1 })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Orden</label>
                  <Input
                    type="number"
                    value={index + 1}
                    disabled
                    className="bg-white/5 border-white/10 text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Objetivo del mesociclo</label>
                <Input
                  value={meso.goal}
                  onChange={(e) => updateMesocycle(index, { goal: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Ej: Acumulación de volumen e hipertrofia"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Botón Agregar */}
      <Button
        onClick={addMesocycle}
        disabled={weeksRemaining <= 0}
        variant="outline"
        className="w-full border-white/20 text-white hover:bg-white/10 py-6 text-lg disabled:opacity-50"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {weeksRemaining > 0 ? `Agregar Mesociclo` : `Todas las semanas planificadas`}
      </Button>

      <div className="flex justify-between pt-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Anterior
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid || weeksRemaining !== 0}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2"
        >
          Siguiente
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Mensaje de ayuda si el botón está deshabilitado */}
      {(!isValid || weeksRemaining !== 0) && (
        <div className="text-center mt-2">
          {!isValid && errors.mesocycles && (
            <p className="text-red-400 text-sm">{errors.mesocycles}</p>
          )}
          {isValid && weeksRemaining !== 0 && (
            <p className="text-orange-400 text-sm">
              💡 Ajusta la duración de los mesociclos para que sumen exactamente {data.totalWeeks} semanas
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ==================== PASO 3: DISEÑO SEMANAL ====================

function Step3WeeklySplit({ data, updateData, onNext, onBack, isValid }: StepProps) {
  const [sessionTemplates, setSessionTemplates] = useState<SessionTemplate[]>(data.sessionTemplates || [])
  const [editingSession, setEditingSession] = useState<SessionTemplate | null>(null)

  const sessionColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', 
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
  ]

  const sessionTypes = [
    { value: 'strength', label: 'Fuerza' },
    { value: 'hypertrophy', label: 'Hipertrofia' },
    { value: 'power', label: 'Potencia' },
    { value: 'endurance', label: 'Resistencia' },
    { value: 'conditioning', label: 'Acondicionamiento' }
  ]

  const addSession = () => {
    const newSession: SessionTemplate = {
      id: `session-${Date.now()}`,
      name: `Sesión ${sessionTemplates.length + 1}`,
      type: 'hypertrophy',
      focus: [],
      exercises: [],
      estimatedDurationMinutes: 60,
      estimatedVolume: 0,
      color: sessionColors[sessionTemplates.length % sessionColors.length],
      notes: '',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setEditingSession(newSession)
  }

  const saveSession = () => {
    if (!editingSession) return
    
    const exists = sessionTemplates.find(s => s.id === editingSession.id)
    let updated: SessionTemplate[]
    
    if (exists) {
      updated = sessionTemplates.map(s => s.id === editingSession.id ? editingSession : s)
    } else {
      updated = [...sessionTemplates, editingSession]
    }
    
    setSessionTemplates(updated)
    updateData({ sessionTemplates: updated })
    setEditingSession(null)
  }

  const deleteSession = (id: string) => {
    const updated = sessionTemplates.filter(s => s.id !== id)
    setSessionTemplates(updated)
    updateData({ sessionTemplates: updated })
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center mb-4">
          <Calendar className="w-12 h-12 text-green-400" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-3">
          Sesiones de Entrenamiento
        </h2>
        <p className="text-gray-400 text-lg">Define tus sesiones y distribúyelas en la semana</p>
      </div>

      {/* Lista de Sesiones */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Sesiones Creadas ({sessionTemplates.length})</h3>
          <Button
            onClick={addSession}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Sesión
          </Button>
        </div>

        {sessionTemplates.length === 0 && !editingSession && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">No has creado ninguna sesión todavía</p>
            <p className="text-gray-500 text-sm">Crea al menos una sesión para continuar</p>
          </div>
        )}

        {sessionTemplates.map((session) => (
          <Card key={session.id} className="bg-white/5 border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: session.color }}
                />
                <div>
                  <h4 className="text-white font-medium">{session.name}</h4>
                  <p className="text-gray-400 text-sm capitalize">
                    {sessionTypes.find(t => t.value === session.type)?.label} • {session.estimatedDurationMinutes} min
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingSession(session)}
                  className="text-blue-400 hover:text-blue-300 p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => deleteSession(session.id)}
                  className="text-red-400 hover:text-red-300 p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal de Edición */}
      {editingSession && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-900 border-white/10 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {sessionTemplates.find(s => s.id === editingSession.id) ? 'Editar Sesión' : 'Nueva Sesión'}
              </h3>
              <button
                onClick={() => setEditingSession(null)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nombre de la Sesión *</label>
                <Input
                  value={editingSession.name}
                  onChange={(e) => setEditingSession({ ...editingSession, name: e.target.value })}
                  placeholder="Ej: Tren Superior A"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tipo de Sesión *</label>
                  <select
                    value={editingSession.type}
                    onChange={(e) => setEditingSession({ ...editingSession, type: e.target.value as SessionType })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    {sessionTypes.map(type => (
                      <option key={type.value} value={type.value} className="bg-slate-800">
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Duración (min)</label>
                  <Input
                    type="number"
                    min="15"
                    max="180"
                    value={editingSession.estimatedDurationMinutes}
                    onChange={(e) => setEditingSession({ ...editingSession, estimatedDurationMinutes: parseInt(e.target.value) || 60 })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Color</label>
                <div className="grid grid-cols-8 gap-2">
                  {sessionColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setEditingSession({ ...editingSession, color })}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        editingSession.color === color ? 'ring-2 ring-white scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Notas (Opcional)</label>
                <textarea
                  value={editingSession.notes}
                  onChange={(e) => setEditingSession({ ...editingSession, notes: e.target.value })}
                  placeholder="Ej: Enfoque en pecho y hombros, incluir ejercicios compuestos..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white min-h-[80px]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setEditingSession(null)}
                variant="outline"
                className="flex-1 border-white/20 text-gray-300 hover:bg-white/10"
              >
                Cancelar
              </Button>
              <Button
                onClick={saveSession}
                disabled={!editingSession.name.trim()}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white disabled:opacity-50"
              >
                Guardar Sesión
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Anterior
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2"
        >
          Siguiente
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}

// ==================== PASO 4: REGLAS DE PROGRESIÓN ====================

function Step4Progression({ data, updateData, onNext, onBack, isValid }: StepProps) {
  const [rules, setRules] = useState<ProgressionRule[]>(data.progressionRules || [])

  const addRule = () => {
    const newRule: ProgressionRule = {
      id: `rule-${Date.now()}`,
      type: 'linear',
      variable: 'weight',
      startValue: 100,
      incrementPerWeek: 2.5,
      incrementPerMesocycle: 5,
      deloadReduction: 0.7
    }
    const updated = [...rules, newRule]
    setRules(updated)
    updateData({ progressionRules: updated })
  }

  const updateRule = (index: number, updates: Partial<ProgressionRule>) => {
    const updated = [...rules]
    updated[index] = { ...updated[index], ...updates }
    setRules(updated)
    updateData({ progressionRules: updated })
  }

  const removeRule = (index: number) => {
    const updated = rules.filter((_, i) => i !== index)
    setRules(updated)
    updateData({ progressionRules: updated })
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center mb-4">
          <TrendingUp className="w-12 h-12 text-orange-400" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-3">
          Reglas de Progresión
        </h2>
        <p className="text-gray-400 text-lg">Define cómo avanzará el programa</p>
      </div>

      <div className="space-y-4">
        {rules.map((rule, index) => (
          <Card key={rule.id} className="bg-white/5 border-white/10 p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-lg mb-2">Regla de Progresión {index + 1}</h4>
                  <p className="text-gray-400 text-sm">
                    Incremento {rule.type} de {rule.variable}
                  </p>
                </div>
                <button
                  onClick={() => removeRule(index)}
                  className="text-red-400 hover:text-red-300 p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tipo de Progresión</label>
                  <select
                    value={rule.type}
                    onChange={(e) => updateRule(index, { type: e.target.value as ProgressionRule['type'] })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="linear" className="bg-slate-800">Lineal</option>
                    <option value="wave" className="bg-slate-800">Ondulada</option>
                    <option value="step" className="bg-slate-800">Escalón</option>
                    <option value="custom" className="bg-slate-800">Personalizada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Variable a Ajustar</label>
                  <select
                    value={rule.variable}
                    onChange={(e) => updateRule(index, { variable: e.target.value as ProgressionRule['variable'] })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="weight" className="bg-slate-800">Peso</option>
                    <option value="reps" className="bg-slate-800">Repeticiones</option>
                    <option value="sets" className="bg-slate-800">Series</option>
                    <option value="intensity" className="bg-slate-800">Intensidad (%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Valor Inicial</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={rule.startValue}
                    onChange={(e) => updateRule(index, { startValue: parseFloat(e.target.value) || 0 })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Incremento/Semana</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={rule.incrementPerWeek}
                    onChange={(e) => updateRule(index, { incrementPerWeek: parseFloat(e.target.value) || 0 })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Reducción Deload (%)</label>
                  <Input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={rule.deloadReduction || 0.7}
                    onChange={(e) => updateRule(index, { deloadReduction: parseFloat(e.target.value) || 0.7 })}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="0.7 = -30%"
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button
        onClick={addRule}
        variant="outline"
        className="w-full border-white/20 text-white hover:bg-white/10 py-6 text-lg"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Agregar Regla de Progresión
      </Button>

      <div className="flex justify-between pt-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Anterior
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2"
        >
          Siguiente
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}

// ==================== PASO 5: PREVIEW Y CONFIRMACIÓN ====================

function Step5Preview({ data, onBack, onSubmit, isLoading, isEditing }: StepProps & { onSubmit: () => void; isLoading?: boolean; isEditing?: boolean }) {
  const totalSessions = (data.totalWeeks || 0) * (data.sessionsPerWeek || 0)

  // Convertir mesociclos a timeline items con startWeek y endWeek calculados
  const timelineItems = (data.mesocycles || []).map((meso, index, arr) => {
    const startWeek = arr.slice(0, index).reduce((sum, m) => sum + m.durationWeeks, 0) + 1
    const endWeek = startWeek + meso.durationWeeks - 1
    
    return {
      ...meso,
      startWeek,
      endWeek
    }
  })

  return (
    <div className="space-y-8">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center mb-4">
          <Eye className="w-12 h-12 text-purple-400" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
          Preview del Programa
        </h2>
        <p className="text-gray-400 text-lg">Revisa tu diseño antes de crear</p>
      </div>

      {/* Resumen General */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 p-6">
        <h3 className="text-2xl font-bold text-white mb-4">{data.name}</h3>
        {data.description && (
          <p className="text-gray-300 mb-4">{data.description}</p>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Duración</p>
            <p className="text-2xl font-bold text-white">{data.totalWeeks} sem</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Frecuencia</p>
            <p className="text-2xl font-bold text-blue-400">{data.sessionsPerWeek}/sem</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Mesociclos</p>
            <p className="text-2xl font-bold text-purple-400">{data.mesocycles?.length || 0}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Sesiones</p>
            <p className="text-2xl font-bold text-green-400">{totalSessions}</p>
          </div>
        </div>
      </Card>

      {/* Timeline de Mesociclos */}
      {data.mesocycles && data.mesocycles.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Timeline de Mesociclos</h3>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <MesocycleTimeline mesocycles={timelineItems} totalWeeks={data.totalWeeks || 12} />
          </div>
        </div>
      )}

      {/* Reglas de Progresión */}
      {data.progressionRules && data.progressionRules.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Reglas de Progresión</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.progressionRules.map((rule, index) => (
              <Card key={rule.id} className="bg-white/5 border-white/10 p-4">
                <h4 className="text-white font-medium mb-2">Regla {index + 1}</h4>
                <p className="text-sm text-gray-400">
                  Tipo: <span className="text-blue-400">{rule.type}</span>
                </p>
                <p className="text-sm text-gray-400">
                  Variable: <span className="text-purple-400">{rule.variable}</span>
                </p>
                <p className="text-sm text-gray-400">
                  Incremento: <span className="text-green-400">+{rule.incrementPerWeek}</span> por semana
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Anterior
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isLoading}
          className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {isEditing ? 'Guardando...' : 'Creando...'}
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              {isEditing ? 'Actualizar Programa' : 'Crear Programa'}
              <Sparkles className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// ==================== COMPONENTE PRINCIPAL ====================

interface CreateProgramProps {
  onBack?: () => void
  onProgramCreated?: () => void
  editingProgram?: Program | null
}

export default function CreateProgram({ onBack, onProgramCreated, editingProgram }: CreateProgramProps = {}) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<ProgramFormData>>(() => {
    // Si estamos editando, pre-cargar los datos
    if (editingProgram) {
      return {
        name: editingProgram.name,
        description: editingProgram.description || '',
        totalWeeks: editingProgram.totalWeeks,
        sessionsPerWeek: editingProgram.sessionsPerWeek,
        splitType: editingProgram.splitType,
        sessionTemplates: editingProgram.sessionTemplates || [],
        mesocycles: editingProgram.mesocycles || [],
        progressionRules: editingProgram.progressionRules || [],
        weeklySplit: editingProgram.weeklySplits?.[0] || {
          id: 'default-split',
          name: 'Split Semanal',
          type: editingProgram.splitType,
          days: [],
          totalSessionsPerWeek: editingProgram.sessionsPerWeek,
          estimatedWeeklyVolume: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    }
    // Datos por defecto para nuevo programa
    return {
      name: '',
      description: '',
      totalWeeks: 12,
      sessionsPerWeek: 3,
      splitType: 'full_body',
      sessionTemplates: [],
      mesocycles: [],
      progressionRules: [],
      weeklySplit: {
        id: 'default-split',
        name: 'Split Semanal',
        type: 'full_body',
        days: [],
        totalSessionsPerWeek: 3,
        estimatedWeeklyVolume: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  })
  const { createCompleteProgram, isLoading, error: createError } = useCreateProgram()
  const [isSaving, setIsSaving] = useState(false)

  const updateFormData = (updates: Partial<ProgramFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const validateStep = (step: number): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.name?.trim()) errors.name = 'El nombre es requerido'
        if (!formData.totalWeeks || formData.totalWeeks < 1) errors.totalWeeks = 'Duración mínima: 1 semana'
        if (!formData.sessionsPerWeek || formData.sessionsPerWeek < 1) errors.sessionsPerWeek = 'Mínimo 1 sesión/semana'
        if (!formData.splitType) errors.splitType = 'Selecciona un tipo de split'
        break
      
      case 2:
        if (!formData.mesocycles || formData.mesocycles.length === 0) {
          errors.mesocycles = 'Agrega al menos un mesociclo'
        }
        if (formData.mesocycles && formData.mesocycles.length > 0) {
          const totalPlanned = formData.mesocycles.reduce((sum, m) => sum + m.durationWeeks, 0)
          if (totalPlanned !== formData.totalWeeks) {
            errors.mesocycles = `Los mesociclos deben sumar ${formData.totalWeeks} semanas (actualmente: ${totalPlanned})`
          }
        }
        break
      
      case 3:
        // Validar que tenga sesiones configuradas
        if (!formData.sessionTemplates || formData.sessionTemplates.length === 0) {
          errors.sessionTemplates = 'Agrega al menos una sesión de entrenamiento'
        }
        break
      
      case 4:
        // Validar reglas de progresión (opcional)
        break
      
      case 5:
        // Preview - siempre válido
        break
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  const handleNext = () => {
    const validation = validateStep(currentStep)
    if (validation.isValid && currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      await submitProgram()
    } finally {
      setIsSaving(false)
    }
  }

  const submitProgram = async () => {
    // Validar campos básicos requeridos
    if (!formData.name?.trim()) {
      toast.error('El nombre del programa es requerido');
      setCurrentStep(1);
      return;
    }

    if (!formData.splitType) {
      toast.error('Debes seleccionar un tipo de split');
      setCurrentStep(1);
      return;
    }

    if (!formData.mesocycles || formData.mesocycles.length === 0) {
      toast.error('Debes crear al menos un mesociclo');
      setCurrentStep(2);
      return;
    }

    if (!formData.sessionTemplates || formData.sessionTemplates.length === 0) {
      toast.error('Debes crear al menos una sesión de entrenamiento');
      setCurrentStep(2);
      return;
    }

    try {
      // Crear weeklySplit automáticamente si no existe
      const weeklySplit = formData.weeklySplit || {
        name: `Split ${formData.splitType.replace('_', ' ')}`,
        type: formData.splitType,
        days: [
          { dayOfWeek: 'monday' as const, isRestDay: false },
          { dayOfWeek: 'tuesday' as const, isRestDay: false },
          { dayOfWeek: 'wednesday' as const, isRestDay: false },
          { dayOfWeek: 'thursday' as const, isRestDay: true },
          { dayOfWeek: 'friday' as const, isRestDay: false },
          { dayOfWeek: 'saturday' as const, isRestDay: true },
          { dayOfWeek: 'sunday' as const, isRestDay: true }
        ]
      };

      // Preparar datos para guardar en Neon
      const programData = {
        name: formData.name,
        description: formData.description || '',
        splitType: formData.splitType,
        totalWeeks: formData.totalWeeks || 12,
        sessionsPerWeek: formData.sessionsPerWeek || 3,
        sessionTemplates: formData.sessionTemplates,
        weeklySplit: weeklySplit,
        mesocycles: formData.mesocycles,
        progressionRules: formData.progressionRules || []
      };

      // Detectar modo: edición o creación
      if (editingProgram) {
        // MODO EDICIÓN: Actualizar programa existente
        await updateProgram(editingProgram.id, {
          name: programData.name,
          description: programData.description,
          splitType: programData.splitType,
          totalWeeks: programData.totalWeeks,
          sessionsPerWeek: programData.sessionsPerWeek,
          sessionTemplates: programData.sessionTemplates,
          weeklySplits: [programData.weeklySplit as WeeklySplit], // Convertir a array
          mesocycles: programData.mesocycles,
          progressionRules: programData.progressionRules
        });
        
        toast.success(`¡Programa "${formData.name}" actualizado exitosamente!`, {
          icon: '✅',
          duration: 3000,
        });
        
        if (onProgramCreated) {
          onProgramCreated();
        }
        
        if (onBack) {
          setTimeout(() => {
            onBack();
          }, 1500);
        }
      } else {
        // MODO CREACIÓN: Crear nuevo programa
        const programId = await createCompleteProgram(programData);
        
        if (programId) {
          toast.success(`¡Programa "${formData.name}" creado exitosamente!`, {
            icon: '🎉',
            duration: 3000,
          });
          
          // Resetear formulario
          setFormData({
            sessionTemplates: [],
            mesocycles: [],
            progressionRules: []
          });
          setCurrentStep(1);
          
          if (onProgramCreated) {
            onProgramCreated();
          }
          
          if (onBack) {
            setTimeout(() => {
              onBack();
            }, 1500);
          }
        } else {
          toast.error(createError || 'Error al crear el programa');
        }
      }
    } catch (err) {
      console.error('Error saving program:', err);
      toast.error(editingProgram ? 'Error al actualizar el programa' : 'Error al crear el programa');
    }
  }

  const validation = validateStep(currentStep)
  const stepTitles = ['Estructura', 'Mesociclos', 'Split Semanal', 'Progresión', 'Preview']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          {onBack && (
            <div className="flex justify-start mb-6">
              <button
                onClick={onBack}
                className="flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-xl group"
              >
                <ChevronLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
                Volver
              </button>
            </div>
          )}
          
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
              {editingProgram ? 'Editar Programa de Entrenamiento' : 'Crear Programa de Entrenamiento'}
            </h1>
            <div className="h-1 w-48 bg-gradient-to-r from-blue-500 to-violet-600 rounded-full mx-auto mt-4"></div>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-3 mb-8 overflow-x-auto pb-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      currentStep >= step
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'bg-white/10 text-gray-400 border border-white/20'
                    }`}
                  >
                    {step}
                  </div>
                  <span className={`text-xs mt-2 ${currentStep >= step ? 'text-blue-400' : 'text-gray-500'}`}>
                    {stepTitles[step - 1]}
                  </span>
                </div>
                {step < 5 && (
                  <div
                    className={`w-16 h-1 mx-2 rounded-full transition-all duration-300 ${
                      currentStep > step ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-white/20'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
          {currentStep === 1 && (
            <Step1BasicStructure
              data={formData}
              updateData={updateFormData}
              onNext={handleNext}
              isValid={validation.isValid}
              errors={validation.errors}
            />
          )}

          {currentStep === 2 && (
            <Step2Mesocycles
              data={formData}
              updateData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
              isValid={validation.isValid}
              errors={validation.errors}
            />
          )}

          {currentStep === 3 && (
            <Step3WeeklySplit
              data={formData}
              updateData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
              isValid={validation.isValid}
              errors={validation.errors}
            />
          )}

          {currentStep === 4 && (
            <Step4Progression
              data={formData}
              updateData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
              isValid={validation.isValid}
              errors={validation.errors}
            />
          )}

          {currentStep === 5 && (
            <Step5Preview
              data={formData}
              updateData={updateFormData}
              onNext={handleSubmit}
              onBack={handleBack}
              onSubmit={handleSubmit}
              isValid={true}
              errors={{}}
              isLoading={isLoading || isSaving}
              isEditing={!!editingProgram}
            />
          )}
        </div>
      </div>
    </div>
  )
}
