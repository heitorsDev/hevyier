import { type ViewProps } from "react-native";

import { View as CSSView } from "@/components/ui/primitives";
import { TextClassContext } from "@/components/ui/text";
import { cn } from "@/lib/utils";

function Card({ className, ...props }: ViewProps) {
  return (
    <CSSView
      className={cn("rounded-lg border border-border bg-card p-4 gap-1", className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: ViewProps) {
  return (
    <CSSView
      className={cn("flex-row items-baseline justify-between gap-2", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: ViewProps) {
  return <CSSView className={cn("gap-1.5", className)} {...props} />;
}

function CardFooter({ className, ...props }: ViewProps) {
  return (
    <TextClassContext.Provider value="text-sm font-mono text-muted-foreground">
      <CSSView
        className={cn("flex-row items-center justify-between gap-2", className)}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export { Card, CardContent, CardFooter, CardHeader };
