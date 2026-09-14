import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  HelpCircle,
  Search,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Send,
  RefreshCw,
  Award,
  BookmarkCheck,
} from 'lucide-react';
import { CourseLevel, GlossaryTerm } from '../types';

export const LearnView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trading' | 'investing' | 'tutor' | 'glossary'>('trading');
  const [tradingLevels, setTradingLevels] = useState<CourseLevel[]>([]);
  const [investingModules, setInvestingModules] = useState<any[]>([]);
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>([]);

  // Selected lesson / quiz state
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);

  // AI Tutor State
  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorResponse, setTutorResponse] = useState<any | null>(null);
  const [tutorQuizAnswer, setTutorQuizAnswer] = useState<number | null>(null);

  // Glossary search
  const [glossarySearch, setGlossarySearch] = useState('');
  const [glossaryCategory, setGlossaryCategory] = useState('ALL');

  useEffect(() => {
    async function loadLearningContent() {
      try {
        const [tRes, iRes, gRes] = await Promise.all([
          fetch('/api/learning/trading-course'),
          fetch('/api/learning/investing-course'),
          fetch('/api/learning/glossary'),
        ]);
        const tData = await tRes.json();
        const iData = await iRes.json();
        const gData = await gRes.json();

        setTradingLevels(tData.levels || []);
        setInvestingModules(iData.modules || []);
        setGlossaryTerms(gData.glossary || []);

        if (tData.levels?.[0]?.lessons?.[0]) {
          setSelectedLesson(tData.levels[0].lessons[0]);
        }
      } catch (err) {
        console.error('Error loading learn data:', err);
      }
    }
    loadLearningContent();
  }, []);

  // Handle AI Tutor Ask
  const handleAskTutor = async (prompt?: string) => {
    const q = prompt || tutorQuery;
    if (!q.trim()) return;
    setTutorLoading(true);
    setTutorQuizAnswer(null);
    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setTutorResponse(data);
    } catch (err) {
      console.error('Tutor error:', err);
    } finally {
      setTutorLoading(false);
    }
  };

  const filteredGlossary = glossaryTerms.filter(item => {
    const matchQuery =
      item.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      item.definition.toLowerCase().includes(glossarySearch.toLowerCase());
    const matchCategory = glossaryCategory === 'ALL' || item.category === glossaryCategory;
    return matchQuery && matchCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Financial Intelligence & Learning Academy</h1>
        <p className="text-xs text-slate-400">
          Structured courses, interactive challenges, searchable formulas, and conversational AI tutoring
        </p>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1 overflow-x-auto">
        {[
          { id: 'trading', label: 'Trading Course (9 Levels)' },
          { id: 'investing', label: 'Investing Mastery (17 Modules)' },
          { id: 'tutor', label: 'AI Finance Mentor & Quizzes' },
          { id: 'glossary', label: 'Financial Glossary & Formulas' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: TRADING COURSE */}
      {activeTab === 'trading' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Level List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Course Curriculum</h3>
            <div className="space-y-2">
              {tradingLevels.map(lvl => (
                <div key={lvl.id} className="rounded-xl border border-slate-800 bg-[#121824] p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-emerald-400 font-bold">Level {lvl.levelNumber}</span>
                    <span className="text-[10px] text-slate-400">{lvl.duration}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white">{lvl.title}</h4>
                  <p className="text-[11px] text-slate-400">{lvl.description}</p>

                  <div className="pt-2 border-t border-slate-800/80 space-y-1">
                    {lvl.lessons.map(lesson => (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          setSelectedLesson(lesson);
                          setQuizAnswer(null);
                          setShowQuizResult(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                          selectedLesson?.id === lesson.id
                            ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20'
                            : 'text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <span className="truncate">{lesson.title}</span>
                        <ArrowRight className="h-3 w-3 shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lesson Content & Interactive Exercise */}
          <div className="lg:col-span-2">
            {selectedLesson ? (
              <div className="rounded-2xl border border-slate-800 bg-[#121824] p-6 space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-400">
                    Interactive Lesson
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1">{selectedLesson.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">{selectedLesson.summary}</p>
                </div>

                {/* Lesson Body */}
                <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {selectedLesson.content.map((p: string, idx: number) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {/* Key Takeaways */}
                {selectedLesson.keyTakeaways && (
                  <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <BookmarkCheck className="h-4 w-4" />
                      Key Mathematical Takeaways
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {selectedLesson.keyTakeaways.map((k: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{k}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Interactive Exercise / Quiz */}
                {selectedLesson.exercise && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-emerald-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                        Concept Check & Instant Feedback
                      </h4>
                    </div>

                    <p className="text-xs font-medium text-slate-200">
                      {selectedLesson.exercise.prompt}
                    </p>

                    <div className="space-y-2">
                      {selectedLesson.exercise.options.map((opt: string, optIdx: number) => {
                        const isChosen = quizAnswer === optIdx;
                        const isCorrect = selectedLesson.exercise.correctIndex === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              setQuizAnswer(optIdx);
                              setShowQuizResult(true);
                            }}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                              showQuizResult
                                ? isCorrect
                                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold'
                                  : isChosen
                                  ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                                  : 'border-slate-800 bg-slate-900/40 text-slate-400'
                                : isChosen
                                ? 'border-emerald-500 bg-emerald-500/10 text-white'
                                : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span className="font-mono mr-2 font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {showQuizResult && (
                      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                        <span className="font-bold text-white block">Explanation:</span>
                        <p className="text-slate-300">{selectedLesson.exercise.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl border border-slate-800 bg-[#121824] text-xs text-slate-400">
                Select a lesson from the curriculum on the left to start learning.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INVESTING MASTERY (17 MODULES) */}
      {activeTab === 'investing' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-[#121824] p-4 text-xs text-slate-300">
            Master long-term compounding, balance sheet solvency, capital efficiency (ROE/ROCE), competitive economic moats, and valuation safety.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {investingModules.map((mod, idx) => (
              <div
                key={mod.id}
                className="rounded-xl border border-slate-800 bg-[#121824] p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-emerald-400 font-bold">Module {idx + 1}</span>
                    <span className="text-[10px] text-slate-400">{mod.duration}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">{mod.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{mod.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">Comprehensive Syllabus</span>
                  <button
                    onClick={() => {
                      setActiveTab('tutor');
                      handleAskTutor(`Teach me all about: ${mod.title}`);
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    Ask AI Tutor <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AI FINANCE TUTOR */}
      {activeTab === 'tutor' && (
        <div className="rounded-2xl border border-slate-800 bg-[#121824] p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">StockStar AI Financial Mentor</h3>
              <p className="text-xs text-slate-400">
                Ask any financial question to receive clear analogies, mathematical intuition, and an interactive quiz.
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2">
            {[
              "Explain P/E ratio like I'm 15",
              'Why does RSI give false signals in bull markets?',
              'What makes ROCE superior to ROE?',
              'How does an economic moat protect corporate profits?',
              'Explain how short selling works on an exchange',
            ].map(prompt => (
              <button
                key={prompt}
                onClick={() => {
                  setTutorQuery(prompt);
                  handleAskTutor(prompt);
                }}
                className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask anything (e.g. How does DCF work? What is VWAP?)..."
              value={tutorQuery}
              onChange={e => setTutorQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAskTutor()}
              className="flex-1 rounded-xl border border-slate-800 bg-[#0f141c] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
            <button
              onClick={() => handleAskTutor()}
              disabled={tutorLoading}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {tutorLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Explain
            </button>
          </div>

          {/* Tutor Response */}
          {tutorResponse && (
            <div className="rounded-xl border border-slate-800 bg-[#0f141c] p-6 space-y-5">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Core Explanation</h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{tutorResponse.explanation}</p>
              </div>

              {tutorResponse.analogy && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Intuitive Real-World Analogy</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">{tutorResponse.analogy}</p>
                </div>
              )}

              {tutorResponse.keyTakeaways && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Summary Takeaways</h5>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {tutorResponse.keyTakeaways.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tutor Quiz */}
              {tutorResponse.quizQuestion && (
                <div className="mt-4 p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Concept Verification Quiz
                  </h5>
                  <p className="text-xs font-medium text-white">{tutorResponse.quizQuestion.question}</p>

                  <div className="space-y-2">
                    {tutorResponse.quizQuestion.options.map((opt: string, optIdx: number) => {
                      const isChosen = tutorQuizAnswer === optIdx;
                      const isCorrect = tutorResponse.quizQuestion.correctIndex === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => setTutorQuizAnswer(optIdx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                            tutorQuizAnswer !== null
                              ? isCorrect
                                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold'
                                : isChosen
                                ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                                : 'border-slate-800 bg-slate-900/40 text-slate-400'
                              : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span className="font-mono mr-2 font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {tutorQuizAnswer !== null && (
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                      {tutorResponse.quizQuestion.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: GLOSSARY & FORMULAS */}
      {activeTab === 'glossary' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121824] p-4 rounded-xl border border-slate-800">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search financial terms, ratios, or formulas (e.g. ROE, ROCE, VWAP, Alpha)..."
                value={glossarySearch}
                onChange={e => setGlossarySearch(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-[#0f141c] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
              {['ALL', 'Fundamentals', 'Valuation', 'Profitability', 'Technicals', 'Risk', 'Portfolio'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setGlossaryCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    glossaryCategory === cat
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGlossary.map(item => (
              <div
                key={item.term}
                className="rounded-xl border border-slate-800 bg-[#121824] p-5 space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white font-mono">{item.term}</h4>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-slate-700">
                    {item.category}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{item.definition}</p>

                {item.formula && (
                  <div className="rounded-lg bg-slate-900/80 p-2.5 font-mono text-xs text-teal-300 border border-slate-800/80">
                    <span className="text-slate-500 text-[10px] block">Mathematical Formula:</span>
                    {item.formula}
                  </div>
                )}

                {item.example && (
                  <div className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Market Example: </span>
                    {item.example}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Practical Significance: </span>
                  {item.significance}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
