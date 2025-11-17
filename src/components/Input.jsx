export default function Input({
  type = "text",
  placeholder = "",
  className = "",
  value,
  onChange,
  onBlur,
  name,
  id,
  label,
  disabled = false,
  step,
  min,
  max,
  required = false,
  readOnly = false,
  autoFocus = false,
  ...rest
}) {
  return (
    <div className="flex flex-col">
      {label && (
        <label
          htmlFor={id || name}
          className="text-[12px] mb-2 font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={id || name}
        name={name}
        placeholder={placeholder}
        className={`w-full border border-slate-300 outline-slate-400 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 transition-all ${className}`}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        step={step}
        min={min}
        max={max}
        required={required}
        readOnly={readOnly}
        autoFocus={autoFocus}
        {...rest} // permite props adicionais (ex: pattern, title, etc.)
      />
    </div>
  );
}
