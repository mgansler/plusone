import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { PlaceSearch } from '../hooks/usePlaceSearch'
import type { SearchArea } from '../hooks/useSearchArea'

import { NearbyFilters } from './NearbyFilters'

function placeSearch(overrides: Partial<PlaceSearch> = {}): PlaceSearch {
  return {
    place: '',
    setPlace: vi.fn(),
    loading: false,
    error: null,
    candidates: [],
    search: vi.fn(),
    pick: vi.fn(),
    ...overrides,
  }
}

function searchArea(overrides: Partial<SearchArea> = {}): SearchArea {
  return {
    lat: 48.77,
    lng: 9.16,
    radius: 2,
    setLat: vi.fn(),
    setLng: vi.fn(),
    setRadius: vi.fn(),
    usingGps: false,
    locateMe: vi.fn(),
    pickLocation: vi.fn(),
    centerOnCurrent: vi.fn(),
    ...overrides,
  }
}

function renderFilters(
  props: { place?: Partial<PlaceSearch>; area?: Partial<SearchArea>; searching?: boolean; error?: string | null } = {},
) {
  const place = placeSearch(props.place)
  const area = searchArea(props.area)
  render(<NearbyFilters place={place} area={area} searching={props.searching ?? false} error={props.error ?? null} />)
  return { place, area }
}

describe('NearbyFilters', () => {
  it('searches the place on the button and on Enter', () => {
    const { place } = renderFilters({ place: { place: 'Ulm' } })

    fireEvent.click(screen.getByRole('button', { name: 'Suchen' }))
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Ort suchen' }), { key: 'Enter' })

    expect(place.search).toHaveBeenCalledTimes(2)
  })

  it('passes the typed place on', () => {
    const { place } = renderFilters()

    fireEvent.change(screen.getByRole('textbox', { name: 'Ort suchen' }), { target: { value: 'Ulm' } })

    expect(place.setPlace).toHaveBeenCalledWith('Ulm')
  })

  it('lets the user choose between several places', () => {
    const ulm = { id: 1, label: 'Ulm, Baden-Württemberg', lat: 48.4, lng: 9.99 }
    const { place } = renderFilters({ place: { candidates: [ulm, { ...ulm, id: 2, label: 'New Ulm, Minnesota' }] } })

    expect(screen.getByText('Welcher Ort ist gemeint?')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Ulm, Baden-Württemberg' }))

    expect(place.pick).toHaveBeenCalledWith(ulm)
  })

  it('shows the place error and disables the search while looking up', () => {
    renderFilters({ place: { error: 'Ort „X" nicht gefunden', loading: true } })

    expect(screen.getByText('Ort „X" nicht gefunden')).toBeTruthy()
    expect(screen.getByRole('button', { name: '…' }).hasAttribute('disabled')).toBe(true)
  })

  it('asks for the GPS position', () => {
    const { area } = renderFilters()

    fireEvent.click(screen.getByRole('button', { name: 'GPS-Position' }))

    expect(area.locateMe).toHaveBeenCalledTimes(1)
  })

  it('disables the GPS button while locating', () => {
    renderFilters({ area: { usingGps: true } })

    expect(screen.getByRole('button', { name: 'GPS...' }).hasAttribute('disabled')).toBe(true)
  })

  it('shows the radius in km or m', () => {
    const { unmount } = render(
      <NearbyFilters place={placeSearch()} area={searchArea({ radius: 2 })} searching={false} error={null} />,
    )
    expect(screen.getByLabelText('Radius: 2 km')).toBeTruthy()
    unmount()

    render(<NearbyFilters place={placeSearch()} area={searchArea({ radius: 0.5 })} searching={false} error={null} />)
    expect(screen.getByLabelText('Radius: 500 m')).toBeTruthy()
  })

  it('changes the radius', () => {
    const { area } = renderFilters()

    fireEvent.change(screen.getByLabelText('Radius: 2 km'), { target: { value: '5' } })

    expect(area.setRadius).toHaveBeenCalledWith(5)
  })

  it('shows what is going on', () => {
    renderFilters({ area: { lat: null, lng: null }, searching: true, error: 'Kaputt' })

    expect(screen.getByText('Standort wird ermittelt...')).toBeTruthy()
    expect(screen.getByText('Suche...')).toBeTruthy()
    expect(screen.getByText('Kaputt')).toBeTruthy()
  })
})
