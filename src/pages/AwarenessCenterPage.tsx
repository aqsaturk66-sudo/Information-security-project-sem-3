import React, { useState } from 'react';
import { AWARENESS_ARTICLES } from '../awareness/awarenessData.ts';
import { AwarenessArticle } from '../types/index.ts';
import {
  ShieldCheck,
  Search,
  Clock,
  BookOpen,
  CheckCircle2,
  ListChecks,
  X,
  ArrowRight
} from 'lucide-react';

export const AwarenessCenterPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<AwarenessArticle | null>(null);

  const filteredArticles = AWARENESS_ARTICLES.filter((art) => {
    const term = searchTerm.toLowerCase();
    return (
      art.title.toLowerCase().includes(term) ||
      art.category.toLowerCase().includes(term) ||
      art.summary.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Security Awareness Center
          </h1>
        </div>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          Comprehensive cybersecurity playbooks, behavioral heuristics, and practical operational guides designed to foster resilient digital habits for students, professionals, and internet users.
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search security articles, passkeys, incident response..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/50 border border-slate-700 text-slate-200 text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono hidden sm:block">
          {filteredArticles.length} Operational Guides Available
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4 flex flex-col justify-between hover:border-slate-700 transition group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {article.category}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3" />
                  {article.readTimeMinutes} min read
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition leading-snug">
                {article.title}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {article.summary}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                {article.keyTakeaways.length} Key Defensive Points
              </span>

              <button
                onClick={() => setSelectedArticle(article)}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group-hover:translate-x-1 transition"
              >
                <span>Read Full Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-[#131d33] border-b border-slate-700/80 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {selectedArticle.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {selectedArticle.readTimeMinutes} min read
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white leading-tight">
                  {selectedArticle.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition shrink-0"
                aria-label="Close article"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Summary */}
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-900/40 text-xs text-cyan-200 leading-relaxed font-mono">
                {selectedArticle.summary}
              </div>

              {/* Main Content Paragraphs */}
              <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                {selectedArticle.content.map((para, i) => (
                  <p key={i} className="text-justify">
                    {para}
                  </p>
                ))}
              </div>

              {/* Key Takeaways */}
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Crucial Defensive Takeaways</span>
                </h4>
                <ul className="space-y-2">
                  {selectedArticle.keyTakeaways.map((takeaway, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Checklist */}
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4" />
                  <span>Actionable Hygiene Checklist</span>
                </h4>
                <div className="space-y-2">
                  {selectedArticle.actionChecklist.map((action, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs text-slate-300">
                      <span className="w-4 h-4 rounded border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400 font-bold text-[10px] mt-0.5">
                        ✓
                      </span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#131d33] border-t border-slate-700/80 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
