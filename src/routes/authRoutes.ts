import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user";

const JWT_SECRET = process.env.JWT_SECRET || "secret123";
const router = Router();

router.get("/guest", (req: any, res: any) => {
  let guestId = req.cookies.guestId;
  if (!guestId) {
    guestId = uuidv4();
    res.cookie("guestId", guestId, { httpOnly: false, maxAge: 1000 * 60 * 60 * 24 * 7, sameSite: "lax" });
    return res.json({ guestId, created: true });
  }
  res.json({ guestId, created: false });
});

router.post("/register", async (req: any, res: any) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: "모든 값 필요" });
  const exists = await UserModel.findOne({ email });
  if (exists) return res.status(409).json({ error: "이미 가입됨" });
  const hashed = await bcrypt.hash(password, 10);
  const user = new UserModel({ email, password: hashed, name });
  await user.save();
  res.json({ success: true });
});

router.post("/login", async (req: any, res: any) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "값 필요" });
  const user = await UserModel.findOne({ email });
  if (!user) return res.status(401).json({ error: "가입 정보 없음" });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "비번 불일치" });

  const token = jwt.sign({ userId: user._id, email: user.email, nickname: user.nickname }, JWT_SECRET, { expiresIn: "7d" });
  res.cookie("accessToken", token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });
  res.json({ success: true, user: { email: user.email, nickname: user.nickname } });
});

router.post("/logout", (req, res) => {
  res.clearCookie("accessToken", { httpOnly: true, path: "/", sameSite: "lax" });
  res.json({ success: true })
});

router.get("/me", async (req: any, res: any) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ error: "토큰 없음" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json(decoded); // userId, email, name
  } catch {
    res.status(401).json({ error: "유효하지 않은 토큰" });
  }
});

export default router;