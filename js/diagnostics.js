/**
 * diagnostics.js
 * Cross-Reference Diagnostic Engine
 * V > 800mV & M < 15% -> Severe Dehydration
 * V < 50mV & M > 95% -> Anoxic Stress (Root Rot)
 */

class DiagnosticsEngine {
    constructor() {
        if (window.appStore) {
            window.appStore.subscribe(state => this.analyze(state));
        }
    }

    analyze(state) {
        const v = parseFloat(state.telemetry.voltage);
        const m = parseFloat(state.telemetry.moisture);

        let newStatus = 'NOMINAL';
        let diagnosticCode = null;

        if (v > 800 && m < 15) {
            newStatus = 'CRITICAL';
            diagnosticCode = 'SEVERE_DEHYDRATION';
        } else if (v < 50 && m > 95) {
            newStatus = 'CRITICAL';
            diagnosticCode = 'ANOXIC_STRESS';
        }

        // We only notify the store if the status changes (handled by store method internally)
        window.appStore.updateStatus(newStatus, diagnosticCode);
    }
}

// Intialized in dashboard-init.js
