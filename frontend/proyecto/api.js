const API_URL = "http://localhost:3000/api/scores";

// Guardar puntaje
export async function guardarPuntaje(usuario, puntaje, nivel) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, puntaje, nivel })
    });

    if (!res.ok) throw new Error("Error en servidor");
    return await res.json();

  } catch (error) {
    console.warn("Servidor no disponible, guardando en localStorage...");
    let scores = JSON.parse(localStorage.getItem("scoresLocal")) || [];

    const idx = scores.findIndex(s => s.usuario === usuario);
    if (idx >= 0) {
      if (puntaje > scores[idx].puntaje) {
        scores[idx].puntaje = puntaje;
        scores[idx].nivel = nivel;
      }
    } else {
      scores.push({ usuario, puntaje, nivel });
    }

    scores.sort((a, b) => b.puntaje - a.puntaje);
    scores = scores.slice(0, 5);

    localStorage.setItem("scoresLocal", JSON.stringify(scores));
  }
}

// Obtener leaderboard
export async function obtenerScores() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Servidor caído");
    return await res.json();
  } catch (error) {
    console.warn("Servidor no disponible, usando localStorage...");
    return JSON.parse(localStorage.getItem("scoresLocal")) || [];
  }
}
