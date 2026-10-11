import { useEffect, useMemo, useRef, useState } from 'react'

const LINES = ['Welcome Coders!', 'Embrione', "If it ain't broke, don't fix it."]
const CHARS = '0101010011010011010100110101010100110101'

function makeColumn(index) {
  const length = 16 + (index * 7) % 21
  return Array.from({ length }, (_, i) => CHARS[(index * 11 + i * 3) % CHARS.length]).join('\n')
}

export default function BootIntro() {
  const [visible, setVisible] = useState(() => {
    try { return window.sessionStorage.getItem('embrione-boot-seen') !== '1' } catch { return true }
  })
  const [phase, setPhase] = useState('compute')
  const [typedText, setTypedText] = useState('')
  const [cursorLine, setCursorLine] = useState(0)
  const [columns, setColumns] = useState(() => Array.from({ length: 42 }, (_, i) => makeColumn(i)))
  const timers = useRef([])
  const reduceMotion = useMemo(() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, [])

  useEffect(() => {
    if (!visible) return undefined
    const later = (fn, delay) => {
      const id = window.setTimeout(fn, delay)
      timers.current.push(id)
      return id
    }
    const finish = () => {
      try { window.sessionStorage.setItem('embrione-boot-seen', '1') } catch {}
      setVisible(false)
    }
    if (reduceMotion) {
      setPhase('terminal')
      setTypedText(LINES.join('\n'))
      setCursorLine(2)
      later(finish, 1800)
    } else {
      const codeInterval = window.setInterval(() => {
        setColumns((old) => old.map((value, i) => Math.random() > 0.16 ? makeColumn(i + Math.floor(Math.random() * 90)) : value))
      }, 75)
      timers.current.push(codeInterval)
      // Binary rain is a distinct opening phase; terminal typing cannot begin until it ends.
      later(() => setPhase('black'), 2500)
      later(() => setPhase('terminal'), 3050)
      let line = 0
      let char = 0
      const typeNext = () => {
        if (line >= LINES.length) {
          later(finish, 1100)
          return
        }
        setCursorLine(line)
        char = 0
        const typeId = window.setInterval(() => {
          char += 1
          // Render only the characters typed so far; never mount full future lines.
          const completedBefore = LINES.slice(0, line).join('\n')
          setTypedText(completedBefore + (completedBefore ? '\n' : '') + LINES[line].slice(0, char))
          if (char >= LINES[line].length) {
            window.clearInterval(typeId)
            line += 1
            later(typeNext, line < LINES.length ? 650 : 0)
          }
        }, 115)
        timers.current.push(typeId)
      }
      // Start typing only after the terminal has fully appeared.
      later(typeNext, 3250)
    }
    return () => {
      timers.current.forEach((id) => { window.clearTimeout(id); window.clearInterval(id) })
      timers.current = []
    }
  }, [visible, reduceMotion])

  if (!visible) return null
  const skip = () => {
    timers.current.forEach((id) => { window.clearTimeout(id); window.clearInterval(id) })
    timers.current = []
    try { window.sessionStorage.setItem('embrione-boot-seen', '1') } catch {}
    setVisible(false)
  }

  return <div className={`boot-intro boot-intro--${phase}`} role="dialog" aria-label="Embrione startup intro">
    {phase === 'compute' && <div className="boot-code-field" aria-hidden="true">
      {columns.map((text, i) => <div className="boot-code-column" key={i} style={{ '--col': i, '--duration': `${1.3 + (i % 9) * .19}s`, '--delay': `${-(i % 13) * .17}s`, opacity: 0.32 + (i % 5) * 0.12 }}>{text}</div>)}
    </div>}
    <div className="boot-terminal" aria-live="polite">
      <div className="boot-terminal-bar"><span className="boot-terminal-dot"/><span className="boot-terminal-dot"/><span className="boot-terminal-dot"/><span className="boot-terminal-title">EMBRIONE // INITIALIZING</span></div>
      <div className="boot-terminal-content">
        <p className="boot-system-line">SYSTEM BOOT <span>[OK]</span></p>
        <p className="boot-system-line">COMPILING IDEAS <span>[OK]</span></p>
        <p className="boot-system-line">CONNECTING CODERS <span>[OK]</span></p>
        <div className="boot-typed-lines">
          {typedText.split('\n').map((line, i) => <div className="boot-typed-line" key={i}><span className="boot-prompt">&gt;</span><span>{line}</span>{i === cursorLine && phase === 'terminal' && <span className="boot-cursor"/>}</div>)}
        </div>
      </div>
      <button className="boot-skip" type="button" onClick={skip}>SKIP INTRO ↗</button>
    </div>
  </div>
}
