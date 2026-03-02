import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { CouponForm } from "../../coupon-form";
import { updateCoupon } from "../../actions";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCouponPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const supabase = await createClient();
  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .eq("id", id)
    .single();

  if (!coupon) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    return updateCoupon(id, formData);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Modifica coupon</h1>
      <CouponForm coupon={coupon as Record<string, unknown>} action={handleUpdate} />
    </div>
  );
}
