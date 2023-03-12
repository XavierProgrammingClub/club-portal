import { forwardRef, InputHTMLAttributes, useId } from "react";

import styles from "./Input.module.css";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  variant?: string;
  label?: string;
  error?: string;
  labelClassName?: string;
  inputClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (props: InputProps, ref) => {
    const {
      variant,
      label,
      labelClassName,
      inputClassName,
      error,
      ...restProps
    } = props;

    const id = useId();

    return (
      <div>
        {label ? (
          <label
            htmlFor={id}
            className={`${labelClassName} ${styles.label} ${
              props.required ? styles.required : ""
            }`}
          >
            {label}
          </label>
        ) : null}
        <input
          {...restProps}
          ref={ref}
          id={id}
          className={`${inputClassName} ${styles.input}`}
        ></input>
        {error ? <small className={styles.error}>{error}</small> : null}
      </div>
    );
  }
);

Input.displayName = "Input";
