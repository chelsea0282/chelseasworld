function renderProjectContent(project) {
    const paragraphs = (project.documentation || []).map(text => `<p>${text}</p>`).join('');
    const links = (project.links || []).map(link => `<li><a href="${link.url}" target="_blank" rel="noopener">${link.label}</a></li>`).join('');
    const media = (project.media || []).map(item => item.type === 'iframe'
        ? `<iframe width="100%" height="600" src="${item.url}" title="${item.title}" frameborder="0" allowfullscreen></iframe>`
        : `<img src="${item.url}" alt="${item.title}">`).join('');
    return `${paragraphs}${links ? `<ul>${links}</ul>` : ''}${media}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const library = window.CHELSEA_LIBRARY;
    const modal = document.getElementById('project-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    let lastFocusedElement = null;

    function openModal(title, contentHTML) {
        lastFocusedElement = document.activeElement;
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = contentHTML;
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        closeModalBtn.focus();
    }

    document.querySelectorAll('.project-reference').forEach(button => {
        button.addEventListener('click', () => {
            const project = library.content[button.dataset.projectId];
            if (project) openModal(project.title, renderProjectContent(project));
        });
    });

    function closeModal() {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        if (lastFocusedElement) lastFocusedElement.focus();
    }
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', event => {
        if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
    });
});