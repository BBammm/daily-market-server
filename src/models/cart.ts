import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem {
  productId: number;
  quantity: number;
}

export interface ICart extends Document {
  guestId: string;
  items: ICartItem[];
}

const cartItemSchema = new Schema<ICartItem>({
  productId: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const cartSchema = new Schema<ICart>({
  guestId: { type: String, required: true },
  items: { type: [cartItemSchema], default: [] },
});

export const CartModel = mongoose.model<ICart>("Cart", cartSchema);