import React, { useState } from 'react';

// Complete credit card data with all 8 cards
const CREDIT_CARDS = {
  "Citi Double Cash": {
    color: "from-red-600 to-orange-600",
    rewards: [
      { category: "Hotels, car rentals, attractions (Citi Travel)", multiplier: "5% cash back", details: "3% additional + 2% base" },
      { category: "All purchases", multiplier: "2% cash back", details: "1% when you buy + 1% when you pay" }
    ],
    specialRules: "Must pay at least minimum payment on time to earn the 1% payback portion."
  },
  "Citi Custom Cash": {
    color: "from-cyan-500 to-blue-600",
    rewards: [
      { category: "Highest spend category", multiplier: "5% cash back",
        details: "Up to $500/month - Categories: Restaurants, Gas Stations, Grocery Stores, Select Travel, Select Transit, Select Streaming, Drugstores, Home Improvement, Fitness Clubs, Live Entertainment" },
      { category: "Hotels, car rentals, attractions (Citi Travel)", multiplier: "5% cash back", details: "4% additional + 1% base, through 6/30/2026" },
      { category: "After $500 in highest category", multiplier: "1% cash back" },
      { category: "All other purchases", multiplier: "1% cash back" }
    ],
    specialRules: "Automatically awards 5% on your highest spend category each billing cycle - no activation needed."
  },
  "Citi Strata Premier": {
    color: "from-blue-600 to-blue-800",
    rewards: [
      { category: "Hotels, car rentals, attractions (Citi Travel)", multiplier: "10x points" },
      { category: "Air travel and other hotels", multiplier: "3x points" },
      { category: "Restaurants", multiplier: "3x points" },
      { category: "Supermarkets", multiplier: "3x points" },
      { category: "Gas stations and EV charging", multiplier: "3x points" },
      { category: "All other purchases", multiplier: "1x point" }
    ],
    specialRules: "$95 annual fee. $100 annual hotel credit (single stay of $500+ through Citi Travel). Points transfer to airline/hotel partners at 1:1."
  },
  "Citi Strata": {
    color: "from-blue-500 to-purple-600",
    rewards: [
      { category: "Hotels, car rentals, attractions (Citi Travel)", multiplier: "5x points" },
      { category: "Supermarkets", multiplier: "3x points" },
      { category: "Select transit purchases", multiplier: "3x points" },
      { category: "Gas and EV charging stations", multiplier: "3x points" },
      { category: "Self-select category", multiplier: "3x points", details: "Choose from: Fitness Clubs, Select Streaming, Live Entertainment, Cosmetic Stores/Barber/Salons, Pet Stores - changeable once per quarter" },
      { category: "Restaurants", multiplier: "2x points" },
      { category: "All other purchases", multiplier: "1x point" }
    ],
    specialRules: "No annual fee. Default self-select category is Select Streaming Services."
  },
  "Capital One Venture X": {
    color: "from-gray-800 to-gray-900",
    rewards: [
      { category: "Hotels and rental cars (Capital One Travel)", multiplier: "10x miles" },
      { category: "Flights and vacation rentals (Capital One Travel)", multiplier: "5x miles" },
      { category: "Capital One Entertainment purchases", multiplier: "5x miles" },
      { category: "All other purchases", multiplier: "2x miles" }
    ],
    specialRules: "$395 annual fee. $300 annual Capital One Travel credit. 10,000 bonus miles each anniversary."
  },
  "Amex Platinum": {
    color: "from-zinc-400 to-zinc-600",
    rewards: [
      { category: "Flights (direct with airlines or Amex Travel)", multiplier: "5x points", details: "Up to $500,000 per calendar year, then 1x" },
      { category: "Prepaid hotels (Amex Travel)", multiplier: "5x points" },
      { category: "All other purchases", multiplier: "1x point" }
    ],
    specialRules: "$895 annual fee. Extensive travel and lifestyle credits ($300 digital entertainment, $200 Uber, $200 airline fee)."
  },
  "Amex Blue Cash Everyday": {
    color: "from-blue-400 to-sky-600",
    rewards: [
      { category: "U.S. supermarkets", multiplier: "3% cash back", details: "Up to $6,000 per year, then 1%" },
      { category: "U.S. online retail purchases", multiplier: "3% cash back", details: "Up to $6,000 per year, then 1%" },
      { category: "U.S. gas stations", multiplier: "3% cash back", details: "Up to $6,000 per year, then 1%" },
      { category: "All other purchases", multiplier: "1% cash back" }
    ],
    specialRules: "No annual fee. Up to $84 Disney Bundle credit annually ($7/month). Up to $180 Home Chef credit annually ($15/month)."
  },
  "Bilt Mastercard": {
    color: "from-orange-500 to-red-600",
    rewards: [
      { category: "Lyft rides", multiplier: "5x points", details: "When accounts are linked" },
      { category: "Dining", multiplier: "3x points" },
      { category: "Travel (booked directly or through Bilt portal)", multiplier: "2x points" },
      { category: "Rent payments", multiplier: "1x point", details: "Up to 100,000 points per calendar year, no transaction fee" },
      { category: "All other purchases", multiplier: "1x point" }
    ],
    specialRules: "No annual fee. Must make at least 5 transactions per statement period to earn points. Rent Day bonus: Double points on non-rent purchases on 1st of each month (up to 1,000 bonus points)."
  }
};

