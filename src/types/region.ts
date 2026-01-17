export interface Region {
  id: string
  name: string
  country: string
  province?: string
  gst?: number
  pst?: number
  hst?: number
}

export const REGIONS: Region[] = [
  // Canada
  { id: 'on', name: 'Ontario', country: 'Canada', province: 'ON', hst: 13 },
  { id: 'bc', name: 'British Columbia', country: 'Canada', province: 'BC', gst: 5, pst: 7 },
  { id: 'ab', name: 'Alberta', country: 'Canada', province: 'AB', gst: 5 },
  { id: 'qc', name: 'Quebec', country: 'Canada', province: 'QC', gst: 5, pst: 9.975 },
  { id: 'mb', name: 'Manitoba', country: 'Canada', province: 'MB', gst: 5, pst: 7 },
  { id: 'sk', name: 'Saskatchewan', country: 'Canada', province: 'SK', gst: 5, pst: 6 },
  { id: 'ns', name: 'Nova Scotia', country: 'Canada', province: 'NS', hst: 15 },
  { id: 'nb', name: 'New Brunswick', country: 'Canada', province: 'NB', hst: 15 },
  { id: 'nl', name: 'Newfoundland and Labrador', country: 'Canada', province: 'NL', hst: 15 },
  { id: 'pe', name: 'Prince Edward Island', country: 'Canada', province: 'PE', hst: 15 },
]
