// ⚠️ IMPORTANTE: Reemplaza esta URL con la de tu Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://api.allorigins.win/get?url=';
// const GOOGLE_SCRIPT_URL = 'https://cors-anywhere.herokuapp.com/https://script.google.com/macros/s/AKfycbzZ4DaRpZTTah0Ka8NTEKahDOJL0vrDoroHp00Y3i85iqc_8z1GRwbpep3dg3TEV0Q4/exec';

// Variables globales
let musicPlaying = false; 
let selectedRSVP = null;

// Configuración de la fecha de la boda
const weddingDate = new Date('2026-10-30T18:00:00');

document.addEventListener('DOMContentLoaded', function () {
    // Iniciar funciones al cargar la página
    generateQR();
    startCountdown();
    initializeMusic();

    // Evento para ocultar la pantalla de bienvenida y comenzar la invitación
    const welcomeScreen = document.getElementById('welcomeScreen');
    welcomeScreen.addEventListener('click', function() {
        welcomeScreen.style.display = 'none';
        document.querySelector('.invitation-container').classList.add('visible');
        startMusic();
    }, { once: true });

    // Escuchar cambios en el input de acompañantes
    document.getElementById('guestCount').addEventListener('input', (e) => {
        const count = parseInt(e.target.value) || 0;
        createCompanionInputs(count);
    });

    // Aplicar efectos de entrada suaves
    const sections = document.querySelectorAll('.section');
    sections.forEach((section) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.8s ease-out';
        observer.observe(section);
    });
});

// Función para inicializar la música
function initializeMusic() {
    const audio = document.getElementById('backgroundMusic');
    if (audio) {
        audio.volume = 0.3;
    }
}

// Nueva función que inicia la música y cambia el estado
function startMusic() {
    if (!musicPlaying) {
        const audio = document.getElementById('backgroundMusic');
        if (audio) {
            audio.play().catch(e => {
                console.error('No se pudo reproducir el audio:', e);
            });
            musicPlaying = true;
            document.querySelector('.music-controls').classList.add('playing');
            document.getElementById('musicIcon').textContent = '🎼';
        }
    }
}

// Función modificada para alternar música
function toggleMusic() {
    const audio = document.getElementById('backgroundMusic');
    const musicControls = document.querySelector('.music-controls');
    const musicIcon = document.getElementById('musicIcon');

    if (!audio) return;

    if (musicPlaying) {
        audio.pause();
        musicPlaying = false;
        musicControls.classList.remove('playing');
        musicIcon.textContent = '🎵';
    } else {
        audio.play().catch(e => {
            console.error('No se pudo reproducir el audio:', e);
        });
        musicPlaying = true;
        musicControls.classList.add('playing');
        musicIcon.textContent = '🎼';
    }
}

