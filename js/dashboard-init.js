/**
 * dashboard-init.js
 * Wires up the DOM elements with the Store, API, and Engines.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Engines
    const chartEngine = new BiopotentialChart('bioChart');
    const aiDoctor = new AIDoctor();

    // 2. DOM Elements Mapping
    const elCropSelector = document.getElementById('crop-selector');

    // Metrics
    const elVol = document.getElementById('metric-voltage');
    const elTemp = document.getElementById('metric-temp');
    const elMoist = document.getElementById('metric-moisture');

    // Status
    const elGlobalStatus = document.getElementById('global-status');
    const elDiagAlert = document.getElementById('diagnostic-alert');
    const elAlertTitle = document.getElementById('alert-title');
    const elChatCropName = document.getElementById('chat-crop-name');

    // 3. Bind UI interactions to actions
    elCropSelector.addEventListener('change', (e) => {
        window.appStore.updateCrop(e.target.value);
    });

    // 4. Subscribe to Store Updates to update DOM
    window.appStore.subscribe((state) => {
        // Update Metric Displays
        elVol.innerText = state.telemetry.voltage || '--';
        elTemp.innerText = state.telemetry.temp || '--';
        elMoist.innerText = state.telemetry.moisture || '--';

        // Update Global Status & Alert View
        if (state.status === 'CRITICAL') {
            elGlobalStatus.innerText = 'CRITICAL ALERT';
            elGlobalStatus.className = 'text-xs text-brand-danger font-bold animate-pulse';

            elDiagAlert.classList.remove('hidden');
            elAlertTitle.innerText = state.currentDiagnostic.replace('_', ' ');

        } else {
            elGlobalStatus.innerText = 'NOMINAL';
            elGlobalStatus.className = 'text-xs text-brand-light font-bold';

            elDiagAlert.classList.add('hidden');
        }

        // Keep chat initial text updated if changed before any alerts
        if (state.currentDiagnostic === null) {
            elChatCropName.innerText = state.crop;
        }
    });
});
