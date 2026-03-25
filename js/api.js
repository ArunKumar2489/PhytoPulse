/**
 * api.js
 * Fetch data directly from ThingSpeak
 */

async function fetchThingSpeakData() {
    try {
        const response = await fetch('https://api.thingspeak.com/channels/3312822/feeds.json?api_key=PBQKMLNVD8NR9G2X&results=1');
        const data = await response.json();
        const feed = data.feeds[0];

        console.log("Received ThingSpeak Data:", feed);

        if (feed) {
            const tempVal = document.getElementById('temp-val');
            if (tempVal) tempVal.innerText = feed.field1 ? parseFloat(feed.field1).toFixed(1) : '--';

            const humVal = document.getElementById('hum-val');
            if (humVal) humVal.innerText = feed.field2 ? parseFloat(feed.field2).toFixed(1) : '--';

            const soilVal = document.getElementById('soil-val');
            if (soilVal) soilVal.innerText = feed.field3 ? parseFloat(feed.field3).toFixed(1) : '--';

            const lightVal = document.getElementById('light-val');
            if (lightVal) lightVal.innerText = feed.field4 ? parseFloat(feed.field4).toFixed(1) : '--';

            const syncStatus = document.getElementById('sync-status');
            if (syncStatus) {
                const now = feed.created_at ? new Date(feed.created_at) : new Date();
                syncStatus.innerText = `Last Sync: ${now.toLocaleTimeString()}`;
            }

            if (window.appStore) {
                window.appStore.updateTelemetry({
                    temp: parseFloat(feed.field1),
                    humidity: parseFloat(feed.field2),
                    moisture: parseFloat(feed.field3),
                    light: parseFloat(feed.field4)
                });
            }

            // Real-Time Stress Analysis
            analyzePlantHealth(feed);

            // Real-Time Crop Intelligence Hub
            evaluateCropHealth(
                parseFloat(feed.field1) || 0, // Temp
                parseFloat(feed.field2) || 0, // Hum
                parseFloat(feed.field3) || 0, // Soil
                parseFloat(feed.field4) || 0  // Bio
            );
            
            // Advanced Modules
            updateGrowthStage();
            calculateVPD(parseFloat(feed.field1) || 0, parseFloat(feed.field2) || 0);
            performDiagnosticCenter(
                parseFloat(feed.field1) || 0,
                parseFloat(feed.field2) || 0,
                parseFloat(feed.field3) || 0,
                parseFloat(feed.field4) || 0,
                parseFloat(feed.field4) || 0
            );
        }
    } catch (error) {
        console.error("Error fetching ThingSpeak data:", error);
    }
}

function analyzePlantHealth(feed) {
    const plantHealth = document.getElementById('plant-health');
    const cardTemp = document.getElementById('card-temp');
    const cardHum = document.getElementById('card-hum');
    const cardSoil = document.getElementById('card-soil');

    if (!plantHealth) return;

    const soil = parseFloat(feed.field3);
    const temp = parseFloat(feed.field1);

    const resetCard = (card) => {
        if (card) {
            card.classList.remove('border-red-500', 'bg-red-500/10', 'border-orange-500', 'bg-orange-500/10', 'border-green-500', 'bg-green-500/10');
            card.classList.add('border-white/10');
        }
    };
    
    resetCard(cardTemp);
    resetCard(cardHum);
    resetCard(cardSoil);

    let healthText = 'STATUS: NORMAL';
    let healthClass = 'px-4 py-1.5 rounded-full text-xs font-bold border transition-colors duration-300 bg-slate-800/50 text-slate-300 border-slate-500'.split(' ');
    let statusCode = 'NOMINAL';

    if (soil < 30) {
        healthText = 'CRITICAL: WATER NEEDED';
        healthClass = 'px-4 py-1.5 rounded-full text-xs font-bold border transition-colors duration-300 bg-red-500/20 text-red-500 border-red-500/50 animate-pulse'.split(' ');
        statusCode = 'CRITICAL';
        if (cardSoil) {
            cardSoil.classList.remove('border-white/10');
            cardSoil.classList.add('border-red-500', 'bg-red-500/10');
        }
    } else if (temp > 35) {
        healthText = 'WARNING: HEAT STRESS';
        healthClass = 'px-4 py-1.5 rounded-full text-xs font-bold border transition-colors duration-300 bg-orange-500/20 text-orange-500 border-orange-500/50'.split(' ');
        statusCode = 'WARNING';
        if (cardTemp) {
            cardTemp.classList.remove('border-white/10');
            cardTemp.classList.add('border-orange-500', 'bg-orange-500/10');
        }
    } else if (soil >= 40 && soil <= 70 && temp >= 20 && temp <= 30) {
         healthText = 'STATUS: OPTIMAL';
         healthClass = 'px-4 py-1.5 rounded-full text-xs font-bold border transition-colors duration-300 bg-green-500/20 text-green-500 border-green-500/50'.split(' ');
         if (cardTemp) {
             cardTemp.classList.remove('border-white/10');
             cardTemp.classList.add('border-green-500', 'bg-green-500/10');
         }
         if (cardSoil) {
             cardSoil.classList.remove('border-white/10');
             cardSoil.classList.add('border-green-500', 'bg-green-500/10');
         }
         if (cardHum) {
             cardHum.classList.remove('border-white/10');
             cardHum.classList.add('border-green-500', 'bg-green-500/10');
         }
    }

    plantHealth.innerText = healthText;
    plantHealth.className = '';
    plantHealth.classList.add(...healthClass);

    if (window.appStore) {
        window.appStore.updateStatus(statusCode, null);
    }
}

