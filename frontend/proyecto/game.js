import { guardarPuntaje, obtenerScores } from "./api.js";

const canvas = document.getElementById("juegoCanvas");
const ctx = canvas.getContext("2d");

let usuario = "Invitado";

const jugador = {
    x: 100,
    y: canvas.height - 100,
    ancho: 90,
    alto: 90,
    velocidadY: 0,
    gravedad: 0.7,
    salto: -18, 
    enSuelo: true,
    saltoPresionado: false,
    tiempoSalto: 0,
    
    // --- NUEVAS PROPIEDADES DE HITBOX ---
    hitboxAncho: 40,
    hitboxAlto: 70,
    hitboxX: 25, 
    hitboxY: 20 
};

let obstaculos = [];
let frames = 0;
let puntaje = 0;
let nivel = 1;
let mejorPuntaje = 0;
let juegoActivo = false;

// Imágenes
const imgJugador = new Image();
imgJugador.src = "assets/dino.gif";
const imgObstaculo = new Image();
imgObstaculo.src = "assets/cactus.png";
const imgFondo = new Image();
imgFondo.src = "assets/fondo.jpg";

// Elementos HTML de la UI
const hud = document.querySelector(".arcade-hud");
const pantallaInicio = document.getElementById("pantalla-inicio-juego");
const juegoPrincipal = document.getElementById("juego-principal");
const pantallaGameOver = document.querySelector(".pantalla-gameover");
const puntajeFinalGameOver = document.getElementById("puntajeFinalGameOver");
const btnReintentar = document.getElementById("btnReintentar");
const btnSalir = document.getElementById("btnSalir");
const btnEntrar = document.getElementById("btnEntrar");
const usuarioInput = document.getElementById("usuario");
const btnCambiarNombre = document.getElementById("btnCambiarNombre");

// Elemento de audio
const musicaFondo = document.getElementById("musicaFondo");

// Funciones del Juego
function resetearJuego() {
    jugador.y = canvas.height - jugador.alto;
    jugador.enSuelo = true;
    jugador.velocidadY = 0;
    obstaculos = [];
    frames = 0;
    puntaje = 0;
    nivel = 1;
    juegoActivo = true;
}

function iniciarJuego() {
    resetearJuego();
    pantallaInicio.classList.add("oculto");
    juegoPrincipal.classList.remove("oculto");
    pantallaGameOver.classList.add("oculto");
    hud.classList.remove("oculto");
    musicaFondo.play();
    loop();
}

// Controles y eventos de botones
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && juegoActivo) {
        jugador.saltoPresionado = true;
    }
});
document.addEventListener("keyup", (e) => {
    if (e.code === "Space" && juegoActivo) {
        jugador.saltoPresionado = false;
        jugador.tiempoSalto = 0;
    }
});

btnEntrar.addEventListener("click", () => {
    const nombreUsuario = usuarioInput.value.trim();
    if (nombreUsuario) {
        localStorage.setItem("usuario", nombreUsuario);
        usuario = nombreUsuario;
        iniciarJuego();
    } else {
        alert("Por favor, ingresa un nombre.");
    }
});

btnReintentar.addEventListener("click", () => {
    iniciarJuego();
});

btnCambiarNombre.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    pantallaGameOver.classList.add("oculto");
    juegoPrincipal.classList.add("oculto");
    pantallaInicio.classList.remove("oculto");
    usuarioInput.value = "";
    actualizarTablaScores();
});

btnSalir.addEventListener("click", () => {
    musicaFondo.pause();
    musicaFondo.currentTime = 0;
    window.location.href = "../index.html"; 
});

// Bucle principal del juego
function loop() {
    if (!juegoActivo) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dibujarFondo();
    
    frames++;
    puntaje++;
    if (puntaje % 500 === 0) nivel++;
    
    crearObstaculo();
    actualizarJugador();
    actualizarObstaculos();
    
    dibujarJugador();
    dibujarObstaculos();
    dibujarHUD();
    
    if (puntaje > mejorPuntaje) mejorPuntaje = puntaje;
    
    requestAnimationFrame(loop);
}

// Lógica de inicio de la página y leaderboard
document.addEventListener("DOMContentLoaded", () => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
        usuarioInput.value = usuarioGuardado;
    }

    pantallaInicio.classList.remove("oculto");
    juegoPrincipal.classList.add("oculto");
    pantallaGameOver.classList.add("oculto");
    hud.classList.add("oculto");
    actualizarTablaScores();
});

