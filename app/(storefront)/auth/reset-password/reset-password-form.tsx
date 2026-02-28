"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { resetPassword } from "@/lib/auth/actions";

/**
 * Reset password form — sends a recovery email.
 */
function ResetPasswordForm() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await resetPassword(formData);
    setLoading(false);

    if ("error" in result) {
      addToast("error", result.error);
    } else {
      setSent(true);
      addToast("success", "Email di recupero inviata");
    }
  }, [addToast]);

  if (sent) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-sm text-green-800">
          Se l&apos;email è registrata, riceverai un link per reimpostare la password.
          Controlla la tua casella di posta.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <Input label="Email" name="email" type="email" required />
      <Button type="submit" loading={loading} className="w-full">
        Invia link di recupero
      </Button>
    </form>
  );
}

export { ResetPasswordForm };
