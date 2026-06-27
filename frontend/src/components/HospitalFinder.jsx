import { useEffect, useMemo, useRef, useState } from 'react';
import { HYDERABAD_HOSPITALS } from '../utils/hyderabadData';
import { getDistance } from '../utils/haversine';

const normalizeText = (value = '') => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const tokenize = (value = '') => value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

const levenshteinDistance = (a = '', b = '') => {
  const left = normalizeText(a);
  const right = normalizeText(b);

  if (!left.length) return right.length;
  if (!right.length) return left.length;

  const matrix = Array.from({ length: left.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= right.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= left.length; i++) {
    for (let j = 1; j <= right.length; j++) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[left.length][right.length];
};

const similarityScore = (query, target) => {
  const left = normalizeText(query);
  const right = normalizeText(target);
  if (!left || !right) return 0;

  if (right.includes(left)) return 1;

  const distance = levenshteinDistance(left, right);
  const base = 1 - distance / Math.max(left.length, right.length);
  return Math.max(0, base);
};

const NEAR_INTENT_WORDS = new Set(['near', 'nearest', 'close', 'around', 'nearby', 'at', 'in']);
const NEAR_ME_TOKENS = new Set(['me', 'mylocation', 'currentlocation', 'here']);

const QUICK_SEARCH_CHIPS = [
  { label: 'Near Me', query: 'hospitals near me' },
  { label: 'Near Hitech City', query: 'hospitals near hitech city' },
  { label: 'Near Gachibowli', query: 'hospitals near gachibowli' },
  { label: 'Near LB Nagar', query: 'hospitals near lb nagar' },
  { label: 'Near Secunderabad', query: 'hospitals near secunderabad' },
  { label: 'Trauma Centers', query: 'trauma center' }
];

const LANDMARK_ANCHORS = [
  { name: 'Kukatpally', lat: 17.4933, lng: 78.3997 },
  { name: 'Dilsukhnagar', lat: 17.3689, lng: 78.5247 },
  { name: 'Charminar', lat: 17.3616, lng: 78.4747 },
  { name: 'Miyapur', lat: 17.4948, lng: 78.3560 },
  { name: 'Uppal', lat: 17.4058, lng: 78.5591 },
  { name: 'Shamshabad', lat: 17.2403, lng: 78.4294 },
  { name: 'Kondapur', lat: 17.4653, lng: 78.3625 }
];

const extractSearchIntent = (query) => {
  const cleaned = (query || '').trim();
  const tokens = tokenize(cleaned);

  if (tokens.length === 0) {
    return { rawQuery: '', freeText: '', areaHint: '' };
  }

  const nearIndex = tokens.findIndex((token) => NEAR_INTENT_WORDS.has(token));

  if (nearIndex !== -1 && nearIndex < tokens.length - 1) {
    const areaHint = tokens.slice(nearIndex + 1).join(' ');
    const freeText = tokens.slice(0, nearIndex).join(' ');
    return { rawQuery: cleaned, freeText, areaHint };
  }

  // Also catch natural phrasing like "hospitals gachibowli" by stripping generic words.
  const generic = new Set(['hospital', 'hospitals', 'find', 'search', 'show', 'me']);
  const nonGeneric = tokens.filter((token) => !generic.has(token));

  return {
    rawQuery: cleaned,
    freeText: nonGeneric.join(' '),
    areaHint: nonGeneric.length <= 2 ? nonGeneric.join(' ') : ''
  };
};

const getLocationCenterByArea = (hospitals) => {
  const grouped = hospitals.reduce((acc, hospital) => {
    const key = normalizeText(hospital.area);
    if (!key) return acc;
    if (!acc[key]) {
      acc[key] = { latSum: 0, lngSum: 0, count: 0, label: hospital.area };
    }
    acc[key].latSum += hospital.lat;
    acc[key].lngSum += hospital.lng;
    acc[key].count += 1;
    return acc;
  }, {});

  return Object.values(grouped).map((item) => ({
    area: item.label,
    areaKey: normalizeText(item.label),
    lat: item.latSum / item.count,
    lng: item.lngSum / item.count
  }));
};

const buildSearchAnchors = (hospitals, areaCenters) => {
  const areaAnchors = areaCenters.map((center) => ({
    ...center,
    label: center.area,
    kind: 'area'
  }));

  const hospitalAnchors = hospitals.map((hospital) => ({
    lat: hospital.lat,
    lng: hospital.lng,
    label: `${hospital.name}, ${hospital.area}`,
    area: hospital.area,
    kind: 'hospital'
  }));

  const landmarkAnchors = LANDMARK_ANCHORS.map((landmark) => ({
    lat: landmark.lat,
    lng: landmark.lng,
    label: landmark.name,
    area: landmark.name,
    kind: 'landmark'
  }));

  return [...areaAnchors, ...hospitalAnchors, ...landmarkAnchors];
};

const pickBestSearchAnchor = (locationHint, anchors) => {
  const hint = (locationHint || '').trim();
  const normalizedHint = normalizeText(hint);
  if (!normalizedHint) return null;

  const queryTokens = tokenize(hint);
  let bestAnchor = null;
  let bestScore = 0;

  anchors.forEach((anchor) => {
    const label = anchor.label || anchor.area || '';
    const labelNorm = normalizeText(label);
    const labelTokens = tokenize(label);

    const textScore = similarityScore(normalizedHint, labelNorm);
    const tokenScore = queryTokens.length
      ? queryTokens.reduce((sum, token) => {
        const tokenBest = labelTokens.reduce((best, candidate) => Math.max(best, similarityScore(token, candidate)), 0);
        return sum + tokenBest;
      }, 0) / queryTokens.length
      : 0;

    const containsBonus = labelNorm.includes(normalizedHint) || normalizedHint.includes(labelNorm) ? 0.2 : 0;
    const score = Math.min(1, (textScore * 0.65) + (tokenScore * 0.35) + containsBonus);

    if (score > bestScore) {
      bestScore = score;
      bestAnchor = { ...anchor, matchScore: score };
    }
  });

  return bestScore >= 0.48 ? bestAnchor : null;
};

const pickBestAreaCenter = (areaHint, centers) => {
  const hint = normalizeText(areaHint);
  if (!hint) return null;

  let best = null;
  let bestScore = 0;

  centers.forEach((center) => {
    const score = similarityScore(hint, center.areaKey);
    if (score > bestScore) {
      bestScore = score;
      best = center;
    }
  });

  return bestScore >= 0.55 ? best : null;
};

const getSearchSuggestions = (query, hospitals, areaCenters, anchors) => {
  if (!query || !query.trim()) return [];

  const intent = extractSearchIntent(query);
  const q = intent.freeText || intent.areaHint || intent.rawQuery;
  const baseQuery = q.trim();

  const hospitalSuggestions = hospitals
    .map((hospital) => ({
      value: hospital.name,
      score: Math.max(
        similarityScore(baseQuery, hospital.name),
        similarityScore(baseQuery, `${hospital.name} ${hospital.area}`)
      )
    }))
    .filter((item) => item.score >= 0.45)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.value);

  const areaSuggestions = anchors
    .map((anchor) => ({
      value: `hospitals near ${anchor.label}`,
      score: similarityScore(intent.areaHint || baseQuery, anchor.label)
    }))
    .filter((item) => item.score >= 0.45)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.value);

  const finalSuggestions = [...hospitalSuggestions, ...areaSuggestions];
  return finalSuggestions.filter((value, index) => finalSuggestions.indexOf(value) === index).slice(0, 6);
};

