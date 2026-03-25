/**
 * api.js
 * Real-Time IoT Engine & Live Signal Analysis Engine
 */

class IoTAPI {
    constructor() {
        this.channelId = '3312822';
        this.readKey = 'PBQKMLNVD8NR9G2X';
        this.autoInterval = null;
    }

    startAutomatedEngine() {
        if (this.autoInterval) clearInterval(this.autoInterval);

        // Automated fetch & pulse: 10-second recurring loop
        this.autoInterval = setInterval(() => {
            this.analyzePlantHealth();
        }, 10000); // 10 seconds

        // Optional quick start
        setTimeout(() => this.analyzePlantHealth(), 500);
    }

    async analyzePlantHealth() {
        try {
            // 1. Enter your specific ThingSpeak Credentials
            const channelId = '3312822'; // Replace with your actual Channel ID
            const readKey = 'PBQKMLNVD8NR9G2X';  // Replace with your actual Read API Key

            // 2. Fetch the LATEST entry from the Cloud
            const res = await fetch(`https://api.thingspeak.com/channels/${channelId}/feeds/last.json?api_key=${readKey}`);

            if (!res.ok) throw new Error("Connection to ThingSpeak Failed");

            const data = await res.json();

            // 3. Map ThingSpeak Fields to PhytoPulse Variables
            // Ensure these match your ESP32 Field setup!
            const voltage = parseFloat(data.field4);  // Bio-signal
            const temp = parseFloat(data.field1);     // Temperature
            const moisture = parseFloat(data.field3);  // Soil Moisture

            // 4. Update your Dashboard Store (UI will change instantly)
            window.appStore.updateTelemetry({
                voltage: voltage.toFixed(1),
                temp: temp.toFixed(1),
                moisture: moisture.toFixed(1)
            });

            // 5. Run your Diagnostic Engine on the REAL data
            this.analyzeBiologicalState(voltage, moisture);

            // Update the Sync Timestamp on the UI
            const now = new Date();
            const el = document.getElementById('last-sync');
            if (el) el.innerText = `Last Sync: ${now.toLocaleTimeString()}`;

        } catch (e) {
            console.error("IoT Sync Error:", e);
        }
    }

    analyzeBiologicalState(voltage, moisture) {
        // Evaluate the live values of Field 1 (Bio-potential) and Field 3 (Moisture)
        let history = JSON.parse(localStorage.getItem('phyto_history') || '[]');
        history.push({ v: voltage, m: moisture, time: Date.now() });

        // Keep 6 intervals (1 minute @ 10s per fetch)
        if (history.length > 6) {
            history.shift();
        }
        localStorage.setItem('phyto_history', JSON.stringify(history));

        let consoleText = 'Status: Normal';
        let newStatus = 'NOMINAL';
        let diagnosticCode = null;

        // Define biological thresholds for our live analysis engine
        const THRESHOLDS = {
            droughtMoisture: 20,
            erraticFluctuation: 0.25,
            severeDehydrationVoltage: 800,
            severeDehydrationMoisture: 15,
            anoxicVoltage: 50,
            anoxicMoisture: 95
        };

        if (history.length > 1) {
            const voltages = history.map(h => h.v);
            const maxV = Math.max(...voltages);
            const minV = Math.min(...voltages);
            const avgV = voltages.reduce((a, b) => a + b, 0) / voltages.length;
            const fluctuation = avgV !== 0 ? (maxV - minV) / avgV : 0;

            const firstM = history[0].m;

            // Live Analysis Engine Logic
            if (moisture < THRESHOLDS.droughtMoisture && fluctuation > THRESHOLDS.erraticFluctuation) {
                newStatus = 'CRITICAL';
                diagnosticCode = 'DROUGHT_STRESS_DETECTED';
                consoleText = 'CRITICAL: Drought Stress Detected';
            } else if (voltage > THRESHOLDS.severeDehydrationVoltage && moisture < THRESHOLDS.severeDehydrationMoisture) {
                newStatus = 'CRITICAL';
                diagnosticCode = 'SEVERE_DEHYDRATION';
                consoleText = 'CRITICAL: Severe Dehydration';
            } else if (voltage < THRESHOLDS.anoxicVoltage && moisture > THRESHOLDS.anoxicMoisture) {
                newStatus = 'CRITICAL';
                diagnosticCode = 'ANOXIC_STRESS';
                consoleText = 'CRITICAL: Anoxic Stress';
            } else {
                // Dynamic UI Feedback logic
                if (fluctuation > 0.20) {
                    newStatus = 'WARNING';
                    diagnosticCode = 'HIGH_ACTIVITY';
                    consoleText = 'Warning: High Cellular Activity';
                } else if (moisture < firstM && fluctuation < 0.05) {
                    newStatus = 'WARNING';
                    diagnosticCode = 'RESOURCE_DEPLETION';
                    consoleText = 'Warning: Resource Depletion';
                }
            }
        }

        // We only notify the store if the status changes (handled by store method internally)
        window.appStore.updateStatus(newStatus, diagnosticCode);

        // Sync the overlay message status externally so we can render it smoothly
        localStorage.setItem('phyto_consoleText', consoleText);
        this.updateOverlayUI();
    }

