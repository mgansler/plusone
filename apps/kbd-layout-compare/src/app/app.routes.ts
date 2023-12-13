import { Route } from '@angular/router'

export const appRoutes: Route[] = [
  { path: 'logi', loadChildren: () => import('./logi/logi.module').then((m) => m.LogiModule) },
]
