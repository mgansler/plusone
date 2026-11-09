import i18n from 'i18next'
import { type ChangeEvent, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type QueryKey, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

import { importGpx, ImportRouteUploadDtoSource } from '@plusone/gpx-toolbox-api-client'

import { readStravaExport, type StravaExport } from '../utils/stravaExport'

import { Modal, modalStyles } from './Modal'

type StravaExportImportModalProps = {
  /** Queries to refetch after the import */
  invalidateQueryKeys: Array<QueryKey>
  onClose: () => void
}

type ImportResult = {
  imported: number
  /** Routes the user already had, nothing was created for them */
  duplicates: number
  failed: Array<{ name: string; reason: string }>
  cancelled: boolean
  /** Why the import stopped by itself, if it did */
  abortReason: string | null
  total: number
}

/** Failed routes listed in the result, the rest is counted */
const MAX_LISTED_FAILURES = 10

/** The message of a failed request: Nest answers with JSON, anything else is shown as it is */
function errorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data: unknown = error.response?.data
    const message =
      typeof data === 'object' && data !== null ? (data as { message?: string | Array<string> }).message : data
    if (message) return Array.isArray(message) ? message.join(', ') : String(message)
    if (error.response) return i18n.t('stravaImport.error', { status: error.response.status })
  }
  return error instanceof Error ? error.message : i18n.t('stravaImport.unknownError')
}

/**
 * Imports the routes of a Strava data export (the GDPR export): the user picks the unpacked export folder, only
 * routes.csv and the GPX files in its routes folder are read and uploaded, one route after the other. Routes that
 * already exist with exactly the same track are skipped, so the import can be repeated.
 */
