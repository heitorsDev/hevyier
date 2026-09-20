import { cva, type VariantProps } from "class-variance-authority";
import { type ViewProps } from "react-native";

import { View } from "@/components/ui/primitives";
import { TextClassContext } from "@/components/ui/text";
import { cn } from "@/lib/utils";

const badgeVariants = cva("items-center justify-center rounded-sm px-2 py-1 border", {
  variants: {
    variant: {
      // A logged set: filled, so completed work reads at a glance.
      default: "bg-primary border-transparent",
      secondary: "bg-secondary border-transparent",
      outline: "bg-transparent border-border",
      // An unfilled prescribed set — present but not yet done.
      slot: "bg-transparent border-border border-dashed w-14 h-7",
    },
  },
  defaultVariants: { variant: "default" },
});

const badgeTextVariants = cva("text-sm font-mono font-medium", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      outline: "text-foreground",
      slot: "text-muted-foreground",
    },
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
