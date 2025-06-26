import express from "express";
import { Product } from "../models/product";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;
    const search = (req.query.q as string) || "";

    const skip = (page - 1) * limit;
    const query: any = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const [items, total] = await Promise.all([
      Product.find(query).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ message: "서버 에러" });
  }
});


export default router;