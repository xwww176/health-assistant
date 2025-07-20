export class MuscleMap {
  constructor() {
    this.muscleGroups = {
      chest: { name: '胸部', intensity: 0 },
      back: { name: '背部', intensity: 0 },
      arms: { name: '手臂', intensity: 0 },
      abs: { name: '腹部', intensity: 0 },
      legs: { name: '腿部', intensity: 0 },
      shoulders: { name: '肩部', intensity: 0 }
    };
    
    this.exerciseMap = {
      '俯卧撑': ['chest', 'arms'],
      '引体向上': ['back', 'arms'],
      '深蹲': ['legs'],
      '平板支撑': ['abs', 'shoulders'],
      // 更多练习映射...
    };
  }

  update(exercises) {
    // 重置强度
    Object.keys(this.muscleGroups).forEach(key => {
      this.muscleGroups[key].intensity = 0;
    });
    
    // 计算每个肌肉群的训练强度
    exercises.forEach(exercise => {
      const groups = this.exerciseMap[exercise.name] || [];
      const intensity = exercise.sets ? exercise.sets * exercise.reps : exercise.duration;
      
      groups.forEach(group => {
        this.muscleGroups[group].intensity += intensity;
      });
    });
    
    // 标准化强度 (0-100)
    const maxIntensity = Math.max(...Object.values(this.muscleGroups).map(m => m.intensity));
    if (maxIntensity > 0) {
      Object.keys(this.muscleGroups).forEach(key => {
        this.muscleGroups[key].intensity = Math.round(
          (this.muscleGroups[key].intensity / maxIntensity) * 100
        );
      });
    }
    
    return this.muscleGroups;
  }

  render(svgElement) {
    // 使用SVG更新肌肉群颜色强度
    Object.keys(this.muscleGroups).forEach(key => {
      const element = svgElement.querySelector(`#${key}`);
      if (element) {
        const intensity = this.muscleGroups[key].intensity;
        const hue = 120 - (intensity * 1.2); // 从绿色到红色
        element.style.fill = `hsl(${hue}, 100%, 50%)`;
        element.style.opacity = intensity > 0 ? 0.3 + (intensity / 150) : 0.1;
      }
    });
  }
}