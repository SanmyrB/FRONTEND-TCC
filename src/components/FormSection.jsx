const FormSection = ({ title, children, className = "" }) => {
  return (
    <div className={`mb-6 ${className}`}>
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{children}</div>
    </div>
  );
};

export default FormSection;
