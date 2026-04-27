const statusNode = document.getElementById("map-status");
const resetButton = document.getElementById("reset-view");
const clearSelectionBtn = document.getElementById("clear-selection");
const liveIndicator = document.getElementById("live-indicator");
const analyzeBtn = document.getElementById("analyze-btn");
const filterControls = document.getElementById("filter-controls");
const tempMinInput = document.getElementById("temp-min");
const tempMaxInput = document.getElementById("temp-max");
const tempValDisplay = document.getElementById("temp-val-display");

const map = L.map("map", {
  zoomControl: true,
  minZoom: 4,
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let manifest;
let nationalMeta;
let nationalLayer;
let cityIndexLayer;
let activeCityLayer;
let selectedPointMarker;
let currentGeojson;
let currentValueField;
let isLive = false;
let apiBase = "";
const liveCheckTimeoutMs = 5000;

map.on("click", (e) => {
  if (!isLive) return;
  
  if (selectedPointMarker) {
    selectedPointMarker.setLatLng(e.latlng);
  } else {
    selectedPointMarker = L.marker(e.latlng).addTo(map);
  }
  
  if (clearSelectionBtn) clearSelectionBtn.style.display = "inline-block";
  setStatus(`Point selected: ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}. Click 'Get Heatmap' to analyze.`);
  analyzeBtn.onclick = () => requestLiveHeatmapForPoint(e.latlng.lat, e.latlng.lng);
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
  if (nationalLayer && !map.hasLayer(nationalLayer)) {
    nationalLayer.addTo(map);
  }
  if (clearSelectionBtn) clearSelectionBtn.style.display = "none";
  
  if (isLive) {
    analyzeBtn.onclick = requestLiveHeatmapForCenter;
  }
  setStatus("Selection cleared.");
}

clearSelectionBtn?.addEventListener("click", clearSelection);

function setStatus(message) {
  if (statusNode) {
    statusNode.textContent = message;
  }
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

function createLayer(geojson, valueField, palette, tooltipLabel) {
  currentGeojson = geojson;
  currentValueField = valueField;
  
  const tMin = tempMinInput ? parseFloat(tempMinInput.value) : -100;
  const tMax = tempMaxInput ? parseFloat(tempMaxInput.value) : 200;

  const values = geojson.features
    .map((feature) => feature.properties[valueField])
    .filter((value) => typeof value === "number");
  
  if (values.length === 0) return L.geoJSON(geojson);

  const min = Math.min(...values);
  const max = Math.max(...values);

  return L.geoJSON(geojson, {
    filter: (feature) => {
      const val = feature.properties[valueField];
      return val >= tMin && val <= tMax;
    },
    style: (feature) => ({
      stroke: false,
      fillOpacity: 0.45,
      fillColor: toColor(feature.properties[valueField], min, max, palette),
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

function updateFilter() {
  if (!activeCityLayer && !nationalLayer) return;
  
  const tMin = parseFloat(tempMinInput.value);
  const tMax = parseFloat(tempMaxInput.value);
  tempValDisplay.textContent = `${tMin} - ${tMax}°C`;
  
  if (activeCityLayer) {
    map.removeLayer(activeCityLayer);
    activeCityLayer = createLayer(currentGeojson, currentValueField, manifest.palette, "LST");
    activeCityLayer.addTo(map);
  } else if (nationalLayer) {
    map.removeLayer(nationalLayer);
    nationalLayer = createLayer(currentGeojson, currentValueField, manifest.palette, "Temp");
    nationalLayer.addTo(map);
  }
}

tempMinInput?.addEventListener("input", updateFilter);
tempMaxInput?.addEventListener("input", updateFilter);

function createCityIndexLayer(geojson) {
  return L.geoJSON(geojson, {
    style: {
      color: "#8d2d1d",
      weight: 1,
      fillColor: "#8d2d1d",
      fillOpacity: 0.05,
    },
    onEachFeature: (feature, layer) => {
      layer.bindTooltip(`City: ${feature.properties.name}`);
      layer.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        map.fitBounds(layer.getBounds());
        setStatus(`Viewing ${feature.properties.name}. Click 'Get Heatmap' to analyze.`);
        
        if (!isLive) {
           analyzeBtn.textContent = "Load Baseline";
           analyzeBtn.onclick = () => loadStaticCityLayer(feature);
        }
      });
    },
  });
}

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

async function checkLiveServer() {
  const apiConfig = await loadApiConfig();
  const configuredTargets = [
    normalizeApiBase(window.HEATMAP_API_BASE),
    normalizeApiBase(apiConfig.api_base),
  ].filter(Boolean);
  const targets = [...new Set([
    ...configuredTargets,
    "",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
  ])];
  
  for (const target of targets) {
    try {
      console.log(`Checking live server at ${target}/api/ping...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), liveCheckTimeoutMs);
      const res = await fetch(`${target}/api/ping`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        isLive = true;
        apiBase = target;
        if (liveIndicator) liveIndicator.style.display = "block";
        if (filterControls) filterControls.style.display = "flex";
        analyzeBtn.textContent = "Get Heatmap";
        analyzeBtn.onclick = requestLiveHeatmapForCenter;
        console.log(`Live GEE server found at ${target}`);
        return;
      }
    } catch (e) {
      // Continue to next target
    }
  }
  
  isLive = false;
  if (filterControls) filterControls.style.display = "none";
  analyzeBtn.textContent = "Get Heatmap (Offline)";
  analyzeBtn.onclick = () => {
      alert("Live mode is offline. To enable: run python backend/app.py and visit the deployed backend URL.");
  };
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
  if (!isLive) return;
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
  if (!isLive) return;
  const center = map.getCenter();
  await requestLiveHeatmapForPoint(center.lat, center.lng);
}

async function loadStaticCityLayer(feature) {
  const name = feature.properties.name;
  const slug = feature.properties.slug;
  const metadataPath = `data/cities/${slug}.json`;
  const layerPath = `data/cities/${slug}.geojson`;

  try {
    const [metadata, geojson] = await Promise.all([loadJson(metadataPath), loadJson(layerPath)]);
    renderDetailLayer(geojson, metadata, name);
  } catch (error) {
    setStatus(`${name} | baseline unavailable`);
  }
}

function renderDetailLayer(geojson, metadata, name) {
  if (activeCityLayer) map.removeLayer(activeCityLayer);
  if (nationalLayer) map.removeLayer(nationalLayer);
  
  activeCityLayer = createLayer(geojson, "lst_c", manifest.palette, "LST");
  activeCityLayer.addTo(map);
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

  if (nationalLayer && !map.hasLayer(nationalLayer)) {
    nationalLayer.addTo(map);
  }
  if (cityIndexLayer) {
    map.fitBounds(cityIndexLayer.getBounds());
  }
  
  if (isLive) {
      analyzeBtn.textContent = "Get Heatmap";
      analyzeBtn.onclick = requestLiveHeatmapForCenter;
  } else {
      analyzeBtn.textContent = "Get Heatmap (Offline)";
      analyzeBtn.onclick = () => alert("Start the live server and visit http://localhost:8080");
  }
  setStatus(`${nationalMeta.source} | ${nationalMeta.observation_date}`);
}

async function initialize() {
  await checkLiveServer();
  
  manifest = await loadJson("data/site.json");
  nationalMeta = await loadJson(manifest.national_metadata);
  const [nationalGeojson, cityIndexGeojson] = await Promise.all([
    loadJson(manifest.national_layer),
    loadJson(manifest.city_index),
  ]);

  nationalLayer = createLayer(nationalGeojson, "temperature_c", manifest.palette, "Temp");
  cityIndexLayer = createCityIndexLayer(cityIndexGeojson);

  nationalLayer.addTo(map);
  cityIndexLayer.addTo(map);
  map.fitBounds(cityIndexLayer.getBounds());
  setStatus(`${nationalMeta.source} | ${nationalMeta.observation_date}`);
}

resetButton?.addEventListener("click", () => {
  resetToIndia().catch(() => {
    setStatus("Unable to reset map");
  });
});

initialize().catch((error) => {
  setStatus(`Map failed to load: ${error.message}`);
});
