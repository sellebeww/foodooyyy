// src/components/Button.tsx
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

export type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  to?: string;
  icon?: ReactNode;
  wide?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  to,
  icon,
  wide = false,
  children,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  const classes = [
    "btn",
    `btn--${variant}`,
    wide ? "btn--wide" : "",
    className ?? "",
  ]
    .filter((item) => item !== "")
    .join(" ");
  const content = (
    <>
      {icon}
      <span>{children}</span>
    </>
  );
  if (to !== undefined && rest.disabled !== true) {
    return (
      <Link className={classes} to={to}>
        {content}
      </Link>
    );
  }
  return (
    <button className={classes} type={type} {...rest}>
      {content}
    </button>
  );
}
