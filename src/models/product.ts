// src/models/product.ts
import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: String,
  price: Number,
  stock: Number,
});

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);