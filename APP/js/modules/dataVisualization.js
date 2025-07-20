import Chart from 'chart.js/auto';

export class DataVisualizer {
  constructor() {
    this.chartInstances = {};
  }

  createTrendChart(ctx, data, options = {}) {
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            tooltipFormat: 'MMM d'
          },
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: options.beginAtZero !== false
        }
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false
        },
        legend: {
          position: 'top'
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    };
    
    const config = {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: data.datasets.map(ds => ({
          ...ds,
          borderWidth: 2,
          tension: 0.3,
          fill: options.fill || false,
          pointRadius: 3,
          pointHoverRadius: 5
        }))
      },
      options: {...defaultOptions, ...options}
    };
    
    this.chartInstances[ctx.id] = new Chart(ctx, config);
    return this.chartInstances[ctx.id];
  }

  createRadarChart(ctx, data) {
    const chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: data.labels,
        datasets: [{
          label: data.label,
          data: data.values,
          backgroundColor: 'rgba(0, 200, 83, 0.2)',
          borderColor: 'rgba(0, 200, 83, 1)',
          pointBackgroundColor: 'rgba(0, 200, 83, 1)',
          pointBorderColor: '#fff',
          pointHoverRadius: 5,
          pointRadius: 3,
          borderWidth: 2
        }]
      },
      options: {
        scales: {
          r: {
            angleLines: {
              display: true
            },
            suggestedMin: 0,
            suggestedMax: 100
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
    
    this.chartInstances[ctx.id] = chart;
    return chart;
  }

  updateChart(chartId, newData) {
    const chart = this.chartInstances[chartId];
    if (chart) {
      chart.data.labels = newData.labels;
      chart.data.datasets.forEach((dataset, i) => {
        dataset.data = newData.datasets[i].data;
      });
      chart.update();
    }
  }

  destroyChart(chartId) {
    if (this.chartInstances[chartId]) {
      this.chartInstances[chartId].destroy();
      delete this.chartInstances[chartId];
    }
  }
}