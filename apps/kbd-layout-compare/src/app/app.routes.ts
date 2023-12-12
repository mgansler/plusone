import { Route } from '@angular/router'

import { AppRootComponent } from './app-root.component'

export const appRoutes: Route[] = [
  { path: '', component: AppRootComponent },
  { path: 'logi', loadChildren: () => import('./logi/logi.module').then((m) => m.LogiModule) },
]
