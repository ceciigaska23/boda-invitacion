// ⚠️ IMPORTANTE: Reemplaza esta URL con la de tu Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwKCBT5W1emYWwMHvo_hp_sVpqDhtRIm2aw8-lXMeBO3_cMMQFWT4c75ji8SQPWJl35/exec';

// Variables globales
let musicPlaying = false;
let selectedRSVP = null;

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

// Inicialización
document.addEventListener('DOMContentLoaded', function () {
    debugLog('Página cargada, iniciando...');
    generateQR();
    startCountdown();
    
    // Crear div de debug si no existe
    createDebugPanel();
    
    debugLog('Script URL configurada:', GOOGLE_SCRIPT_URL);
});

// Crear panel de debug
function createDebugPanel() {
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debugPanel';
    debugPanel.innerHTML = `
        <div style="position: fixed; bottom: 10px; left: 10px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; max-width: 300px; max-height: 200px; overflow-y: auto; font-size: 0.8em; z-index: 9999; display: none;">
            <div style="font-weight: bold; margin-bottom: 5px;">Debug Info <button onclick="toggleDebug()" style="float: right; background: none; border: none; color: white;">✖</button></div>
            <div id="debugInfo"></div>
            <button onclick="testConnection()" style="margin-top: 5px; padding: 5px; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">Test Connection</button>
        </div>
        <button onclick="toggleDebug()" style="position: fixed; bottom: 10px; left: 10px; background: #ff9800; color: white; border: none; padding: 10px; border-radius: 50px; cursor: pointer; z-index: 10000;">🐛</button>
    `;
    document.body.appendChild(debugPanel);
}

function toggleDebug() {
    const panel = document.querySelector('#debugPanel > div');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

// Función para probar la conexión
async function testConnection() {
    debugLog('Probando conexión con Google Apps Script...');
    
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('TU_SCRIPT_ID_AQUI')) {
        debugLog('❌ ERROR: URL no configurada');
        showMessage('Error: Google Apps Script no configurado. Revisa la consola.', 'error');
        return;
    }
    
    try {
        debugLog('Enviando solicitud GET de prueba...');
        const response = await fetch(GOOGLE_SCRIPT_URL + '?test=true');
        
        debugLog('Respuesta recibida:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        debugLog('Contenido de respuesta:', result);
        
        showMessage('✅ Conexión exitosa con Google Apps Script', 'success');
    } catch (error) {
        debugLog('❌ Error en conexión:', error.message);
        showMessage(`❌ Error de conexión: ${error.message}`, 'error');
    }
}

// Función para alternar la música
function toggleMusic() {
    const audio = document.getElementById('backgroundMusic');
    const musicControls = document.querySelector('.music-controls');
    const musicIcon = document.getElementById('musicIcon');

    if (musicPlaying) {
        audio.pause();
        musicPlaying = false;
        musicControls.classList.remove('playing');
        if (musicIcon) musicIcon.textContent = '🎵';
    } else {
        audio.play().catch(e => {
            console.log('No se pudo reproducir la música automáticamente');
            playSimpleMusic();
        });
        musicPlaying = true;
        musicControls.classList.add('playing');
        if (musicIcon) musicIcon.textContent = '🎼';
    }
}

// Función para reproducir música simple
function playSimpleMusic() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
        let noteIndex = 0;

        function playNote() {
            if (musicPlaying) {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(notes[noteIndex % notes.length], audioContext.currentTime);
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 1);

                noteIndex++;
                setTimeout(playNote, 1200);
            }
        }

        playNote();
    } catch (error) {
        console.log('No se pudo crear el contexto de audio');
    }
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
    window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
}

