# Animation notes

- The page background uses branching SVG PCB traces and junction nodes. Cyan packets travel along the trace paths; detached diagonal floating streak overlays have been removed.
- Client-side route changes use a timer-driven sequence: shutters close, the circular circuit artwork is revealed, a cyan sweep reveals the Embrione logo, the completed logo holds briefly, then the shutters open and the transition overlay is removed. The sequence does not depend on `animationend` or `transitionend` events, so a missed CSS event cannot strand the page.
- The trace reveal lasts about 1.1 seconds and the completed logo holds for about 0.6 seconds. Total overlay time is about 3.5 seconds.
- `prefers-reduced-motion: reduce` disables ambient and transition animation.
- Circuit artwork is `public/circuit-motif.png`; the original logo remains `public/embrione-logo.png`.