const HospitalFinder = ({ currentLocation, onSelectHospital }) => {
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationSearchMode, setLocationSearchMode] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef(null);

  // Calculate distance from ambulance to each hospital
  const hospitalsWithDistance = HYDERABAD_HOSPITALS.map(h => ({
    ...h,
    distanceMeters: currentLocation
      ? getDistance(currentLocation.lat, currentLocation.lng, h.lat, h.lng)
      : null,
  })).sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity));

  const types = ['All', ...new Set(HYDERABAD_HOSPITALS.map(h => h.type))];
  
  const areaCenters = useMemo(() => getLocationCenterByArea(HYDERABAD_HOSPITALS), []);
  const searchAnchors = useMemo(() => buildSearchAnchors(HYDERABAD_HOSPITALS, areaCenters), [areaCenters]);
  const searchIntent = extractSearchIntent(searchQuery);
  const hasNearIntent = NEAR_INTENT_WORDS.has(tokenize(searchIntent.rawQuery).find((token) => NEAR_INTENT_WORDS.has(token)));
  const locationQueryText = locationSearchMode
    ? (searchIntent.rawQuery || '').trim()
    : (searchIntent.areaHint || '').trim();
  const isNearMeQuery = NEAR_ME_TOKENS.has(normalizeText(searchIntent.areaHint));
  const isLocationNearMe = NEAR_ME_TOKENS.has(normalizeText(locationQueryText));
  
  // In location mode, try harder to find a match with lower threshold
  let matchedAnchor = null;
  if ((isNearMeQuery || isLocationNearMe) && currentLocation) {
    matchedAnchor = { label: 'Your Location', lat: currentLocation.lat, lng: currentLocation.lng, kind: 'current' };
  } else if (locationQueryText) {
    // Try with standard threshold first
    matchedAnchor = pickBestSearchAnchor(locationQueryText, searchAnchors);
    
    // In location mode, if no strong match found, try best-effort with any similarity
    if (!matchedAnchor && locationSearchMode) {
      let bestAnchor = null;
      let bestScore = 0;
      searchAnchors.forEach((anchor) => {
        const score = similarityScore(locationQueryText, normalizeText(anchor.label || anchor.area || ''));
        if (score > bestScore) {
          bestScore = score;
          bestAnchor = { ...anchor, matchScore: score };
        }
      });
      if (bestScore > 0.25) {
        matchedAnchor = bestAnchor;
      }
    }
  }
  
  const areaCenter = matchedAnchor
    ? { area: matchedAnchor.label, lat: matchedAnchor.lat, lng: matchedAnchor.lng }
    : pickBestAreaCenter(locationQueryText || searchIntent.areaHint, areaCenters);
  const searchSuggestions = useMemo(
    () => getSearchSuggestions(searchQuery, HYDERABAD_HOSPITALS, areaCenters, searchAnchors),
    [searchQuery, areaCenters, searchAnchors]
  );
  const supportsVoiceSearch = typeof window !== 'undefined' && (
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  );

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Apply both type filter and search filter
  let filtered = filterType === 'All' ? hospitalsWithDistance : hospitalsWithDistance.filter(h => h.type === filterType);

  const scoredHospitals = filtered.map((hospital) => {
    const nameScore = similarityScore(searchIntent.freeText || searchIntent.rawQuery, hospital.name);
    const areaScore = similarityScore(searchIntent.areaHint || searchIntent.freeText || searchIntent.rawQuery, hospital.area);
    const typeScore = similarityScore(searchIntent.freeText || searchIntent.rawQuery, hospital.type);

    const tokenHits = tokenize(`${hospital.name} ${hospital.area} ${hospital.type}`)
      .filter((token) => {
        if (!searchIntent.rawQuery) return false;
        return tokenize(searchIntent.rawQuery).some((queryToken) => similarityScore(queryToken, token) >= 0.78);
      }).length;

    let nearbyAreaBoost = 0;
    let distanceFromAnchorMeters = Infinity;
    if (areaCenter) {
      distanceFromAnchorMeters = getDistance(areaCenter.lat, areaCenter.lng, hospital.lat, hospital.lng);
      nearbyAreaBoost = Math.max(0, 1 - distanceFromAnchorMeters / 12000);
    }

    const relevanceScore =
      (nameScore * 0.52) +
      (areaScore * 0.28) +
      (typeScore * 0.2) +
      (Math.min(tokenHits, 4) * 0.08) +
      (nearbyAreaBoost * 0.45);

    return {
      ...hospital,
      relevanceScore,
      nearbyAreaBoost,
      distanceFromAnchorMeters,
    };
  });

  if (searchIntent.rawQuery && locationSearchMode) {
    if (areaCenter) {
      // Location mode with detected location: sort by physical nearness to that location.
      filtered = scoredHospitals.sort((a, b) => {
        if (a.distanceFromAnchorMeters !== b.distanceFromAnchorMeters) {
          return a.distanceFromAnchorMeters - b.distanceFromAnchorMeters;
        }
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        return (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity);
      });
    } else {
      // Location mode but location not recognized: show by relevance + current location
      filtered = scoredHospitals
        .sort((a, b) => {
          if (b.relevanceScore !== a.relevanceScore) {
            return b.relevanceScore - a.relevanceScore;
          }
          return (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity);
        });
    }
  } else if (searchIntent.rawQuery && hasNearIntent && areaCenter) {
    // For explicit near-intent queries, prioritize hospitals physically closest to the requested place.
    filtered = scoredHospitals.sort((a, b) => {
      if (a.distanceFromAnchorMeters !== b.distanceFromAnchorMeters) {
        return a.distanceFromAnchorMeters - b.distanceFromAnchorMeters;
      }
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity);
    });
  } else if (searchIntent.rawQuery) {
    filtered = scoredHospitals
      .filter((hospital) => hospital.relevanceScore >= 0.35)
      .sort((a, b) => {
        if (areaCenter && b.nearbyAreaBoost !== a.nearbyAreaBoost) {
          return b.nearbyAreaBoost - a.nearbyAreaBoost;
        }
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        return (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity);
      });
  } else {
    filtered = scoredHospitals.sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity));
  }

  const handleSelect = (h) => {
    setSelectedHospital(h.id);
    onSelectHospital && onSelectHospital({ lat: h.lat, lng: h.lng, name: h.name });
  };

  const handleQuickSearch = (query) => {
    setLocationSearchMode(false);
    setFilterType('All');
    setSearchQuery(query);
    setShowSuggestions(false);
  };

  const handleVoiceSearch = () => {
    if (!supportsVoiceSearch) {
      setVoiceError('Voice search is not supported in this browser.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionApi();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setVoiceError('');
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript?.trim() || '';
      if (transcript) {
        setSearchQuery(transcript);
      }
      setShowSuggestions(false);
    };

    recognition.onerror = () => {
      setVoiceError('Could not capture voice input. Please try again.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex items-center justify-between gap-2 mb-2">
          <button
            onClick={() => {
              setLocationSearchMode((prev) => !prev);
              setShowSuggestions(false);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
            style={{
              background: locationSearchMode
                ? 'linear-gradient(135deg, #10b981, #047857)'
                : 'rgba(30,58,138,0.38)',
              color: '#ffffff',
              border: `1px solid ${locationSearchMode ? '#34d399' : 'rgba(96,165,250,0.28)'}`,
              boxShadow: locationSearchMode ? '0 0 14px rgba(16,185,129,0.35)' : 'none'
            }}
          >
            {locationSearchMode ? 'Location Search: ON' : 'Search by Location Name'}
          </button>
          {locationSearchMode && (
            <span className="text-xs" style={{ color: 'rgba(110,231,183,0.9)' }}>
              Type area/landmark name to list nearby hospitals
            </span>
          )}
        </div>
        <input
          type="text"
          placeholder={locationSearchMode
            ? '📍 Example: gachibowli / hitech city / charminar / near me'
            : '🔍 Try: hospitals near gachibowli / apolo / nims'}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="w-full px-4 py-3 rounded-xl text-sm font-medium text-white placeholder-blue-300 border-2 transition-all"
          style={{
            background: 'rgba(30,58,138,0.4)',
            borderColor: searchQuery ? '#60a5fa' : 'rgba(96,165,250,0.3)',
            boxShadow: searchQuery ? '0 0 15px rgba(96,165,250,0.3)' : 'none',
            outline: 'none'
          }}
        />
        <button
          onClick={handleVoiceSearch}
          className="absolute right-11 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors text-sm"
          title={supportsVoiceSearch ? 'Voice search' : 'Voice search not supported'}
          disabled={!supportsVoiceSearch}
        >
          {isListening ? '🔴' : '🎤'}
        </button>
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setShowSuggestions(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}

        {showSuggestions && searchSuggestions.length > 0 && (
          <div
            className="absolute left-0 right-0 mt-2 rounded-xl border z-20 max-h-56 overflow-y-auto"
            style={{
              background: 'rgba(15,23,42,0.95)',
              borderColor: 'rgba(96,165,250,0.35)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
            }}
          >
            {searchSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-500/20 transition-colors"
                style={{ color: '#dbeafe' }}
                onClick={() => {
                  setSearchQuery(suggestion);
                  setShowSuggestions(false);
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {voiceError && (
        <p className="text-xs" style={{ color: '#fca5a5' }}>
          {voiceError}
        </p>
      )}

      {/* Quick Search Chips */}
      <div className="flex gap-2 flex-wrap">
        {QUICK_SEARCH_CHIPS.map((chip) => (
          <button
            key={chip.label}
            onClick={() => handleQuickSearch(chip.query)}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
            style={{
              background: 'rgba(30,58,138,0.38)',
              color: 'rgba(147,197,253,0.95)',
              border: '1px solid rgba(96,165,250,0.28)'
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>
      
      {/* Results Count */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-blue-300">
            Found {filtered.length} hospital{filtered.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-blue-400 hover:text-blue-300 underline"
            >
              Clear search
            </button>
          )}
        </div>
        {locationSearchMode && searchQuery && areaCenter && (
          <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <p className="text-xs font-semibold" style={{ color: '#6ee7b7' }}>
              📍 Location detected: {areaCenter.area}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(110,231,183,0.7)' }}>
              Showing hospitals sorted by distance from this location
            </p>
          </div>
        )}
        {locationSearchMode && searchQuery && !areaCenter && (
          <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <p className="text-xs font-semibold" style={{ color: '#fca5a5' }}>
              ⚠️ Location not recognized: "{searchQuery}"
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(252,165,165,0.7)' }}>
              Try: gachibowli, hitech city, secunderabad, charminar, or near me
            </p>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
            style={{
              background: filterType === t ? 'linear-gradient(135deg, #60a5fa, #2563eb)' : 'rgba(30,58,138,0.38)',
              color: filterType === t ? '#ffffff' : 'rgba(96,165,250,0.78)',
              border: `1px solid ${filterType === t ? '#60a5fa' : 'rgba(96,165,250,0.24)'}`,
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Hospital List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {filtered.map((h, i) => {
          const isNearest = i === 0 && currentLocation;
          const distKm = h.distanceMeters ? (h.distanceMeters / 1000).toFixed(1) : null;
          const etaMin = h.distanceMeters ? Math.ceil(h.distanceMeters / (40 * 1000 / 60)) : null; // ~40 km/h

          return (
            <div
              key={h.id}
              onClick={() => handleSelect(h)}
              className="p-4 rounded-xl cursor-pointer transition-all duration-200 border"
              style={{
                background: selectedHospital === h.id ? 'rgba(96,165,250,0.2)' : 'rgba(30,58,138,0.30)',
                borderColor: selectedHospital === h.id ? '#60a5fa' : isNearest ? 'rgba(16,185,129,0.5)' : 'rgba(96,165,250,0.2)',
                boxShadow: selectedHospital === h.id ? '0 0 15px rgba(96,165,250,0.24)' : 'none',
              }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-white">{h.name}</p>
                    {isNearest && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.4)' }}>
                        NEAREST
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(96,165,250,0.72)' }}>{h.area} · {h.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl">{'⭐'.repeat(Math.round(h.rating))}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{h.rating}/5</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { label: 'Distance', value: distKm ? `${distKm} km` : 'N/A' },
                  { label: 'ETA', value: etaMin ? `~${etaMin} min` : 'N/A' },
                  { label: 'Beds', value: h.beds },
                ].map(d => (
                  <div key={d.label} className="text-center p-2 rounded-lg"
                    style={{ background: 'rgba(30,58,138,0.35)' }}>
                    <p className="text-xs" style={{ color: 'rgba(96,165,250,0.6)' }}>{d.label}</p>
                    <p className="text-sm font-bold text-white">{d.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-3">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>📞 {h.phone}</p>
                <button
                  onClick={e => { e.stopPropagation(); handleSelect(h); }}
                  className="text-xs px-3 py-1 rounded-lg font-semibold transition-all"
                  style={{
                    background: selectedHospital === h.id ? 'linear-gradient(135deg, #60a5fa, #2563eb)' : 'rgba(96,165,250,0.2)',
                    color: selectedHospital === h.id ? '#ffffff' : '#60a5fa',
                    border: '1px solid rgba(96,165,250,0.4)'
                  }}>
                  {selectedHospital === h.id ? '✓ Selected' : 'Set Route'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HospitalFinder;





