import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;  // 해시 저장
  nickname?: string;
  createdAt: Date;
  updatedAt: Date;
  role?: "user" | "admin";
  point?: number;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // bcrypt로 해시!
  nickname: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  point: { type: Number, default: 0 },
}, { timestamps: true });

export const UserModel = mongoose.model<IUser>("User", userSchema);