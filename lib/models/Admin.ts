import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IAdmin extends Document {
  username: string;
  passwordHash: string;
  comparePassword(plain: string): Promise<boolean>;
}

interface IAdminModel extends Model<IAdmin> {
  hashPassword(plain: string): Promise<string>;
}

const adminSchema = new Schema<IAdmin>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

adminSchema.methods.comparePassword = function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash);
};

adminSchema.statics.hashPassword = function (plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
};

adminSchema.set("toJSON", {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(_doc: unknown, ret: any) {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

export const Admin: IAdminModel =
  (mongoose.models.Admin as IAdminModel) ??
  mongoose.model<IAdmin, IAdminModel>("Admin", adminSchema);
