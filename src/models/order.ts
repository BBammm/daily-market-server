// models/order.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IOrderProduct {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  userId?: string;      // 회원 주문이면 userId 저장
  guestId?: string;     // 비회원 주문이면 guestId 저장
  items: IOrderProduct[];
  totalAmount: number;
  appliedPoints: number;
  deliveryFee: number;
  createdAt: Date;
}

const orderProductSchema = new Schema<IOrderProduct>({
  productId: { type: Number, required: true },
  name:      { type: String, required: true },
  price:     { type: Number, required: true },
  quantity:  { type: Number, required: true },
});

const orderSchema = new Schema<IOrder>({
  userId:        { type: String },
  guestId:       { type: String },
  items:         { type: [orderProductSchema], required: true },
  totalAmount:   { type: Number, required: true },
  appliedPoints: { type: Number, required: true },
  deliveryFee:   { type: Number, required: true },
  createdAt:     { type: Date, default: Date.now },
});

export const OrderModel = mongoose.model<IOrder>("Order", orderSchema);