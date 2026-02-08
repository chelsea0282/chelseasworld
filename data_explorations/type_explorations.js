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
    // Add toggle button for split mode
    const controlsDiv = document.getElementById('controls');
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'split-toggle-btn';
    toggleBtn.innerText = `Mode: ${splitMode === 'word' ? 'Word' : 'Letter'}`;
    toggleBtn.addEventListener('click', () => {
        splitMode = splitMode === 'word' ? 'letter' : 'word';
        toggleBtn.innerText = `Mode: ${splitMode === 'word' ? 'Word' : 'Letter'}`;
        reset(); // Clear any active effects
        setupPoem(poemData, splitMode); // Re-process with new mode
    });
    controlsDiv.appendChild(toggleBtn);

    // Attach all predefined controls
    controlConfigs.forEach(config => {
        const element = document.getElementById(config.id);
        if (element) {
            element.addEventListener(config.event, config.action);
        }
    });

    // Create variation buttons dynamically
    variations.forEach(v => {
        const btn = document.createElement('button');
        btn.innerText = v.label;
        btn.className = 'variation-btn';
        btn.addEventListener('click', () => {
            reset();
            v.action(words);
        });
        controlsDiv.appendChild(btn);
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

// TODO - BUTTONS FOR THE DIFFERENT VARIATIONS
const variations = [
    // core functionalities 
    { id: 'rotate', label: 'Rotation', action: () => rotate(words, 45) },
    { id: 'spacing', label: 'Spacing', action: () => alterSpacing(words, 5) },
    { id: 'fontsize', label: 'Font Size', action: () => changeFontSize(words, 50) },
    { id: 'blur', label: 'Blur', action: () => blurWords(words, 5) },
    // { id: 'time', label: 'Time Pulse', action: startTimeEffects },
    // { id: 'fall', label: 'Gravity', action: wordsFall },
    // remove all the linebreaks
    
    
    // variations
    // rotation (technically I can do 45, 90, 180, mix of these)
    // spacing (randomized, larger, smaller based on different rules)
    { id: 'Size_Letter', label: 'Size Letter', action: sizeLetter },
    { id: 'Word_Length', label: 'Word Length', action: semanticGrouping },
    { id: 'Semantic_NLP', label: 'Semantic NLP', action: processPoemSemantics },
];

// CONTROL CONFIGURATION
const controlConfigs = [
    { id: 'rotate-btn', event: 'click', action: () => { reset(); toggleRotation(words, 45); } },
    { id: 'spacing-slider', event: 'input', action: adjustSpacing },
    // { id: 'time-btn', event: 'click', action: () => { reset(); startTimeEffects(words); } },
    { id: 'fall-btn', event: 'click', action: () => { reset(); wordsFall(words); } },
    { id: 'group-btn', event: 'click', action: () => { reset(); semanticGrouping(words); } },
    { id: 'reset-btn', event: 'click', action: reset },
];

//TODO - DIMENSIONS/MANIPULATION TYPE (SUPPORT FUNCTIONS)
function rotate(words, degrees) {
    words.forEach(word => {
        // const hasRotate = word.style.transform && word.style.transform.includes('rotate');
        // word.style.transform = hasRotate ? '' : `rotate(${degrees}deg)`;
        word.style.transform = `rotate(${degrees}deg)`;
    });
}

function alterSpacing(words, pixels) {
    words.forEach(word => {
        // word.style.marginRight = `${Math.random() * 20}px`
        word.style.marginRight = `${pixels}px`
    });
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

function semanticGrouping(words) {
    words.forEach(word => {
        const len = word.innerText.length;
        word.style.color = len < 3 ? 'red' : len < 5 ? 'blue' : 'green';
    });
}

function adjustSpacing(event) {
    const spacing = event.target.value;
    words.forEach(word => {
        word.style.marginRight = spacing + 'px';
    });
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

function wordsFall(words) {
    // Clear any existing fall timeouts
    fallTimeouts.forEach(clearTimeout);
    fallTimeouts = [];
    
    words.forEach((word, index) => {
        const timeoutId = setTimeout(() => word.classList.add('falling'), index * 50);
        fallTimeouts.push(timeoutId);
    });
}

function processPoemSemantics(wordElements) {
    console.log('processPoemSemantics called with', wordElements.length, 'elements');
    
    try {
        const sentiment = new Sentiment();
        console.log('Sentiment loaded:', sentiment);

        wordElements.forEach(wordEl => {
            const text = wordEl.innerText.trim();
            console.log('Processing word:', text);
            
            const doc = nlp(text);
            console.log('NLP doc:', doc);

            // 1. FILTER: Is it a "content" word? 
            // We look for Nouns, Verbs, Adjectives, or Adverbs.
            const isImportant = doc.match('#Noun || #Verb || #Adjective || #Adverb').found;
            console.log('Is important:', isImportant);

            if (isImportant) {
                // 2. CONNOTATION: Check the sentiment score
                const result = sentiment.analyze(text);
                console.log('Sentiment result:', result);
                
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
            } else {
                // Structural words (the, of, and) get dimmed
                wordEl.style.opacity = '0.3';
            }
        });
    } catch (error) {
        console.error('Error in processPoemSemantics:', error);
    }
}

