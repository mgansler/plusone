interface Modifiers {
  shiftKey?: KeyboardEvent['shiftKey']
  altKey?: KeyboardEvent['altKey']
  metaKey?: KeyboardEvent['metaKey']
}

export function isKeyCombo(event: KeyboardEvent, code: KeyboardEvent['code'], modifiers?: Modifiers): boolean {
  const matches =
    event.code === code &&
    event.altKey === (modifiers?.altKey ?? false) &&
    event.metaKey === (modifiers?.metaKey ?? false) &&
    event.shiftKey === (modifiers?.shiftKey ?? false)
  if (matches) {
    event.preventDefault()
  }
  return matches
}
