import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarEvent, WorkoutSession } from '@/types';
import { formatDate, getDateString, isSameDay } from '@/lib/utils';
import { Plus, Calendar as CalendarIcon, Clock, Target } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

interface WorkoutCalendarProps {
  events: CalendarEvent[];
  onEventAdd: (event: Omit<CalendarEvent, 'id'>) => void;
  onEventUpdate: (event: CalendarEvent) => void;
  onEventDelete: (eventId: string) => void;
  availableSessions: WorkoutSession[];
}

export default function WorkoutCalendar({
  events,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  availableSessions
}: WorkoutCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
  const [showSessionList, setShowSessionList] = useState(false);

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateString = getDateString(date);
    return events.filter(event => event.date === dateString);
  };

  const getAvailableSessionsForDrop = (): WorkoutSession[] => {
    return availableSessions.filter(session => 
      !events.some(event => event.sessionId === session.id)
    );
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // If dropping from session list to calendar
    if (source.droppableId === 'session-list' && destination.droppableId.startsWith('calendar-')) {
      const dateString = destination.droppableId.replace('calendar-', '');
      const session = availableSessions.find(s => s.id === draggableId);
      
      if (session) {
        const newEvent: Omit<CalendarEvent, 'id'> = {
          date: dateString,
          sessionId: session.id,
          session: session,
          completed: false
        };
        onEventAdd(newEvent);
      }
    }

    // If moving between calendar days
    if (source.droppableId.startsWith('calendar-') && destination.droppableId.startsWith('calendar-')) {
      const sourceDateString = source.droppableId.replace('calendar-', '');
      const destDateString = destination.droppableId.replace('calendar-', '');
      
      if (sourceDateString !== destDateString) {
        const event = events.find(e => e.id === draggableId);
        if (event) {
          onEventUpdate({
            ...event,
            date: destDateString
          });
        }
      }
    }
  };

  const renderCalendarTile = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;

    const dayEvents = getEventsForDate(date);
    
    return (
      <div className="calendar-day-content">
        <Droppable droppableId={`calendar-${getDateString(date)}`}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`calendar-events ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
            >
              {dayEvents.map((event, index) => (
                <Draggable
                  key={event.id}
                  draggableId={event.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`calendar-event ${snapshot.isDragging ? 'dragging' : ''} ${
                        event.completed ? 'completed' : ''
                      }`}
                      onClick={() => handleEventClick(event)}
                    >
                      <span className="text-xs truncate">
                        {event.session.name}
                      </span>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    );
  };

  const handleEventClick = (event: CalendarEvent) => {
    // Toggle completion status
    onEventUpdate({
      ...event,
      completed: !event.completed
    });
  };

  const handleDateChange = (value: unknown) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      setSelectedDate(value[0]);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
              Calendario de Entrenamientos
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-violet-600 rounded-full"></div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSessionList(!showSessionList)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                showSessionList
                  ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 backdrop-blur-xl'
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Entrenamientos</span>
            </button>
            <div className="flex rounded-xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl">
              <button
                onClick={() => setCalendarView('month')}
                className={`px-6 py-3 text-sm font-medium transition-all ${
                  calendarView === 'month'
                    ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Mes
              </button>
              <button
                onClick={() => setCalendarView('week')}
                className={`px-6 py-3 text-sm font-medium border-l border-white/10 transition-all ${
                  calendarView === 'week'
                    ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Semana
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Session List (Draggable) */}
          {showSessionList && (
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                    <Target className="h-5 w-5 text-blue-400" />
                    <span>Entrenamientos Disponibles</span>
                  </h3>
                </div>
                <div className="p-6">
                  <Droppable droppableId="session-list">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-32 ${
                          snapshot.isDraggingOver ? 'bg-blue-500/10 rounded-xl' : ''
                        }`}
                      >
                        {getAvailableSessionsForDrop().map((session, index) => (
                          <Draggable
                            key={session.id}
                            draggableId={session.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-4 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 ${
                                  snapshot.isDragging
                                    ? 'bg-gradient-to-r from-blue-500 to-violet-600 shadow-lg shadow-blue-500/50 border border-blue-400'
                                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                                }`}
                              >
                                <h4 className="font-semibold text-sm text-white mb-2">
                                  {session.name}
                                </h4>
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{session.estimatedDuration}m</span>
                                  </div>
                                  <span className="px-2 py-1 bg-white/10 rounded-md text-xs">
                                    {session.type}
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {getAvailableSessionsForDrop().length === 0 && (
                          <p className="text-sm text-gray-400 text-center py-8">
                            No hay sesiones disponibles.
                            Crea sesiones de entrenamiento primero.
                          </p>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            </div>
          )}

          {/* Calendar */}
          <div className={showSessionList ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <CalendarIcon className="h-5 w-5 text-violet-400" />
                  <span>Calendario</span>
                </h3>
              </div>
              <div className="p-6">
                <div className="calendar-container bg-white/5 rounded-xl p-4">
                  <Calendar
                    onChange={handleDateChange}
                    value={selectedDate}
                    view={calendarView === 'month' ? 'month' : 'month'}
                    tileContent={renderCalendarTile}
                    className="workout-calendar"
                  />
                </div>

                {/* Legend */}
                <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                  <h4 className="text-sm font-semibold text-white mb-3">Leyenda</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500/20 border border-blue-500/50 rounded"></div>
                      <span className="text-gray-400">Programado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-emerald-500/20 border border-emerald-500/50 rounded"></div>
                      <span className="text-gray-400">Completado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500/20 border border-orange-500/50 rounded"></div>
                      <span className="text-gray-400">Hoy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-dashed border-white/30 rounded"></div>
                      <span className="text-gray-400">Zona de Drop</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Date Info */}
        {selectedDate && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {formatDate(selectedDate)}
                  {isSameDay(selectedDate, new Date()) && (
                    <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Today
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getEventsForDate(selectedDate).length > 0 ? (
                  <div className="space-y-3">
                    {getEventsForDate(selectedDate).map((event) => (
                      <div
                        key={event.id}
                        className={`p-4 border rounded-lg ${
                          event.completed
                            ? 'bg-green-50 border-green-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {event.session.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {event.session.exercises.length} exercises • {event.session.estimatedDuration} minutes
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant={event.completed ? "outline" : "default"}
                              onClick={() => handleEventClick(event)}
                            >
                              {event.completed ? 'Mark Incomplete' : 'Mark Complete'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => onEventDelete(event.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">
                    No workouts scheduled for this day.
                    {showSessionList 
                      ? " Drag a workout from the left panel to schedule it."
                      : " Click 'Add Workouts' to schedule a session."
                    }
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <style jsx>{`
        .calendar-day-content {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 80px;
        }

        .calendar-events {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 2px;
          min-height: 20px;
        }

        .calendar-events.drag-over {
          background-color: rgba(59, 130, 246, 0.1);
          border: 2px dashed #3b82f6;
        }

        .calendar-event {
          background-color: #dbeafe;
          border: 1px solid #93c5fd;
          border-radius: 4px;
          padding: 2px 4px;
          margin-bottom: 2px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .calendar-event:hover {
          background-color: #bfdbfe;
          border-color: #60a5fa;
        }

        .calendar-event.completed {
          background-color: #dcfce7;
          border-color: #86efac;
        }

        .calendar-event.dragging {
          transform: rotate(5deg);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .workout-calendar {
          width: 100%;
        }

        .workout-calendar .react-calendar__tile {
          position: relative;
          padding: 4px;
          height: auto;
          min-height: 80px;
        }

        .workout-calendar .react-calendar__tile--now {
          background: #fef3c7;
        }

        .workout-calendar .react-calendar__tile--active {
          background: #dbeafe;
          color: #1e40af;
        }
      `}</style>
    </DragDropContext>
  );
}
