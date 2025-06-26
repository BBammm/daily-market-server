import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.post("/guest", (req: Request, res: Response) => {
  const guestId = uuidv4();
  // Secure, HttpOnly 옵션도 필요에 따라 추가
  res.cookie("guestId", guestId, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 }); // 7일 유지
  res.json({ guestId });
});

export default router;