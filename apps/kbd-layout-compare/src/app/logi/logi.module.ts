import { CommonModule, NgFor } from '@angular/common'
import { NgModule } from '@angular/core'

import { LogiRoutingModule } from './logi-routing.module'
import { MxKeysComponent } from './mx-keys.component'

@NgModule({
  imports: [CommonModule, NgFor, LogiRoutingModule],
  declarations: [MxKeysComponent],
})
export class LogiModule {}
