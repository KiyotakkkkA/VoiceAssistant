
interface RangeInputSimpleProps {
    min: number;
    max: number;
    value: number;
    onChange: (value: number) => void;
}

const RangeInputSimple: React.FC<RangeInputSimpleProps> = ({ min, max, value, onChange }) => {
  return (
    <div className="flex items-center gap-3">
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1 h-2 bg-ui-bg-secondary-light rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-ui-text-muted mt-1">
            {value}
        </div>
    </div>
  );
};

export { RangeInputSimple };
