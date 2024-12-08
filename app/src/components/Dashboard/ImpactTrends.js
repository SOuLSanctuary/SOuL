import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import './ImpactTrends.css';

const ImpactTrends = ({ 
    data, 
    timeframe = '7d',
    loading = false,
    error = null
}) => {
    const chartData = useMemo(() => {
        if (!data || !data.length) return [];
        
        return data.map(entry => ({
            date: new Date(entry.timestamp).toLocaleDateString(),
            carbonOffset: parseFloat(entry.impact.carbonOffset.toFixed(2)),
            waterRetention: parseFloat(entry.impact.waterRetention.toFixed(2)),
            biodiversityScore: parseFloat(entry.impact.biodiversityScore.toFixed(2)),
            renewableEnergy: entry.impact.renewableEnergy ? 
                parseFloat(entry.impact.renewableEnergy.toFixed(2)) : 0
        }));
    }, [data]);

    const metrics = useMemo(() => [
        {
            key: 'carbonOffset',
            name: 'Carbon Offset',
            color: '#2ecc71',
            unit: 'kg'
        },
        {
            key: 'waterRetention',
            name: 'Water Retention',
            color: '#3498db',
            unit: 'L'
        },
        {
            key: 'biodiversityScore',
            name: 'Biodiversity Score',
            color: '#e67e22',
            unit: 'points'
        },
        {
            key: 'renewableEnergy',
            name: 'Renewable Energy',
            color: '#9b59b6',
            unit: 'kWh'
        }
    ], []);

    const calculateTrend = (metricKey) => {
        if (chartData.length < 2) return { direction: 'neutral', percentage: 0 };
        
        const latest = chartData[chartData.length - 1][metricKey];
        const previous = chartData[chartData.length - 2][metricKey];
        
        if (latest === previous) return { direction: 'neutral', percentage: 0 };
        
        const percentage = ((latest - previous) / previous) * 100;
        return {
            direction: percentage > 0 ? 'positive' : 'negative',
            percentage: Math.abs(percentage)
        };
    };

    if (loading) {
        return (
            <div className="impact-trends loading">
                <div className="loading-spinner"></div>
                <p>Loading trend data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="impact-trends error">
                <p className="error-message">{error}</p>
            </div>
        );
    }

    if (!chartData.length) {
        return (
            <div className="impact-trends empty">
                <p>No trend data available for the selected timeframe.</p>
            </div>
        );
    }

    return (
        <div className="impact-trends">
            <div className="trends-header">
                <h3>Environmental Impact Trends</h3>
                <div className="metric-summary">
                    {metrics.map(metric => {
                        const trend = calculateTrend(metric.key);
                        return (
                            <div key={metric.key} className="metric-card">
                                <div className="metric-header">
                                    <span className="metric-name">{metric.name}</span>
                                    <span className={`trend-indicator ${trend.direction}`}>
                                        {trend.direction === 'positive' ? '↑' : 
                                         trend.direction === 'negative' ? '↓' : '→'}
                                        {trend.percentage > 0 && 
                                            ` ${trend.percentage.toFixed(1)}%`}
                                    </span>
                                </div>
                                <div className="metric-value">
                                    {chartData[chartData.length - 1][metric.key]}
                                    <span className="metric-unit">{metric.unit}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return timeframe === '24h' ? 
                                    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                                    date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                            }}
                        />
                        <YAxis />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                border: 'none',
                                borderRadius: '4px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            formatter={(value, name) => {
                                const metric = metrics.find(m => m.key === name);
                                return [`${value} ${metric.unit}`, metric.name];
                            }}
                        />
                        <Legend />
                        {metrics.map(metric => (
                            <Line
                                key={metric.key}
                                type="monotone"
                                dataKey={metric.key}
                                name={metric.name}
                                stroke={metric.color}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="trends-footer">
                <div className="timeframe-info">
                    <span>Showing data for: </span>
                    <strong>
                        {timeframe === '24h' ? 'Last 24 Hours' :
                         timeframe === '7d' ? 'Last 7 Days' :
                         timeframe === '30d' ? 'Last 30 Days' : 'All Time'}
                    </strong>
                </div>
            </div>
        </div>
    );
};

export default ImpactTrends;
