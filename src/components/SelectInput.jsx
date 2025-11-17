const SelectInput = ({ label, value, onChange, options, className = "" }) => {
  return (
    <div className={className}>
      <label className="text-[12px] mb-2 font-medium text-gray-700">
        {label}
      </label>
      <select
        className="w-full border border-slate-300 outline-slate-400 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 transition-all text-gray-500"
        value={value}
        onChange={onChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;
