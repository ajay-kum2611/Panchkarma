import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProgressChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No progress data available yet</p>
      </div>
    );
  }

  const sessions = data.map(item => `Session ${item.sessionNumber}`);
  const ratings = data.map(item => item.rating);
  const energyLevels = data.map(item => item.energyLevel || 0);
  const painLevels = data.map(item => item.painLevel || 0);
  const sleepQuality = data.map(item => item.sleepQuality || 0);
  const mood = data.map(item => item.mood || 0);

  const lineChartData = {
    labels: sessions,
    datasets: [
      {
        label: 'Overall Rating',
        data: ratings,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Energy Level',
        data: energyLevels,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Sleep Quality',
        data: sleepQuality,
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Mood',
        data: mood,
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const painChartData = {
    labels: sessions,
    datasets: [
      {
        label: 'Pain Level (Lower is Better)',
        data: painLevels,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const painOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Overall Progress Line Chart */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Overall Progress</h3>
        <div className="h-64">
          <Line data={lineChartData} options={options} />
        </div>
      </div>

      {/* Pain Level Bar Chart */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pain Level Reduction</h3>
        <div className="h-64">
          <Bar data={painChartData} options={painOptions} />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '0'}
          </div>
          <div className="text-sm text-blue-600">Average Rating</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {energyLevels.length > 0 ? (energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length).toFixed(1) : '0'}
          </div>
          <div className="text-sm text-green-600">Avg Energy Level</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {sleepQuality.length > 0 ? (sleepQuality.reduce((a, b) => a + b, 0) / sleepQuality.length).toFixed(1) : '0'}
          </div>
          <div className="text-sm text-purple-600">Avg Sleep Quality</div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">
            {painLevels.length > 0 ? (painLevels.reduce((a, b) => a + b, 0) / painLevels.length).toFixed(1) : '0'}
          </div>
          <div className="text-sm text-red-600">Avg Pain Level</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;