    updateOverlayUI() {
        const elStatus = document.getElementById('console-status');
        const elStep1 = document.getElementById('console-step1');
        const elStep2 = document.getElementById('console-step2');

        if (elStatus) {
            const text = localStorage.getItem('phyto_consoleText') || 'Status: Normal';
            elStatus.innerText = text;

            // Parse state safely
            const storeStateRaw = localStorage.getItem('phyto_store');
            let status = 'NOMINAL';
            if (storeStateRaw) {
                status = JSON.parse(storeStateRaw).status;
            }

            if (status === 'CRITICAL') elStatus.className = 'mt-2 pt-2 border-t border-brand-light/20 font-bold text-brand-danger';
            else if (status === 'WARNING') elStatus.className = 'mt-2 pt-2 border-t border-brand-light/20 font-bold text-yellow-400';
            else elStatus.className = 'mt-2 pt-2 border-t border-brand-light/20 font-bold text-white';

            // Cycle visual animation
            if (elStep1 && elStep2) {
                if (Date.now() % 4000 < 2000) {
                    elStep1.classList.remove('opacity-50');
                    elStep2.classList.add('opacity-50');
                } else {
                    elStep2.classList.remove('opacity-50');
                    elStep1.classList.add('opacity-50');
                }
            }
        }
    }

    // Helper to generate simulated realistic data over time loops
    simulateDataPull() {
        const storedT = parseFloat(localStorage.getItem('phyto_sim_t') || '0');
        const t = storedT + 1;
        localStorage.setItem('phyto_sim_t', t.toString());

        const baseV = 300; // mV
        const baseT = 24.5;
        const baseM = 60;

        const noise = (Math.random() - 0.5) * 50;
        let v = baseV + Math.sin(t * 10) * 100 + Math.sin(t * 2.5) * 50 + noise;
        let m = parseFloat(localStorage.getItem('phyto_sim_m')) || baseM;
        let temp = baseT;

        // Simulate new states over cycles (approx 1 cycle = 10s = 1 t)
        if (t > 0 && t % 25 === 0) {
            // DROUGHT_STRESS_DETECTED: low moisture, highly erratic fluctuation
            v = baseV + (Math.random() - 0.5) * 400; // erratic
            m = 18.0; // below 20
        } else if (t > 0 && t % 20 === 0) {
            // Severe Dehydration
            v = 850 + (Math.random() * 100);
            m = 12.5;
        } else if (t > 0 && t % 35 === 0) {
            // Anoxic Stress
            v = 20 + (Math.random() * 20);
            m = 98.0;
        } else if (t > 0 && t % 15 === 0) {
            // High Cellular Activity (simulate large fluctuation immediately)
            v = v * 1.5;
        } else if (t > 0 && t % 10 === 0) {
            // Resource Depletion (moisture drops, signal flat)
            v = baseV; // completely flat
            m -= 2; // moisture drops
        } else {
            // Nominal state
            if (t > 5 && t < 9) v = baseV + noise * 0.1; // somewhat flat to help trigger depletion
        }

        localStorage.setItem('phyto_sim_m', m.toString());

        return {
            field1: v,
            field2: temp,
            field3: m
        };
    }
}

window.apiEngine = new IoTAPI();

// Automated Fetch & Pulse: Start immediately when loaded
window.addEventListener('load', () => {
    window.apiEngine.startAutomatedEngine();
});
