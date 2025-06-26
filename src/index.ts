import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from './db'

import productsRoutes from "./routes/productsRoutes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API 서버가 실행 중입니다! (TS)");
});

// 라우터 분리 예시
app.use("/api/products", productsRoutes);

// DB 연결 후 서버 시작
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`)
  })
})