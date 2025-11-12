'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Zap, MessageSquare, Save, Trash2, Target } from 'lucide-react';
import { ScheduledSession } from '@/types/weekly-planner';
import { Button } from '@/components/ui/button';

interface SessionConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ScheduledSession | null;
  onSave: (session: ScheduledSession) => void;
  onDelete?: (sessionId: string) => void;
}

export function SessionConfigModal({ 
  isOpen, 
  onClose, 
  session,
  onSave,
  onDelete 
}: SessionConfigModalProps) {
  const [editedSession, setEditedSession] = useState<ScheduledSession | null>(session);
  const [startTime, setStartTime] = useState(session?.startTime || '09:00');
  const [notes, setNotes] = useState(session?.notes || '');
  const [rpe, setRpe] = useState(7);

  if (!session || !editedSession) return null;

  const handleSave = () => {
    onSave({
      ...editedSession,
      startTime,
      notes
    });
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && session) {
      onDelete(session.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-slate-900 border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {session.workoutSession.name}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Configurar detalles de la sesión
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Time Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    Hora de inicio
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400/50 transition-colors"
                  />
                </div>

                {/* RPE Slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-orange-400" />
                    Esfuerzo percibido (RPE): {rpe}/10
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={rpe}
                      onChange={(e) => setRpe(Number(e.target.value))}
                      className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-4
                        [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-gradient-to-r
                        [&::-webkit-slider-thumb]:from-blue-500
                        [&::-webkit-slider-thumb]:to-violet-500
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-moz-range-thumb]:w-4
                        [&::-moz-range-thumb]:h-4
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-gradient-to-r
                        [&::-moz-range-thumb]:from-blue-500
                        [&::-moz-range-thumb]:to-violet-500
                        [&::-moz-range-thumb]:border-0
                        [&::-moz-range-thumb]:cursor-pointer"
                    />
                    <div className={`
                      px-3 py-1 rounded-lg font-semibold text-sm
                      ${rpe <= 3 ? 'bg-green-500/20 text-green-400' : ''}
                      ${rpe > 3 && rpe <= 6 ? 'bg-yellow-500/20 text-yellow-400' : ''}
                      ${rpe > 6 && rpe <= 8 ? 'bg-orange-500/20 text-orange-400' : ''}
                      ${rpe > 8 ? 'bg-red-500/20 text-red-400' : ''}
                    `}>
                      {rpe <= 3 && 'Suave'}
                      {rpe > 3 && rpe <= 6 && 'Moderado'}
                      {rpe > 6 && rpe <= 8 && 'Intenso'}
                      {rpe > 8 && 'Muy Intenso'}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-purple-400" />
                    Notas
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Añade notas sobre la sesión..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400/50 transition-colors resize-none"
                  />
                </div>

                {/* Exercise Summary */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-emerald-400" />
                    Ejercicios ({session.workoutSession.exercises.length})
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {session.workoutSession.exercises.map((exercise, index) => (
                      <div
                        key={exercise.id}
                        className="p-3 bg-white/5 border border-white/10 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">
                            {index + 1}. {exercise.exercise.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {exercise.sets}x{exercise.reps}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 flex items-center justify-between">
                {onDelete && (
                  <Button
                    variant="ghost"
                    onClick={handleDelete}
                    className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                )}
                <div className="flex gap-3 ml-auto">
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="border border-white/10"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
