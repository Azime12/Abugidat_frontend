const LOGO_PATH = "/images/photo_2025-11-24_10-54-38.jpg";

export const AbugidaLogo = ({ size = 40, variant = "default", className = "" }) => {
  const iconSize = typeof size === "number" ? size : 40;
  const borderRadius = variant === "icon" ? iconSize * 0.25 : iconSize * 0.15;

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{ width: iconSize, height: iconSize, borderRadius }}
    >
      <img
        src={LOGO_PATH}
        alt="Abugida"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default AbugidaLogo;
