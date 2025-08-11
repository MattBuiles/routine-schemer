import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useExercises } from '@/hooks/useExercises';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Exercise } from '@/types';
import { Search, Filter, X } from 'lucide-react';

interface ExerciseLibraryProps {
  onExerciseSelect?: (exercise: Exercise) => void;
  selectedExercises?: Exercise[];
  mode?: 'view' | 'select';
}

export default function ExerciseLibrary({ 
  onExerciseSelect, 
  selectedExercises = [],
  mode = 'view' 
}: ExerciseLibraryProps) {
  const {
    exercises,
    filters,
    loading,
    error,
    updateFilters,
    clearFilters,
    getBodyParts,
    getEquipmentTypes
  } = useExercises();

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const bodyParts = getBodyParts();
  const equipmentTypes = getEquipmentTypes();

  useEffect(() => {
    updateFilters({ search: searchTerm });
  }, [searchTerm, updateFilters]);

  const handleExerciseClick = (exercise: Exercise) => {
    if (mode === 'select' && onExerciseSelect) {
      onExerciseSelect(exercise);
    }
  };

  const isExerciseSelected = (exercise: Exercise) => {
    return selectedExercises.some(selected => selected.id === exercise.id);
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Exercise Library</h1>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {(filters.bodyPart || filters.equipment) && (
              <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                {[filters.bodyPart, filters.equipment].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Active Filters */}
        {(filters.bodyPart || filters.equipment) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.bodyPart && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Body Part: {filters.bodyPart}
                <button
                  onClick={() => updateFilters({ bodyPart: undefined })}
                  className="ml-2 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.equipment && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Equipment: {filters.equipment}
                <button
                  onClick={() => updateFilters({ equipment: undefined })}
                  className="ml-2 hover:text-green-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-600"
            >
              Clear All
            </Button>
          </div>
        )}

        {/* Filter Panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body Part
                  </label>
                  <select
                    value={filters.bodyPart || ''}
                    onChange={(e) => updateFilters({ bodyPart: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Body Parts</option>
                    {bodyParts.map((bodyPart) => (
                      <option key={bodyPart} value={bodyPart}>
                        {bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipment
                  </label>
                  <select
                    value={filters.equipment || ''}
                    onChange={(e) => updateFilters({ equipment: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Equipment</option>
                    {equipmentTypes.map((equipment) => (
                      <option key={equipment} value={equipment}>
                        {equipment.charAt(0).toUpperCase() + equipment.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          {loading ? 'Loading...' : `${exercises.length} exercise${exercises.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Exercise Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No exercises found matching your criteria.</p>
          <Button onClick={clearFilters}>Clear Filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <Card
              key={exercise.id}
              className={`exercise-card cursor-pointer transition-all duration-200 ${
                mode === 'select' 
                  ? isExerciseSelected(exercise)
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:ring-2 hover:ring-blue-300'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => handleExerciseClick(exercise)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {exercise.name}
                  </h3>
                  {mode === 'select' && isExerciseSelected(exercise) && (
                    <div className="bg-blue-600 text-white rounded-full p-1">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Target:</span>
                    <span className="font-medium capitalize">{exercise.target}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Body Part:</span>
                    <span className="font-medium capitalize">{exercise.bodyPart}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Equipment:</span>
                    <span className="font-medium capitalize">{exercise.equipment}</span>
                  </div>
                </div>

                {exercise.gifUrl && (
                  <div className="mb-4">
                    <Image
                      src={exercise.gifUrl}
                      alt={exercise.name}
                      width={300}
                      height={128}
                      className="w-full h-32 object-cover rounded-md"
                      loading="lazy"
                    />
                  </div>
                )}

                {exercise.instructions && exercise.instructions.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Instructions:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {exercise.instructions.slice(0, 2).map((instruction, index) => (
                        <li key={index} className="line-clamp-2">
                          {index + 1}. {instruction}
                        </li>
                      ))}
                      {exercise.instructions.length > 2 && (
                        <li className="text-blue-600">
                          +{exercise.instructions.length - 2} more steps...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
