import { Link } from "react-router-dom";

export default function PrivacyPage() {
  return (
    <div className="h-full overflow-y-auto p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold text-white mb-4">Privacy Policy</h1>
      <p className="text-xs text-gray-500 mb-6">Last updated: June 2025</p>

      <section className="space-y-4 text-sm text-gray-300 leading-relaxed">
        <div>
          <h2 className="text-white font-medium mb-1">No Data Storage</h2>
          <p>
            <strong>India in Data — AI Exposure</strong> does not collect,
            store, or process any personal data. The application is a fully
            static site that runs entirely in your browser. There are no user
            accounts, no forms, no cookies set by us, and no server-side data
            processing.
          </p>
        </div>

        <div>
          <h2 className="text-white font-medium mb-1">Cloudflare</h2>
          <p>
            This site is served through{" "}
            <a
              href="https://www.cloudflare.com/privacypolicy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-cyan hover:underline"
            >
              Cloudflare
            </a>
            , which may automatically collect limited technical information
            (such as IP addresses, browser type, and page requests) for
            performance and security purposes. This data is processed by
            Cloudflare in accordance with their privacy policy.
          </p>
        </div>

        <div>
          <h2 className="text-white font-medium mb-1">Google Analytics</h2>
          <p>
            We use{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-cyan hover:underline"
            >
              Google Analytics
            </a>{" "}
            to understand aggregate usage patterns such as page views, session
            duration, and geographic region. Google Analytics may use cookies
            and collect anonymized data. No personally identifiable information
            is intentionally collected or shared. You can opt out by using a
            browser extension such as the{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-cyan hover:underline"
            >
              Google Analytics Opt-out Browser Add-on
            </a>
            .
          </p>
        </div>

        <div>
          <h2 className="text-white font-medium mb-1">External Links</h2>
          <p>
            This site contains links to external websites (e.g., MoSPI, GitHub).
            We are not responsible for the privacy practices of those sites.
          </p>
        </div>

        <div>
          <h2 className="text-white font-medium mb-1">Changes</h2>
          <p>
            We may update this privacy policy from time to time. Continued use
            of the application constitutes acceptance of any changes.
          </p>
        </div>
      </section>

      <div className="mt-8 pt-4 border-t border-white/5">
        <Link
          to="/treemap"
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}
