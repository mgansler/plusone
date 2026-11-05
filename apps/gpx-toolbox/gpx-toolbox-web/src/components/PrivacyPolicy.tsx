import type { ReactNode } from 'react'

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={styles.link}>
      {children}
    </a>
  )
}

/**
 * Privacy policy of GPX-Toolcat. Describes what the app does with data today, keep it in sync with the code
 * (login, third-party requests, logs). Public: Google requires the page for the consent screen
 * and visitors have to read it before they log in.
 */
export function PrivacyPolicy() {
  return (
    <article style={styles.page}>
      <a href="/" style={styles.back}>
        ← Zurück
      </a>
      <h1 style={styles.title}>Datenschutzerklärung</h1>
      <p style={styles.text}>
        GPX-Toolcat ist ein Werkzeug, um Radrouten zu planen, zu speichern und zu bewerten. Diese Erklärung beschreibt,
        welche personenbezogenen Daten dabei verarbeitet werden. Die App enthält keine Werbung und keine Analyse- oder
        Tracking-Dienste.
      </p>

      <h2 style={styles.heading}>1. Verantwortlicher</h2>
      <p style={styles.text}>
        Martin Gansler
        <br />
        Ludwigstraße 42
        <br />
        70176 Stuttgart
        <br />
        E-Mail: gpx-toolbox@martingansler.de
      </p>
      <p style={styles.text}>
        An diese Adresse kannst du dich auch mit Fragen zum Datenschutz, für Auskunft und Löschung und bei Problemen mit
        der App wenden.
      </p>

      <h2 style={styles.heading}>2. Welche Daten wir verarbeiten</h2>

      <h3 style={styles.subheading}>2.1 Anmeldung mit Google</h3>
      <p style={styles.text}>
        Du meldest dich mit deinem Google-Konto an. Von Google erhalten wir deine Google-Kennung (ID), deinen Namen,
        deine E-Mail-Adresse (nur wenn Google sie als bestätigt meldet) und die Adresse deines Profilbilds. Wir
        speichern diese Daten auf unserem Server, um dich beim nächsten Besuch wiederzuerkennen und deinen Namen
        anzuzeigen. Dein Google-Passwort erhalten wir nicht.
      </p>
      <p style={styles.text}>
        Bei der Anmeldung verarbeitet Google selbst Daten, zum Beispiel deine IP-Adresse und dass du dich bei
        GPX-Toolcat anmeldest. Verantwortlich dafür ist Google Ireland Limited, Gordon House, Barrow Street, Dublin 4,
        Irland. Mehr dazu in der{' '}
        <ExternalLink href="https://policies.google.com/privacy">Datenschutzerklärung von Google</ExternalLink>.
      </p>
      <p style={styles.text}>Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Bereitstellung der App für dein Konto).</p>

      <h3 style={styles.subheading}>2.2 Deine Routen und Aktivitäten</h3>
      <p style={styles.text}>
        Wenn du GPX-Dateien hochlädst oder Routen anlegst, speichern wir den Streckenverlauf (Koordinaten und Höhen),
        den Namen und die Beschreibung, abgeleitete Werte wie Distanz und Höhenmeter, deine Notizen und Bewertungen. Zu
        Aktivitäten speichern wir Titel, Datum, Dauer, gegebenenfalls Herzfrequenz und das Wetter am Tag der Fahrt. Die
        Daten sind deinem Konto zugeordnet und nur für dich sichtbar. Sie sind Standortdaten, die Rückschlüsse auf deine
        Wohnung und deine Gewohnheiten zulassen können, behandle hochgeladene Strecken daher entsprechend.
      </p>
      <p style={styles.text}>
        <strong>Herzfrequenz:</strong> Enthält eine hochgeladene GPX-Datei Herzfrequenzwerte, speichern wir sie mit der
        gespeicherten Datei und bei Aktivitäten zusätzlich als Durchschnitts- und Höchstwert. Herzfrequenzdaten können
        Rückschlüsse auf deine Gesundheit zulassen und gelten deshalb als Gesundheitsdaten (Art. 9 DSGVO). Wir
        verarbeiten sie nur, wenn du eine Datei mit solchen Werten hochlädst, und nur, um sie dir in der App bei deinen
        eigenen Fahrten anzuzeigen. Möchtest du keine Herzfrequenz speichern, lade eine Datei ohne Pulswerte hoch.
      </p>
      <p style={styles.text}>
        Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO. Für die Herzfrequenz ist es deine ausdrückliche Einwilligung nach
        Art. 9 Abs. 2 lit. a DSGVO, die du durch das Hochladen der Datei erteilst. Im Upload-Dialog weisen wir darauf
        hin. Du kannst die Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen, indem du die betroffenen
        Routen und Aktivitäten löschst oder uns per E-Mail um Löschung bittest.
      </p>

      <h3 style={styles.subheading}>2.3 Anmeldestatus im Browser</h3>
      <p style={styles.text}>
        Nach der Anmeldung speichert dein Browser ein Anmeldetoken im lokalen Speicher (<code>localStorage</code>,
        Schlüssel <code>gpx-toolbox-jwt</code>). Es gilt 7 Tage und wird beim Abmelden gelöscht. Nur während der
        Anmeldung bei Google setzen wir ein kurzlebiges Cookie (<code>gpx_toolbox_oauth</code>, höchstens 10 Minuten),
        das den Vorgang vor Missbrauch schützt. Beides ist für den Betrieb der App erforderlich, es gibt keine Cookies
        zu Werbe- oder Analysezwecken. Rechtsgrundlage: § 25 Abs. 2 Nr. 2 TDDDG, Art. 6 Abs. 1 lit. b DSGVO.
      </p>

      <h3 style={styles.subheading}>2.4 Protokolle</h3>
      <p style={styles.text}>Beim Betrieb der App entstehen zwei Arten von Protokollen:</p>
      <ul style={styles.list}>
        <li>
          <strong>Zugriffsprotokoll des Reverse-Proxys (Traefik):</strong> Jeder Aufruf der Seite und der Schnittstelle
          wird mit deiner IP-Adresse, dem Zeitpunkt, der Methode, der aufgerufenen Adresse (einschließlich Parametern,
          etwa den Koordinaten einer Umkreissuche), dem Statuscode, der Größe der Antwort und der Dauer gespeichert. Die
          Protokolle werden täglich rotiert und nach 14 Tagen gelöscht.
        </li>
        <li>
          <strong>Anwendungsprotokoll:</strong> Die App protokolliert jede Anfrage mit Zeitpunkt, Methode, aufgerufener
          Adresse (einschließlich Parametern), Statuscode und Dauer sowie Fehlermeldungen. Es enthält keine IP-Adresse
          und keinen Namen.
        </li>
      </ul>
      <p style={styles.text}>
        Zweck ist der sichere und stabile Betrieb, also Fehleranalyse und Abwehr von Missbrauch. Rechtsgrundlage: Art. 6
        Abs. 1 lit. f DSGVO.
      </p>

      <h2 style={styles.heading}>3. Empfänger und eingebundene Dienste</h2>
      <ul style={styles.list}>
        <li>
          <strong>Hosting:</strong> Die App läuft auf einem Server der netcup GmbH, Emmy-Noether-Straße 10, 76131
          Karlsruhe, Deutschland (Rechenzentrum: Nürnberg, Deutschland). Dort liegen die Datenbank mit deinen Daten und
          die Protokolle. netcup verarbeitet sie in unserem Auftrag auf Grundlage eines Vertrags zur
          Auftragsverarbeitung nach Art. 28 DSGVO. Mehr dazu in der{' '}
          <ExternalLink href="https://www.netcup.com/de/kontakt/datenschutzerklaerung">
            Datenschutzerklärung von netcup
          </ExternalLink>
          .
        </li>
        <li>
          <strong>Google</strong> für die Anmeldung (Abschnitt 2.1).
        </li>
        <li>
          <strong>Open-Meteo (open-meteo.com)</strong> für Wetterdaten und die Ortssuche. Für das Wetter sendet unser
          Server die Koordinaten des Streckenmittelpunkts und das Datum der Fahrt an Open-Meteo. Für die Ortssuche
          sendet dein Browser den eingegebenen Ortsnamen direkt an Open-Meteo. Dein Name und deine Kennung werden nicht
          übermittelt.
        </li>
        <li>
          <strong>Kartenkacheln:</strong> Die Karte lädt dein Browser direkt von den Servern des gewählten Anbieters:
          OpenStreetMap (OpenStreetMap Foundation) oder Esri ArcGIS für die Satellitenansicht. Dabei erhält der Anbieter
          deine IP-Adresse und den angezeigten Kartenausschnitt.
        </li>
        <li>
          <strong>Standort:</strong> Wenn du im Browser die Standortfreigabe erteilst, zentriert die Karte auf deinen
          Standort. Koordinaten, die du für die Suche „In der Nähe“ eingibst oder über die Standortfreigabe wählst,
          sendet dein Browser an unseren Server. Wir speichern sie nicht, sie erscheinen aber im Protokoll (Abschnitt
          2.4).
        </li>
      </ul>
      <p style={styles.text}>
        Rechtsgrundlage für Wetter, Ortssuche und Karte: Art. 6 Abs. 1 lit. b DSGVO, soweit du die Funktion nutzt, und
        lit. f DSGVO (Anzeige der Karte und Wetterdaten als Kern der App). Wir verkaufen keine Daten und geben sie nicht
        an Werbe- oder Analysedienste weiter.
      </p>
      <p style={styles.text}>
        Google (Anmeldung) und Esri (Satellitenansicht) können Daten in den USA verarbeiten. Beide sind unter dem EU-US
        Data Privacy Framework zertifiziert, für diese Übermittlungen besteht ein Angemessenheitsbeschluss der
        EU-Kommission (Art. 45 DSGVO). Open-Meteo hat seinen Sitz in der Schweiz, die OpenStreetMap Foundation im
        Vereinigten Königreich. Auch für diese Länder besteht ein Angemessenheitsbeschluss. Die OpenStreetMap Foundation
        liefert Kartenkacheln über ein weltweites Netz von Cache-Servern aus. Deine IP-Adresse kann dabei auch auf
        Servern außerhalb der EU verarbeitet werden, worauf wir keinen Einfluss haben.
      </p>

      <h2 style={styles.heading}>4. Pflicht zur Bereitstellung</h2>
      <p style={styles.text}>
        Für die Nutzung der App ist die Anmeldung mit einem Google-Konto erforderlich. Ohne die in Abschnitt 2.1
        genannten Daten können wir dein Konto nicht führen. Eine automatisierte Entscheidungsfindung einschließlich
        Profiling findet nicht statt.
      </p>

      <h2 style={styles.heading}>5. Speicherdauer und Löschung</h2>
      <p style={styles.text}>
        Wir speichern deine Daten, solange dein Konto besteht. Eine Löschfunktion in der App gibt es derzeit nicht.
        Schreibe uns eine E-Mail an gpx-toolbox@martingansler.de, dann löschen wir dein Konto und alle zugehörigen Daten
        (Routen, Aktivitäten) unverzüglich, spätestens innerhalb von 30 Tagen, und bestätigen dir das schriftlich.
      </p>
      <p style={styles.text}>
        Die Zugriffsprotokolle des Reverse-Proxys löschen wir nach 14 Tagen. Das Anwendungsprotokoll wird nach Größe
        rotiert, es enthält höchstens die letzten ca. 30 MB und damit je nach Nutzung die Anfragen weniger Tage bis
        Wochen.
      </p>

      <h2 style={styles.heading}>6. Deine Rechte</h2>
      <p style={styles.text}>Du hast das Recht auf</p>
      <ul style={styles.list}>
        <li>Auskunft über deine gespeicherten Daten (Art. 15 DSGVO),</li>
        <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO),</li>
        <li>Löschung (Art. 17 DSGVO) und Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
        <li>Herausgabe deiner Daten in einem gängigen Format (Art. 20 DSGVO),</li>
        <li>Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21 DSGVO),</li>
        <li>Widerruf einer Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO).</li>
      </ul>
      <p style={styles.text}>
        Wende dich dafür an die Adresse in Abschnitt 1. Außerdem kannst du dich bei einer Datenschutzaufsichtsbehörde
        beschweren (Art. 77 DSGVO), für uns zuständig ist der Landesbeauftragte für den Datenschutz und die
        Informationsfreiheit Baden-Württemberg, Heilbronner Straße 35, 70191 Stuttgart.
      </p>

      <h2 style={styles.heading}>7. Änderungen</h2>
      <p style={styles.text}>
        Wir passen diese Erklärung an, wenn sich die App oder die Rechtslage ändert. Es gilt die jeweils hier
        veröffentlichte Fassung. Stand: 5. November 2026.
      </p>

      <p style={styles.text}>
        <a href="/impressum" style={styles.link}>
          Impressum
        </a>
      </p>
    </article>
  )
}

const styles = {
  page: {
    maxWidth: 720,
    margin: '0 auto',
    padding: '2rem 1.25rem 4rem',
    color: '#1e293b',
    lineHeight: 1.65,
  },
  back: {
    fontSize: 14,
    color: '#3b82f6',
    textDecoration: 'none',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    margin: '1rem 0 1rem',
  },
  heading: {
    fontSize: 20,
    fontWeight: 600,
    margin: '2rem 0 0.75rem',
  },
  subheading: {
    fontSize: 16,
    fontWeight: 600,
    margin: '1.5rem 0 0.5rem',
  },
  text: {
    fontSize: 14,
    margin: '0 0 0.75rem',
  },
  list: {
    fontSize: 14,
    margin: '0 0 0.75rem',
    paddingLeft: '1.5rem',
  },
  link: {
    color: '#3b82f6',
  },
} as const
