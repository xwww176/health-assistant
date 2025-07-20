export class NutritionAnalyzer {
  constructor() {
    this.nutrientDB = {
      // 简化的食物营养数据库
      '鸡胸肉': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      '米饭': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
      '西兰花': { calories: 55, protein: 3.7, carbs: 11, fat: 0.6 },
      // 更多食物...
    };
  }

  analyze(meals) {
    const result = {
      total: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      byMeal: {},
      goals: {},
      balance: {}
    };
    
    // 计算总营养
    meals.forEach(meal => {
      const mealNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      
      meal.items.forEach(item => {
        const foodData = this.nutrientDB[item.name] || 
                        { calories: item.calories, protein: 0, carbs: 0, fat: 0 };
        
        const portionFactor = item.portion / 100; // 假设数据库是每100g
        
        mealNutrition.calories += foodData.calories * portionFactor;
        mealNutrition.protein += foodData.protein * portionFactor;
        mealNutrition.carbs += foodData.carbs * portionFactor;
        mealNutrition.fat += foodData.fat * portionFactor;
      });
      
      result.byMeal[meal.time] = mealNutrition;
      
      result.total.calories += mealNutrition.calories;
      result.total.protein += mealNutrition.protein;
      result.total.carbs += mealNutrition.carbs;
      result.total.fat += mealNutrition.fat;
    });
    
    // 计算与目标的比较
    const userProfile = JSON.parse(localStorage.getItem('userProfile'));
    if (userProfile) {
      result.goals = {
        calories: userProfile.calorieGoal,
        protein: userProfile.proteinGoal,
        carbs: userProfile.carbGoal,
        fat: userProfile.fatGoal
      };
      
      result.balance = {
        calories: result.total.calories - result.goals.calories,
        protein: result.total.protein - result.goals.protein,
        carbs: result.total.carbs - result.goals.carbs,
        fat: result.total.fat - result.goals.fat
      };
    }
    
    return result;
  }

  suggestMeal(remainingNutrition) {
    // 基于剩余营养目标推荐食物
    const suggestions = [];
    
    if (remainingNutrition.protein > 10) {
      suggestions.push({
        type: 'protein',
        foods: ['鸡胸肉', '三文鱼', '希腊酸奶'],
        message: `还需要约${Math.round(remainingNutrition.protein)}g蛋白质`
      });
    }
    
    if (remainingNutrition.carbs > 20) {
      suggestions.push({
        type: 'carbs',
        foods: ['糙米', '全麦面包', '红薯'],
        message: `还需要约${Math.round(remainingNutrition.carbs)}g碳水`
      });
    }
    
    return suggestions;
  }
}