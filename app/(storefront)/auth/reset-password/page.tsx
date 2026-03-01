import Link from "next/link";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-center text-2xl font-bold text-gray-900">Recupera password</h1>
      <p className="mt-2 text-center text-sm text-gray-600">
        Inserisci la tua email per ricevere un link di recupero
      </p>
      <div className="mt-8">
        <ResetPasswordForm />
      </div>
      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href="/auth/login" className="font-medium text-red-600 hover:text-red-700">
          Torna al login
        </Link>
      </p>
    </div>
  );
}
