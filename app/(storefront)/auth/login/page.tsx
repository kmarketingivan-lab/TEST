import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-center text-2xl font-bold text-gray-900">Accedi</h1>
      <p className="mt-2 text-center text-sm text-gray-600">
        Inserisci le tue credenziali per accedere
      </p>
      <div className="mt-8">
        <LoginForm />
      </div>
      <div className="mt-6 space-y-2 text-center text-sm">
        <p className="text-gray-500">
          Non hai un account?{" "}
          <Link href="/auth/register" className="font-medium text-red-600 hover:text-red-700">
            Registrati
          </Link>
        </p>
        <p className="text-gray-500">
          <Link href="/auth/reset-password" className="font-medium text-red-600 hover:text-red-700">
            Password dimenticata?
          </Link>
        </p>
      </div>
    </div>
  );
}
