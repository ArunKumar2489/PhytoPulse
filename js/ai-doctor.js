/**
 * ai-doctor.js
 * AI Plant Doctor — Gemini-powered chatbot with live sensor context.
 * Automatic diagnostic alerts from the knowledge graph are preserved.
 */

// ── Gemini API Config ──────────────────────────────────────────────────────
const GEMINI_API_KEY = 'AIzaSyAJx-vp21Lr7s-RNIsE5FQzZIZcut3OHZM';
const GEMINI_ENDPOINT =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// ── Static Knowledge Graph (for auto-diagnostic alerts) ───────────────────
const BaseActions = {
    "SEVERE_DEHYDRATION":     { cause: "Osmotic potential collapse causing wilting and stomatal closure.", action: "Apply systematic drip irrigation immediately. Supplement with 0.5% Potassium foliar spray to restore stomatal regulation." },
    "ANOXIC_STRESS":          { cause: "Prolonged waterlogging restricts root respiration, increasing ethanol production and root tissue necrosis.", action: "Cease irrigation. Apply hydrogen peroxide (3% solution diluted 1:10) to root zone to oxygenate. Improve soil drainage immediately." },
    "HIGH_ACTIVITY":          { cause: "Biopotential signal variance exceeds 20% threshold. Rapid ion flux indicates immediate metabolic stress response.", action: "Monitor closely. Increase calcium availability to stabilize membrane potential and regulate stomatal guard cells." },
    "RESOURCE_DEPLETION":     { cause: "Progressive soil moisture reduction with stagnant electrophysiology implies stalled transpiration stream.", action: "Initiate micro-pulse irrigation to restore hydraulic conductivity without shocking the root cortex." },
    "DROUGHT_STRESS_DETECTED":{ cause: "Critical soil moisture levels (<20%) combined with erratic bio-potential fluctuations indicate severe desiccation.", action: "Immediate deep-root hydration therapy. Apply organic wetting agents to enhance soil absorption. Avoid direct sunlight / high temperatures." }
};

const KNOWLEDGE_GRAPH = {
    "Tomato":   BaseActions,
    "Rice":     BaseActions,
    "Aloe Vera":BaseActions,
    "Corn":     BaseActions,
    "Spinach":  BaseActions
};

