import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

@Component({
  standalone: true,
  templateUrl: './keyboard.component.html',
  styleUrl: './keyboard.component.scss',
})
export class KeyboardComponent {
  kbdName: string | undefined

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe((params) => {
      this.kbdName = params['name']
    })
  }
}
