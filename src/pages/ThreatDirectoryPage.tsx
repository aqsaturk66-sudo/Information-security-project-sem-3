import React, { useState } from 'react';
import { THREAT_CONCEPTS } from '../threats/threatDatabase.ts';
import { ThreatConcept } from '../types/index.ts';
import {
  BookOpen,
  Search,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  Tag
} from 'lucide-react';

export const ThreatDirectoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedThreatId, setExpandedThreatId] = useState<string | null>(THREAT_CONCEPTS[0].id);

  const categories = [
    { id: 'all', label: 'All Threat Types' },
    { id: 'url_manipulation', label: 'URL Manipulation' },
    { id: 'credential_theft', label: 'Credential Theft' },
    { id: 'social_engineering', label: 'Social Engineering' },
    { id: 'infrastructure', label: 'Infrastructure & Protocols' }
  ];

  const filteredThreats = THREAT_CONCEPTS.filter((threat) => {
    const matchesCategory = selectedCategory === 'all' || threat.category === selectedCategory;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      threat.name.toLowerCase().includes(term) ||
      threat.whatItMeans.toLowerCase().includes(term) ||
      threat.realisticExample.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedThreatId(expandedThreatId === id ? null : id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Threat Explanation Engine
          </h1>
        </div>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          Beginner-friendly cybersecurity encyclopedia detailing the mechanics of active phishing techniques, why they deceive human cognitive faculties, and concrete defensive countermeasures.
        </p>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0f172a] border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cyber threats or examples..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/50 border border-slate-700 text-slate-200 text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Threats Directory Accordion / Grid */}
      <div className="space-y-4">
        {filteredThreats.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-[#0f172a] rounded-2xl border border-slate-800">
            No threat concepts matched your search query.
          </div>
        ) : (
          filteredThreats.map((threat) => {
            const isExpanded = expandedThreatId === threat.id;

            return (
              <div
                key={threat.id}
                className="rounded-2xl bg-[#0f172a] border border-slate-800 overflow-hidden transition"
              >
                {/* Header Row */}
                <button
                  type="button"
                  onClick={() => toggleExpand(threat.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white font-mono">{threat.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          threat.severity === 'CRITICAL'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {threat.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{threat.shortDescription}</p>
                    </div>
                  </div>

                  <div className="shrink-0 text-slate-400 p-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </button>

                {/* Expanded Deep Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-800/80 space-y-5 animate-fade-in text-sm text-slate-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
                      {/* What it means */}
                      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                        <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                          What It Means
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">{threat.whatItMeans}</p>
                      </div>

                      {/* Why it matters */}
                      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                        <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold block">
                          Why It Matters
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">{threat.whyItMatters}</p>
                      </div>
                    </div>

                    {/* How Attackers Use It */}
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                      <span className="text-xs font-mono uppercase tracking-wider text-red-400 font-bold block">
                        How Attackers Deploy This Vector
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">{threat.howAttackersUseIt}</p>
                    </div>

                    {/* Realistic Real-World Attack Scenario */}
                    <div className="p-4 rounded-xl bg-black/40 border border-slate-800/80 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                        <Lightbulb className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold uppercase tracking-wider">Realistic Attack Scenario</span>
                      </div>
                      <p className="text-xs font-mono text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                        {threat.realisticExample}
                      </p>
                    </div>

                    {/* Protective Defense Measures */}
                    <div className="space-y-2 pt-1">
                      <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Defensive Countermeasures & Best Practices</span>
                      </span>
                      <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {threat.howToProtect.map((tip, idx) => (
                          <li
                            key={idx}
                            className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-300 leading-relaxed flex items-start gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
