
import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET || "secret123";

export function getUserIdFromReq(req: any) {
  const token = req.cookies.accessToken;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.userId;
  } catch {
    return null;
  }
}