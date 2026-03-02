import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/storefront/profile-form";
import type { Profile } from "@/types/database";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("full_name, phone, avatar_url")
    .eq("id", user.id)
    .single();

  const profile = (data as Pick<Profile, "full_name" | "phone" | "avatar_url">) ?? {
    full_name: null,
    phone: null,
    avatar_url: null,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Profilo</h1>
      <p className="mt-1 text-sm text-gray-600">
        Gestisci i tuoi dati personali e la password
      </p>
      <div className="mt-6">
        <ProfileForm profile={profile} userId={user.id} />
      </div>
    </div>
  );
}
