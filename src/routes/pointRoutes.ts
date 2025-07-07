import express from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user";
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// 인증 해석 함수(토큰 → userId 추출)
function getUserIdFromReq(req: any): any {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.userId;
  } catch {
    return null;
  }
}

router.get("/", async (req: any, res: any) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ error: "로그인 필요" });

  const user = await UserModel.findById(userId);
  if (!user) return res.status(404).json({ error: "사용자 없음" });

  // 포인트가 user 모델에 있다고 가정(없으면 0)
  res.json({ point: user.point || 0 });
});

export default router;