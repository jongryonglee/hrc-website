import { set, type StringInputProps } from "sanity";

const PRESETS = [
  "Prod.",
  "Director",
  "Camera",
  "Camera assistant",
  "Color",
  "Still Photography",
  "Act",
  "Styling",
  "Make-up artist",
  "Assistant",
  "Special Thanks",
  "Lyric",
  "Beat",
  "Mix",
  "Mastering",
];

const chipStyle: React.CSSProperties = {
  padding: "2px 8px",
  fontSize: 12,
  border: "1px solid #d1d5db",
  borderRadius: 4,
  background: "transparent",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const chipActiveStyle: React.CSSProperties = {
  ...chipStyle,
  background: "#111827",
  color: "#fff",
  borderColor: "#111827",
};

export function CreditLabelInput(props: StringInputProps) {
  const { value, onChange, renderDefault } = props;

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          marginBottom: 8,
        }}
      >
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            style={value === preset ? chipActiveStyle : chipStyle}
            onClick={() => onChange(set(preset))}
          >
            {preset}
          </button>
        ))}
      </div>
      {renderDefault(props)}
    </div>
  );
}