export function StravaExportImportModal({ invalidateQueryKeys, onClose }: StravaExportImportModalProps) {
  const { t } = useTranslation()
  const [stravaExport, setStravaExport] = useState<StravaExport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const cancelled = useRef(false)
  const queryClient = useQueryClient()

  // Closing the dialog stops an import that is still running
  useEffect(
    () => () => {
      cancelled.current = true
    },
    [],
  )

  const routes = (stravaExport?.routes ?? []).map((route) => ({
    ...route,
    file: stravaExport?.gpxFiles.get(route.filename),
  }))
  const missing = routes.filter((route) => !route.file).length
  const importing = progress !== null && result === null

  async function handleFolder(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    setError(null)
    setStravaExport(null)
    if (files.length === 0) return

    try {
      const found = await readStravaExport(files)
      if (!found) {
        setError(t('stravaImport.noRoutesCsv'))
      } else if (found.routes.length === 0) {
        setError(t('stravaImport.emptyRoutesCsv'))
      } else {
        setStravaExport(found)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('stravaImport.readError'))
    }
  }

  async function startImport() {
    cancelled.current = false
    const outcome: ImportResult = {
      imported: 0,
      duplicates: 0,
      failed: [],
      cancelled: false,
      abortReason: null,
      total: routes.length,
    }
    setProgress({ done: 0, total: routes.length })

    for (const [index, route] of routes.entries()) {
      if (cancelled.current) {
        outcome.cancelled = true
        break
      }
      setProgress({ done: index, total: routes.length })

      if (!route.file) {
        outcome.failed.push({ name: route.name, reason: t('stravaImport.fileMissing', { filename: route.filename }) })
        continue
      }

      try {
        const created = await importGpx({
          file: route.file,
          name: route.name || undefined,
          source: ImportRouteUploadDtoSource.manualImport,
          skipDuplicate: true,
        })

        // A server without the duplicate check (e.g. a dev server that was not restarted) ignores the option and
        // does not report the flag. Going on would copy every route that already exists.
        if (typeof created.duplicate !== 'boolean') {
          outcome.imported++
          outcome.abortReason = t('stravaImport.serverOld')
          break
        }
        if (created.duplicate) outcome.duplicates++
        else outcome.imported++
      } catch (err) {
        outcome.failed.push({ name: route.name, reason: errorMessage(err) })
      }
    }

    for (const queryKey of invalidateQueryKeys) {
      void queryClient.invalidateQueries({ queryKey })
    }
    setResult(outcome)
  }

  return (
    <Modal title={t('stravaImport.title')} onClose={onClose} maxWidth={480}>
      {result ? (
        <div role="status" style={styles.body}>
          <p style={styles.summary}>
            {result.cancelled || result.abortReason ? t('stravaImport.cancelled') : t('stravaImport.finished')}
          </p>
          {result.abortReason && (
            <div role="alert" style={{ ...modalStyles.error, margin: 0 }}>
              {result.abortReason}
            </div>
          )}
          <ul style={styles.list}>
            <li>{t('stravaImport.imported', { count: result.imported })}</li>
            {result.duplicates > 0 && <li>{t('stravaImport.skipped', { count: result.duplicates })}</li>}
            {result.failed.length > 0 && <li>{t('stravaImport.failed', { count: result.failed.length })}</li>}
            {(result.cancelled || result.abortReason) && (
              <li>
                {t('stravaImport.remaining', {
                  count: result.total - result.imported - result.duplicates - result.failed.length,
                })}
              </li>
            )}
          </ul>
          {result.failed.length > 0 && (
            <ul style={styles.failures}>
              {result.failed.slice(0, MAX_LISTED_FAILURES).map((failure, index) => (
                <li key={index}>
                  {failure.name || t('stravaImport.noName')}: {failure.reason}
                </li>
              ))}
              {result.failed.length > MAX_LISTED_FAILURES && (
                <li>{t('stravaImport.andMore', { count: result.failed.length - MAX_LISTED_FAILURES })}</li>
              )}
            </ul>
          )}
          <div style={modalStyles.actions}>
            <button type="button" onClick={onClose} style={modalStyles.submitButton}>
              {t('stravaImport.close')}
            </button>
          </div>
        </div>
      ) : importing ? (
        <div style={styles.body}>
          <p style={styles.summary}>
            {t('stravaImport.importing', {
              current: Math.min(progress.done + 1, progress.total),
              total: progress.total,
            })}
          </p>
          <progress
            value={progress.done}
            max={progress.total}
            aria-label={t('stravaImport.progress')}
            style={styles.progress}
          />
          <div style={modalStyles.actions}>
            <button
              type="button"
              onClick={() => {
                cancelled.current = true
              }}
              style={modalStyles.cancelButton}
            >
              {t('stravaImport.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.body}>
          <p style={styles.text}>
            {t('stravaImport.description', {
              routesCsv: '<code>routes.csv</code>',
              routesFolder: '<code>routes</code>',
            })}
          </p>

          <label style={styles.picker}>
            <input
              type="file"
              // Selecting a folder is not part of the typed attributes of the input element
              {...({ webkitdirectory: '' } as object)}
              multiple
              onChange={handleFolder}
              style={{ display: 'none' }}
            />
            {stravaExport ? t('stravaImport.selectOtherFolder') : t('stravaImport.selectFolder')}
          </label>

          {error && (
            <div role="alert" style={{ ...modalStyles.error, margin: 0 }}>
              {error}
            </div>
          )}

          {stravaExport && (
            <p role="status" style={styles.text}>
              {t('stravaImport.routesFound', { count: routes.length })}
              {missing > 0 && ` ${t('stravaImport.missingGpx', { count: missing })}`}
            </p>
          )}

          <div style={modalStyles.actions}>
            <button type="button" onClick={onClose} style={modalStyles.cancelButton}>
              {t('stravaImport.cancel')}
            </button>
            <button
              type="button"
              disabled={!stravaExport || missing === routes.length}
              onClick={startImport}
              style={{
                ...modalStyles.submitButton,
                opacity: stravaExport && missing < routes.length ? 1 : 0.5,
              }}
            >
              {t('stravaImport.import')}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

const styles = {
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  } as const,
  text: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.5,
    color: '#475569',
  } as const,
  picker: {
    border: '2px dashed #cbd5e1',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    padding: '1rem',
    textAlign: 'center',
    fontSize: 13,
    color: '#334155',
    cursor: 'pointer',
  } as const,
  summary: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    color: '#1e293b',
  } as const,
  list: {
    margin: 0,
    paddingLeft: '1.25rem',
    fontSize: 13,
    lineHeight: 1.6,
    color: '#334155',
  } as const,
  failures: {
    margin: 0,
    paddingLeft: '1.25rem',
    fontSize: 12,
    lineHeight: 1.5,
    color: '#b91c1c',
  } as const,
  progress: {
    width: '100%',
  } as const,
}
