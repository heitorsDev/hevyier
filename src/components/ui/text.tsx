import * as Slot from "@rn-primitives/slot";
import { cva, type VariantProps } from "class-variance-authority";
import { createContext, use } from "react";
import { type TextProps } from "react-native";

import { Text as CSSText } from "@/components/ui/primitives";

import { cn } from "@/lib/utils";

const textVariants = cva("text-fg", {
  variants: {
    variant: {
      default: "text-[18px]",
      // Screen titles and the set values that must read at arm's length.
      display: "text-[28px] font-bold",
      heading: "text-[18px] font-bold",
      muted: "text-[14px] text-muted",
      // Numerals only: monospace keeps set columns aligned.
      mono: "text-[18px] font-mono",
      monoMuted: "text-[14px] font-mono text-muted",
      // Section labels — wide tracking does the work colour would.
      label: "text-[14px] text-muted tracking-[2px]",
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
