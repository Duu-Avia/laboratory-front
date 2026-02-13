import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",

        // ✅ NEW: pill variant (base shape only)
        pill: "rounded-xl border ",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: " px-3 py-1.5 text-sm font-medium transition-all duration-200",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    // ✅ NEW: only used for variant="pill"
    active?: boolean;
  };

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  active = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  // ✅ pill active/inactive styles (same idea as your status buttons)
  const pillState =
    variant === "pill"
      ? active
        ? "text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100 ring-blue-500/20 dark:text-blue-300 dark:bg-blue-950/50 dark:border-blue-800 dark:hover:bg-blue-900/50"
        : "bg-white border-slate-200 text-[#44546A] hover:bg-slate-50 hover:text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300"
      : "";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), pillState, className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
