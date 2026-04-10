"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { useClient } from "sanity";

type CsvRow = Record<string, string>;

const REQUIRED_COLUMNS = ["title", "artist", "role", "album", "label"] as const;
const OPTIONAL_COLUMNS = ["id", "_id"] as const;

const HEADER_ALIASES: Record<string, string> = {
  title: "title",
  "曲名": "title",
  artist: "artist",
  "アーティスト": "artist",
  role: "role",
  album: "album",
  "アルバム名": "album",
  label: "label",
  id: "id",
  _id: "_id",
};

const toolContainerStyle: React.CSSProperties = {
  maxWidth: 960,
  margin: "0 auto",
  padding: 24,
};

function normalizeHeader(raw: string) {
  const key = raw.trim();
  return HEADER_ALIASES[key] ?? key.toLowerCase();
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let i = 0;
  let inQuotes = false;

  while (i < text.length) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      cell += char;
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (char === ",") {
      row.push(cell.trim());
      cell = "";
      i += 1;
      continue;
    }
    if (char === "\n") {
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
      i += 1;
      continue;
    }
    if (char === "\r") {
      i += 1;
      continue;
    }

    cell += char;
    i += 1;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    rows.push(row);
  }

  return rows;
}

function toRowObject(headers: string[], values: string[]) {
  const row: CsvRow = {};
  headers.forEach((header, index) => {
    row[header] = (values[index] ?? "").trim();
  });
  return row;
}

function generateDocumentId(row: CsvRow, index: number) {
  const explicitId = row.id || row._id;
  if (explicitId) return explicitId;
  return `produced-work-item-${Date.now()}-${index + 1}`;
}

export function ProducedWorksCsvTool() {
  const client = useClient({ apiVersion: "2025-01-01" });
  const [fileName, setFileName] = useState<string>("");
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  const missingColumns = useMemo(
    () => REQUIRED_COLUMNS.filter((column) => !rawHeaders.includes(column)),
    [rawHeaders],
  );

  const canImport = csvRows.length > 0 && missingColumns.length === 0 && !isImporting;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError("");
    setResultMessage("");

    if (!file) {
      setFileName("");
      setCsvRows([]);
      setRawHeaders([]);
      return;
    }

    setFileName(file.name);
    const text = await file.text();
    const parsed = parseCsv(text);

    if (parsed.length < 2) {
      setError("CSVにヘッダー行とデータ行が必要です。");
      setCsvRows([]);
      setRawHeaders([]);
      return;
    }

    const headers = parsed[0].map(normalizeHeader);
    const dataRows = parsed.slice(1).filter((row) => row.some((cell) => cell.trim().length > 0));

    setRawHeaders(headers);
    setCsvRows(dataRows.map((values) => toRowObject(headers, values)));
  };

  const importRows = async () => {
    if (!canImport) return;
    setIsImporting(true);
    setError("");
    setResultMessage("");

    try {
      const validRows = csvRows.filter((row) =>
        REQUIRED_COLUMNS.every((column) => (row[column] ?? "").trim().length > 0),
      );

      if (validRows.length === 0) {
        throw new Error("必須項目が埋まっている行がありません。");
      }

      const BATCH_SIZE = 100;
      let imported = 0;

      for (let batchStart = 0; batchStart < validRows.length; batchStart += BATCH_SIZE) {
        const batch = validRows.slice(batchStart, batchStart + BATCH_SIZE);
        let tx = client.transaction();

        batch.forEach((row, localIndex) => {
          const globalIndex = batchStart + localIndex;
          tx = tx.createOrReplace({
            _id: generateDocumentId(row, globalIndex),
            _type: "producedWorkItem",
            title: row.title,
            artist: row.artist,
            role: row.role,
            album: row.album,
            label: row.label,
          });
        });

        await tx.commit();
        imported += batch.length;
      }

      setResultMessage(`${imported}件のデータを登録しました。`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "CSVの登録に失敗しました。";
      setError(message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div style={toolContainerStyle}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
        Produced Works CSV Import
      </h2>
      <p style={{ marginBottom: 16 }}>
        CSVのヘッダー: title, artist, role, album, label（id または _id は任意）
      </p>

      <input type="file" accept=".csv,text/csv" onChange={handleFileChange} />

      {fileName ? (
        <p style={{ marginTop: 8 }}>
          選択ファイル: <strong>{fileName}</strong>
        </p>
      ) : null}

      {missingColumns.length > 0 && rawHeaders.length > 0 ? (
        <p style={{ color: "#b91c1c", marginTop: 10 }}>
          必須ヘッダー不足: {missingColumns.join(", ")}
        </p>
      ) : null}

      {error ? <p style={{ color: "#b91c1c", marginTop: 10 }}>{error}</p> : null}
      {resultMessage ? <p style={{ color: "#15803d", marginTop: 10 }}>{resultMessage}</p> : null}

      {csvRows.length > 0 ? (
        <div style={{ marginTop: 20, overflowX: "auto" }}>
          <p style={{ marginBottom: 8 }}>読込件数: {csvRows.length}</p>
          <table
            style={{ borderCollapse: "collapse", width: "100%", minWidth: 720, fontSize: 14 }}
          >
            <thead>
              <tr>
                {[...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS].map((header) => (
                  <th
                    key={header}
                    style={{
                      border: "1px solid #d1d5db",
                      textAlign: "left",
                      padding: "6px 8px",
                      background: "#f8fafc",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvRows.slice(0, 20).map((row, index) => (
                <tr key={`${row.title}-${index}`}>
                  {[...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS].map((header) => (
                    <td key={`${header}-${index}`} style={{ border: "1px solid #e5e7eb", padding: "6px 8px" }}>
                      {row[header] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {csvRows.length > 20 ? (
            <p style={{ marginTop: 8, color: "#6b7280" }}>
              プレビューは先頭20件のみ表示しています。
            </p>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={importRows}
        disabled={!canImport}
        style={{
          marginTop: 20,
          background: canImport ? "#111827" : "#9ca3af",
          color: "#fff",
          border: 0,
          borderRadius: 6,
          padding: "10px 14px",
          cursor: canImport ? "pointer" : "not-allowed",
        }}
      >
        {isImporting ? "登録中..." : "CSVを一括登録"}
      </button>
    </div>
  );
}