// Resto de tus funciones del juego
function crearObstaculo() {
    if (frames % 120 === 0) {
        let tipo = Math.floor(Math.random() * 3);
        let obstaculo;
        if (tipo === 0) {
            obstaculo = { 
                x: canvas.width, 
                y: canvas.height - 80, 
                ancho: 80, 
                alto: 80,
                // Hitbox para cactus
                hitboxX: 20, 
                hitboxY: 0,
                hitboxAncho: 40,
                hitboxAlto: 80
            };
        } else if (tipo === 1) {
            obstaculo = { 
                x: canvas.width, 
                y: canvas.height - 150, 
                ancho: 90, 
                alto: 140,
                // Hitbox para cactus alto
                hitboxX: 30,
                hitboxY: 40,
                hitboxAncho: 30,
                hitboxAlto: 100
            };
        } else {
            obstaculo = { 
                x: canvas.width, 
                y: canvas.height - 80, 
                ancho: 80, 
                alto: 80,
                // Hitbox para cactus 2
                hitboxX: 20, 
                hitboxY: 0,
                hitboxAncho: 40,
                hitboxAlto: 80
            };
            let obstaculo2 = { 
                x: canvas.width + 80, 
                y: canvas.height - 60, 
                ancho: 40, 
                alto: 60,
                // Hitbox para cactus pequeño
                hitboxX: 10,
                hitboxY: 0,
                hitboxAncho: 20,
                hitboxAlto: 60
            };
            obstaculos.push(obstaculo2);
        }
        obstaculos.push(obstaculo);
    }
}

function dibujarFondo() {
    ctx.drawImage(imgFondo, 0, 0, canvas.width, canvas.height);
}

function dibujarJugador() {
    ctx.save();
    ctx.translate(jugador.x + jugador.ancho / 2, jugador.y + jugador.alto / 2);
    ctx.scale(-1, 1);
    ctx.drawImage(
        imgJugador,
        -jugador.ancho / 2, 
        -jugador.alto / 2,  
        jugador.ancho,
        jugador.alto
    );
    ctx.restore();
}

function dibujarObstaculos() {
    obstaculos.forEach((obs) => {
        ctx.drawImage(imgObstaculo, obs.x, obs.y, obs.ancho, obs.alto);
    });
}

function actualizarJugador() {
    if (jugador.saltoPresionado && juegoActivo) {
        if (jugador.enSuelo) {
            jugador.velocidadY = jugador.salto;
            jugador.enSuelo = false;
        }
    }
    
    jugador.y += jugador.velocidadY;
    jugador.velocidadY += jugador.gravedad;
    
    if (jugador.y >= canvas.height - jugador.alto) {
        jugador.y = canvas.height - jugador.alto;
        jugador.enSuelo = true;
    }
}

function actualizarObstaculos() {
    obstaculos.forEach((obs) => {
        obs.x -= 5 + nivel;
        
        // --- LÓGICA DE COLISIÓN AJUSTADA CON HITBOXES ---
        // Se calculan las coordenadas y dimensiones reales de la hitbox
        const jugadorHitboxX = jugador.x + jugador.hitboxX;
        const jugadorHitboxY = jugador.y + jugador.hitboxY;
        const obstaculoHitboxX = obs.x + obs.hitboxX;
        const obstaculoHitboxY = obs.y + obs.hitboxY;
        
        // Detección de colisión (AABB)
        if (
            jugadorHitboxX < obstaculoHitboxX + obs.hitboxAncho &&
            jugadorHitboxX + jugador.hitboxAncho > obstaculoHitboxX &&
            jugadorHitboxY < obstaculoHitboxY + obs.hitboxAlto &&
            jugadorHitboxY + jugador.hitboxAlto > obstaculoHitboxY
        ) {
            gameOver();
        }
    });
    obstaculos = obstaculos.filter((obs) => obs.x + obs.ancho > 0);
}

function dibujarHUD() {
    document.getElementById("puntaje").innerText = puntaje;
    document.getElementById("nivel").innerText = nivel;
    document.getElementById("maximo").innerText = mejorPuntaje;
}

function gameOver() {
    juegoActivo = false;
    guardarPuntaje(usuario, puntaje, nivel);
    if (hud) hud.classList.add("oculto");
    if (pantallaGameOver) {
        pantallaGameOver.classList.remove("oculto");
        puntajeFinalGameOver.innerText = puntaje;
    }
}

async function actualizarTablaScores() {
    const scoresBody = document.getElementById("scores-body");
    scoresBody.innerHTML = "";
    const scores = await obtenerScores();
    scores.forEach(score => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${score.usuario}</td>
            <td>${score.puntaje}</td>
            <td>${score.nivel}</td>
        `;
        scoresBody.appendChild(fila);
    });
}