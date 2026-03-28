/**
 * dashboard-init.js
 * Wires up the DOM elements with the Store, API, and Engines.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 0. Health Logic Rule Engine
    const calculatePlantHealth = (soil, temp, status) => {
        // Rule 1: Disease Suspected (🔴) -> Biosignal Patterns show anomalies (Store Status is CRITICAL)
        if (status === 'CRITICAL') {
            return {
                label: 'DISEASE SUSPECTED',
                class: 'status-disease',
                icon: '🔴'
            };
        }

        // Rule 2: Stress Detected (🟡) -> Soil Moisture is low OR Temp outside optimal range
        const isMoistureLow = parseFloat(soil) < 30;
        const isTempOutsideRange = parseFloat(temp) < 18 || parseFloat(temp) > 32;

        if (isMoistureLow || isTempOutsideRange) {
            return {
                label: 'STRESS DETECTED',
                class: 'status-stress',
                icon: '🟡'
            };
        }

        // Rule 3: Healthy (🟢) -> Normal ranges
        return {
            label: 'HEALTHY',
            class: 'status-healthy',
            icon: '🟢'
        };
    };

    const chartEngine = new BiopotentialChart('bioChart');
    const aiDoctor = new AIDoctor();
    const growthTracker = new GrowthTracker();

    // 2. DOM Elements Mapping
    const elCropSelector = document.getElementById('crop-selector');

    // Metrics
    const elHum = document.getElementById('hum-val');
    const elTemp = document.getElementById('temp-val');
    const elMoist = document.getElementById('soil-val');
    const elLight = document.getElementById('light-val');

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
        if (elHum && state.telemetry.humidity !== undefined) elHum.innerText = state.telemetry.humidity;
        if (elTemp && state.telemetry.temp !== undefined) elTemp.innerText = state.telemetry.temp;
        if (elMoist && state.telemetry.moisture !== undefined) elMoist.innerText = state.telemetry.moisture;
        if (elLight && state.telemetry.light !== undefined) elLight.innerText = state.telemetry.light;

        // Update Sensor Status Indicators
        Object.keys(state.sensorStatus).forEach(sensor => {
            const status = state.sensorStatus[sensor];
            const elDot = document.getElementById(`status-dot-${sensor}`);
            const elSignal = document.getElementById(`signal-${sensor}`);
            const elSeen = document.getElementById(`seen-${sensor}`);

            if (elDot) {
                elDot.className = `w-2 h-2 rounded-full ${status.state === 'ONLINE' ? 'bg-brand-light' : 'bg-brand-warning'} animate-pulse`;
            }
            if (elSignal) {
                elSignal.innerText = `${status.signal}%`;
            }
            if (elSeen) {
                const lastSeen = new Date(status.lastSeen);
                elSeen.innerText = lastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }
        });

        // Update Global Status & Alert View
        const health = calculatePlantHealth(state.telemetry.moisture, state.telemetry.temp, state.status);
        
        elGlobalStatus.innerText = health.label;
        elGlobalStatus.className = `text-xs font-bold ${health.class}`;

        if (state.status === 'CRITICAL') {
            elDiagAlert.classList.remove('hidden');
            const alertText = state.currentDiagnostic ? state.currentDiagnostic.replace(/_/g, ' ') : 'System Anomaly Detected';
            elAlertTitle.innerText = alertText;
        } else {
            elDiagAlert.classList.add('hidden');
        }

        // Keep chat initial text updated if it still exists in DOM
        if (elChatCropName && state.currentDiagnostic === null) {
            elChatCropName.innerText = state.crop;
        }
    });
});
