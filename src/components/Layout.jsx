import { NavLink } from "react-router-dom";
import { AppLayout } from "@iid/common";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: "🏠", end: true },
  { to: "/treemap", label: "Treemap", icon: "▦" },
  { to: "/assessment", label: "AI Exposure", icon: "🤖" },
  { to: "/state-vulnerability", label: "State AI", icon: "🗺" },
  { to: "/vulnerability-matrix", label: "Risk Matrix", icon: "⚠" },
  { to: "/trends", label: "Trends", icon: "📈" },
  { to: "/demographics", label: "Demographics", icon: "👥" },
  { to: "/states", label: "States", icon: "📊" },
  { to: "/employment", label: "Employment", icon: "💼" },
  { to: "/wages", label: "Wages", icon: "₹" },
];

function NavTabs() {
  return (
    <>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
              isActive
                ? "nav-link-active"
                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
            }`
          }
        >
          <span className="text-[10px]">{item.icon}</span>
          <span className="hidden md:inline">{item.label}</span>
        </NavLink>
      ))}
    </>
  );
}

function HeaderActions({ dataYear }) {
  return (
    <>
      {dataYear && (
        <span className="text-[10px] text-gray-600 whitespace-nowrap">
          PLFS {dataYear} · MoSPI
        </span>
      )}
      <a
        href="https://github.com/nilayparikh/iid-ai-exposure"
        target="_blank"
        rel="noreferrer"
        className="text-gray-500 hover:text-gray-300 transition-colors"
        aria-label="View source on GitHub"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      </a>
    </>
  );
}

const FOOTER_LINKS = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Glossary", href: "/glossary" },
  { label: "PLFS/MoSPI", href: "https://www.mospi.gov.in/", external: true },
];

export default function Layout({ children, dataYear }) {
  const now = new Date();
  const webUpdated = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <AppLayout
      appName="AI Exposure"
      nav={<NavTabs />}
      headerActions={<HeaderActions dataYear={dataYear} />}
      homeLink="/"
      footerProps={{
        links: FOOTER_LINKS,
        githubUrl: "https://github.com/nilayparikh/iid-ai-exposure",
        twitterUrl: "https://x.com/nilayparikh",
        linkedinUrl: "https://linkedin.com/in/niparikh",
        license: "CC BY-NC-ND 4.0",
        licenseUrl: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
        dataCredit:
          "MoSPI \u2014 Ministry of Statistics and Programme Implementation",
        dataCreditUrl: "https://www.mospi.gov.in/",
        lastUpdatedData: "June 2025",
        lastUpdatedWeb: webUpdated,
      }}
    >
      {children}
    </AppLayout>
  );
}
