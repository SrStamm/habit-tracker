import { cn } from "../../lib/cn";

type TagProps = React.ComponentProps<"span"> & {
  variant?: "default" | "outline";
};

export function Tag({ variant = "default", className, ...props }: TagProps) {
  const variants = {
    default: "bg-accent/50 text-text-muted",
    outline: "border border-border text-text-muted",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}