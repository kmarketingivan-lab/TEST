import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-6xl font-bold text-red-700">404</h2>
      <p className="mt-4 text-xl font-semibold text-neutral-900">Pagina non trovata</p>
      <p className="mt-2 text-neutral-600">La pagina che stai cercando non esiste.</p>
      <Link
        href="/"
        className="mt-6 text-sm font-medium text-red-600 hover:text-red-700"
      >
        &larr; Torna alla home
      </Link>
    </div>
  );
}
