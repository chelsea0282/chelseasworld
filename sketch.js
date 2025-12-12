// PROJECT CONTENT DATABASE
// Centralized data structure for all folders and projects. 
// TOOD: move this into a different file later on.
const projectData = {
    
    // Folders (Corresponds to data-folder-id)
    'creative-comp-projects': {
        title: "CC Projects",
        description: `
            <p>My CC projects!.</p>
            <ul>
                <p><a href="https://editor.p5js.org/hanc190/full/TC91xLOUY" target="_blank">A1 - Memory Scene</a> </p>
                <p><a href="https://editor.p5js.org/hanc190/full/p0FiCMP_p" target="_blank">A2 - Face Generator</a> </p>
                <p><a href="https://editor.p5js.org/hanc190/full/FNWqBbvMM" target="_blank">A3 - A neurodivergent clock</a> </p>
                <p><a href="https://editor.p5js.org/hanc190/full/C0CcPKFsF" target="_blank">A4 - Optical Illusion</a> </p>
                <p><a href="https://editor.p5js.org/hanc190/full/_VTLRhRZJ" target="_blank">A5 - An exquisite Corpse</a> </p>
                <p><a href="https://editor.p5js.org/hanc190/full/f4CO8CgRi" target="_blank">A6 - Data Garden</a> </p>
                <p><a href="https://editor.p5js.org/hanc190/full/fZm5F-KNc" target="_blank">A7 - Day in my Life</a> </p>
                <p><a href="https://chelseas.world" target="_blank">A8 - Chelsea's World</a>
            </ul>
        `,
    },
    'google-projects': {
        title: "Googogle projects",
        description: `
            <p>I'm also a PM working on AI@Google.</p>
            <ul>
                <p><a href="https://infinitewonderland.withgoogle.com/" target="_blank">Infinite Wonderland</a> </p>
                <p><a href="https://labs.google/about" target="_blank">PMed Labs.Google</a> </p>
                <p><a href="https://www.theverge.com/2022/11/17/23463133/google-search-ar-sneakers-beauty-inclusive-features" target="_blank">spinny shoes on Google Shopping</a> </p>
                <p><a href="https://labs.google/fx/" target="_blank">Generative AI tools from Google (free)</a> </p>
            </ul>
        `,
    },

    // Windows (Corresponds to data-project-id)
    // example data format
    // '3': {
    //     title: "Project 3: Complex 3D Environment",
    //     description: `
    //         <p>A Three.js experience demonstrating my skills in 3D rendering and shading languages. This required optimization for web performance.</p>
    //         <img src="assets/images/project1-full.jpg" alt="Full Project 1 Screenshot" style="max-width: 100%; border: 2px solid var(--cyber-pink); margin-bottom: 15px;">
    //         <p>Click below to jump into the scene!</p>
    //         <a href="https://chelseas.world/3d-scene" target="_blank">Enter The Matrix</a>
    //     `,
    // },

    '1': {
        title: "A Project",
        description: `
            <p>hehe it works.</p>
        `,
    },
    '2': {
        title: "Data Garden",
        description: `
            <p>This garden represents my exploration of data visualization through generative art. There are factors like time or how often I see them that affects the design like leaf density, and bloom type that varies</p>
            <iframe 
                width="100%" 
                height="600" 
                src="/p5-sketches/garden-viz.html" 
                frameborder="0" 
                style="border: 2px solid #FF00FF; background-color: rgb(104, 160, 72);"
                allowfullscreen>
            </iframe>
            <p><strong>Try hovering over the plants!</strong> </p>
        `,
    },
    '3': {
        title: "Day in My Life",
        description: `
            <p>What it feels like to live a day in Chelsea's world</p>
            <iframe 
                width="100%" 
                height="600" 
                src="/p5-sketches/minigame.html" 
                frameborder="0" 
                allowfullscreen>
            </iframe>
            <p><strong>It's another exciting day!</strong> </p>
        `,
    },
    
};

// --- DYNAMIC BORDER GLITCH (Runs on a fast interval) ---
function dynamicGlitchBorder() {
    const floatItems = document.querySelectorAll('.float-item');
    const colors = ["#FF00FF", "#00FFFF", "#000000", "#FFFFFF"]; // Pink, Cyan, Black, White

    floatItems.forEach(item => {
        // Generate random offsets for X and Y, making them slight and quick
        const randomOffset = () => Math.floor(Math.random() * 8 - 4); // -4 to 3
        const randomColor = () => colors[Math.floor(Math.random() * colors.length)];
        
        item.style.boxShadow = `
            ${randomOffset()}px ${randomOffset()}px 0px 0px ${randomColor()}, 
            ${randomOffset()}px ${randomOffset()}px 0px 0px ${randomColor()}, 
            ${randomOffset()}px ${randomOffset()}px 0px 0px ${randomColor()},
            0 0 10px rgba(0, 0, 0, 0.5)
        `;
    });
}

