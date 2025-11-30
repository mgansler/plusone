import './letter.scss'
import { useEffect, useRef } from 'react'

type LetterProps = {
  char: string
  prevChar: string
}

export function Letter({ char, prevChar }: Readonly<LetterProps>) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const flapFrontRef = useRef<HTMLDivElement>(null)
  const flapBackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bottomRef.current && flapFrontRef.current && flapBackRef.current) {
      flapFrontRef.current.classList.add('show')
      flapBackRef.current.classList.add('show')
    }

    setTimeout(() => {
      if (bottomRef.current) {
        bottomRef.current.innerHTML = char
      }
      flapFrontRef.current?.classList.remove('show')
      flapBackRef.current?.classList.remove('show')
    }, 600)
  }, [char])

  return (
    <div className="letter">
      <div className="base">
        <div className="top">{char}</div>
        <div className="bottom" ref={bottomRef}></div>
      </div>
      <div className="flap front" ref={flapFrontRef}>
        {prevChar}
      </div>
      <div className="flap back" ref={flapBackRef}>
        {char}
      </div>
    </div>
  )
}
