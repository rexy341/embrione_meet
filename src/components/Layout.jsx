import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const navClass = ({ isActive }) => `rounded-lg px-3 py-2 transition ${isActive ? 'bg-cyan-300/10 text-cyan-100' : 'text-zinc-400 hover:text-white'}`

function RouteTransition() {
  const location = useLocation()
  const lastPath = useRef(null)
  const timers = useRef([])
  const [phase, setPhase] = useState('idle')

  useEffect(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    const currentPath = `${location.pathname}${location.search}${location.hash}`
    if (lastPath.current === null) {
      lastPath.current = currentPath
      return
    }
    if (lastPath.current === currentPath) return
    lastPath.current = currentPath
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setPhase('idle')
      return
    }

    // Sequence: close shutters -> reveal circuit core -> trace the logo -> hold -> open.
    setPhase('closing')
    // Use explicit fallback timers for every phase: navigation must never depend on
    // animationend/transitionend events, which can be skipped by browsers or CSS changes.
    const schedule = (nextPhase, delay) => {
      const timer = window.setTimeout(() => setPhase(nextPhase), delay)
      timers.current.push(timer)
    }
    schedule('core', 620)
    schedule('tracing', 1080)
    schedule('hold', 2180)
    schedule('opening', 2820)
    schedule('idle', 3480)
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer))
      timers.current = []
    }
  }, [location.pathname, location.search, location.hash])

  if (phase === 'idle') return null
  return <div className={`route-transition route-transition--${phase}`} aria-hidden="true">
    <div className="transition-circuit" />
    <div className="transition-door transition-door--top" />
    <div className="transition-door transition-door--bottom" />
    <div className="transition-emblem">
      <span className="transition-logo-base"><img src="/embrione-logo.png" alt="" /></span>
      <span className="transition-logo-trace"><img src="/embrione-logo.png" alt="" /></span>
    </div>
    <div className="transition-scanline" />
  </div>
}

function CircuitBackdrop() {
  return <div className="circuit-glow" aria-hidden="true">
    <svg className="circuit-board" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="traceLight" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1aa6d8" stopOpacity=".08"/><stop offset=".48" stopColor="#42eaff" stopOpacity=".95"/><stop offset=".58" stopColor="#d5fbff"/><stop offset="1" stopColor="#14a8ff" stopOpacity=".08"/></linearGradient>
      </defs>
      <g className="circuit-traces">
        <path d="M0 170 H190 L230 210 H360 L395 245 H505 M0 205 H120 L160 245 H300 M0 270 H245 L280 305 H430 L460 275 H520 M0 390 H160 L205 345 H350 L385 380 H510 M0 450 H110 L155 410 H285 L320 375 H470 M0 590 H175 L215 550 H370 L405 510 H520 M0 700 H220 L260 660 H405 L440 620 H525"/>
        <path d="M1440 170 H1250 L1210 210 H1080 L1045 245 H935 M1440 205 H1320 L1280 245 H1140 M1440 270 H1195 L1160 305 H1010 L980 275 H920 M1440 390 H1280 L1235 345 H1090 L1055 380 H930 M1440 450 H1330 L1285 410 H1155 L1120 375 H970 M1440 590 H1265 L1225 550 H1070 L1035 510 H920 M1440 700 H1220 L1180 660 H1035 L1000 620 H915"/>
        <path d="M180 0 V90 L225 135 V205 M330 0 V70 L370 110 V180 M485 0 V100 L530 145 V220 M1260 0 V90 L1215 135 V205 M1110 0 V70 L1070 110 V180 M955 0 V100 L910 145 V220 M180 900 V800 L225 755 V700 M420 900 V810 L465 765 V690 M1260 900 V800 L1215 755 V700 M1020 900 V810 L975 765 V690"/>
        <path d="M0 330 H80 L110 300 H210 M0 520 H130 L165 485 H240 M1440 330 H1360 L1330 300 H1230 M1440 520 H1310 L1275 485 H1200"/>
      </g>
      <g className="circuit-nodes">
        <circle cx="190" cy="170" r="4"/><circle cx="360" cy="245" r="4"/><circle cx="120" cy="205" r="4"/><circle cx="430" cy="305" r="4"/><circle cx="350" cy="345" r="4"/><circle cx="285" cy="375" r="4"/><circle cx="405" cy="510" r="4"/><circle cx="220" cy="660" r="4"/>
        <circle cx="1250" cy="170" r="4"/><circle cx="1080" cy="245" r="4"/><circle cx="1320" cy="205" r="4"/><circle cx="1010" cy="305" r="4"/><circle cx="1090" cy="345" r="4"/><circle cx="1155" cy="375" r="4"/><circle cx="1035" cy="510" r="4"/><circle cx="1220" cy="660" r="4"/>
        <circle cx="225" cy="135" r="3"/><circle cx="370" cy="110" r="3"/><circle cx="530" cy="145" r="3"/><circle cx="1215" cy="135" r="3"/><circle cx="1070" cy="110" r="3"/><circle cx="910" cy="145" r="3"/><circle cx="80" cy="330" r="3"/><circle cx="210" cy="300" r="3"/><circle cx="1360" cy="330" r="3"/><circle cx="1230" cy="300" r="3"/><circle cx="130" cy="520" r="3"/><circle cx="240" cy="485" r="3"/><circle cx="1310" cy="520" r="3"/><circle cx="1200" cy="485" r="3"/>
      </g>
      <g className="circuit-packets"><path d="M0 170 H190 L230 210 H360 L395 245 H505 M0 390 H160 L205 345 H350 L385 380 H510 M1440 270 H1195 L1160 305 H1010 L980 275 H920 M1440 590 H1265 L1225 550 H1070 L1035 510 H920"/></g>
    </svg>
  </div>
}

