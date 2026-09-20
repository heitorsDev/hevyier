import { cva, type VariantProps } from "class-variance-authority";
import { type ViewProps } from "react-native";

import { View } from "@/components/ui/primitives";

import { TextClassContext } from "@/components/ui/text";
import { cn } from "@/lib/utils";

const badgeVariants = cva("px-2 py-1 border", {
  variants: {
    variant: {
      // A logged set: filled, so completed work reads at a glance.
      default: "bg-fg border-fg",
      outline: "bg-transparent border-fg",
      // An unfilled prescribed set — present but not yet done.
      slot: "bg-transparent border-disabled w-14 h-6.5",
    },
  },
  defaultVariants: { variant: "default" },
});

const badgeTextVariants = cva("text-[14px] font-mono font-bold", {
  variants: {
    variant: { default: "text-bg", outline: "text-fg", slot: "text-disabled" },
  },
  defaultVariants: { variant: "default" },
});

type Props = ViewProps & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: Props) {
  return (
    <TextClassContext.Provider value={badgeTextVariants({ variant })}>
      <View className={cn(badgeVariants({ variant }), className)} {...props} />
    </TextClassContext.Provider>
  );
}

export { Badge, badgeTextVariants, badgeVariants };
