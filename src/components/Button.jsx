// Button.jsx
export default function Button({ className = "", icon, children, ...props }) {
  return (
    <button
      {...props}
      className={`w-full p-2 font-bold flex items-center justify-between rounded-md bg-gray-700 text-gray-50 hover:bg-gray-200 hover:text-gray-800 transition-colors ${className}`}
    >
      {icon && <span className="mr-1 flex items-left">{icon}</span>}
      <span className="flex-1 text-center">{children}</span>
    </button>
  );
}
