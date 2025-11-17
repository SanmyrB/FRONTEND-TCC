const LoadingOverlay = ({ message = "Calculando..." }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
          <span className="text-lg font-medium">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
