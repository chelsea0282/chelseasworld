let words = [];
let timeInterval;
let splitMode = 'letter'; // 'word' or 'letter'
let lineBreakMode = "On"; // "On" or "Off"
let poemData; // Store the fetched data for re-processing
let fallTimeouts = []; // Store timeout IDs for falling animation
let activeDimensions = {};

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
    const separator = lineBreakMode === 'On' ? '\n' : ' ';
    const content = lines.slice(2).join(separator); //preserve line breaks
    
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
        } else if (v.type === 'select') {
            const label = document.createElement('label');
            label.innerText = v.label;
            label.htmlFor = v.id;
            label.style.display = 'block';
            
            const select = document.createElement('select');
            select.id = v.id;
            select.style.width = '100%';
            select.style.marginBottom = '10px';
            
            v.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.innerText = opt.label;
                select.appendChild(option);
            });
            
            select.addEventListener('change', v.action);
            
            controlsDiv.appendChild(label);
            controlsDiv.appendChild(select);
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
}

//TODO - BUTTONS FOR THE DIFFERENT VARIATIONS
const variations = [
    { type: 'header', label: 'Settings' },
    { id: 'reset-btn', label: 'Reset', action: () => {
        reset();
        activeRule = null;
        activeRuleFn = null;
        activeDimensions = {};
        // Reset button styles
        ['rotate', 'spacing', 'fontsize', 'blur', 'elevate', 'fontweight', 'Vowel_Consonant', 'Word_Length', 'Ascenders', 'Alphabet_Order'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.style.backgroundColor = '';
        });
    }},
    { id: 'split-toggle-btn', label: 'Mode: Letter', action: toggleSplitMode },
    { id: 'linebreak-toggle-btn', label: 'Line Break: On', action: toggleLineBreak },
    
    { type: 'header', label: 'Rules' },
    { id: 'Vowel_Consonant', label: 'Vowel/Consonant', action: () => setActiveRule('Vowel_Consonant', getVowCons) }, 
    { id: 'Word_Length', label: 'Word Length', action: () => setActiveRule('Word_Length', getLength) },
    { id: 'Ascenders', label: 'Ascenders', action: () => setActiveRule('Ascenders', getHeight) },
    { id: 'Alphabet_Order', label: 'Alphabet Order', action: () => setActiveRule('Alphabet_Order', getAlphaOrder) },

    { type: 'header', label: 'Dimensions' },
    { id: 'rotate', label: 'Rotation', action: () => triggerDimension('rotate', 45) },
    { id: 'spacing', label: 'Spacing', action: () => triggerDimension('spacing', 5) },
    { id: 'fontsize', label: 'Font Size', action: () => triggerDimension('fontsize', 50) },
    { id: 'blur', label: 'Blur', action: () => triggerDimension('blur', 5) },
    { id: 'elevate', label: 'Elevate', action: () => triggerDimension('elevate', 5) },
    { id: 'fontweight', label: 'Font Weight', action: () => triggerDimension('fontweight', 700) },
    { id: 'fall', label: 'Fall', action: () => wordsFall(words) },
];

//TODO - MAPPING HELPER FUNCTIONS
function mapRuleToDimension(words, ruleFn, dimensionFn, config) {
    const groups = ruleFn(words);
    Object.keys(config).forEach(groupKey => {
        if (groups[groupKey]) {
            dimensionFn(groups[groupKey], config[groupKey]);
        }
    });
}

function setActiveRule(name, fn, defaultAction) {
    // Reset rule button styles
    ['Vowel_Consonant', 'Word_Length', 'Ascenders', 'Alphabet_Order'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.style.backgroundColor = '';
    });

    reset();
    activeRule = name;
    activeRuleFn = fn;
    const btn = document.getElementById(name);
    if (btn) btn.style.backgroundColor = '#a9a9a9';
    console.log(`Active Rule set to: ${name}`);
    if (Object.keys(activeDimensions).length > 0) {
        applyAllEffects();
    } else {
        reset();
        if (defaultAction) defaultAction();
    }
}

function triggerDimension(dimName, defaultValue) {
    const val = parseFloat(defaultValue);
    const btn = document.getElementById(dimName);

    if (activeDimensions[dimName] !== undefined) {
        delete activeDimensions[dimName];
        if (btn) btn.style.backgroundColor = '';
    } else {
        activeDimensions[dimName] = val;
        if (btn) btn.style.backgroundColor = '#a9a9a9';
    }
    applyAllEffects();
}

function applyAllEffects() {
    reset();
    Object.keys(activeDimensions).forEach(dimName => {
        const val = activeDimensions[dimName];
        if (activeRule && activeRuleFn) {
            const config = dimensionSettings[dimName] ? dimensionSettings[dimName][activeRule] : null;
            if (config) {
                mapRuleToDimension(words, activeRuleFn, dimensionFunctions[dimName], config);
            } else {
                dimensionFunctions[dimName](words, val);
            }
        } else {
            dimensionFunctions[dimName](words, val);
        }
    });
}

