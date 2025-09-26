document.addEventListener('DOMContentLoaded', () => {
    const memoryGrid = document.getElementById('memory-grid');
    const restartBtn = document.getElementById('restart-btn');
    const timeDisplay = document.getElementById('time');
    const attemptsDisplay = document.getElementById('attempts');
    const scoreDisplay = document.getElementById('score');
    const winMessage = document.getElementById('win-message');
    const loseMessage = document.getElementById('lose-message');
    const finalScoreWin = document.getElementById('final-score');
    const finalScoreLose = document.getElementById('final-score-lose');

    const VALORES_CARTAS = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒'];
    let cartasJuego = [...VALORES_CARTAS, ...VALORES_CARTAS];
    
    let cartasVolteadas = [];
    let paresEncontrados = 0;
    let intentos = 0;
    let puntaje = 0;
    let temporizador = null;
    let segundosRestantes = 60;
    let juegoIniciado = false;
    let bloqueoJuego = false; // Bloquea clics mientras las cartas se voltean/verifican

    // Función para mezclar las cartas (algoritmo Fisher-Yates)
    function mezclar(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Función para crear las cartas en el DOM
    function crearCartas() {
        memoryGrid.innerHTML = '';
        winMessage.classList.add('hidden');
        loseMessage.classList.add('hidden');
        mezclar(cartasJuego);
        cartasJuego.forEach(valor => {
            const carta = document.createElement('div');
            carta.classList.add('card');
            carta.dataset.valor = valor;
            carta.innerHTML = `
                <div class="card-inner">
                    <div class="card-face card-back">?</div>
                    <div class="card-face card-front">${valor}</div>
                </div>
            `;
            carta.addEventListener('click', manejarClickCarta);
            memoryGrid.appendChild(carta);
        });
        console.log("Juego reiniciado. Cartas creadas.");
    }

    // Manejador de eventos para el clic en las cartas
    function manejarClickCarta(event) {
        if (!juegoIniciado) {
            juegoIniciado = true;
            iniciarTemporizador();
        }
        
        const carta = event.currentTarget;
        
        // Evita clics si:
        // 1. El juego está bloqueado (bloqueoJuego)
        // 2. La carta ya está volteada (flipped)
        // 3. La carta ya es parte de un par (matched)
        // 4. Ya hay dos cartas volteadas (cartasVolteadas.length >= 2)
        if (bloqueoJuego || carta.classList.contains('flipped') || carta.classList.contains('matched') || cartasVolteadas.length >= 2) {
            console.log("Clic ignorado:", carta.dataset.valor, "Estado:", carta.classList);
            return;
        }

        carta.classList.add('flipped');
        cartasVolteadas.push(carta);
        console.log("Carta volteada:", carta.dataset.valor);

        if (cartasVolteadas.length === 2) {
            bloqueoJuego = true; // Bloquea el juego para evitar más clics
            intentos++;
            attemptsDisplay.textContent = intentos;
            verificarPar();
        }
    }

    // Función para verificar si las cartas volteadas coinciden
    function verificarPar() {
        const [carta1, carta2] = cartasVolteadas;
        
        // Un pequeño retraso para permitir que la animación de volteo se vea antes de decidir si es un par
        setTimeout(() => {
            if (carta1.dataset.valor === carta2.dataset.valor) {
                // Si coinciden
                console.log("¡Par encontrado!", carta1.dataset.valor);
                carta1.classList.add('matched');
                carta2.classList.add('matched');
                
                // Remover listeners para que ya no respondan a clics
                carta1.removeEventListener('click', manejarClickCarta);
                carta2.removeEventListener('click', manejarClickCarta);

                paresEncontrados++;
                puntaje += 100;
                scoreDisplay.textContent = puntaje;
                
            } else {
                // Si NO coinciden, las voltea de nuevo
                console.log("No coinciden:", carta1.dataset.valor, carta2.dataset.valor);
                carta1.classList.remove('flipped');
                carta2.classList.remove('flipped');
            }
            
            cartasVolteadas = []; // Limpia el array de cartas volteadas
            bloqueoJuego = false; // Desbloquea el juego
            verificarFinJuego();
        }, 1000); // 1 segundo de retraso para que el usuario vea si coinciden o no
    }

    // Función para iniciar la cuenta regresiva
    function iniciarTemporizador() {
        temporizador = setInterval(() => {
            segundosRestantes--;
            timeDisplay.textContent = `${segundosRestantes}s`;
            if (segundosRestantes <= 0) {
                terminarJuegoPorTiempo();
            }
        }, 1000);
    }

    // Función para detener el temporizador
    function detenerTemporizador() {
        clearInterval(temporizador);
        temporizador = null;
    }

    // Función para verificar si el jugador ha ganado
    function verificarFinJuego() {
        if (paresEncontrados === VALORES_CARTAS.length) {
            detenerTemporizador();
            const puntajeFinal = puntaje + (segundosRestantes * 10);
            finalScoreWin.textContent = `Puntaje final: ${puntajeFinal}`;
            winMessage.classList.remove('hidden');
            juegoIniciado = false;
            desactivarTodasLasCartas(); // Desactiva todas las cartas restantes
        }
    }

    // Función para terminar el juego por tiempo
    function terminarJuegoPorTiempo() {
        detenerTemporizador();
        finalScoreLose.textContent = `Puntaje: ${puntaje}`;
        loseMessage.classList.remove('hidden');
        juegoIniciado = false;
        desactivarTodasLasCartas(); // Desactiva todas las cartas
    }

    // Desactiva los clics en todas las cartas (usado al final del juego)
    function desactivarTodasLasCartas() {
        const todasLasCartas = document.querySelectorAll('.card');
        todasLasCartas.forEach(carta => carta.removeEventListener('click', manejarClickCarta));
    }

    // Función para reiniciar el juego
    function reiniciarJuego() {
        detenerTemporizador();
        segundosRestantes = 60;
        intentos = 0;
        paresEncontrados = 0;
        puntaje = 0;
        cartasVolteadas = [];
        juegoIniciado = false;
        bloqueoJuego = false;
        timeDisplay.textContent = `${segundosRestantes}s`;
        attemptsDisplay.textContent = '0';
        scoreDisplay.textContent = '0';
        crearCartas();
        console.log("Juego Reiniciado completamente.");
    }

    // Inicializar el juego
    restartBtn.addEventListener('click', reiniciarJuego);
    crearCartas();
});