// Run the glitch function every 50 milliseconds (fast flickering)
setInterval(dynamicGlitchBorder, 50);


document.addEventListener('DOMContentLoaded', () => {
    // Select ONLY the floating project windows for movement
    const floatItems = document.querySelectorAll('.float-item'); 
    // Select ALL clickable items (floating windows, static folders, etc.)
    const clickableItems = document.querySelectorAll('.float-item, .static-item'); 
    
    const modal = document.getElementById('project-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const musicPlayer = document.getElementById('background-music');
    const musicToggleBtn = document.getElementById('music-toggle');
    
    // --- 1. Music Player Functionality ---
    musicToggleBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevents the click from bubbling up to the parent
        if (musicPlayer.paused) {
            musicPlayer.play().catch(error => {
                console.log("Audio play initiated by user click.");
            });
            musicToggleBtn.textContent = "Pause Music";
        } else {
            musicPlayer.pause();
            musicToggleBtn.textContent = "Play Music";
        }
    });

    // --- 2. Floating/Bouncing/Draggable Functionality (Only for .float-item) ---

    // Initial random placement & velocity setup for floating items
    floatItems.forEach(item => {
        // Initial placement ensures items start within the viewport
        const x = Math.random() * (window.innerWidth - item.offsetWidth - 300) + 50; 
        const y = Math.random() * (window.innerHeight - item.offsetHeight - 100) + 50;
        item.style.left = `${x}px`;
        item.style.top = `${y}px`;
        item.velocity = { 
            x: (Math.random() - 0.5) * 0.5, 
            y: (Math.random() - 0.5) * 0.5 
        };
    });

    function updatePositions() {
        floatItems.forEach(item => { 
            if (item.isDragging) return; 

            let currentX = parseFloat(item.style.left);
            let currentY = parseFloat(item.style.top);

            let newX = currentX + item.velocity.x;
            let newY = currentY + item.velocity.y;

            // Collision detection
            const width = item.offsetWidth;
            const height = item.offsetHeight;
            
            if (newX < 0 || newX + width > window.innerWidth) {
                item.velocity.x *= -1; 
                newX = Math.max(0, Math.min(newX, window.innerWidth - width)); 
            }

            if (newY < 0 || newY + height > window.innerHeight) {
                item.velocity.y *= -1; 
                newY = Math.max(0, Math.min(newY, window.innerHeight - height)); 
            }

            item.style.left = `${newX}px`;
            item.style.top = `${newY}px`;
        });

        requestAnimationFrame(updatePositions);
    }

    updatePositions(); // Start the bouncing animation

    // Draggable Functionality
    floatItems.forEach(item => {
        item.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; 
            
            item.isDragging = true;
            item.startX = e.clientX;
            item.startY = e.clientY;
            item.startLeft = parseFloat(item.style.left);
            item.startTop = parseFloat(item.style.top);
            
            // Bring dragged item to the front
            document.querySelectorAll('.float-item').forEach(i => i.style.zIndex = '5');
            item.style.zIndex = '10'; 
        });
    });

    document.addEventListener('mousemove', (e) => {
        floatItems.forEach(item => {
            if (item.isDragging) {
                const deltaX = e.clientX - item.startX;
                const deltaY = e.clientY - item.startY;
                
                item.style.left = `${item.startLeft + deltaX}px`;
                item.style.top = `${item.startTop + deltaY}px`;
            }
        });
    });

    document.addEventListener('mouseup', () => {
        floatItems.forEach(item => {
            item.isDragging = false;
        });
    });

    // --- 3. Modal Functionality (Click to Open) ---

    function openModal(title, contentHTML) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = contentHTML;
        modal.classList.remove('hidden');
    }

    // Function to get content from the global projectData object
    function getProjectContent(id) {
        const content = projectData[id]; 
        if (content) {
            return {
                title: content.title,
                content: content.description 
            };
        }
        return { 
            title: 'Error: Content Not Found', 
            content: '<p>Project ID or Folder ID is missing from the JavaScript database.</p>' 
        };
    }


    // Listener for opening the modal (applies to both float-item and static-item)
    clickableItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Drag check only for floating items
            if (item.classList.contains('float-item')) {
                if (Math.abs(e.clientX - item.startX) > 5 || Math.abs(e.clientY - item.startY) > 5) {
                    return; 
                }
            }

            // Get the ID from the correct attribute
            const id = item.getAttribute('data-folder-id') || item.getAttribute('data-project-id');
            
            const content = getProjectContent(id); 
            openModal(content.title, content.content);

            // Pause the bouncing of the item that was clicked on
            if (item.classList.contains('float-item')) {
                item.isDragging = true; 
            }
        });
    });

    // Listener for closing the modal
    closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        // Resume all movement
        floatItems.forEach(item => item.isDragging = false); 
    });
    
});