const QUICK_CATEGORIES = [
  { id: 'dining', label: 'Dining', icon: '🍽️', query: 'restaurant dinner' },
  { id: 'grocery', label: 'Grocery', icon: '🛒', query: 'grocery store supermarket' },
  { id: 'gas', label: 'Gas', icon: '⛽', query: 'gas station fuel' },
  { id: 'online', label: 'Online', icon: '🛍️', query: 'online shopping amazon retail' },
  { id: 'hotel', label: 'Hotel', icon: '🏨', query: 'hotel booking accommodation' },
  { id: 'flight', label: 'Flights', icon: '✈️', query: 'airline flight ticket' },
  { id: 'streaming', label: 'Streaming', icon: '📺', query: 'netflix streaming subscription' },
  { id: 'rent', label: 'Rent', icon: '🏠', query: 'rent payment apartment' },
];

export default function CreditCardOptimizer() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [excludePortals, setExcludePortals] = useState(false);

  // Helper function to identify portal-based rewards
  const isPortalReward = (category) => {
    const portalIndicators = [
      'Citi Travel',
      'Capital One Travel',
      'Amex Travel',
      'Bilt portal',
      'through portal'
    ];
    return portalIndicators.some(indicator =>
      category.toLowerCase().includes(indicator.toLowerCase())
    );
  };

  const analyzeQuery = async (searchQuery) => {
    const queryToUse = searchQuery || query;
    if (!queryToUse.trim()) return;
    if (loading) return;

    setLoading(true);
    setRecommendation(null);

    // Prepare card info for the backend
    const cardInfo = Object.entries(CREDIT_CARDS).map(([name, card]) => {
      // Filter out portal rewards if toggle is enabled
      const rewards = excludePortals
        ? card.rewards.filter(r => !isPortalReward(r.category))
        : card.rewards;

      // Skip cards with no rewards after filtering
      if (rewards.length === 0) return null;

      return `
${name}:
${rewards.map(r => `- ${r.category}: ${r.multiplier}${r.details ? ` (${r.details})` : ''}`).join('\n')}
${card.specialRules ? `\nSpecial: ${card.specialRules}` : ''}`;
    }).filter(Boolean).join('\n---\n');

    // Retry with exponential backoff (3 attempts)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // Exponential backoff: 0s, 2s, 4s
        if (attempt > 1) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        console.log(`Attempt ${attempt}/3: Analyzing "${queryToUse}"`);

        // Call the backend API instead of Anthropic directly
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            query: queryToUse,
            cardInfo: cardInfo
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`Attempt ${attempt}: API returned ${response.status}`, errorData);

          // Handle rate limiting
          if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please wait a moment and try again.');
          }

          if (attempt === 3) {
            throw new Error(errorData.error || `API error ${response.status}`);
          }
          continue;
        }

        const data = await response.json();

        // Validate result
        if (!data.cards || !Array.isArray(data.cards)) {
          console.error(`Attempt ${attempt}: Invalid response structure`, data);
          if (attempt === 3) throw new Error('Invalid response from server');
          continue;
        }

        if (data.cards.length < 1) {
          console.error(`Attempt ${attempt}: No cards returned`);
          if (attempt === 3) throw new Error('No cards returned from server');
          continue;
        }

        // Check if cards have required fields
        const validCards = data.cards.filter(c => c.card && c.rate && c.reason);
        if (validCards.length === 0) {
          console.error(`Attempt ${attempt}: No valid cards in response`, data.cards);
          if (attempt === 3) throw new Error('Invalid card format');
          continue;
        }

        // Success!
        console.log(`✓ Success on attempt ${attempt}`);
        setRecommendation({ cards: validCards.slice(0, 2) });
        setLoading(false);
        return;

      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error.message, error);

        if (attempt === 3) {
          // Provide specific error messages
          let errorMsg = 'Unable to analyze. Please try again in a few seconds.';

          if (error.message.includes('Rate limit')) {
            errorMsg = error.message;
          } else if (error.message.includes('API error')) {
            errorMsg = 'API temporarily unavailable. Please wait and try again.';
          } else if (error.message.includes('Network') || error.message.includes('fetch')) {
            errorMsg = 'Network error. Please check your connection and try again.';
          }

          setRecommendation({
            cards: [{
              card: "Analysis Error",
              rate: "N/A",
              reason: errorMsg
            }]
          });
          setLoading(false);
        }
      }
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.id);
    setQuery(category.query);
    analyzeQuery(category.query);
  };

  // Auto-rerun analysis when portal toggle changes if we have existing results
  React.useEffect(() => {
    if (recommendation && query.trim()) {
      analyzeQuery();
    }
  }, [excludePortals]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-4 shadow-lg shadow-purple-500/30">
            <span className="text-3xl">💳</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Card Optimizer</h1>
          <p className="text-purple-200/70">Maximize rewards on every purchase</p>
          <p className="text-purple-200/40 text-xs mt-1">Updated: December 1, 2025</p>
        </div>

        {/* Portal Toggle */}
        <div className="mb-6 flex justify-center">
          <label className="inline-flex items-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl cursor-pointer hover:bg-white/15 transition-all">
            <input
              type="checkbox"
              checked={excludePortals}
              onChange={(e) => setExcludePortals(e.target.checked)}
              className="w-4 h-4 rounded accent-purple-500"
            />
            <div className="flex flex-col">
              <span className="text-white/90 text-sm font-medium">
                Exclude shopping portal rewards
              </span>
              <span className="text-white/50 text-xs">
                Show only direct earning rates (no Citi/Amex/Capital One Travel)
              </span>
            </div>
          </label>
        </div>

        {/* Quick Categories */}
        <div className="mb-6">
          <p className="text-sm text-purple-200/60 mb-3 text-center">Quick select a category</p>
          <div className="grid grid-cols-4 gap-2 md:gap-3">
            {QUICK_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                disabled={loading}
                className={`
                  flex flex-col items-center justify-center p-3 md:p-4 rounded-xl
                  transition-all duration-200
                  ${selectedCategory === cat.id && loading
                    ? 'bg-purple-500/40 ring-2 ring-purple-400 scale-95'
                    : 'bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <span className="text-2xl md:text-3xl mb-1">{cat.icon}</span>
                <span className="text-xs md:text-sm text-white/90 font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedCategory(null); }}
              onKeyPress={(e) => e.key === 'Enter' && analyzeQuery()}
              placeholder="Or describe your purchase..."
              className="w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
            />
            <button
              onClick={() => analyzeQuery()}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/30"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="hidden md:inline">Analyzing</span>
                </span>
              ) : 'Find Best'}
            </button>
          </div>
        </div>

        {/* Results */}
        {recommendation && (
          <div className="space-y-3 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Active filter indicator */}
            {excludePortals && (
              <div className="flex justify-center mb-2">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-purple-200 text-xs">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Direct rewards only (portals excluded)
                </span>
              </div>
            )}

            {recommendation.cards.map((cardRec, index) => (
              <div
                key={index}
                className={`
                  relative overflow-hidden rounded-2xl p-5
                  ${index === 0
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30'
                    : 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-400/30'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                    ${index === 0 ? 'bg-emerald-500/30' : 'bg-blue-500/30'}
                  `}>
                    {index === 0 ? '🥇' : '🥈'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`
                        text-xs font-bold px-2 py-0.5 rounded-full
                        ${index === 0 ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}
                      `}>
                        {index === 0 ? 'BEST CHOICE' : 'RUNNER UP'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{cardRec.card}</h3>
                    <p className={`text-lg font-semibold mb-2 ${index === 0 ? 'text-emerald-300' : 'text-blue-300'}`}>
                      {cardRec.rate}
                    </p>
                    <p className="text-white/70 text-sm">{cardRec.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Cards Toggle */}
        <div className="text-center">
          <button
            onClick={() => setShowCards(!showCards)}
            className="inline-flex items-center gap-2 px-4 py-2 text-purple-200/70 hover:text-white transition-colors"
          >
            <span>{showCards ? 'Hide' : 'View'} All Cards</span>
            <svg
              className={`w-4 h-4 transition-transform ${showCards ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Cards List */}
        {showCards && (
          <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
            {Object.entries(CREDIT_CARDS).map(([name, card]) => {
              // Filter rewards based on portal toggle
              const displayRewards = excludePortals
                ? card.rewards.filter(r => !isPortalReward(r.category))
                : card.rewards;

              // Skip cards with no rewards after filtering
              if (displayRewards.length === 0) return null;

              return (
                <div key={name} className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className={`bg-gradient-to-r ${card.color} px-5 py-3`}>
                    <h3 className="text-lg font-bold text-white">{name}</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {displayRewards.map((reward, idx) => (
                      <div key={idx} className="flex justify-between items-start gap-4 text-sm">
                        <span className="text-white/70">{reward.category}</span>
                        <span className="font-semibold text-purple-300 whitespace-nowrap">{reward.multiplier}</span>
                      </div>
                    ))}
                    {card.specialRules && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-yellow-300/80">⚡ {card.specialRules}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
