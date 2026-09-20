import * as Slot from "@rn-primitives/slot";
import { cva, type VariantProps } from "class-variance-authority";
import { createContext, use } from "react";
import { type TextProps } from "react-native";

import { Text as CSSText } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const textVariants = cva("text-foreground", {
  variants: {
    variant: {
      default: "text-base",
      // Screen titles and the set values that must read at arm's length.
      display: "text-3xl font-bold tracking-tight",
      heading: "text-base font-semibold",
      muted: "text-sm text-muted-foreground",
      // Numerals only: monospace keeps set columns aligned.
      mono: "text-base font-mono",
      monoMuted: "text-sm font-mono text-muted-foreground",
      // Section labels — the shadcn small-caps label treatment.
      label: "text-xs font-medium tracking-widest text-muted-foreground uppercase",
    },
  },
  defaultVariants: { variant: "default" },
});

// Lets a parent (Button, Card) set text styling for any Text beneath it
// without every call site repeating the variant.
const TextClassContext = createContext<string | undefined>(undefined);

type Props = TextProps &
  VariantProps<typeof textVariants> & {
    /** Render the child element instead of a Text, forwarding styles. */
    asChild?: boolean;
  };

function Text({ className, variant, asChild = false, ...props }: Props) {
  const contextClass = use(TextClassContext);
  const Component = asChild ? Slot.Text : CSSText;
  return (
    <Component className={cn(textVariants({ variant }), contextClass, className)} {...props} />
  );
}

export { Text, TextClassContext, textVariants };