//TODO - TOGGLE
function toggleSplitMode() {
    splitMode = splitMode === 'word' ? 'letter' : 'word';
    const btn = document.getElementById('split-toggle-btn');
    if (btn) btn.innerText = `Mode: ${splitMode === 'word' ? 'Word' : 'Letter'}`;
    setupPoem(poemData, splitMode); // Re-process with new mode
    applyAllEffects();
}
// add line break toggle

function toggleLineBreak() {
    lineBreakMode = lineBreakMode === 'On' ? 'Off' : 'On';
    const btn = document.getElementById('linebreak-toggle-btn');
    if (btn) btn.innerText = `Line Break: ${lineBreakMode}`;
    setupPoem(poemData, splitMode);
    applyAllEffects();
}

//TODO - DIMENSIONS/MANIPULATIONS
function scalingDimension(words, styleApplier, value) {
    words.forEach(word => styleApplier(word, value));
}

function rotate(words, degrees) {
    scalingDimension(words, (w, v) => w.style.transform = `rotate(${v}deg)`, degrees);
}

function alterSpacing(words, pixels) {
    scalingDimension(words, (w, v) => w.style.marginRight = `${v}px`, pixels);
}

function changeFontSize(words, size) {
    scalingDimension(words, (w, v) => w.style.fontSize = `${v}px`, size);
}

function blurWords(words, blurAmount) { 
    scalingDimension(words, (w, v) => w.style.filter = `blur(${v}px)`, blurAmount);
}

function elevate(words, pixels) {
    scalingDimension(words, (w, v) => w.style.transform = `translateY(${v}px)`, pixels);
}

function changeFontWeight(words, weight) {
    scalingDimension(words, (w, v) => w.style.fontWeight = v, weight);
}

function wordsFall(words) {
    fallTimeouts.forEach(clearTimeout);
    fallTimeouts = [];
    
    words.forEach((word, index) => {
        const timeoutId = setTimeout(() => word.classList.add('falling'), index * 50);
        fallTimeouts.push(timeoutId);
    });
}

//TODO - LOGIC FUNCTIONS
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

function getHeight(words) {
    const groups = { high: [], low: [] };
    const ascenderRegex = /[bdfhkltA-Z]/;
    words.forEach(el => {
        if (ascenderRegex.test(el.innerText)) groups.high.push(el);
        else groups.low.push(el);
    });
    return groups;
}

function getAlphaOrder(words) {
    const groups = { firstHalf: [], secondHalf: [] };
    const firstHalfRegex = /[a-mA-M]/;
    words.forEach(word => {
        let charToCheck = splitMode === 'letter' ? word.innerText : word.innerText.charAt(0);
        if (firstHalfRegex.test(charToCheck)) {
            groups.firstHalf.push(word);
        } else {
            groups.secondHalf.push(word);
        }
    });
    return groups;
}

// TODO - STATEFUL SETTINGS
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
        'Ascenders': { high: 15, low: -5 },
        'Alphabet_Order': { firstHalf: -15, secondHalf: 15 }
    },
    'spacing': {
        'Vowel_Consonant': { vowels: 20, consonants: 5 },
        'Word_Length': { short: 0, medium: 10, long: 20 },
        'Ascenders': { high: 20, low: 5 },
        'Alphabet_Order': { firstHalf: 5, secondHalf: 20 }
    },
    'fontsize': {
        'Vowel_Consonant': { vowels: 12, consonants: 24 },
        'Word_Length': { short: 12, medium: 18, long: 24 },
        'Ascenders': { high: 24, low: 14 },
        'Alphabet_Order': { firstHalf: 14, secondHalf: 24 }
    },
    'blur': {
        'Vowel_Consonant': { vowels: 2, consonants: 0 },
        'Word_Length': { short: 0, medium: 2, long: 4 },
        'Ascenders': { high: 0, low: 3 },
        'Alphabet_Order': { firstHalf: 0, secondHalf: 2 }
    },
    'elevate': {
        'Vowel_Consonant': { vowels: -10, consonants: 10 },
        'Word_Length': { short: -10, medium: 0, long: 10 },
        'Ascenders': { high: -10, low: 5 },
        'Alphabet_Order': { firstHalf: -10, secondHalf: 10 }
    },
    'fontweight': {
        'Vowel_Consonant': { vowels: 700, consonants: 100 },
        'Word_Length': { short: 900, medium: 400, long: 100 },
        'Ascenders': { high: 700, low: 100 },
        'Alphabet_Order': { firstHalf: 700, secondHalf: 400 }
    }
};


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
