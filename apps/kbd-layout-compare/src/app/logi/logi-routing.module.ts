import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { MxKeysComponent } from './mx-keys.component'

const routes: Routes = [{ path: 'mx-keys', component: MxKeysComponent }]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LogiRoutingModule {}
