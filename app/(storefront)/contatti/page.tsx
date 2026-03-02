import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contatti",
  description: "Contattaci per informazioni, preventivi o assistenza.",
};

export default function ContattiPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold uppercase text-red-700">Contatti</h1>
      <p className="mt-2 text-gray-600">
        Hai domande? Contattaci compilando il modulo o tramite i nostri recapiti.
      </p>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        {/* Contact form */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Scrivici</h2>
          <div className="mt-4">
            <ContactForm />
          </div>
        </div>

        {/* Contact info */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Informazioni</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex gap-3">
                <dt>
                  <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </dt>
                <dd>
                  <p className="font-medium text-gray-900">Indirizzo</p>
                  <p className="text-gray-600">Via Roma, 1 — 00100 Roma (RM)</p>
                </dd>
              </div>

              <div className="flex gap-3">
                <dt>
                  <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </dt>
                <dd>
                  <p className="font-medium text-gray-900">Telefono</p>
                  <p className="text-gray-600">+39 06 1234567</p>
                </dd>
              </div>

              <div className="flex gap-3">
                <dt>
                  <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </dt>
                <dd>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-gray-600">info@armeria.it</p>
                </dd>
              </div>

              <div className="flex gap-3">
                <dt>
                  <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </dt>
                <dd>
                  <p className="font-medium text-gray-900">Orari</p>
                  <p className="text-gray-600">Lun - Ven: 9:00 - 19:00</p>
                  <p className="text-gray-600">Sab: 9:00 - 13:00</p>
                  <p className="text-gray-600">Dom: Chiuso</p>
                </dd>
              </div>
            </dl>
          </div>

          {/* Map embed */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Dove siamo</h2>
            <div className="mt-4 aspect-video overflow-hidden rounded-lg border border-gray-200">
              <iframe
                title="Mappa"
                src="https://www.openstreetmap.org/export/embed.html?bbox=12.47%2C41.89%2C12.50%2C41.91&layer=mapnik"
                className="h-full w-full"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
