import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Cookie Policy di Armeria Palmetto conforme alla Direttiva ePrivacy e linee guida del Garante Privacy.",
};

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-red-700">Cookie Policy</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Informativa sull&apos;utilizzo dei cookie ai sensi della Direttiva
        ePrivacy (2002/58/CE) e delle Linee Guida del Garante per la
        Protezione dei Dati Personali (giugno 2021)
      </p>

      <section className="mt-8 space-y-6 text-neutral-900">
        {/* Cosa sono i cookie */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            1. Cosa sono i cookie
          </h2>
          <p className="mt-2 leading-relaxed">
            I cookie sono piccoli file di testo che i siti web visitati
            inviano al browser dell&apos;utente, dove vengono memorizzati per
            essere poi ritrasmessi agli stessi siti alla visita successiva. I
            cookie sono utilizzati per diverse finalità, hanno
            caratteristiche diverse e possono essere utilizzati sia dal
            titolare del sito che si sta visitando, sia da terze parti.
          </p>
        </div>

        {/* Cookie tecnici */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            2. Cookie tecnici (necessari)
          </h2>
          <p className="mt-2 leading-relaxed">
            I cookie tecnici sono indispensabili per il corretto
            funzionamento del sito e non richiedono il consenso
            dell&apos;utente. Vengono utilizzati per:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              Gestire la sessione di autenticazione dell&apos;utente.
            </li>
            <li>Ricordare i prodotti nel carrello.</li>
            <li>Memorizzare le preferenze sui cookie (consenso).</li>
            <li>Garantire la sicurezza del sito.</li>
          </ul>
        </div>

        {/* Cookie analitici */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            3. Cookie analitici
          </h2>
          <p className="mt-2 leading-relaxed">
            I cookie analitici vengono utilizzati per raccogliere informazioni
            aggregate sull&apos;utilizzo del sito (numero di visitatori,
            pagine visitate, tempo di permanenza). Questi cookie ci aiutano a
            migliorare le prestazioni e l&apos;esperienza di navigazione. Il
            loro utilizzo è subordinato al consenso dell&apos;utente.
          </p>
        </div>

        {/* Cookie di profilazione/marketing */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            4. Cookie di profilazione e marketing
          </h2>
          <p className="mt-2 leading-relaxed">
            I cookie di profilazione e marketing vengono utilizzati per
            tracciare la navigazione dell&apos;utente e creare profili sui
            suoi gusti e preferenze, al fine di inviare messaggi
            pubblicitari mirati. L&apos;utilizzo di questi cookie è
            subordinato al consenso esplicito dell&apos;utente.
          </p>
        </div>

        {/* Tabella cookie */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            5. Elenco dei cookie utilizzati
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-300 bg-neutral-100">
                  <th className="px-3 py-2 text-left font-semibold">Nome</th>
                  <th className="px-3 py-2 text-left font-semibold">Tipo</th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Finalità
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Durata
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <td className="px-3 py-2 font-mono text-xs">
                    cookie_consent
                  </td>
                  <td className="px-3 py-2">Tecnico</td>
                  <td className="px-3 py-2">
                    Memorizza le preferenze di consenso cookie
                  </td>
                  <td className="px-3 py-2">365 giorni</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-xs">
                    sb-*-auth-token
                  </td>
                  <td className="px-3 py-2">Tecnico</td>
                  <td className="px-3 py-2">
                    Sessione di autenticazione utente (Supabase)
                  </td>
                  <td className="px-3 py-2">Sessione / 7 giorni</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-xs">cart_id</td>
                  <td className="px-3 py-2">Tecnico</td>
                  <td className="px-3 py-2">
                    Identificazione del carrello per utenti non autenticati
                  </td>
                  <td className="px-3 py-2">30 giorni</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Come gestire i cookie */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            6. Come gestire i cookie
          </h2>
          <p className="mt-2 leading-relaxed">
            L&apos;utente può gestire le proprie preferenze sui cookie in
            qualsiasi momento:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              <strong>Tramite il nostro banner:</strong> è possibile
              modificare le proprie preferenze cliccando su
              &quot;Personalizza&quot; nel banner cookie che appare alla prima
              visita, oppure cancellando il cookie{" "}
              <code className="rounded bg-neutral-100 px-1 text-xs">
                cookie_consent
              </code>{" "}
              dal browser per far riapparire il banner.
            </li>
            <li>
              <strong>Tramite le impostazioni del browser:</strong> è
              possibile bloccare o eliminare i cookie attraverso le
              impostazioni del proprio browser. Di seguito i link alle guide
              dei principali browser:
              <ul className="mt-1 list-disc space-y-1 pl-6">
                <li>
                  <a
                    href="https://support.google.com/chrome/answer/95647"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-700 underline"
                  >
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.mozilla.org/it/kb/protezione-antitracciamento-avanzata-firefox-desktop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-700 underline"
                  >
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.apple.com/it-it/guide/safari/sfri11471/mac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-700 underline"
                  >
                    Safari
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-700 underline"
                  >
                    Microsoft Edge
                  </a>
                </li>
              </ul>
            </li>
          </ul>
          <p className="mt-2 leading-relaxed">
            La disabilitazione dei cookie tecnici potrebbe compromettere il
            corretto funzionamento del sito.
          </p>
        </div>

        {/* Titolare */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            7. Titolare del trattamento
          </h2>
          <p className="mt-2 leading-relaxed">
            Il Titolare del trattamento è <strong>Armeria Palmetto</strong>,
            Via Oberdan 70, 25128 Brescia (BS). Per informazioni complete sul
            trattamento dei dati personali, si prega di consultare la nostra{" "}
            <a href="/privacy-policy" className="text-red-700 underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </section>

      <p className="mt-12 text-sm text-neutral-500">
        Ultimo aggiornamento: Marzo 2026
      </p>
    </div>
  );
}
