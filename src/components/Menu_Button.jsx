// components/Menu_Button.jsx
export default function Menu_Button(props) {
  return (
    <button
      {...props}
      className="w-full p-3 font-bold flex items-center justify-between rounded-md hover:bg-gray-700 hover:text-gray-50 text-gray-800 transition-colors mb-3"
    >
      {props.icon && (
        <span className="mr-1 flex items-center">{props.icon}</span>
      )}
      <span className="flex-1 text-center text-[14px]">{props.children}</span>
    </button>
  );
}
