let words = [];
let timeInterval;

fetch('type.txt')
    .then(response => response.text())
    .then(data => {
        // Split the text into an array of lines
        const lines = data.split(/\r?\n/);

        // Extract title (first line) and author (second line)
        const title = lines[0];
        const author = lines[1];

        // The rest of the content (join from the third line onwards)
        const content = lines.slice(2).join('\n');

        // Place the content into the HTML elements
        document.getElementById('type-title').innerText = title;
        document.getElementById('type-author').innerText = author;

        // Split content into words and wrap each in a span, preserving whitespace and line breaks
        const contentDiv = document.getElementById('type-content');
        const parts = content.split(/(\s+)/);  // Split and capture whitespace
        words = [];
        parts.forEach(part => {
            if (part.trim() === '') {
                // It's whitespace (including line breaks), add as text node
                contentDiv.appendChild(document.createTextNode(part));
            } else {
                // It's a word, wrap in span
                const span = document.createElement('span');
                span.className = 'word';
                span.innerText = part;
                contentDiv.appendChild(span);
                words.push(span);
            }
        });

        // Add event listeners for controls
        document.getElementById('rotate-btn').addEventListener('click', toggleRotation);
        document.getElementById('spacing-slider').addEventListener('input', adjustSpacing);
        document.getElementById('time-btn').addEventListener('click', startTimeEffects);
        document.getElementById('fall-btn').addEventListener('click', wordsFall);
        document.getElementById('group-btn').addEventListener('click', semanticGrouping);

        // Add event listeners for variations
        document.getElementById('variation1').addEventListener('click', toggleRotation);
        document.getElementById('variation2').addEventListener('click', adjustSpacing);
        document.getElementById('variation3').addEventListener('click', startTimeEffects);
        document.getElementById('variation4').addEventListener('click', wordsFall);
        document.getElementById('variation5').addEventListener('click', semanticGrouping);
        document.getElementById('reset-btn').addEventListener('click', reset);

        document.getElementById('reset-btn').addEventListener('click', reset);
    })
    .catch(error => {
        console.error('Error fetching the text file:', error);
    });

// functions for the manipulations

function toggleRotation() {
    words.forEach(word => word.classList.toggle('rotated'));
}

function adjustSpacing(event) {
    const spacing = event.target.value;
    words.forEach(word => {
        word.style.marginRight = spacing + 'px';
    });
}

function startTimeEffects() {
    if (timeInterval) clearInterval(timeInterval);
    let angle = 0;
    timeInterval = setInterval(() => {
        angle += 5;
        words.forEach(word => {
            word.style.transform = `rotate(${angle}deg)`;
        });
    }, 100);
}

function wordsFall() {
    words.forEach((word, index) => {
        setTimeout(() => {
            word.classList.add('falling');
        }, index * 100);
    });
}

function semanticGrouping() {
    // Simple grouping: color words based on length
    words.forEach(word => {
        const length = word.innerText.trim().length;
        if (length < 3) word.style.color = 'red';
        else if (length < 5) word.style.color = 'blue';
        else word.style.color = 'green';
    });
}

function reset() {
    if (timeInterval) clearInterval(timeInterval);
    words.forEach(word => {
        word.className = 'word';
        word.style = '';
    });
}
