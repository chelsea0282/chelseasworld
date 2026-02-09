let words = [];
let timeInterval;
let splitMode = 'letter'; // 'word' or 'letter'
let poemData; // Store the fetched data for re-processing
let fallTimeouts = []; // Store timeout IDs for falling animation

//TODO - POEM FETCH
fetch('type.txt')
    .then(res => res.text())
    .then(data => {
        poemData = data; // Store for toggle
        setupPoem(data, splitMode);
        setupControls();
    })
    .catch(error => {
        console.error('Error fetching type.txt:', error);
    });

//TODO - POEM SETUP
function setupPoem(data, mode) {
    const lines = data.split(/\r?\n/);
    document.getElementById('type-title').innerText = lines[0];
    document.getElementById('type-author').innerText = lines[1];

    const contentDiv = document.getElementById('type-content');
    const content = lines.slice(2).join('\n'); //preserve line breaks
    
    // Clear and build spans
    contentDiv.innerHTML = ''; 
    words = [];
    
    // Process content while preserving whitespace
    content.split(/(\s+)/).forEach(part => {
        if (part.trim() === '') {
            contentDiv.appendChild(document.createTextNode(part));
        } else {
            if (mode === 'word') {
                // Wrap entire words
                const span = document.createElement('span');
                span.className = 'word';
                span.innerText = part;
                contentDiv.appendChild(span);
                words.push(span);
            } else if (mode === 'letter') {
                // Wrap each letter individually
                part.split('').forEach(letter => {
                    const span = document.createElement('span');
                    span.className = 'letter';
                    span.innerText = letter;
                    contentDiv.appendChild(span);
                    words.push(span);
                });
            }
        }
    });
}

//TODO - CONTROLS SETUP
function setupControls() {
    const controlsDiv = document.getElementById('controls');

    // Create variation buttons dynamically
    variations.forEach(v => {
        if (v.type === 'header') {
            const header = document.createElement('h3');
            header.innerText = v.label;
            header.style.marginTop = '15px';
            header.style.marginBottom = '5px';
            controlsDiv.appendChild(header);
        } else if (v.type === 'range') {
            const label = document.createElement('label');
            label.innerText = v.label;
            label.htmlFor = v.id;
            label.style.display = 'block';
            
            const input = document.createElement('input');
            input.type = 'range';
            input.id = v.id;
            input.min = v.min;
            input.max = v.max;
            input.value = v.value;
            input.addEventListener('input', v.action);
            
            controlsDiv.appendChild(label);
            controlsDiv.appendChild(input);
        } else {
            const btn = document.createElement('button');
            if (v.id) btn.id = v.id;
            btn.innerText = v.label;
            btn.className = 'variation-btn';
            btn.addEventListener('click', () => {
                // reset();
                v.action(words);
            });
            controlsDiv.appendChild(btn);
        }
    });
}

//TODO - RESET FUNCTIONALITY
function reset() {
    if (timeInterval) clearInterval(timeInterval);
    // Clear any pending fall timeouts
    fallTimeouts.forEach(clearTimeout);
    fallTimeouts = [];
    
    words.forEach(word => {
        word.className = splitMode === 'word' ? 'word' : 'letter';
        word.style = '';
        // Ensure transform is reset (overrides animation 'forwards')
        word.style.transform = 'none';
    });

    // Reset sliders to default values
    const defaults = {
        'spacing-slider': 0,
        'fontsize-slider': 18,
        'blur-slider': 0,
        'fontweight-slider': 400,
        'rotate-slider': 0,
        'elevate-slider': 0
    };
    Object.keys(defaults).forEach(id => {
        const slider = document.getElementById(id);
        if (slider) slider.value = defaults[id];
    });
}

