import { useCallback, useState } from "react";
import { insert, set, setIfMissing, type ArrayOfObjectsInputProps } from "sanity";
import { randomKey } from "@sanity/util/content";

const PLACEHOLDER = `1行に1クレジット。区切りは " / " または ", "
例:
Prod. / theeluu
Director / Hikaru Jamie Masamiya
Camera / Shintaro Teramoto`;

const segmentWrap: React.CSSProperties = {
  display: "inline-flex",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  overflow: "hidden",
};

const segmentBtn = (active: boolean): React.CSSProperties => ({
  padding: "6px 16px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  border: "none",
  background: active ? "#111827" : "#f3f4f6",
  color: active ? "#fff" : "#6b7280",
  transition: "background 0.15s, color 0.15s",
});

const btnBase: React.CSSProperties = {
  border: 0,
  borderRadius: 6,
  padding: "6px 12px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

export function CreditsBulkInput(props: ArrayOfObjectsInputProps) {
  const { onChange, renderDefault } = props;
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [message, setMessage] = useState("");

  const parseLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return null;

    const separators = [" / ", ", ", "\t"];
    for (const sep of separators) {
      const idx = trimmed.indexOf(sep);
      if (idx > 0) {
        const label = trimmed.slice(0, idx).trim();
        const name = trimmed.slice(idx + sep.length).trim();
        if (label && name) return { label, name };
      }
    }
    return null;
  };

  const handleImport = useCallback(() => {
    const lines = bulkText.split("\n");
    const parsed = lines.map(parseLine).filter(Boolean) as {
      label: string;
      name: string;
    }[];

    if (parsed.length === 0) {
      setMessage("有効な行がありません。「ラベル / 名前」の形式で入力してください。");
      return;
    }

    const items = parsed.map((item) => ({
      _type: "workCreditLine" as const,
      _key: randomKey(12),
      label: item.label,
      name: item.name,
    }));

    onChange([setIfMissing([]), insert(items, "after", [-1])]);
    setMessage(`${items.length} 件のクレジットを追加しました。`);
    setBulkText("");
  }, [bulkText, onChange]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={segmentWrap}>
          <button
            type="button"
            onClick={() => { setBulkMode(false); setMessage(""); }}
            style={segmentBtn(!bulkMode)}
          >
            ＋ 通常入力
          </button>
          <button
            type="button"
            onClick={() => { setBulkMode(true); setMessage(""); }}
            style={segmentBtn(bulkMode)}
          >
            ⎘ 一括ペースト
          </button>
        </div>
        {(props.value?.length ?? 0) > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`クレジット全 ${props.value?.length ?? 0} 件をクリアしますか？`)) {
                onChange(set([]));
                setMessage("");
              }
            }}
            style={{
              ...btnBase,
              background: "transparent",
              color: "#dc2626",
              border: "1px solid #fca5a5",
            }}
          >
            全クリア
          </button>
        )}
      </div>

      {bulkMode ? (
        <div>
          <textarea
            value={bulkText}
            onChange={(e) => {
              setBulkText(e.target.value);
              setMessage("");
            }}
            placeholder={PLACEHOLDER}
            rows={10}
            style={{
              width: "100%",
              padding: 10,
              fontSize: 14,
              fontFamily: "monospace",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              resize: "vertical",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            <button
              type="button"
              onClick={handleImport}
              disabled={!bulkText.trim()}
              style={{
                ...btnBase,
                background: bulkText.trim() ? "#111827" : "#9ca3af",
                color: "#fff",
                cursor: bulkText.trim() ? "pointer" : "not-allowed",
              }}
            >
              追加
            </button>
            {message && (
              <span
                style={{
                  fontSize: 13,
                  color: message.includes("追加") ? "#15803d" : "#b91c1c",
                }}
              >
                {message}
              </span>
            )}
          </div>
        </div>
      ) : (
        renderDefault(props)
      )}

      {bulkMode && (props.value?.length ?? 0) > 0 && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
            登録済み: {props.value?.length ?? 0} 件
          </p>
          {renderDefault(props)}
        </div>
      )}
    </div>
  );
}
