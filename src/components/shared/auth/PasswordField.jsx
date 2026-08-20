import { useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import FormField from "./FormField";

/**
 * Password input field with show/hide toggle button.
 *
 * Props:
 * - label, placeholder, fieldProps, error, touched (passed to FormField)
 * - icon: override icon (defaults to FaLock)
 */
export default function PasswordField({
  label,
  placeholder = "Enter your password",
  fieldProps = {},
  error,
  touched,
  icon: Icon,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      label={label}
      icon={Icon}
      type={showPassword ? "text" : "password"}
      placeholder={placeholder}
      fieldProps={fieldProps}
      error={error}
      touched={touched}
      rightElement={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="p-2 text-[#94a3b8] hover:text-[#64748B] transition-colors"
          tabIndex={-1}
        >
          {showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
        </button>
      }
    />
  );
}
