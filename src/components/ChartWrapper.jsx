const ChartWrapper = ({
  title,
  data,
  labels,
  chartType = "line",
  children,
  ...props
}) => {
  const hasValidData =
    data && data.length > 0 && data.some((val) => val !== null && !isNaN(val));

  if (!hasValidData) {
    return (
      <div className="bg-white rounded-md shadow p-4">
        <div className="flex items-center justify-center h-64 text-gray-500">
          Nenhum dado disponível para o gráfico
        </div>
      </div>
    );
  }

  return <div className="bg-white rounded-md shadow p-4">{children}</div>;
};

export default ChartWrapper;
