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
    const activeDiseaseAlert = document.getElementById('active-disease-alert');
    const predictedRiskAlert = document.getElementById('predicted-risk-alert');
    const affectedDisease = document.getElementById('affected-disease');
    const rootCause = document.getElementById('root-cause-diagnosis');
    const immediateSolution = document.getElementById('immediate-solution');
    const possibleFutureDiseases = document.getElementById('possible-future-diseases');
    
    // Warning Panels
    const activeWarningPanel = document.getElementById('active-diseases-warning');
    const riskWarningPanel = document.getElementById('predicted-risks-warning');

    if (!activeDiseaseAlert) return;

    let active = 'None';
    let risk = 'None';
    let cause = 'Optimal Conditions';
    let solution = 'Maintain current schedule';
    let trend = 'Stable';
    let isCritical = false;
    let isWarning = false;

    // Evaluate base logic
    if (temp > 35) {
        cause = 'Heat Stress';
        solution = 'Increase ventilation, apply misting';
        isWarning = true;
    } else if (temp < 15) {
        cause = 'Cold Stress';
        solution = 'Provide heating/insulation';
        isWarning = true;
    }
    
    if (soil < 30) {
        cause = 'Hydration deficit';
        solution = 'Increase irrigation frequency';
        isWarning = true;
    } else if (soil > 80) {
        cause = 'Excess hydration';
        solution = 'Improve drainage, pause watering';
        isWarning = true;
    }

    if (bio < 300) { // Erratic/Low bio signal
        cause += ' (Plant Stress Detected from Bio-Signal)';
        solution += ' (Monitor Closely)';
        isWarning = true;
    }
    
    // Specific Disease Intelligence overrides
    if (hum > 85 && temp < 24) {
        active = 'Powdery Mildew';
        risk = 'Botrytis Cinerea';
        cause = 'High humidity with cool air';
        solution = 'Improve airflow & apply organic fungicide';
        isCritical = true;
        trend = 'Fungal proliferation highly likely';
    } else if (soil < 20 && bio < 300) {
        active = 'Dehydration';
        risk = 'Leaf Scorching';
        cause = 'Critical moisture loss & weak bio-signal';
        solution = 'Immediate deep watering & provide shade';
        isCritical = true;
        trend = 'Rapid cellular damage occurring';
    } else if (soil > 90 && hum > 80) {
        active = 'Root Rot';
        risk = 'Fungus Gnats';
        cause = 'Waterlogging & excessive ambient moisture';
        solution = 'Stop watering, aerate soil, apply H2O2 drench';
        isCritical = true;
        trend = 'Root suffocation imminent';
    }

    // Update UI
    activeDiseaseAlert.innerText = active;
    predictedRiskAlert.innerText = risk;
    affectedDisease.innerText = active;
    rootCause.innerText = cause;
    immediateSolution.innerText = solution;
    possibleFutureDiseases.innerText = risk;
    
    const trendAnalysis = document.getElementById('trend-analysis');
    if (trendAnalysis) trendAnalysis.innerText = trend;

    // Visual formatting for Warning Panels
    if (activeWarningPanel) {
        activeWarningPanel.classList.remove('bg-red-500/20', 'border-red-500/50', 'bg-brand-800/50', 'border-white/5');
        if (isCritical || active !== 'None') {
            activeWarningPanel.classList.add('bg-red-500/20', 'border-red-500/50');
            activeWarningPanel.querySelector('svg').classList.add('animate-pulse');
        } else {
            activeWarningPanel.classList.add('bg-brand-800/50', 'border-white/5');
            activeWarningPanel.querySelector('svg').classList.remove('animate-pulse');
        }
    }

    if (riskWarningPanel) {
        riskWarningPanel.classList.remove('bg-yellow-500/20', 'border-yellow-500/50', 'bg-brand-800/50', 'border-white/5');
        if ((isCritical || isWarning || risk !== 'None') && risk !== 'None') {
            riskWarningPanel.classList.add('bg-yellow-500/20', 'border-yellow-500/50');
        } else {
            riskWarningPanel.classList.add('bg-brand-800/50', 'border-white/5');
        }
    }
}

// Ensure the function is accessible globally if needed, though setInterval will run it
window.fetchThingSpeakData = fetchThingSpeakData;

// Global tracking variable for Diagnostic Center
let previousBioSignal = null;
let lastAlertSpeakTime = 0; // Prevent spamming TTS

function updateGrowthStage() {
    // Set 'Date Planted' to 30 days ago
    const currentDate = new Date();
    const datePlanted = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));
    const totalDays = 90;
    
    const diffTime = Math.abs(currentDate - datePlanted);
    const daysSincePlanting = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, totalDays - daysSincePlanting);
    const progressPercent = Math.min(100, (daysSincePlanting / totalDays) * 100);
    
    const daysPlantedEl = document.getElementById('info-days-planted');
    if (daysPlantedEl) daysPlantedEl.innerText = daysSincePlanting;
    
    const harvestDaysEl = document.getElementById('info-harvest-days');
    if (harvestDaysEl) harvestDaysEl.innerText = `${daysLeft} Days Left`;
    
    const progressEl = document.getElementById('growth-progress-bar');
    if (progressEl) progressEl.style.width = `${progressPercent}%`;
}

