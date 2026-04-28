const statusNode = document.getElementById("map-status");
const resetButton = document.getElementById("reset-view");
const clearSelectionBtn = document.getElementById("clear-selection");
const liveIndicator = document.getElementById("live-indicator");
const analyzeBtn = document.getElementById("analyze-btn");
const filterControls = document.getElementById("filter-controls");
const tempMinInput = document.getElementById("temp-min");
const tempMaxInput = document.getElementById("temp-max");
const tempValDisplay = document.getElementById("temp-val-display");
const neutralIndiaBounds = L.latLngBounds([5.5, 66.5], [38.5, 99.5]);

const map = L.map("map", {
  zoomControl: true,
  minZoom: 4,
  maxBounds: neutralIndiaBounds,
  maxBoundsViscosity: 0.8,
});

map.createPane("soi-boundary-casing");
map.getPane("soi-boundary-casing").style.zIndex = 440;
map.createPane("soi-outline");
map.getPane("soi-outline").style.zIndex = 450;

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let manifest;
let soiBoundaryCasingLayer;
let soiOutlineLayer;
let activeCityLayer;
let selectedPointMarker;
let currentGeojson;
let currentValueField;
let currentRange;
let isLive = false;
let apiBase = "";
const liveCheckTimeoutMs = 12000;
let configuredTargets = [];
let legendNode;

const legendControl = L.control({ position: "bottomright" });

legendControl.onAdd = () => {
  legendNode = L.DomUtil.create("div", "heat-legend is-hidden");
  L.DomEvent.disableClickPropagation(legendNode);
  L.DomEvent.disableScrollPropagation(legendNode);
  return legendNode;
};

legendControl.addTo(map);

map.on("click", (e) => {
  if (!isLive) return;

  setSelectedPoint(e.latlng);
});

function clearSelection() {
  if (selectedPointMarker) {
    map.removeLayer(selectedPointMarker);
    selectedPointMarker = null;
  }
  if (activeCityLayer) {
    map.removeLayer(activeCityLayer);
    activeCityLayer = null;
  }
  clearLegend();
  if (clearSelectionBtn) clearSelectionBtn.style.display = "none";
  
  if (isLive) {
    analyzeBtn.onclick = requestLiveHeatmapForCenter;
  }
  setStatus("Selection cleared. Choose a point and request a heatmap.");
}

clearSelectionBtn?.addEventListener("click", clearSelection);

function setStatus(message) {
  if (statusNode) {
    statusNode.textContent = message;
  }
}

function setSelectedPoint(latlng, label = null) {
  if (selectedPointMarker) {
    selectedPointMarker.setLatLng(latlng);
  } else {
    selectedPointMarker = L.marker(latlng).addTo(map);
  }

  if (clearSelectionBtn) clearSelectionBtn.style.display = "inline-block";
  if (label) {
    setStatus(`${label}. Click 'Get Heatmap' to analyze.`);
  } else {
    setStatus(`Point selected: ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}. Click 'Get Heatmap' to analyze.`);
  }
  analyzeBtn.onclick = () => requestLiveHeatmapForPoint(latlng.lat, latlng.lng);
}

function toColor(value, min, max, palette) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "#999999";
  }
  const safeMax = max === min ? min + 1 : max;
  const ratio = Math.max(0, Math.min(1, (value - min) / (safeMax - min)));
  const index = Math.min(palette.length - 1, Math.floor(ratio * palette.length));
  return palette[index];
}

