import { Router } from "express";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "data", "scores.json");

function leerScores() {
  try {
    return JSON.parse(readFileSync(DATA_PATH, "utf8"));
  } catch (error) {
    console.error("Error al leer scores:", error);
    // Si el archivo no existe o está vacío, devuelve un array vacío
    if (error.code === 'ENOENT') {
      writeFileSync(DATA_PATH, JSON.stringify([], null, 2));
      return [];
    }
    return [];
  }
}

function guardarScores(scores) {
  try {
    writeFileSync(DATA_PATH, JSON.stringify(scores, null, 2));
    console.log("Scores guardados correctamente.");
  } catch (error) {
    console.error("Error al guardar scores:", error);
  }
}

// Obtener leaderboard
router.get("/", (req, res) => {
  let scores = leerScores();
  scores.sort((a, b) => b.puntaje - a.puntaje);
  scores = scores.slice(0, 5);
  res.json(scores);
});

// Guardar score
router.post("/", (req, res) => {
  const { usuario, puntaje, nivel } = req.body;
  if (!usuario || puntaje == null || nivel == null) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  let scores = leerScores();
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

  guardarScores(scores);
  res.json({ ok: true, scores });
});

export default router;
