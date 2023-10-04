import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import * as ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { App } from './app/app'
import { DeviceDetails } from './app/device-details'
import { Devices } from './app/devices'
import { GroupCreate } from './app/group-create'
import { GroupDetails } from './app/group-details'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: false,
      staleTime: 30_000,
    },
  },
})

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path={'/'} element={<App />}>
            <Route path={'all'} element={<Devices />} />
            <Route path={'new'} element={<GroupCreate />} />
            <Route path={':groupId'} element={<GroupDetails />} />
            <Route path={'device/:deviceId'} element={<DeviceDetails />} />
          </Route>
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
