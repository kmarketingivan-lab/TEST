import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Informativa sulla privacy di Armeria Palmetto ai sensi del Reg. UE 2016/679 (GDPR).",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-red-700">Privacy Policy</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Informativa sulla privacy ai sensi del Regolamento UE 2016/679 (GDPR)
      </p>

      <section className="mt-8 space-y-6 text-neutral-900">
        {/* Titolare */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            1. Titolare del trattamento
          </h2>
          <p className="mt-2 leading-relaxed">
            Il Titolare del trattamento dei dati personali è{" "}
            <strong>Armeria Palmetto</strong>, con sede in Via Oberdan 70,
            25121 Brescia (BS), Italia.
          </p>
          <p className="mt-1 leading-relaxed">
            Email di contatto:{" "}
            <a
              href="mailto:privacy@armeriapalmetto.it"
              className="text-red-700 underline"
            >
              privacy@armeriapalmetto.it
            </a>
          </p>
        </div>

        {/* Dati raccolti */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            2. Dati personali raccolti
          </h2>
          <p className="mt-2 leading-relaxed">
            Raccogliamo le seguenti categorie di dati personali:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              <strong>Dati identificativi:</strong> nome, cognome, indirizzo
              email, numero di telefono, indirizzo di spedizione e
              fatturazione.
            </li>
            <li>
              <strong>Dati di navigazione:</strong> indirizzo IP, tipo di
              browser, pagine visitate, data e ora di accesso.
            </li>
            <li>
              <strong>Dati di acquisto:</strong> prodotti ordinati, importi,
              metodi di pagamento (i dati della carta di credito sono gestiti
              esclusivamente dal fornitore di pagamento).
            </li>
            <li>
              <strong>Dati relativi a prenotazioni:</strong> servizio
              richiesto, data e ora della prenotazione.
            </li>
          </ul>
        </div>

        {/* Finalità */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            3. Finalità del trattamento
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Gestione degli ordini e delle spedizioni.</li>
            <li>Gestione delle prenotazioni per i servizi offerti.</li>
            <li>
              Adempimento degli obblighi legali, fiscali e contabili.
            </li>
            <li>
              Assistenza clienti e riscontro a richieste di contatto.
            </li>
            <li>
              Miglioramento del sito e analisi statistiche aggregate (previo
              consenso).
            </li>
            <li>
              Invio di comunicazioni commerciali e promozionali (previo
              consenso).
            </li>
          </ul>
        </div>

        {/* Base giuridica */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            4. Base giuridica del trattamento
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              <strong>Esecuzione contrattuale:</strong> il trattamento è
              necessario per l&apos;esecuzione del contratto di acquisto o di
              prenotazione.
            </li>
            <li>
              <strong>Obbligo legale:</strong> il trattamento è necessario per
              adempiere a obblighi di legge (fiscali, contabili, di pubblica
              sicurezza).
            </li>
            <li>
              <strong>Consenso:</strong> per finalità di marketing e
              profilazione, il trattamento avviene solo previo consenso
              esplicito dell&apos;interessato.
            </li>
            <li>
              <strong>Legittimo interesse:</strong> per la prevenzione delle
              frodi e la sicurezza del sito.
            </li>
          </ul>
        </div>

        {/* Destinatari */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            5. Destinatari dei dati
          </h2>
          <p className="mt-2 leading-relaxed">
            I dati personali possono essere comunicati a:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              Corrieri e spedizionieri per la consegna degli ordini.
            </li>
            <li>
              Fornitori di servizi di pagamento (es. Stripe) per
              l&apos;elaborazione delle transazioni.
            </li>
            <li>
              Fornitori di servizi tecnologici (hosting, assistenza tecnica).
            </li>
            <li>
              Autorità competenti, ove richiesto dalla legge.
            </li>
          </ul>
        </div>

        {/* Trasferimento extra-UE */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            6. Trasferimento dei dati extra-UE
          </h2>
          <p className="mt-2 leading-relaxed">
            Alcuni dei nostri fornitori di servizi tecnologici potrebbero avere
            sede al di fuori dello Spazio Economico Europeo. In tal caso, il
            trasferimento dei dati avviene sulla base di decisioni di
            adeguatezza della Commissione Europea, Clausole Contrattuali
            Standard (SCC) o altre garanzie appropriate ai sensi degli artt.
            46-49 del GDPR.
          </p>
        </div>

        {/* Conservazione */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            7. Periodo di conservazione
          </h2>
          <p className="mt-2 leading-relaxed">
            I dati personali sono conservati per il tempo strettamente
            necessario alle finalità per cui sono stati raccolti:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              Dati contrattuali: per la durata del contratto e per i 10 anni
              successivi (obblighi fiscali).
            </li>
            <li>
              Dati di navigazione: massimo 24 mesi dalla raccolta.
            </li>
            <li>
              Dati per finalità di marketing: fino alla revoca del consenso.
            </li>
          </ul>
        </div>

        {/* Diritti */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            8. Diritti dell&apos;interessato
          </h2>
          <p className="mt-2 leading-relaxed">
            Ai sensi degli artt. 15-22 del GDPR, l&apos;interessato ha
            diritto di:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              <strong>Accesso:</strong> ottenere conferma dell&apos;esistenza
              di un trattamento e accedere ai propri dati.
            </li>
            <li>
              <strong>Rettifica:</strong> ottenere la correzione di dati
              inesatti o incompleti.
            </li>
            <li>
              <strong>Cancellazione:</strong> ottenere la cancellazione dei
              propri dati (diritto all&apos;oblio), ove applicabile.
            </li>
            <li>
              <strong>Portabilità:</strong> ricevere i propri dati in formato
              strutturato e leggibile da dispositivo automatico.
            </li>
            <li>
              <strong>Opposizione:</strong> opporsi al trattamento per motivi
              legittimi.
            </li>
            <li>
              <strong>Limitazione:</strong> ottenere la limitazione del
              trattamento nei casi previsti dalla legge.
            </li>
            <li>
              <strong>Reclamo:</strong> proporre reclamo al Garante per la
              Protezione dei Dati Personali (
              <a
                href="https://www.garanteprivacy.it"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-700 underline"
              >
                www.garanteprivacy.it
              </a>
              ).
            </li>
          </ul>
          <p className="mt-2 leading-relaxed">
            Per esercitare i propri diritti, scrivere a{" "}
            <a
              href="mailto:privacy@armeriapalmetto.it"
              className="text-red-700 underline"
            >
              privacy@armeriapalmetto.it
            </a>
            .
          </p>
        </div>

        {/* Cookie */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">9. Cookie</h2>
          <p className="mt-2 leading-relaxed">
            Per informazioni dettagliate sull&apos;utilizzo dei cookie, si
            prega di consultare la nostra{" "}
            <a href="/cookie-policy" className="text-red-700 underline">
              Cookie Policy
            </a>
            .
          </p>
        </div>

        {/* Contatti DPO */}
        <div>
          <h2 className="text-xl font-semibold text-red-700">
            10. Contatti e DPO
          </h2>
          <p className="mt-2 leading-relaxed">
            Per qualsiasi domanda relativa al trattamento dei dati personali,
            è possibile contattare il Titolare all&apos;indirizzo email{" "}
            <a
              href="mailto:privacy@armeriapalmetto.it"
              className="text-red-700 underline"
            >
              privacy@armeriapalmetto.it
            </a>{" "}
            o presso la sede in Via Oberdan 70, 25121 Brescia (BS).
          </p>
        </div>
      </section>

      <p className="mt-12 text-sm text-neutral-500">
        Ultimo aggiornamento: Marzo 2026
      </p>
    </div>
  );
}
