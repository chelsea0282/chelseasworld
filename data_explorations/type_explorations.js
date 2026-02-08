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

    // Attach all predefined controls
    controlConfigs.forEach(config => {
        const element = document.getElementById(config.id);
        if (element) {
            element.addEventListener(config.event, config.action);
        }
    });

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

// CONTROL CONFIGURATION
const controlConfigs = [
    { id: 'reset-btn', event: 'click', action: reset },
];

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

    // Reset the spacing slider to 0 to match the cleared styles
    const slider = document.getElementById('spacing-slider');
    if (slider) slider.value = 0;
}

// TODO - BUTTONS FOR THE DIFFERENT VARIATIONS
const variations = [
    // dimensions
    { type: 'header', label: 'Dimensions' },
    { id: 'rotate', label: 'Rotation', action: () => rotate(words, 45) },
    { id: 'spacing', label: 'Spacing', action: () => alterSpacing(words, 5) },
    { type: 'range', id: 'spacing-slider', label: '', min: 0, max: 50, value: 0, action: (e) => alterSpacing(words, e.target.value) },
    { id: 'fontsize', label: 'Font Size', action: () => changeFontSize(words, 50) },
    { id: 'blur', label: 'Blur', action: () => blurWords(words, 5) },
    { id: 'fall', label: 'Fall', action: () => wordsFall(words) },
    // { id: 'time', label: 'Time Pulse', action: startTimeEffects },
    // { id: 'fall', label: 'Gravity', action: wordsFall },
    // remove all the linebreaks
    
    // rules - for now just color showing
    { type: 'header', label: 'Rules' },
    { id: 'split-toggle-btn', label: 'Mode: Letter', action: toggleSplitMode },
    { id: 'Vowel_Consonant', label: 'Vowel/Consonant', action: vowelConsonantGrouping }, 
    { id: 'Word_Length', label: 'Word Length', action: lengthGrouping },
    { id: 'Semantic_NLP', label: 'Semantic NLP', action: processPoemSemantics },
    { id: 'Ascenders', label: 'Ascenders', action: highlightAscenders },
    
    // variations
    // rotation (technically I can do 45, 90, 180, mix of these)
    // spacing (randomized, larger, smaller based on different rules)
    { id: 'Size_Letter', label: 'Size Letter', action: sizeLetter },
    
];

//TODO - DIMENSIONS/MANIPULATION TYPE 
function rotate(words, degrees) {
    words.forEach(word => {
        // const hasRotate = word.style.transform && word.style.transform.includes('rotate');
        // word.style.transform = hasRotate ? '' : `rotate(${degrees}deg)`;
        word.style.transform += `rotate(${degrees}deg)`;
    });
}

function alterSpacing(words, pixels) {
    words.forEach(word => {
        // word.style.marginRight = `${Math.random() * 20}px`
        word.style.marginRight = `${pixels}px`
    });

    // Update the slider UI to reflect the current spacing value
    const slider = document.getElementById('spacing-slider');
    if (slider) {
        slider.value = pixels;
    }
}


function changeFontSize(words, size) {
    words.forEach(word => {
        // const randomSize = Math.random() * 30 + 10; // Size between 10px and 40px
        // word.style.fontSize = `${randomSize}px`;
        word.style.fontSize = `${size}px`;
    });
}