function calculateVPD(temp, hum) {
    if (!temp || !hum) return;
    // SVP in kPa using formula: 0.61078 * exp(17.27 * T / (T + 237.3))
    const svp = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
    const avp = svp * (hum / 100);
    const vpd = svp - avp;
    
    const vpdValEl = document.getElementById('vpd-value');
    if (vpdValEl) vpdValEl.innerText = vpd.toFixed(2);
    
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

function performDiagnosticCenter(temp, hum, soil, bio, light) {
    let issue = 'None (Healthy)';
    let analysis = 'All environmental and biopotential signatures indicate optimal conditions.';
    let solution = 'Continue current regimen.';
    let overrideAlert = false;

    // 1. Analyze historical tracking
    if (previousBioSignal !== null && bio !== null) {
        const dropRatio = previousBioSignal > 0 ? (previousBioSignal - bio) / previousBioSignal : 0;
        if (dropRatio > 0.20) {
            issue = 'Plant Stress Detected';
            analysis = `Bio-Signal dropped suddenly by ${(dropRatio * 100).toFixed(1)}% compared to previous reading.`;
            solution = 'Inspect plant immediately for physical damage or acute stress.';
            overrideAlert = true;
        }
    }
    
    // Fallbacks if no sudden overriding drop
    if (!overrideAlert) {
         if (temp > 35) {
             issue = 'Heat Stress';
             analysis = `Temperature is elevated at ${temp}°C, risking transpiration breakdown.`;
             solution = 'Increase ventilation and provide cooling/shade.';
             overrideAlert = true;
         } else if (soil < 30) {
             issue = 'Severe Dehydration';
             analysis = `Soil moisture is extremely low (${soil}%).`;
             solution = 'Initiate immediate deep watering.';
             overrideAlert = true;
         } else if (hum > 85 && temp < 24) {
             issue = 'High Fungal Risk / Powdery Mildew';
             analysis = `High humidity (${hum}%) paired with low temp (${temp}°C) creates ideal mold conditions.`;
             solution = 'Improve airflow and reduce ambient humidity.';
             overrideAlert = true;
         } else if (soil > 85 && hum > 80) {
             issue = 'Root Rot Susceptibility';
             analysis = `Waterlogged soil and high humidity suffocating root system.`;
             solution = 'Hold off watering; optionally treat soil with H2O2.';
             overrideAlert = true;
         }
    }

    // Light Analysis -> Indoor/Outdoor Suggestion
    const suggestionEl = document.getElementById('diag-environment-suggestion');
    let suggestionText = 'Evaluating...';
    if (light < 200) {
        suggestionText = 'Indoors: Current light is poor. Consider supplementary grow lights or moving outdoors.';
    } else if (light >= 200 && light <= 1000) {
        suggestionText = 'Indoors/Outdoors: Good diffuse light. Ideal for vegetative growth.';
    } else {
        suggestionText = 'Outdoors: High intensity light. Ensure plant is acclimatized to avoid sunscald.';
    }
    
    const diagIssueEl = document.getElementById('diag-detected-issue');
    const diagAnalysisEl = document.getElementById('diag-analysis');
    const diagSolutionEl = document.getElementById('diag-solution');
    
    if (diagIssueEl) {
        diagIssueEl.innerText = issue;
        if (overrideAlert) {
            diagIssueEl.className = 'text-sm font-bold text-red-500';
            triggerVoiceAlert(issue);
        } else {
            diagIssueEl.className = 'text-sm font-bold text-white';
            updateVoiceStatus('Idle', 'bg-slate-500');
        }
    }
    if (diagAnalysisEl) diagAnalysisEl.innerText = analysis;
    if (diagSolutionEl) diagSolutionEl.innerText = solution;
    if (suggestionEl) suggestionEl.innerText = suggestionText;

    // Save previous bio-signal at end of fetch cycle
    if (bio !== null && bio !== undefined) {
        previousBioSignal = bio;
    }
}

function triggerVoiceAlert(alertText) {
    const now = Date.now();
    // Throttle voice alerts to at most once per 60 seconds to prevent spam
    if (now - lastAlertSpeakTime > 60000) {
        if ('speechSynthesis' in window) {
            updateVoiceStatus('Speaking...', 'bg-red-500 animate-pulse');
            const msg = new SpeechSynthesisUtterance(`Critical alert triggered: ${alertText}`);
            msg.rate = 1.0;
            msg.pitch = 1.1;
            msg.onend = () => {
                updateVoiceStatus('Cooldown', 'bg-yellow-500');
                setTimeout(() => {
                    updateVoiceStatus('Idle', 'bg-slate-500');
                }, 3000);
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

