import express from "express";
import { CartModel } from "../models/cart";
import { Product } from "../models/product";
const router = express.Router();

// ★ 모든 cart 응답이 product 정보까지 포함하게 하는 함수
async function getCartWithProductInfo(guestId: string) {
  const cart = await CartModel.findOne({ guestId });
  if (!cart) return { items: [] };

  // 1. cart 내 productId 목록 추출
  const productIds = cart.items.map((item) => item.productId);

  // 2. 실제 상품 정보 한 번에 모두 조회
  const products = await Product.find({ id: { $in: productIds } });
  const productMap = new Map(products.map((p: any) => [p.id, p]));

  // 3. items + product로 재구성 (product가 없을 경우 제외)
  const items = cart.items
    .map((item: any) => {
      const product = productMap.get(item.productId);
      if (!product) return null;
      return { product, quantity: item.quantity };
    })
    .filter(Boolean);

  return { items };
}

// 1. GET /api/cart (내 장바구니)
router.get("/", async (req: any, res: any) => {
  const guestId = req.cookies.guestId;
  if (!guestId) return res.status(400).json({ error: "게스트 아이디 없음" });
  res.json(await getCartWithProductInfo(guestId));
});

// 2. POST /api/cart/add (장바구니에 상품 추가)
router.post("/add", async (req: any, res: any) => {
  const guestId = req.cookies.guestId;
  const { productId, quantity } = req.body;
  if (!guestId || !productId) return res.status(400).json({ error: "필수값 없음" });

  let cart = await CartModel.findOne({ guestId });
  if (!cart) {
    cart = new CartModel({ guestId, items: [{ productId, quantity }] });
  } else {
    const item = cart.items.find((i: any) => i.productId === productId);
    if (item) item.quantity += quantity;
    else cart.items.push({ productId, quantity });
  }
  await cart.save();
  res.json(await getCartWithProductInfo(guestId));
});

// 3. PUT /api/cart/change (수량 변경)
router.put("/change", async (req: any, res: any) => {
  const guestId = req.cookies.guestId;
  const { productId, quantity } = req.body;
  if (!guestId || !productId) return res.status(400).json({ error: "필수값 없음" });
  const cart = await CartModel.findOne({ guestId });
  if (!cart) return res.status(404).json({ error: "카트 없음" });
  const item = cart.items.find((i: any) => i.productId === productId);
  if (item) item.quantity = quantity;
  await cart.save();
  res.json(await getCartWithProductInfo(guestId));
});

// 4. DELETE /api/cart/remove (상품 삭제)
router.delete("/remove", async (req: any, res: any) => {
  const guestId = req.cookies.guestId;
  // 쿼리 스트링으로 받는 것 기준!
  const productId = Number(req.query.productId);

  if (!guestId || !productId) {
    return res.status(400).json({ error: "필수값 없음" });
  }
  const cart = await CartModel.findOne({ guestId });
  if (!cart) return res.status(404).json({ error: "카트 없음" });
  cart.items = cart.items.filter((i: any) => i.productId !== productId);
  await cart.save();
  // 반드시 product 정보까지 join해서 응답!
  res.json(await getCartWithProductInfo(guestId));
});

// 5. POST /api/cart/clear (전체 비우기)
router.post("/clear", async (req: any, res: any) => {
  const guestId = req.cookies.guestId;
  if (!guestId) return res.status(400).json({ error: "게스트 아이디 없음" });
  const cart = await CartModel.findOne({ guestId });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  res.json(await getCartWithProductInfo(guestId));
});

export default router;