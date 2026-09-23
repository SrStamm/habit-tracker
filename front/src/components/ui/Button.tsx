import { cn } from "../../lib/cn";

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: "primary" | "ghost" | "outline";
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 active:scale-95",
    ghost: "text-text hover:bg-slate-100",
    outline: "border border-slate-300 text-text hover:bg-slate-50",
  };
  return (
    <button
      className={cn(
        "rounded-lg px-4 py-2 font-medium transition",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
