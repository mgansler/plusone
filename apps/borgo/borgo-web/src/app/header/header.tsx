import { useEffect, useState } from 'react'

import { Letter } from './letter'

import './header.scss'

export function Header() {
  const [lineIndex, setLineIndex] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setLineIndex((lineIndex) => (lineIndex + 1) % lines.length), 2000)
    return () => clearInterval(interval)
  })

  const lines = [
    ['B', 'o', 'r', 'g', 'o', '\u0027', 's', ' ', 'B', 'a', 'k', 'e', 'r', 'y', ' ', ' ', ' '],
    ['B', 'o', 'r', 'g', 'o', '\u0027', 's', ' ', 'B', 'e', 'v', 'e', 'r', 'a', 'g', 'e', 's'],
    ['B', 'o', 'r', 'g', 'o', '\u0027', 's', ' ', 'B', 'i', 'k', 'e', 's', ' ', ' ', ' ', ' '],
  ]

  return (
    <div className="header" aria-label={lines[lineIndex].join('')}>
      {lines[lineIndex].map((char, charIndex) => (
        <Letter
          key={charIndex}
          char={char}
          prevChar={lines[(lineIndex - 1 + lines.length) % lines.length][charIndex]}
        />
      ))}
    </div>
  )
}
