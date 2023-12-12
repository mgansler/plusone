import { Component } from '@angular/core'

type KeyDefinition = {
  label: string
  class?: string
}

@Component({
  templateUrl: '../keyboard/keyboard.component.html',
  styleUrl: './mx-keys.component.scss',
})
export class MxKeysComponent {
  keyboardName = 'Logi MX Keys'

  fRow: KeyDefinition[] = [
    { label: 'esc', class: 'rounded-top-left' },
    { label: 'F1' },
    { label: 'F2' },
    { label: 'F3' },
    { label: 'F4' },
    { label: 'F5' },
    { label: 'F6' },
    { label: 'F7' },
    { label: 'F8' },
    { label: 'F9' },
    { label: 'F10' },
    { label: 'F11' },
    { label: 'F12' },
    { label: 'F13' },
  ]

  numberRow: KeyDefinition[] = [
    { label: '§' },
    { label: '1' },
    { label: '2' },
    { label: '3' },
    { label: '4' },
    { label: '5' },
    { label: '6' },
    { label: '7' },
    { label: '8' },
    { label: '9' },
    { label: '0' },
    { label: '-' },
    { label: '=' },
    { label: 'backspace' },
  ]

  qRow: KeyDefinition[] = [
    { label: 'tab' },
    { label: 'Q' },
    { label: 'W' },
    { label: 'E' },
    { label: 'R' },
    { label: 'T' },
    { label: 'Y' },
    { label: 'U' },
    { label: 'I' },
    { label: 'O' },
    { label: 'P' },
    { label: '[' },
    { label: ']' },
    { label: 'enter', class: 'return-top' },
  ]

  aRow: KeyDefinition[] = [
    { label: 'caps lock' },
    { label: 'A' },
    { label: 'S' },
    { label: 'D' },
    { label: 'F' },
    { label: 'G' },
    { label: 'H' },
    { label: 'J' },
    { label: 'K' },
    { label: 'L' },
    { label: ';' },
    { label: '' },
    { label: '\\' },
    { label: '', class: 'return-bottom' },
  ]

  zRow: KeyDefinition[] = [
    { label: 'shift' },
    { label: '`' },
    { label: 'Z' },
    { label: 'X' },
    { label: 'C' },
    { label: 'V' },
    { label: 'B' },
    { label: 'N' },
    { label: 'M' },
    { label: ',' },
    { label: '.' },
    { label: '/' },
    { label: 'shift', class: 'text-right' },
  ]

  spaceRow: KeyDefinition[] = [
    { label: 'ctrl', class: 'rounded-bottom-left' },
    { label: 'opt' },
    { label: 'cmd' },
    { label: '' },
    { label: 'cmd' },
    { label: 'fn' },
    { label: 'opt' },
  ]
}
