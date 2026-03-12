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
    }
}

// Intialized in dashboard-init.js
