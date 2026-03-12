/**
 * diagnostics.js
 * Cross-Reference Diagnostic Engine
 * V > 800mV & M < 15% -> Severe Dehydration
 * V < 50mV & M > 95% -> Anoxic Stress (Root Rot)
 */

class DiagnosticsEngine {
    constructor() {
        this.elPlantStatus = null;
        this.elDiseaseType = null;
        this.elDiseaseContainer = null;
        this.elConfidenceBar = null;
        this.elConfidenceText = null;
        this.elSolutionsCard = null;
        this.elSolutionsList = null;

        document.addEventListener('DOMContentLoaded', () => {
            this.initElements();
        });

        if (window.appStore) {
            window.appStore.subscribe(state => this.analyze(state));
        }
    }

    initElements() {
        this.elPlantStatus = document.getElementById('diag-plant-status');
        this.elDiseaseType = document.getElementById('diag-disease-type');
        this.elDiseaseContainer = document.getElementById('diag-disease-container');
        this.elConfidenceBar = document.getElementById('diag-confidence-bar');
        this.elConfidenceText = document.getElementById('diag-confidence-text');
        this.elSolutionsCard = document.getElementById('diag-solutions-card');
        this.elSolutionsList = document.getElementById('diag-solutions-list');
    }

    getSolution(diseaseType) {
        const solutions = {
            'Leaf Blight': ['Remove infected leaves', 'Apply copper fungicide', 'Improve air circulation'],
            'Root Rot': ['Reduce watering', 'Improve soil drainage', 'Apply fungicide'],
            'Water Stress': ['Check irrigation schedule', 'Check for soil compaction', 'Add mulch'],
            'Nutrient Deficiency': ['Perform soil test', 'Apply balanced fertilizer', 'Adjust soil pH']
        };
        return solutions[diseaseType] || ['Monitor plant closely', 'Ensure optimal conditions'];
    }

    analyze(state) {
        const v = parseFloat(state.telemetry.voltage);
        const m = parseFloat(state.telemetry.moisture);

        let data = {
            plantStatus: 'Healthy',
            diseaseType: 'None',
            confidence: 98
        };

        if (v > 800 && m < 15) {
            data = {
                plantStatus: 'Disease',
                diseaseType: 'Leaf Blight',
                confidence: 85
            };
        } else if (v < 50 && m > 95) {
            data = {
                plantStatus: 'Disease',
                diseaseType: 'Root Rot',
                confidence: 92
            };
        } else if (m < 30) {
            data = {
                plantStatus: 'Stress',
                diseaseType: 'Water Stress',
                confidence: 78
            };
        }

        this.updateDiagnosticUI(data);
    }

    updateDiagnosticUI(data) {
        if (!this.elPlantStatus) return;

        // Update Status
        this.elPlantStatus.innerText = data.plantStatus;
        this.elPlantStatus.className = 'text-lg font-bold ' + 
            (data.plantStatus === 'Healthy' ? 'status-healthy' : 
             data.plantStatus === 'Stress' ? 'status-stress' : 'status-disease');

        // Update Disease Type Visibility
        if (data.plantStatus === 'Disease') {
            this.elDiseaseContainer.classList.remove('hidden');
            this.elDiseaseType.innerText = data.diseaseType;
        } else {
            this.elDiseaseContainer.classList.add('hidden');
        }

        // Update Confidence
        if (this.elConfidenceText) this.elConfidenceText.innerText = `${data.confidence}%`;
        if (this.elConfidenceBar) {
            this.elConfidenceBar.style.width = `${data.confidence}%`;
            
            // Dynamic Bar Color
            if (data.confidence > 80) this.elConfidenceBar.className = 'progress-bar bg-brand-light h-full transition-all duration-500';
            else if (data.confidence > 50) this.elConfidenceBar.className = 'progress-bar bg-brand-warning h-full transition-all duration-500';
            else this.elConfidenceBar.className = 'progress-bar bg-brand-danger h-full transition-all duration-500';
        }

        // Solutions Logic
        if (data.plantStatus === 'Disease' && this.elSolutionsCard && this.elSolutionsList) {
            this.elSolutionsCard.classList.remove('hidden');
            const solutions = this.getSolution(data.diseaseType);
            this.elSolutionsList.innerHTML = solutions.map(step => `
                <li class="flex items-start gap-3 text-slate-300 text-sm">
                    <span class="w-1.5 h-1.5 rounded-full bg-brand-accent mt-1.5 shrink-0"></span>
                    ${step}
                </li>
            `).join('');
        } else if (this.elSolutionsCard) {
            this.elSolutionsCard.classList.add('hidden');
        }

        // Trigger Alert System Check
        this.checkAlerts(data);
    }

    checkAlerts(data) {
        // Threshold constants
        const THRESHOLDS = {
            lowMoisture: 20,
            highTemp: 35,
            highBioPotential: 800
        };

        const activeAlerts = JSON.parse(localStorage.getItem('phyto_active_alerts') || '[]');
        
        // 1. Soil Moisture Check
        if (parseFloat(window.appStore.state.telemetry.moisture) < THRESHOLDS.lowMoisture) {
            this.triggerAlert('Low Soil Moisture', `Soil moisture dropped to ${window.appStore.state.telemetry.moisture}%. Irrigation required.`, 'warning');
        }

        // 2. Temperature Check
        if (parseFloat(window.appStore.state.telemetry.temp) > THRESHOLDS.highTemp) {
            this.triggerAlert('High Temperature', `Ambient temperature is ${window.appStore.state.telemetry.temp}°C. Heat stress suspected.`, 'danger');
        }

        // 3. Bio-Signal Anomaly
        if (data.plantStatus === 'Disease' && data.confidence > 90) {
            this.triggerAlert('Disease Detected', `${data.diseaseType} identified with ${data.confidence}% confidence.`, 'danger');
        }
    }

    triggerAlert(id, message, type) {
        // Prevent duplicate toasts for the same active alert
        const recentAlerts = JSON.parse(sessionStorage.getItem('phyto_recent_toasts') || '{}');
        const now = Date.now();
        
        if (recentAlerts[id] && (now - recentAlerts[id] < 60000)) return; // 1-minute cooldown per alert type

        recentAlerts[id] = now;
        sessionStorage.setItem('phyto_recent_toasts', JSON.stringify(recentAlerts));

        this.showToastAlert(id, message, type);
        this.sendEmailAlert(id, message);
    }

    showToastAlert(title, message, type) {
        const container = document.getElementById('alert-toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `glass-panel border ${type === 'danger' ? 'border-red-500/50' : 'border-yellow-500/50'} rounded-xl p-4 shadow-xl flex gap-4 items-start animate-fade-in-up mb-3 relative group`;
        
        const bgColor = type === 'danger' ? 'bg-red-500/20' : 'bg-yellow-500/20';
        const iconColor = type === 'danger' ? 'text-red-400' : 'text-yellow-400';

        toast.innerHTML = `
            <div class="p-2 ${bgColor} rounded-lg ${iconColor} shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
            </div>
            <div class="flex-1">
                <h4 class="text-white font-bold text-sm">${title}</h4>
                <p class="text-slate-400 text-xs mt-1">${message}</p>
            </div>
            <button onclick="this.parentElement.remove()" class="text-slate-500 hover:text-white transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;

        container.appendChild(toast);

        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 8000);
    }

    sendEmailAlert(type, message) {
        console.log(`%c[Email System] Notification Queued: ${type}`, 'color: #64ffda; font-weight: bold');
        console.log(`Message: ${message}`);
        console.log('Ready for EmailJS / SendGrid integration.');
    }
}

// Intialized in dashboard-init.js
