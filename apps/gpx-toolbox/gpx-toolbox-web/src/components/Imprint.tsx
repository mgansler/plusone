import { useTranslation } from 'react-i18next'

/**
 * Imprint (Impressum) of GPX-Toolcat, required for telemedia in Germany (§ 5 DDG). Public, like the privacy
 * policy, so it can be read before logging in.
 */
export function Imprint() {
  const { t } = useTranslation()
  return (
    <article style={styles.page}>
      <a href="/" style={styles.back}>
        {t('imprint.back')}
      </a>
      <h1 style={styles.title}>{t('imprint.title')}</h1>

      <h2 style={styles.heading}>{t('imprint.legalNotice')}</h2>
      <p style={styles.text}>
        Martin Gansler
        <br />
        Ludwigstraße 42
        <br />
        70176 Stuttgart
        <br />
        Deutschland
      </p>

      <h2 style={styles.heading}>{t('imprint.contact')}</h2>
      <p style={styles.text}>
        {t('imprint.email')}: <a href="mailto:gpx-toolbox@martingansler.de">gpx-toolbox@martingansler.de</a>
      </p>

      <p style={styles.text}>
        Informationen zur Verarbeitung personenbezogener Daten findest du in der{' '}
        <a href="/datenschutz" style={styles.link}>
          Datenschutzerklärung
        </a>
        .
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
  text: {
    fontSize: 14,
    margin: '0 0 0.75rem',
  },
  link: {
    color: '#3b82f6',
  },
} as const
