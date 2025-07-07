import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from './db'
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import productsRoutes from "./routes/productsRoutes";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes"

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(  
  cors({
    origin: "http://localhost:3000", // 프론트 주소 **정확하게**!
    credentials: true, // <- 반드시 필요 (쿠키 허용)
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("API 서버가 실행 중입니다! (TS)");
});

// 라우터 분리
app.use("/api/products", productsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);

// DB 연결 후 서버 시작
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`)
  })
})