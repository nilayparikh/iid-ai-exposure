/**
 * Color utilities for AI exposure scoring visualization.
 * Green (safe) → Yellow (moderate) → Red (exposed)
 */

export function exposureColor(score) {
  if (score == null) return [128, 128, 128];
  const t = Math.max(0, Math.min(10, score)) / 10;
  let r, g, b;
  if (t < 0.35) {
    // Deep green to green
    const s = t / 0.35;
    r = Math.round(30 + s * 60);
    g = Math.round(140 + s * 40);
    b = Math.round(50 - s * 10);
  } else if (t < 0.65) {
    // Green to amber
    const s = (t - 0.35) / 0.3;
    r = Math.round(90 + s * 160);
    g = Math.round(180 - s * 30);
    b = Math.round(40 - s * 10);
  } else {
    // Amber to red
    const s = (t - 0.65) / 0.35;
    r = Math.round(250);
    g = Math.round(150 - s * 120);
    b = Math.round(30 - s * 10);
  }
  return [r, g, b];
}

export function exposureCSS(score, alpha = 1) {
  const [r, g, b] = exposureColor(score);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function exposureBg(score) {
  return exposureCSS(score, 0.15);
}

export function exposureLabel(score) {
  if (score <= 2) return "Minimal";
  if (score <= 4) return "Low";
  if (score <= 6) return "Moderate";
  if (score <= 8) return "High";
  return "Very High";
}

export function exposureTier(score) {
  if (score <= 2) return { label: "Minimal", range: "0-2" };
  if (score <= 4) return { label: "Low", range: "2-4" };
  if (score <= 6) return { label: "Moderate", range: "4-6" };
  if (score <= 8) return { label: "High", range: "6-8" };
  return { label: "Very High", range: "8-10" };
}

export function formatNumber(n) {
  if (n >= 10) return n.toFixed(1) + "M";
  if (n >= 1) return n.toFixed(2) + "M";
  return (n * 1000).toFixed(0) + "K";
}

export function formatCrore(millions) {
  const crore = millions / 10;
  if (crore >= 1) return crore.toFixed(1) + " Cr";
  return (crore * 100).toFixed(1) + " L";
}

export function formatRupees(n) {
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(1) + "K";
  return "₹" + n;
}
