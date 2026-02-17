// Cargar página por defecto
function loadDefaultPage() {
    fetch('invite.html')
        .then(response => {
            if (!response.ok) throw new Error('Error cargando página');
            return response.text();
        })
        .then(data => {
            const mainPage = document.getElementById('mainPage');
            if (mainPage) mainPage.innerHTML = data;
        })
        .catch(error => console.error('Error cargando página por defecto:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dark mode if saved
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    // Solo cargar página por defecto si NO estamos en index.html
    if (!window.location.pathname.includes('index.html')) {
        loadDefaultPage();
    }
    
    // Event delegation para los formularios de login
    document.addEventListener('submit', function(e) {
        if (e.target.id === 'loginForm') {
            e.preventDefault();
            handleFormSubmit(e.target);
        }
        if (e.target.id === 'searchForm') {
            e.preventDefault();
            handleSearch(e.target);
        }
    });

    // Botón de invitado
    const guestBtn = document.getElementById('guestBtn');
    if (guestBtn) {
        guestBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'invite.html';
        });
    }

    // Manejar clics en "Cerrar sesión" del menú de usuario
    const userMenuItems = document.querySelectorAll('.userMenuItem');
    userMenuItems.forEach(item => {
        if (item.textContent.includes('Cerrar sesión')) {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
    });

    // Inicializar búsqueda en tiempo real
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterBySearch(this.value);
        });
    }

    // Inicializar botones de filtros
    const filterBtns = document.querySelectorAll('.filterBtn, #filterBtn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', openFilters);
    });

    // Tarjetas de documentos clickables
    const docCards = document.querySelectorAll('.docCard, article.docCard');
    docCards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('h3').textContent;
            openDocument(title);
        });
    });
});

function handleFormSubmit(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    console.log('Form data:', data);
    // Redirigir a página principal (main.html)
    window.location.href = 'main.html';
}

function handleSearch(form) {
    const query = form.querySelector('input[name="query"]').value;
    console.log('Searching for:', query);
    filterBySearch(query);
}

