import express from "express";
import { CartModel } from "../models/cart";
import { Product } from "../models/product";
import jwt from "jsonwebtoken";
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

function getUserIdFromReq(req: any) {
  const token = req.cookies.accessToken;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.userId;
  } catch {
    return null;
  }
}

async function getCartWithProductInfo(userId?: string, guestId?: string) {
  const query: any = userId ? { userId } : { guestId };
  const cart = await CartModel.findOne(query);
  if (!cart) return { items: [] };

  const productIds = cart.items.map((item: any) => item.productId);

  // ★★★ 실제 DB에서 상품 정보 읽어오기 ★★★
  const products: any[] = await Product.find({ id: { $in: productIds } });

  const productMap = new Map(products.map((p: any) => [p.id, p]));
  const items = cart.items
    .map((item: any) => {
      const product = productMap.get(item.productId);
      // product가 없으면 해당 아이템은 제외(삭제)
      if (!product) return null;
      return { product, quantity: item.quantity };
    })
    .filter(Boolean);
  return { items };
}

router.get("/", async (req: any, res: any) => {
  const userId = getUserIdFromReq(req);
  const guestId = req.cookies.guestId;
  if (!userId && !guestId) return res.status(400).json({ error: "사용자 정보 없음" });
  res.json(await getCartWithProductInfo(userId, guestId));
});

router.post("/add", async (req: any, res: any) => {
  const userId = getUserIdFromReq(req);
  const guestId = req.cookies.guestId;
  const { productId, quantity } = req.body;
  if ((!userId && !guestId) || !productId) return res.status(400).json({ error: "필수값 없음" });
  const query: any = userId ? { userId } : { guestId };
  let cart = await CartModel.findOne(query);
  if (!cart) {
    cart = new CartModel({ ...(userId ? { userId } : { guestId }), items: [{ productId, quantity }] });
  } else {
    const item = cart.items.find((i: any) => i.productId === productId);
    if (item) item.quantity += quantity;
    else cart.items.push({ productId, quantity });
  }
  await cart.save();
  res.json(await getCartWithProductInfo(userId, guestId));
});

router.put("/change", async (req: any, res: any) => {
  const userId = getUserIdFromReq(req);
  const guestId = req.cookies.guestId;
  const { productId, quantity } = req.body;
  if ((!userId && !guestId) || !productId) return res.status(400).json({ error: "필수값 없음" });
  const query: any = userId ? { userId } : { guestId };
  const cart = await CartModel.findOne(query);
  if (!cart) return res.status(404).json({ error: "카트 없음" });
  const item = cart.items.find((i: any) => i.productId === productId);
  if (item) item.quantity = quantity;
  await cart.save();
  res.json(await getCartWithProductInfo(userId, guestId));
});

router.delete("/remove", async (req: any, res: any) => {
  const userId = getUserIdFromReq(req);
  const guestId = req.cookies.guestId;
  const productId = Number(req.query.productId);
  if ((!userId && !guestId) || !productId) return res.status(400).json({ error: "필수값 없음" });
  const query: any = userId ? { userId } : { guestId };
  const cart = await CartModel.findOne(query);
  if (!cart) return res.status(404).json({ error: "카트 없음" });
  cart.items = cart.items.filter((i: any) => i.productId !== productId);
  await cart.save();
  res.json(await getCartWithProductInfo(userId, guestId));
});

router.post("/clear", async (req: any, res: any) => {
  const userId = getUserIdFromReq(req);
  const guestId = req.cookies.guestId;
  const query: any = userId ? { userId } : { guestId };
  const cart = await CartModel.findOne(query);
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  res.json(await getCartWithProductInfo(userId, guestId));
});

// 게스트 → 로그인 시 병합
router.post("/merge", async (req: any, res: any) => {
  const userId = getUserIdFromReq(req);
  const guestId = req.body.guestId || req.cookies.guestId;
  if (!userId || !guestId) return res.status(400).json({ error: "userId, guestId 필요" });

  const guestCart = await CartModel.findOne({ guestId });
  let userCart = await CartModel.findOne({ userId });

  if (guestCart) {
    if (!userCart) {
      userCart = new CartModel({ userId, items: guestCart.items });
      await userCart.save();
    } else {
      guestCart.items.forEach((gItem: any) => {
        const uItem = userCart!.items.find((u: any) => u.productId === gItem.productId);
        if (uItem) uItem.quantity += gItem.quantity;
        else userCart!.items.push(gItem);
      });
      await userCart.save();
    }
    await guestCart.deleteOne();
  }

  res.json({ success: true });
});

export default router;