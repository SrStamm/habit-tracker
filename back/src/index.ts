import express from "express";
import mongoose from "mongoose";
import authRouter from "./modules/auth/auth.routes";
import habitRouter from "./modules/habit/habit.routes";
import entryRouter from "./modules/entry/entry.routes";

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Ligado ao MongoDB Atlas!"))
  .catch((erro) => console.error("Erro ao ligar:", erro));

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

app.use("/auth", authRouter);
app.use("/habits", habitRouter);
app.use("/habits", entryRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
