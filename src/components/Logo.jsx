import { useId } from 'react'

/**
 * Logo FIERI — identité « La Preuve ».
 * Monogramme F chanfreiné (plaque de prototypage) + wordmark Exo.
 * Le wordmark suit la couleur de texte courante (currentColor) : il s'adapte
 * automatiquement au thème sombre/clair. Le badge garde les couleurs de marque.
 */
export default function Logo({ className = "h-8" }) {
  const id = useId()
  const gradId = `logo-engine-${id}`

  return (
    <svg
      viewBox="0 0 100 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="FIERI Research"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-engine)" />
          <stop offset="100%" stopColor="var(--color-engine-deep)" />
        </linearGradient>
      </defs>

      {/* Monogramme chanfreiné */}
      <path
        d="M2 0 H18 L20 2 V22 L18 24 H2 L0 22 V2 Z"
        fill={`url(#${gradId})`}
      />
      <text
        x="10"
        y="17.5"
        textAnchor="middle"
        fontFamily="'Exo', sans-serif"
        fontSize="15"
        fontWeight="800"
        fill="#FFFFFF"
      >
        F
      </text>

      {/* Wordmark */}
      <text
        x="27"
        y="17.5"
        fontFamily="'Exo', sans-serif"
        fontSize="16"
        fontWeight="800"
        letterSpacing="0.6"
        fill="currentColor"
      >
        FIERI
      </text>

      {/* Point final chanfreiné (ember) */}
      <path
        d="M92 10 H96 L96 14 L92 14 Z"
        fill="var(--color-ember)"
      />
    </svg>
  );
}
