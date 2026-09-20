import { cva, type VariantProps } from "class-variance-authority";
import { type PressableProps } from "react-native";

import { Pressable } from "@/components/ui/primitives";
import { TextClassContext } from "@/components/ui/text";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "flex-row items-center justify-center gap-2 rounded-md active:opacity-90",
  {
    variants: {
      variant: {
        default: "bg-primary",
        secondary: "bg-secondary",
        outline: "border border-border bg-transparent active:bg-accent",
        ghost: "bg-transparent active:bg-accent",
        destructive: "bg-destructive",
      },
      size: {
        default: "h-12 px-4",
        sm: "h-9 px-3 rounded-sm",
        // Icon buttons stay square so a row of steppers keeps its rhythm.
        icon: "h-9 w-9 rounded-sm px-0",
        lg: "h-14 px-6 rounded-lg",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

// Label colour has to follow the surface, so it travels via context
// rather than being restated at every call site.
const buttonTextVariants = cva("font-medium", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      outline: "text-foreground",
      ghost: "text-foreground",
      destructive: "text-foreground",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      icon: "text-base",
      lg: "text-base tracking-wide",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

type Props = PressableProps & VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: Props) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable className={cn(buttonVariants({ variant, size }), className)} {...props} />
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
