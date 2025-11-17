import { Info } from "lucide-react";

const SectionHeader = ({
  title,
  onInfoClick,
  infoTooltip = "Ver detalhes",
}) => {
  return (
    <div className="flex gap-2 items-center mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {onInfoClick && (
        <button
          onClick={onInfoClick}
          className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
          title={infoTooltip}
        >
          <Info size={14} />
        </button>
      )}
    </div>
  );
};

export default SectionHeader;
