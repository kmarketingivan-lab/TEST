import { requireAdmin } from "@/lib/auth/helpers";
import { CouponForm } from "../coupon-form";
import { createCoupon } from "../actions";

export default async function NewCouponPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Nuovo coupon</h1>
      <CouponForm action={createCoupon} />
    </div>
  );
}