function blurWords(words, blurAmount) {
    // words.forEach(w => w.style.filter = `blur(${Math.random() * 4}px)`);
    words.forEach(w => w.style.filter = `blur(${blurAmount}px)`);
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

//TODO - RULES
function toggleSplitMode() {
    splitMode = splitMode === 'word' ? 'letter' : 'word';
    const btn = document.getElementById('split-toggle-btn');
    if (btn) btn.innerText = `Mode: ${splitMode === 'word' ? 'Word' : 'Letter'}`;
    reset(); // Clear any active effects
    setupPoem(poemData, splitMode); // Re-process with new mode
}

function vowelConsonantGrouping(words, func1, func2) {
    const vowels = 'aeiouAEIOU';
    words.forEach(word => {
        let firstChar;
        if (splitMode === 'letter') {
            // In letter mode, check the letter itself
            firstChar = word.innerText;
        } else {
            // In word mode, check the first letter of the word
            firstChar = word.innerText.charAt(0);
        }
        
        if (vowels.includes(firstChar)) {
            word.style.color = 'purple'; // Vowels
        } else {
            word.style.color = 'orange'; // Consonants
        }
    });
}

function lengthGrouping(words) {
    words.forEach(word => {
        const len = word.innerText.length;
        word.style.color = len < 3 ? 'red' : len < 5 ? 'blue' : 'green';
    });
}

// separating word/letters by their height
function highlightAscenders(elements) {
    // b, d, f, h, k, l, t and all Uppercase letters.
    // (m, n, a, c, e, etc. stay within the midline)
    const ascenderRegex = /[bdfhkltA-Z]/;

    elements.forEach(el => {
        if (ascenderRegex.test(el.innerText)) {
            el.style.color = 'royalblue';
            el.style.fontWeight = 'bold';
            el.style.transform += ' translateY(-5px)'; // Move up slightly to emphasize height
        } else {
            el.style.color = 'lightgray'; // Dim letters that don't go above midline
        }
    });
}

function processPoemSemantics(wordElements) {
    // 1. Safety Check: Ensure libraries are loaded
    if (typeof nlp === 'undefined' ) {
        console.warn("Missing libraries: Compromise (nlp) ");
        alert("This feature requires the 'compromise'  libraries.");
        return;
    }

    if (typeof Sentiment === 'undefined') {
        console.warn("Missing libraries:  Sentiment.");
        alert("This feature requires the 'sentiment' libraries.");
        return;
    }

    // 2. Mode Check: Semantics only work on whole words, not letters.
    if (splitMode === 'letter') {
        splitMode = 'word';
        const toggleBtn = document.getElementById('split-toggle-btn');
        if (toggleBtn) toggleBtn.innerText = 'Mode: Word';
        
        // Re-render the poem in word mode
        setupPoem(poemData, splitMode);
        // Update the local reference to the new global words array
        wordElements = words; 
    }

    console.log('processPoemSemantics called with', wordElements.length, 'elements');
    
    try {
        const sentiment = new Sentiment();

        wordElements.forEach(wordEl => {
            const text = wordEl.innerText.trim();
            
            const doc = nlp(text);

            // 1. FILTER: Is it a "content" word? 
            // We look for Nouns, Verbs, Adjectives, or Adverbs.
            const isImportant = doc.match('#Noun || #Verb || #Adjective || #Adverb').found;

            if (isImportant) {
                // 2. CONNOTATION: Check the sentiment score
                const result = sentiment.analyze(text);
                
                // Apply visual styles based on connotation
                if (result.score > 0) {
                    wordEl.style.color = 'gold';       // Positive connotation
                    wordEl.style.fontWeight = 'bold';
                } else if (result.score < 0) {
                    wordEl.style.color = 'crimson';    // Negative connotation
                    wordEl.style.fontWeight = 'bold';
                } else {
                    wordEl.style.color = 'white';      // Neutral important word
                    wordEl.style.borderBottom = '1px solid gray';
                }
                wordEl.style.opacity = '1';
            } else {
                // Structural words (the, of, and) get dimmed
                wordEl.style.opacity = '0.3';
            }
        });
    } catch (error) {
        console.error('Error in processPoemSemantics:', error);
    }
}

// 5. COMBO VARIATIONS
function sizeLetter(words) {
    words.forEach(word => word.className = 'letter');
    changeFontSize(words);
}

// TODO - PONDER ON THIS ONE A BIT MORE BC IT'S MORE COMPLICATED

// function startTimeEffects(words) {
//     if (timeInterval) clearInterval(timeInterval);
//     let angle = 0;
//     timeInterval = setInterval(() => {
//         angle += 5;
//         words.forEach(word => word.style.transform = `rotate(${angle}deg)`);
//     }, 100);
// }