export function Layout({ children }) {
  return <div className="site-shell min-h-screen text-zinc-100">
    <CircuitBackdrop />
    <header className="sticky top-0 z-20 border-b border-cyan-100/10 bg-[#05090d]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-8">
        <Link to="/team" aria-label="Embrione home" className="flex shrink-0 items-center">
          <img src="/embrione-logo.png" alt="Embrione" className="h-12 w-auto max-w-[150px] object-contain sm:h-14" />
        </Link>
        <nav className="flex items-center gap-1 text-xs sm:text-sm" aria-label="Main navigation">
          <NavLink to="/team" className={navClass}>Team</NavLink>
          <NavLink to="/register" className={navClass}>Join us</NavLink>
          <NavLink to="/admin" className={navClass}>Admin</NavLink>
        </nav>
      </div>
    </header>
    <main className="relative z-[1]">{children}</main>
    <footer className="relative z-[1] border-t border-cyan-100/10 bg-[#05090d]/65 px-5 py-7 text-center text-xs text-zinc-500">THE EMBRIONE <span className="mx-2 text-cyan-300/60">/</span> Department of CSE <span className="mx-2 text-cyan-300/60">/</span> PES University</footer>
    <RouteTransition />
  </div>
}

export function PageHeading({ eyebrow, title, description }) {
  return <div className="mb-9 max-w-3xl"><p className="mb-3 text-xs font-bold uppercase tracking-[.25em] text-cyan-300">{eyebrow}</p><h1 className="text-4xl font-semibold tracking-tight text-[#f2f0e8] md:text-5xl">{title}</h1><p className="mt-4 max-w-2xl leading-7 text-zinc-400">{description}</p></div>
}

export function Notice({ children, kind = 'info' }) {
  const styles = kind === 'error' ? 'border-rose-400/25 bg-rose-400/10 text-rose-200' : kind === 'success' ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200' : 'border-cyan-400/25 bg-cyan-400/10 text-cyan-100'
  return <div role="status" className={`rounded-xl border px-4 py-3 text-sm leading-6 ${styles}`}>{children}</div>
}