function evaluateCropHealth(temp, hum, soil, bio) {
    const activeDiseaseEl = document.getElementById('active-disease');
    const riskForecastEl = document.getElementById('risk-forecast');
    const solutionStepsEl = document.getElementById('solution-steps');
    const cropSelector = document.getElementById('crop-selector');
    
    if (!activeDiseaseEl) return;

    let crop = cropSelector ? cropSelector.value : 'Tomato';
    let soil_min = 30; // Default
    if (crop === 'Tomato') soil_min = 50;
    if (crop === 'Aloe Vera') soil_min = 20;

    let disease = 'None';
    let risk = 'None';
    let solution = 'Optimal conditions maintained.';
    let isCritical = false;

    // Disease Analysis
    if (hum > 80 && temp < 24) {
        disease = 'Powdery Mildew';
        solution = 'Increase airflow and apply Neem oil';
        isCritical = true;
    } else if (soil < soil_min && previousBioSignal !== null && bio < previousBioSignal) {
        disease = 'Dehydration Stress';
        solution = 'Immediate Irrigation Required';
        isCritical = true;
    }

    // Risk Forecast (Simplified)
    if (hum > 85) risk = 'High Fungal Risk';
    else if (temp > 35) risk = 'Heat Stress Risk';

    // Update UI
    activeDiseaseEl.innerText = disease;
    riskForecastEl.innerText = risk;
    solutionStepsEl.innerText = solution;

    if (isCritical) {
        triggerVoiceAlert(disease);
    }

    // Keep legacy UI updated for compatibility if elements exist
    const oldActive = document.getElementById('active-disease-alert');
    if (oldActive) oldActive.innerText = disease;
    const oldAffected = document.getElementById('affected-disease');
    if (oldAffected) oldAffected.innerText = disease;
    const oldSolution = document.getElementById('immediate-solution');
    if (oldSolution) oldSolution.innerText = solution;
}

// Ensure the function is accessible globally if needed, though setInterval will run it
window.fetchThingSpeakData = fetchThingSpeakData;

// Global tracking variable for Diagnostic Center
let previousBioSignal = null;
let lastAlertSpeakTime = 0; // Prevent spamming TTS

