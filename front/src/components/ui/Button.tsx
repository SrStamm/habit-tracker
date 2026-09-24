import { cn } from "../../lib/cn";

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md";
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 active:scale-95",
    ghost: "text-text hover:bg-slate-100",
    outline: "border border-slate-300 text-text hover:bg-slate-50",
  };
  const sizes = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };
  return (
    <button
      className={cn(
        "rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
