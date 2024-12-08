import React, { useState, useEffect, useRef } from 'react';
import { 
    LineChart, 
    Line, 
    AreaChart, 
    Area,
    BarChart,
    Bar,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Legend
} from 'recharts';
import './ImpactVisualization.css';

const ImpactVisualization = ({ 
    impactData, 
    timeframe = '7d',
    onTimeframeChange,
    onMetricSelect
}) => {
    const [activeMetric, setActiveMetric] = useState('carbon');
    const [chartType, setChartType] = useState('area');
    const [aggregatedData, setAggregatedData] = useState([]);
    const chartRef = useRef(null);

    const metrics = {
        carbon: {
            label: 'Carbon Offset',
            unit: 'kg CO₂',
            color: '#34D399',
            icon: '🌱'
        },
        water: {
            label: 'Water Saved',
            unit: 'L',
            color: '#60A5FA',
            icon: '💧'
        },
        biodiversity: {
            label: 'Biodiversity Score',
            unit: 'points',
            color: '#F472B6',
            icon: '🦋'
        },
        energy: {
            label: 'Renewable Energy',
            unit: 'kWh',
            color: '#FBBF24',
            icon: '⚡'
        }
    };

    useEffect(() => {
        if (impactData) {
            processData();
        }
    }, [impactData, timeframe, activeMetric]);

    const processData = () => {
        const timeframeMap = {
            '24h': 24,
            '7d': 168,
            '30d': 720,
            '1y': 8760
        };

        const hours = timeframeMap[timeframe];
        const now = new Date();
        const data = [];

        // Generate time points
        for (let i = hours; i >= 0; i--) {
            const timestamp = new Date(now - i * 3600000);
            const dataPoint = {
                timestamp,
                [activeMetric]: 0,
                cumulative: 0
            };
            data.push(dataPoint);
        }

        // Aggregate impact data
        impactData.forEach(impact => {
            const impactTime = new Date(impact.timestamp);
            const dataPoint = data.find(d => 
                Math.abs(d.timestamp - impactTime) < 1800000
            );
            if (dataPoint) {
                dataPoint[activeMetric] += impact.metrics[activeMetric] || 0;
            }
        });

        // Calculate cumulative values
        let cumulative = 0;
        data.forEach(point => {
            cumulative += point[activeMetric];
            point.cumulative = cumulative;
        });

        setAggregatedData(data);
    };

    const formatXAxis = (timestamp) => {
        const date = new Date(timestamp);
        switch (timeframe) {
            case '24h':
                return date.toLocaleTimeString([], { hour: '2-digit' });
            case '7d':
                return date.toLocaleDateString([], { weekday: 'short' });
            case '30d':
                return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
            case '1y':
                return date.toLocaleDateString([], { month: 'short' });
            default:
                return '';
        }
    };

    const formatValue = (value) => {
        const metric = metrics[activeMetric];
        return `${value.toFixed(1)} ${metric.unit}`;
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null;

        return (
            <div className="impact-tooltip">
                <p className="tooltip-time">
                    {new Date(label).toLocaleString()}
                </p>
                <div className="tooltip-metrics">
                    <div className="tooltip-metric">
                        <span className="metric-icon">
                            {metrics[activeMetric].icon}
                        </span>
                        <span className="metric-label">
                            {metrics[activeMetric].label}:
                        </span>
                        <span className="metric-value">
                            {formatValue(payload[0].value)}
                        </span>
                    </div>
                    {payload[1] && (
                        <div className="tooltip-metric cumulative">
                            <span className="metric-label">Cumulative:</span>
                            <span className="metric-value">
                                {formatValue(payload[1].value)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderChart = () => {
        const ChartComponent = {
            area: AreaChart,
            line: LineChart,
            bar: BarChart
        }[chartType];

        const DataComponent = {
            area: Area,
            line: Line,
            bar: Bar
        }[chartType];

        return (
            <ResponsiveContainer width="100%" height={400}>
                <ChartComponent
                    data={aggregatedData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={formatXAxis}
                        stroke="var(--secondary-text)"
                    />
                    <YAxis
                        stroke="var(--secondary-text)"
                        tickFormatter={formatValue}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <DataComponent
                        type="monotone"
                        dataKey={activeMetric}
                        name={metrics[activeMetric].label}
                        stroke={metrics[activeMetric].color}
                        fill={metrics[activeMetric].color}
                        fillOpacity={0.1}
                    />
                    <DataComponent
                        type="monotone"
                        dataKey="cumulative"
                        name="Cumulative Impact"
                        stroke={metrics[activeMetric].color}
                        fill={metrics[activeMetric].color}
                        fillOpacity={0.05}
                        strokeDasharray="5 5"
                    />
                </ChartComponent>
            </ResponsiveContainer>
        );
    };

    return (
        <div className="impact-visualization">
            <div className="visualization-header">
                <div className="metric-selector">
                    {Object.entries(metrics).map(([key, metric]) => (
                        <button
                            key={key}
                            className={`metric-button ${activeMetric === key ? 'active' : ''}`}
                            onClick={() => {
                                setActiveMetric(key);
                                onMetricSelect?.(key);
                            }}
                        >
                            <span className="metric-icon">{metric.icon}</span>
                            <span className="metric-label">{metric.label}</span>
                        </button>
                    ))}
                </div>

                <div className="chart-controls">
                    <div className="timeframe-selector">
                        <select
                            value={timeframe}
                            onChange={(e) => onTimeframeChange?.(e.target.value)}
                        >
                            <option value="24h">24 Hours</option>
                            <option value="7d">7 Days</option>
                            <option value="30d">30 Days</option>
                            <option value="1y">1 Year</option>
                        </select>
                    </div>

                    <div className="chart-type-selector">
                        <button
                            className={`chart-type-button ${chartType === 'area' ? 'active' : ''}`}
                            onClick={() => setChartType('area')}
                            title="Area Chart"
                        >
                            📊
                        </button>
                        <button
                            className={`chart-type-button ${chartType === 'line' ? 'active' : ''}`}
                            onClick={() => setChartType('line')}
                            title="Line Chart"
                        >
                            📈
                        </button>
                        <button
                            className={`chart-type-button ${chartType === 'bar' ? 'active' : ''}`}
                            onClick={() => setChartType('bar')}
                            title="Bar Chart"
                        >
                            📊
                        </button>
                    </div>
                </div>
            </div>

            <div className="chart-container" ref={chartRef}>
                {renderChart()}
            </div>

            <div className="impact-summary">
                <div className="summary-metric total">
                    <span className="metric-icon">
                        {metrics[activeMetric].icon}
                    </span>
                    <div className="metric-details">
                        <span className="metric-label">Total Impact</span>
                        <span className="metric-value">
                            {formatValue(
                                aggregatedData[aggregatedData.length - 1]?.cumulative || 0
                            )}
                        </span>
                    </div>
                </div>

                <div className="summary-metric average">
                    <span className="metric-icon">📊</span>
                    <div className="metric-details">
                        <span className="metric-label">Average per Day</span>
                        <span className="metric-value">
                            {formatValue(
                                (aggregatedData[aggregatedData.length - 1]?.cumulative || 0) /
                                (timeframe === '24h' ? 1 : 
                                 timeframe === '7d' ? 7 : 
                                 timeframe === '30d' ? 30 : 365)
                            )}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImpactVisualization;
