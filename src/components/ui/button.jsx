import { cva } from "class-variance-authority";
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Bouton — la seule définition d'un bouton dans le projet.
 *
 * Trois écarts par rapport à la version livrée par le CLI shadcn :
 *
 * 1. Les hauteurs. Les tailles d'usine plafonnaient à 36 px, sous la cible
 *    tactile de 44 px : sur un téléphone, la moitié des actions se ratait.
 *    `default` fait maintenant 44 px, et les tailles réduites sont réservées
 *    aux barres d'outils denses, où l'action existe aussi ailleurs.
 * 2. Les couleurs passent par les tokens. La variante `destructive` d'usine
 *    posait un fond `bg-destructive/10` — une teinte à 1,1:1, invisible.
 *    Elle prend un panneau opaque.
 * 3. Pas de chanfrein. La découpe marque une SURFACE (panneau, carte,
 *    dialogue), pas une commande : c'est ce qui rendait la signature bavarde.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-colors outline-none select-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-engine-deep",
        outline: "border-border-strong bg-transparent text-foreground hover:bg-muted",
        secondary: "bg-secondary text-secondary-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        destructive: "border-danger bg-danger-wash text-danger hover:bg-danger hover:text-on-accent",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // 44 px : la cible tactile de référence. C'est la taille par défaut,
        // pour qu'atteindre le confort ne demande aucune décision.
        default: "h-11 gap-2 px-5",
        lg: "h-12 gap-2 px-6 text-base",
        // Barres d'outils denses uniquement, et jamais pour une action unique.
        sm: "h-9 gap-1.5 px-3 text-[0.8rem]",
        xs: "h-8 gap-1 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        icon: "size-11",
        "icon-lg": "size-12",
        "icon-sm": "size-9",
        "icon-xs": "size-8 [&_svg:not([class*='size-'])]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