function getValueRange(geojson, valueField) {
  const values = geojson.features
    .map((feature) => feature.properties[valueField])
    .filter((value) => typeof value === "number");

  if (values.length === 0) {
    return null;
  }

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function formatTemperature(value) {
  return `${Number(value).toFixed(1)}°C`;
}

function renderLegend() {
  if (!legendNode) return;

  if (!currentRange || !manifest?.palette?.length) {
    legendNode.classList.add("is-hidden");
    legendNode.innerHTML = "";
    return;
  }

  const tMin = tempMinInput ? parseFloat(tempMinInput.value) : currentRange.min;
  const tMax = tempMaxInput ? parseFloat(tempMaxInput.value) : currentRange.max;
  const gradient = `linear-gradient(90deg, ${manifest.palette.join(", ")})`;

  legendNode.classList.remove("is-hidden");
  legendNode.innerHTML = `
    <div class="heat-legend-bar" style="background: ${gradient};"></div>
    <div class="heat-legend-scale">
      <span>${formatTemperature(Math.max(currentRange.min, tMin))}</span>
      <span>${formatTemperature(Math.min(currentRange.max, tMax))}</span>
    </div>
  `;
}

function clearLegend() {
  currentRange = null;
  renderLegend();
}

function createLayer(geojson, valueField, palette, tooltipLabel, range = null) {
  currentGeojson = geojson;
  currentValueField = valueField;

  const tMin = tempMinInput ? parseFloat(tempMinInput.value) : -100;
  const tMax = tempMaxInput ? parseFloat(tempMaxInput.value) : 200;
  const effectiveRange = range ?? getValueRange(geojson, valueField);

  if (!effectiveRange) return L.geoJSON(geojson);

  return L.geoJSON(geojson, {
    filter: (feature) => {
      const val = feature.properties[valueField];
      return val >= tMin && val <= tMax;
    },
    style: (feature) => ({
      stroke: false,
      fillOpacity: 0.45,
      fillColor: toColor(feature.properties[valueField], effectiveRange.min, effectiveRange.max, palette),
    }),
    onEachFeature: (feature, layer) => {
      const value = feature.properties[valueField];
      layer.bindTooltip(
        `<div class="heat-tooltip">${tooltipLabel}: ${Number(value).toFixed(1)} C</div>`,
        { sticky: false },
      );
    },
  });
}

function createBoundaryCasingLayer(geojson) {
  return L.geoJSON(geojson, {
    pane: "soi-boundary-casing",
    interactive: false,
    style: {
      color: "#f6f2e8",
      weight: 6,
      opacity: 0.98,
      fillOpacity: 0,
      lineJoin: "round",
    },
  });
}

function createBoundaryOutlineLayer(geojson) {
  return L.geoJSON(geojson, {
    pane: "soi-outline",
    interactive: false,
    style: {
      color: "#762317",
      weight: 2.25,
      opacity: 0.95,
      fillOpacity: 0,
      lineJoin: "round",
    },
  });
}

function updateFilter() {
  if (!activeCityLayer) return;
  
  const tMin = parseFloat(tempMinInput.value);
  const tMax = parseFloat(tempMaxInput.value);
  tempValDisplay.textContent = `${tMin} - ${tMax}°C`;
  
  if (activeCityLayer) {
    map.removeLayer(activeCityLayer);
    activeCityLayer = createLayer(currentGeojson, currentValueField, manifest.palette, "LST", currentRange);
    activeCityLayer.addTo(map);
  }

  renderLegend();
}

tempMinInput?.addEventListener("input", updateFilter);
tempMaxInput?.addEventListener("input", updateFilter);

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

async function loadApiConfig() {
  try {
    return await loadJson("data/api-config.json");
  } catch (error) {
    return {};
  }
}

function normalizeApiBase(value) {
  if (!value) return "";
  return String(value).replace(/\/+$/, "");
}

function setLiveState(target) {
  isLive = true;
  apiBase = target;
  if (liveIndicator) liveIndicator.style.display = "block";
  if (filterControls) filterControls.style.display = "flex";
  analyzeBtn.textContent = "Get Heatmap";
  analyzeBtn.onclick = requestLiveHeatmapForCenter;
}

function setOfflineState() {
  isLive = false;
  if (filterControls) filterControls.style.display = "none";
  analyzeBtn.textContent = "Get Heatmap (Offline)";
  analyzeBtn.onclick = requestLiveHeatmapForCenter;
}

async function buildLiveTargets() {
  const apiConfig = await loadApiConfig();
  return [...new Set([
    normalizeApiBase(window.HEATMAP_API_BASE),
    normalizeApiBase(apiConfig.api_base),
    "",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
  ].filter(Boolean))];
}

async function probeLiveTarget(target) {
  console.log(`Checking live server at ${target}/api/ping...`);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), liveCheckTimeoutMs);
  try {
    const res = await fetch(`${target}/api/ping`, { signal: controller.signal });
    return res.ok;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function checkLiveServer() {
  configuredTargets = await buildLiveTargets();
  
  for (const target of configuredTargets) {
    try {
      if (await probeLiveTarget(target)) {
        setLiveState(target);
        console.log(`Live GEE server found at ${target}`);
        return true;
      }
    } catch (e) {
      // Continue to next target
    }
  }
  
  setOfflineState();
  return false;
}

async function ensureLiveServer() {
  if (isLive) return true;

  if (configuredTargets.length === 0) {
    configuredTargets = await buildLiveTargets();
  }

  setStatus("Checking live backend. The model can take a couple of minutes to load when first fired up.");
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Checking...";
  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      for (const target of configuredTargets) {
        try {
          if (await probeLiveTarget(target)) {
            setLiveState(target);
            return true;
          }
        } catch (error) {
          // Retry the next target or attempt.
        }
      }
    }

    setOfflineState();
    setStatus("Live backend is unavailable right now or still warming up. The model can take a couple of minutes to load when first fired up.");
    return false;
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = isLive ? "Get Heatmap" : "Get Heatmap (Offline)";
  }
}