// TODO - BUTTONS FOR THE DIFFERENT VARIATIONS
const variations = [
    { type: 'header', label: 'CONTROLPANEL' },
    { id: 'reset-btn', label: 'Reset', action: reset },
    { id: 'split-toggle-btn', label: 'Mode: Letter', action: toggleSplitMode },
    // remove all the linebreaks

    // dimensions
    { type: 'header', label: 'Dimensions' },
    { id: 'rotate', label: 'Rotation', action: () => triggerDimension('rotate', 45) },
    { type: 'range', id: 'rotate-slider', label: '', min: 0, max: 360, value: 0, action: (e) => triggerDimension('rotate', e.target.value) },
    { id: 'spacing', label: 'Spacing', action: () => triggerDimension('spacing', 5) },
    { type: 'range', id: 'spacing-slider', label: '', min: 0, max: 50, value: 0, action: (e) => triggerDimension('spacing', e.target.value) },
    { id: 'fontsize', label: 'Font Size', action: () => triggerDimension('fontsize', 50) },
    { type: 'range', id: 'fontsize-slider', label: '', min: 10, max: 100, value: 18, action: (e) => triggerDimension('fontsize', e.target.value) },
    { id: 'blur', label: 'Blur', action: () => triggerDimension('blur', 5) },
    { type: 'range', id: 'blur-slider', label: '', min: 0, max: 10, step: 0.1, value: 0, action: (e) => triggerDimension('blur', e.target.value) },
    { id: 'elevate', label: 'Elevate', action: () => triggerDimension('elevate', 5) },
    { type: 'range', id: 'elevate-slider', label: '', min: -50, max: 50, value: 0, action: (e) => triggerDimension('elevate', e.target.value) },
    { id: 'fontweight', label: 'Font Weight', action: () => triggerDimension('fontweight', 700) },
    { type: 'range', id: 'fontweight-slider', label: '', min: 100, max: 900, step: 100, value: 400, action: (e) => triggerDimension('fontweight', e.target.value) },
    { id: 'fall', label: 'Fall', action: () => wordsFall(words) },
    
    // rules - these will not show any dimension
    { type: 'header', label: 'Rules' },
    { id: 'Vowel_Consonant', label: 'Vowel/Consonant', action: () => setActiveRule('Vowel_Consonant', getVowCons, () => mapRuleToDimension(words, getVowCons)) }, 
    { id: 'Word_Length', label: 'Word Length', action: () => setActiveRule('Word_Length', getLength, () => mapRuleToDimension(words, getLength)) },
    { id: 'Ascenders', label: 'Ascenders', action: () => setActiveRule('Ascenders', getHeight, () => mapRuleToDimension(words, getHeight)) },
];

//TODO - LETTER/WORD TOGGLE
function toggleSplitMode() {
    splitMode = splitMode === 'word' ? 'letter' : 'word';
    const btn = document.getElementById('split-toggle-btn');
    if (btn) btn.innerText = `Mode: ${splitMode === 'word' ? 'Word' : 'Letter'}`;
    reset(); // Clear any active effects
    setupPoem(poemData, splitMode); // Re-process with new mode
}

//TODO - HELPER FUNCTION ADDING SCALING TO DIMENSIONS
function scalingDimension(words, styleApplier, value, sliderId) {
    words.forEach(word => styleApplier(word, value));
    const slider = document.getElementById(sliderId);
    if (slider) {
        slider.value = value;
    }
}

//TODO - HELPER FUNCTION MAPPING DIMENSION TO RULES
function mapRuleToDimension(words, ruleFn, dimensionFn, config) {
    const groups = ruleFn(words);
    Object.keys(config).forEach(groupKey => {
        if (groups[groupKey]) {
            dimensionFn(groups[groupKey], config[groupKey]);
        }
    });
}

//TODO - DIMENSIONS/MANIPULATION TYPE 
function rotate(words, degrees) {
    scalingDimension(words, (w, v) => w.style.transform = `rotate(${v}deg)`, degrees, 'rotate-slider');
}

