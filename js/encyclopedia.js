const DB = {
    "Tomato": {
        name: "Tomato (Solanum lycopersicum)",
        description: "A major model organism for studying plant physiology, highly sensitive to drought and anoxia.",
        signals: {
            normal: "Bio-potential oscillates normally near 200-400mV. Stomatal conductance tracks VWC between 40-60%.",
            diseased: "Spikes > 800mV indicate extreme osmotic stress. Drops < 50mV accompanied by moisture > 90% indicate root anoxic failure."
        },
        preventative: [
            "Maintain soil moisture at 45-55% field capacity",
            "Incorporate Trichoderma species into root medium",
            "Ensure pH 6.0-6.8"
        ],
        treatments: [
            { type: "Chemical", desc: "Foliar application of 2% NPK to rapidly restore nutrient transport." },
            { type: "Organic", desc: "Mycorrhizal inoculant to expand root absorption surface." },
            { type: "Environmental", desc: "Adjust LED Spectrum to 450nm (Blue) to suppress stem elongation and harden tissue." }
        ]
    },
    "Rice": {
        name: "Rice (Oryza sativa)",
        description: "A semi-aquatic plant heavily reliant on aerenchyma for oxygen transport to roots.",
        signals: {
            normal: "Stable potential despite high moisture. Adaptive aerenchyma maintains aerobic root state.",
            diseased: "Loss of rhythmic amplitude in electrophysiology signals. Depolarization indicates H2S toxicity."
        },
        preventative: [
            "Alternate wetting and drying (AWD) irrigation",
            "Apply Silicon (Si) to improve cellular rigidity",
        ],
        treatments: [
            { type: "Chemical", desc: "ZnSO4 application for zinc deficiency common in flooded soils." },
            { type: "Organic", desc: "Azolla fern co-cultivation for bio-nitrogen fixation." },
            { type: "Environmental", desc: "Mid-season drainage for soil aeration." }
        ]
    },
    "Aloe Vera": {
        name: "Aloe Vera (Aloe barbadensis)",
        description: "CAM-photosynthetic succulent adapted to arid environments.",
        signals: {
            normal: "Extremely low signal variance. Diurnal shifts align with nocturnal stomatal opening.",
            diseased: "Rapid baseline drops combined with high moisture indicates structural collapse of the CAM system (rot)."
        },
        preventative: [
            "Use highly porous substrate (pumice/sand mix)",
            "Strictly avoid overhead watering to prevent crown rot"
        ],
        treatments: [
            { type: "Chemical", desc: "Copper-based fungicide application to lesions." },
            { type: "Organic", desc: "Neem oil root drench." },
            { type: "Environmental", desc: "Increase ambient temperature to 30°C and drop humidity below 40%." }
        ]
    },
    "Corn": {
        name: "Corn (Zea mays)",
        description: "A C4 photosynthetic plant demanding high nitrogen inputs and consistent moisture.",
        signals: {
            normal: "Strong daytime electro-responses correlating tightly with PAR (Photosynthetically Active Radiation).",
            diseased: "Signal flatlining mid-day signals catastrophic hydraulic failure or nitrogen deficiency."
        },
        preventative: [
            "Split-application of Nitrogen fertilizers",
            "Implement cover cropping during off-season"
        ],
        treatments: [
            { type: "Chemical", desc: "Side-dress fast-acting UAN 28%." },
            { type: "Organic", desc: "Humic acid application to improve CEC." },
            { type: "Environmental", desc: "Center-pivot irrigation targeted application." }
        ]
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const btns = document.querySelectorAll('.profile-btn');
    const content = document.getElementById('profile-content');

    function renderProfile(cropKey) {
        const data = DB[cropKey];
        if (!data) return;

        let prevHtml = data.preventative.map(item => `
            <li class="flex gap-2 items-start">
                <svg class="w-4 h-4 text-brand-light mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span class="text-slate-300 text-sm">${item}</span>
            </li>
        `).join('');

        let treatHtml = data.treatments.map(item => `
            <div class="bg-brand-800/50 border border-white/5 rounded-lg p-4">
                <span class="text-xs font-bold text-brand-accent uppercase tracking-wider block mb-1">${item.type}</span>
                <p class="text-sm text-slate-300">${item.desc}</p>
            </div>
        `).join('');

        content.innerHTML = `
            <div class="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
                <div>
                    <h2 class="text-3xl font-bold text-white mb-2">${data.name}</h2>
                    <p class="text-slate-400">${data.description}</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 class="text-lg font-semibold text-brand-light mb-4">Signal Patterns</h3>
                    <div class="space-y-4">
                        <div class="bg-white/5 border border-white/10 p-4 rounded-xl">
                            <h4 class="text-white text-sm font-bold mb-1">Normal Baseline</h4>
                            <p class="text-slate-400 text-sm">${data.signals.normal}</p>
                        </div>
                        <div class="bg-brand-danger/10 border border-brand-danger/30 p-4 rounded-xl">
                            <h4 class="text-brand-danger text-sm font-bold mb-1">Diseased / Anomaly</h4>
                            <p class="text-slate-400 text-sm">${data.signals.diseased}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-brand-light mb-4">Preventative Measures</h3>
                    <ul class="space-y-3">
                        ${prevHtml}
                    </ul>
                </div>
            </div>

            <div>
                <h3 class="text-lg font-semibold text-brand-light mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    Treatment Action Center
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    ${treatHtml}
                </div>
            </div>
        `;

        // Add subtle reload animation
        content.classList.remove('animate-fade-in-up');
        void content.offsetWidth;
        content.classList.add('animate-fade-in-up');
    }

    btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            btns.forEach(b => {
                b.classList.remove('bg-brand-light/10', 'text-white', 'border-brand-light/30');
                b.classList.add('text-slate-400', 'border-transparent');
            });
            btn.classList.add('bg-brand-light/10', 'text-white', 'border-brand-light/30');
            btn.classList.remove('text-slate-400', 'border-transparent');

            renderProfile(btn.dataset.crop);
        });
    });

    // Initialize first
    renderProfile('Tomato');
});
