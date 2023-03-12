import Link, { LinkProps } from "next/link";
import { ButtonHTMLAttributes, AnchorHTMLAttributes, forwardRef } from "react";

import styles from "./Button.module.css";

type ButtonProps = (
  | ButtonHTMLAttributes<HTMLButtonElement>
  | AnchorHTMLAttributes<HTMLAnchorElement>
) & {};

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>((props: ButtonProps, ref) => {
  const { className, ...restProps } = props;

  if ((restProps as any).href) {
    return (
      <Link
        ref={ref as any}
        {...(restProps as LinkProps)}
        className={`${className} ${styles.button}`}
      >
        {props.children}
      </Link>
    );
  }

  return (
    <button
      ref={ref as any}
      {...(restProps as ButtonHTMLAttributes<HTMLButtonElement>)}
      className={`${className} ${styles.button}`}
    >
      {props.children}
    </button>
  );
});

Button.displayName = "Button";
