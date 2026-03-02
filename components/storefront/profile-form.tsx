"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/components/ui/toast";
import { changePassword } from "@/lib/auth/actions";

interface ProfileFormProps {
  profile: {
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
  };
  userId: string;
}

async function updateProfileAction(
  userId: string,
  data: { full_name: string; phone: string; avatar_url: string | null }
): Promise<{ success: boolean } | { error: string }> {
  const res = await fetch("/api/account/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: (body as { error?: string }).error ?? "Errore nel salvataggio" };
  }
  return { success: true };
}

function ProfileForm({ profile, userId }: ProfileFormProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfileAction(userId, {
      full_name: fullName,
      phone,
      avatar_url: avatarUrl || null,
    });
    if ("error" in result) {
      addToast("error", result.error);
    } else {
      addToast("success", "Profilo aggiornato");
      router.refresh();
    }
    setSaving(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast("error", "Le password non coincidono");
      return;
    }
    if (newPassword.length < 8) {
      addToast("error", "La nuova password deve avere almeno 8 caratteri");
      return;
    }
    setChangingPw(true);
    const formData = new FormData();
    formData.append("current_password", currentPassword);
    formData.append("new_password", newPassword);
    const result = await changePassword(formData);
    if ("error" in result) {
      addToast("error", result.error);
    } else {
      addToast("success", "Password aggiornata");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setChangingPw(false);
  };

  return (
    <div className="space-y-8">
      {/* Dati personali */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Dati personali</h2>
        <form onSubmit={handleProfileSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Avatar
            </label>
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <div className="relative">
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-20 w-20 rounded-full border border-gray-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setAvatarUrl("")}
                    className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white shadow hover:bg-red-600"
                    aria-label="Rimuovi avatar"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-2xl font-bold text-gray-500">
                  {fullName ? fullName.charAt(0).toUpperCase() : "?"}
                </div>
              )}
              <ImageUpload
                value=""
                onChange={(url) => setAvatarUrl(url)}
                folder="avatars"
                maxSize={2 * 1024 * 1024}
              />
            </div>
          </div>

          <Input
            label="Nome completo"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            name="full_name"
          />
          <Input
            label="Telefono"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            name="phone"
          />
          <Button type="submit" loading={saving}>
            Salva modifiche
          </Button>
        </form>
      </section>

      {/* Cambia password */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Cambia password</h2>
        <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
          <Input
            label="Password attuale"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            name="current_password"
          />
          <Input
            label="Nuova password"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            name="new_password"
            description="Minimo 8 caratteri"
          />
          <Input
            label="Conferma nuova password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            name="confirm_password"
          />
          <Button type="submit" loading={changingPw}>
            Cambia password
          </Button>
        </form>
      </section>
    </div>
  );
}

export { ProfileForm };
