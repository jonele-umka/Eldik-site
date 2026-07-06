import { useState } from "react";
import { S } from "../utils/styles.js";
import { getUserLabel } from "../utils/auth.js";

export default function SettingsPage({ apiUrl, onSave, user, onLogout }) {
  const [url, setUrl] = useState(apiUrl);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ ...S.card, maxWidth: 520, padding: "28px 32px" }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          Аккаунт
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
          Вы вошли как: <b>{getUserLabel(user) || user}</b>
        </p>
        <button
          onClick={onLogout}
          style={{
            background: "var(--s2)",
            border: "1px solid var(--b1)",
            color: "var(--text)",
            borderRadius: 8,
            padding: "10px 22px",
            fontSize: 13.5,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Выйти
        </button>
      </div>

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
          По умолчанию используется адрес, зашитый в <code>config.js</code>.
          Здесь его можно временно переопределить — например, для тестового
          скрипта.
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
              boxSizing: "border-box",
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
    </div>
  );
}