// ── AIDoctor Class ─────────────────────────────────────────────────────────
class AIDoctor {
    constructor() {
        this.chatContainer = document.getElementById('chat-container');
        this.inputEl       = document.getElementById('chat-input');
        this.sendBtn       = document.getElementById('chat-send-btn');

        // FIX: Treat stored string "null" as actual null
        const storedDiag = localStorage.getItem('phyto_last_diag');
        this.lastDiagnostic = (storedDiag === 'null' || storedDiag === null) ? null : storedDiag;

        // Load persisted chat history — validate structure to avoid stale entries breaking rendering
        let rawHistory = [];
        try {
            rawHistory = JSON.parse(localStorage.getItem('phyto_chat_hist') || '[]');
            if (!Array.isArray(rawHistory)) rawHistory = [];
        } catch (_) { rawHistory = []; }
        this.chatHistory = rawHistory;

        // Render saved history or boot greeting
        if (this.chatContainer) {
            this.chatContainer.innerHTML = '';
            if (this.chatHistory.length === 0) {
                const initCrop = window.appStore ? window.appStore.state.crop : 'Tomato';
                this._addAndRender('AI',
                    `🌿 System online. Monitoring <strong class="text-brand-light">${initCrop}</strong>. Ask me anything about your plant's health, sensor readings, or care recommendations!`
                );
            } else {
                // Re-render each persisted message safely
                this.chatHistory.forEach(msg => {
                    this._renderMessage(
                        msg.sender    || 'AI',
                        msg.text      || '',
                        msg.isProtocol|| false,
                        msg.isUser    || false
                    );
                });
            }
        }

        // Subscribe to state changes for auto-diagnostics
        if (window.appStore) {
            window.appStore.subscribe(state => this.onStateChange(state));
        }

        // Wire up send events
        if (this.inputEl) {
            this.inputEl.addEventListener('keydown', e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleUserInput();
                }
            });
        }
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.handleUserInput());
        }
    }

    // ── Handle user sending a message ─────────────────────────────────────
    async handleUserInput() {
        if (!this.inputEl) return;
        const text = this.inputEl.value.trim();
        if (!text) return;

        this.inputEl.value = '';
        this.inputEl.disabled = true;
        if (this.sendBtn) this.sendBtn.disabled = true;

        // Show user bubble
        this._addAndRender('AI_USER', text, false, true);

        // Show typing indicator
        const typingId = this._showTypingIndicator();

        try {
            const reply = await this._callGemini(text);
            this._removeTypingIndicator(typingId);
            this._addAndRender('AI', reply);
        } catch (err) {
            console.error('[AI Doctor] Gemini error:', err);
            this._removeTypingIndicator(typingId);
            // Show a more descriptive error based on status
            const errMsg = err.message.includes('429')
                ? '⚠️ API quota reached. Please wait a moment and try again.'
                : '⚠️ Could not reach the AI. Check your internet connection and try again.';
            this._addAndRender('AI', errMsg);
        } finally {
            this.inputEl.disabled = false;
            if (this.sendBtn) this.sendBtn.disabled = false;
            this.inputEl.focus();
        }
    }

    // ── Gemini API Call ───────────────────────────────────────────────────
    async _callGemini(userMessage) {
        const context = this._buildSensorContext();

        const systemPrompt = `You are PhytoPulse AI Plant Doctor, a specialised assistant embedded inside the PhytoPulse IoT crop-monitoring dashboard.

STRICT RULES — follow these exactly:
1. You ONLY answer questions related to the plant and sensor data shown below. Topics you can address: plant health, crop care, disease diagnosis, irrigation, temperature/humidity recommendations, soil moisture, growth stages, pest/disease treatment, and the specific readings from the dashboard sensors.
2. If the user asks ANYTHING unrelated to the current crop, plant care, or the PhytoPulse sensor data (e.g. coding, weather elsewhere, general knowledge, sports, politics, etc.), respond ONLY with: "I can only assist with questions about your monitored crop and sensor data. Please ask about plant health, diseases, or care recommendations."
3. Always base your advice on the LIVE SENSOR DATA provided below. Reference the actual numbers in your reply where relevant.
4. Keep answers to 2–4 sentences. Be specific and actionable.

=== LIVE PhytoPulse SENSOR DATA ===
${context}
===================================

User question: ${userMessage}`;

        const payload = {
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 300 }
        };

        const response = await fetch(GEMINI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Gemini API ${response.status}: ${errBody}`);
        }

        const data = await response.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text
            ?? 'I could not generate a response. Please try again.';
    }

    // ── Build live sensor context from store.state.telemetry ──────────────
    // FIX: Store structure is state.telemetry.{temp, humidity, moisture, light}
    _buildSensorContext() {
        const state     = window.appStore?.state ?? {};
        const telemetry = state.telemetry ?? {};
        const lines = [
            `Crop being monitored: ${state.crop ?? 'Unknown'}`,
            `Temperature: ${telemetry.temp      != null ? telemetry.temp      + '°C' : 'No data'}`,
            `Humidity:    ${telemetry.humidity  != null ? telemetry.humidity  + '%'  : 'No data'}`,
            `Soil Moisture: ${telemetry.moisture != null ? telemetry.moisture + '%'  : 'No data'}`,
            `Light Level: ${telemetry.light     != null ? telemetry.light     + ' lx': 'No data'}`,
            `Active Diagnostic Alert: ${state.currentDiagnostic ?? 'None — all parameters nominal'}`,
            `System Status: ${state.status ?? 'NOMINAL'}`,
        ];
        return lines.join('\n');
    }

    // ── Typing indicator ──────────────────────────────────────────────────
    _showTypingIndicator() {
        const id  = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.id        = id;
        div.className = 'flex items-start gap-3';
        div.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-brand-800 border border-brand-light/30 flex items-center justify-center shrink-0">
                <span class="text-brand-light text-xs font-bold">AI</span>
            </div>
            <div class="bg-brand-800/80 border border-white/5 rounded-2xl rounded-tl-sm p-3 flex items-center gap-1.5">
                <span class="w-2 h-2 bg-brand-light rounded-full animate-bounce" style="animation-delay:0ms"></span>
                <span class="w-2 h-2 bg-brand-light rounded-full animate-bounce" style="animation-delay:150ms"></span>
                <span class="w-2 h-2 bg-brand-light rounded-full animate-bounce" style="animation-delay:300ms"></span>
            </div>`;
        this.chatContainer.appendChild(div);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        return id;
    }

    _removeTypingIndicator(id) {
        document.getElementById(id)?.remove();
    }

    // ── Persist & render ──────────────────────────────────────────────────
    _addAndRender(sender, text, isProtocol = false, isUser = false) {
        this.chatHistory.push({ sender, text, isProtocol, isUser });
        try {
            localStorage.setItem('phyto_chat_hist', JSON.stringify(this.chatHistory));
        } catch (_) { /* quota exceeded — ignore */ }
        this._renderMessage(sender, text, isProtocol, isUser);
    }

    _renderMessage(sender, text, isProtocol, isUser) {
        if (!this.chatContainer) return;

        const div = document.createElement('div');

        // FIX: check isUser flag explicitly (old messages used sender='USER' or sender='AI_USER')
        const isUserBubble = isUser === true || sender === 'USER' || sender === 'AI_USER';

        if (isUserBubble) {
            div.className = 'flex items-start gap-3 justify-end animate-fade-in-up';
            div.innerHTML = `
                <div class="bg-brand-light/10 border border-brand-light/20 rounded-2xl rounded-tr-sm p-3 text-slate-200 max-w-[80%]">
                    <p>${this._escapeHtml(text)}</p>
                </div>
                <div class="w-8 h-8 rounded-full bg-brand-light/20 border border-brand-light/30 flex items-center justify-center shrink-0">
                    <span class="text-brand-light text-xs font-bold">YOU</span>
                </div>`;
        } else {
            div.className = 'flex items-start gap-3 animate-fade-in-up';
            const avatar = `<div class="w-8 h-8 rounded-full bg-brand-800 border border-brand-light/30 flex items-center justify-center shrink-0"><span class="text-brand-light text-xs font-bold">AI</span></div>`;

            let bubble;
            if (isProtocol) {
                bubble = `
                    <div class="bg-brand-900 border border-brand-accent/50 rounded-2xl p-4 w-full shadow-[0_0_15px_rgba(74,222,128,0.1)]">
                        <div class="flex items-center gap-2 text-brand-accent mb-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span class="font-bold text-xs uppercase tracking-wider">Treatment Protocol Generated</span>
                        </div>
                        <div class="text-slate-300 text-sm space-y-2">${text}</div>
                    </div>`;
            } else {
                bubble = `<div class="bg-brand-800/80 border border-white/5 rounded-2xl rounded-tl-sm p-3 text-slate-300 max-w-[90%]"><p>${text}</p></div>`;
            }
            div.innerHTML = avatar + bubble;
        }

        this.chatContainer.appendChild(div);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    _escapeHtml(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ── Auto-diagnostic alerts from knowledge graph ───────────────────────
    onStateChange(state) {
        const activeCrop  = state.crop;
        const currentDiag = state.currentDiagnostic;

        if (currentDiag && currentDiag !== this.lastDiagnostic) {
            this.lastDiagnostic = currentDiag;
            localStorage.setItem('phyto_last_diag', currentDiag);

            const profile = KNOWLEDGE_GRAPH[activeCrop]?.[currentDiag];
            if (profile) {
                const diagName = currentDiag.replace(/_/g, ' ');
                this._addAndRender('AI', `🚨 Alert: <strong>${diagName}</strong> detected in ${activeCrop}. Running knowledge graph analysis...`);

                setTimeout(() => {
                    const protocolHtml = `
                        <p><strong>Cellular Stress Analysis:</strong><br/>${profile.cause}</p>
                        <div class="h-px bg-white/10 my-2"></div>
                        <p><strong>Recommended Action:</strong><br/><span class="text-white">${profile.action}</span></p>
                    `;
                    this._addAndRender('AI', protocolHtml, true);
                }, 1000);
            }
        } else if (!currentDiag && this.lastDiagnostic !== null) {
            this.lastDiagnostic = null;
            localStorage.removeItem('phyto_last_diag');
            this._addAndRender('AI', '✅ All parameters returned to nominal. Continuing automated monitoring.');
        }
    }
}
