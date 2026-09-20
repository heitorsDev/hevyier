import { type ViewProps } from "react-native";

import { View } from "@/components/ui/primitives";

import { cn } from "@/lib/utils";

type Props = ViewProps & { orientation?: "horizontal" | "vertical" };

function Separator({ className, orientation = "horizontal", ...props }: Props) {
  return (
    <View
      className={cn(
        "bg-fg",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
