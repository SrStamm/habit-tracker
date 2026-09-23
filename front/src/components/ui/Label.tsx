import { cn } from "../../lib/cn";

type LabelProps = React.ComponentProps<"label">;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-sm font-medium text-text", className)}
      {...props}
    />
  );
}
