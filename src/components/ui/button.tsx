import { cva, type VariantProps } from "class-variance-authority";
import { type PressableProps } from "react-native";

import { Pressable } from "@/components/ui/primitives";

import { TextClassContext } from "@/components/ui/text";
import { cn } from "@/lib/utils";

// No rounding anywhere — the flat 1px border is the whole visual language
// (PRODUCT.md). Held state inverts instead of fading, which stays legible
// in bright gym lighting.
const buttonVariants = cva("items-center justify-center border border-fg active:bg-fg", {
  variants: {
    variant: {
      default: "bg-transparent",
      primary: "bg-fg active:bg-bg",
      ghost: "border-transparent active:bg-transparent",
      danger: "border-muted",
    },
    size: {
      default: "h-12 px-3 min-w-12",
      sm: "h-9 px-2 min-w-9",
      lg: "h-14 px-4",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

// Label colour has to invert with the surface, so it travels via context
// rather than being restated at every call site.
const buttonTextVariants = cva("font-bold", {
  variants: {
    variant: {
      default: "text-fg group-active:text-bg",
      primary: "text-bg group-active:text-fg",
      ghost: "text-muted",
      danger: "text-muted",
    },
    size: {
      default: "text-[18px] font-mono",
      sm: "text-[14px] font-mono",
      lg: "text-[18px] font-mono tracking-[2px]",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

type Props = PressableProps & VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: Props) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable className={cn("group", buttonVariants({ variant, size }), className)} {...props} />
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