async function fetchLiveHeatmap(lat, lon, name) {
  setStatus(`Requesting live GEE data for ${name}...`);
  const url = `${apiBase}/api/city-heat?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name)}`;
  const response = await fetch(url);
  if (!response.ok) {
    let detail = "Live API failed";
    try {
      const payload = await response.json();
      detail = payload.detail || detail;
    } catch (error) {
      // Fall back to the generic message when the response body is not JSON.
    }
    throw new Error(detail);
  }
  return response.json();
}

async function requestLiveHeatmapForPoint(lat, lon) {
  if (!(await ensureLiveServer())) return;
  try {
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Computing...";
    const data = await fetchLiveHeatmap(lat, lon, `Point (${lat.toFixed(2)}, ${lon.toFixed(2)})`);
    renderDetailLayer(data.geojson, data.metadata, "Custom Selection");
  } catch (err) {
    setStatus(`Live computation failed: ${err.message}`);
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Get Heatmap";
  }
}

async function requestLiveHeatmapForCenter() {
  if (!(await ensureLiveServer())) return;
  const center = map.getCenter();
  await requestLiveHeatmapForPoint(center.lat, center.lng);
}

function renderDetailLayer(geojson, metadata, name) {
  if (activeCityLayer) map.removeLayer(activeCityLayer);

  currentRange = getValueRange(geojson, "lst_c");
  activeCityLayer = createLayer(geojson, "lst_c", manifest.palette, "LST", currentRange);
  activeCityLayer.addTo(map);
  renderLegend();
  const bounds = activeCityLayer.getBounds?.();
  if (bounds && bounds.isValid()) {
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 13 });
  }
  setStatus(`${name} | ${metadata.source} | ${metadata.scene_date}`);
}

async function resetToIndia() {
  if (activeCityLayer) {
    map.removeLayer(activeCityLayer);
    activeCityLayer = null;
  }
  if (selectedPointMarker) {
    map.removeLayer(selectedPointMarker);
    selectedPointMarker = null;
  }
  if (clearSelectionBtn) clearSelectionBtn.style.display = "none";
  
  if (tempMinInput) tempMinInput.value = 0;
  if (tempMaxInput) tempMaxInput.value = 60;
  if (tempValDisplay) tempValDisplay.textContent = "0 - 60°C";
  clearLegend();
  map.fitBounds(neutralIndiaBounds, { padding: [24, 24] });
  
  if (isLive) {
      analyzeBtn.textContent = "Get Heatmap";
      analyzeBtn.onclick = requestLiveHeatmapForCenter;
  } else {
      analyzeBtn.textContent = "Get Heatmap (Offline)";
      analyzeBtn.onclick = () => alert("Start the live server and visit http://localhost:8080");
  }
  setStatus("Choose a point and request a heatmap. Official India boundary overlay active. National baseline hidden.");
}

async function initialize() {
  await checkLiveServer();
  
  manifest = await loadJson("data/site.json");
  const soiBoundaryGeojson = await loadJson("data/soi-india-boundary.geojson");

  soiBoundaryCasingLayer = createBoundaryCasingLayer(soiBoundaryGeojson);
  soiOutlineLayer = createBoundaryOutlineLayer(soiBoundaryGeojson);
  soiBoundaryCasingLayer.addTo(map);
  soiOutlineLayer.addTo(map);
  map.fitBounds(neutralIndiaBounds, { padding: [24, 24] });
  setStatus("Choose a point and request a heatmap. Official India boundary overlay active. National baseline hidden.");
}

resetButton?.addEventListener("click", () => {
  resetToIndia().catch(() => {
    setStatus("Unable to reset map");
  });
});

initialize().catch((error) => {
  setStatus(`Map failed to load: ${error.message}`);
});
