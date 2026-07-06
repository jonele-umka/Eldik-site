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
    </div>
  );
}
