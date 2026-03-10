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
                voltage: 0,
                temp: 24.5,
                moisture: 60
            },
            status: 'NOMINAL', // NOMINAL, WARNING, CRITICAL
            currentDiagnostic: null,
            isSimulationMode: true
        };
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
        this.notify();
    }

    updateStatus(status, diagnostic = null) {
        if (this.state.status !== status || this.state.currentDiagnostic !== diagnostic) {
            this.state.status = status;
            this.state.currentDiagnostic = diagnostic;
            this.notify();
        }
    }
}

const store = new StateStore();
window.appStore = store;