// Función para generar código QR
function generateQR() {
    const qrElement = document.getElementById("qrcode");
    if (qrElement && typeof QRCode !== 'undefined') {
        const qrcode = new QRCode(qrElement, {
            text: "https://drive.google.com/drive/folders/1LSnA-UfwqhEobzkuATcTOKlB_2an2cFD?usp=drive_link",
            width: 128,
            height: 128,
            colorDark: "#2C6F80",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

// Función para la cuenta regresiva
function startCountdown() {
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate.getTime() - now;

        if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            const daysEl = document.getElementById('days');
            const hoursEl = document.getElementById('hours');
            const minutesEl = document.getElementById('minutes');
            const secondsEl = document.getElementById('seconds');

            if (daysEl) daysEl.textContent = days;
            if (hoursEl) hoursEl.textContent = hours;
            if (minutesEl) minutesEl.textContent = minutes;
            if (secondsEl) secondsEl.textContent = seconds;
        } else {
            const countdownEl = document.getElementById('countdown');
            if (countdownEl) {
                countdownEl.innerHTML = '<div style="font-size: 2rem; color: #2C6F80; font-weight: 600;">¡Es hoy! 🎉</div>';
            }
        }
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Función para abrir Google Maps
function openMap() {
    const address = "Av Centenario 1100, Colinas de Tarango, Álvaro Obregón, 01620 Ciudad de México, CDMX";
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
}

// Función para buscar invitado
async function searchGuest() {
    const searchName = document.getElementById('searchName').value.trim();
    const searchResult = document.getElementById('searchResult');
    const rsvpButtons = document.getElementById('rsvpButtons');
    const guestInfoForm = document.getElementById('guestInfo');
    const responseMessageDiv = document.getElementById('responseMessage');

    // Limpiar estados anteriores
    responseMessageDiv.style.display = 'none';
    searchResult.innerHTML = '<div class="loading-container"><div class="loading"></div> Buscando...</div>';
    rsvpButtons.style.display = 'none';
    guestInfoForm.style.display = 'none';

    if (!searchName) {
        showMessage('Por favor, ingresa tu nombre para buscar.', 'error');
        searchResult.innerHTML = '';
        return;
    }

    try {
        const url = `${GOOGLE_SCRIPT_URL}?action=search&searchName=${encodeURIComponent(searchName)}`;
        console.log(url);
        const response = await fetch(`${GOOGLE_SCRIPT_URL}${encodeURIComponent('https://script.google.com/macros/s/AKfycbyWZuWmU83405ZGK-5-Pq_R5lP5rO9rYxwWh4HjBKLbhE8-lu2FSaEErVkoocwH7P_7/exec')}`);
        console.log(response);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const result = await response.json();

        if (result.success && result.found) {
            document.getElementById('guestName').value = result.name;
            document.getElementById('guestCount').value = result.passes;
            
            searchResult.innerHTML = `<p style="color: #2C6F80; margin: 15px 0;">¡Hola ${result.name}!</p>`;
            
            // Mostrar los campos de RSVP y el formulario de info del invitado
            rsvpButtons.style.display = 'flex';
            guestInfoForm.style.display = 'block';

            // Crear dinámicamente los campos de acompañantes
            createCompanionInputs(result.passes);

            showMessage('¡Te encontramos!', 'success');
        } else {
            searchResult.innerHTML = `<p style="color: #B85A30; margin: 15px 0;">Lo sentimos, no te encontramos en la lista.</p>`;
            showMessage('Invitado no encontrado.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error al conectar con el servidor. Inténtalo de nuevo.', 'error');
    }
}


// Función para seleccionar RSVP
function selectRSVP(type) {
    selectedRSVP = type;
    
    // Limpiar selecciones previas
    document.getElementById('attendingBtn').classList.remove('selected');
    document.getElementById('notAttendingBtn').classList.remove('selected');

    if (type === 'attending') {
        document.getElementById('attendingBtn').classList.add('selected');
        document.getElementById('guestCount').style.display = 'block';
    } else {
        document.getElementById('notAttendingBtn').classList.add('selected');
        document.getElementById('guestCount').style.display = 'none';
        document.getElementById('guestCount').value = '0';
        createCompanionInputs(0); // Limpiar campos de acompañantes
    }

    document.getElementById('guestInfo').style.display = 'block';
}

// Función para enviar RSVP
async function submitRSVP() {
    if (!selectedRSVP) {
        showMessage('Por favor, selecciona si asistirás o no.', 'error');
        return;
    }

    const nombre = document.getElementById('guestName').value.trim();
    const asistira = selectedRSVP === 'attending';
    const guestCountInput = document.getElementById('guestCount');
    const acompanantes = asistira 
    ? Math.min(parseInt(guestCountInput.value) || 0, parseInt(guestCountInput.max) || 0) 
    : 0;
    const mensaje = document.getElementById('guestMessage').value.trim();

    if (!nombre) {
        showMessage('El nombre es requerido.', 'error');
        return;
    }

    // Recolectar nombres de acompañantes
    const companionInputs = document.querySelectorAll('.companion-input');
    const companionNames = Array.from(companionInputs)
        .map(input => input.value.trim())
        .filter(name => name);

    // Validar que se han ingresado nombres para todos los acompañantes
    if (asistira && acompanantes > 0 && companionNames.length !== acompanantes) {
        showMessage(`Por favor ingresa los nombres de todos los acompañantes (${acompanantes}).`, 'error');
        return;
    }

    const submitButton = document.querySelector('.submit-button');
    submitButton.disabled = true;
    showMessage('Enviando confirmación...', 'info');

    try {
        const requestData = {
            name: nombre,
            status: asistira ? 'Asistiré' : 'No podré asistir',
            guests: acompanantes,
            companionNames: companionNames,
            message: mensaje
        };

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            showMessage(result.message || 'Confirmación enviada exitosamente', 'success');
            setTimeout(resetForm, 3000);
        } else {
            showMessage(`Error: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Error al enviar RSVP:', error);
        showMessage('Error al enviar la confirmación.', 'error');
    } finally {
        submitButton.disabled = false;
    }
}

// Función para resetear el formulario
function resetForm() {
    document.getElementById('searchName').value = '';
    document.getElementById('guestName').value = '';
    document.getElementById('guestCount').value = '';
    document.getElementById('guestMessage').value = '';
    document.getElementById('guestInfo').style.display = 'none';
    document.getElementById('searchResult').innerHTML = '';
    document.getElementById('rsvpButtons').style.display = 'none';
    document.getElementById('companionInputs').innerHTML = '';
    
    // Limpiar selecciones
    document.getElementById('attendingBtn').classList.remove('selected');
    document.getElementById('notAttendingBtn').classList.remove('selected');
    
    selectedRSVP = null;
}

// Función para mostrar mensajes
function showMessage(text, type) {
    const responseDiv = document.getElementById('responseMessage');
    responseDiv.innerHTML = `<div class="message ${type}">${text}</div>`;
    responseDiv.style.display = 'block';

    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            responseDiv.style.display = 'none';
        }, 8000);
    }
}

// Observer para efectos de entrada suaves
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
});

// Función para crear dinámicamente los campos de acompañantes
function createCompanionInputs(count) {
    const container = document.getElementById('companionInputs');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 1; i <= count; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'guest-input companion-input';
        input.placeholder = `Nombre de acompañante ${i}`;
        input.id = `companionName${i}`;
        input.required = true;
        container.appendChild(input);
    }
}
