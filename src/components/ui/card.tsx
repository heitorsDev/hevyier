import { type ViewProps } from "react-native";

import { View } from "@/components/ui/primitives";

import { TextClassContext } from "@/components/ui/text";
import { cn } from "@/lib/utils";

function Card({ className, ...props }: ViewProps) {
  return <View className={cn("border border-fg p-4 gap-0.5", className)} {...props} />;
}

function CardHeader({ className, ...props }: ViewProps) {
  return <View className={cn("flex-row items-baseline justify-between gap-2", className)} {...props} />;
}

function CardTitle({ className, ...props }: ViewProps) {
  return <View className={cn("shrink", className)} {...props} />;
}

function CardContent({ className, ...props }: ViewProps) {
  return <View className={cn("gap-1.5", className)} {...props} />;
}

function CardFooter({ className, ...props }: ViewProps) {
  return (
    <TextClassContext.Provider value="text-[14px] font-mono text-muted">
      <View className={cn("flex-row items-center justify-between gap-2", className)} {...props} />
    </TextClassContext.Provider>
  );
}

export { Card, CardContent, CardFooter, CardHeader, CardTitle };
