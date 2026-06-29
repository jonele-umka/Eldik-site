import { useState } from "react";
import { S } from "../utils/styles.js";

export default function SettingsPage({ apiUrl, onSave }) {
  const [url, setUrl] = useState(apiUrl);

  return (
    <div style={{ ...S.card, maxWidth: 520, padding: "28px 32px" }}>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
        Подключение к Google Sheets
      </div>
      <p
        style={{
          fontSize: 13,
          color: "var(--muted)",
          marginBottom: 20,
          lineHeight: 1.6,
        }}
      >
        Вставьте URL вашего Google Apps Script Web App.
        <br />
        Deploy → Web App → Execute as: Me → Who has access: <b>Anyone</b>.
      </p>
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 12,
            color: "var(--muted)",
            textTransform: "uppercase",
            letterSpacing: ".06em",
            marginBottom: 6,
          }}
        >
          URL Web App
        </div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://script.google.com/macros/s/.../exec"
          style={{
            background: "var(--s2)",
            border: "1px solid var(--b1)",
            borderRadius: 8,
            padding: "10px 14px",
            color: "var(--text)",
            fontSize: 13,
            outline: "none",
            fontFamily: "Inter, sans-serif",
            width: "100%",
          }}
        />
      </div>
      <button
        onClick={() => onSave(url.trim())}
        style={{
          background: "var(--accent)",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 22px",
          fontSize: 13.5,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
        }}
      >
        Сохранить и загрузить
      </button>
    </div>
  );
}
