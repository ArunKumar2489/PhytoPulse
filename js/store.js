/**
 * store.js
 * Centralized State Management for PhytoPulse with Persistence
 */
class StateStore {
    constructor() {
        const saved = localStorage.getItem('phyto_store');
        this.state = saved ? JSON.parse(saved) : {
            crop: 'Tomato',
            telemetry: {
                temp: 24.5,
                humidity: 50,
                moisture: 60,
                light: 400
            },
            status: 'NOMINAL', // NOMINAL, WARNING, CRITICAL
            currentDiagnostic: null,
            isSimulationMode: true,
            sensorStatus: {
                temp: { state: 'ONLINE', signal: 95, lastSeen: Date.now() },
                humidity: { state: 'ONLINE', signal: 98, lastSeen: Date.now() },
                moisture: { state: 'ONLINE', signal: 92, lastSeen: Date.now() },
                light: { state: 'ONLINE', signal: 90, lastSeen: Date.now() }
            },
            growthLog: [] // Array of { image: base64, stage: string, timestamp: number }
        };
        // Ensure growthLog exists (backward compatibility)
        if (!this.state.growthLog) {
            this.state.growthLog = [];
        }

        this.listeners = [];

        // Listen to updates from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'phyto_store') {
                this.state = JSON.parse(e.newValue);
                this._fastNotify(); // Avoid rewriting to localStorage immediately
            }
        });
    }

    subscribe(listener) {
        this.listeners.push(listener);
        listener(this.state); // fire immediately on load
    }

    notify() {
        localStorage.setItem('phyto_store', JSON.stringify(this.state));
        this._fastNotify();
    }

    _fastNotify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    updateCrop(cropName) {
        this.state.crop = cropName;
        this.notify();
    }

    updateTelemetry(data) {
        this.state.telemetry = { ...this.state.telemetry, ...data };
        // Update lastSeen for any sensor that provided data
        const now = Date.now();
        if (data.temp !== undefined) this.state.sensorStatus.temp.lastSeen = now;
        if (data.humidity !== undefined) this.state.sensorStatus.humidity.lastSeen = now;
        if (data.moisture !== undefined) this.state.sensorStatus.moisture.lastSeen = now;
        if (data.light !== undefined) this.state.sensorStatus.light.lastSeen = now;
        this.notify();
    }

    updateSensorStatus(sensor, statusUpdates) {
        if (this.state.sensorStatus[sensor]) {
            this.state.sensorStatus[sensor] = { ...this.state.sensorStatus[sensor], ...statusUpdates };
            this.notify();
        }
    }

    updateStatus(status, diagnostic = null) {
        if (this.state.status !== status || this.state.currentDiagnostic !== diagnostic) {
            this.state.status = status;
            this.state.currentDiagnostic = diagnostic;
            this.notify();
        }
    }

    addGrowthEntry(entry) {
        this.state.growthLog.push({
            ...entry,
            timestamp: Date.now()
        });
        this.notify();
    }
}

const store = new StateStore();
window.appStore = store;
