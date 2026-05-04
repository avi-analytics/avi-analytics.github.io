(function () {
  // Live wiring: use a local manifest whose entries are signed R2 URLs.
  window.ELECTION_ID = window.ELECTION_ID || "2026_RESULTS";
  window.ELECTION_DATA_MANIFEST_URL =
    window.ELECTION_DATA_MANIFEST_URL || "data/config/r2-live-manifest.json";
  window.REGIONAL_GROUPS_CONFIG_URL =
    window.REGIONAL_GROUPS_CONFIG_URL || "data/config/regional-group-definitions.json";
  window.R2_PUBLIC_URL = window.R2_PUBLIC_URL || "";
})();
