/**
 * ai-doctor.js
 * Embedded AI Chat Interface with knowledge graph and persistence.
 */

// Generic Knowledge Graph extended for 4 distinct stress states across 4 crops
const BaseActions = {
    "SEVERE_DEHYDRATION": { cause: "Osmotic potential collapse causing wilting and stomatal closure.", action: "Apply systematic drip irrigation immediately. Supplement with 0.5% Potassium foliar spray to restore stomatal regulation." },
    "ANOXIC_STRESS": { cause: "Prolonged waterlogging restricts root respiration, increasing ethanol production and root tissue necrosis.", action: "Cease irrigation. Apply hydrogen peroxide (3% solution diluted 1:10) to root zone to oxygenate. Improve soil drainage immediately." },
    "HIGH_ACTIVITY": { cause: "Biopotential signal variance exceeds 20% threshold. Rapid ion flux indicates immediate metabolic stress response.", action: "Monitor closely. Increase calcium availability to stabilize membrane potential and regulate stomatal guard cells." },
    "RESOURCE_DEPLETION": { cause: "Progressive soil moisture reduction with stagnant electrophysiology implies stalled transpiration stream.", action: "Initiate micro-pulse irrigation to restore hydraulic conductivity without shocking the root cortex." },
    "DROUGHT_STRESS_DETECTED": { cause: "Critical soil moisture levels (<20%) combined with erratic bio-potential fluctuations indicate severe desiccation and structural cellular damage.", action: "Immediate deep-root hydration therapy. Apply organic wetting agents to enhance soil absorption capability. Avoid direct sunlight / high temperatures if in a controlled environment." }
};

const KNOWLEDGE_GRAPH = {
    "Tomato": BaseActions,
    "Rice": BaseActions,
    "Aloe Vera": BaseActions,
    "Corn": BaseActions
};

class AIDoctor {
    constructor() {
        this.chatContainer = document.getElementById('chat-container');
        this.input = document.getElementById('chat-input');

        // Load chat history for tab persistence
        this.chatHistory = JSON.parse(localStorage.getItem('phyto_chat_hist') || '[]');
        this.lastDiagnostic = localStorage.getItem('phyto_last_diag');

        // Render previously saved history
        if (this.chatContainer) {
            this.chatContainer.innerHTML = '';
            if (this.chatHistory.length === 0) {
                const initCrop = window.appStore ? window.appStore.state.crop : 'Tomato';
                this.addMessage('AI', `System initialized. Monitoring incoming telemetry for <strong class="text-brand-light">${initCrop}</strong>. Waiting for anomalies...`);
            } else {
                this.chatHistory.forEach(msg => {
                    this._renderMessage(msg.sender, msg.text, msg.isProtocol);
                });
            }
        }

        if (window.appStore) {
            window.appStore.subscribe(state => this.onStateChange(state));
        }
    }

    addMessage(sender, text, isProtocol = false) {
        this.chatHistory.push({ sender, text, isProtocol });
        localStorage.setItem('phyto_chat_hist', JSON.stringify(this.chatHistory));
        this._renderMessage(sender, text, isProtocol);
    }

    _renderMessage(sender, text, isProtocol) {
        if (!this.chatContainer) return;

        const div = document.createElement('div');
        div.className = 'flex items-start gap-3 animate-fade-in-up';

        let senderHtml = '';
        let bubbleHtml = '';

        if (sender === 'AI') {
            senderHtml = `<div class="w-8 h-8 rounded-full bg-brand-800 border border-brand-light/30 flex items-center justify-center shrink-0"><span class="text-brand-light text-xs font-bold">AI</span></div>`;
            if (isProtocol) {
                bubbleHtml = `
                    <div class="bg-brand-900 border border-brand-accent/50 rounded-2xl p-4 w-full shadow-[0_0_15px_rgba(74,222,128,0.1)]">
                        <div class="flex items-center gap-2 text-brand-accent mb-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span class="font-bold text-xs uppercase tracking-wider">Treatment Protocol Generated</span>
                        </div>
                        <div class="text-slate-300 text-sm space-y-2">${text}</div>
                    </div>`;
            } else {
                bubbleHtml = `<div class="bg-brand-800/80 border border-white/5 rounded-2xl rounded-tl-sm p-3 text-slate-300"><p>${text}</p></div>`;
            }
        }

        div.innerHTML = senderHtml + bubbleHtml;
        this.chatContainer.appendChild(div);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    onStateChange(state) {
        const activeCrop = state.crop;
        const currentDiag = state.currentDiagnostic;

        if (currentDiag && currentDiag !== this.lastDiagnostic) {
            this.lastDiagnostic = currentDiag;
            localStorage.setItem('phyto_last_diag', currentDiag);

            const profile = KNOWLEDGE_GRAPH[activeCrop] && KNOWLEDGE_GRAPH[activeCrop][currentDiag];
            if (profile) {
                const diagName = currentDiag.replace('_', ' ');
                this.addMessage('AI', `Alert Received: <strong>${diagName}</strong> detected in ${activeCrop}. Executing biological knowledge graph query...`);

                setTimeout(() => {
                    const protocolHtml = `
                        <p><strong>Cellular Stress Analysis:</strong><br/>${profile.cause}</p>
                        <div class="h-px bg-white/10 my-2"></div>
                        <p><strong>Recommended Action:</strong><br/><span class="text-white">${profile.action}</span></p>
                    `;
                    this.addMessage('AI', protocolHtml, true);
                }, 1000); // Simulate processing time
            }
        } else if (!currentDiag && this.lastDiagnostic !== null) {
            this.lastDiagnostic = null;
            localStorage.removeItem('phyto_last_diag');
            this.addMessage('AI', "Metrics returned to nominal. Continuing automated monitoring.");
        }
    }
}
