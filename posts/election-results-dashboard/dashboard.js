(function () {
  const R2_PUBLIC_URL = String(window.R2_PUBLIC_URL || "").trim();
  const ELECTION_DATA_MANIFEST_URL = String(window.ELECTION_DATA_MANIFEST_URL || "").trim();
  const ELECTION_ID = window.ELECTION_ID || "2026_RESULTS";
  const DATA_LAYOUT_VERSION = "2026-05-03";
  const PARTY_MASTER_CONFIG = window.ELECTION_PARTY_MASTER || {
    parties: [],
    coalitions: [],
    states: {},
  };
  const RUNTIME_COALITION_CONFIG = window.ELECTION_COALITIONS || {
    tn: {},
    wb: {},
    as: {},
    kl: {},
    py: {},
  };

  const FIXTURE_URLS = {
    constituency: "data/testing/constituency_status.csv",
    party: "data/testing/party_summary.csv",
    partyHistory: "data/testing/party_summary_history.csv",
    candidateCurrent: {
      "S22-002": "data/testing/candidatewise_current_s22_002.csv",
      "S25-001": "data/testing/candidatewise_current_s25_001.csv",
      "S03-126": "data/testing/candidatewise_current_s03_126.csv",
    },
    candidateHistory: {
      "S22-002": "data/testing/candidatewise_history_s22_002.csv",
      "S25-001": "data/testing/candidatewise_history_s25_001.csv",
      "S03-126": "data/testing/candidatewise_history_s03_126.csv",
    },
  };

  const LEGACY_PARTY_DEFINITIONS = [
    {
      id: "party:BJP",
      shortLabel: "BJP",
      fullLabel: "Bharatiya Janata Party",
      color: "#f59e0b",
      aliases: ["BJP", "Bharatiya Janata Party"],
    },
    {
      id: "party:INC",
      shortLabel: "INC",
      fullLabel: "Indian National Congress",
      color: "#38bdf8",
      aliases: ["INC", "Indian National Congress", "Congress"],
    },
    {
      id: "party:AITC",
      shortLabel: "TMC",
      fullLabel: "All India Trinamool Congress",
      color: "#16a34a",
      aliases: ["AITC", "TMC", "All India Trinamool Congress", "Trinamool Congress"],
    },
    {
      id: "party:DMK",
      shortLabel: "DMK",
      fullLabel: "Dravida Munnetra Kazhagam",
      color: "#b42318",
      aliases: ["DMK", "Dravida Munnetra Kazhagam"],
    },
    {
      id: "party:AIADMK",
      shortLabel: "AIADMK",
      fullLabel: "All India Anna Dravida Munnetra Kazhagam",
      color: "#138808",
      aliases: ["ADMK", "AIADMK", "All India Anna Dravida Munnetra Kazhagam"],
    },
    {
      id: "party:AGP",
      shortLabel: "AGP",
      fullLabel: "Asom Gana Parishad",
      color: "#166534",
      aliases: ["AGP", "Asom Gana Parishad"],
    },
    {
      id: "party:AIUDF",
      shortLabel: "AIUDF",
      fullLabel: "All India United Democratic Front",
      color: "#0f766e",
      aliases: ["AIUDF", "All India United Democratic Front"],
    },
    {
      id: "party:BSP",
      shortLabel: "BSP",
      fullLabel: "Bahujan Samaj Party",
      color: "#2563eb",
      aliases: ["BSP", "Bahujan Samaj Party"],
    },
    {
      id: "party:CPI",
      shortLabel: "CPI",
      fullLabel: "Communist Party of India",
      color: "#dc2626",
      aliases: ["CPI", "Communist Party of India"],
    },
    {
      id: "party:CPI(M)",
      shortLabel: "CPI(M)",
      fullLabel: "Communist Party of India (Marxist)",
      color: "#b91c1c",
      aliases: ["CPM", "CPIM", "CPI(M)", "Communist Party of India (Marxist)"],
    },
    {
      id: "party:IUML",
      shortLabel: "IUML",
      fullLabel: "Indian Union Muslim League",
      color: "#006633",
      aliases: ["IUML", "Indian Union Muslim League"],
    },
    {
      id: "party:KC",
      shortLabel: "KC",
      fullLabel: "Kerala Congress",
      color: "#003366",
      aliases: ["KC", "Kerala Congress"],
    },
  ];

  const LEGACY_COALITION_DEFINITIONS = [
    {
      id: "coalition:NDA",
      shortLabel: "NDA",
      fullLabel: "National Democratic Alliance",
      color: "#f59e0b",
      aliases: ["NDA", "National Democratic Alliance"],
    },
    {
      id: "coalition:UPA",
      shortLabel: "UPA",
      fullLabel: "United Progressive Alliance",
      color: "#38bdf8",
      aliases: ["UPA", "United Progressive Alliance"],
    },
    {
      id: "coalition:INDIA",
      shortLabel: "INDIA",
      fullLabel: "Indian National Developmental Inclusive Alliance",
      color: "#38bdf8",
      aliases: ["INDIA", "I.N.D.I.A.", "Indian National Developmental Inclusive Alliance"],
    },
    {
      id: "coalition:LDF",
      shortLabel: "LDF",
      fullLabel: "Left Democratic Front",
      color: "#dc2626",
      aliases: ["LDF", "Left Democratic Front"],
    },
    {
      id: "coalition:UDF",
      shortLabel: "UDF",
      fullLabel: "United Democratic Front",
      color: "#38bdf8",
      aliases: ["UDF", "United Democratic Front"],
    },
  ];

  const EXTRA_PARTY_ALIASES = {
    "party:AITC": ["TMC", "Trinamool Congress"],
    "party:AIADMK": ["ADMK"],
    "party:CPI(M)": ["CPIM", "CPM"],
    "party:INC": ["Congress"],
  };
  const PARTY_COLOR_OVERRIDES = {
    TVK: "#e11d48",
    IND: "#334155",
    Independent: "#334155",
    Independents: "#334155",
  };
  const EXTRA_COALITION_ALIASES = {
    "coalition:INDIA": ["I.N.D.I.A."],
  };

  const CHART_PALETTE = [
    "#0d3b66",
    "#d97706",
    "#0f766e",
    "#7c3aed",
    "#be123c",
    "#2563eb",
    "#15803d",
    "#9333ea",
  ];

  const STATE_CONFIGS = {
    tn: {
      key: "tn",
      code: "S22",
      name: "Tamil Nadu",
      seatCount: 234,
      color: "#c2410c",
      mapDataKey: "TN_MAP_DATA",
      mapScriptUrl: "data/geo/tamil-nadu-ac.js",
    },
    wb: {
      key: "wb",
      code: "S25",
      name: "West Bengal",
      seatCount: 294,
      color: "#1d4ed8",
      mapDataKey: "WB_MAP_DATA",
      mapScriptUrl: "data/geo/west-bengal-ac.js",
    },
    as: {
      key: "as",
      code: "S03",
      name: "Assam",
      seatCount: 126,
      color: "#0f766e",
      mapDataKey: "AS_MAP_DATA",
      mapScriptUrl: "data/geo/assam-ac.js",
    },
    kl: {
      key: "kl",
      code: "S11",
      name: "Kerala",
      seatCount: 140,
      color: "#1e3a8a",
      mapDataKey: "KL_MAP_DATA",
      mapScriptUrl: "data/geo/kerala-ac.js",
    },
    py: {
      key: "py",
      code: "U07",
      name: "Puducherry",
      seatCount: 30,
      color: "#6d28d9",
      mapDataKey: "PY_MAP_DATA",
      mapScriptUrl: "data/geo/puducherry-ac.js",
    },
  };

  const STATE_NAME_TO_KEY = {
    assam: "as",
    "tamil nadu": "tn",
    "west bengal": "wb",
    kerala: "kl",
    puducherry: "py",
  };

  const STATE_CODE_TO_KEY = Object.values(STATE_CONFIGS).reduce((acc, config) => {
    acc[config.code] = config.key;
    return acc;
  }, {});
  const ENTITY_REGISTRY = buildEntityRegistry(PARTY_MASTER_CONFIG);
  const RUNTIME_COALITION_PARTY_MAP = buildRuntimeCoalitionPartyMap(
    RUNTIME_COALITION_CONFIG,
    ENTITY_REGISTRY
  );

  const FIXTURE_PARAM = "data";
  const svgNs = "http://www.w3.org/2000/svg";
  const SEAT_TREND_SERIES_LIMIT = 6;
  const CANDIDATE_SERIES_LIMIT = 5;
  const REGIONAL_GROUP_SERIES_LIMIT = 6;
  const LIVE_AUTO_REFRESH_INTERVAL_MS = 60 * 1000;
  const mapDataPromises = {};
  const REGIONAL_GROUP_COLORS = [
    { fill: "#fef3c7", stroke: "#d97706" },
    { fill: "#dbeafe", stroke: "#2563eb" },
    { fill: "#dcfce7", stroke: "#16a34a" },
    { fill: "#fce7f3", stroke: "#db2777" },
    { fill: "#ede9fe", stroke: "#7c3aed" },
    { fill: "#ffe4e6", stroke: "#e11d48" },
  ];
  const REGIONAL_GROUPS_CONFIG_URL =
    String(window.REGIONAL_GROUPS_CONFIG_URL || "data/config/regional-group-definitions.json").trim();
  const REGIONAL_GROUP_DEFINITIONS = {};
  const IST_TIMEZONE = "Asia/Kolkata";

  let activeStateKey = "tn";
  let activePath = null;
  let constituencyRows = [];
  let partyRows = [];
  let dataApi = null;
  let selectedConstituency = null;
  let seatTrendMetric = "total";
  let seatTrendGrouping = "party";
  let activeViewTab = "overview";
  let activeRegionalGroupingKey = "";
  let isRefreshingData = false;
  let liveAutoRefreshTimer = null;
  let regionalGroupDefinitionsLoaded = false;
  let regionalGroupDefinitionsPromise = null;

  const statePartyHistoryCache = {};
  const statePartyHistoryPromises = {};
  const statewideHistoryCache = {};
  const statewideHistoryPromises = {};
  const candidateDataCache = {};
  const candidateDataPromises = {};
  const candidateCurrentCache = {};
  const candidateCurrentPromises = {};
  const stateAnalyticsCache = {};
  const stateAnalyticsPromises = {};

  function getStateConfig(stateKey) {
    return STATE_CONFIGS[stateKey];
  }

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .replace(/\s+/g, " ");
  }

  function normalizeAliasExact(value) {
    return normalizeText(value).toUpperCase();
  }

  function normalizeAliasLoose(value) {
    return normalizeAliasExact(value).replace(/[^A-Z0-9]/g, "");
  }

  function createRegistryStateRecord() {
    return {
      partyToCoalition: {},
      coalitions: {},
    };
  }

  function addAliasLookup(registry, alias, entityId, type) {
    const exact = normalizeAliasExact(alias);
    const loose = normalizeAliasLoose(alias);
    if (!exact) return;

    registry.exactAliases.all[exact] = registry.exactAliases.all[exact] || entityId;
    registry.exactAliases[type][exact] = registry.exactAliases[type][exact] || entityId;

    if (loose) {
      registry.looseAliases.all[loose] = registry.looseAliases.all[loose] || new Set();
      registry.looseAliases[type][loose] = registry.looseAliases[type][loose] || new Set();
      registry.looseAliases.all[loose].add(entityId);
      registry.looseAliases[type][loose].add(entityId);
    }
  }

  function deriveEntityAliases(type, shortLabel, fullLabel) {
    const aliases = [];
    const label = normalizeText(fullLabel);
    if (type !== "coalition" || !label) {
      return aliases;
    }

    label
      .split("/")
      .map((part) => normalizeText(part))
      .filter((part) => part && part.toLowerCase() !== "none")
      .forEach((part) => aliases.push(part));

    const ledMatch = label.match(/^(.+?)-led alliance$/i);
    if (ledMatch && normalizeText(ledMatch[1])) {
      aliases.push(normalizeText(ledMatch[1]));
    }

    const supportedMatch = label.match(/^(.+?)\s+supported$/i);
    if (supportedMatch && normalizeText(supportedMatch[1])) {
      aliases.push(normalizeText(supportedMatch[1]));
    }

    if (shortLabel && /\+$/.test(shortLabel)) {
      aliases.push(shortLabel.replace(/\+$/, ""));
    }

    return aliases;
  }

  function buildRegistryId(type, value) {
    const base = normalizeAliasExact(value);
    if (!base) return "";
    return `${type}:${base}`;
  }

  function resolveEntityIdFromRegistry(registry, value, preferredType) {
    const exact = normalizeAliasExact(value);
    if (!exact) return "";

    const directId = registry.entitiesById[exact] ? exact : "";
    if (directId) {
      return directId;
    }

    const exactByType = preferredType ? registry.exactAliases[preferredType][exact] : "";
    if (exactByType) {
      return exactByType;
    }

    const exactAny = registry.exactAliases.all[exact];
    if (exactAny) {
      return exactAny;
    }

    const loose = normalizeAliasLoose(value);
    if (!loose) return "";

    const looseByType = preferredType ? registry.looseAliases[preferredType][loose] : null;
    if (looseByType && looseByType.size === 1) {
      return [...looseByType][0];
    }

    const looseAny = registry.looseAliases.all[loose];
    if (looseAny && looseAny.size === 1) {
      return [...looseAny][0];
    }

    return "";
  }

  function registerEntity(registry, definition, type, extraAliases) {
    const explicitId = normalizeText(definition && definition.id);
    const shortLabel = normalizeText(definition && definition.shortLabel);
    const fullLabel = normalizeText(definition && definition.fullLabel);
    const registryId = explicitId || buildRegistryId(type, shortLabel || fullLabel);
    if (!registryId) return;

    const aliases = new Set(
      []
        .concat(definition && Array.isArray(definition.aliases) ? definition.aliases : [])
        .concat(shortLabel ? [shortLabel] : [])
        .concat(fullLabel ? [fullLabel] : [])
        .concat(extraAliases && extraAliases[registryId] ? extraAliases[registryId] : [])
        .concat(deriveEntityAliases(type, shortLabel, fullLabel))
    );

    const existing = registry.entitiesById[registryId] || {
      id: registryId,
      type,
      shortLabel: "",
      fullLabel: "",
      color: "",
      aliases: [],
    };

    existing.shortLabel = existing.shortLabel || shortLabel || fullLabel;
    existing.fullLabel = existing.fullLabel || fullLabel || shortLabel;
    existing.color = existing.color || normalizeText(definition && definition.color);
    existing.type = type;

    const aliasSet = new Set(existing.aliases || []);
    aliasSet.add(registryId);
    aliases.forEach((alias) => {
      if (normalizeText(alias)) {
        aliasSet.add(normalizeText(alias));
      }
    });
    existing.aliases = [...aliasSet];
    registry.entitiesById[registryId] = existing;

    existing.aliases.forEach((alias) => {
      addAliasLookup(registry, alias, registryId, type);
    });
  }

  function buildEntityRegistry(masterConfig) {
    const registry = {
      entitiesById: {},
      exactAliases: {
        party: {},
        coalition: {},
        all: {},
      },
      looseAliases: {
        party: {},
        coalition: {},
        all: {},
      },
      states: {},
    };

    LEGACY_PARTY_DEFINITIONS.forEach((definition) => {
      registerEntity(registry, definition, "party", EXTRA_PARTY_ALIASES);
    });
    LEGACY_COALITION_DEFINITIONS.forEach((definition) => {
      registerEntity(registry, definition, "coalition", EXTRA_COALITION_ALIASES);
    });

    (masterConfig.parties || []).forEach((party) => {
      registerEntity(
        registry,
        {
          id: buildRegistryId("party", party.id || party.shortLabel || party.fullLabel),
          shortLabel: party.shortLabel,
          fullLabel: party.fullLabel,
          aliases: party.aliases,
        },
        "party",
        EXTRA_PARTY_ALIASES
      );
    });

    (masterConfig.coalitions || []).forEach((coalition) => {
      registerEntity(
        registry,
        {
          id: buildRegistryId("coalition", coalition.id || coalition.shortLabel || coalition.fullLabel),
          shortLabel: coalition.shortLabel,
          fullLabel: coalition.fullLabel,
          aliases: coalition.aliases,
        },
        "coalition",
        EXTRA_COALITION_ALIASES
      );
    });

    Object.entries(masterConfig.states || {}).forEach(([stateKey, stateConfig]) => {
      const stateRecord = createRegistryStateRecord();
      Object.entries((stateConfig && stateConfig.partyToCoalition) || {}).forEach(([partyValue, coalitionValue]) => {
        const partyId = resolveEntityIdFromRegistry(registry, partyValue, "party");
        const coalitionId = resolveEntityIdFromRegistry(registry, coalitionValue, "coalition");
        if (partyId && coalitionId) {
          stateRecord.partyToCoalition[partyId] = coalitionId;
        }
      });

      Object.entries((stateConfig && stateConfig.coalitions) || {}).forEach(([coalitionValue, coalitionConfig]) => {
        const coalitionId = resolveEntityIdFromRegistry(registry, coalitionValue, "coalition");
        if (!coalitionId) return;
        const members = ((coalitionConfig && coalitionConfig.members) || [])
          .map((partyValue) => resolveEntityIdFromRegistry(registry, partyValue, "party"))
          .filter(Boolean);
        stateRecord.coalitions[coalitionId] = {
          members,
        };
        members.forEach((partyId) => {
          stateRecord.partyToCoalition[partyId] = coalitionId;
        });
      });

      registry.states[stateKey] = stateRecord;
    });

    return registry;
  }

  function buildRuntimeCoalitionPartyMap(runtimeConfig, registry) {
    return Object.keys(STATE_CONFIGS).reduce((acc, stateKey) => {
      const stateMap = {};
      const definitions = runtimeConfig[stateKey] || {};
      Object.entries(definitions).forEach(([coalitionValue, configValue]) => {
        const coalitionId =
          resolveEntityIdFromRegistry(registry, coalitionValue, "coalition") || normalizeText(coalitionValue);
        const parties = Array.isArray(configValue) ? configValue : (configValue && configValue.parties) || [];
        parties
          .map((partyValue) => resolveEntityIdFromRegistry(registry, partyValue, "party"))
          .filter(Boolean)
          .forEach((partyId) => {
            stateMap[partyId] = coalitionId;
          });
      });
      acc[stateKey] = stateMap;
      return acc;
    }, {});
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return entities[char] || char;
    });
  }

  function getCanonicalPartyId(value) {
    return resolveEntityIdFromRegistry(ENTITY_REGISTRY, value, "party") || normalizeText(value);
  }

  function getPartyStyle(value) {
    const canonicalId = resolveEntityIdFromRegistry(ENTITY_REGISTRY, value, "party") || normalizeText(value);
    const known = ENTITY_REGISTRY.entitiesById[canonicalId];
    if (known) {
      return {
        canonicalId,
        type: known.type,
        shortLabel: known.shortLabel,
        fullLabel: known.fullLabel,
        color: known.color || PARTY_COLOR_OVERRIDES[canonicalId] || PARTY_COLOR_OVERRIDES[known.shortLabel] || "",
      };
    }
    const fallback = normalizeText(value) || canonicalId;
    return {
      canonicalId,
      type: "party",
      shortLabel: fallback,
      fullLabel: fallback,
      color: PARTY_COLOR_OVERRIDES[canonicalId] || PARTY_COLOR_OVERRIDES[fallback] || "",
    };
  }

  function isEffectivelyWhite(hex) {
    const normalized = String(hex || "").trim().toLowerCase();
    return !normalized || normalized === "#fff" || normalized === "#ffffff" || normalized === "white";
  }

  function getPartyColor(value, fallback) {
    const partyStyle = getPartyStyle(value);
    if (partyStyle.color && !isEffectivelyWhite(partyStyle.color)) {
      return partyStyle.color;
    }
    if (fallback && !isEffectivelyWhite(fallback)) {
      return fallback;
    }
    return "#0d3b66";
  }

  function getPartyDisplayLabel(value) {
    return getPartyStyle(value).shortLabel;
  }

  function getPartyFullLabel(value) {
    return getPartyStyle(value).fullLabel;
  }

  function getCoalitionStyle(value) {
    const fallback = normalizeText(value);
    const canonicalId = resolveEntityIdFromRegistry(ENTITY_REGISTRY, value, "coalition") || fallback;
    if (!canonicalId) {
      return { canonicalId: "", shortLabel: "", fullLabel: "", color: "" };
    }
    const known = ENTITY_REGISTRY.entitiesById[canonicalId];
    if (known) {
      return {
        canonicalId,
        shortLabel: known.shortLabel,
        fullLabel: known.fullLabel,
        color: known.color,
      };
    }
    return {
      canonicalId,
      shortLabel: fallback || canonicalId,
      fullLabel: fallback || canonicalId,
      color: "",
    };
  }

  function renderPartyLabelMarkup(value) {
    const shortLabel = getPartyDisplayLabel(value);
    const fullLabel = getPartyFullLabel(value);
    const titleAttr =
      fullLabel && fullLabel !== shortLabel ? ` title="${escapeHtml(fullLabel)}"` : "";
    return [
      `<span class="party-text"${titleAttr}>`,
      `<span class="party-cell-short">${escapeHtml(shortLabel || "-")}</span>`,
      "</span>",
    ].join("");
  }

  function normalizeStateKey(value) {
    const text = normalizeText(value);
    if (!text) return null;
    return STATE_CODE_TO_KEY[text.toUpperCase()] || STATE_NAME_TO_KEY[text.toLowerCase()] || null;
  }

  function normalizeNumberString(value) {
    const raw = normalizeText(value);
    if (!raw) return "";
    const digits = raw.match(/\d+/g);
    return digits ? digits.join("") : raw;
  }

  function flattenArrays(items, mapper) {
    return items.reduce((acc, item, index) => {
      const mapped = mapper ? mapper(item, index) : item;
      if (Array.isArray(mapped)) {
        return acc.concat(mapped);
      }
      acc.push(mapped);
      return acc;
    }, []);
  }

  function getSearchParamValue(name) {
    if (typeof URLSearchParams === "function") {
      const params = new URLSearchParams(window.location.search);
      return params.get(name);
    }

    const query = String(window.location.search || "").replace(/^\?/, "");
    if (!query) return null;

    const pairs = query.split("&");
    for (let index = 0; index < pairs.length; index += 1) {
      const pair = pairs[index];
      if (!pair) continue;
      const parts = pair.split("=");
      const key = decodeURIComponent(parts[0] || "");
      if (key !== name) continue;
      return decodeURIComponent((parts[1] || "").replace(/\+/g, " "));
    }

    return null;
  }

  function padConstituencyNo(value) {
    const digits = normalizeNumberString(value);
    return digits ? digits.padStart(3, "0") : "";
  }

  function toNumber(value) {
    const digits = normalizeNumberString(value);
    return digits ? Number(digits) : 0;
  }

  function getCoalitionValue(record) {
    return firstNonEmpty(record, [
      "Coalition",
      "coalition",
      "Coalition_Name",
      "coalition_name",
      "Coalition_Abbr",
      "coalition_abbr",
      "Alliance",
      "alliance",
      "Alliance_Name",
      "alliance_name",
      "Alliance_Abbr",
      "alliance_abbr",
      "Front",
      "front",
      "Front_Name",
      "front_name",
      "Front_Abbr",
      "front_abbr",
    ]);
  }

  function inferCoalitionId(stateKey, partyId) {
    if (!stateKey || !partyId) return "";
    return (
      (RUNTIME_COALITION_PARTY_MAP[stateKey] && RUNTIME_COALITION_PARTY_MAP[stateKey][partyId]) ||
      (ENTITY_REGISTRY.states[stateKey] &&
        ENTITY_REGISTRY.states[stateKey].partyToCoalition &&
        ENTITY_REGISTRY.states[stateKey].partyToCoalition[partyId]) ||
      ""
    );
  }

  function buildObjectKey() {
    return Array.from(arguments)
      .map((part) => normalizeText(part).replace(/^\/+|\/+$/g, ""))
      .filter(Boolean)
      .join("/");
  }

  function joinUrl(baseUrl, path) {
    const base = String(baseUrl || "").replace(/\/+$/g, "");
    const suffix = String(path || "").replace(/^\/+/g, "");
    if (!base) return suffix;
    if (!suffix) return base;
    return `${base}/${suffix}`;
  }

  function createDatasetRef(prefix) {
    return {
      current_key: buildObjectKey(prefix, "current.csv"),
      history_key: buildObjectKey(prefix, "history.csv"),
    };
  }

  function createDefaultManifest() {
    const rootPrefix = buildObjectKey("elections", ELECTION_ID);
    const states = Object.values(STATE_CONFIGS).reduce((acc, config) => {
      acc[config.code] = {
        state_name: config.name,
        state_code: config.code,
        dashboard_key: config.key,
        seat_count: config.seatCount,
        partywise: createDatasetRef(buildObjectKey(rootPrefix, "states", config.code, "partywise")),
        statewide_trends: createDatasetRef(
          buildObjectKey(rootPrefix, "states", config.code, "statewide-trends")
        ),
        constituencies_prefix: buildObjectKey(rootPrefix, "states", config.code, "constituencies"),
      };
      return acc;
    }, {});

    return {
      schema_version: DATA_LAYOUT_VERSION,
      election_id: ELECTION_ID,
      root_prefix: rootPrefix,
      summary: {
        partywise: createDatasetRef(buildObjectKey(rootPrefix, "summary", "partywise")),
        statewide_trends: createDatasetRef(buildObjectKey(rootPrefix, "summary", "statewide-trends")),
      },
      states,
      templates: {
        partywise_current: "elections/{election_id}/states/{state_code}/partywise/current.csv",
        partywise_history: "elections/{election_id}/states/{state_code}/partywise/history.csv",
        statewide_trends_current:
          "elections/{election_id}/states/{state_code}/statewide-trends/current.csv",
        statewide_trends_history:
          "elections/{election_id}/states/{state_code}/statewide-trends/history.csv",
        candidatewise_current:
          "elections/{election_id}/states/{state_code}/constituencies/{constituency_no_padded}/candidatewise/current.csv",
        candidatewise_history:
          "elections/{election_id}/states/{state_code}/constituencies/{constituency_no_padded}/candidatewise/history.csv",
        summary_partywise_current: "elections/{election_id}/summary/partywise/current.csv",
        summary_partywise_history: "elections/{election_id}/summary/partywise/history.csv",
        summary_statewide_trends_current:
          "elections/{election_id}/summary/statewide-trends/current.csv",
        summary_statewide_trends_history:
          "elections/{election_id}/summary/statewide-trends/history.csv",
      },
    };
  }

  function toAbsoluteUrl(baseUrl, key) {
    if (!key) return "";
    if (/^https?:\/\//i.test(key)) return key;
    return joinUrl(baseUrl, key);
  }

  function createElectionDataApi(baseUrl, manifest) {
    const resolvedManifest = manifest || createDefaultManifest();
    const rootUrl = joinUrl(baseUrl, resolvedManifest.root_prefix);
    const candidatewiseOverrides = resolvedManifest.candidatewise || {};

    function getStateCode(value) {
      const stateKey = STATE_CONFIGS[value] ? value : normalizeStateKey(value);
      return stateKey ? STATE_CONFIGS[stateKey].code : "";
    }

    function getStateKey(value) {
      if (STATE_CONFIGS[value]) return value;
      return normalizeStateKey(value);
    }

    function getSummaryUrl(datasetName, version) {
      const record = resolvedManifest.summary && resolvedManifest.summary[datasetName];
      return toAbsoluteUrl(baseUrl, record && record[`${version}_key`]);
    }

    function getStateDatasetUrl(stateCode, datasetName, version) {
      const stateRecord = resolvedManifest.states && resolvedManifest.states[stateCode];
      const datasetRecord = stateRecord && stateRecord[datasetName];
      return toAbsoluteUrl(baseUrl, datasetRecord && datasetRecord[`${version}_key`]);
    }

    function getCandidatewiseUrl(stateCode, constituencyNo, version) {
      const constituencySegment = padConstituencyNo(constituencyNo);
      const constituencyKey = `${stateCode}-${constituencySegment}`;
      const overrideRecord = candidatewiseOverrides[constituencyKey];
      if (overrideRecord && overrideRecord[`${version}_key`]) {
        return toAbsoluteUrl(baseUrl, overrideRecord[`${version}_key`]);
      }
      if (!baseUrl) {
        return "";
      }
      const key = buildObjectKey(
        resolvedManifest.root_prefix,
        "states",
        stateCode,
        "constituencies",
        constituencySegment,
        "candidatewise",
        `${version}.csv`
      );
      return toAbsoluteUrl(baseUrl, key);
    }

    return {
      mode: "live",
      schemaVersion: resolvedManifest.schema_version || DATA_LAYOUT_VERSION,
      electionId: resolvedManifest.election_id || ELECTION_ID,
      rootPrefix: resolvedManifest.root_prefix,
      rootUrl,
      manifest: resolvedManifest,
      getStateCode,
      getStateKey,
      getPartywiseCurrentUrl(stateCode) {
        return getStateDatasetUrl(stateCode, "partywise", "current");
      },
      getPartywiseHistoryUrl(stateCode) {
        return getStateDatasetUrl(stateCode, "partywise", "history");
      },
      getStatewideTrendsCurrentUrl(stateCode) {
        return getStateDatasetUrl(stateCode, "statewide_trends", "current");
      },
      getStatewideTrendsHistoryUrl(stateCode) {
        return getStateDatasetUrl(stateCode, "statewide_trends", "history");
      },
      getCandidatewiseCurrentUrl(stateCode, constituencyNo) {
        return getCandidatewiseUrl(stateCode, constituencyNo, "current");
      },
      getCandidatewiseHistoryUrl(stateCode, constituencyNo) {
        return getCandidatewiseUrl(stateCode, constituencyNo, "history");
      },
      summary: {
        partywise: {
          current: getSummaryUrl("partywise", "current"),
          history: getSummaryUrl("partywise", "history"),
        },
        statewideTrends: {
          current: getSummaryUrl("statewide_trends", "current"),
          history: getSummaryUrl("statewide_trends", "history"),
        },
      },
    };
  }

  function createFixtureDataApi() {
    return {
      mode: "fixture",
      schemaVersion: "fixture",
      electionId: ELECTION_ID,
      rootPrefix: "",
      rootUrl: "",
      manifest: null,
      getStateCode(value) {
        const stateKey = STATE_CONFIGS[value] ? value : normalizeStateKey(value);
        return stateKey ? STATE_CONFIGS[stateKey].code : "";
      },
      getStateKey(value) {
        if (STATE_CONFIGS[value]) return value;
        return normalizeStateKey(value);
      },
      getPartywiseCurrentUrl() {
        return FIXTURE_URLS.party;
      },
      getPartywiseHistoryUrl() {
        return FIXTURE_URLS.partyHistory;
      },
      getStatewideTrendsCurrentUrl() {
        return FIXTURE_URLS.constituency;
      },
      getStatewideTrendsHistoryUrl() {
        return "";
      },
      getCandidatewiseCurrentUrl(stateCode, constituencyNo) {
        return FIXTURE_URLS.candidateCurrent[`${stateCode}-${padConstituencyNo(constituencyNo)}`] || "";
      },
      getCandidatewiseHistoryUrl(stateCode, constituencyNo) {
        return FIXTURE_URLS.candidateHistory[`${stateCode}-${padConstituencyNo(constituencyNo)}`] || "";
      },
      summary: {
        partywise: { current: FIXTURE_URLS.party, history: FIXTURE_URLS.partyHistory },
        statewideTrends: { current: FIXTURE_URLS.constituency, history: "" },
      },
    };
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === "," && !inQuotes) {
        row.push(field);
        field = "";
        continue;
      }

      if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") {
          index += 1;
        }
        row.push(field);
        if (row.some((cell) => normalizeText(cell))) {
          rows.push(row);
        }
        row = [];
        field = "";
        continue;
      }

      field += char;
    }

    if (field.length || row.length) {
      row.push(field);
      if (row.some((cell) => normalizeText(cell))) {
        rows.push(row);
      }
    }

    if (!rows.length) {
      return [];
    }

    const headers = rows[0].map((header) => normalizeText(header));
    return rows.slice(1).map((values) =>
      headers.reduce((record, header, headerIndex) => {
        record[header] = normalizeText(values[headerIndex]);
        return record;
      }, {})
    );
  }

  function firstNonEmpty(record, keys) {
    for (const key of keys) {
      if (record[key] && normalizeText(record[key])) {
        return normalizeText(record[key]);
      }
    }
    return "";
  }

  function parseTimestamp(value) {
    const text = normalizeText(value);
    if (!text) return null;

    const naiveMatch = text.match(
      /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/
    );
    if (naiveMatch) {
      const year = Number(naiveMatch[1]);
      const month = Number(naiveMatch[2]);
      const day = Number(naiveMatch[3]);
      const hour = Number(naiveMatch[4] || 0);
      const minute = Number(naiveMatch[5] || 0);
      const second = Number(naiveMatch[6] || 0);
      const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
      return Number.isNaN(utcDate.getTime()) ? null : utcDate;
    }

    const isoLike = text.replace(" ", "T");
    const date = new Date(isoLike);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatTimeTick(timestampMs, context) {
    if (!Number.isFinite(timestampMs)) return "";
    const date = new Date(timestampMs);
    const showDate = context && Number.isFinite(context.xMin) && Number.isFinite(context.xMax)
      ? new Date(context.xMin).toLocaleDateString("en-IN", { timeZone: IST_TIMEZONE }) !==
        new Date(context.xMax).toLocaleDateString("en-IN", { timeZone: IST_TIMEZONE })
      : false;
    return date.toLocaleString("en-IN", {
      timeZone: IST_TIMEZONE,
      day: showDate ? "2-digit" : undefined,
      month: showDate ? "short" : undefined,
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDateTime(value) {
    const date = value instanceof Date ? value : parseTimestamp(value);
    if (!date) return normalizeText(value) || "-";
    return date.toLocaleString("en-IN", {
      timeZone: IST_TIMEZONE,
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("en-IN").format(Number(value || 0));
  }

  function formatPercent(value) {
    const numeric = Number(value || 0);
    return Number.isFinite(numeric) ? `${numeric.toFixed(2)}%` : "-";
  }

  function hasValidTimestamp(row) {
    return row && Number.isFinite(row.timestampMs) && row.timestampMs > 0;
  }

  function hasMeaningfulCandidateValue(row) {
    if (!row) return false;
    return (row.totalVotes || 0) > 0 || (row.evmVotes || 0) > 0 || (row.postalVotes || 0) > 0;
  }

  function getLatestTimestampGroup(rows, isMeaningfulRow) {
    const validRows = Array.isArray(rows) ? rows.filter(hasValidTimestamp) : [];
    if (!validRows.length) return [];

    const timestamps = [...new Set(validRows.map((row) => row.timestampMs))].sort((a, b) => b - a);
    for (const timestamp of timestamps) {
      const batch = validRows.filter((row) => row.timestampMs === timestamp);
      if (!isMeaningfulRow || batch.some((row) => isMeaningfulRow(row))) {
        return batch;
      }
    }

    const latestTimestamp = timestamps[0];
    return validRows.filter((row) => row.timestampMs === latestTimestamp);
  }

  function filterTimelineOutliers(times) {
    if (!Array.isArray(times) || times.length < 4) {
      return Array.isArray(times) ? times.slice() : [];
    }

    let filtered = times.slice();
    let changed = true;
    while (changed && filtered.length >= 4) {
      changed = false;
      const gaps = [];
      for (let index = 1; index < filtered.length; index += 1) {
        gaps.push(filtered[index] - filtered[index - 1]);
      }
      const positiveGaps = gaps.filter((gap) => Number.isFinite(gap) && gap > 0).sort((a, b) => a - b);
      if (!positiveGaps.length) {
        return filtered;
      }
      const medianGap = positiveGaps[Math.floor(positiveGaps.length / 2)];
      const threshold = Math.max(medianGap * 6, 20 * 60 * 1000);

      if (gaps[0] > threshold && (gaps[1] || 0) <= threshold) {
        filtered = filtered.slice(1);
        changed = true;
        continue;
      }
      if (gaps[gaps.length - 1] > threshold && (gaps[gaps.length - 2] || 0) <= threshold) {
        filtered = filtered.slice(0, -1);
        changed = true;
        continue;
      }

      for (let index = 1; index < filtered.length - 1; index += 1) {
        const leftGap = filtered[index] - filtered[index - 1];
        const rightGap = filtered[index + 1] - filtered[index];
        if (leftGap > threshold && rightGap > threshold) {
          filtered = filtered.filter((_, candidateIndex) => candidateIndex !== index);
          changed = true;
          break;
        }
      }
    }

    return filtered;
  }

  function filterIncompletePartyHistoryRows(rows) {
    if (!Array.isArray(rows) || rows.length < 2) {
      return Array.isArray(rows) ? rows : [];
    }

    const countsByTimestamp = rows.reduce((acc, row) => {
      const timestampMs = row && row.timestampMs;
      if (!Number.isFinite(timestampMs) || timestampMs <= 0) {
        return acc;
      }
      acc[timestampMs] = (acc[timestampMs] || 0) + 1;
      return acc;
    }, {});

    const counts = Object.values(countsByTimestamp);
    if (!counts.length) {
      return rows;
    }

    const maxCount = Math.max(...counts);
    const minimumCompleteCount = Math.max(5, Math.floor(maxCount * 0.75));
    return rows.filter((row) => {
      const timestampMs = row && row.timestampMs;
      if (!Number.isFinite(timestampMs) || timestampMs <= 0) {
        return false;
      }
      return (countsByTimestamp[timestampMs] || 0) >= minimumCompleteCount;
    });
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function hexToRgb(hex) {
    const normalized = String(hex || "").replace("#", "");
    if (normalized.length !== 6) return { r: 13, g: 59, b: 102 };
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16),
    };
  }

  function rgbToHex(rgb) {
    return `#${[rgb.r, rgb.g, rgb.b].map((value) => Math.round(value).toString(16).padStart(2, "0")).join("")}`;
  }

  function blendWithWhite(hex, intensity) {
    const rgb = hexToRgb(hex);
    const blend = clamp(intensity, 0, 1);
    return rgbToHex({
      r: rgb.r + (255 - rgb.r) * blend,
      g: rgb.g + (255 - rgb.g) * blend,
      b: rgb.b + (255 - rgb.b) * blend,
    });
  }

  function getCurrentStateConstituencyRows(stateKey) {
    return constituencyRows.filter((row) => row.stateKey === stateKey);
  }

  function computeConstituencyAnalytics(row, candidateRows) {
    if (!candidateRows || !candidateRows.length) return null;
    const sortedRows = candidateRows.slice().sort((a, b) => b.totalVotes - a.totalVotes);
    const top = sortedRows[0];
    const runnerUp = sortedRows[1];
    const totalVotes = sortedRows.reduce((sum, entry) => sum + entry.totalVotes, 0);
    const marginVotes = top && runnerUp ? Math.max(0, top.totalVotes - runnerUp.totalVotes) : top ? top.totalVotes : 0;
    const safetyMarginPct = totalVotes ? (marginVotes / totalVotes) * 100 : 0;
    const leaderVoteSharePct = totalVotes && top ? (top.totalVotes / totalVotes) * 100 : 0;
    const runnerUpVoteSharePct = totalVotes && runnerUp ? (runnerUp.totalVotes / totalVotes) * 100 : 0;
    const topTwoSharePct = totalVotes && top ? (((top.totalVotes || 0) + (runnerUp ? runnerUp.totalVotes : 0)) / totalVotes) * 100 : 0;
    const swingToFlipVotes = runnerUp ? Math.floor(marginVotes / 2) + 1 : marginVotes;
    const swingToFlipPct = totalVotes ? (swingToFlipVotes / totalVotes) * 100 : 0;
    const leaderToRunnerUpRatio = runnerUp && runnerUp.totalVotes ? top.totalVotes / runnerUp.totalVotes : null;
    const enpDenominator = sortedRows.reduce((sum, entry) => {
      if (!totalVotes) return sum;
      const share = entry.totalVotes / totalVotes;
      return sum + share * share;
    }, 0);
    const enp = enpDenominator ? 1 / enpDenominator : 0;

    return {
      constituencyKey: row.constituencyKey,
      constituencyNo: row.constituencyNo,
      constituencyName: row.constituencyName,
      district: row.district,
      leadingParty: row.leadingParty || (top ? top.party : ""),
      leadingCandidate: row.candidate || (top ? top.candidate : ""),
      leaderParty: top ? top.party : "",
      leaderCandidate: top ? top.candidate : "",
      leaderVotes: top ? top.totalVotes : 0,
      leaderVoteSharePct,
      runnerUpParty: runnerUp ? runnerUp.party : "",
      runnerUpCandidate: runnerUp ? runnerUp.candidate : "",
      runnerUpVotes: runnerUp ? runnerUp.totalVotes : 0,
      runnerUpVoteSharePct,
      totalVotes,
      marginVotes,
      safetyMarginPct,
      topTwoSharePct,
      swingToFlipVotes,
      swingToFlipPct,
      leaderToRunnerUpRatio,
      enp,
      currentRows: sortedRows,
    };
  }

  function getMedian(values) {
    if (!values.length) return 0;
    const sorted = values.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2) {
      return sorted[mid];
    }
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  function summarizeStateAnalytics(metrics, totalConstituencies) {
    const averageSafetyMarginPct = metrics.length
      ? metrics.reduce((sum, entry) => sum + entry.safetyMarginPct, 0) / metrics.length
      : 0;
    const averageEnp = metrics.length
      ? metrics.reduce((sum, entry) => sum + entry.enp, 0) / metrics.length
      : 0;
    const medianSafetyMarginPct = metrics.length ? getMedian(metrics.map((entry) => entry.safetyMarginPct)) : 0;
    const averageSwingToFlipPct = metrics.length
      ? metrics.reduce((sum, entry) => sum + entry.swingToFlipPct, 0) / metrics.length
      : 0;
    const averageTopTwoSharePct = metrics.length
      ? metrics.reduce((sum, entry) => sum + entry.topTwoSharePct, 0) / metrics.length
      : 0;
    const seatsUnderFivePct = metrics.filter((entry) => entry.safetyMarginPct < 5).length;
    const seatsUnderOnePct = metrics.filter((entry) => entry.safetyMarginPct < 1).length;
    const closestRace = metrics.length
      ? metrics.slice().sort((a, b) => a.safetyMarginPct - b.safetyMarginPct)[0]
      : null;
    const mostFragmented = metrics.length
      ? metrics.slice().sort((a, b) => b.enp - a.enp)[0]
      : null;
    const entityVoteTotals = {};
    const entitySeatTotals = {};
    let totalCountedVotes = 0;

    metrics.forEach((entry) => {
      const leaderEntity = normalizeText(entry.leadingParty || entry.leaderParty);
      if (leaderEntity) {
        entitySeatTotals[leaderEntity] = (entitySeatTotals[leaderEntity] || 0) + 1;
      }
      (entry.currentRows || []).forEach((candidateRow) => {
        const entity = normalizeText(candidateRow.party);
        if (!entity) return;
        entityVoteTotals[entity] = (entityVoteTotals[entity] || 0) + candidateRow.totalVotes;
        totalCountedVotes += candidateRow.totalVotes;
      });
    });

    const entityStats = Object.keys(entityVoteTotals).map((entity) => ({
      entity,
      votes: entityVoteTotals[entity] || 0,
      seats: entitySeatTotals[entity] || 0,
    }));
    entityStats.sort((a, b) => b.seats - a.seats || b.votes - a.votes || a.entity.localeCompare(b.entity));
    const seatLeader = entityStats[0] || null;
    const seatLeaderVoteSharePct =
      seatLeader && totalCountedVotes ? (seatLeader.votes / totalCountedVotes) * 100 : 0;
    const seatLeaderSeatSharePct =
      seatLeader && metrics.length ? (seatLeader.seats / metrics.length) * 100 : 0;
    const voteToSeatConversionRatio =
      seatLeader && seatLeaderVoteSharePct ? seatLeaderSeatSharePct / seatLeaderVoteSharePct : 0;
    const votesPerLedSeat = seatLeader && seatLeader.seats ? seatLeader.votes / seatLeader.seats : 0;

    return {
      coverageCount: metrics.length,
      totalConstituencies,
      averageSafetyMarginPct,
      averageEnp,
      medianSafetyMarginPct,
      averageSwingToFlipPct,
      averageTopTwoSharePct,
      seatsUnderFivePct,
      seatsUnderOnePct,
      closestRace,
      mostFragmented,
      totalCountedVotes,
      seatLeader,
      seatLeaderVoteSharePct,
      seatLeaderSeatSharePct,
      voteToSeatConversionRatio,
      votesPerLedSeat,
    };
  }

  function getSelectedAnalyticsMetric() {
    if (!selectedConstituency) return null;
    const stateCode = selectedConstituency.stateCode;
    const analytics = stateAnalyticsCache[stateCode];
    if (!analytics || !analytics.metricsByKey) return null;
    return analytics.metricsByKey[selectedConstituency.row && selectedConstituency.row.constituencyKey];
  }

  function updateSelectedAnalyticsFields(metric) {
    const resolvedMetric = metric || getSelectedAnalyticsMetric();
    const safetyEl = document.getElementById("selected-safety-margin");
    const enpEl = document.getElementById("selected-enp");
    if (safetyEl) safetyEl.textContent = resolvedMetric ? formatPercent(resolvedMetric.safetyMarginPct) : "-";
    if (enpEl) enpEl.textContent = resolvedMetric ? resolvedMetric.enp.toFixed(2) : "-";
    if (activeViewTab === "analytics") {
      renderAnalyticsConstituencyTable(resolvedMetric);
    }
  }

  function getMapModeNote() {
    if (activeViewTab === "regional") {
      return "Selected regional grouping shaded on the map with distinct region boundaries.";
    }
    if (activeViewTab === "analytics") {
      return "Safety-margin heatmap. Strong color means a safer lead; washed-out color means a tighter race.";
    }
    return "Leading party by constituency.";
  }

  function normalizeConstituencyRows(rows) {
    return rows
      .map((row) => {
        const stateCode = firstNonEmpty(row, ["State_Code", "state_code"]);
        const stateLabel = firstNonEmpty(row, ["State", "state"]);
        const stateKey = normalizeStateKey(stateCode || stateLabel);
        const timestamp = firstNonEmpty(row, ["Timestamp", "timestamp", "Last_Updated", "last_updated"]);
        const leadingPartyRaw = firstNonEmpty(row, ["Leading_Party", "leading_party", "Party", "party"]);
        const coalitionRaw = getCoalitionValue(row);
        const leadingPartyStyle = getPartyStyle(leadingPartyRaw || coalitionRaw);
        const coalitionStyleFromRow = getCoalitionStyle(coalitionRaw);
        const coalitionStyle = coalitionStyleFromRow.canonicalId
          ? coalitionStyleFromRow
          : getCoalitionStyle(
              leadingPartyStyle.type === "coalition"
                ? leadingPartyStyle.canonicalId
                : inferCoalitionId(stateKey, leadingPartyStyle.canonicalId)
            );
        const coalitionId =
          coalitionStyle && coalitionStyle.canonicalId
            ? coalitionStyle.canonicalId
            : leadingPartyStyle.type === "coalition"
              ? leadingPartyStyle.canonicalId
              : inferCoalitionId(stateKey, leadingPartyStyle.canonicalId);

        return {
          stateKey,
          stateCode: stateCode || (stateKey ? getStateConfig(stateKey).code : ""),
          stateName: stateLabel || (stateKey ? getStateConfig(stateKey).name : ""),
          constituencyNo: normalizeNumberString(
            firstNonEmpty(row, ["Constituency_No", "constituency_no", "AC_NO"])
          ),
          constituencyNoPadded: padConstituencyNo(
            firstNonEmpty(row, ["Constituency_No", "constituency_no", "AC_NO"])
          ),
          constituencyKey:
            firstNonEmpty(row, ["Constituency_Key", "constituency_key"]) ||
            `${stateCode || (stateKey ? getStateConfig(stateKey).code : "")}-${padConstituencyNo(
              firstNonEmpty(row, ["Constituency_No", "constituency_no", "AC_NO"])
            )}`,
          constituencyName: firstNonEmpty(row, ["Constituency_Name", "constituency_name", "Constituency"]),
          district: firstNonEmpty(row, ["District", "district"]),
          leadingParty: leadingPartyStyle.canonicalId,
          leadingPartyLabel: leadingPartyStyle.shortLabel,
          leadingPartyFullLabel: leadingPartyStyle.fullLabel,
          leadingPartyRaw,
          coalition: coalitionId,
          coalitionLabel: coalitionStyle.shortLabel,
          coalitionFullLabel: coalitionStyle.fullLabel,
          coalitionRaw,
          candidate: firstNonEmpty(
            row,
            ["Leading_Candidate", "leading_candidate", "Candidate", "candidate"]
          ),
          margin: firstNonEmpty(row, ["Margin", "margin", "Total_Votes", "total_votes"]),
          status: firstNonEmpty(row, ["Status", "status"]) || "Leading",
          lastUpdated: timestamp,
          timestampMs: (parseTimestamp(timestamp) || new Date(0)).getTime(),
        };
      })
      .filter((row) => row.stateKey);
  }

  function getRegionalGroupingDefinition() {
    return REGIONAL_GROUP_DEFINITIONS[activeRegionalGroupingKey] || null;
  }

  function isRegionalDefinitionAvailableForState(definition, stateKey) {
    if (!definition) return false;
    const stateCode = getStateConfig(stateKey).code;
    if (!Array.isArray(definition.stateCodes) || !definition.stateCodes.length) {
      return true;
    }
    return definition.stateCodes.includes(stateCode);
  }

  function getAvailableRegionalDefinitions(stateKey) {
    return Object.entries(REGIONAL_GROUP_DEFINITIONS).filter(([, definition]) =>
      isRegionalDefinitionAvailableForState(definition, stateKey)
    );
  }

  function getRegionalGroupBuckets(rows, groupingDefinition) {
    const groups = groupingDefinition && Array.isArray(groupingDefinition.groups) ? groupingDefinition.groups : [];
    const buckets = groups.map((group) => ({
      key: group.key,
      label: group.label,
      matches: group.matches,
      rows: [],
    }));
    const residualRows = [];

    rows.forEach((row) => {
      const matchedBucket = buckets.find((bucket) => bucket.matches(row));
      if (matchedBucket) {
        matchedBucket.rows.push(row);
      } else {
        residualRows.push(row);
      }
    });

    if (residualRows.length) {
      buckets.push({
        key: "__others",
        label: normalizeText(groupingDefinition && groupingDefinition.otherLabel) || "Others",
        rows: residualRows,
      });
    }

    return buckets;
  }

  function getRegionalGroupStyles(stateKey, groupingDefinition) {
    const rows = getCurrentStateConstituencyRows(stateKey);
    const buckets = getRegionalGroupBuckets(rows, groupingDefinition);
    const stylesByConstituencyKey = {};

    buckets.forEach((bucket, index) => {
      const palette = REGIONAL_GROUP_COLORS[index % REGIONAL_GROUP_COLORS.length];
      bucket.rows.forEach((row) => {
        stylesByConstituencyKey[row.constituencyKey] = {
          label: bucket.label,
          fill: palette.fill,
          stroke: palette.stroke,
        };
      });
    });

    return stylesByConstituencyKey;
  }

  function createJsonRegionalGroupMatcher(group) {
    const constituencyKeys = new Set((group.constituency_keys || []).map((value) => normalizeText(value).toUpperCase()));
    const constituencyNames = new Set(
      (group.constituency_names || []).map((value) => normalizeText(value).toLowerCase())
    );
    const constituencyNos = new Set(
      (group.constituency_nos || []).map((value) => padConstituencyNo(value))
    );

    return function matches(row) {
      const key = normalizeText(row.constituencyKey).toUpperCase();
      const name = normalizeText(row.constituencyName).toLowerCase();
      const no = padConstituencyNo(row.constituencyNo);
      return constituencyKeys.has(key) || constituencyNames.has(name) || constituencyNos.has(no);
    };
  }

  function registerRegionalDefinitionsFromConfig(config) {
    const definitions = Array.isArray(config && config.definitions) ? config.definitions : [];
    definitions.forEach((definition) => {
      const key = normalizeText(definition.key);
      const label = normalizeText(definition.label);
      const groups = Array.isArray(definition.groups) ? definition.groups : [];
      if (!key || !label || !groups.length) {
        return;
      }

      const normalizedGroups = groups
        .map((group) => {
          const groupKey = normalizeText(group.key);
          const groupLabel = normalizeText(group.label);
          const hasMembers =
            (Array.isArray(group.constituency_keys) && group.constituency_keys.length) ||
            (Array.isArray(group.constituency_names) && group.constituency_names.length) ||
            (Array.isArray(group.constituency_nos) && group.constituency_nos.length);
          if (!groupKey || !groupLabel || !hasMembers) {
            return null;
          }
          return {
            key: groupKey,
            label: groupLabel,
            matches: createJsonRegionalGroupMatcher(group),
          };
        })
        .filter(Boolean);

      if (!normalizedGroups.length) {
        return;
      }

      REGIONAL_GROUP_DEFINITIONS[key] = {
        label,
        description:
          normalizeText(definition.description) ||
          "Party seat trends are computed from constituency history using a JSON-configured grouping.",
        otherLabel: normalizeText(definition.other_label) || "Others",
        stateCodes: Array.isArray(definition.state_codes)
          ? definition.state_codes.map((value) => normalizeText(value).toUpperCase()).filter(Boolean)
          : [],
        groups: normalizedGroups,
      };
    });
  }

  async function loadRegionalGroupDefinitions() {
    if (regionalGroupDefinitionsLoaded) {
      return REGIONAL_GROUP_DEFINITIONS;
    }
    if (regionalGroupDefinitionsPromise) {
      return regionalGroupDefinitionsPromise;
    }

    regionalGroupDefinitionsPromise = (async () => {
      if (!REGIONAL_GROUPS_CONFIG_URL) {
        regionalGroupDefinitionsLoaded = true;
        return REGIONAL_GROUP_DEFINITIONS;
      }

      try {
        const config = await fetchJson(REGIONAL_GROUPS_CONFIG_URL);
        registerRegionalDefinitionsFromConfig(config);
      } catch (error) {
        console.warn("Regional group config load failed.", error);
      }

      regionalGroupDefinitionsLoaded = true;
      return REGIONAL_GROUP_DEFINITIONS;
    })()
      .then((result) => {
        regionalGroupDefinitionsPromise = null;
        return result;
      })
      .catch((error) => {
        regionalGroupDefinitionsPromise = null;
        throw error;
      });

    return regionalGroupDefinitionsPromise;
  }

  function normalizePartyRows(rows) {
    return rows
      .map((row) => {
        const stateCode = firstNonEmpty(row, ["State_Code", "state_code"]);
        const stateLabel = firstNonEmpty(row, ["State", "state"]);
        const stateKey = normalizeStateKey(stateCode || stateLabel);
        const timestamp = firstNonEmpty(row, ["Timestamp", "timestamp", "Last_Updated", "last_updated"]);
        const parsedDate = parseTimestamp(timestamp);
        const partyRaw = firstNonEmpty(row, ["Party", "party"]);
        const coalitionRaw = getCoalitionValue(row);
        const partyStyle = getPartyStyle(partyRaw || coalitionRaw);
        const coalitionStyleFromRow = getCoalitionStyle(coalitionRaw);
        const coalitionStyle = coalitionStyleFromRow.canonicalId
          ? coalitionStyleFromRow
          : getCoalitionStyle(
              partyStyle.type === "coalition" ? partyStyle.canonicalId : inferCoalitionId(stateKey, partyStyle.canonicalId)
            );
        const coalitionId =
          coalitionStyle && coalitionStyle.canonicalId
            ? coalitionStyle.canonicalId
            : partyStyle.type === "coalition"
              ? partyStyle.canonicalId
              : inferCoalitionId(stateKey, partyStyle.canonicalId);

        return {
          stateKey,
          stateCode: stateCode || (stateKey ? getStateConfig(stateKey).code : ""),
          stateName: stateLabel || (stateKey ? getStateConfig(stateKey).name : ""),
          party: partyStyle.canonicalId,
          partyType: partyStyle.type,
          partyLabel: partyStyle.shortLabel,
          partyFullLabel: partyStyle.fullLabel,
          partyRaw,
          coalition: coalitionId,
          coalitionLabel: coalitionStyle.shortLabel,
          coalitionFullLabel: coalitionStyle.fullLabel,
          coalitionRaw,
          won: toNumber(firstNonEmpty(row, ["Won", "won"])),
          leading: toNumber(firstNonEmpty(row, ["Leading", "leading"])),
          total: toNumber(firstNonEmpty(row, ["Total", "total", "Seats", "seats"])),
          timestamp,
          timestampMs: parsedDate ? parsedDate.getTime() : 0,
        };
      })
      .filter((row) => row.stateKey && row.party);
  }

  function normalizeCandidateRows(rows) {
    return rows
      .map((row) => {
        const stateCode = firstNonEmpty(row, ["State_Code", "state_code"]);
        const stateLabel = firstNonEmpty(row, ["State", "state"]);
        const stateKey = normalizeStateKey(stateCode || stateLabel);
        const timestamp = firstNonEmpty(row, ["Timestamp", "timestamp", "Last_Updated", "last_updated"]);
        const parsedDate = parseTimestamp(timestamp);
        const constituencyNo = firstNonEmpty(row, ["Constituency_No", "constituency_no"]);
        const paddedConstituencyNo = padConstituencyNo(constituencyNo);
        const partyRaw = firstNonEmpty(row, ["Party", "party"]);
        const coalitionRaw = getCoalitionValue(row);
        const partyStyle = getPartyStyle(partyRaw || coalitionRaw);
        const coalitionStyleFromRow = getCoalitionStyle(coalitionRaw);
        const coalitionStyle = coalitionStyleFromRow.canonicalId
          ? coalitionStyleFromRow
          : getCoalitionStyle(
              partyStyle.type === "coalition" ? partyStyle.canonicalId : inferCoalitionId(stateKey, partyStyle.canonicalId)
            );
        const coalitionId =
          coalitionStyle && coalitionStyle.canonicalId
            ? coalitionStyle.canonicalId
            : partyStyle.type === "coalition"
              ? partyStyle.canonicalId
              : inferCoalitionId(stateKey, partyStyle.canonicalId);

        return {
          stateKey,
          stateCode: stateCode || (stateKey ? getStateConfig(stateKey).code : ""),
          stateName: stateLabel || (stateKey ? getStateConfig(stateKey).name : ""),
          constituencyNo: normalizeNumberString(constituencyNo),
          constituencyNoPadded: paddedConstituencyNo,
          constituencyKey:
            firstNonEmpty(row, ["Constituency_Key", "constituency_key"]) ||
            `${stateCode || (stateKey ? getStateConfig(stateKey).code : "")}-${paddedConstituencyNo}`,
          constituencyName: firstNonEmpty(row, ["Constituency_Name", "constituency_name"]),
          serial: firstNonEmpty(row, ["SN", "sn"]),
          candidate: firstNonEmpty(row, ["Candidate", "candidate"]),
          party: partyStyle.canonicalId,
          partyType: partyStyle.type,
          partyLabel: partyStyle.shortLabel,
          partyFullLabel: partyStyle.fullLabel,
          partyRaw,
          coalition: coalitionId,
          coalitionLabel: coalitionStyle.shortLabel,
          coalitionFullLabel: coalitionStyle.fullLabel,
          coalitionRaw,
          evmVotes: toNumber(firstNonEmpty(row, ["EVM_Votes", "evm_votes"])),
          postalVotes: toNumber(firstNonEmpty(row, ["Postal_Votes", "postal_votes"])),
          totalVotes: toNumber(firstNonEmpty(row, ["Total_Votes", "total_votes"])),
          votePercentage: Number(firstNonEmpty(row, ["Vote_Percentage", "vote_percentage"]) || "0"),
          timestamp,
          timestampMs: parsedDate ? parsedDate.getTime() : 0,
        };
      })
      .filter((row) => row.stateKey && row.candidate);
  }

  function getDatasetMode() {
    const mode = getSearchParamValue(FIXTURE_PARAM);
    if (mode === "fixture") return "fixture";
    return "live";
  }

  function buildFetchUrl(url) {
    const raw = String(url || "");
    if (!raw) return raw;
    if (/[?&]X-Amz-Signature=/i.test(raw)) {
      // Presigned R2 URLs must be fetched exactly as generated.
      return raw;
    }
    return `${raw}${raw.includes("?") ? "&" : "?"}t=${Date.now()}`;
  }

  async function fetchCsv(url) {
    const response = await fetch(buildFetchUrl(url), { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    return response.text();
  }

  async function fetchOptionalCsv(url) {
    if (!url) return null;
    const response = await fetch(buildFetchUrl(url), { cache: "no-store" });
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    return response.text();
  }

  async function fetchJson(url) {
    const response = await fetch(buildFetchUrl(url), { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    return response.json();
  }

  async function loadDataApi() {
    if (getDatasetMode() === "fixture") {
      return createFixtureDataApi();
    }

    const defaultManifest = createDefaultManifest();

    if (ELECTION_DATA_MANIFEST_URL) {
      try {
        const manifest = await fetchJson(ELECTION_DATA_MANIFEST_URL);
        return createElectionDataApi(R2_PUBLIC_URL, manifest);
      } catch (error) {
        console.warn("Configured manifest fetch failed.", error);
      }
    }

    if (!R2_PUBLIC_URL) {
      return null;
    }

    const manifestUrl = joinUrl(R2_PUBLIC_URL, buildObjectKey(defaultManifest.root_prefix, "manifest.json"));

    try {
      const manifest = await fetchJson(manifestUrl);
      return createElectionDataApi(R2_PUBLIC_URL, manifest);
    } catch (error) {
      console.warn("Manifest fetch failed, falling back to default layout.", error);
      return createElectionDataApi(R2_PUBLIC_URL, defaultManifest);
    }
  }

  function setDataStatus(message, tone) {
    const statusEl = document.getElementById("data-status");
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.dataset.tone = tone || "neutral";
    statusEl.style.display = message ? "block" : "none";
  }

  function setMapLoadingState(stateKey) {
    const mapRoot = document.getElementById("map-root");
    if (!mapRoot) return;
    mapRoot.innerHTML = `<div class="chart-empty">Loading ${getStateConfig(stateKey).name} map boundaries...</div>`;
  }

  function ensureMapDataLoaded(stateKey) {
    const config = getStateConfig(stateKey);
    if (window[config.mapDataKey]) {
      return Promise.resolve(window[config.mapDataKey]);
    }
    if (mapDataPromises[stateKey]) {
      return mapDataPromises[stateKey];
    }

    mapDataPromises[stateKey] = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-map-state="${stateKey}"]`);
      const script = existing || document.createElement("script");

      const finalize = () => {
        const mapData = window[config.mapDataKey];
        if (mapData) {
          resolve(mapData);
          return;
        }
        reject(new Error(`Map data for ${config.name} loaded without exposing ${config.mapDataKey}.`));
      };

      script.addEventListener("load", finalize, { once: true });
      script.addEventListener(
        "error",
        () => {
          reject(new Error(`Failed to load map boundaries for ${config.name}.`));
        },
        { once: true }
      );

      if (!existing) {
        script.src = config.mapScriptUrl;
        script.async = true;
        script.dataset.mapState = stateKey;
        document.body.appendChild(script);
      }
    }).catch((error) => {
      delete mapDataPromises[stateKey];
      throw error;
    });

    return mapDataPromises[stateKey];
  }

  function getFeatureMapData(stateKey) {
    const config = getStateConfig(stateKey);
    return window[config.mapDataKey];
  }

  function getFeatureName(feature) {
    const props = feature.properties || {};
    return props.constituency_name || props.AC_NAME || props.AC_NAME_EN || "Unknown";
  }

  function getFeatureDistrict(feature) {
    const props = feature.properties || {};
    return (
      props.district_name ||
      props.DIST_NAME ||
      props.DISTIRCT ||
      props.district ||
      props.DISTRICT ||
      ""
    );
  }

  function getFeatureConstituencyNo(feature) {
    const props = feature.properties || {};
    return normalizeNumberString(props.constituency_no || props.AC_NO || props.generated_id || "");
  }

  function findConstituencyRow(feature) {
    const constituencyNo = getFeatureConstituencyNo(feature);
    const constituencyName = normalizeText(getFeatureName(feature)).toLowerCase();

    return constituencyRows.find((row) => {
      if (row.stateKey !== activeStateKey) return false;
      if (row.constituencyNo && constituencyNo && row.constituencyNo === constituencyNo) return true;
      return row.constituencyName && row.constituencyName.toLowerCase() === constituencyName;
    });
  }

  function getConstituencyColor(feature, defaultColor) {
    const row = findConstituencyRow(feature);
    if (!row || !row.leadingParty) return defaultColor;
    return getPartyColor(row.leadingParty, defaultColor);
  }

  function getRegionalConstituencyStyle(feature, defaultColor) {
    const row = findConstituencyRow(feature);
    if (!row) {
      return { fill: defaultColor, stroke: "#475569", hover: getFeatureName(feature) };
    }

    const stylesByConstituencyKey = getRegionalGroupStyles(activeStateKey, getRegionalGroupingDefinition());
    const groupStyle = stylesByConstituencyKey[row.constituencyKey];
    if (!groupStyle) {
      return { fill: defaultColor, stroke: "#475569", hover: row.constituencyName || getFeatureName(feature) };
    }

    return {
      fill: groupStyle.fill,
      stroke: groupStyle.stroke,
      hover: `${row.constituencyName || getFeatureName(feature)} · ${groupStyle.label}`,
    };
  }

  function getSafetyMarginColor(feature, defaultColor) {
    const row = findConstituencyRow(feature);
    if (!row) return defaultColor;

    const stateAnalytics = stateAnalyticsCache[getStateConfig(activeStateKey).code];
    const metric = stateAnalytics && stateAnalytics.metricsByKey ? stateAnalytics.metricsByKey[row.constituencyKey] : null;
    const baseColor = getPartyColor(row.leadingParty, defaultColor);
    if (!metric) {
      return blendWithWhite(baseColor, 0.62);
    }

    const pct = metric.safetyMarginPct;
    if (pct >= 10) return blendWithWhite(baseColor, 0.02);
    if (pct >= 5) return blendWithWhite(baseColor, 0.18);
    if (pct >= 1) return blendWithWhite(baseColor, 0.42);
    return blendWithWhite(baseColor, 0.72);
  }

  function updateStateHeader() {
    const config = getStateConfig(activeStateKey);
    const mapTitle = document.getElementById("map-title");
    const mapChip = document.getElementById("map-chip");
    const partyTitle = document.getElementById("party-analysis-title");
    const seatTrendTitle = document.getElementById("seat-trend-title");
    const mapModeNote = document.getElementById("map-mode-note");

    if (mapTitle) mapTitle.textContent = config.name;
    if (mapChip) {
      mapChip.textContent = `${config.seatCount} seats`;
      mapChip.className = `seat-chip ${config.key}`;
    }
    if (partyTitle) {
      if (activeViewTab === "regional") {
        const groupingDefinition = getRegionalGroupingDefinition();
        partyTitle.textContent = groupingDefinition
          ? `${config.name}: ${groupingDefinition.label}`
          : `${config.name}: regional analysis`;
      } else {
        partyTitle.textContent = `${config.name}: current party standing`;
      }
    }
    if (seatTrendTitle) seatTrendTitle.textContent = `${config.name} seat trend`;
    if (mapModeNote) mapModeNote.textContent = getMapModeNote();
  }

  function setRefreshButtonState(isLoading) {
    const button = document.getElementById("refresh-dashboard-button");
    if (!button) return;
    button.disabled = Boolean(isLoading);
    button.textContent = isLoading ? "Refreshing..." : "Refresh Counting";
  }

  function resetSelectedConstituency() {
    selectedConstituency = null;
    const nameEl = document.getElementById("selected-name");
    if (nameEl) nameEl.textContent = "Click a constituency";
    const partyEl = document.getElementById("selected-party");
    if (partyEl) partyEl.removeAttribute("title");

    ["district", "acno", "party", "candidate", "margin", "status", "updated", "safety-margin", "enp"].forEach((id) => {
      const el = document.getElementById(`selected-${id}`);
      if (el) el.textContent = "-";
    });

    const trendTitle = document.getElementById("candidate-trend-title");
    const trendNote = document.getElementById("candidate-trend-note");
    if (trendTitle) {
      trendTitle.textContent = "Click a constituency to inspect candidate votes over time";
    }
    if (trendNote) {
      trendNote.textContent = "Candidate vote series are fetched on demand for the selected constituency.";
    }

    setChartEmptyState(
      "candidate-trend-chart",
      "Choose a constituency on the map to load candidate-level time series."
    );
    clearLegend("candidate-trend-legend");
    const table = document.getElementById("candidate-current-table");
    if (table) {
      table.innerHTML = '<div class="chart-empty">Candidate snapshot will appear here after selecting a constituency.</div>';
    }
  }

  function updateHoverLabel(text) {
    const el = document.getElementById("hover-label");
    if (el) el.textContent = text;
  }

  function syncDashboardLayout() {
    const grid = document.getElementById("dashboard-grid");
    const detailsPanel = document.getElementById("constituency-details-panel");
    const partyPanel = document.getElementById("party-summary-panel");
    const regionalTools = document.getElementById("party-panel-regional-tools");
    const isRegional = activeViewTab === "regional";
    const isAnalytics = activeViewTab === "analytics";
    if (grid) {
      grid.classList.toggle("is-regional-focus", isRegional || isAnalytics);
    }
    if (detailsPanel) {
      detailsPanel.hidden = isRegional || isAnalytics;
    }
    if (partyPanel) {
      partyPanel.hidden = isAnalytics;
    }
    if (regionalTools) {
      regionalTools.hidden = !isRegional;
    }
  }

  function updateDetails(feature) {
    const row = findConstituencyRow(feature);
    const nameEl = document.getElementById("selected-name");
    const constituencyNo = getFeatureConstituencyNo(feature);
    const featureDistrict = getFeatureDistrict(feature);

    if (nameEl) nameEl.textContent = getFeatureName(feature);

    const fields = {
      district: featureDistrict || (row && row.district) || "-",
      acno: constituencyNo || "-",
      party: (row && row.leadingParty && getPartyDisplayLabel(row.leadingParty)) || "-",
      candidate: (row && row.candidate) || "-",
      margin: (row && row.margin) || "-",
      status: (row && row.status) || "-",
      updated: (row && row.lastUpdated && formatDateTime(row.lastUpdated)) || "-",
    };

    Object.entries(fields).forEach(([id, value]) => {
      const el = document.getElementById(`selected-${id}`);
      if (el) {
        el.textContent = value;
        if (id === "party" && row && row.leadingParty) {
          el.title = getPartyFullLabel(row.leadingParty);
        } else if (id === "party") {
          el.removeAttribute("title");
        }
      }
    });

    selectedConstituency = {
      stateKey: activeStateKey,
      stateCode: getStateConfig(activeStateKey).code,
      constituencyNo,
      constituencyNoPadded: padConstituencyNo(constituencyNo),
      constituencyName: (row && row.constituencyName) || getFeatureName(feature),
      district: fields.district,
      row,
    };
    updateSelectedAnalyticsFields();
  }

  function refreshSelectedConstituencyFromData() {
    if (!selectedConstituency || !selectedConstituency.row) {
      return;
    }

    const updatedRow = constituencyRows.find(
      (row) =>
        row.stateKey === selectedConstituency.stateKey &&
        row.constituencyKey === selectedConstituency.row.constituencyKey
    );

    if (!updatedRow) {
      resetSelectedConstituency();
      return;
    }

    const fields = {
      district: selectedConstituency.district || updatedRow.district || "-",
      acno: updatedRow.constituencyNo || "-",
      party: updatedRow.leadingParty ? getPartyDisplayLabel(updatedRow.leadingParty) : "-",
      candidate: updatedRow.candidate || "-",
      margin: updatedRow.margin || "-",
      status: updatedRow.status || "-",
      updated: updatedRow.lastUpdated ? formatDateTime(updatedRow.lastUpdated) : "-",
    };

    const nameEl = document.getElementById("selected-name");
    if (nameEl) {
      nameEl.textContent = updatedRow.constituencyName || selectedConstituency.constituencyName || "Click a constituency";
    }

    Object.entries(fields).forEach(([id, value]) => {
      const el = document.getElementById(`selected-${id}`);
      if (!el) return;
      el.textContent = value;
      if (id === "party" && updatedRow.leadingParty) {
        el.title = getPartyFullLabel(updatedRow.leadingParty);
      } else if (id === "party") {
        el.removeAttribute("title");
      }
    });

    selectedConstituency = {
      ...selectedConstituency,
      stateKey: updatedRow.stateKey,
      stateCode: updatedRow.stateCode,
      constituencyNo: updatedRow.constituencyNo,
      constituencyNoPadded: updatedRow.constituencyNoPadded,
      constituencyName: updatedRow.constituencyName || selectedConstituency.constituencyName,
      district: updatedRow.district || selectedConstituency.district,
      row: updatedRow,
    };
    updateSelectedAnalyticsFields();
  }

  function restoreSelectedConstituencySelection() {
    if (!selectedConstituency || !selectedConstituency.row) {
      return;
    }
    const constituencyKey = selectedConstituency.row.constituencyKey;
    if (!constituencyKey) {
      refreshSelectedConstituencyFromData();
      return;
    }

    const mapRoot = document.getElementById("map-root");
    const pathEl = mapRoot ? mapRoot.querySelector(`[data-constituency-key="${constituencyKey}"]`) : null;
    if (pathEl) {
      setActivePath(pathEl);
    }
    refreshSelectedConstituencyFromData();
  }

  function setActivePath(pathEl) {
    if (activePath) activePath.classList.remove("is-selected");
    activePath = pathEl;
    if (activePath) activePath.classList.add("is-selected");
  }

  function getBounds(features) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    if (!Array.isArray(features)) return { minX, maxX, minY, maxY };

    features.forEach((feature) => {
      if (!feature || !feature.geometry || !feature.geometry.coordinates) return;
      const type = feature.geometry.type;
      const coords = feature.geometry.coordinates;
      const polygons = type === "Polygon" ? [coords] : type === "MultiPolygon" ? coords : [];

      polygons.forEach((polygon) => {
        if (!Array.isArray(polygon)) return;
        polygon.forEach((ring) => {
          if (!Array.isArray(ring)) return;
          ring.forEach((point) => {
            if (!Array.isArray(point) || point.length < 2) return;
            const x = Number(point[0]);
            const y = Number(point[1]);
            if (Number.isNaN(x) || Number.isNaN(y)) return;
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
          });
        });
      });
    });
    return { minX, maxX, minY, maxY };
  }

  function projectPoint(point, bounds, width, height, padding) {
    const usableWidth = width - padding * 2;
    const usableHeight = height - padding * 2;
    const dx = bounds.maxX - bounds.minX;
    const dy = bounds.maxY - bounds.minY;
    if (dx <= 0 || dy <= 0) return [0, 0];

    const scale = Math.min(usableWidth / dx, usableHeight / dy);
    const offsetX = (width - dx * scale) / 2;
    const offsetY = (height - dy * scale) / 2;
    return [
      offsetX + (point[0] - bounds.minX) * scale,
      height - (offsetY + (point[1] - bounds.minY) * scale),
    ];
  }

  function geometryToPath(geometry, bounds, width, height, padding) {
    if (!geometry || !geometry.coordinates) return "";
    const type = geometry.type;
    const coords = geometry.coordinates;
    const polygons = type === "Polygon" ? [coords] : type === "MultiPolygon" ? coords : [];

    return polygons
      .map((polygon) => {
        if (!Array.isArray(polygon)) return "";
        return polygon
          .map((ring) => {
            if (!Array.isArray(ring)) return "";
            return (
              ring
                .map((point, index) => {
                  if (!Array.isArray(point) || point.length < 2) return "";
                  const projected = projectPoint(point, bounds, width, height, padding);
                  return `${index === 0 ? "M" : "L"}${projected[0].toFixed(2)},${projected[1].toFixed(2)}`;
                })
                .join("") + "Z"
            );
          })
          .join("");
      })
      .join("");
  }

  function renderMap() {
    const mapRoot = document.getElementById("map-root");
    if (!mapRoot) return;

    const mapData = getFeatureMapData(activeStateKey);
    if (!mapData) {
      updateStateHeader();
      setMapLoadingState(activeStateKey);
      return;
    }

    const features = mapData.features ? mapData.features : [];
    updateStateHeader();
    mapRoot.innerHTML = "";
    updateHoverLabel("Hover over a constituency");
    activePath = null;

    if (!features.length) {
      mapRoot.textContent = "Map data is empty.";
      return;
    }

    const fillResolver =
      activeViewTab === "analytics"
        ? getSafetyMarginColor
        : activeViewTab === "regional"
          ? null
          : getConstituencyColor;
    const styleResolver = activeViewTab === "regional" ? getRegionalConstituencyStyle : null;

    if (activeStateKey === "py") {
      renderPuducherryClustered(mapRoot, features, fillResolver, styleResolver);
    } else {
      renderSingleMap(mapRoot, features, "#ffffff", fillResolver, styleResolver);
    }
  }

  function renderSingleMap(container, features, defaultColor, fillResolver, styleResolver) {
    const width = 1200;
    const height = 900;
    const padding = 24;
    const bounds = getBounds(features);

    if (bounds.minX === Infinity) {
      container.textContent = "Invalid map coordinates.";
      return;
    }

    const svg = document.createElementNS(svgNs, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("class", "map-svg");

    features.forEach((feature) => {
      if (!feature.geometry) return;
      const row = findConstituencyRow(feature);
      const pathEl = document.createElementNS(svgNs, "path");
      const pathData = geometryToPath(feature.geometry, bounds, width, height, padding);
      if (!pathData) return;

      pathEl.setAttribute("d", pathData);
      const visualStyle = styleResolver
        ? styleResolver(feature, defaultColor)
        : { fill: (fillResolver || getConstituencyColor)(feature, defaultColor), stroke: "" };
      pathEl.setAttribute("fill", visualStyle.fill || defaultColor);
      if (visualStyle.stroke) {
        pathEl.setAttribute("stroke", visualStyle.stroke);
        pathEl.setAttribute("stroke-width", activeViewTab === "regional" ? "1.8" : "1.2");
      }
      pathEl.setAttribute("class", "constituency");
      if (row && row.constituencyKey) {
        pathEl.dataset.constituencyKey = row.constituencyKey;
      }

      pathEl.addEventListener("mouseenter", () => updateHoverLabel(visualStyle.hover || getFeatureName(feature)));
      pathEl.addEventListener("mouseleave", () => updateHoverLabel("Hover over a constituency"));
      if (activeViewTab !== "regional") {
        pathEl.addEventListener("click", () => {
          setActivePath(pathEl);
          updateDetails(feature);
          loadSelectedConstituencyAnalytics();
        });
      }

      svg.appendChild(pathEl);
    });
    container.appendChild(svg);
  }

  function renderPuducherryClustered(container, features, fillResolver, styleResolver) {
    const clusters = {
      PUDUCHERRY: [],
      KARAIKAL: [],
      MAHE: [],
      YANAM: [],
    };

    features.forEach((feature) => {
      const dist = String(feature.properties.DIST_NAME || "PUDUCHERRY").toUpperCase();
      if (dist.includes("PONDICHERRY") || dist.includes("PUDUCHERRY")) clusters.PUDUCHERRY.push(feature);
      else if (dist.includes("KARAIKAL")) clusters.KARAIKAL.push(feature);
      else if (dist.includes("MAHE")) clusters.MAHE.push(feature);
      else if (dist.includes("YANAM")) clusters.YANAM.push(feature);
    });

    const wrapper = document.createElement("div");
    wrapper.className = "py-clusters-grid";

    Object.entries(clusters).forEach(([name, clusterFeatures]) => {
      if (clusterFeatures.length === 0) return;

      const box = document.createElement("div");
      box.className = "py-cluster-box";
      const label = document.createElement("div");
      label.className = "py-cluster-label";
      label.textContent = name;
      box.appendChild(label);

      const mapInner = document.createElement("div");
      mapInner.className = "py-cluster-map";
      renderSingleMap(mapInner, clusterFeatures, "#ffffff", fillResolver, styleResolver);
      box.appendChild(mapInner);
      wrapper.appendChild(box);
    });

    container.appendChild(wrapper);
  }

  function setChartEmptyState(containerId, message) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `<div class="chart-empty">${message}</div>`;
  }

  function clearLegend(containerId) {
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = "";
  }

  function renderLegend(containerId, series, formatter) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!series || !series.length) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = series
      .map((entry) => {
        const latestValue = formatter ? formatter(entry.latestValue) : entry.latestValue;
        const titleAttr = entry.title ? ` title="${entry.title}"` : "";
        return [
          `<div class="legend-chip"${titleAttr}>`,
          `<span class="legend-swatch" style="background:${entry.color};"></span>`,
          `<span>${entry.label}</span>`,
          `<span class="legend-value">${latestValue}</span>`,
          "</div>",
        ].join("");
      })
      .join("");
  }

  function buildLinePath(points, xScale, yScale) {
    return points
      .map((point, index) => `${index === 0 ? "M" : "L"}${xScale(point.x).toFixed(2)},${yScale(point.y).toFixed(2)}`)
      .join(" ");
  }

  function renderLineChart(containerId, options) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = renderLineChartMarkup(options);
  }

  function renderLineChartMarkup(options) {
    const series = (options.series || []).filter((entry) => Array.isArray(entry.points) && entry.points.length);
    if (!series.length) {
      return `<div class="chart-empty">${options.emptyMessage || "No chart data available."}</div>`;
    }

    const width = 920;
    const height = 320;
    const padding = { top: 18, right: 22, bottom: 44, left: 52 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const xValues = [...new Set(flattenArrays(series, (entry) => entry.points.map((point) => point.x)))].sort(
      (a, b) => a - b
    );
    const yValues = flattenArrays(series, (entry) => entry.points.map((point) => point.y));
    const yMax = Math.max(1, options.yMax || Math.max.apply(null, yValues));
    const xMin = xValues[0];
    const xMax = xValues[xValues.length - 1];

    const xScale = (value) => {
      if (xMin === xMax) return padding.left + plotWidth / 2;
      return padding.left + ((value - xMin) / (xMax - xMin)) * plotWidth;
    };

    const yScale = (value) => padding.top + plotHeight - (value / yMax) * plotHeight;
    const yTicks = 4;
    const xTickValues = xValues.length <= 4
      ? xValues
      : [xValues[0], xValues[Math.floor((xValues.length - 1) / 3)], xValues[Math.floor((xValues.length - 1) * 2 / 3)], xValues[xValues.length - 1]];

    const svgParts = [];
    svgParts.push(`<svg class="trend-svg" viewBox="0 0 ${width} ${height}" role="img">`);

    for (let index = 0; index <= yTicks; index += 1) {
      const yValue = (yMax / yTicks) * index;
      const y = yScale(yValue);
      svgParts.push(
        `<line class="chart-grid-line" x1="${padding.left}" y1="${y.toFixed(2)}" x2="${(width - padding.right).toFixed(2)}" y2="${y.toFixed(2)}"></line>`
      );
      svgParts.push(
        `<text class="chart-tick" x="${(padding.left - 10).toFixed(2)}" y="${(y + 4).toFixed(2)}" text-anchor="end">${formatNumber(Math.round(yValue))}</text>`
      );
    }

    svgParts.push(
      `<line class="chart-axis-line" x1="${padding.left}" y1="${(padding.top + plotHeight).toFixed(2)}" x2="${(width - padding.right).toFixed(2)}" y2="${(padding.top + plotHeight).toFixed(2)}"></line>`
    );
    svgParts.push(
      `<line class="chart-axis-line" x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${(padding.top + plotHeight).toFixed(2)}"></line>`
    );

    xTickValues.forEach((tickValue) => {
      const x = xScale(tickValue);
      svgParts.push(
        `<text class="chart-tick" x="${x.toFixed(2)}" y="${(height - 14).toFixed(2)}" text-anchor="middle">${formatTimeTick(tickValue, { xMin, xMax })}</text>`
      );
    });

    if (options.referenceLine && Number.isFinite(options.referenceLine.value)) {
      const referenceY = yScale(options.referenceLine.value);
      svgParts.push(
        `<line class="chart-reference-line" x1="${padding.left}" y1="${referenceY.toFixed(2)}" x2="${(width - padding.right).toFixed(2)}" y2="${referenceY.toFixed(2)}"></line>`
      );
      svgParts.push(
        `<text class="chart-reference-label" x="${(width - padding.right - 4).toFixed(2)}" y="${(referenceY - 6).toFixed(2)}" text-anchor="end">${options.referenceLine.label}</text>`
      );
    }

    series.forEach((entry) => {
      svgParts.push(
        `<path d="${buildLinePath(entry.points, xScale, yScale)}" fill="none" stroke="${entry.color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"></path>`
      );
      entry.points.forEach((point) => {
        svgParts.push(
          `<circle cx="${xScale(point.x).toFixed(2)}" cy="${yScale(point.y).toFixed(2)}" r="3.5" fill="${entry.color}"></circle>`
        );
      });
    });

    svgParts.push(
      `<text class="chart-axis-label" x="${(padding.left + plotWidth / 2).toFixed(2)}" y="${(height - 2).toFixed(2)}" text-anchor="middle">Time</text>`
    );
    svgParts.push(
      `<text class="chart-axis-label" x="16" y="${(padding.top + plotHeight / 2).toFixed(2)}" text-anchor="middle" transform="rotate(-90 16 ${(padding.top + plotHeight / 2).toFixed(2)})">${options.yAxisLabel || "Value"}</text>`
    );
    svgParts.push("</svg>");

    return `<div class="chart-frame">${svgParts.join("")}</div>`;
  }

  function getCoalitionDefinitions(stateKey, rows) {
    const definitionsById = {};
    const pushDefinition = (coalitionValue, members, colorOverride) => {
      const coalitionStyle = getCoalitionStyle(coalitionValue);
      const coalitionId = coalitionStyle.canonicalId || normalizeText(coalitionValue);
      if (!coalitionId) return;

      const existing = definitionsById[coalitionId] || {
        id: coalitionId,
        label: coalitionStyle.shortLabel || normalizeText(coalitionValue),
        fullLabel: coalitionStyle.fullLabel || normalizeText(coalitionValue),
        parties: [],
        color: colorOverride || coalitionStyle.color || "",
      };

      const partyIds = (members || [])
        .map((partyValue) =>
          resolveEntityIdFromRegistry(ENTITY_REGISTRY, partyValue, "party") || normalizeText(partyValue)
        )
        .filter(Boolean);
      existing.parties = [...new Set(existing.parties.concat(partyIds))];
      existing.color = existing.color || colorOverride || coalitionStyle.color || "";
      definitionsById[coalitionId] = existing;
    };

    const stateRegistry = ENTITY_REGISTRY.states[stateKey] || createRegistryStateRecord();
    Object.entries(stateRegistry.coalitions || {}).forEach(([coalitionId, coalitionConfig]) => {
      pushDefinition(coalitionId, coalitionConfig.members || []);
    });

    const runtimeDefinitions = RUNTIME_COALITION_CONFIG[stateKey] || {};
    Object.entries(runtimeDefinitions).forEach(([coalitionLabel, configValue]) => {
      const members = Array.isArray(configValue) ? configValue : (configValue && configValue.parties) || [];
      const colorOverride = configValue && !Array.isArray(configValue) ? configValue.color : "";
      pushDefinition(coalitionLabel, members, colorOverride);
    });

    (rows || []).forEach((row) => {
      const coalitionId =
        row.coalition ||
        (row.partyType === "coalition" ? row.party : inferCoalitionId(stateKey, row.party));
      if (!coalitionId) return;
      const memberParty =
        row.partyType === "party" ? row.party : resolveEntityIdFromRegistry(ENTITY_REGISTRY, row.partyRaw, "party");
      pushDefinition(coalitionId, memberParty ? [memberParty] : []);
    });

    return Object.values(definitionsById).map((definition, index) => ({
      ...definition,
      color: definition.color || CHART_PALETTE[index % CHART_PALETTE.length],
    }));
  }

  function getSeatMetricValue(row, metric) {
    if (metric === "won") return row.won;
    if (metric === "leading") return row.leading;
    return row.total;
  }

  function buildStateSeatSeries(rows, metric, grouping, stateKey) {
    const validRows = rows.filter(hasValidTimestamp);
    if (!validRows.length) return [];

    const times = filterTimelineOutliers(
      [...new Set(validRows.map((row) => row.timestampMs))].sort((a, b) => a - b)
    );
    if (!times.length) return [];
    const latestTime = times[times.length - 1];
    const latestRows = validRows.filter((row) => row.timestampMs === latestTime);

    if (grouping === "coalition") {
      const coalitions = getCoalitionDefinitions(stateKey, validRows);
      if (!coalitions.length) {
        return [];
      }

      return coalitions
        .map((coalition) => {
          const points = times.map((time) => {
            const rowsAtTime = validRows.filter((row) => {
              if (row.timestampMs !== time) return false;
              if (row.partyType === "coalition") {
                return row.party === coalition.id;
              }
              if (row.coalition) {
                return row.coalition === coalition.id;
              }
              return coalition.parties.includes(row.party);
            });
            const value = rowsAtTime.reduce((sum, row) => sum + getSeatMetricValue(row, metric), 0);
            return { x: time, y: value };
          });
          const latestValue = points[points.length - 1] ? points[points.length - 1].y : 0;
          const maxValue = Math.max(...points.map((point) => point.y), 0);
          return {
            id: coalition.id,
            label: coalition.label,
            title: coalition.fullLabel || coalition.label,
            color: coalition.color,
            points,
            latestValue,
            maxValue,
          };
        })
        .filter((entry) => entry.maxValue > 0)
        .sort((a, b) => b.latestValue - a.latestValue || b.maxValue - a.maxValue)
        .slice(0, SEAT_TREND_SERIES_LIMIT);
    }

    return latestRows
      .slice()
      .sort((a, b) => getSeatMetricValue(b, metric) - getSeatMetricValue(a, metric) || b.total - a.total)
      .slice(0, SEAT_TREND_SERIES_LIMIT)
      .map((row, index) => {
        const party = row.party;
        const points = times.map((time) => {
          const match = validRows.find((item) => item.timestampMs === time && item.party === party);
          return { x: time, y: match ? getSeatMetricValue(match, metric) : 0 };
        });
        return {
          label: getPartyDisplayLabel(party),
          title: getPartyFullLabel(party),
          color: getPartyColor(party, CHART_PALETTE[index % CHART_PALETTE.length]),
          points,
          latestValue: points[points.length - 1] ? points[points.length - 1].y : 0,
          maxValue: Math.max(...points.map((point) => point.y), 0),
        };
      })
      .filter((entry) => entry.maxValue > 0 || entry.latestValue > 0);
  }

  function buildCandidateSeries(rows, currentRows) {
    const validRows = rows.filter(hasValidTimestamp);
    const validCurrentRows = currentRows.filter(hasValidTimestamp);
    const latestValidRows = getLatestTimestampGroup(validRows, hasMeaningfulCandidateValue);
    const referenceRows = validCurrentRows.length ? validCurrentRows : latestValidRows.length ? latestValidRows : currentRows;

    const topCandidates = referenceRows
      .slice()
      .sort((a, b) => b.totalVotes - a.totalVotes)
      .slice(0, CANDIDATE_SERIES_LIMIT);
    const times = filterTimelineOutliers(
      [...new Set(validRows.map((row) => row.timestampMs))].sort((a, b) => a - b)
    );
    if (!times.length) return [];

    return topCandidates.map((candidateRow, index) => {
      const points = times.map((time) => {
        const match = validRows.find((row) => row.timestampMs === time && row.candidate === candidateRow.candidate);
        return { x: time, y: match ? match.totalVotes : 0 };
      });
      return {
        label: candidateRow.candidate,
        title: candidateRow.candidate,
        color: getPartyColor(candidateRow.party, CHART_PALETTE[index % CHART_PALETTE.length]),
        points,
        latestValue: points[points.length - 1] ? points[points.length - 1].y : 0,
        maxValue: Math.max(...points.map((point) => point.y), 0),
      };
    });
  }

  function isWonStatus(value) {
    return /won|elected|declared/i.test(normalizeText(value));
  }

  function buildDerivedPartyRows(rows) {
    const summaryByState = {};

    rows.forEach((row) => {
      if (!row || !row.stateKey || !row.leadingParty) return;
      const stateSummary = summaryByState[row.stateKey] || {};
      const partyKey = row.leadingParty;
      const existing = stateSummary[partyKey] || {
        stateKey: row.stateKey,
        stateCode: row.stateCode,
        stateName: row.stateName,
        party: partyKey,
        partyType: "party",
        partyLabel: getPartyDisplayLabel(partyKey),
        partyFullLabel: getPartyFullLabel(partyKey),
        partyRaw: row.leadingPartyRaw || partyKey,
        coalition: row.coalition || inferCoalitionId(row.stateKey, partyKey),
        coalitionLabel: row.coalitionLabel || "",
        coalitionFullLabel: row.coalitionFullLabel || "",
        coalitionRaw: row.coalitionRaw || "",
        won: 0,
        leading: 0,
        total: 0,
        timestamp: row.lastUpdated || "",
        timestampMs: row.timestampMs || 0,
      };

      existing.total += 1;
      if (isWonStatus(row.status)) {
        existing.won += 1;
      } else {
        existing.leading += 1;
      }
      if ((row.timestampMs || 0) > existing.timestampMs) {
        existing.timestamp = row.lastUpdated || existing.timestamp;
        existing.timestampMs = row.timestampMs || existing.timestampMs;
      }

      stateSummary[partyKey] = existing;
      summaryByState[row.stateKey] = stateSummary;
    });

    return flattenArrays(Object.values(summaryByState), (stateSummary) => Object.values(stateSummary));
  }

  function renderPartyTable() {
    const container = document.getElementById("party-analysis-table");
    if (!container) return;
    if (activeViewTab === "regional") return;
    const sourceRows = partyRows.length ? partyRows : buildDerivedPartyRows(constituencyRows);
    const rows = sourceRows
      .filter((row) => row.stateKey === activeStateKey)
      .slice()
      .sort((a, b) => b.total - a.total || b.won - a.won || b.leading - a.leading);

    if (!rows.length) {
      container.innerHTML = `<p>No party summary data available for ${getStateConfig(activeStateKey).name}.</p>`;
      return;
    }

    const body = rows
      .map((row) => {
        const swatch = getPartyColor(row.party, getStateConfig(activeStateKey).color);
        return [
          "<tr>",
          `<td><span class="party-cell"><span class="legend-swatch" style="background:${swatch};"></span>${renderPartyLabelMarkup(row.party)}</span></td>`,
          `<td class="is-numeric">${formatNumber(row.won)}</td>`,
          `<td class="is-numeric">${formatNumber(row.leading)}</td>`,
          `<td class="is-numeric total-seats-cell">${formatNumber(row.total)}</td>`,
          "</tr>",
        ].join("");
      })
      .join("");

    container.innerHTML = [
      '<table class="table party-table">',
      '<thead><tr><th>Party</th><th>Won</th><th>Leading</th><th class="total-seats-heading">Total</th></tr></thead>',
      `<tbody>${body}</tbody>`,
      "</table>",
    ].join("");
  }

  function buildRegionalCardsMarkup(groupMetrics, stateKey) {
    const config = getStateConfig(stateKey);
    return [
      '<div class="regional-analysis-grid">',
      groupMetrics
        .map((metric) => {
          const summaryTable = metric.currentPartyRows.length
            ? [
                '<div class="regional-group-table-wrap">',
                '<table class="table regional-group-table">',
                "<thead><tr><th>Party</th><th class=\"is-numeric\">Seats</th><th class=\"is-numeric\">Share</th></tr></thead>",
                "<tbody>",
                metric.currentPartyRows
                  .map((entry) => {
                    const titleAttr = getPartyFullLabel(entry.party);
                    return [
                      "<tr>",
                      `<td><span class="party-cell"><span class="legend-swatch" style="background:${entry.color};"></span><span title="${escapeHtml(titleAttr)}">${escapeHtml(getPartyDisplayLabel(entry.party) || "-")}</span></span></td>`,
                      `<td class="is-numeric">${formatNumber(entry.seats)}</td>`,
                      `<td class="is-numeric">${formatPercent(entry.share)}</td>`,
                      "</tr>",
                    ].join("");
                  })
                  .join(""),
                "</tbody>",
                "</table>",
                "</div>",
              ].join("")
            : '<div class="chart-empty">No current party standing is available for this region yet.</div>';

          return [
            '<section class="regional-group-card">',
            `<div class="regional-group-header"><div><div class="eyebrow">Group</div><h3 class="regional-group-title">${escapeHtml(metric.label)}</h3></div><span class="seat-chip ${config.key}">${metric.seatCount} seats</span></div>`,
            summaryTable,
            "</section>",
          ].join("");
        })
        .join(""),
      "</div>",
    ].join("");
  }

  function renderRegionalPartyPanel(groupMetrics, groupingDefinition) {
    const container = document.getElementById("party-analysis-table");
    const title = document.getElementById("party-analysis-title");
    if (!container) return;

    const config = getStateConfig(activeStateKey);
    if (title) {
      title.textContent = groupingDefinition
        ? `${config.name}: ${groupingDefinition.label}`
        : `${config.name}: regional analysis`;
    }

    if (!groupingDefinition) {
      container.innerHTML = '<div class="chart-empty">No region grouping is configured for this state.</div>';
      return;
    }

    if (!groupMetrics || !groupMetrics.length) {
      container.innerHTML = '<div class="chart-empty">Regional party performance is not available for this state yet.</div>';
      return;
    }

    container.innerHTML = buildRegionalCardsMarkup(groupMetrics, activeStateKey);
  }

  function updateSeatTrendControls() {
    const coalitionButton = document.querySelector('[data-grouping="coalition"]');
    const stateRows = partyRows.filter((row) => row.stateKey === activeStateKey);
    const coalitions = getCoalitionDefinitions(activeStateKey, stateRows);
    if (coalitionButton) {
      coalitionButton.disabled = coalitions.length === 0;
      if (!coalitions.length && seatTrendGrouping === "coalition") {
        seatTrendGrouping = "party";
      }
    }

    document.querySelectorAll("#seat-trend-grouping .segment-button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.grouping === seatTrendGrouping);
    });
    document.querySelectorAll("#seat-trend-metric .segment-button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.metric === seatTrendMetric);
    });
  }

  function renderSeatTrendChart() {
    const stateCode = getStateConfig(activeStateKey).code;
    const currentRows = partyRows.filter((row) => row.stateKey === activeStateKey);
    const historyRows = statePartyHistoryCache[stateCode] || [];
    const chartRows = historyRows.length ? historyRows : currentRows;
    const note = document.getElementById("seat-trend-note");

    updateSeatTrendControls();

    if (note) {
      const coalitionState = getCoalitionDefinitions(activeStateKey, chartRows).length
        ? "Coalition definitions loaded for this state."
        : "No coalition definition configured for this state yet.";
      note.textContent = `Computed in the browser from partywise history. ${coalitionState}`;
    }

    if (!chartRows.length) {
      setChartEmptyState("seat-trend-chart", "Seat history has not loaded yet for this state.");
      clearLegend("seat-trend-legend");
      return;
    }

    const series = buildStateSeatSeries(chartRows, seatTrendMetric, seatTrendGrouping, activeStateKey);
    if (!series.length) {
      setChartEmptyState(
        "seat-trend-chart",
        seatTrendGrouping === "coalition"
          ? "Coalition view is configured but has no matching party data yet."
          : "No state seat trend data available."
      );
      clearLegend("seat-trend-legend");
      return;
    }

    renderLineChart("seat-trend-chart", {
      series,
      emptyMessage: "No state seat trend data available.",
      yAxisLabel: "Seats",
      referenceLine: {
        value: Math.floor(getStateConfig(activeStateKey).seatCount / 2) + 1,
        label: `Majority ${Math.floor(getStateConfig(activeStateKey).seatCount / 2) + 1}`,
      },
    });
    renderLegend("seat-trend-legend", series, (value) => formatNumber(value));
  }

  function renderCandidateTable(rows) {
    const container = document.getElementById("candidate-current-table");
    if (!container) return;
    if (!rows.length) {
      container.innerHTML = '<div class="chart-empty">Candidate snapshot is not available for this constituency yet.</div>';
      return;
    }

    const sortedRows = rows.slice().sort((a, b) => b.totalVotes - a.totalVotes);
    const body = sortedRows
      .map((row) => {
        const swatch = getPartyColor(row.party, getStateConfig(activeStateKey).color);
        return [
          "<tr>",
          `<td>${row.serial || "-"}</td>`,
          `<td><span class="party-cell"><span class="legend-swatch" style="background:${swatch};"></span>${row.candidate}</span></td>`,
          `<td title="${getPartyFullLabel(row.party)}">${getPartyDisplayLabel(row.party) || "-"}</td>`,
          `<td class="is-numeric">${formatNumber(row.evmVotes)}</td>`,
          `<td class="is-numeric">${formatNumber(row.postalVotes)}</td>`,
          `<td class="is-numeric">${formatNumber(row.totalVotes)}</td>`,
          `<td class="is-numeric">${formatPercent(row.votePercentage)}</td>`,
          "</tr>",
        ].join("");
      })
      .join("");

    container.innerHTML = [
      '<table class="table candidate-table">',
      "<thead><tr><th>S.N.</th><th>Candidate</th><th>Party</th><th>EVM</th><th>Postal</th><th>Total</th><th>%</th></tr></thead>",
      `<tbody>${body}</tbody>`,
      "</table>",
    ].join("");
  }

  function renderCandidateTrendPanel(data) {
    const title = document.getElementById("candidate-trend-title");
    const note = document.getElementById("candidate-trend-note");
    const rows = data.historyRows.length ? data.historyRows : data.currentRows;

    if (title && selectedConstituency) {
      title.textContent = `${selectedConstituency.constituencyName} candidate vote trend`;
    }
    if (note) {
      const updatedLabel = data.currentRows[0] ? formatDateTime(data.currentRows[0].timestamp) : "unknown";
      note.textContent = `Time vs total votes for the leading candidates in this constituency. Latest snapshot: ${updatedLabel}.`;
    }

    renderCandidateTable(data.currentRows);

    if (!rows.length) {
      setChartEmptyState(
        "candidate-trend-chart",
        "Candidate-level history is not available for this constituency yet."
      );
      clearLegend("candidate-trend-legend");
      return;
    }

    const series = buildCandidateSeries(rows, data.currentRows.length ? data.currentRows : rows);
    if (!series.length) {
      setChartEmptyState("candidate-trend-chart", "No candidate time series available for this constituency.");
      clearLegend("candidate-trend-legend");
      return;
    }

    renderLineChart("candidate-trend-chart", {
      series,
      emptyMessage: "No candidate time series available for this constituency.",
      yAxisLabel: "Votes",
    });
    renderLegend("candidate-trend-legend", series, (value) => formatNumber(value));
  }

  function renderSafetyLegend() {
    const container = document.getElementById("analytics-safety-legend");
    if (!container) return;

    const baseColor = getPartyColor("DMK", getStateConfig(activeStateKey).color);
    const bands = [
      { label: "Safe Seat", description: "Lead margin above 10%", color: blendWithWhite(baseColor, 0.02) },
      { label: "Competitive", description: "Lead margin between 5% and 10%", color: blendWithWhite(baseColor, 0.18) },
      { label: "Tight", description: "Lead margin between 1% and 5%", color: blendWithWhite(baseColor, 0.42) },
      { label: "Nail-biter", description: "Lead margin below 1%", color: blendWithWhite(baseColor, 0.72) },
    ];

    container.innerHTML = bands
      .map(
        (band) => [
          '<div class="safety-band">',
          `<span class="safety-band-swatch" style="background:${band.color};"></span>`,
          "<div>",
          `<strong>${band.label}</strong>`,
          `<span>${band.description}</span>`,
          "</div>",
          "</div>",
        ].join("")
      )
      .join("");
  }

  function formatRatio(value) {
    return Number.isFinite(value) && value > 0 ? `${value.toFixed(2)}x` : "-";
  }

  function renderAnalyticsMetricTable(containerId, rows, emptyMessage) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!rows || !rows.length) {
      container.innerHTML = `<div class="chart-empty">${escapeHtml(emptyMessage)}</div>`;
      return;
    }

    const body = rows
      .map((row) => {
        const valueClasses = ["metric-value-cell"];
        if (row.numeric) {
          valueClasses.push("is-numeric");
        }
        return [
          "<tr>",
          `<td class="metric-label">${escapeHtml(row.label)}</td>`,
          `<td class="${valueClasses.join(" ")}">${row.valueHtml || "-"}</td>`,
          "</tr>",
        ].join("");
      })
      .join("");

    container.innerHTML = [
      '<table class="table analytics-metric-table">',
      `<tbody>${body}</tbody>`,
      "</table>",
    ].join("");
  }

  function buildMetricValueHtml(primary, secondary) {
    return [
      '<span class="metric-value">',
      primary || "-",
      secondary ? `<span class="metric-subvalue">${secondary}</span>` : "",
      "</span>",
    ].join("");
  }

  function renderAnalyticsStateTable(analytics) {
    const note = document.getElementById("analytics-state-note");
    if (!analytics || !analytics.metrics.length) {
      if (note) {
        note.textContent = "Computed from current candidate vote files for the active state.";
      }
      renderAnalyticsMetricTable(
        "analytics-state-table",
        [],
        "Candidate vote files are needed to compute statewide diagnostics."
      );
      return;
    }

    if (note) {
      const closestLabel = analytics.closestRace
        ? `${analytics.closestRace.constituencyName} at ${formatPercent(analytics.closestRace.safetyMarginPct)}`
        : "not available";
      note.textContent = `Coverage ${analytics.coverageCount}/${analytics.totalConstituencies}. Closest contest: ${closestLabel}.`;
    }

    const seatLeaderSummary = analytics.seatLeader
      ? `${analytics.seatLeader.seats} seats led`
      : "No seat leader available";
    const closestSummary = analytics.closestRace
      ? `${escapeHtml(analytics.closestRace.constituencyName)}`
      : "No constituency selected";
    const rows = [
      {
        label: "Coverage",
        valueHtml: buildMetricValueHtml(
          escapeHtml(`${analytics.coverageCount}/${analytics.totalConstituencies}`),
          escapeHtml(`${formatPercent((analytics.coverageCount / Math.max(analytics.totalConstituencies, 1)) * 100)} of seats with candidate files`)
        ),
      },
      {
        label: "Average ENP",
        valueHtml: buildMetricValueHtml(escapeHtml(analytics.averageEnp.toFixed(2)), "Average fragmentation across covered seats"),
        numeric: true,
      },
      {
        label: "Average lead margin",
        valueHtml: buildMetricValueHtml(escapeHtml(formatPercent(analytics.averageSafetyMarginPct)), "Mean safety margin statewide"),
        numeric: true,
      },
      {
        label: "Median lead margin",
        valueHtml: buildMetricValueHtml(escapeHtml(formatPercent(analytics.medianSafetyMarginPct)), "Middle seat on safety margin"),
        numeric: true,
      },
      {
        label: "Average swing to flip",
        valueHtml: buildMetricValueHtml(escapeHtml(formatPercent(analytics.averageSwingToFlipPct)), "Two-way swing needed for a typical seat to change hands"),
        numeric: true,
      },
      {
        label: "Competitive seats",
        valueHtml: buildMetricValueHtml(
          escapeHtml(String(analytics.seatsUnderFivePct)),
          escapeHtml(`${formatPercent((analytics.seatsUnderFivePct / Math.max(analytics.coverageCount, 1)) * 100)} under 5% margin`)
        ),
        numeric: true,
      },
      {
        label: "Nail-biter seats",
        valueHtml: buildMetricValueHtml(
          escapeHtml(String(analytics.seatsUnderOnePct)),
          escapeHtml(`${formatPercent((analytics.seatsUnderOnePct / Math.max(analytics.coverageCount, 1)) * 100)} under 1% margin`)
        ),
        numeric: true,
      },
      {
        label: "Seat leader",
        valueHtml: buildMetricValueHtml(
          analytics.seatLeader ? renderPartyLabelMarkup(analytics.seatLeader.entity) : "-",
          escapeHtml(seatLeaderSummary)
        ),
      },
      {
        label: "Seat leader vote share",
        valueHtml: buildMetricValueHtml(
          escapeHtml(formatPercent(analytics.seatLeaderVoteSharePct)),
          "Share of counted votes across covered seats"
        ),
        numeric: true,
      },
      {
        label: "Seat leader seat share",
        valueHtml: buildMetricValueHtml(
          escapeHtml(formatPercent(analytics.seatLeaderSeatSharePct)),
          "Share of covered seats currently led"
        ),
        numeric: true,
      },
      {
        label: "Vote-to-seat conversion",
        valueHtml: buildMetricValueHtml(
          escapeHtml(formatRatio(analytics.voteToSeatConversionRatio)),
          "Seat share divided by vote share for the seat leader"
        ),
        numeric: true,
      },
      {
        label: "Votes per led seat",
        valueHtml: buildMetricValueHtml(
          escapeHtml(formatNumber(Math.round(analytics.votesPerLedSeat || 0))),
          "Counted votes attached to each currently led seat for the seat leader"
        ),
        numeric: true,
      },
      {
        label: "Closest contest",
        valueHtml: buildMetricValueHtml(
          escapeHtml(analytics.closestRace ? formatPercent(analytics.closestRace.safetyMarginPct) : "-"),
          closestSummary
        ),
        numeric: true,
      },
    ];

    renderAnalyticsMetricTable("analytics-state-table", rows, "Statewide diagnostics are not available.");
  }

  function renderAnalyticsConstituencyTable(metric) {
    const note = document.getElementById("analytics-constituency-note");
    if (!metric) {
      if (note) {
        note.textContent = "Click a constituency on the map to inspect seat-level diagnostics.";
      }
      renderAnalyticsMetricTable(
        "analytics-constituency-table",
        [],
        "Choose a constituency on the map to compute seat-level diagnostics."
      );
      return;
    }

    if (note) {
      note.textContent = `${metric.constituencyName}: computed from the latest candidate snapshot for this seat.`;
    }

    const rows = [
      {
        label: "Constituency",
        valueHtml: buildMetricValueHtml(
          escapeHtml(metric.constituencyName || "-"),
          escapeHtml([metric.district, metric.constituencyNo ? `AC ${metric.constituencyNo}` : ""].filter(Boolean).join(" · "))
        ),
      },
      {
        label: "Leader",
        valueHtml: buildMetricValueHtml(
          metric.leaderParty ? renderPartyLabelMarkup(metric.leaderParty) : "-",
          escapeHtml(metric.leaderCandidate || "-")
        ),
      },
      {
        label: "Runner-up",
        valueHtml: buildMetricValueHtml(
          metric.runnerUpParty ? renderPartyLabelMarkup(metric.runnerUpParty) : "-",
          escapeHtml(metric.runnerUpCandidate || "No runner-up yet")
        ),
      },
      {
        label: "Total votes counted",
        valueHtml: buildMetricValueHtml(escapeHtml(formatNumber(metric.totalVotes)), "Across all listed candidates"),
        numeric: true,
      },
      {
        label: "ENP",
        valueHtml: buildMetricValueHtml(escapeHtml(metric.enp.toFixed(2)), "Effective number of parties"),
        numeric: true,
      },
      {
        label: "Leader vote share",
        valueHtml: buildMetricValueHtml(escapeHtml(formatPercent(metric.leaderVoteSharePct)), "Current vote share of the leading candidate"),
        numeric: true,
      },
      {
        label: "Runner-up vote share",
        valueHtml: buildMetricValueHtml(escapeHtml(formatPercent(metric.runnerUpVoteSharePct)), "Current vote share of the second-placed candidate"),
        numeric: true,
      },
      {
        label: "Margin",
        valueHtml: buildMetricValueHtml(
          escapeHtml(formatNumber(metric.marginVotes)),
          escapeHtml(formatPercent(metric.safetyMarginPct))
        ),
        numeric: true,
      },
      {
        label: "Swing to flip",
        valueHtml: buildMetricValueHtml(
          escapeHtml(formatNumber(metric.swingToFlipVotes)),
          escapeHtml(formatPercent(metric.swingToFlipPct))
        ),
        numeric: true,
      },
      {
        label: "Top-two vote share",
        valueHtml: buildMetricValueHtml(escapeHtml(formatPercent(metric.topTwoSharePct)), "Combined vote share of leader and runner-up"),
        numeric: true,
      },
      {
        label: "Lead ratio",
        valueHtml: buildMetricValueHtml(
          escapeHtml(formatRatio(metric.leaderToRunnerUpRatio)),
          "Leader votes divided by runner-up votes"
        ),
        numeric: true,
      },
    ];

    renderAnalyticsMetricTable(
      "analytics-constituency-table",
      rows,
      "Constituency diagnostics are not available for this seat."
    );
  }

  function getRegionalGroupCounts(rows, groupingDefinition) {
    if (!groupingDefinition || !Array.isArray(groupingDefinition.groups) || !groupingDefinition.groups.length) {
      return [];
    }
    return getRegionalGroupBuckets(rows, groupingDefinition).map((bucket) => {
      const latestPartyCounts = bucket.rows.reduce((acc, row) => {
        const party = normalizeText(row.leadingParty);
        if (!party) return acc;
        acc[party] = (acc[party] || 0) + 1;
        return acc;
      }, {});

      const currentPartyRows = Object.entries(latestPartyCounts)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([party, seats], index) => ({
          party,
          seats,
          share: bucket.rows.length ? (seats / bucket.rows.length) * 100 : 0,
          color: getPartyColor(party, CHART_PALETTE[index % CHART_PALETTE.length]),
        }));

      return {
        key: bucket.key,
        label: bucket.label,
        seatCount: bucket.rows.length,
        currentPartyRows,
      };
    });
  }

  async function runWithConcurrency(items, limit, worker) {
    const results = new Array(items.length);
    let nextIndex = 0;

    async function consume() {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex;
        nextIndex += 1;
        results[currentIndex] = await worker(items[currentIndex], currentIndex);
      }
    }

    const workers = Array.from({ length: Math.min(limit, items.length) }, () => consume());
    await Promise.all(workers);
    return results;
  }

  async function ensureCandidateCurrentRowsLoaded(stateCode, constituencyNo) {
    const cacheKey = `${stateCode}-${padConstituencyNo(constituencyNo)}`;
    if (candidateCurrentCache[cacheKey]) {
      return candidateCurrentCache[cacheKey];
    }
    if (candidateCurrentPromises[cacheKey]) {
      return candidateCurrentPromises[cacheKey];
    }
    if (candidateDataCache[cacheKey] && candidateDataCache[cacheKey].currentRows) {
      candidateCurrentCache[cacheKey] = candidateDataCache[cacheKey].currentRows;
      return candidateCurrentCache[cacheKey];
    }

    candidateCurrentPromises[cacheKey] = (async () => {
      const text = await fetchOptionalCsv(dataApi.getCandidatewiseCurrentUrl(stateCode, constituencyNo));
      const rows = text ? normalizeCandidateRows(parseCsv(text)) : [];
      candidateCurrentCache[cacheKey] = rows;
      delete candidateCurrentPromises[cacheKey];
      return rows;
    })().catch((error) => {
      delete candidateCurrentPromises[cacheKey];
      throw error;
    });

    return candidateCurrentPromises[cacheKey];
  }

  async function ensureStateAnalyticsLoaded(stateKey) {
    const stateCode = getStateConfig(stateKey).code;
    if (stateAnalyticsCache[stateCode]) {
      return stateAnalyticsCache[stateCode];
    }
    if (stateAnalyticsPromises[stateCode]) {
      return stateAnalyticsPromises[stateCode];
    }

    stateAnalyticsPromises[stateCode] = (async () => {
      const rows = getCurrentStateConstituencyRows(stateKey);
      const metrics = [];

      await runWithConcurrency(rows, 10, async (row) => {
        const currentRows = await ensureCandidateCurrentRowsLoaded(stateCode, row.constituencyNo);
        const metric = computeConstituencyAnalytics(row, currentRows);
        if (metric) {
          metrics.push(metric);
        }
      });

      const summary = summarizeStateAnalytics(metrics, rows.length);
      const payload = {
        stateCode,
        metrics,
        metricsByKey: metrics.reduce((acc, item) => {
          acc[item.constituencyKey] = item;
          return acc;
        }, {}),
        ...summary,
      };

      stateAnalyticsCache[stateCode] = payload;
      delete stateAnalyticsPromises[stateCode];
      return payload;
    })().catch((error) => {
      delete stateAnalyticsPromises[stateCode];
      throw error;
    });

    return stateAnalyticsPromises[stateCode];
  }

  function renderAnalyticsPanel(analytics) {
    const safetyNote = document.getElementById("analytics-safety-note");
    renderSafetyLegend();
    renderAnalyticsStateTable(analytics);
    renderAnalyticsConstituencyTable(getSelectedAnalyticsMetric());

    if (safetyNote) {
      if (!analytics) {
        safetyNote.textContent = "Analytics mode recolors the map using current candidate vote files for the active state.";
      } else {
        const closest = analytics.closestRace
          ? `${analytics.closestRace.constituencyName} at ${formatPercent(analytics.closestRace.safetyMarginPct)}`
          : "not available";
        safetyNote.textContent = `Coverage: ${analytics.coverageCount}/${analytics.totalConstituencies} constituencies. Average safety margin: ${formatPercent(analytics.averageSafetyMarginPct)}. Closest race: ${closest}.`;
      }
    }
  }

  function loadAnalyticsTab() {
    renderSafetyLegend();
    renderAnalyticsStateTable(null);
    renderAnalyticsConstituencyTable(getSelectedAnalyticsMetric());

    if (!dataApi) {
      return;
    }

    const requestedStateCode = getStateConfig(activeStateKey).code;
    const stateCode = getStateConfig(activeStateKey).code;
    const cached = stateAnalyticsCache[stateCode];
    if (cached) {
      renderAnalyticsPanel(cached);
      renderMap();
      updateSelectedAnalyticsFields();
      return;
    }

    const safetyNote = document.getElementById("analytics-safety-note");
    if (safetyNote) {
      safetyNote.textContent = "Loading candidate vote files for this state to compute analytics...";
    }
    const stateContainer = document.getElementById("analytics-state-table");
    if (stateContainer) {
      stateContainer.innerHTML = '<div class="chart-empty">Loading statewide diagnostics...</div>';
    }
    const constituencyContainer = document.getElementById("analytics-constituency-table");
    if (constituencyContainer && selectedConstituency) {
      constituencyContainer.innerHTML = '<div class="chart-empty">Loading constituency diagnostics...</div>';
    }

    ensureStateAnalyticsLoaded(activeStateKey)
      .then((analytics) => {
        if (requestedStateCode !== getStateConfig(activeStateKey).code) {
          return;
        }
        renderAnalyticsPanel(analytics);
        if (activeViewTab === "analytics") {
          renderMap();
        }
        updateSelectedAnalyticsFields();
      })
      .catch((error) => {
        console.error(error);
        if (safetyNote) {
          safetyNote.textContent = `Failed to compute analytics: ${error.message}`;
        }
        if (stateContainer) {
          stateContainer.innerHTML = `<div class="chart-empty">Failed to compute analytics: ${error.message}</div>`;
        }
        if (constituencyContainer && !selectedConstituency) {
          renderAnalyticsConstituencyTable(null);
        } else if (constituencyContainer) {
          constituencyContainer.innerHTML = `<div class="chart-empty">Failed to compute analytics: ${error.message}</div>`;
        }
      });
  }

  function setActiveTab(tabName) {
    activeViewTab = tabName;
    document.querySelectorAll(".page-tab-button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.tab === tabName);
    });

    const overviewPanel = document.getElementById("overview-panel");
    const regionalPanel = document.getElementById("regional-panel");
    const analyticsPanel = document.getElementById("analytics-panel");
    if (overviewPanel) overviewPanel.hidden = tabName !== "overview";
    if (regionalPanel) regionalPanel.hidden = true;
    if (analyticsPanel) analyticsPanel.hidden = tabName !== "analytics";

    syncDashboardLayout();
    renderMap();
    updateSelectedAnalyticsFields();

    if (tabName !== "regional") {
      renderPartyTable();
    }

    if (tabName === "regional") {
      loadRegionalTab();
    }
    if (tabName === "analytics") {
      loadAnalyticsTab();
    }
  }

  function bindSeatTrendControls() {
    document.querySelectorAll("#seat-trend-grouping .segment-button").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.disabled) return;
        seatTrendGrouping = button.dataset.grouping;
        renderSeatTrendChart();
      });
    });

    document.querySelectorAll("#seat-trend-metric .segment-button").forEach((button) => {
      button.addEventListener("click", () => {
        seatTrendMetric = button.dataset.metric;
        renderSeatTrendChart();
      });
    });
  }

  function bindRegionalControls() {
    const select = document.getElementById("regional-group-select");
    if (!select) return;
    select.addEventListener("change", () => {
      activeRegionalGroupingKey = select.value || "";
      if (activeViewTab === "regional") {
        loadRegionalTab();
      }
    });
  }

  function refreshRegionalGroupSelectOptions() {
    const select = document.getElementById("regional-group-select");
    if (!select) return;
    const filter = select.closest(".regional-filter");

    const definitions = getAvailableRegionalDefinitions(activeStateKey).sort(([, definitionA], [, definitionB]) =>
      String(definitionA.label || "").localeCompare(String(definitionB.label || ""))
    );
    const availableKeys = new Set(definitions.map(([key]) => key));
    if (!availableKeys.has(activeRegionalGroupingKey)) {
      activeRegionalGroupingKey = definitions.length ? definitions[0][0] : "";
    }

    select.innerHTML = definitions
      .map(([key, definition]) => `<option value="${key}">${definition.label}</option>`)
      .join("");
    select.value = activeRegionalGroupingKey;
    if (filter) {
      filter.hidden = definitions.length <= 1;
    } else {
      select.hidden = definitions.length <= 1;
    }
  }

  async function ensureStatePartyHistoryLoaded(stateKey) {
    const stateCode = getStateConfig(stateKey).code;
    if (statePartyHistoryCache[stateCode]) {
      return statePartyHistoryCache[stateCode];
    }
    if (statePartyHistoryPromises[stateCode]) {
      return statePartyHistoryPromises[stateCode];
    }

    statePartyHistoryPromises[stateCode] = (async () => {
      const url = dataApi.getPartywiseHistoryUrl(stateCode);
      const text = await fetchOptionalCsv(url);
      const rawRows = text
        ? normalizePartyRows(parseCsv(text)).filter((row) => row.stateCode === stateCode && hasValidTimestamp(row))
        : [];
      const rows = filterIncompletePartyHistoryRows(rawRows);
      statePartyHistoryCache[stateCode] = rows;
      delete statePartyHistoryPromises[stateCode];
      return rows;
    })().catch((error) => {
      delete statePartyHistoryPromises[stateCode];
      throw error;
    });

    return statePartyHistoryPromises[stateCode];
  }

  async function ensureStatewideHistoryLoaded(stateKey) {
    const stateCode = getStateConfig(stateKey).code;
    if (statewideHistoryCache[stateCode]) {
      return statewideHistoryCache[stateCode];
    }
    if (statewideHistoryPromises[stateCode]) {
      return statewideHistoryPromises[stateCode];
    }

    statewideHistoryPromises[stateCode] = (async () => {
      const url = dataApi.getStatewideTrendsHistoryUrl(stateCode);
      const text = await fetchOptionalCsv(url);
      const rows = text
        ? normalizeConstituencyRows(parseCsv(text)).filter((row) => row.stateCode === stateCode && hasValidTimestamp(row))
        : [];
      statewideHistoryCache[stateCode] = rows;
      delete statewideHistoryPromises[stateCode];
      return rows;
    })().catch((error) => {
      delete statewideHistoryPromises[stateCode];
      throw error;
    });

    return statewideHistoryPromises[stateCode];
  }

  async function ensureCandidateDataLoaded(stateCode, constituencyNo) {
    const cacheKey = `${stateCode}-${padConstituencyNo(constituencyNo)}`;
    if (candidateDataCache[cacheKey]) {
      return candidateDataCache[cacheKey];
    }
    if (candidateDataPromises[cacheKey]) {
      return candidateDataPromises[cacheKey];
    }

    candidateDataPromises[cacheKey] = (async () => {
      const [currentText, historyText] = await Promise.all([
        fetchOptionalCsv(dataApi.getCandidatewiseCurrentUrl(stateCode, constituencyNo)),
        fetchOptionalCsv(dataApi.getCandidatewiseHistoryUrl(stateCode, constituencyNo)),
      ]);

      const currentRows = currentText ? normalizeCandidateRows(parseCsv(currentText)) : [];
      const historyRows = historyText
        ? normalizeCandidateRows(parseCsv(historyText)).filter((row) => hasValidTimestamp(row))
        : [];
      const latestHistoryRows = getLatestTimestampGroup(historyRows, hasMeaningfulCandidateValue);

      const payload = {
        currentRows: currentRows.length ? currentRows : latestHistoryRows,
        historyRows,
      };
      candidateDataCache[cacheKey] = payload;
      candidateCurrentCache[cacheKey] = payload.currentRows;
      delete candidateDataPromises[cacheKey];
      return payload;
    })().catch((error) => {
      delete candidateDataPromises[cacheKey];
      throw error;
    });

    return candidateDataPromises[cacheKey];
  }

  function loadStateAnalytics() {
    if (!dataApi) {
      setChartEmptyState("seat-trend-chart", "Waiting for election history data...");
      clearLegend("seat-trend-legend");
      return;
    }

    renderSeatTrendChart();
    ensureStatePartyHistoryLoaded(activeStateKey)
      .then(() => {
        if (getStateConfig(activeStateKey).code) {
          renderSeatTrendChart();
        }
      })
      .catch((error) => {
        console.error(error);
        setChartEmptyState("seat-trend-chart", `Failed to load seat history: ${error.message}`);
      });
  }

  function loadRegionalTab() {
    const container = document.getElementById("party-analysis-table");
    if (container) {
      container.innerHTML = '<div class="chart-empty">Loading regional party performance...</div>';
    }
    if (!dataApi && !constituencyRows.length) {
      return;
    }

    loadRegionalGroupDefinitions()
      .then(() => {
        refreshRegionalGroupSelectOptions();
        const rows = getCurrentStateConstituencyRows(activeStateKey);
        const groupingDefinition = getRegionalGroupingDefinition();
        renderRegionalPartyPanel(getRegionalGroupCounts(rows, groupingDefinition), groupingDefinition);
        if (activeViewTab === "regional") {
          renderMap();
        }
      })
      .catch((error) => {
        console.error(error);
        if (container) {
          container.innerHTML = `<div class="chart-empty">Failed to load regional party performance: ${error.message}</div>`;
        }
      });
  }

  function loadSelectedConstituencyAnalytics() {
    if (!dataApi) {
      setChartEmptyState("candidate-trend-chart", "Waiting for constituency data...");
      clearLegend("candidate-trend-legend");
      renderCandidateTable([]);
      if (activeViewTab === "analytics") {
        renderAnalyticsConstituencyTable(null);
      }
      return;
    }

    if (!selectedConstituency || !selectedConstituency.stateCode || !selectedConstituency.constituencyNo) {
      setChartEmptyState(
        "candidate-trend-chart",
        "Candidate-level data is not available for this selection."
      );
      clearLegend("candidate-trend-legend");
      renderCandidateTable([]);
      if (activeViewTab === "analytics") {
        renderAnalyticsConstituencyTable(null);
      }
      return;
    }

    setChartEmptyState("candidate-trend-chart", "Loading constituency history...");
    renderCandidateTable([]);
    if (activeViewTab === "analytics") {
      const container = document.getElementById("analytics-constituency-table");
      if (container) {
        container.innerHTML = '<div class="chart-empty">Loading constituency diagnostics...</div>';
      }
    }

    const activeSelectionKey = `${selectedConstituency.stateCode}-${selectedConstituency.constituencyNoPadded}`;
    ensureCandidateDataLoaded(selectedConstituency.stateCode, selectedConstituency.constituencyNo)
      .then((data) => {
        if (!selectedConstituency) return;
        const currentSelectionKey = `${selectedConstituency.stateCode}-${selectedConstituency.constituencyNoPadded}`;
        if (activeSelectionKey !== currentSelectionKey) return;
        const metric = computeConstituencyAnalytics(selectedConstituency.row || {}, data.currentRows);
        updateSelectedAnalyticsFields(metric);
        if (activeViewTab === "analytics") {
          renderAnalyticsConstituencyTable(metric);
        }
        renderCandidateTrendPanel(data);
      })
      .catch((error) => {
        console.error(error);
        setChartEmptyState("candidate-trend-chart", `Failed to load candidate data: ${error.message}`);
        clearLegend("candidate-trend-legend");
        if (activeViewTab === "analytics") {
          const container = document.getElementById("analytics-constituency-table");
          if (container) {
            container.innerHTML = `<div class="chart-empty">Failed to compute constituency diagnostics: ${error.message}</div>`;
          }
        }
      });
  }

  function setActiveState(stateKey) {
    activeStateKey = stateKey;
    selectedConstituency = null;
    document.querySelectorAll(".state-button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.key === stateKey);
    });
    refreshRegionalGroupSelectOptions();
    resetSelectedConstituency();
    renderMap();
    renderPartyTable();
    loadStateAnalytics();
    if (activeViewTab === "regional") {
      loadRegionalTab();
    }
    if (activeViewTab === "analytics") {
      loadAnalyticsTab();
    }

    ensureMapDataLoaded(stateKey)
      .then(() => {
        if (activeStateKey !== stateKey) return;
        renderMap();
        restoreSelectedConstituencySelection();
      })
      .catch((error) => {
        console.error("Map load failed:", error);
        if (activeStateKey !== stateKey) return;
        const mapRoot = document.getElementById("map-root");
        if (mapRoot) {
          mapRoot.innerHTML = `<div class="error-msg">Map load failed: ${error.message}</div>`;
        }
      });
  }

  async function loadData() {
    const activeMapReady = Boolean(getFeatureMapData(activeStateKey));
    setDataStatus(`Checking data... (Boundary ${activeMapReady ? "ready" : "loading"})`, "neutral");

    dataApi = await loadDataApi();
    if (!dataApi) {
      setDataStatus("Configure ELECTION_DATA_MANIFEST_URL, R2_PUBLIC_URL, or use ?data=fixture.", "warn");
      return;
    }

    window.ELECTION_DATA_API = dataApi;

    const constituencyUrl = dataApi.summary.statewideTrends.current;

    if (!constituencyUrl) {
      setDataStatus("Data layout manifest is missing the statewide current summary endpoint.", "error");
      return;
    }

    try {
      const constituencyCsv = await fetchCsv(constituencyUrl);
      constituencyRows = normalizeConstituencyRows(parseCsv(constituencyCsv));
      partyRows = buildDerivedPartyRows(constituencyRows);
      setDataStatus("Loaded constituency data. Current party standing is derived from live constituency leads.", "success");
    } catch (error) {
      console.error(error);
      setDataStatus(`Data load failed: ${error.message}`, "error");
    }
  }

  function clearCachedObject(store) {
    Object.keys(store).forEach((key) => {
      delete store[key];
    });
  }

  function clearDashboardCaches() {
    [
      statePartyHistoryCache,
      statePartyHistoryPromises,
      statewideHistoryCache,
      statewideHistoryPromises,
      candidateDataCache,
      candidateDataPromises,
      candidateCurrentCache,
      candidateCurrentPromises,
      stateAnalyticsCache,
      stateAnalyticsPromises,
    ].forEach(clearCachedObject);
  }

  async function refreshDashboardData() {
    if (isRefreshingData) {
      return;
    }

    isRefreshingData = true;
    setRefreshButtonState(true);
    clearDashboardCaches();
    setDataStatus("Refreshing live counting data...", "neutral");

    try {
      await loadData();
      renderMap();
      renderPartyTable();
      restoreSelectedConstituencySelection();
      loadStateAnalytics();
      if (selectedConstituency) {
        loadSelectedConstituencyAnalytics();
      }
      if (activeViewTab === "regional") {
        loadRegionalTab();
      }
      if (activeViewTab === "analytics") {
        loadAnalyticsTab();
      }
    } finally {
      isRefreshingData = false;
      setRefreshButtonState(false);
    }
  }

  function bindStateButtons() {
    document.querySelectorAll(".state-button").forEach((button) => {
      button.addEventListener("click", () => setActiveState(button.dataset.key));
    });
  }

  function bindPageTabs() {
    document.querySelectorAll(".page-tab-button").forEach((button) => {
      button.addEventListener("click", () => setActiveTab(button.dataset.tab));
    });
  }

  function bindRefreshButton() {
    const button = document.getElementById("refresh-dashboard-button");
    if (!button) return;
    button.addEventListener("click", () => {
      refreshDashboardData().catch((error) => {
        console.error("Dashboard refresh failed:", error);
        setDataStatus(`Refresh failed: ${error.message}`, "error");
        isRefreshingData = false;
        setRefreshButtonState(false);
      });
    });
  }

  function bindLiveAutoRefresh() {
    if (liveAutoRefreshTimer) {
      window.clearInterval(liveAutoRefreshTimer);
      liveAutoRefreshTimer = null;
    }
    if (getDatasetMode() !== "live") {
      return;
    }
    liveAutoRefreshTimer = window.setInterval(() => {
      refreshDashboardData().catch((error) => {
        console.error("Auto-refresh failed:", error);
      });
    }, LIVE_AUTO_REFRESH_INTERVAL_MS);
  }

  async function initializeDashboard() {
    bindStateButtons();
    bindPageTabs();
    bindRefreshButton();
    bindLiveAutoRefresh();
    bindSeatTrendControls();
    bindRegionalControls();
    loadRegionalGroupDefinitions().then(() => {
      refreshRegionalGroupSelectOptions();
    });

    const mapRoot = document.getElementById("map-root");
    if (mapRoot) {
      mapRoot.innerHTML = '<div style="padding: 2rem; color: #666;">Initializing map boundaries...</div>';
    }

    resetSelectedConstituency();
    setActiveTab("overview");

    try {
      setActiveState(activeStateKey);
    } catch (error) {
      console.error("Initial render failed:", error);
      if (mapRoot) mapRoot.innerHTML = `<div class="error-msg">Initial render error: ${error.message}</div>`;
    }

    loadData()
      .then(() => {
        setActiveState(activeStateKey);
      })
      .catch((error) => {
        console.error("Dashboard background data load failed:", error);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeDashboard);
  } else {
    initializeDashboard();
  }
})();
