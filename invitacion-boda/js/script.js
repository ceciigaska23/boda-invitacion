// Variables globales
        let musicPlaying = false;
        let selectedRSVP = null;

        // Configuración de la fecha de la boda
        const weddingDate = new Date('2026-10-30T18:00:00');

        // Inicialización
        document.addEventListener('DOMContentLoaded', function () {
            generateQR();
            startCountdown();
            // La música no se reproduce automáticamente para cumplir con las políticas del navegador
        });

        // Función para alternar la música
        function toggleMusic() {
            const audio = document.getElementById('backgroundMusic');
            const musicControls = document.querySelector('.music-controls');
            const musicIcon = document.getElementById('musicIcon');

            if (musicPlaying) {
                audio.pause();
                musicPlaying = false;
                musicControls.classList.remove('playing');
                musicIcon.textContent = '🎵';
            } else {
                audio.play().catch(e => {
                    console.log('No se pudo reproducir la música automáticamente');
                    // Crear un tono simple como alternativa
                    playSimpleMusic();
                });
                musicPlaying = true;
                musicControls.classList.add('playing');
                musicIcon.textContent = '🎼';
            }
        }

        // Función para reproducir música simple
        function playSimpleMusic() {
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

        // Función para seleccionar RSVP
        function selectRSVP(type) {
            selectedRSVP = type;

            // Resetear botones
            document.getElementById('attendingBtn').classList.remove('selected');
            document.getElementById('notAttendingBtn').classList.remove('selected');

            // Marcar botón seleccionado
            if (type === 'attending') {
                document.getElementById('attendingBtn').classList.add('selected');
            } else {
                document.getElementById('notAttendingBtn').classList.add('selected');
            }

            // Mostrar formulario
            document.getElementById('guestInfo').style.display = 'block';

            // Ajustar placeholder del número de acompañantes
            const guestCountInput = document.getElementById('guestCount');
            if (type === 'attending') {
                guestCountInput.placeholder = "Número de acompañantes";
                guestCountInput.style.display = 'block';
            } else {
                guestCountInput.style.display = 'none';
            }
        }

        // Función para enviar RSVP
        function submitRSVP() {
            const name = document.getElementById('guestName').value.trim();
            const guestCount = document.getElementById('guestCount').value;
            const message = document.getElementById('guestMessage').value.trim();
            const responseDiv = document.getElementById('responseMessage');

            if (!name) {
                showMessage('Por favor ingresa tu nombre', 'error');
                return;
            }

            if (selectedRSVP === 'attending' && (!guestCount || guestCount < 0)) {
                showMessage('Por favor indica el número de acompañantes (0 si vienes solo)', 'error');
                return;
            }

            // Simular envío
            const submitButton = document.querySelector('.submit-button');
            submitButton.innerHTML = '<div class="loading"></div> Enviando...';
            submitButton.disabled = true;

            setTimeout(() => {
                let confirmationMessage = '';
                if (selectedRSVP === 'attending') {
                    const totalGuests = parseInt(guestCount) + 1;
                    confirmationMessage = `¡Gracias ${name}! Hemos confirmado tu asistencia para ${totalGuests} persona${totalGuests > 1 ? 's' : ''}.`;
                } else {
                    confirmationMessage = `Gracias ${name} por informarnos. Lamentamos que no puedas acompañarnos, pero entendemos completamente.`;
                }

                showMessage(confirmationMessage, 'success');

                // Resetear formulario
                document.getElementById('guestName').value = '';
                document.getElementById('guestCount').value = '';
                document.getElementById('guestMessage').value = '';
                document.getElementById('guestInfo').style.display = 'none';

                // Resetear botones
                document.getElementById('attendingBtn').classList.remove('selected');
                document.getElementById('notAttendingBtn').classList.remove('selected');
                selectedRSVP = null;

                submitButton.innerHTML = 'Enviar Confirmación';
                submitButton.disabled = false;
            }, 2000);
        }

        // Función para mostrar mensajes
        function showMessage(text, type) {
            const responseDiv = document.getElementById('responseMessage');
            responseDiv.textContent = text;
            responseDiv.className = `response-message ${type}`;
            responseDiv.style.display = 'block';

            setTimeout(() => {
                responseDiv.style.display = 'none';
            }, 5000);
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