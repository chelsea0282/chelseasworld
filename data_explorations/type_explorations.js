let words = [];
let timeInterval;
let splitMode = 'letter'; // 'word' or 'letter'
let poemData; // Store the fetched data for re-processing

// VARIATION CONTAINERS
const variations = [
    { id: 'rotate', action: toggleRotation },
    { id: 'spacing', action: adjustSpacingVariation },
    { id: 'time', action: startTimeEffects },
    { id: 'fall', action: wordsFall },
    { id: 'blur', action: blurWords },
    // To add more, just add an object here!
];

// LOAD IN THE POEM FROM TYPE.TXT FILE
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

// POEM SETUP
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

    // Attach to existing buttons
    document.getElementById('rotate-btn').addEventListener('click', () => {
        reset();
        toggleRotation(words);
    });
    document.getElementById('spacing-slider').addEventListener('input', adjustSpacing);
    document.getElementById('time-btn').addEventListener('click', () => {
        reset();
        startTimeEffects(words);
    });
    document.getElementById('fall-btn').addEventListener('click', () => {
        reset();
        wordsFall(words);
    });
    document.getElementById('group-btn').addEventListener('click', () => {
        reset();
        semanticGrouping(words);
    });

    // Attach variations to variation buttons
    variations.forEach((v, index) => {
        const btnId = `variation${index + 1}`;
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => {
                reset();
                v.action(words);
            });
        }
    });

    document.getElementById('reset-btn').addEventListener('click', reset);
}

// 4. MODULAR MANIPULATIONS
function toggleRotation(words) {
    words.forEach(word => word.classList.toggle('rotated'));
}

function adjustSpacingVariation(words) {
    words.forEach(word => word.style.marginRight = `${Math.random() * 20}px`);
}

function startTimeEffects(words) {
    if (timeInterval) clearInterval(timeInterval);
    let angle = 0;
    timeInterval = setInterval(() => {
        angle += 5;
        words.forEach(word => word.style.transform = `rotate(${angle}deg)`);
    }, 100);
}

function wordsFall(words) {
    words.forEach((word, index) => {
        setTimeout(() => word.classList.add('falling'), index * 50);
    });
}

function semanticGrouping(words) {
    words.forEach(word => {
        const len = word.innerText.length;
        word.style.color = len < 3 ? 'red' : len < 5 ? 'blue' : 'green';
    });
}

function blurWords(words) {
    words.forEach(w => w.style.filter = `blur(${Math.random() * 4}px)`);
}

function adjustSpacing(event) {
    const spacing = event.target.value;
    words.forEach(word => {
        word.style.marginRight = spacing + 'px';
    });
}

function reset() {
    if (timeInterval) clearInterval(timeInterval);
    words.forEach(word => {
        word.className = 'word';
        word.style = '';
    });
}