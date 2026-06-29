import { useState, useCallback, useEffect } from "react";
import { NavItem, Spinner } from "./components/UI.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import PaymentsPage from "./pages/PaymentsPage.jsx";
import DebtorsPage from "./pages/DebtorsPage.jsx";
import { ReturnsPage, ExpensesPage, ClientsPage } from "./pages/MiscPages";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import { ProductionPage, DeliveryPage } from "./pages/ProductionPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import { S } from "./utils/styles.js";
import { useBreakpoint } from "./hooks/useBreakpoint.js";

const PAGES = [
  { key: "orders", icon: "📋", label: "Заказы" },
  { key: "payments", icon: "💳", label: "Платежи" },
  { key: "debtors", icon: "⚠️", label: "Должники" },
  { key: "returns", icon: "↩️", label: "Возвраты" },
  { key: "expenses", icon: "💸", label: "Расходы" },
  { key: "clients", icon: "👥", label: "Клиенты" },
  { key: "analytics", icon: "📊", label: "Аналитика" },
  { key: "production", icon: "🏭", label: "Производство" },
  { key: "delivery", icon: "🚚", label: "Развозка" },
  { key: "settings", icon: "⚙️", label: "Настройки" },
];

// Главные страницы в нижней навигации на мобильном
const BOTTOM_NAV_PAGES = [
  "orders",
  "debtors",
  "analytics",
  "delivery",
  "settings",
];

const ENDPOINTS = [
  ["orders", "orders"],
  ["payments", "payments"],
  ["debtors", "debtors"],
  ["returns", "returns"],
  ["expenses", "expensesList"],
  ["clients", "clients"],
  ["analytics", "analytics"],
  ["months", "analyticsMonths"],
  ["production", "production"],
];

// ── Боковая панель: полная (десктоп) ──────────────────
function Sidebar({ page, setPage, setSearch, updatedAt }) {
  return (
    <aside style={S.sidebar}>
      <div style={S.logo}>📦 Бизнес</div>
      <nav style={S.nav}>
        {PAGES.map((p) => (
          <NavItem
            key={p.key}
            icon={p.icon}
            label={p.label}
            active={page === p.key}
            onClick={() => {
              setSearch("");
              setPage(p.key);
            }}
          />
        ))}
      </nav>
      {updatedAt && (
        <div
          style={{
            padding: "12px 18px",
            fontSize: 11.5,
            color: "var(--muted2)",
            borderTop: "1px solid var(--b1)",
          }}
        >
          Обновлено в {updatedAt}
        </div>
      )}
    </aside>
  );
}

// ── Боковая панель: иконки (планшет) ──────────────────
function SidebarCollapsed({ page, setPage, setSearch }) {
  return (
    <aside style={S.sidebarCollapsed}>
      <div style={S.logoCollapsed}>📦</div>
      <nav style={S.navCollapsed}>
        {PAGES.map((p) => {
          const active = page === p.key;
          return (
            <div
              key={p.key}
              title={p.label}
              onClick={() => {
                setSearch("");
                setPage(p.key);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 40,
                borderRadius: 8,
                marginBottom: 2,
                cursor: "pointer",
                fontSize: 18,
                background: active ? "rgba(88,166,255,.15)" : "transparent",
                transition: "background .15s",
              }}
            >
              {p.icon}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

// ── Нижняя навигация (мобильный) ──────────────────────
function BottomNav({ page, setPage, setSearch }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const mainPages = PAGES.filter((p) => BOTTOM_NAV_PAGES.includes(p.key));
  const morePages = PAGES.filter((p) => !BOTTOM_NAV_PAGES.includes(p.key));

  return (
    <>
      {/* Шторка "Ещё" */}
      {moreOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            background: "rgba(0,0,0,0.5)",
          }}
          onClick={() => setMoreOpen(false)}
        >
          <div
            style={{
              position: "absolute",
              bottom: 60,
              left: 0,
              right: 0,
              background: "var(--s1)",
              borderTop: "1px solid var(--b1)",
              borderRadius: "16px 16px 0 0",
              padding: "12px 8px 8px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontSize: 11,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: ".08em",
                padding: "4px 12px 10px",
              }}
            >
              Все разделы
            </div>
            {morePages.map((p) => (
              <div
                key={p.key}
                onClick={() => {
                  setSearch("");
                  setPage(p.key);
                  setMoreOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 14,
                  color: page === p.key ? "var(--accent)" : "var(--text)",
                  background:
                    page === p.key ? "rgba(88,166,255,.08)" : "transparent",
                  marginBottom: 2,
                }}
              >
                <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>
                  {p.icon}
                </span>
                {p.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Нижняя панель */}
      <div style={S.bottomNav}>
        {mainPages.map((p) => {
          const active = page === p.key;
          return (
            <button
              key={p.key}
              onClick={() => {
                setSearch("");
                setPage(p.key);
                setMoreOpen(false);
              }}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: active ? "var(--accent)" : "var(--muted)",
                padding: "6px 2px",
                transition: "color .15s",
              }}
            >
              <span style={{ fontSize: 20 }}>{p.icon}</span>
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: active ? 600 : 400,
                  letterSpacing: ".02em",
                }}
              >
                {p.label}
              </span>
            </button>
          );
        })}
        {/* Кнопка "Ещё" */}
        <button
          onClick={() => setMoreOpen((v) => !v)}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            background: "none",
            border: "none",
            cursor: "pointer",
            color:
              !BOTTOM_NAV_PAGES.includes(page) && !moreOpen
                ? "var(--accent)"
                : moreOpen
                  ? "var(--accent)"
                  : "var(--muted)",
            padding: "6px 2px",
            transition: "color .15s",
          }}
        >
          <span style={{ fontSize: 20 }}>☰</span>
          <span
            style={{ fontSize: 9.5, fontWeight: 400, letterSpacing: ".02em" }}
          >
            Ещё
          </span>
        </button>
      </div>
    </>
  );
}

// ── Топбар ─────────────────────────────────────────────
function Topbar({ label, search, setSearch, onRefresh, loading, isMobile }) {
  return (
    <div
      style={{
        ...S.topbar,
        padding: isMobile ? "10px 14px" : "13px 24px",
      }}
    >
      <h1 style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600, margin: 0 }}>
        {label}
      </h1>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="text"
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: "var(--s2)",
            border: "1px solid var(--b1)",
            borderRadius: 8,
            padding: "7px 10px",
            color: "var(--text)",
            fontSize: 13,
            width: isMobile ? 130 : 220,
            outline: "none",
            fontFamily: "Inter, sans-serif",
          }}
        />
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Обновить"
          style={{
            background: "var(--s2)",
            border: "1px solid var(--b1)",
            borderRadius: 8,
            padding: "7px 10px",
            color: "var(--text)",
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            opacity: loading ? 0.6 : 1,
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              display: "inline-block",
              animation: loading ? "spin .7s linear infinite" : "none",
              fontSize: 16,
            }}
          >
            ⟳
          </span>
          {!isMobile && "Обновить"}
        </button>
      </div>
    </div>
  );
}

