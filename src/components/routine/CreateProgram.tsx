import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrainingSplit, TrainingGoal, TrainingProgram } from '@/types';
import { generateId } from '@/lib/utils';

const createProgramSchema = z.object({
  name: z.string().min(1, 'Program name is required'),
  description: z.string().optional(),
  split: z.enum(['full_body', 'upper_lower', 'push_pull_legs', 'body_part', 'custom']),
  goal: z.enum(['muscle_gain', 'strength', 'fat_loss', 'endurance', 'general_fitness', 'sport_specific']),
});

type CreateProgramFormData = z.infer<typeof createProgramSchema>;

interface CreateProgramProps {
  onProgramCreated: (program: TrainingProgram) => void;
  onCancel: () => void;
}

export default function CreateProgram({ onProgramCreated, onCancel }: CreateProgramProps) {
  const [step, setStep] = useState(1);
  
  const form = useForm<CreateProgramFormData>({
    resolver: zodResolver(createProgramSchema),
    defaultValues: {
      name: '',
      description: '',
      split: 'full_body',
      goal: 'general_fitness',
    },
  });

  const splitOptions = [
    {
      value: 'full_body' as TrainingSplit,
      label: 'Full Body',
      description: 'Train all muscle groups in each session',
      frequency: '3x per week',
      icon: '🏋️'
    },
    {
      value: 'upper_lower' as TrainingSplit,
      label: 'Upper/Lower',
      description: 'Alternate between upper and lower body sessions',
      frequency: '4x per week',
      icon: '💪'
    },
    {
      value: 'push_pull_legs' as TrainingSplit,
      label: 'Push/Pull/Legs',
      description: 'Push movements, pull movements, and leg sessions',
      frequency: '6x per week',
      icon: '🔥'
    },
    {
      value: 'body_part' as TrainingSplit,
      label: 'Body Part Split',
      description: 'Focus on specific muscle groups each day',
      frequency: '5-6x per week',
      icon: '🎯'
    },
    {
      value: 'custom' as TrainingSplit,
      label: 'Custom Split',
      description: 'Create your own training schedule',
      frequency: 'Custom',
      icon: '⚙️'
    }
  ];

  const goalOptions = [
    {
      value: 'muscle_gain' as TrainingGoal,
      label: 'Muscle Gain',
      description: 'Build muscle mass and size',
      icon: '💪'
    },
    {
      value: 'strength' as TrainingGoal,
      label: 'Strength',
      description: 'Increase maximum strength',
      icon: '🦾'
    },
    {
      value: 'fat_loss' as TrainingGoal,
      label: 'Fat Loss',
      description: 'Lose body fat while maintaining muscle',
      icon: '🔥'
    },
    {
      value: 'endurance' as TrainingGoal,
      label: 'Endurance',
      description: 'Improve cardiovascular and muscular endurance',
      icon: '🏃'
    },
    {
      value: 'general_fitness' as TrainingGoal,
      label: 'General Fitness',
      description: 'Overall health and fitness improvement',
      icon: '✨'
    },
    {
      value: 'sport_specific' as TrainingGoal,
      label: 'Sport Specific',
      description: 'Training for specific sport performance',
      icon: '⚽'
    }
  ];

  const onSubmit = (data: CreateProgramFormData) => {
    const program = {
      id: generateId(),
      userId: 'current-user', // This would come from auth context
      name: data.name,
      description: data.description,
      split: data.split,
      goal: data.goal,
      mesocycles: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: false
    };

    onProgramCreated(program);
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create New Training Program</CardTitle>
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`w-12 h-1 ${
                        step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Program Details</h3>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Program Name *
                  </label>
                  <Input
                    id="name"
                    placeholder="e.g., Upper/Lower Strength Program"
                    {...form.register('name')}
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your training program goals and structure..."
                    {...form.register('description')}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={nextStep}>
                    Next: Select Training Goal
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Training Goal</h3>
                <p className="text-gray-600">What is your primary training goal?</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goalOptions.map((goal) => (
                    <label key={goal.value} className="cursor-pointer">
                      <input
                        type="radio"
                        value={goal.value}
                        {...form.register('goal')}
                        className="sr-only"
                      />
                      <div
                        className={`border-2 rounded-lg p-4 transition-all hover:border-blue-300 ${
                          form.watch('goal') === goal.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{goal.icon}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">{goal.label}</h4>
                            <p className="text-sm text-gray-600">{goal.description}</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Next: Select Training Split
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Training Split</h3>
                <p className="text-gray-600">Choose how you want to organize your workouts</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {splitOptions.map((split) => (
                    <label key={split.value} className="cursor-pointer">
                      <input
                        type="radio"
                        value={split.value}
                        {...form.register('split')}
                        className="sr-only"
                      />
                      <div
                        className={`border-2 rounded-lg p-4 transition-all hover:border-blue-300 ${
                          form.watch('split') === split.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">{split.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{split.label}</h4>
                            <p className="text-sm text-gray-600 mb-2">{split.description}</p>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {split.frequency}
                            </span>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <div className="space-x-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Create Program
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
