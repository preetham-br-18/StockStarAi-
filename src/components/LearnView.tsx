import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  Search,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Send,
  RefreshCw,
  Award,
  BookmarkCheck,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Pause,
  Square,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Headphones,
  Compass,
} from 'lucide-react';
import { CourseLevel, CourseLesson, GlossaryTerm } from '../types';
import {
  TRADING_COURSE_LEVELS,
  INVESTING_COURSE_MODULES,
  FINANCIAL_GLOSSARY,
  InvestingModule,
  askAiTutor,
} from '../services/learningService';
import { voiceAssist } from '../services/voiceAssist';

export const LearnView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trading' | 'investing' | 'tutor' | 'glossary'>('trading');
  const [tradingLevels, setTradingLevels] = useState<CourseLevel[]>(TRADING_COURSE_LEVELS);
  const [investingModules, setInvestingModules] = useState<InvestingModule[]>(INVESTING_COURSE_MODULES);
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>(FINANCIAL_GLOSSARY);

  // Selected lesson / quiz state
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(
    TRADING_COURSE_LEVELS[0]?.lessons[0] || null
  );
  const [selectedCourseType, setSelectedCourseType] = useState<'trading' | 'investing'>('trading');
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({ 'lvl-1': true, 'lvl-2': true });

  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);

  // Completed lessons tracking in localStorage
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('stockstar_completed_lessons');
      return saved ? JSON.parse(saved) : ['l1-1'];
    } catch {
      return ['l1-1'];
    }
  });

  // Global Academy Search & Quick Jump
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Voice Assist State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isListeningSearch, setIsListeningSearch] = useState(false);
  const [isListeningTutor, setIsListeningTutor] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // AI Tutor State
  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorResponse, setTutorResponse] = useState<any | null>(null);
  const [tutorQuizAnswer, setTutorQuizAnswer] = useState<number | null>(null);

  // Glossary search & filter
  const [glossarySearch, setGlossarySearch] = useState('');
  const [glossaryCategory, setGlossaryCategory] = useState('ALL');

  // Ref to the lesson reader container for smooth scrolling
  const lessonReaderRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Persist completed lessons
  const toggleLessonCompleted = (lessonId: string) => {
    setCompletedLessonIds(prev => {
      const exists = prev.includes(lessonId);
      const updated = exists ? prev.filter(id => id !== lessonId) : [...prev, lessonId];
      try {
        localStorage.setItem('stockstar_completed_lessons', JSON.stringify(updated));
      } catch {
        // Safe
      }
      return updated;
    });
  };

  // Flattened lists for Next / Prev navigation
  const allTradingLessons = useMemo(() => {
    return tradingLevels.flatMap(lvl => lvl.lessons);
  }, [tradingLevels]);

  const allInvestingLessons = useMemo(() => {
    return investingModules.map(mod => mod.lesson);
  }, [investingModules]);

  const currentLessonList = selectedCourseType === 'trading' ? allTradingLessons : allInvestingLessons;
  const currentLessonIndex = currentLessonList.findIndex(l => l.id === selectedLesson?.id);
  const prevLesson = currentLessonIndex > 0 ? currentLessonList[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < currentLessonList.length - 1 ? currentLessonList[currentLessonIndex + 1] : null;

  // Total lessons count
  const totalLessonsCount = allTradingLessons.length + allInvestingLessons.length;
  const completedCount = completedLessonIds.length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalLessonsCount) * 100));

  // Voice narration handlers
  const handleStartSpeaking = (textToSpeak: string) => {
    voiceAssist.stop();
    setIsSpeaking(true);
    setIsPaused(false);

    const success = voiceAssist.speak(textToSpeak, {
      rate: speechRate,
      onStart: () => {
        setIsSpeaking(true);
        setIsPaused(false);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setIsPaused(false);
      },
      onError: err => {
        setIsSpeaking(false);
        setIsPaused(false);
        setVoiceNotice(`Audio notice: ${err}`);
        setTimeout(() => setVoiceNotice(null), 3000);
      },
    });

    if (!success) {
      setIsSpeaking(false);
      setVoiceNotice('Audio speech synthesis is not supported on this device.');
      setTimeout(() => setVoiceNotice(null), 3000);
    }
  };

  const handlePauseSpeaking = () => {
    voiceAssist.pause();
    setIsPaused(true);
  };

  const handleResumeSpeaking = () => {
    voiceAssist.resume();
    setIsPaused(false);
  };

  const handleStopSpeaking = () => {
    voiceAssist.stop();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handleNarrateLesson = () => {
    if (!selectedLesson) return;
    if (isSpeaking && !isPaused) {
      handlePauseSpeaking();
      return;
    }
    if (isPaused) {
      handleResumeSpeaking();
      return;
    }

    const script = [
      `Lesson: ${selectedLesson.title}`,
      `Overview: ${selectedLesson.summary}`,
      `Core Concepts: ${selectedLesson.content.join('. ')}`,
      selectedLesson.keyTakeaways?.length ? `Key Takeaways: ${selectedLesson.keyTakeaways.join('. ')}` : '',
    ]
      .filter(Boolean)
      .join('. ');

    handleStartSpeaking(script);
  };

  // Select lesson and smooth scroll directly to the reader
  const handleSelectLesson = (lesson: CourseLesson, courseType: 'trading' | 'investing') => {
    handleStopSpeaking();
    setSelectedLesson(lesson);
    setSelectedCourseType(courseType);
    setQuizAnswer(null);
    setShowQuizResult(false);
    setIsSearchOpen(false);

    // Smooth scroll directly to the lesson viewer so the user doesn't have to scroll manually
    setTimeout(() => {
      if (lessonReaderRef.current) {
        lessonReaderRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  // Voice Search / Voice Query handler
  const handleStartVoiceSearch = () => {
    if (!voiceAssist.isSTTSupported()) {
      setVoiceNotice('Voice input is not supported in this browser. Please type your search.');
      setTimeout(() => setVoiceNotice(null), 3500);
      return;
    }

    setIsListeningSearch(true);
    setVoiceNotice('Listening... Speak a financial topic or term now.');

    voiceAssist.startListening(
      transcript => {
        setSearchQuery(transcript);
        setIsListeningSearch(false);
        setIsSearchOpen(true);
        setVoiceNotice(`Heard: "${transcript}"`);
        setTimeout(() => setVoiceNotice(null), 3000);
      },
      {
        onError: err => {
          setIsListeningSearch(false);
          setVoiceNotice(`Microphone notice: ${err}`);
          setTimeout(() => setVoiceNotice(null), 3500);
        },
        onEnd: () => {
          setIsListeningSearch(false);
        },
      }
    );
  };

  // Voice Tutor handler
  const handleStartVoiceTutor = () => {
    if (!voiceAssist.isSTTSupported()) {
      setVoiceNotice('Voice input is not supported in this browser. Please type your question.');
      setTimeout(() => setVoiceNotice(null), 3500);
      return;
    }

    setIsListeningTutor(true);
    setVoiceNotice('Listening... Ask your finance question now.');

    voiceAssist.startListening(
      transcript => {
        setTutorQuery(transcript);
        setIsListeningTutor(false);
        setVoiceNotice(`Heard: "${transcript}"`);
        handleAskTutor(transcript);
        setTimeout(() => setVoiceNotice(null), 3000);
      },
      {
        onError: err => {
          setIsListeningTutor(false);
          setVoiceNotice(`Microphone notice: ${err}`);
          setTimeout(() => setVoiceNotice(null), 3500);
        },
        onEnd: () => {
          setIsListeningTutor(false);
        },
      }
    );
  };

  // Search Results computation across Trading, Investing, and Glossary
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();

    const tradingMatches = allTradingLessons
      .filter(l => l.title.toLowerCase().includes(q) || l.summary.toLowerCase().includes(q))
      .map(l => ({ type: 'trading' as const, item: l }));

    const investingMatches = allInvestingLessons
      .filter(l => l.title.toLowerCase().includes(q) || l.summary.toLowerCase().includes(q))
      .map(l => ({ type: 'investing' as const, item: l }));

    const glossaryMatches = glossaryTerms
      .filter(g => g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q))
      .slice(0, 4)
      .map(g => ({ type: 'glossary' as const, item: g }));

    return [...tradingMatches, ...investingMatches, ...glossaryMatches].slice(0, 8);
  }, [searchQuery, allTradingLessons, allInvestingLessons, glossaryTerms]);

  // AI Tutor Ask
  const handleAskTutor = async (prompt?: string) => {
    const q = prompt || tutorQuery;
    if (!q.trim()) return;
    setTutorLoading(true);
    setTutorQuizAnswer(null);
    handleStopSpeaking();
    try {
      const data = await askAiTutor(q);
      setTutorResponse(data);
    } catch (err) {
      console.warn('Tutor fetch notice:', err);
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

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      voiceAssist.stop();
      voiceAssist.stopListening();
    };
  }, []);

  return (
    <div className="space-y-5 pb-16 min-w-0 w-full overflow-hidden">
      {/* Academy Header & Progress Bar */}
      <div className="rounded-2xl border border-slate-800 bg-[#121824] p-4 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <GraduationCap className="h-4 w-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight break-words">
                Financial Intelligence Academy
              </h1>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono text-emerald-300 font-semibold">
                Voice Assisted
              </span>
            </div>
            <p className="text-xs text-slate-400 break-words leading-relaxed">
              Interactive trading mastery, investing principles, instant audio narration, and conversational AI guidance.
            </p>
          </div>

          {/* Quick Progress Indicator */}
          <div className="rounded-xl border border-slate-800/90 bg-[#0f141c] p-3 shrink-0 flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Curriculum Progress</span>
              <span className="text-sm font-bold text-white font-mono">
                {completedCount} / {totalLessonsCount} Lessons <span className="text-emerald-400 font-semibold">({progressPercent}%)</span>
              </span>
            </div>
            <div className="w-16 sm:w-24 bg-slate-800 h-2 rounded-full overflow-hidden shrink-0">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Search & Voice Assist Action Bar */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search any lesson, pattern, or formula (e.g. Hammer, RSI, P/E, Moat)..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full rounded-xl border border-slate-800 bg-[#0f141c] py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {/* Microphone Voice Search Button */}
              <button
                type="button"
                onClick={handleStartVoiceSearch}
                title={isListeningSearch ? 'Listening...' : 'Search with your voice'}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  isListeningSearch
                    ? 'bg-rose-500/20 text-rose-400 animate-pulse border border-rose-500/40'
                    : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                }`}
              >
                {isListeningSearch ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            </div>

            {/* Quick Resume Button if a lesson is active */}
            {selectedLesson && (
              <button
                onClick={() => {
                  if (lessonReaderRef.current) {
                    lessonReaderRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors shrink-0 cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Jump to Lesson</span>
              </button>
            )}
          </div>

          {/* Voice Notification Banner */}
          {voiceNotice && (
            <div className="mt-2 text-xs py-1.5 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <Headphones className="h-3.5 w-3.5 shrink-0" />
              <span className="break-words">{voiceNotice}</span>
            </div>
          )}

          {/* Quick Search Dropdown Results */}
          {isSearchOpen && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 z-30 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-slate-700 bg-[#0f141c] p-2 shadow-2xl shadow-black/80 space-y-1">
              {searchResults.length > 0 ? (
                searchResults.map((res, idx) => {
                  if (res.type === 'glossary') {
                    const g = res.item as GlossaryTerm;
                    return (
                      <button
                        key={`sr-g-${idx}`}
                        onClick={() => {
                          setActiveTab('glossary');
                          setGlossarySearch(g.term);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-slate-800/80 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono uppercase bg-slate-800 text-teal-400 px-1.5 py-0.5 rounded">
                              Glossary
                            </span>
                            <span className="text-xs font-bold text-white">{g.term}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{g.definition}</p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      </button>
                    );
                  }

                  const l = res.item as CourseLesson;
                  return (
                    <button
                      key={`sr-l-${idx}`}
                      onClick={() => {
                        setActiveTab(res.type === 'trading' ? 'trading' : 'investing');
                        handleSelectLesson(l, res.type);
                      }}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-slate-800/80 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                            {res.type === 'trading' ? 'Trading Course' : 'Investing'}
                          </span>
                          <span className="text-xs font-bold text-white break-words">{l.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{l.summary}</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    </button>
                  );
                })
              ) : (
                <div className="p-3 text-center text-xs text-slate-400">
                  No matching lessons found for "{searchQuery}". Try "RSI", "Candlestick", or "Moat".
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'trading', label: `Trading Course (${tradingLevels.length} Levels)` },
          { id: 'investing', label: `Investing Mastery (${investingModules.length} Modules)` },
          { id: 'tutor', label: 'AI Finance Mentor & Quizzes' },
          { id: 'glossary', label: `Glossary & Formulas (${glossaryTerms.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            id={`learn-tab-${tab.id}`}
            onClick={() => {
              setActiveTab(tab.id as any);
              handleStopSpeaking();
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: TRADING COURSE */}
      {activeTab === 'trading' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Course Curriculum Outline (Compact & Collapsible) */}
          <div className="lg:col-span-4 space-y-3 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-emerald-400" />
                Course Curriculum
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                {tradingLevels.reduce((acc, l) => acc + l.lessons.length, 0)} Lessons
              </span>
            </div>

            <div className="space-y-2.5">
              {tradingLevels.map(lvl => {
                const isExpanded = expandedLevels[lvl.id] ?? true;
                const levelCompletedCount = lvl.lessons.filter(l => completedLessonIds.includes(l.id)).length;
                const isAllCompleted = levelCompletedCount === lvl.lessons.length;

                return (
                  <div
                    key={lvl.id}
                    className="rounded-xl border border-slate-800 bg-[#121824] overflow-hidden transition-colors"
                  >
                    {/* Collapsible Header */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedLevels(prev => ({
                          ...prev,
                          [lvl.id]: !isExpanded,
                        }))
                      }
                      className="w-full p-3 text-left flex items-center justify-between gap-2 hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-emerald-400">
                            Level {lvl.levelNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {lvl.duration}
                          </span>
                          {isAllCompleted && (
                            <span className="rounded bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.2 font-mono">
                              Done
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-white mt-1 break-words leading-snug">
                          {lvl.title}
                        </h4>
                      </div>
                      <div className="p-1 rounded-md text-slate-400 hover:text-white shrink-0">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </button>

                    {/* Lesson Buttons inside level */}
                    {isExpanded && (
                      <div className="p-2.5 pt-0 border-t border-slate-800/60 space-y-1.5">
                        <p className="text-[11px] text-slate-400 px-1 py-1 break-words leading-relaxed">
                          {lvl.description}
                        </p>
                        {lvl.lessons.map(lesson => {
                          const isSelected = selectedLesson?.id === lesson.id;
                          const isDone = completedLessonIds.includes(lesson.id);

                          return (
                            <button
                              key={lesson.id}
                              onClick={() => handleSelectLesson(lesson, 'trading')}
                              className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30'
                                  : 'text-slate-300 hover:bg-slate-800/70 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span
                                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] shrink-0 ${
                                    isDone ? 'bg-emerald-500 text-slate-950 font-bold' : 'border border-slate-600 text-slate-400'
                                  }`}
                                >
                                  {isDone ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : '•'}
                                </span>
                                <span className="break-words leading-tight">{lesson.title}</span>
                              </div>
                              <ArrowRight className="h-3 w-3 shrink-0 text-slate-500 group-hover:text-emerald-400" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Lesson Reader with Voice Narrator */}
          <div ref={lessonReaderRef} className="lg:col-span-8 min-w-0">
            {selectedLesson ? (
              <div className="rounded-2xl border border-slate-800 bg-[#121824] p-4 sm:p-6 space-y-6 overflow-hidden">
                {/* Lesson Header & Breadcrumb */}
                <div className="border-b border-slate-800 pb-4 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {selectedCourseType === 'trading' ? 'Trading Lesson' : 'Investing Lesson'}
                    </span>

                    {/* Completion Toggle */}
                    <button
                      onClick={() => toggleLessonCompleted(selectedLesson.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        completedLessonIds.includes(selectedLesson.id)
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{completedLessonIds.includes(selectedLesson.id) ? 'Completed' : 'Mark as Done'}</span>
                    </button>
                  </div>

                  <h2 className="text-lg sm:text-2xl font-bold text-white break-words leading-tight">
                    {selectedLesson.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 break-words leading-relaxed">
                    {selectedLesson.summary}
                  </p>
                </div>

                {/* Voice Assist Player Toolbar */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                      <Headphones className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Voice Narrator</span>
                        {isSpeaking && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                            {isPaused ? 'Paused' : 'Playing...'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">Listen to this lesson read aloud by AI voice</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                    {/* Speech Rate buttons */}
                    <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-[10px] font-mono">
                      {[0.8, 1.0, 1.25].map(rate => (
                        <button
                          key={rate}
                          onClick={() => {
                            setSpeechRate(rate);
                            voiceAssist.setRate(rate);
                          }}
                          className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                            speechRate === rate ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>

                    {/* Play/Pause Button */}
                    <button
                      onClick={handleNarrateLesson}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow cursor-pointer"
                    >
                      {isSpeaking && !isPaused ? (
                        <>
                          <Pause className="h-3.5 w-3.5" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3.5 w-3.5" />
                          <span>{isPaused ? 'Resume' : 'Listen'}</span>
                        </>
                      )}
                    </button>

                    {/* Stop Button */}
                    {isSpeaking && (
                      <button
                        onClick={handleStopSpeaking}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Stop Voice Narration"
                      >
                        <Square className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Lesson Body */}
                <div className="space-y-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed break-words">
                  {selectedLesson.content.map((p: string, idx: number) => (
                    <p key={idx} className="break-words">
                      {p}
                    </p>
                  ))}
                </div>

                {/* Key Takeaways */}
                {selectedLesson.keyTakeaways && selectedLesson.keyTakeaways.length > 0 && (
                  <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <BookmarkCheck className="h-4 w-4 shrink-0" />
                      Key Mathematical Takeaways
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {selectedLesson.keyTakeaways.map((k: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 break-words">
                          <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                          <span className="break-words leading-relaxed">{k}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Interactive Exercise / Quiz */}
                {selectedLesson.exercise && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-emerald-400 shrink-0" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                        Concept Check & Instant Feedback
                      </h4>
                    </div>

                    <p className="text-xs sm:text-sm font-medium text-slate-100 break-words leading-relaxed">
                      {selectedLesson.exercise.prompt}
                    </p>

                    <div className="space-y-2">
                      {selectedLesson.exercise.options.map((opt: string, optIdx: number) => {
                        const isChosen = quizAnswer === optIdx;
                        const isCorrect = selectedLesson.exercise!.correctIndex === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              setQuizAnswer(optIdx);
                              setShowQuizResult(true);
                            }}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-2.5 break-words min-w-0 ${
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
                            <span className="font-mono font-bold shrink-0">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span className="break-words leading-relaxed flex-1">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {showQuizResult && (
                      <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-1 animate-in fade-in">
                        <span className="font-bold text-white block">Explanation:</span>
                        <p className="text-slate-300 break-words leading-relaxed">
                          {selectedLesson.exercise.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Navigation: Previous & Next Lesson Controls */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  {prevLesson ? (
                    <button
                      onClick={() => handleSelectLesson(prevLesson, selectedCourseType)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer min-w-0"
                    >
                      <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate max-w-[130px] sm:max-w-[180px]">
                        Prev: {prevLesson.title}
                      </span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {nextLesson ? (
                    <button
                      onClick={() => handleSelectLesson(nextLesson, selectedCourseType)}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer ml-auto min-w-0 shadow"
                    >
                      <span className="truncate max-w-[130px] sm:max-w-[180px]">
                        Next: {nextLesson.title}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveTab('investing');
                        handleStopSpeaking();
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer ml-auto"
                    >
                      <span>Explore Investing Mastery</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl border border-slate-800 bg-[#121824] text-xs text-slate-400">
                Select a lesson from the curriculum to start reading.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INVESTING MASTERY (Directly interactive with rich lessons) */}
      {activeTab === 'investing' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-[#121824] p-4 text-xs text-slate-300 leading-relaxed break-words flex items-center justify-between gap-4 flex-wrap">
            <span>
              Master compounding, balance sheet solvency, capital efficiency (ROE/ROCE), competitive economic moats, and valuation safety. Click any module to read its lesson immediately!
            </span>
            <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-3 py-1 font-mono text-[11px] font-bold border border-emerald-500/20">
              {investingModules.length} In-Depth Modules
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Modules Grid */}
            <div className="lg:col-span-4 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                Investing Modules
              </h3>
              <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
                {investingModules.map((mod, idx) => {
                  const isSelected = selectedLesson?.id === mod.lesson.id && selectedCourseType === 'investing';
                  const isDone = completedLessonIds.includes(mod.lesson.id);

                  return (
                    <div
                      key={mod.id}
                      onClick={() => handleSelectLesson(mod.lesson, 'investing')}
                      className={`rounded-xl border p-3.5 transition-all cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'border-emerald-500/40 bg-emerald-500/15 shadow-sm'
                          : 'border-slate-800 bg-[#121824] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-emerald-400 font-bold">Module {idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{mod.duration}</span>
                          {isDone && (
                            <span className="rounded-full bg-emerald-500 text-slate-950 p-0.5">
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                      </div>
                      <h4 className="text-xs font-semibold text-white break-words leading-snug">
                        {mod.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 break-words leading-relaxed line-clamp-2">
                        {mod.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Direct Interactive Lesson Reader for Investing */}
            <div ref={lessonReaderRef} className="lg:col-span-8 min-w-0">
              {selectedLesson && selectedCourseType === 'investing' ? (
                <div className="rounded-2xl border border-slate-800 bg-[#121824] p-4 sm:p-6 space-y-6 overflow-hidden">
                  <div className="border-b border-slate-800 pb-4 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Investing Mastery Lesson
                      </span>

                      <button
                        onClick={() => toggleLessonCompleted(selectedLesson.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          completedLessonIds.includes(selectedLesson.id)
                            ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{completedLessonIds.includes(selectedLesson.id) ? 'Completed' : 'Mark as Done'}</span>
                      </button>
                    </div>

                    <h2 className="text-lg sm:text-2xl font-bold text-white break-words leading-tight">
                      {selectedLesson.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 break-words leading-relaxed">
                      {selectedLesson.summary}
                    </p>
                  </div>

                  {/* Voice Assist Bar */}
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                        <Headphones className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">Voice Narrator</span>
                          {isSpeaking && (
                            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                              {isPaused ? 'Paused' : 'Playing...'}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">Listen to this investing lesson read aloud</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-[10px] font-mono">
                        {[0.8, 1.0, 1.25].map(rate => (
                          <button
                            key={rate}
                            onClick={() => {
                              setSpeechRate(rate);
                              voiceAssist.setRate(rate);
                            }}
                            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                              speechRate === rate ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={handleNarrateLesson}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow cursor-pointer"
                      >
                        {isSpeaking && !isPaused ? (
                          <>
                            <Pause className="h-3.5 w-3.5" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3.5 w-3.5" />
                            <span>{isPaused ? 'Resume' : 'Listen'}</span>
                          </>
                        )}
                      </button>

                      {isSpeaking && (
                        <button
                          onClick={handleStopSpeaking}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Stop Voice"
                        >
                          <Square className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lesson Paragraphs */}
                  <div className="space-y-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed break-words">
                    {selectedLesson.content.map((p: string, idx: number) => (
                      <p key={idx} className="break-words">
                        {p}
                      </p>
                    ))}
                  </div>

                  {/* Key Takeaways */}
                  {selectedLesson.keyTakeaways && (
                    <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <BookmarkCheck className="h-4 w-4 shrink-0" />
                        Key Investment Principles
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {selectedLesson.keyTakeaways.map((k: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 break-words">
                            <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                            <span className="break-words leading-relaxed">{k}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Quiz / Exercise */}
                  {selectedLesson.exercise && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-emerald-400 shrink-0" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                          Concept Check & Instant Feedback
                        </h4>
                      </div>

                      <p className="text-xs sm:text-sm font-medium text-slate-100 break-words leading-relaxed">
                        {selectedLesson.exercise.prompt}
                      </p>

                      <div className="space-y-2">
                        {selectedLesson.exercise.options.map((opt: string, optIdx: number) => {
                          const isChosen = quizAnswer === optIdx;
                          const isCorrect = selectedLesson.exercise!.correctIndex === optIdx;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => {
                                setQuizAnswer(optIdx);
                                setShowQuizResult(true);
                              }}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-2.5 break-words min-w-0 ${
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
                              <span className="font-mono font-bold shrink-0">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span className="break-words leading-relaxed flex-1">{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {showQuizResult && (
                        <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-1 animate-in fade-in">
                          <span className="font-bold text-white block">Explanation:</span>
                          <p className="text-slate-300 break-words leading-relaxed">
                            {selectedLesson.exercise.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Navigation prev/next */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                    {prevLesson ? (
                      <button
                        onClick={() => handleSelectLesson(prevLesson, 'investing')}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[140px] sm:max-w-[200px]">Prev: {prevLesson.title}</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    {nextLesson && (
                      <button
                        onClick={() => handleSelectLesson(nextLesson, 'investing')}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer ml-auto shadow"
                      >
                        <span className="truncate max-w-[140px] sm:max-w-[200px]">Next: {nextLesson.title}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center rounded-2xl border border-slate-800 bg-[#121824] text-xs text-slate-400">
                  Click any investing module on the left to read its lesson directly.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AI FINANCE TUTOR */}
      {activeTab === 'tutor' && (
        <div className="rounded-2xl border border-slate-800 bg-[#121824] p-4 sm:p-6 space-y-6 min-w-0">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">StockStar AI Financial Mentor</h3>
                <p className="text-xs text-slate-400 break-words">
                  Ask any market question via text or voice to receive real-world analogies, formulas, and an instant quiz.
                </p>
              </div>
            </div>

            {/* Voice notice */}
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs text-emerald-400 font-mono">
              <Mic className="h-3.5 w-3.5" />
              <span>Voice Ready</span>
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
                className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer break-words"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box with Voice Input Button */}
          <div className="flex gap-2 min-w-0">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                placeholder="Ask anything (e.g. How does DCF work? What is VWAP?)..."
                value={tutorQuery}
                onChange={e => setTutorQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAskTutor()}
                className="w-full rounded-xl border border-slate-800 bg-[#0f141c] py-2.5 pl-4 pr-11 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleStartVoiceTutor}
                title={isListeningTutor ? 'Listening...' : 'Speak your question'}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  isListeningTutor
                    ? 'bg-rose-500/20 text-rose-400 animate-pulse border border-rose-500/40'
                    : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                }`}
              >
                {isListeningTutor ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            </div>

            <button
              onClick={() => handleAskTutor()}
              disabled={tutorLoading}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            >
              {tutorLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>Explain</span>
            </button>
          </div>

          {/* Tutor Response */}
          {tutorResponse && (
            <div className="rounded-xl border border-slate-800 bg-[#0f141c] p-4 sm:p-6 space-y-5 animate-in fade-in min-w-0 overflow-hidden">
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 break-words">
                    {tutorResponse.conceptName || 'Core Explanation'}
                  </h4>
                  <div className="flex items-center gap-2">
                    {/* Read Tutor Explanation Aloud */}
                    <button
                      onClick={() => {
                        const text = `${tutorResponse.conceptName}. ${tutorResponse.explanation}. Key points: ${tutorResponse.keyTakeaways?.join('. ') || ''}`;
                        handleStartSpeaking(text);
                      }}
                      className="flex items-center gap-1 text-[11px] rounded-md bg-slate-800 px-2.5 py-1 text-emerald-400 hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <Volume2 className="h-3 w-3" />
                      <span>Listen</span>
                    </button>
                    {tutorResponse.difficultyLevel && (
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                        {tutorResponse.difficultyLevel}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed break-words">
                  {tutorResponse.explanation}
                </p>
              </div>

              {tutorResponse.realWorldExample && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 overflow-hidden">
                  <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Market Example</h5>
                  <p className="text-xs text-slate-300 leading-relaxed break-words">{tutorResponse.realWorldExample}</p>
                </div>
              )}

              {tutorResponse.keyTakeaways && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Summary Takeaways</h5>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {tutorResponse.keyTakeaways.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 break-words">
                        <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                        <span className="break-words leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tutor Quiz */}
              {(tutorResponse.quickQuiz || tutorResponse.quizQuestion) && (() => {
                const quiz = tutorResponse.quickQuiz || tutorResponse.quizQuestion;
                return (
                  <div className="mt-4 p-4 sm:p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3 overflow-hidden">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Concept Verification Quiz
                    </h5>
                    <p className="text-xs sm:text-sm font-medium text-white break-words leading-relaxed">{quiz.question}</p>

                    <div className="space-y-2">
                      {quiz.options.map((opt: string, optIdx: number) => {
                        const isChosen = tutorQuizAnswer === optIdx;
                        const isCorrect = quiz.correctIndex === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => setTutorQuizAnswer(optIdx)}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-2 break-words min-w-0 ${
                              tutorQuizAnswer !== null
                                ? isCorrect
                                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold'
                                  : isChosen
                                  ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                                  : 'border-slate-800 bg-slate-900/40 text-slate-400'
                                : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span className="font-mono font-bold shrink-0">{String.fromCharCode(65 + optIdx)}.</span>
                            <span className="break-words leading-relaxed flex-1">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {tutorQuizAnswer !== null && (
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 break-words leading-relaxed">
                        {quiz.explanation}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: GLOSSARY & FORMULAS (With no text overflow & voice assist) */}
      {activeTab === 'glossary' && (
        <div className="space-y-4 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#121824] p-4 rounded-xl border border-slate-800 min-w-0">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search financial terms, ratios, or formulas (e.g. ROE, ROCE, VWAP, Alpha)..."
                value={glossarySearch}
                onChange={e => setGlossarySearch(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-[#0f141c] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-mono py-1">
              {['ALL', 'Fundamentals', 'Valuation', 'Profitability', 'Technicals', 'Risk', 'Portfolio', 'Trading'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setGlossaryCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
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
                className="rounded-xl border border-slate-800 bg-[#121824] p-5 space-y-3 hover:border-slate-700 transition-colors min-w-0 overflow-hidden"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <h4 className="text-base font-bold text-white font-mono break-words">{item.term}</h4>
                    <button
                      type="button"
                      onClick={() => {
                        const script = `${item.term}. Definition: ${item.definition}. ${item.formula ? `Formula: ${item.formula}.` : ''} ${item.example ? `Example: ${item.example}` : ''}`;
                        handleStartSpeaking(script);
                      }}
                      className="p-1 rounded bg-slate-800/80 text-emerald-400 hover:bg-slate-700 transition-colors cursor-pointer"
                      title={`Listen to ${item.term}`}
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-slate-700 shrink-0">
                    {item.category}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed break-words">{item.definition}</p>

                {item.formula && (
                  <div className="rounded-lg bg-slate-950/70 p-3 font-mono text-xs text-teal-300 border border-slate-800/80 break-words whitespace-normal overflow-x-auto">
                    <span className="text-slate-500 text-[10px] block font-sans uppercase tracking-wider mb-1">
                      Mathematical Formula:
                    </span>
                    <span className="break-words leading-relaxed">{item.formula}</span>
                  </div>
                )}

                {item.example && (
                  <div className="text-xs text-slate-400 break-words leading-relaxed">
                    <span className="font-semibold text-slate-300">Market Example: </span>
                    {item.example}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 break-words leading-relaxed">
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
