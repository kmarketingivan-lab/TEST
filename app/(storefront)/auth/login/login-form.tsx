"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { signIn } from "@/lib/auth/actions";

/**
 * Login form component with email + password.
 */
function LoginForm() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await signIn(formData);
    setLoading(false);

    // If signIn succeeds it redirects, so we only get here on error
    if (result && "error" in result) {
      addToast("error", result.error);
    }
  }, [addToast]);

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <Input label="Email" name="email" type="email" required />
      <Input label="Password" name="password" type="password" required />
      <Button type="submit" loading={loading} className="w-full">
        Accedi
      </Button>
    </form>
  );
}

export { LoginForm };
