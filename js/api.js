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

            // AI Diagnostic Report
            analyzeCropHealth(
                parseFloat(feed.field1),
                parseFloat(feed.field2),
                parseFloat(feed.field3),
                parseFloat(feed.field4)
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

function analyzeCropHealth(temp, hum, soil, light) {
    const diagnosticOutput = document.getElementById('diagnostic-output');
    const detectedIssue = document.getElementById('detected-issue');
    const recommendedAction = document.getElementById('recommended-action');

    if (!diagnosticOutput || !detectedIssue || !recommendedAction) return;

    let issue = 'No Stress Detected';
    let action = 'Continue current maintenance.';
    let isHealthy = true;

    // Scenario A (Root Rot/Overwatering)
    if (soil > 80 && hum > 70) {
        issue = 'Potential Root Rot';
        action = 'Stop irrigation immediately and check drainage.';
        isHealthy = false;
    }
    // Scenario B (Heat Stress/Wilting)
    else if (temp > 38 && soil < 30) {
        issue = 'Acute Heat Stress';
        action = 'Activate misting system or provide shade.';
        isHealthy = false;
    }
    // Scenario C (Fungal Growth)
    else if (hum > 85 && temp >= 20 && temp <= 25) {
        issue = 'High Fungal Risk (Powdery Mildew)';
        action = 'Increase ventilation and reduce humidity.';
        isHealthy = false;
    }

    detectedIssue.innerText = issue;
    recommendedAction.innerText = action;

    // Visual Feedback
    diagnosticOutput.classList.remove('bg-green-500/20', 'border-green-500/50', 'bg-orange-500/20', 'border-orange-500/50', 'border-white/10');
    if (isHealthy) {
        diagnosticOutput.classList.add('bg-green-500/20', 'border-green-500/50');
    } else {
        diagnosticOutput.classList.add('bg-orange-500/20', 'border-orange-500/50');
    }
}

// Ensure the function is accessible globally if needed, though setInterval will run it
window.fetchThingSpeakData = fetchThingSpeakData;

// Start the loop
fetchThingSpeakData();
setInterval(fetchThingSpeakData, 15000);
