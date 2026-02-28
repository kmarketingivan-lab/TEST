"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { signUp } from "@/lib/auth/actions";

/**
 * Registration form with name, email, password, and confirm password.
 */
function RegisterForm() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (password !== confirmPassword) {
      setPasswordError("Le password non coincidono");
      return;
    }
    setPasswordError("");

    setLoading(true);
    const result = await signUp(formData);
    setLoading(false);

    // If signUp succeeds it redirects, so we only get here on error
    if (result && "error" in result) {
      addToast("error", result.error);
    }
  }, [addToast]);

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <Input label="Nome completo" name="full_name" required />
      <Input label="Email" name="email" type="email" required />
      <Input label="Password" name="password" type="password" required description="Minimo 8 caratteri" />
      <Input
        label="Conferma password"
        name="confirm_password"
        type="password"
        required
        {...(passwordError ? { error: passwordError } : {})}
      />
      <Button type="submit" loading={loading} className="w-full">
        Registrati
      </Button>
    </form>
  );
}

export { RegisterForm };