function filterBySearch(query) {
    const cards = document.querySelectorAll('.docCard');
    const lowerQuery = query.toLowerCase();
    
    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        
        if (title.includes(lowerQuery) || description.includes(lowerQuery)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

function openFilters() {
    const filterPanel = document.getElementById('filterPanel');
    if (filterPanel) {
        filterPanel.classList.add('active');
    }
}

function closeFilters() {
    const filterPanel = document.getElementById('filterPanel');
    if (filterPanel) {
        filterPanel.classList.remove('active');
    }
}

function clearAllFilters() {
    // Desmarcar todos los checkboxes
    const checkboxes = document.querySelectorAll('input[name="filter"]');
    checkboxes.forEach(cb => cb.checked = false);
    
    // Mostrar todos los documentos
    const cards = document.querySelectorAll('.docCard');
    cards.forEach(card => {
        card.classList.remove('hidden');
    });
    
    // Cerrar panel de filtros si está abierto
    closeFilters();
}

function applyFilters() {
    const checkboxes = document.querySelectorAll('input[name="filter"]:checked');
    const selectedFilters = Array.from(checkboxes).map(cb => cb.value);
    const cards = document.querySelectorAll('.docCard');
    
    cards.forEach(card => {
        const cardFilter = card.getAttribute('data-filter');
        
        if (selectedFilters.length === 0) {
            card.classList.remove('hidden');
        } else if (selectedFilters.includes(cardFilter)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
    
    closeFilters();
}

function openDocument(title) {
    // Verificar si el usuario es invitado
    const currentUrl = window.location.pathname;
    if (currentUrl.includes('invite.html')) {
        alert('Debes iniciar sesión para acceder a los documentos.');
        return;
    }
    // Guardar el nombre del documento en sessionStorage y redirigir
    sessionStorage.setItem('selectedDocument', title);
    window.location.href = 'document.html';
}

function openIndex() {
    window.location.replace("index.html");
}

function showSearch() {
    const el = document.getElementById("nav_search_extension");
    if (!el) return;
    
    if (el.style.display === "block") {
        el.style.display = "none";
        el.disabled = true;
    } else {
        el.style.display = "block";
        el.disabled = false;
        try { el.focus(); } catch (e) {}
    }
    
    return false;
}

function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    const btn = document.getElementById('navUserBtn') || document.getElementById('navUserButton');
    
    if (!menu || !btn) return false;
    
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
        document.removeEventListener('click', outsideClickListener);
    } else {
        menu.style.display = 'block';
        menu.style.visibility = 'hidden';
        
        const rect = btn.getBoundingClientRect();
        const mw = menu.offsetWidth;
        let left = rect.right - mw;
        if (left < 8) left = 8;
        
        let top = rect.bottom;
        const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        if (top + menu.offsetHeight > viewportHeight - 8) {
            top = viewportHeight - menu.offsetHeight - 8;
            if (top < 8) top = 8;
        }
        
        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
        menu.style.visibility = '';
        setTimeout(() => { document.addEventListener('click', outsideClickListener); }, 0);
    }
    
    return false;
}

function outsideClickListener(e) {
    const menu = document.getElementById('userMenu');
    const btn = document.getElementById('navUserButton');
    
    if (!menu || !btn) return;
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
        menu.style.display = 'none';
        document.removeEventListener('click', outsideClickListener);
    }
}

// Document page functions
let currentPage = 1;
let totalPages = 1;
let selectedDocumentName = null;

// Mapeo de nombres de documentos a rutas de PDF
const documentMap = {
    'PROYECTO EDUCATIVO DE CENTRO IES ÁNGEL SANZ BRIZ (Borrador)': 'documents/PROYECTO EDUCATIVO DE CENTRO IES ÁNGEL SANZ BRIZ (Borrador).pdf',
    'Reglamento de Régimen Interior': 'documents/Reglamento de Régimen Interior.pdf'
};

window.addEventListener('DOMContentLoaded', function() {
    // Si estamos en document.html, cargar el nombre del documento
    if (window.location.pathname.includes('document.html')) {
        const docName = sessionStorage.getItem('selectedDocument');
        if (docName) {
            selectedDocumentName = docName;
            document.getElementById('docName').textContent = docName;
            loadPDF(docName);
        }
    }
});

function loadPDF(docName) {
    const pdfUrl = documentMap[docName];
    if (!pdfUrl) {
        console.error('Documento no encontrado:', docName);
        alert('Documento no encontrado');
        return;
    }

    const pdfViewer = document.getElementById('pdfViewer');
    pdfViewer.src = pdfUrl;
}

function previousPage() {
    // Navegar a la página anterior o ir a la última si estamos en la primera
    if (currentPage > 1) {
        currentPage--;
    } else {
        // Si estamos en la primera página, ir a la última (comportamiento cíclico)
        currentPage = totalPages;
    }
    updatePageInfo();
    scrollToTop();
}

function nextPage() {
    // Navegar a la siguiente página o volver a la primera si estamos en la última (cíclico)
    if (currentPage < totalPages) {
        currentPage++;
    } else {
        // Si estamos en la última página, volver a la primera
        currentPage = 1;
    }
    updatePageInfo();
    scrollToTop();
}

function updatePageInfo() {
    document.getElementById('currentPage').textContent = currentPage;
}

function scrollToTop() {
    const viewer = document.getElementById('documentViewer');
    if (viewer) {
        viewer.scrollTop = 0;
    }
}

function downloadPDF() {
    if (!selectedDocumentName) {
        alert('No hay documento seleccionado');
        return;
    }
    const pdfUrl = documentMap[selectedDocumentName];
    if (pdfUrl) {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = selectedDocumentName + '.pdf';
        link.click();
    } else {
        alert('No se puede descargar este documento');
    }
}

function downloadWord() {
    if (!selectedDocumentName) {
        alert('No hay documento seleccionado');
        return;
    }
    // Por ahora, descargamos el PDF pero como archivo Word
    // Una solución real requeriría convertir PDF a DOCX en el servidor
    const pdfUrl = documentMap[selectedDocumentName];
    if (pdfUrl) {
        // Descargamos el PDF como .docx (nota: esto es un PDF disfrazado de Word)
        // Para una conversión real, se necesitaría una biblioteca de servidor como libreoffice o python-docx
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = selectedDocumentName + '.docx';
        link.click();
    } else {
        alert('No se puede descargar este documento');
    }
}

function uploadChanges() {
    alert('Subiendo cambios al documento...');
}

function deleteDocument() {
    if (confirm('¿Está seguro que desea borrar este documento?')) {
        alert('Documento borrado');
        window.location.href = 'main.html';
    }
}

function manageAccess() {
    alert('Abriendo gestor de acceso...');
}

function toggleChangelog() {
    const changelog = document.getElementById('changeLog');
    const icon = document.querySelector('.dropdownIcon');
    if (changelog) {
        changelog.classList.toggle('open');
        icon.classList.toggle('open');
    }
}

function toggleFullscreen() {
    const viewer = document.getElementById('documentViewer');
    if (!viewer) return;
    
    if (!document.fullscreenElement) {
        viewer.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

function logout() {
    window.location.href = 'index.html';
}