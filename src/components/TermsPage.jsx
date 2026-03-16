import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <div className="h-full overflow-y-auto p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold text-white mb-4">
        Terms &amp; Conditions
      </h1>
      <p className="text-xs text-gray-500 mb-6">Last updated: June 2025</p>

      <section className="space-y-4 text-sm text-gray-300 leading-relaxed">
        <div>
          <h2 className="text-white font-medium mb-1">License</h2>
          <p>
            All content, visualizations, and data presentations on{" "}
            <strong>India in Data — AI Exposure</strong> are licensed under the{" "}
            <a
              href="https://creativecommons.org/licenses/by-nc-nd/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-cyan hover:underline"
            >
              Creative Commons Attribution-NonCommercial-NoDerivatives 4.0
              International (CC BY-NC-ND 4.0)
            </a>{" "}
            license. You may share the material with appropriate credit, but may
            not use it for commercial purposes or distribute modified versions.
          </p>
        </div>

        <div>
          <h2 className="text-white font-medium mb-1">Data Sources</h2>
          <p>
            The data presented in this application is derived from the{" "}
            <a
              href="https://www.mospi.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-cyan hover:underline"
            >
              Ministry of Statistics and Programme Implementation (MoSPI)
            </a>
            , Government of India, primarily the Periodic Labour Force Survey
            (PLFS). The data is used for informational and research purposes
            only.
          </p>
        </div>

        <div>
          <h2 className="text-white font-medium mb-1">No Warranty</h2>
          <p>
            This application is provided &quot;as is&quot; without warranty of
            any kind, express or implied. While we strive for accuracy, the
            visualizations are for informational purposes and should not be
            relied upon as authoritative data.
          </p>
        </div>

        <div>
          <h2 className="text-white font-medium mb-1">Third-Party Services</h2>
          <p>
            This site is hosted via <strong>Cloudflare</strong> and uses{" "}
            <strong>Google Analytics</strong> to collect anonymous usage
            statistics. These services may process limited technical data (such
            as IP addresses and page views) in accordance with their own privacy
            policies. See our{" "}
            <Link to="/privacy" className="text-brand-cyan hover:underline">
              Privacy Policy
            </Link>{" "}
            for details.
          </p>
        </div>

        <div>
          <h2 className="text-white font-medium mb-1">Changes</h2>
          <p>
            We may update these terms from time to time. Continued use of the
            application constitutes acceptance of any changes.
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
