// ⚠️ IMPORTANTE: Reemplaza esta URL con la de tu Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwKCBT5W1emYWwMHvo_hp_sVpqDhtRIm2aw8-lXMeBO3_cMMQFWT4c75ji8SQPWJl35/exec';

// Variables globales
let musicPlaying = false; // Se inicia en false para que el primer toque la active
let selectedRSVP = null;
let audioContext;
let currentAudioSource = 'file'; // 'file' o 'youtube'

// Configuración de la fecha de la boda
const weddingDate = new Date('2026-10-30T18:00:00');

// Función de debug
function debugLog(message, data = null) {
    console.log(`[DEBUG] ${message}`, data || '');

    // Mostrar en pantalla también para debugging
    const debugDiv = document.getElementById('debugInfo');
    if (debugDiv) {
        debugDiv.innerHTML += `<div style="font-size: 0.8em; color: #666; margin: 2px 0;">${message}</div>`;
        debugDiv.scrollTop = debugDiv.scrollHeight;
    }
}

// Inicialización mejorada
document.addEventListener('DOMContentLoaded', function () {
    debugLog('Página cargada, iniciando...');
    generateQR();
    startCountdown();
    initializeMusic();

    // Crear div de debug si no existe
    createDebugPanel();

    debugLog('Script URL configurada:', GOOGLE_SCRIPT_URL);

    // Ocultar la pantalla de bienvenida y comenzar la invitación
    const welcomeScreen = document.getElementById('welcomeScreen');
    welcomeScreen.addEventListener('click', function() {
        welcomeScreen.classList.add('hidden'); // Ocultar la pantalla
        document.querySelector('.invitation-container').classList.add('visible'); // Mostrar la invitación
        startMusic(); // Iniciar la música después del primer clic
    }, { once: true });
});

// Crear panel de debug
function createDebugPanel() {
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debugPanel';
    debugPanel.style = 'position: fixed; bottom: 0; left: 0; width: 300px; height: 150px; background: rgba(0,0,0,0.7); color: white; padding: 10px; font-family: monospace; font-size: 10px; overflow-y: scroll; z-index: 9999; display: none;';
    debugPanel.innerHTML = '<h4>Debug Log</h4><div id="debugInfo"></div>';
    document.body.appendChild(debugPanel);

    // Toggle debug panel
    // document.addEventListener('keydown', (e) => {
    //     if (e.key === 'd' && e.ctrlKey) {
    //         debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
    //     }
    // });
}

// Función para inicializar la música
function initializeMusic() {
    const audio = document.getElementById('backgroundMusic');
    audio.volume = 0.3;

    audio.addEventListener('canplaythrough', function() {
        console.log('Audio cargado y listo para reproducir');
    });

    audio.addEventListener('error', function(e) {
        console.log('Error cargando audio, cambiando a alternativo');
        currentAudioSource = 'youtube';
    });
}

// Nueva función que inicia la música y cambia el estado
function startMusic() {
    if (!musicPlaying) {
        const audio = document.getElementById('backgroundMusic');
        audio.play().catch(e => {
            console.log('No se pudo reproducir el audio, intentando YouTube');
            currentAudioSource = 'youtube';
            playYouTubeMusic();
        });
        musicPlaying = true;
        document.querySelector('.music-controls').classList.add('playing');
        document.getElementById('musicIcon').textContent = '🎼';
    }
}

// Función modificada para alternar música
function toggleMusic() {
    const audio = document.getElementById('backgroundMusic');
    const musicControls = document.querySelector('.music-controls');
    const musicIcon = document.getElementById('musicIcon');
    const youtubePlayer = document.getElementById('youtubePlayer');

    if (musicPlaying) {
        // Pausar música
        if (currentAudioSource === 'file') {
            audio.pause();
        } else {
            // Para YouTube, la mejor opción es ocultar y recargar al volver a iniciar
            youtubePlayer.style.display = 'none';
        }

        musicPlaying = false;
        musicControls.classList.remove('playing');
        musicIcon.textContent = '🎵';
    } else {
        // Reproducir música (esto ya no es necesario aquí si solo se usa para pausar)
        // Si el usuario hace click en el botón, solo se activa si ya estaba pausada
        startMusic();
    }
}

// Función para reproducir YouTube
function playYouTubeMusic() {
    const youtubePlayer = document.getElementById('youtubePlayer');
    youtubePlayer.style.display = 'block';

    const iframe = document.getElementById('youtube-iframe');
    iframe.src = iframe.src;
}

