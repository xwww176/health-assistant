export class DataManager {
  constructor() {
    this.storageKey = 'fitnessAppData';
    this.defaultData = {
      workouts: [],
      nutrition: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      },
      measurements: [],
      preferences: {}
    };
  }

  async init() {
    this.data = await this._loadData();
    return this.data;
  }

  async _loadData() {
    return new Promise(resolve => {
      chrome.storage.local.get([this.storageKey], result => {
        resolve(result[this.storageKey] || {...this.defaultData});
      });
    });
  }

  async _saveData() {
    return new Promise(resolve => {
      chrome.storage.local.set({ [this.storageKey]: this.data }, () => {
        resolve();
      });
    });
  }

  async addWorkout(workout) {
    workout.id = Date.now();
    workout.date = new Date().toISOString();
    this.data.workouts.unshift(workout);
    await this._saveData();
    return workout;
  }

  async addFood(mealType, foodItem) {
    foodItem.id = Date.now();
    foodItem.date = new Date().toISOString();
    this.data.nutrition[mealType].push(foodItem);
    await this._saveData();
    return foodItem;
  }

  async addMeasurement(type, value) {
    const measurement = {
      id: Date.now(),
      date: new Date().toISOString(),
      type,
      value
    };
    
    this.data.measurements.push(measurement);
    await this._saveData();
    return measurement;
  }

  async getRecentData(days = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return {
      workouts: this.data.workouts.filter(w => new Date(w.date) > cutoffDate),
      measurements: this.data.measurements.filter(m => new Date(m.date) > cutoffDate),
      nutrition: this.data.nutrition
    };
  }

  async exportData(format = 'json') {
    if (format === 'json') {
      return JSON.stringify(this.data, null, 2);
    } else if (format === 'csv') {
      // 简化的CSV转换逻辑
      let csv = 'Type,Date,Details\n';
      
      this.data.workouts.forEach(w => {
        csv += `Workout,${w.date},"${w.exercises.map(e => e.name).join(', ')}"\n`;
      });
      
      this.data.measurements.forEach(m => {
        csv += `Measurement,${m.date},${m.type}: ${m.value}\n`;
      });
      
      return csv;
    }
  }
}