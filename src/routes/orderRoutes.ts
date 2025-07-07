// routes/orderRoutes.ts
import express from "express";
import { OrderModel } from "../models/order";
import { Product } from "../models/product";
import { getUserIdFromReq } from "../utils/authUtils";

const router = express.Router();

router.post("/", async (req: any, res: any) => {
  const userId = getUserIdFromReq(req);
  const guestId = req.cookies.guestId;

  const { items, totalAmount, appliedPoints, deliveryFee } = req.body;

  if ((!userId && !guestId) || !items || items.length === 0)
    return res.status(400).json({ error: "필수값 없음" });

  // **주문 상품의 재고 차감**
  for (const item of items) {
    // 상품 정보 조회
    const product = await Product.findOne({ id: item.productId });
    if (!product) return res.status(404).json({ error: `${item.productId}번 상품을 찾을 수 없음` });

    // 재고 부족 처리
    if (product.stock < item.quantity)
      return res.status(400).json({ error: `${product.name}의 재고가 부족합니다.` });

    // 재고 차감
    product.stock -= item.quantity;
    await product.save();
  }

  // **주문 저장**
  const order = new OrderModel({
    userId,
    guestId,
    items,
    totalAmount,
    appliedPoints,
    deliveryFee,
  });
  await order.save();

  res.json({ success: true, orderId: order._id });
});

export default router;