// Función para generar código QR
function generateQR() {
    const qrcode = new QRCode(document.getElementById("qrcode"), {
        text: "https://drive.google.com/drive/folders/1LSnA-UfwqhEobzkuATcTOKlB_2an2cFD?usp=drive_link",
        width: 128,
        height: 128,
        colorDark: "#2C6F80",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
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

            document.getElementById('days').textContent = days;
            document.getElementById('hours').textContent = hours;
            document.getElementById('minutes').textContent = minutes;
            document.getElementById('seconds').textContent = seconds;
        } else {
            document.getElementById('countdown').innerHTML = '<div style="font-size: 2rem; color: #2C6F80; font-weight: 600;">¡Es hoy! 🎉</div>';
        }
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Función para abrir Google Maps
function openMap() {
    const address = "Av Centenario 1100, Colinas de Tarango, Álvaro Obregón, 01620 Ciudad de México, CDMX";
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://maps.google.com/?q=$${encodedAddress}`, '_blank');
}

// Resto de funciones para RSVP
async function searchGuest() {
    const searchName = document.getElementById('searchName').value.trim();
    const searchResult = document.getElementById('searchResult');
    const rsvpButtons = document.getElementById('rsvpButtons');
    const guestInfoForm = document.getElementById('guestInfo');
    const responseMessageDiv = document.getElementById('responseMessage');

    responseMessageDiv.style.display = 'none';
    searchResult.innerHTML = '<div class="loading-container"><div class="loading"></div> Buscando...</div>';

    rsvpButtons.style.display = 'none';
    guestInfoForm.style.display = 'none';

    if (!searchName) {
        showMessage('Por favor ingresa tu nombre para buscar', 'error');
        searchResult.innerHTML = '';
        return;
    }

    try {
        const url = `${GOOGLE_SCRIPT_URL}?searchName=${encodeURIComponent(searchName)}`;
        const response = await fetch(url);
        const result = await response.json();

        if (result.success && result.found) {
            document.getElementById('guestName').value = result.name;
            searchResult.innerHTML = `<p style="color: #2C6F80; margin: 15px 0;">¡Hola ${result.name}!</p>`;
            rsvpButtons.style.display = 'flex';
            showMessage('¡Te encontramos!', 'success');
        } else {
            searchResult.innerHTML = `<p style="color: #B85A30; margin: 15px 0;">Lo sentimos, no te encontramos en la lista.</p>`;
            showMessage('Invitado no encontrado.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error de conexión al buscar.', 'error');
    }
}

function selectRSVP(type) {
    selectedRSVP = type;
    document.getElementById('attendingBtn').classList.remove('selected');
    document.getElementById('notAttendingBtn').classList.remove('selected');

    if (type === 'attending') {
        document.getElementById('attendingBtn').classList.add('selected');
    } else {
        document.getElementById('notAttendingBtn').classList.add('selected');
    }

    document.getElementById('guestInfo').style.display = 'block';
}

async function submitRSVP() {
    if (!selectedRSVP) {
        showMessage('Por favor, selecciona si asistirás o no.', 'error');
        return;
    }

    const nombre = document.getElementById('guestName').value.trim();
    const asistira = selectedRSVP === 'attending';
    const acompanantes = asistira ? parseInt(document.getElementById('guestCount').value) || 0 : 0;
    const mensaje = document.getElementById('guestMessage').value.trim();

    const submitButton = document.querySelector('.submit-button');
    submitButton.disabled = true;
    showMessage('Enviando confirmación...', 'info');

    try {
        const params = new URLSearchParams({
            nombre: nombre,
            asistira: asistira,
            acompanantes: acompanantes,
            mensaje: mensaje,
            action: 'submit'
        });

        const url = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;
        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
            showMessage(result.message, 'success');
            setTimeout(resetForm, 3000);
        } else {
            showMessage(`Error: ${result.message}`, 'error');
        }
    } catch (error) {
        showMessage('Error al enviar la confirmación.', 'error');
    } finally {
        submitButton.disabled = false;
    }
}

function resetForm() {
    document.getElementById('searchName').value = '';
    document.getElementById('guestName').value = '';
    document.getElementById('guestCount').value = '';
    document.getElementById('guestMessage').value = '';
    document.getElementById('guestInfo').style.display = 'none';
    document.getElementById('searchResult').innerHTML = '';
    document.getElementById('rsvpButtons').style.display = 'none';
    selectedRSVP = null;
}

function showMessage(text, type) {
    const responseDiv = document.getElementById('responseMessage');
    responseDiv.innerHTML = `<div class="message ${type}">${text}</div>`;
    responseDiv.style.display = 'block';

    if (type === 'success') {
        setTimeout(() => {
            responseDiv.style.display = 'none';
        }, 8000);
    }
}

// Agregar efectos de entrada suaves
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
});

// Aplicar efectos a las secciones
document.addEventListener('DOMContentLoaded', function () {
    const sections = document.querySelectorAll('.section');
    sections.forEach((section) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.8s ease-out';
        observer.observe(section);
    });
});

// Función para crear dinámicamente los campos de acompañantes
function createCompanionInputs(count) {
    const container = document.getElementById('companionInputs');
    if (!container) return; // Asegurar que el contenedor existe

    container.innerHTML = ''; // Limpiar campos anteriores

    for (let i = 1; i <= count; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'guest-input companion-input';
        input.placeholder = `Nombre de acompañante ${i}`;
        input.id = `companionName${i}`;
        container.appendChild(input);
    }
}
