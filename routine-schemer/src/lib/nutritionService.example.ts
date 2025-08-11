// Ejemplo de servicio de nutrición que podrías agregar

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  servingSize: string;
  brand?: string;
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number; // in ml
}

export interface DailyNutrition {
  date: string;
  foods: {
    foodId: string;
    quantity: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

class NutritionService {
  // Spoonacular API
  async searchFood(query: string): Promise<FoodItem[]> {
    // API call implementation
  }

  // USDA FoodData Central
  async getFoodDetails(foodId: string): Promise<FoodItem> {
    // API call implementation
  }

  // Calculate daily nutrition
  async calculateDailyNutrition(foods: any[]): Promise<DailyNutrition> {
    // Calculation logic
  }

  // AI-powered meal suggestions
  async getMealSuggestions(goals: NutritionGoals): Promise<FoodItem[]> {
    // AI API call (OpenAI, etc.)
  }
}

export const nutritionService = new NutritionService();
