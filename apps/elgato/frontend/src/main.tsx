import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import * as ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { App } from './app/app'
import { DeviceDetails } from './app/devices/device-details'
import { DeviceList } from './app/devices/device-list'
import { GroupDetails } from './app/groups/group-details'
import { GroupList } from './app/groups/group-list'
import { GroupSettings } from './app/settings/group-settings'
import { Settings } from './app/settings/settings'
import './styles.scss'

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
            <Route path={'devices'} element={<DeviceList />} />
            <Route path={'devices/:deviceId'} element={<DeviceDetails />} />
            <Route path={'groups'} element={<GroupList />}>
              <Route path={':groupId'} element={<GroupDetails />} />
            </Route>
            <Route path={'settings'} element={<Settings />}></Route>
            <Route path={'settings/:groupId'} element={<GroupSettings />} />
          </Route>
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
