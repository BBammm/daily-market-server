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

  // 상품 정보 채우기
  const enrichedItems = [];
  for (const item of items) {
    const product = await Product.findOne({ id: item.productId });
    if (!product)
      return res.status(404).json({ error: `${item.productId}번 상품을 찾을 수 없음` });

    if (product.stock < item.quantity)
      return res.status(400).json({ error: `${product.name}의 재고가 부족합니다.` });

    // 재고 차감
    product.stock -= item.quantity;
    await product.save();

    enrichedItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    });
  }

  // 주문 저장: **enrichedItems**를 저장해야 함
  const order = new OrderModel({
    userId,
    guestId,
    items: enrichedItems,
    totalAmount,
    appliedPoints,
    deliveryFee,
  });
  await order.save();

  res.json({ success: true, orderId: order._id });
});

router.get("/history", async (req: any, res: any) => {
  const userId = getUserIdFromReq(req);
  const guestId = req.cookies.guestId;

  // start, end: ms 단위(UNIX epoch millis)
  const start = Number(req.query.start);
  const end = Number(req.query.end);

  if ((!userId && !guestId) || !start || !end) {
    return res.status(400).json({ error: "필수값 없음" });
  }

  const query: any = {
    createdAt: {
      $gte: new Date(start),
      $lte: new Date(end),
    },
  };
  if (userId) query.userId = userId;
  else query.guestId = guestId;

  const orders = await OrderModel.find(query).sort({ createdAt: -1 }).lean();

  res.json({ orders });
});

export default router;