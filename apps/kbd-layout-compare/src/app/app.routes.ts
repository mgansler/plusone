import { Route } from '@angular/router'

import { AppRootComponent } from './app-root.component'
import { KeyboardComponent } from './keyboard.component'

export const appRoutes: Route[] = [
  { path: '', component: AppRootComponent },
  { path: 'keyboard/:name', component: KeyboardComponent },
]