function updateGrowthStage() {
    const cropSelector = document.getElementById('crop-selector');
    let crop = cropSelector ? cropSelector.value : 'Tomato';
    
    const currentDate = new Date();
    const datePlanted = new Date('2026-03-01');
    let totalDays = 90; // Default for Tomato
    
    if (crop === 'Aloe Vera') totalDays = 365;
    if (crop === 'Spinach') totalDays = 45;
    
    const diffTime = Math.abs(currentDate - datePlanted);
    const daysSincePlanting = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, totalDays - daysSincePlanting);
    const progressPercent = Math.min(100, (daysSincePlanting / totalDays) * 100);
    
    const daysPlantedEl = document.getElementById('info-days-planted');
    if (daysPlantedEl) daysPlantedEl.innerText = daysSincePlanting;
    
    const harvestDaysEl = document.getElementById('info-harvest-days');
    if (harvestDaysEl) harvestDaysEl.innerText = `${daysLeft} Days to Harvest`;
    
    const progressEl = document.getElementById('growth-bar');
    if (progressEl) progressEl.style.width = `${progressPercent}%`;
}

function calculateVPD(temp, hum) {
    if (temp === undefined || hum === undefined) return;
    
    // SVP calculation: SVP = 0.61078 * e^(17.27 * T / (T + 237.3))
    const svp = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
    // VPD calculation: VPD = SVP * (1 - H/100)
    const vpd = svp * (1 - hum / 100);
    
    const vpdValEl = document.getElementById('vpd-value');
    if (vpdValEl) vpdValEl.innerText = vpd.toFixed(2);
    
    const vpdGaugeBar = document.getElementById('vpd-gauge-bar');
    const vpdMarker = document.getElementById('vpd-marker');
    if (vpdGaugeBar && vpdMarker) {
        // Map VPD 0-2.0 kPa to 0-100%
        const percent = Math.min(100, Math.max(0, (vpd / 2.0) * 100));
        vpdMarker.style.left = `${percent}%`;
    }
    
    const vpdStatusEl = document.getElementById('vpd-status');
    if (vpdStatusEl) {
        vpdStatusEl.classList.remove('text-red-400', 'text-green-400', 'text-yellow-400');
        if (vpd < 0.4) {
            vpdStatusEl.innerText = 'Low (Risk of condensation/mold)';
            vpdStatusEl.classList.add('text-yellow-400');
        } else if (vpd > 1.6) {
            vpdStatusEl.innerText = 'High (Risk of water stress)';
            vpdStatusEl.classList.add('text-red-400');
        } else {
            vpdStatusEl.innerText = 'Optimal';
            vpdStatusEl.classList.add('text-green-400');
        }
    }
}

// Environment Check logic
let highLightHours = 0;
const SAMPLES_PER_HOUR = 240; // 15 sec sync = 4 samples per min * 60 min

function performDiagnosticCenter(temp, hum, soil, bio, light) {
    // Environment Check
    const envTypeEl = document.getElementById('environment-type');
    if (light > 800) {
        highLightHours += (1 / SAMPLES_PER_HOUR);
    } else {
        // Maybe reset or slowly decrease? For now let's just count.
    }

    let envType = highLightHours > 6 ? 'Outdoor/Full Sun' : 'Indoor/Shade';
    if (envTypeEl) envTypeEl.innerText = envType;

    // Save previous bio-signal at end of fetch cycle
    if (bio !== null && bio !== undefined) {
        previousBioSignal = bio;
    }
}

function triggerVoiceAlert(alertText) {
    const now = Date.now();
    // Throttle voice alerts to at most once per 60 seconds
    if (now - lastAlertSpeakTime > 60000) {
        if ('speechSynthesis' in window) {
            updateVoiceStatus('Speaking...', 'bg-red-500 animate-pulse');
            const msg = new SpeechSynthesisUtterance(`Warning: ${alertText} detected. Please check the solution panel`);
            msg.rate = 1.0;
            msg.pitch = 1.0;
            msg.onend = () => {
                updateVoiceStatus('Idle', 'bg-slate-500');
            };
            window.speechSynthesis.speak(msg);
            lastAlertSpeakTime = now;
        }
    }
}

function updateVoiceStatus(text, dotClass) {
    const vStatus = document.getElementById('voice-alert-status');
    if (vStatus) {
        vStatus.innerHTML = `<span class="w-1.5 h-1.5 rounded-full ${dotClass}"></span> Voice Alerts: ${text}`;
    }
}

// Start the loop
fetchThingSpeakData();
setInterval(fetchThingSpeakData, 15000);