// ── Root App ────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("orders");
  const [search, setSearch] = useState("");
  const [apiUrl, setApiUrl] = useState(
    () => localStorage.getItem("gsApiUrl") || "",
  );
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState("");
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  const load = useCallback(async (url) => {
    if (!url) return;
    setLoading(true);
    const results = await Promise.allSettled(
      ENDPOINTS.map(([key, action]) =>
        fetch(`${url}?action=${action}`)
          .then((r) => r.json())
          .then((d) => ({ key, d }))
          .catch(() => ({ key, d: [] })),
      ),
    );
    const next = {};
    results.forEach((r) => {
      if (r.status === "fulfilled") next[r.value.key] = r.value.d;
    });
    setData(next);
    setLoading(false);
    setUpdatedAt(
      new Date().toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }, []);

  useEffect(() => {
    if (apiUrl) load(apiUrl);
    else setPage("settings");
  }, []);

  const handleSave = (url) => {
    setApiUrl(url);
    localStorage.setItem("gsApiUrl", url);
    load(url);
    setPage("orders");
  };

  const renderPage = () => {
    if (loading) return <Spinner />;
    switch (page) {
      case "orders":
        return (
          <OrdersPage
            data={data.orders}
            expenses={data.expenses}
            search={search}
            isMobile={isMobile}
          />
        );
      case "payments":
        return <PaymentsPage data={data.payments} search={search} />;
      case "debtors":
        return <DebtorsPage data={data.debtors} search={search} />;
      case "returns":
        return <ReturnsPage data={data.returns} search={search} />;
      case "expenses":
        return <ExpensesPage data={data.expenses} search={search} />;
      case "clients":
        return <ClientsPage data={data.clients} search={search} />;
      case "analytics":
        return (
          <AnalyticsPage
            analytics={data.analytics}
            months={data.months}
            expenses={data.expenses}
          />
        );
      case "production":
        return <ProductionPage data={data.production} search={search} />;
      case "delivery":
        return <DeliveryPage data={data.production} search={search} />;
      case "settings":
        return <SettingsPage apiUrl={apiUrl} onSave={handleSave} />;
      default:
        return null;
    }
  };

  const currentPage = PAGES.find((p) => p.key === page);
  const contentStyle = isMobile ? S.contentMobile : S.content;

  return (
    <div style={S.layout}>
      {/* Навигация: десктоп — полный сайдбар, планшет — иконки, мобильный — снизу */}
      {isDesktop && (
        <Sidebar
          page={page}
          setPage={setPage}
          setSearch={setSearch}
          updatedAt={updatedAt}
        />
      )}
      {isTablet && (
        <SidebarCollapsed page={page} setPage={setPage} setSearch={setSearch} />
      )}

      <div style={S.main}>
        <Topbar
          label={currentPage?.label}
          search={search}
          setSearch={setSearch}
          onRefresh={() => load(apiUrl)}
          loading={loading}
          isMobile={isMobile}
        />
        <div style={contentStyle}>{renderPage()}</div>
      </div>

      {isMobile && (
        <BottomNav page={page} setPage={setPage} setSearch={setSearch} />
      )}
    </div>
  );
}
