import { createFileRoute, Link } from '@tanstack/react-router'

import { useGetTrailAreas } from '@plusone/trailcare-api-client'

import { AccessPasswordAdmin } from '../../admin/access-password-admin'
import { CreateTrailAreaForm, TrailAreaAdmin } from '../../admin/trail-area-admin'
import { AppHeader } from '../../components/app-header'
import { BackIcon } from '../../components/icons'

export const Route = createFileRoute('/admin/')({
  component: AdminPage,
})

function AdminPage() {
  const { data: areas } = useGetTrailAreas()

  const back = (
    <Link to="/" className="back-link" aria-label="Zurück zur Übersicht">
      <BackIcon className="back-icon" />
    </Link>
  )

  return (
    <div className="page">
      <AppHeader back={back} title="Verwaltung" />
      <main className="content">
        <section>
          <h2 className="section-title">Trailgebiete und Trails</h2>
          {areas?.map((area) => (
            <TrailAreaAdmin key={area.id} area={area} />
          ))}
          <CreateTrailAreaForm />
        </section>

        <section>
          <h2 className="section-title">Zugangspasswörter</h2>
          <AccessPasswordAdmin />
        </section>
      </main>
    </div>
  )
}
