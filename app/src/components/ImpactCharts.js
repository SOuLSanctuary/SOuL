import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#4CAF50', '#81C784', '#66BB6A', '#43A047', '#388E3C', '#2E7D32', '#1B5E20'];

function ImpactCharts({ activities, stats }) {
  // Prepare data for bar chart
  const barData = Object.entries(stats).map(([type, impact]) => ({
    name: type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    impact: parseFloat(impact.toFixed(2))
  }));

  // Prepare data for pie chart
  const pieData = barData.map(item => ({
    name: item.name,
    value: item.impact
  }));

  const containerStyle = {
    backgroundColor: '#1a1c20',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem'
  };

  const titleStyle = {
    color: '#4CAF50',
    marginBottom: '1.5rem',
    fontSize: '1.25rem'
  };

  return (
    <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
      <div style={containerStyle}>
        <h3 style={titleStyle}>Impact by Activity Type</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: '#888', fontSize: 12 }}
            />
            <YAxis tick={{ fill: '#888' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#282c34',
                border: '1px solid #4CAF50'
              }}
            />
            <Bar dataKey="impact" fill="#4CAF50" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={containerStyle}>
        <h3 style={titleStyle}>Impact Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#282c34',
                border: '1px solid #4CAF50'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ImpactCharts;
