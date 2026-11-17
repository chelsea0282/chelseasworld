// Homepage behavior. Project records live in content/*.js and are assembled
// by content/library.js so the presentation layer can change independently.
/* Reflections:
- I love that this class made me build a website which has been on my TODO list for years.
- Love that it was a great oppertunity to customize and build from scratch which is what I wanted all along.
- much larger confidence that I can ddo anything technical after finishing the class (I know I could have before but maybe not as 100% confident as I am now). Before I knew I could understand, but now I know I can undersatnd and I can learn how to do things even if I might not know how to do it right off the bat. 
- With the website, I love that I really leaned into the aesthetics the most and started there (spent the most time coming up with the concept and aesthetic of my website the most)
- I will likely keep developing this webiste more for it to be mroe comprehensively holding all of my information. 
*/

/* FEEDBACK
- full commit to the windows xp experience and go all in, make the clicking sounds, icons, full aesthetic. 
- make clear what you're inspired by which is WindowsXP
- why are some of these randomly not working? 
- random things aren't consistent like play music button, and also the font style of it's chelsea's world
- fix the small things like the spacing, etc. 
- what is the relationship between the floating windows and the static folders?
- maybe have a "launch app" button on the folder that opens the floating window?
- I want to make this working on mobile as well
*/
function renderLibrary() {
    const library = window.CHELSEA_LIBRARY;
    const content = library.content;
    const designSystem = document.getElementById('design-system');
    const folders = document.getElementById('desktop-icons');
    const windows = document.getElementById('project-windows');

    document.documentElement.dataset.designSystem = library.designSystem;
    if (designSystem && library.designSystems[library.designSystem]) {
        designSystem.href = library.designSystems[library.designSystem];
    }

    library.navigation.forEach(id => {
        const project = content[id];
        const folder = document.createElement('div');
        folder.className = 'project-folder static-item';
        folder.dataset.folderId = id;
        if (project.launchUrl) folder.dataset.launchUrl = project.launchUrl;
        folder.innerHTML = `<img src="${project.icon}" alt=""><p>${project.title}</p>`;
        folders.appendChild(folder);
    });

    library.featured.forEach(id => {
        const project = content[id];
        const windowElement = document.createElement('div');
        windowElement.className = 'project-window float-item';
        windowElement.dataset.projectId = id;
        if (project.placement) {
            windowElement.style.left = project.placement.left;
            windowElement.style.top = project.placement.top;
        }
        windowElement.innerHTML = `<div class="window-header"><span class="window-title"><span class="window-icon" aria-hidden="true">▣</span>${project.title}</span><span class="window-controls"><button type="button" class="window-control" aria-label="Minimize">_</button><button type="button" class="window-control" aria-label="Maximize">□</button><button type="button" class="window-control" aria-label="Close">×</button></span></div><div class="window-content"><p>${project.preview}</p></div>`;
        windows.appendChild(windowElement);
    });
}

function renderProjectContent(project) {
    const paragraphs = (project.documentation || []).map(text => `<p>${text}</p>`).join('');
    const links = (project.links || []).map(link => `<li><a href="${link.url}" target="_blank" rel="noopener">${link.label}</a></li>`).join('');
    const media = (project.media || []).map(item => item.type === 'iframe'
        ? `<iframe width="100%" height="600" src="${item.url}" title="${item.title}" frameborder="0" allowfullscreen></iframe>`
        : `<img src="${item.url}" alt="${item.title}">`).join('');
    return `${paragraphs}${links ? `<ul>${links}</ul>` : ''}${media}`;
}

// --- HORIZONTAL GLITCH (XP blue-screen artifact, not a neon border) ---
function dynamicGlitchBorder() {
    const floatItems = document.querySelectorAll('.float-item');
    const colors = ['#0054e3', '#3c8df5', '#f7f7f7', '#ffcc00'];

    floatItems.forEach(item => {
        item.style.setProperty('--glitch-shift', `${Math.floor(Math.random() * 13) - 6}px`);
        item.style.setProperty('--glitch-accent', colors[Math.floor(Math.random() * colors.length)]);
    });
}

// Keep the artifact occasional enough that the window chrome remains legible.
setInterval(dynamicGlitchBorder, 140);


document.addEventListener('DOMContentLoaded', () => {
    renderLibrary();
    updateTaskbarClock();
    setInterval(updateTaskbarClock, 30000);
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
        // Resolve responsive library placements once, then animate in pixels.
        const taskbarHeight = document.getElementById('xp-taskbar')?.offsetHeight || 0;
        const maxX = Math.max(0, window.innerWidth - item.offsetWidth);
        const maxY = Math.max(0, window.innerHeight - taskbarHeight - item.offsetHeight);
        const placement = item.getBoundingClientRect();
        const randomX = Math.random() * Math.max(1, maxX - 100) + 50;
        const randomY = Math.random() * Math.max(1, maxY - 50) + 25;
        const x = Math.max(0, Math.min(Number.isFinite(placement.left) ? placement.left : randomX, maxX));
        const y = Math.max(0, Math.min(Number.isFinite(placement.top) ? placement.top : randomY, maxY));
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

            const taskbarHeight = document.getElementById('xp-taskbar')?.offsetHeight || 0;
            if (newY < 0 || newY + height > window.innerHeight - taskbarHeight) {
                item.velocity.y *= -1; 
                newY = Math.max(0, Math.min(newY, window.innerHeight - taskbarHeight - height)); 
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

    // Function to get content from the shared library
    function getProjectContent(id) {
        const content = window.CHELSEA_LIBRARY.content[id];
        if (content) {
            return {
                title: content.title,
                content: renderProjectContent(content)
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

            // Folders with a data-launch-url go straight there instead of
            // opening a modal. Add that attribute to any icon you want to be
            // a one-click launcher.
            const launchUrl = item.getAttribute('data-launch-url');
            if (launchUrl) {
                window.location.href = launchUrl;
                return;
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

    function updateTaskbarClock() {
        const clock = document.getElementById('taskbar-clock');
        if (clock) {
            clock.textContent = new Intl.DateTimeFormat([], {
                hour: 'numeric',
                minute: '2-digit'
            }).format(new Date());
        }
    }
    
});