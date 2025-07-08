import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ComparisonChart = ({ portfolioResults, benchmarks }) => {
  if (!portfolioResults || portfolioResults.length === 0) return null;

  // Generate date range for chart
  const generateDateRange = (startDate, endDate) => {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = start; d <= end; d.setDate(d.getDate() + 30)) {
      dates.push(new Date(d).toISOString().split('T')[0]);
    }
    return dates;
  };

  const allDates = generateDateRange('2020-01-01', '2024-01-01');
  
  // Prepare chart data
  const datasets = [];
  
  // Portfolio assets
  portfolioResults.forEach((result, index) => {
    const data = allDates.map(date => {
      const pricePoint = result.priceData.find(p => p.date <= date);
      if (!pricePoint) return result.initialInvestment;
      
      const currentPrice = pricePoint.price;
      const buyPrice = result.priceData[0]?.price || 1;
      return (result.initialInvestment / buyPrice) * currentPrice;
    });

    datasets.push({
      label: result.asset.name,
      data,
      borderColor: result.asset.color,
      backgroundColor: `${result.asset.color}20`,
      borderWidth: 3,
      fill: false,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
    });
  });

  // Benchmarks
  if (benchmarks && benchmarks.length > 0) {
    benchmarks.forEach(benchmark => {
      const data = allDates.map(date => {
        const pricePoint = benchmark.priceData.find(p => p.date <= date);
        if (!pricePoint) return benchmark.initialInvestment;
        
        const currentPrice = pricePoint.price;
        const buyPrice = benchmark.priceData[0]?.price || 1;
        return (benchmark.initialInvestment / buyPrice) * currentPrice;
      });

      datasets.push({
        label: benchmark.benchmarkType,
        data,
        borderColor: benchmark.benchmarkType === 'S&P 500' ? '#6366f1' : '#f59e0b',
        backgroundColor: benchmark.benchmarkType === 'S&P 500' ? '#6366f120' : '#f59e0b20',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
      });
    });
  }

  const chartData = {
    labels: allDates.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    }),
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      title: {
        display: true,
        text: 'Portfolio Performance vs Benchmarks',
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#1f2937'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time Period',
          font: {
            size: 12,
            weight: '600'
          }
        },
        grid: {
          display: true,
          color: '#f3f4f6'
        },
        ticks: {
          maxTicksLimit: 8,
          font: {
            size: 11
          }
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Portfolio Value ($)',
          font: {
            size: 12,
            weight: '600'
          }
        },
        grid: {
          display: true,
          color: '#f3f4f6'
        },
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          },
          font: {
            size: 11
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 0,
        hoverRadius: 6,
        hitRadius: 10
      }
    }
  };

  return (
    <div className="h-96 w-full">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ComparisonChart;