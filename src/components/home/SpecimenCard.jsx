import { motion } from 'framer-motion'

/**
 * SpecimenCard — LA signature de la refonte « La Preuve ».
 * Une étiquette d'échantillon de laboratoire : coins chanfreinés, cotes
 * techniques, annotations mono, coordonnées. Entrée orchestrée : les lignes
 * se dessinent en stagger (désactivé sous prefers-reduced-motion via framer).
 */
export default function SpecimenCard() {
  const draw = { duration: 0.9, ease: [0.16, 1, 0.3, 1] }

  return (
    <div className="relative select-none" aria-hidden="true">
      <motion.svg
        viewBox="0 0 520 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-auto"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Fond de la carte (coins chanfreinés 16px) */}
        <motion.path
          d="M16 0 H504 L520 16 V384 L504 400 H16 L0 384 V16 Z"
          fill="var(--color-bg-secondary)"
          stroke="var(--color-border-subtle)"
          strokeWidth="1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        />

        {/* Grille technique intérieure */}
        <motion.g
          stroke="var(--color-grid-line)"
          strokeWidth="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          {[0, 1, 2, 3, 4, 5].map(i => (
            <line key={`v${i}`} x1={40 + i * 80} y1={64} x2={40 + i * 80} y2={336} />
          ))}
          {[0, 1, 2, 3, 4].map(i => (
            <line key={`h${i}`} x1={24} y1={80 + i * 60} x2={496} y2={80 + i * 60} />
          ))}
        </motion.g>

        {/* ── En-tête : référence d'échantillon ── */}
        <motion.text
          x="32"
          y="48"
          fill="var(--color-text-muted)"
          fontFamily="'Roboto Mono', monospace"
          fontSize="13"
          fontWeight="600"
          letterSpacing="3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          FIERI · ÉCHANTILLON 042
        </motion.text>

        {/* Pastille d'état */}
        <motion.g
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <circle cx="416" cy="42" r="5" fill="var(--color-ember)" />
          <text x="428" y="46" fill="var(--color-ember-soft)" fontFamily="'Roboto Mono', monospace" fontSize="12" fontWeight="600" letterSpacing="2">
            EN PROTOTYPAGE
          </text>
        </motion.g>

        {/* ── Ligne de cote supérieure ── */}
        <motion.g
          stroke="var(--color-engine)"
          strokeWidth="1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          <motion.line x1="32" y1="86" x2="488" y2="86" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={draw} />
          <line x1="32" y1="80" x2="32" y2="92" />
          <line x1="488" y1="80" x2="488" y2="92" />
          <text x="260" y="78" textAnchor="middle" fill="var(--color-engine)" fontFamily="'Roboto Mono', monospace" fontSize="12" letterSpacing="2">
            LAB → MARKET
          </text>
        </motion.g>

        {/* ── Corps : titre du projet ── */}
        <motion.text
          x="32"
          y="136"
          fill="var(--color-text-primary)"
          fontFamily="'Exo', sans-serif"
          fontSize="30"
          fontWeight="800"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Rover SLAM autonome
        </motion.text>

        <motion.text
          x="32"
          y="160"
          fill="var(--color-text-secondary)"
          fontFamily="'Inter', sans-serif"
          fontSize="15"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          Navigation SLAM · IA embarquée · Énergie solaire
        </motion.text>

        {/* ── Chips de divisions ── */}
        {[
          { x: 32, label: 'MÉCA' },
          { x: 112, label: 'ROS / IA' },
          { x: 204, label: 'ÉLEC' }
        ].map((chip, i) => (
          <motion.g
            key={chip.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.75 + i * 0.08 }}
          >
            <rect x={chip.x} y={184} width={64} height={30} rx="2" fill="var(--color-bg-tertiary)" stroke="var(--color-border-subtle)" />
            <text x={chip.x + 32} y={203} textAnchor="middle" fill="var(--color-text-secondary)" fontFamily="'Roboto Mono', monospace" fontSize="12" fontWeight="600" letterSpacing="1.5">
              {chip.label}
            </text>
          </motion.g>
        ))}

        {/* ── Cote technique basse (dimension réelle) ── */}
        <motion.g
          stroke="var(--color-ember)"
          strokeWidth="1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.05 }}
        >
          <motion.line x1="32" y1="300" x2="488" y2="300" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={draw} />
          <line x1="32" y1="294" x2="32" y2="306" />
          <line x1="488" y1="294" x2="488" y2="306" />
          <text x="260" y="292" textAnchor="middle" fill="var(--color-ember)" fontFamily="'Roboto Mono', monospace" fontSize="12" letterSpacing="2">
            420 MM × 260 MM
          </text>
        </motion.g>

        {/* ── Pied : phase + progression ── */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.15 }}
        >
          <text x="32" y="352" fill="var(--color-text-muted)" fontFamily="'Roboto Mono', monospace" fontSize="12" letterSpacing="2">
            PHASE 3 / 5
          </text>
          <text x="416" y="352" fill="var(--color-text-muted)" fontFamily="'Roboto Mono', monospace" fontSize="12" letterSpacing="2">
            TEST TERRAIN
          </text>
          <rect x="32" y="362" width="456" height="6" fill="var(--color-bg-tertiary)" />
          <rect x="32" y="362" width="274" height="6" fill="var(--color-engine)" />
        </motion.g>
      </motion.svg>
    </div>
  )
}