// Función para buscar invitado
async function searchGuest() {
    const searchName = document.getElementById('searchName').value.trim();
    const searchResult = document.getElementById('searchResult');
    const rsvpButtons = document.getElementById('rsvpButtons');
    const guestInfoForm = document.getElementById('guestInfo');
    const responseMessageDiv = document.getElementById('responseMessage');
    
    // Ocultar mensajes anteriores y mostrar estado de carga
    responseMessageDiv.style.display = 'none';
    searchResult.innerHTML = '<div class="loading-container"><div class="loading"></div> Buscando...</div>';
    
    // Ocultar botones y formulario por si ya se habían mostrado
    rsvpButtons.style.display = 'none';
    guestInfoForm.style.display = 'none';
    
    const guestCountInput = document.getElementById('guestCount');
    guestCountInput.style.display = 'block';
    guestCountInput.readOnly = false;
    
    if (!searchName) {
        showMessage('Por favor ingresa tu nombre para buscar', 'error');
        searchResult.innerHTML = '';
        return;
    }
    
    if (!GOOGLE_SCRIPT_URL) {
        showMessage('Error: La URL del script no está configurada.', 'error');
        searchResult.innerHTML = '';
        return;
    }

    try {
        const url = `${GOOGLE_SCRIPT_URL}?searchName=${encodeURIComponent(searchName)}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            if (result.found) {
                document.getElementById('guestName').value = result.name;
                guestCountInput.value = result.companions;
                
                if (result.confirmacion) {
                    // ⚠️ Invitado ya ha confirmado, mostrar opciones de actualización
                    searchResult.innerHTML = `<p style="color: #2C6F80; margin: 15px 0;">¡Hola **${result.name}**!</p><p>Ya confirmaste tu asistencia. ¿Deseas actualizar tu respuesta?</p>`;
                    rsvpButtons.innerHTML = `
                      <button class="rsvp-button selected" onclick="selectRSVP('attending')" id="attendingBtn">
                          Actualizar RSVP
                      </button>
                      <button class="rsvp-button" onclick="selectRSVP('notAttending')" id="notAttendingBtn">
                          Cancelar RSVP
                      </button>
                    `;
                    rsvpButtons.style.display = 'flex';
                } else {
                    // ⚠️ Invitado no ha confirmado, mostrar opciones de confirmación normales
                    let message = `<p style="color: #2C6F80; margin: 15px 0;">¡Hola **${result.name}**!</p>`;
                    if (result.companions > 0) {
                        message += `<p>Tienes **${result.companions}** acompañante(s) permitido(s). Por favor, confirma tu asistencia:</p>`;
                        guestCountInput.readOnly = true;
                    } else {
                        message += `<p>Por favor confirma tu asistencia:</p>`;
                        guestCountInput.style.display = 'none';
                    }
                    searchResult.innerHTML = message;
                    rsvpButtons.innerHTML = `
                      <button class="rsvp-button" onclick="selectRSVP('attending')" id="attendingBtn">
                          ✓ Asistiré
                      </button>
                      <button class="rsvp-button" onclick="selectRSVP('notAttending')" id="notAttendingBtn">
                          ✗ No podré asistir
                      </button>
                    `;
                    rsvpButtons.style.display = 'flex';
                }
                showMessage(`¡Te encontramos!`, 'success');
            } else {
                searchResult.innerHTML = `<p style="color: #B85A30; margin: 15px 0;">Lo sentimos, ${result.message}</p>`;
                showMessage('Invitado no encontrado.', 'error');
            }
        } else {
            searchResult.innerHTML = `<p style="color: #B85A30; margin: 15px 0;">${result.message}</p>`;
            showMessage(`Error en la búsqueda: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Error de red al buscar invitado:', error);
        searchResult.innerHTML = `<p style="color: #B85A30; margin: 15px 0;">Error de conexión. Intenta de nuevo más tarde.</p>`;
        showMessage('Error de conexión al buscar.', 'error');
    }
}

function selectRSVP(type) {
    debugLog(`RSVP seleccionado: ${type}`);
    selectedRSVP = type;

    document.getElementById('attendingBtn').classList.remove('selected');
    document.getElementById('notAttendingBtn').classList.remove('selected');

    if (type === 'attending') {
        document.getElementById('attendingBtn').classList.add('selected');
    } else {
        document.getElementById('notAttendingBtn').classList.add('selected');
    }

    document.getElementById('guestInfo').style.display = 'block';

    const guestCountInput = document.getElementById('guestCount');
    const companionsValue = parseInt(guestCountInput.value) || 0;
    const companionInputsContainer = document.getElementById('companionInputs');
    
    if (type === 'attending') {
        guestCountInput.style.display = 'block';
        guestCountInput.readOnly = true;

        if (companionsValue > 0) {
            createCompanionInputs(companionsValue);
            companionInputsContainer.style.display = 'block';
        } else {
            companionInputsContainer.style.display = 'none';
        }
    } else {
        guestCountInput.style.display = 'none';
        if (companionInputsContainer) {
            companionInputsContainer.style.display = 'none';
        }
    }
}

async function submitRSVP() {
    if (selectedRSVP === null) {
        showMessage('Por favor, selecciona si asistirás o no.', 'error');
        return;
    }

    const nombre = document.getElementById('guestName').value.trim();
    const asistira = selectedRSVP === 'attending';
    const acompanantes = asistira ? parseInt(document.getElementById('guestCount').value) || 0 : 0;
    const mensaje = document.getElementById('guestMessage').value.trim();
    
    const companionNames = [];
    if (asistira && acompanantes > 0) {
        for (let i = 1; i <= acompanantes; i++) {
            const companionName = document.getElementById(`companionName${i}`).value.trim();
            companionNames.push(companionName);
        }
    }
    
    if (nombre === '') {
        showMessage('El nombre no puede estar vacío.', 'error');
        return;
    }

    const submitButton = document.querySelector('.submit-button');
    submitButton.disabled = true;
    showMessage('Enviando confirmación...', 'info');

    debugLog('Enviando solicitud GET...');
    
    const params = new URLSearchParams({
        nombre: nombre,
        asistira: asistira,
        acompanantes: acompanantes,
        mensaje: mensaje,
        action: 'submit',
        companionNames: JSON.stringify(companionNames) 
    });

    const url = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;
    debugLog('URL destino:', url);

    try {
        const response = await fetch(url);
        const result = await response.json();

        debugLog('Respuesta del servidor:', result);

        if (result.success) {
            showMessage(result.message, 'success');
            setTimeout(resetForm, 8000);
        } else {
            showMessage(`Error al enviar: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Error de red/parsing:', error);
        showMessage('Error al enviar la confirmación. Por favor, inténtalo de nuevo.', 'error');
    } finally {
        submitButton.disabled = false;
    }
}

// ⚠️ Esta función debe estar definida para crear los campos de nombre
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
        container.appendChild(input);
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
    
    // Resetear botones
    document.getElementById('attendingBtn').classList.remove('selected');
    document.getElementById('notAttendingBtn').classList.remove('selected');
    selectedRSVP = null;
    
    debugLog('Formulario reseteado');
}

// Función para mostrar mensajes
function showMessage(text, type) {
    const responseDiv = document.getElementById('responseMessage');
    responseDiv.innerHTML = `<div class="message ${type}">${text}</div>`;
    responseDiv.style.display = 'block';

    debugLog(`Mensaje mostrado (${type}): ${text}`);

    // Auto-hide success messages after 8 seconds
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