function alterSpacing(words, pixels) {
    scalingDimension(words, (w, v) => w.style.marginRight = `${v}px`, pixels, 'spacing-slider');
}

function changeFontSize(words, size) {
    scalingDimension(words, (w, v) => w.style.fontSize = `${v}px`, size, 'fontsize-slider');
}

function blurWords(words, blurAmount) { 
    scalingDimension(words, (w, v) => w.style.filter = `blur(${v}px)`, blurAmount, 'blur-slider');
}

function elevate(words, pixels) {
    scalingDimension(words, (w, v) => w.style.transform = `translateY(${v}px)`, pixels, 'elevate-slider');
}

function changeFontWeight(words, weight) {
    scalingDimension(words, (w, v) => w.style.fontWeight = v, weight, 'fontweight-slider');
}

function wordsFall(words) {
    // Clear any existing fall timeouts
    fallTimeouts.forEach(clearTimeout);
    fallTimeouts = [];
    
    words.forEach((word, index) => {
        const timeoutId = setTimeout(() => word.classList.add('falling'), index * 50);
        fallTimeouts.push(timeoutId);
    });
}

//TODO - HELPER LOGIC FUNCTIONS
function getVowCons(words) {
    const groups = { vowels: [], consonants: [] };
    const vowels = 'aeiouAEIOU';
    words.forEach(word => {
        let firstChar;
        if (splitMode === 'letter') {
            firstChar = word.innerText;
        } else {
            firstChar = word.innerText.charAt(0);
        }

        if (vowels.includes(firstChar)) {
            groups.vowels.push(word);
        } else {
            groups.consonants.push(word);
        }
    });
    return groups;
}

function getLength(words) {
    const groups = { short: [], medium: [], long: [] };
    words.forEach(word => {
        const len = word.innerText.length;
        if (len < 3) groups.short.push(word);
        else if (len < 5) groups.medium.push(word);
        else groups.long.push(word);
    });
    return groups;
}

// separating word/letters by their height
function getHeight(words) {
    const groups = { high: [], low: [] };
    const ascenderRegex = /[bdfhkltA-Z]/;
    words.forEach(el => {
        if (ascenderRegex.test(el.innerText)) groups.high.push(el);
        else groups.low.push(el);
    });
    return groups;
}

// --- STATEFUL LOGIC ---
const dimensionFunctions = {
    'rotate': rotate,
    'spacing': alterSpacing,
    'fontsize': changeFontSize,
    'blur': blurWords,
    'elevate': elevate,
    'fontweight': changeFontWeight
};

const dimensionSettings = {
    'rotate': {
        'Vowel_Consonant': { vowels: 15, consonants: -15 },
        'Word_Length': { short: -10, medium: 0, long: 10 },
        'Ascenders': { high: 15, low: -5 }
    },
    'spacing': {
        'Vowel_Consonant': { vowels: 20, consonants: 5 },
        'Word_Length': { short: 30, medium: 10, long: 0 },
        'Ascenders': { high: 20, low: 5 }
    },
    'fontsize': {
        'Vowel_Consonant': { vowels: 12, consonants: 24 },
        'Word_Length': { short: 30, medium: 18, long: 12 },
        'Ascenders': { high: 24, low: 14 }
    },
    'blur': {
        'Vowel_Consonant': { vowels: 2, consonants: 0 },
        'Word_Length': { short: 0, medium: 2, long: 4 },
        'Ascenders': { high: 0, low: 3 }
    },
    'elevate': {
        'Vowel_Consonant': { vowels: -10, consonants: 10 },
        'Word_Length': { short: -10, medium: 0, long: 10 },
        'Ascenders': { high: -10, low: 5 }
    },
    'fontweight': {
        'Vowel_Consonant': { vowels: 700, consonants: 100 },
        'Word_Length': { short: 900, medium: 400, long: 100 },
        'Ascenders': { high: 700, low: 100 }
    }
};

