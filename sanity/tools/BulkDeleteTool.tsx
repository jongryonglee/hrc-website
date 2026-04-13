"use client";

import { useCallback, useEffect, useState } from "react";
import { useClient } from "sanity";

type DocumentType = {
  value: string;
  label: string;
};

const DOCUMENT_TYPES: DocumentType[] = [
  { value: "workItem", label: "Works" },
  { value: "graphicDesignItem", label: "Graphic Design" },
  { value: "producedWorkItem", label: "Produced Works" },
  { value: "officeRecItem", label: "Office Rec" },
];

type SanityDoc = {
  _id: string;
  _type: string;
  title?: string;
  artist?: string;
};

const containerStyle: React.CSSProperties = {
  maxWidth: 960,
  margin: "0 auto",
  padding: 24,
};

const tableStyle: React.CSSProperties = {
  borderCollapse: "collapse",
  width: "100%",
  fontSize: 14,
  marginTop: 16,
};

const thStyle: React.CSSProperties = {
  border: "1px solid #d1d5db",
  textAlign: "left",
  padding: "6px 8px",
  background: "#f8fafc",
};

const tdStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  padding: "6px 8px",
};

const btnBase: React.CSSProperties = {
  border: 0,
  borderRadius: 6,
  padding: "10px 14px",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

export function BulkDeleteTool() {
  const client = useClient({ apiVersion: "2025-01-01" });
  const [docType, setDocType] = useState<string>(DOCUMENT_TYPES[0].value);
  const [docs, setDocs] = useState<SanityDoc[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");
    setSelected(new Set());
    try {
      const result = await client.fetch<SanityDoc[]>(
        `*[_type == $type] | order(_createdAt desc) { _id, _type, title, artist }`,
        { type: docType },
      );
      setDocs(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ドキュメントの取得に失敗しました。");
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, [client, docType]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === docs.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(docs.map((d) => d._id)));
    }
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    const confirmed = window.confirm(
      `選択した ${selected.size} 件のドキュメントを削除しますか？\nこの操作は取り消せません。`,
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");
    setMessage("");

    try {
      const ids = Array.from(selected);
      const BATCH_SIZE = 100;

      for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const batch = ids.slice(i, i + BATCH_SIZE);
        let tx = client.transaction();
        for (const id of batch) {
          tx = tx.delete(id);
        }
        await tx.commit();
      }

      setMessage(`${ids.length} 件のドキュメントを削除しました。`);
      setSelected(new Set());
      await fetchDocs();
    } catch (e) {
      setError(e instanceof Error ? e.message : "削除に失敗しました。");
    } finally {
      setDeleting(false);
    }
  };

  const deleteAll = async () => {
    if (docs.length === 0) return;
    const label = DOCUMENT_TYPES.find((t) => t.value === docType)?.label ?? docType;
    const confirmed = window.confirm(
      `「${label}」の全 ${docs.length} 件を削除しますか？\nこの操作は取り消せません。`,
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");
    setMessage("");

    try {
      const ids = docs.map((d) => d._id);
      const BATCH_SIZE = 100;

      for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const batch = ids.slice(i, i + BATCH_SIZE);
        let tx = client.transaction();
        for (const id of batch) {
          tx = tx.delete(id);
        }
        await tx.commit();
      }

      setMessage(`全 ${ids.length} 件のドキュメントを削除しました。`);
      setSelected(new Set());
      await fetchDocs();
    } catch (e) {
      setError(e instanceof Error ? e.message : "一括削除に失敗しました。");
    } finally {
      setDeleting(false);
    }
  };

  const allSelected = docs.length > 0 && selected.size === docs.length;

  return (
    <div style={containerStyle}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
        ドキュメント一括削除
      </h2>
      <p style={{ marginBottom: 16, color: "#6b7280" }}>
        ドキュメントタイプを選択し、個別選択または一括でドキュメントを削除できます。
      </p>

      {/* type selector */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <label htmlFor="bulk-delete-type" style={{ fontWeight: 600 }}>
          タイプ:
        </label>
        <select
          id="bulk-delete-type"
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            fontSize: 14,
          }}
        >
          {DOCUMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={deleteSelected}
          disabled={selected.size === 0 || deleting}
          style={{
            ...btnBase,
            background: selected.size > 0 && !deleting ? "#dc2626" : "#9ca3af",
            cursor: selected.size > 0 && !deleting ? "pointer" : "not-allowed",
          }}
        >
          {deleting ? "削除中..." : `選択削除 (${selected.size})`}
        </button>

        <button
          type="button"
          onClick={deleteAll}
          disabled={docs.length === 0 || deleting}
          style={{
            ...btnBase,
            background: docs.length > 0 && !deleting ? "#991b1b" : "#9ca3af",
            cursor: docs.length > 0 && !deleting ? "pointer" : "not-allowed",
          }}
        >
          全件削除
        </button>
      </div>

      {error && <p style={{ color: "#b91c1c", marginTop: 10 }}>{error}</p>}
      {message && <p style={{ color: "#15803d", marginTop: 10 }}>{message}</p>}

      {loading ? (
        <p style={{ marginTop: 16, color: "#6b7280" }}>読み込み中...</p>
      ) : docs.length === 0 ? (
        <p style={{ marginTop: 16, color: "#6b7280" }}>ドキュメントがありません。</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 40, textAlign: "center" }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  style={{ cursor: "pointer" }}
                />
              </th>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Artist</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr
                key={doc._id}
                style={{
                  background: selected.has(doc._id) ? "#fef2f2" : "transparent",
                }}
              >
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={selected.has(doc._id)}
                    onChange={() => toggleSelect(doc._id)}
                    style={{ cursor: "pointer" }}
                  />
                </td>
                <td style={{ ...tdStyle, fontSize: 12, color: "#6b7280", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {doc._id}
                </td>
                <td style={tdStyle}>{doc.title ?? "—"}</td>
                <td style={tdStyle}>{doc.artist ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ marginTop: 12, color: "#6b7280", fontSize: 13 }}>
        合計: {docs.length} 件 / 選択中: {selected.size} 件
      </p>
    </div>
  );
}
