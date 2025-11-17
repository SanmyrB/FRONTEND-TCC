export default function Button(props) {
  return (
    <button
      {...props}
      className="w-full mt-5 p-2 font-bold flex items-center justify-between rounded-md bg-gray-700 text-gray-50 hover:bg-gray-200 hover:text-gray-800 transition-colors"
    >
      {props.icon && (
        <span className="mr-1 flex items-center">{props.icon}</span>
      )}
      <span className="flex-1 text-center">{props.children}</span>
    </button>
  );
}
