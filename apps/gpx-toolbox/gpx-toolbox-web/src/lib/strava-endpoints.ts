// This file is auto-generated from strava.json — do not edit manually.
// Run: npx tsx scripts/generate-strava-endpoints.ts

export type StravaEndpoint = {
  path: string
  summary: string
  pathParams: Array<string>
}

export type StravaEndpointGroup = {
  name: string
  endpoints: Array<StravaEndpoint>
}

export const stravaEndpointGroups: Array<StravaEndpointGroup> = [
  {
    name: 'Athlete',
    endpoints: [
      {
        path: '/athlete',
        summary: 'Get Authenticated Athlete',
        pathParams: [],
      },
      {
        path: '/athlete/activities',
        summary: 'List Athlete Activities',
        pathParams: [],
      },
      {
        path: '/athlete/clubs',
        summary: 'List Athlete Clubs',
        pathParams: [],
      },
      {
        path: '/athlete/zones',
        summary: 'Get Zones',
        pathParams: [],
      },
      {
        path: '/athletes/{id}/routes',
        summary: 'List Athlete Routes',
        pathParams: [],
      },
      {
        path: '/athletes/{id}/stats',
        summary: 'Get Athlete Stats',
        pathParams: ['id'],
      },
    ],
  },
  {
    name: 'Segments',
    endpoints: [
      {
        path: '/segment_efforts',
        summary: 'List Segment Efforts',
        pathParams: [],
      },
      {
        path: '/segment_efforts/{id}',
        summary: 'Get Segment Effort',
        pathParams: ['id'],
      },
      {
        path: '/segment_efforts/{id}/streams',
        summary: 'Get Segment Effort Streams',
        pathParams: ['id'],
      },
      {
        path: '/segments/{id}',
        summary: 'Get Segment',
        pathParams: ['id'],
      },
      {
        path: '/segments/{id}/streams',
        summary: 'Get Segment Streams',
        pathParams: ['id'],
      },
      {
        path: '/segments/explore',
        summary: 'Explore segments',
        pathParams: [],
      },
      {
        path: '/segments/starred',
        summary: 'List Starred Segments',
        pathParams: [],
      },
    ],
  },
  {
    name: 'Activities',
    endpoints: [
      {
        path: '/activities/{id}',
        summary: 'Get Activity',
        pathParams: ['id'],
      },
      {
        path: '/activities/{id}/comments',
        summary: 'List Activity Comments',
        pathParams: ['id'],
      },
      {
        path: '/activities/{id}/kudos',
        summary: 'List Activity Kudoers',
        pathParams: ['id'],
      },
      {
        path: '/activities/{id}/laps',
        summary: 'List Activity Laps',
        pathParams: ['id'],
      },
      {
        path: '/activities/{id}/streams',
        summary: 'Get Activity Streams',
        pathParams: ['id'],
      },
      {
        path: '/activities/{id}/zones',
        summary: 'Get Activity Zones',
        pathParams: ['id'],
      },
    ],
  },
  {
    name: 'Clubs',
    endpoints: [
      {
        path: '/clubs/{id}',
        summary: 'Get Club',
        pathParams: ['id'],
      },
    ],
  },
  {
    name: 'Gear',
    endpoints: [
      {
        path: '/gear/{id}',
        summary: 'Get Equipment',
        pathParams: ['id'],
      },
    ],
  },
  {
    name: 'Routes',
    endpoints: [
      {
        path: '/routes/{id}',
        summary: 'Get Route',
        pathParams: ['id'],
      },
      {
        path: '/routes/{id}/export_gpx',
        summary: 'Export Route GPX',
        pathParams: ['id'],
      },
      {
        path: '/routes/{id}/export_tcx',
        summary: 'Export Route TCX',
        pathParams: ['id'],
      },
      {
        path: '/routes/{id}/streams',
        summary: 'Get Route Streams',
        pathParams: ['id'],
      },
    ],
  },
  {
    name: 'Uploads',
    endpoints: [
      {
        path: '/uploads/{uploadId}',
        summary: 'Get Upload',
        pathParams: ['uploadId'],
      },
    ],
  },
]
