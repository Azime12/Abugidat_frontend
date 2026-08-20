/**
 * Reusable form field with label, leading icon, input, and error message.
 *
 * Props:
 * - label: string (translation key or text)
 * - icon: React component (the icon element to render)
 * - type: string (input type, default "text")
 * - placeholder: string
 * - fieldProps: object (formik getFieldProps result or { name, value, onChange, onBlur })
 * - error: string | false (formik error)
 * - touched: boolean (formik touched)
 * - maxLength: number (optional)
 * - inputClassName: string (additional input classes)
 * - rightElement: ReactNode (optional element to render on the right side of input)
 */
export default function FormField({
  label,
  icon: Icon,
  type = "text",
  placeholder = "",
  fieldProps = {},
  error,
  touched,
  maxLength,
  inputClassName = "",
  rightElement,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="text-[#94a3b8] text-sm" />
          </div>
        )}
        <input
          type={type}
          maxLength={maxLength}
          placeholder={placeholder}
          className={`w-full ${Icon ? "pl-10" : "pl-3"} ${
            rightElement ? "pr-10" : "pr-4"
          } py-2.5 border border-gray-200 rounded-lg text-sm text-[#1E293B] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#5AC6F0] focus:border-transparent transition-all ${inputClassName}`}
          {...fieldProps}
        />
        {rightElement && (
          <div className="absolute right-0 top-0 h-full flex items-center pr-1">
            {rightElement}
          </div>
        )}
      </div>
      {touched && error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}
