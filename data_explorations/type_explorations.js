fetch('type.txt')
    .then(response => response.text()) // Get the response as plain text
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
        document.getElementById('type-content').innerText = content; // Use innerText to preserve line breaks and treat as plain text
    })
    .catch(error => {
        console.error('Error fetching the text file:', error);
    });
