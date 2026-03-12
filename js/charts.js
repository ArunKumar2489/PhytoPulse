/**
 * charts.js
 * Handles the historical analytics visualization for PhytoPulse.
 * Visualizes Biosignal, Temperature, and Moisture trends over time.
 */

class AnalyticsDashboard {
    constructor() {
        this.charts = {};
        this.currentRange = 'daily';
        this.initCharts();
    }

    getGradient(ctx, color) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        if (color === 'blue') {
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        } else if (color === 'orange') {
            gradient.addColorStop(0, 'rgba(249, 115, 22, 0.4)');
            gradient.addColorStop(1, 'rgba(249, 115, 22, 0)');
        } else if (color === 'teal') {
            gradient.addColorStop(0, 'rgba(20, 184, 166, 0.4)');
            gradient.addColorStop(1, 'rgba(20, 184, 166, 0)');
        }
        return gradient;
    }

    getMockData(range) {
        const datasets = {
            daily: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'],
                biosignal: [300, 350, 420, 380, 450, 410, 430],
                temp: [22, 21, 24, 28, 27, 24, 23],
                moisture: [65, 64, 62, 60, 58, 57, 56]
            },
            weekly: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                biosignal: [400, 420, 380, 450, 500, 480, 460],
                temp: [24, 25, 26, 24, 23, 22, 24],
                moisture: [70, 68, 65, 62, 60, 58, 55]
            },
            monthly: {
                labels: ['W1', 'W2', 'W3', 'W4'],
                biosignal: [350, 450, 480, 420],
                temp: [22, 24, 26, 23],
                moisture: [75, 70, 65, 60]
            }
        };
        return datasets[range] || datasets.daily;
    }

    initCharts() {
        const data = this.getMockData('daily');
        const config = (ctx, label, color, initialData) => ({
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: label,
                    data: initialData,
                    borderColor: color === 'blue' ? '#3b82f6' : color === 'orange' ? '#f97316' : '#14b8a6',
                    backgroundColor: this.getGradient(ctx, color),
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#64748b', font: { size: 10 } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#64748b', font: { size: 10 } }
                    }
                }
            }
        });

        const ctxBio = document.getElementById('biosignal-trend-chart').getContext('2d');
        const ctxTemp = document.getElementById('temp-trend-chart').getContext('2d');
        const ctxMoist = document.getElementById('moisture-trend-chart').getContext('2d');

        this.charts.bio = new Chart(ctxBio, config(ctxBio, 'Biosignal (mV)', 'blue', data.biosignal));
        this.charts.temp = new Chart(ctxTemp, config(ctxTemp, 'Temp (°C)', 'orange', data.temp));
        this.charts.moist = new Chart(ctxMoist, config(ctxMoist, 'Moisture (%)', 'teal', data.moisture));
    }

    updateRange(range) {
        this.currentRange = range;
        const data = this.getMockData(range);
        
        ['bio', 'temp', 'moist'].forEach(key => {
            const chart = this.charts[key];
            chart.data.labels = data.labels;
            chart.data.datasets[0].data = key === 'bio' ? data.biosignal : key === 'temp' ? data.temp : data.moisture;
            chart.update();
        });
    }

    /**
     * exportToCSV
     * Converts an array of data objects to CSV and triggers a download.
     */
    exportToCSV(dataArray) {
        if (!dataArray || !dataArray.length) return;

        const headers = ['Timestamp', 'Biosignal', 'Temperature', 'Moisture'];
        const csvRows = [headers.join(',')];

        dataArray.forEach(row => {
            csvRows.push([
                `"${row.timestamp}"`,
                row.biosignal,
                row.temperature,
                row.moisture
            ].join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.setAttribute('href', url);
        link.setAttribute('download', `PhytoPulse_Export_${date}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    handleExport() {
        const data = this.getMockData(this.currentRange);
        const exportData = data.labels.map((label, index) => ({
            timestamp: label,
            biosignal: data.biosignal[index],
            temperature: data.temp[index],
            moisture: data.moisture[index]
        }));

        this.exportToCSV(exportData);
    }
}

// Global scope for the onclick handler
window.analytics = new AnalyticsDashboard();

/**
 * ElectrophysiologyMonitor
 * Renders a high-frequency (10Hz) scrolling waveform to mimic 
 * medical-grade ECG equipment for plant electrophysiology.
 */
class ElectrophysiologyMonitor {
    constructor(canvasId) {
        this.ctx = document.getElementById(canvasId);
        if (!this.ctx) return;

        this.maxPoints = 100;
        this.dataPoints = Array(this.maxPoints).fill(0);
        this.labels = Array(this.maxPoints).fill('');
        this.annotations = {};
        this.lastValue = 0;
        
        this.chart = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels: this.labels,
                datasets: [{
                    label: 'Voltage (mV)',
                    data: this.dataPoints,
                    borderColor: '#64ffda', // Tech Green / Neon Blue
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.3,
                    fill: false,
                    segment: {
                        borderColor: ctx => ctx.p0.parsed.y > 600 ? '#ef4444' : '#64ffda'
                    }
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false, // Performance: crucial for 10Hz
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                    annotation: {
                        annotations: this.annotations
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Time (ms)', color: '#64748b' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { display: false }
                    },
                    y: {
                        title: { display: true, text: 'Voltage (mV)', color: '#64748b' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#64748b' },
                        min: 0,
                        max: 1000
                    }
                }
            }
        });

        this.startSimulation();
    }

    logEvent(type) {
        const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const value = Math.round(this.lastValue);
        
        // 1. Add Annotation to Chart
        const annotationId = `event-${Date.now()}`;
        this.annotations[annotationId] = {
            type: 'line',
            xMin: this.maxPoints - 1,
            xMax: this.maxPoints - 1,
            borderColor: type === 'Add Water' ? '#3b82f6' : type === 'Touch Plant' ? '#a855f7' : '#eab308',
            borderWidth: 2,
            label: {
                display: true,
                content: type,
                position: 'start',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: '#fff',
                font: { size: 10 }
            }
        };

        // 2. Add Row to Table
        const logBody = document.getElementById('event-log-body');
        const container = document.getElementById('event-log-container');
        
        const row = document.createElement('tr');
        row.className = 'border-b border-white/5 animate-fade-in';
        row.innerHTML = `
            <td class="py-2 text-slate-500">${timestamp}</td>
            <td class="py-2 font-medium text-slate-300">${type}</td>
            <td class="py-2 text-right text-brand-light font-mono">${value} mV</td>
        `;
        
        logBody.appendChild(row);
        
        // Auto scroll to bottom
        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
        });

        this.chart.update('none');

        // Cleanup old annotations to prevent memory/render bloat
        setTimeout(() => {
            delete this.annotations[annotationId];
            this.chart.update('none');
        }, 10000); // Remove marker after 10 seconds of scroll
    }

    updateWaveform(dataPoint) {
        this.lastValue = dataPoint;
        this.dataPoints.push(dataPoint);
        if (this.dataPoints.length > this.maxPoints) {
            this.dataPoints.shift();
            
            // Shift annotations
            Object.keys(this.annotations).forEach(id => {
                this.annotations[id].xMin -= 1;
                this.annotations[id].xMax -= 1;
                if (this.annotations[id].xMin < 0) {
                    delete this.annotations[id];
                }
            });
        }
        this.chart.update('none'); // Efficient update without animation
    }

    startSimulation() {
        let t = 0;
        setInterval(() => {
            const dataPoint = this.generateMockWaveform(t);
            this.updateWaveform(dataPoint);
            t += 0.1;
        }, 100); // 10Hz frequency
    }

    generateMockWaveform(t) {
        // Complex signal: Base sine + fast modulation + random cellular noise
        const base = 400;
        const sine1 = Math.sin(t * 2) * 100;
        const sine2 = Math.sin(t * 15) * 30;
        const noise = (Math.random() - 0.5) * 40;
        
        // Occasional biopotential "spike" (simulating cellular firing)
        const spike = Math.random() > 0.98 ? 300 : 0;
        
        return Math.max(0, Math.min(1000, base + sine1 + sine2 + noise + spike));
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.epMonitor = new ElectrophysiologyMonitor('waveform-chart');
    window.impactAnalysis = new EnvironmentalImpactAnalysis('correlation-scatter-chart');
});

function updateTimeRange(range, btn) {
    // Update Button UI
    document.querySelectorAll('.time-range-btn').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');

    // Update charts
    window.analytics.updateRange(range);
}

/**
 * EnvironmentalImpactAnalysis
 * Handles scatter plots and Pearson correlation calculation.
 */
class EnvironmentalImpactAnalysis {
    constructor(canvasId) {
        this.ctx = document.getElementById(canvasId);
        if (!this.ctx) return;

        this.currentFactor = 'temp';
        this.chart = null;
        this.initChart();
    }

    /**
     * Pearson Correlation Coefficient Calculation
     * Formula: r = Σ((x - x̄)(y - ȳ)) / sqrt(Σ(x - x̄)² * Σ(y - ȳ)²)
     */
    calculateCorrelation(x, y) {
        const n = x.length;
        if (n !== y.length || n === 0) return 0;

        const meanX = x.reduce((a, b) => a + b) / n;
        const meanY = y.reduce((a, b) => a + b) / n;

        let num = 0;
        let denX = 0;
        let denY = 0;

        for (let i = 0; i < n; i++) {
            const dx = x[i] - meanX;
            const dy = y[i] - meanY;
            num += dx * dy;
            denX += dx * dx;
            denY += dy * dy;
        }

        const denominator = Math.sqrt(denX * denY);
        return denominator === 0 ? 0 : num / denominator;
    }

    getScatterData(factor) {
        // Generate realistic mock data for scatter plot
        const points = [];
        const xValues = [];
        const yValues = [];
        const count = 50;

        for (let i = 0; i < count; i++) {
            let x, y;
            if (factor === 'temp') {
                x = 20 + Math.random() * 15; // 20-35 degC
                // Positive correlation: as temp rises, bio-signal increases (simulated)
                y = 100 + (x * 10) + (Math.random() - 0.5) * 100;
            } else if (factor === 'humidity') {
                x = 40 + Math.random() * 40; // 40-80%
                // Slight negative correlation or erratic
                y = 500 - (x * 2) + (Math.random() - 0.5) * 200;
            } else {
                x = 10 + Math.random() * 80; // 10-90% moisture
                // Strong positive correlation
                y = 50 + (x * 8) + (Math.random() - 0.5) * 50;
            }
            points.push({ x, y });
            xValues.push(x);
            yValues.push(y);
        }

        return { points, xValues, yValues };
    }

    initChart() {
        const dataSet = this.getScatterData(this.currentFactor);
        const r = this.calculateCorrelation(dataSet.xValues, dataSet.yValues);
        
        document.getElementById('correlation-coefficient').innerText = r.toFixed(3);

        this.chart = new Chart(this.ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Impact Points',
                    data: dataSet.points,
                    backgroundColor: 'rgba(100, 255, 218, 0.5)',
                    borderColor: '#64ffda',
                    borderWidth: 1,
                    pointRadius: 5,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        title: { 
                            display: true, 
                            text: this.getFactorLabel(this.currentFactor),
                            color: '#64748b'
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#64748b' }
                    },
                    y: {
                        title: { 
                            display: true, 
                            text: 'Bio-Signal (mV)',
                            color: '#64748b'
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#64748b' }
                    }
                }
            }
        });
    }

    getFactorLabel(factor) {
        if (factor === 'temp') return 'Temperature (°C)';
        if (factor === 'humidity') return 'Humidity (%)';
        return 'Soil Moisture (%)';
    }

    updateFactor(factor, btn) {
        // Update Button UI
        document.querySelectorAll('.factor-toggle-btn').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');

        this.currentFactor = factor;
        const dataSet = this.getScatterData(factor);
        const r = this.calculateCorrelation(dataSet.xValues, dataSet.yValues);
        
        document.getElementById('correlation-coefficient').innerText = r.toFixed(3);

        this.chart.data.datasets[0].data = dataSet.points;
        this.chart.options.scales.x.title.text = this.getFactorLabel(factor);
        this.chart.update();
    }
}
