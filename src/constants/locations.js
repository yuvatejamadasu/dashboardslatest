export const LOCATIONS = {
  "India": {
    "Andhra Pradesh": {
      "Coastal": {
        "Visakhapatnam": {
          "Vizag Hub 1": ["Vizag Store 1", "Vizag Store 2"],
          "Vizag Hub 2": ["Coastal Store A"]
        }
      }
    },
    "Karnataka": {
      "Bengaluru": {
        "Whitefield": {
          "Hub A": ["Store A1", "Store A2"],
          "Hub B": ["Store B1", "Store B2"]
        },
        "Koramangala": {
          "Hub C": ["Store C1"],
          "Hub D": ["Store D1"]
        }
      },
      "Mysuru": {
        "Mysuru City": {
          "MYS Hub 1": ["MYS Store Alpha"]
        }
      }
    },
    "Kerala": {
      "Kochi": {
        "Ernakulam": {
          "Kochi Hub 1": ["Kochi Store 1"]
        }
      },
      "Thiruvananthapuram": {
        "Trivandrum": {
          "TVM Hub 1": ["TVM Store A"]
        }
      }
    },
    "Tamil Nadu": {
      "Chennai": {
        "OMR": {
          "Chennai Hub 1": ["Chennai Store 1"]
        }
      }
    },
    "Maharashtra": {
      "Mumbai": {
        "Andheri": {
          "Mumbai Hub 1": ["Mumbai Store 1"]
        }
      }
    },
    "Gujarat": {
      "Ahmedabad": {
        "Navrangpura": {
          "Ahmedabad Hub 1": ["Ahmedabad Store 1"]
        }
      }
    },
    "Telangana": {
      "Hyderabad": {
        "Madhapur": {
          "Hitech Hub": ["Madhapur Store 1", "Madhapur Store 2"]
        }
      }
    }
  },
  "Kenya": {
    "Nairobi": {
      "Central": {
        "Nairobi Branch": {
          "Nairobi Hub 1": ["Nairobi Store 1"]
        }
      }
    },
    "Mombasa": {
      "Coast": {
        "Mombasa Branch": {
          "Mombasa Hub 1": ["Mombasa Store 1"]
        }
      }
    }
  }
};



export const getStates = (country) => {
  if (!country) return [];
  const countryData = LOCATIONS[country];
  const staticStates = countryData ? Object.keys(countryData) : [];
  
  let rawDynamic = [];
  try {
    rawDynamic = JSON.parse(localStorage.getItem('stateAdminAccounts') || '[]');
  } catch (e) { }
  if (!Array.isArray(rawDynamic)) rawDynamic = [];

  const dynamicStates = rawDynamic
    .filter(s => (s.country === country || (!s.country && country === 'India')) && s.state)
    .map(s => s.state);

  return [...new Set([...staticStates, ...dynamicStates])].sort();
};


export const getRegions = (country, state) => {
  if (!country || !state) return [];
  const countryData = LOCATIONS[country];
  const stateData = countryData ? countryData[state] : null;
  const staticRegions = stateData ? Object.keys(stateData) : [];

  let rawDynamic = [];
  try { rawDynamic = JSON.parse(localStorage.getItem('regionAccounts') || '[]'); } catch (e) { }
  if (!Array.isArray(rawDynamic)) rawDynamic = [];

  const dynamicRegions = rawDynamic
    .filter(r => (r.country === country || (!r.country && country === 'India')) && r.state === state && (r.regionName || r.region))
    .map(r => r.regionName || r.region);
  return [...new Set([...staticRegions, ...dynamicRegions])].sort();
};

export const getBranches = (country, state, region) => {
  if (!country || !state || !region) return [];
  const countryData = LOCATIONS[country];
  const stateData = countryData ? countryData[state] : null;
  const staticBranches = stateData && stateData[region] ? Object.keys(stateData[region]) : [];

  let rawDynamic = [];
  try { rawDynamic = JSON.parse(localStorage.getItem('branchAccounts') || '[]'); } catch (e) { }
  if (!Array.isArray(rawDynamic)) rawDynamic = [];

  const dynamicBranches = rawDynamic
    .filter(b => (b.country === country || (!b.country && country === 'India')) && b.state === state && (b.regionName === region || b.region === region) && (b.branchName || b.branch))
    .map(b => b.branchName || b.branch);
  return [...new Set([...staticBranches, ...dynamicBranches])].sort();
};

export const getHubs = (country) => {
  const staticHubs = [
    "Prime Center 1",
    "Prime Center 2",
    "Alpha Location",
    "Beta Location"
  ];

  let rawDynamic = [];
  try { rawDynamic = JSON.parse(localStorage.getItem('hubAccounts') || '[]'); } catch (e) { }
  if (!Array.isArray(rawDynamic)) rawDynamic = [];

  const dynamicHubs = rawDynamic
    .filter(h => (!country || h.country === country || (!h.country && country === 'India')) && (h.hubName || h.hub))
    .map(h => h.hubName || h.hub);
  return [...new Set([...staticHubs, ...dynamicHubs])].sort();
};

export const getStores = (country) => {
  const staticStores = [
    "Prime Center 1",
    "Prime Center 2",
    "Alpha Location",
    "Beta Location"
  ];

  let rawDynamic = [];
  try { rawDynamic = JSON.parse(localStorage.getItem('storeAccounts') || '[]'); } catch (e) { }
  if (!Array.isArray(rawDynamic)) rawDynamic = [];

  const dynamicStores = rawDynamic
    .filter(s => (!country || s.country === country || (!s.country && country === 'India')) && (s.storeName || s.store))
    .map(s => s.storeName || s.store);
    
  return [...new Set([...staticStores, ...dynamicStores])].sort();
};



