import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { BrandLockup } from "@iid/common";
import Layout from "./components/Layout";
import Sidebar from "./components/Sidebar";
import HomePage from "./components/HomePage";
import TreemapCanvas from "./components/TreemapCanvas";
import TrendPanel from "./components/TrendPanel";
import IndustryBar from "./components/IndustryBar";
import OccupationRing from "./components/OccupationRing";
import StatePanel from "./components/StatePanel";
import AssessmentPanel from "./components/AssessmentPanel";
import DemographicsPanel from "./components/DemographicsPanel";
import WagesPanel from "./components/WagesPanel";
import EmploymentPanel from "./components/EmploymentPanel";
import StateVulnerabilityPage from "./components/StateVulnerabilityPage";
import VulnerabilityMatrixPage from "./components/VulnerabilityMatrixPage";
import TermsPage from "./components/TermsPage";
import PrivacyPage from "./components/PrivacyPage";
import GlossaryPage from "./components/GlossaryPage";
import { loadAllData } from "./utils/pbLoader";

function TreemapView({ data, selectedIndustry, setSelectedIndustry }) {
  return (
    <div className="h-full flex">
      <div className="flex-1 h-full">
        <TreemapCanvas
          data={data}
          selectedIndustry={selectedIndustry}
          setSelectedIndustry={setSelectedIndustry}
        />
      </div>
      <div className="w-80 xl:w-96 h-full overflow-y-auto p-3 space-y-3">
        <IndustryBar
          data={data}
          selectedIndustry={selectedIndustry}
          setSelectedIndustry={setSelectedIndustry}
        />
        <OccupationRing data={data} />
      </div>
    </div>
  );
}

function DashboardLayout({
  data,
  stateAI,
  selectedIndustry,
  setSelectedIndustry,
}) {
  return (
    <div className="h-full flex overflow-hidden">
      <div className="sidebar-desktop">
        <Sidebar
          data={data}
          selectedIndustry={selectedIndustry}
          setSelectedIndustry={setSelectedIndustry}
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route
            path="/"
            element={<HomePage data={data} stateAI={stateAI} />}
          />
          <Route
            path="/treemap"
            element={
              <TreemapView
                data={data}
                selectedIndustry={selectedIndustry}
                setSelectedIndustry={setSelectedIndustry}
              />
            }
          />
          <Route path="/trends" element={<TrendPanel data={data} />} />
          <Route
            path="/demographics"
            element={<DemographicsPanel data={data} />}
          />
          <Route path="/states" element={<StatePanel data={data} />} />
          <Route path="/employment" element={<EmploymentPanel data={data} />} />
          <Route path="/wages" element={<WagesPanel data={data} />} />
          <Route
            path="/assessment"
            element={
              <AssessmentPanel
                data={data}
                selectedIndustry={selectedIndustry}
                setSelectedIndustry={setSelectedIndustry}
              />
            }
          />
          <Route
            path="/state-vulnerability"
            element={
              <StateVulnerabilityPage
                stateAI={stateAI}
                industries={data.industries}
              />
            }
          />
          <Route
            path="/vulnerability-matrix"
            element={<VulnerabilityMatrixPage stateAI={stateAI} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [stateAI, setStateAI] = useState(null);
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  useEffect(() => {
    loadAllData().then(setData);
    const base = import.meta.env.BASE_URL || "/";
    fetch(`${base}state_ai.json`)
      .then((r) => r.json())
      .then(setStateAI)
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-900">
        <div className="text-center animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BrandLockup size="lg" />
          </div>
          <div className="text-sm text-gray-500 mb-4">AI Exposure</div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
            <span className="text-xs text-gray-600">
              Loading India Jobs Data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout dataYear={data.summary.data_year}>
      <Routes>
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/glossary" element={<GlossaryPage />} />
        <Route
          path="*"
          element={
            <DashboardLayout
              data={data}
              stateAI={stateAI}
              selectedIndustry={selectedIndustry}
              setSelectedIndustry={setSelectedIndustry}
            />
          }
        />
      </Routes>
    </Layout>
  );
}
