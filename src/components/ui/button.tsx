
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-sea text-white hover:bg-sea-dark rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg font-semibold",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 font-semibold",
        outline:
          "border-2 border-sea bg-transparent text-sea hover:bg-sea hover:text-white rounded-full transition-all duration-300 hover:scale-105 font-semibold",
        secondary:
          "bg-sea/10 text-sea hover:bg-sea/20 rounded-full transition-all duration-300 hover:scale-105 font-semibold",
        ghost: "text-sea hover:bg-sea/10 hover:text-sea-dark transition-all duration-300 font-medium",
        link: "text-sea underline-offset-4 hover:underline font-medium",
        hero: "px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 bg-white/20 text-white border-2 border-white/30 backdrop-blur-md hover:bg-white/30 hover:scale-105 hover:shadow-xl",
        heroSolid: "px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 bg-sea text-white hover:bg-sea-dark hover:scale-105 hover:shadow-xl active:scale-95",
        glow: "bg-sea text-white hover:bg-sea-dark rounded-full transition-all duration-300 hover:scale-105 animate-button-glow font-semibold"
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-md px-4 text-sm",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
