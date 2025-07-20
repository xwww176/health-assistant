export class UserProfile {
  constructor() {
    this.defaultProfile = {
      age: 25,
      height: 170,
      weight: 65,
      gender: 'male',
      activityLevel: 'moderate',
      fitnessGoal: 'maintenance',
      notifications: true,
      waterGoal: 2000,
      stepGoal: 8000
    };
  }

  async load() {
    this.profile = await this._getFromStorage() || this.defaultProfile;
    this._calculateDailyNeeds();
    return this.profile;
  }

  async update(updates) {
    this.profile = {...this.profile, ...updates};
    this._calculateDailyNeeds();
    await this._saveToStorage();
    return this.profile;
  }

  _calculateDailyNeeds() {
    // Harris-Benedict公式计算基础代谢率
    let bmr;
    if (this.profile.gender === 'male') {
      bmr = 88.362 + (13.397 * this.profile.weight) + 
            (4.799 * this.profile.height) - (5.677 * this.profile.age);
    } else {
      bmr = 447.593 + (9.247 * this.profile.weight) + 
            (3.098 * this.profile.height) - (4.330 * this.profile.age);
    }
    
    // 根据活动水平调整
    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    };
    
    const tdee = bmr * activityFactors[this.profile.activityLevel];
    
    // 根据目标调整
    const goalFactors = {
      loss: 0.8,
      maintenance: 1,
      gain: 1.2
    };
    
    this.profile.calorieGoal = Math.round(tdee * goalFactors[this.profile.fitnessGoal]);
    this.profile.proteinGoal = Math.round(this.profile.weight * 1.8); // g
    this.profile.carbGoal = Math.round((this.profile.calorieGoal * 0.4) / 4); // g
    this.profile.fatGoal = Math.round((this.profile.calorieGoal * 0.3) / 9); // g
  }

  async _getFromStorage() {
    return new Promise(resolve => {
      chrome.storage.sync.get(['userProfile'], result => {
        resolve(result.userProfile);
      });
    });
  }

  async _saveToStorage() {
    return new Promise(resolve => {
      chrome.storage.sync.set({ userProfile: this.profile }, () => {
        resolve();
      });
    });
  }
}