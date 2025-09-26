import express from "express";
import cors from "cors";
import scoresRoutes from "./scores.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/scores", scoresRoutes);

app.listen(3000, () => {
  console.log("Servidor backend corriendo en http://localhost:3000");
});
