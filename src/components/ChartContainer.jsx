const ChartContainer = ({ title, children, className = "" }) => {
  return (
    <div className={`bg-white rounded-md shadow p-4 ${className}`}>
      {children}
    </div>
  );
};

export default ChartContainer;
