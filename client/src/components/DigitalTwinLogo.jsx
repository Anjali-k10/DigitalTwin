import logoUrl from '../assets/digital-twin-logo.png';

function DigitalTwinLogo({ className = '', imageClassName = '' }) {
  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden bg-white ${className}`}>
      <img
        src={logoUrl}
        alt="DigitalTwin logo"
        className={`h-[118%] w-[118%] object-contain ${imageClassName}`}
      />
    </span>
  );
}

export default DigitalTwinLogo;
