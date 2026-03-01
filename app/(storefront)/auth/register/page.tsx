import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-center text-2xl font-bold text-gray-900">Registrati</h1>
      <p className="mt-2 text-center text-sm text-gray-600">
        Crea un account per accedere a tutte le funzionalità
      </p>
      <div className="mt-8">
        <RegisterForm />
      </div>
      <p className="mt-6 text-center text-sm text-gray-500">
        Hai già un account?{" "}
        <Link href="/auth/login" className="font-medium text-red-600 hover:text-red-700">
          Accedi
        </Link>
      </p>
    </div>
  );
}
