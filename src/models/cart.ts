import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem {
  productId: number;
  quantity: number;
}

export interface ICart extends Document {
  userId?: any;
  guestId?: any
  items: ICartItem[];
}

const cartItemSchema = new Schema<ICartItem>({
  productId: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const cartSchema = new Schema<ICart>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: false }, // 회원 장바구니
  guestId: { type: String, required: false },                            // 비회원 장바구니
  items: { type: [cartItemSchema], default: [] },
});

export const CartModel = mongoose.model<ICart>("Cart", cartSchema);