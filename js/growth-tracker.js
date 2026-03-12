/**
 * growth-tracker.js
 * Handles image uploads, stage tracking, and growth rate prediction.
 */
class GrowthTracker {
    constructor() {
        this.stages = ['Germination', 'Vegetative', 'Flowering', 'Fruiting'];
        this.initDOMElements();
        this.bindEvents();
        this.listenToStore();
    }

    initDOMElements() {
        this.elForm = document.getElementById('growth-upload-form');
        this.elImageInput = document.getElementById('growth-image-input');
        this.elStageInput = document.getElementById('growth-stage-input');
        this.elPreview = document.getElementById('image-preview');
        this.elPreviewContainer = document.getElementById('image-preview-container');
        this.elPlaceholder = document.getElementById('upload-placeholder');
        this.elTimeline = document.getElementById('growth-timeline-container');
        this.elGrowthRate = document.getElementById('predicted-growth-rate');
    }

    bindEvents() {
        // Handle Image Preview
        this.elImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.elPreview.src = event.target.result;
                    this.elPreviewContainer.classList.remove('hidden');
                    this.elPlaceholder.classList.add('hidden');
                };
                reader.readAsDataURL(file);
            }
        });

        // Handle Form Submission
        this.elForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const file = this.elImageInput.files[0];
            const stage = this.elStageInput.value;

            if (!file) {
                alert('Please select an image first.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const entry = {
                    image: event.target.result,
                    stage: stage
                };
                window.appStore.addGrowthEntry(entry);
                this.resetForm();
            };
            reader.readAsDataURL(file);
        });
    }

    listenToStore() {
        window.appStore.subscribe((state) => {
            this.renderTimeline(state.growthLog);
            this.updateGrowthRate(state.growthLog);
        });
    }

    resetForm() {
        this.elForm.reset();
        this.elPreview.src = '';
        this.elPreviewContainer.classList.add('hidden');
        this.elPlaceholder.classList.remove('hidden');
    }

    renderTimeline(logs) {
        if (!logs || logs.length === 0) {
            this.elTimeline.innerHTML = `
                <div class="flex flex-col items-center justify-center w-full text-slate-500 italic text-sm">
                    <p>No growth logs yet. Upload your first capture to start tracking.</p>
                </div>
            `;
            return;
        }

        // Sort by timestamp descending (newest first)
        const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);

        this.elTimeline.innerHTML = sortedLogs.map(log => `
            <div class="flex-shrink-0 w-48 glass-panel border border-white/10 rounded-xl overflow-hidden group hover:border-brand-light/30 transition-all">
                <div class="h-32 w-full overflow-hidden">
                    <img src="${log.image}" class="w-full h-full object-cover group-hover:scale-110 transition-duration-500">
                </div>
                <div class="p-3">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-[10px] text-brand-light font-bold uppercase tracking-wider">${log.stage}</span>
                        <span class="text-[9px] text-slate-500">${new Date(log.timestamp).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Calculates growth rate as change in stage level over a 7-day period.
     * Logic: (StageIndex_now - StageIndex_7daysAgo) / Days
     */
    predictGrowthRate(logs) {
        if (logs.length < 2) return '--';

        // Sort by timestamp ascending
        const sorted = [...logs].sort((a, b) => a.timestamp - b.timestamp);
        const latest = sorted[sorted.length - 1];
        
        // Find entry closest to 7 days ago
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        let reference = sorted[0];

        for (let i = sorted.length - 1; i >= 0; i--) {
            if (sorted[i].timestamp <= sevenDaysAgo) {
                reference = sorted[i];
                break;
            }
        }

        const stageNowIndex = this.stages.indexOf(latest.stage);
        const stageRefIndex = this.stages.indexOf(reference.stage);
        
        const timeDiffDays = (latest.timestamp - reference.timestamp) / (24 * 60 * 60 * 1000) || 1;
        const rate = (stageNowIndex - stageRefIndex) / timeDiffDays;

        if (rate === 0) return 'Stable';
        if (rate > 0) return `+${rate.toFixed(2)} stages/day`;
        return `${rate.toFixed(2)} stages/day`;
    }

    updateGrowthRate(logs) {
        const rate = this.predictGrowthRate(logs);
        this.elGrowthRate.innerText = rate;
    }
}

window.GrowthTracker = GrowthTracker;
