// The StravaExportImportModal UI button was removed when /routes was merged with /nearby.
// The component's unit tests (StravaExportImportModal.spec.tsx) still cover the import logic.
// No e2e tests are needed here since there is no UI entry point for Strava export import anymore.
describe('Strava export import', () => {
  it('has no UI entry point anymore — covered by unit tests', () => {
    // The StravaExportImportModal component exists but is no longer reachable via the UI.
    // Functionality is verified by StravaExportImportModal.spec.tsx unit tests.
  })
})
