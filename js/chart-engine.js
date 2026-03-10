/**
 * chart-engine.js
 * Renders high-frequency waveform of AD8232 potential via Chart.js
 */

class BiopotentialChart {
    constructor(canvasId) {
        this.ctx = document.getElementById(canvasId);
        if (!this.ctx) return;

        this.maxPoints = 100;
        this.dataPoints = Array(this.maxPoints).fill(0);
        this.labels = Array(this.maxPoints).fill('');

        // Smoothing Window Buffer
        this.smoothingWindow = 5;
        this.rawBuffer = [];

        // Gradient for chart fill
        const gradient = this.ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(100, 255, 218, 0.5)'); // brand-light
        gradient.addColorStop(1, 'rgba(100, 255, 218, 0.0)');

        this.chart = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels: this.labels,
                datasets: [{
                    label: 'Biopotential (mV)',
                    data: this.dataPoints,
                    borderColor: '#64ffda',
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    fill: true,
                    backgroundColor: gradient,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 0 }, // For high frequency feel
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: { display: false },
                    y: {
                        display: true,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#94a3b8' }, // text-slate-400
                        suggestedMin: 0,
                        suggestedMax: 1000
                    }
                }
            }
        });

        // Listen for global state telemetry updates
        if (window.appStore) {
            window.appStore.subscribe((state) => this.onStateChange(state));
        }
    }

    onStateChange(state) {
        const voltage = parseFloat(state.telemetry.voltage);

        // Push to raw buffer
        this.rawBuffer.push(voltage);
        if (this.rawBuffer.length > this.smoothingWindow) {
            this.rawBuffer.shift();
        }

        // Calculate Simple Moving Average (SMA)
        const sum = this.rawBuffer.reduce((a, b) => a + b, 0);
        const smaVoltage = sum / this.rawBuffer.length;

        // Push smoothed value to visual chart data
        this.dataPoints.push(smaVoltage);
        if (this.dataPoints.length > this.maxPoints) {
            this.dataPoints.shift();
        }
        this.chart.update('none'); // Update without full animation for performance
    }
}

// Will be initialized in dashboard-init.js
