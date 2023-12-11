import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

@Component({
  standalone: true,
  template: '<div>Keyboard goes here: {{ kbdName }}</div>',
})
export class KeyboardComponent {
  kbdName: string | undefined

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe((params) => {
      this.kbdName = params['name']
    })
  }
}
