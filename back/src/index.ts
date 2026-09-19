import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.configDotenv();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Ligado ao MongoDB Atlas!"))
  .catch((erro) => console.error("Erro ao ligar:", erro));

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
