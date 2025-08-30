import { create } from 'zustand';
import { TrainingProgram, WorkoutSession, Exercise, CalendarEvent } from '@/types';

interface RoutineState {
  // Training Programs
  programs: TrainingProgram[];
  activeProgram: TrainingProgram | null;
  
  // Exercises
  exercises: Exercise[];
  exerciseFilters: {
    bodyPart?: string;
    equipment?: string;
    target?: string;
    search?: string;
  };
  
  // Calendar
  calendarEvents: CalendarEvent[];
  selectedDate: Date;
  
  // UI State
  sidebarOpen: boolean;
  
  // Actions
  setPrograms: (programs: TrainingProgram[]) => void;
  setActiveProgram: (program: TrainingProgram | null) => void;
  addProgram: (program: TrainingProgram) => void;
  updateProgram: (program: TrainingProgram) => void;
  deleteProgram: (programId: string) => void;
  
  setExercises: (exercises: Exercise[]) => void;
  setExerciseFilters: (filters: Record<string, unknown>) => void;
  
  setCalendarEvents: (events: CalendarEvent[]) => void;
  addCalendarEvent: (event: CalendarEvent) => void;
  updateCalendarEvent: (event: CalendarEvent) => void;
  deleteCalendarEvent: (eventId: string) => void;
  setSelectedDate: (date: Date) => void;
  
  setSidebarOpen: (open: boolean) => void;
}

export const useRoutineStore = create<RoutineState>((set, get) => ({
  // Initial state
  programs: [],
  activeProgram: null,
  exercises: [],
  exerciseFilters: {},
  calendarEvents: [],
  selectedDate: new Date(),
  sidebarOpen: false,
  
  // Actions
  setPrograms: (programs) => set({ programs }),
  setActiveProgram: (activeProgram) => set({ activeProgram }),
  addProgram: (program) => set((state) => ({ programs: [...state.programs, program] })),
  updateProgram: (program) => set((state) => ({
    programs: state.programs.map(p => p.id === program.id ? program : p),
    activeProgram: state.activeProgram?.id === program.id ? program : state.activeProgram
  })),
  deleteProgram: (programId) => set((state) => ({
    programs: state.programs.filter(p => p.id !== programId),
    activeProgram: state.activeProgram?.id === programId ? null : state.activeProgram
  })),
  
  setExercises: (exercises) => set({ exercises }),
  setExerciseFilters: (filters) => set((state) => ({
    exerciseFilters: { ...state.exerciseFilters, ...filters }
  })),
  
  setCalendarEvents: (calendarEvents) => set({ calendarEvents }),
  addCalendarEvent: (event) => set((state) => ({
    calendarEvents: [...state.calendarEvents, event]
  })),
  updateCalendarEvent: (event) => set((state) => ({
    calendarEvents: state.calendarEvents.map(e => e.id === event.id ? event : e)
  })),
  deleteCalendarEvent: (eventId) => set((state) => ({
    calendarEvents: state.calendarEvents.filter(e => e.id !== eventId)
  })),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
