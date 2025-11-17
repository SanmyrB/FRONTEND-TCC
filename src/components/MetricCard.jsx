const MetricCard = ({
  title,
  value,
  unit,
  icon: Icon,
  precision = 2,
  className = "",
}) => {
  const formatValue = (val) => {
    if (val === null || val === undefined || isNaN(val)) return "N/A";
    return typeof val === "number" ? val.toFixed(precision) : val;
  };

  return (
    <div className={`bg-white rounded-md shadow p-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{formatValue(value)}</h2>
        {Icon && <Icon size={20} className="text-gray-600" />}
      </div>
      {unit && <p className="text-xs text-gray-500 mt-1">{unit}</p>}
    </div>
  );
};

export default MetricCard;