function setActiveRule(name, fn, defaultAction) {
    // 1. Capture current dimension states before reset
    const currentDimensions = {};
    const dimMap = {
        'rotate': { id: 'rotate-slider', def: 0 },
        'spacing': { id: 'spacing-slider', def: 0 },
        'fontsize': { id: 'fontsize-slider', def: 18 },
        'blur': { id: 'blur-slider', def: 0 },
        'elevate': { id: 'elevate-slider', def: 0 },
        'fontweight': { id: 'fontweight-slider', def: 400 }
    };

    Object.keys(dimMap).forEach(dim => {
        const slider = document.getElementById(dimMap[dim].id);
        if (slider) {
            const val = parseFloat(slider.value);
            if (val !== dimMap[dim].def) {
                currentDimensions[dim] = val;
            }
        }
    });

    reset();
    activeRule = name;
    activeRuleFn = fn;
    console.log(`Active Rule set to: ${name}`);
    if (defaultAction) defaultAction();

    // 2. Re-apply previously active dimensions using the new rule context
    Object.keys(currentDimensions).forEach(dim => {
        triggerDimension(dim, currentDimensions[dim]);
    });
}

function triggerDimension(dimName, defaultValue) {
    if (activeRule && activeRuleFn) {
        const config = dimensionSettings[dimName] ? dimensionSettings[dimName][activeRule] : null;
        if (config) {
            mapRuleToDimension(words, activeRuleFn, dimensionFunctions[dimName], config);
        } else {
            dimensionFunctionsdimName;
        }
    } else {
        dimensionFunctionsdimName;
    }
}

// function processPoemSemantics(wordElements) {
//     // 1. Safety Check: Ensure libraries are loaded
//     if (typeof nlp === 'undefined' ) {
//         console.warn("Missing libraries: Compromise (nlp) ");
//         alert("This feature requires the 'compromise'  libraries.");
//         return;
//     }

//     if (typeof Sentiment === 'undefined') {
//         console.warn("Missing libraries:  Sentiment.");
//         alert("This feature requires the 'sentiment' libraries.");
//         return;
//     }

//     // 2. Mode Check: Semantics only work on whole words, not letters.
//     if (splitMode === 'letter') {
//         splitMode = 'word';
//         const toggleBtn = document.getElementById('split-toggle-btn');
//         if (toggleBtn) toggleBtn.innerText = 'Mode: Word';
        
//         // Re-render the poem in word mode
//         setupPoem(poemData, splitMode);
//         // Update the local reference to the new global words array
//         wordElements = words; 
//     }

//     console.log('processPoemSemantics called with', wordElements.length, 'elements');
    
//     try {
//         const sentiment = new Sentiment();

//         wordElements.forEach(wordEl => {
//             const text = wordEl.innerText.trim();
            
//             const doc = nlp(text);

//             // 1. FILTER: Is it a "content" word? 
//             // We look for Nouns, Verbs, Adjectives, or Adverbs.
//             const isImportant = doc.match('#Noun || #Verb || #Adjective || #Adverb').found;

//             if (isImportant) {
//                 // 2. CONNOTATION: Check the sentiment score
//                 const result = sentiment.analyze(text);
                
//                 // Apply visual styles based on connotation
//                 if (result.score > 0) {
//                     wordEl.style.color = 'gold';       // Positive connotation
//                     wordEl.style.fontWeight = 'bold';
//                 } else if (result.score < 0) {
//                     wordEl.style.color = 'crimson';    // Negative connotation
//                     wordEl.style.fontWeight = 'bold';
//                 } else {
//                     wordEl.style.color = 'white';      // Neutral important word
//                     wordEl.style.borderBottom = '1px solid gray';
//                 }
//                 wordEl.style.opacity = '1';
//             } else {
//                 // Structural words (the, of, and) get dimmed
//                 wordEl.style.opacity = '0.3';
//             }
//         });
//     } catch (error) {
//         console.error('Error in processPoemSemantics:', error);
//     }
// }
