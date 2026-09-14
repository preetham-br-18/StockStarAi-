import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Wallet,
  Compass,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Bot,
  User,
  Zap,
  Target,
  ChevronRight,
} from 'lucide-react';
import { askCopilot, CopilotResponse } from '../services/copilotService';
import { STOCKS_UNIVERSE } from '../services/marketDataStore';
import { voiceAssist } from '../services/voiceAssist';

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSymbol?: string;
  onSelectStock: (symbol: string) => void;
  onSelectTab?: (tab: string) => void;
  onOpenOrderModal?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  query?: string;
  response?: CopilotResponse;
  timestamp: string;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  isOpen,
  onClose,
  currentSymbol = 'RELIANCE',
  onSelectStock,
  onSelectTab,
  onOpenOrderModal,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState(currentSymbol);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with currentSymbol when opened
  useEffect(() => {
    if (currentSymbol) {
      setSelectedSymbol(currentSymbol);
    }
  }, [currentSymbol]);

  const activeStock = STOCKS_UNIVERSE[selectedSymbol]?.quote;
  const popularSymbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'TATAMOTORS', 'NVDA', 'AAPL'];

  // Initialize initial analysis when drawer is opened if empty
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      handleAsk(`Provide comprehensive technical, fundamental, and tactical trade setup for ${selectedSymbol}`);
    }
  }, [isOpen, selectedSymbol]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Clean up voice when closed
  useEffect(() => {
    if (!isOpen) {
      voiceAssist.stop();
      voiceAssist.stopListening();
      setSpeakingMessageId(null);
      setIsListening(false);
    }
  }, [isOpen]);

  const handleAsk = async (customPrompt?: string) => {
    const promptToAsk = (customPrompt || query).trim();
    if (!promptToAsk || loading) return;

    const userMsgId = `u-${Date.now()}`;
    const assistantMsgId = `a-${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message to conversation thread
    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        role: 'user',
        query: promptToAsk,
        timestamp: timeStr,
      },
    ]);

    setQuery('');
    setLoading(true);

    try {
      const res = await askCopilot(promptToAsk, selectedSymbol);
      setMessages(prev => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          response: res,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('Copilot request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSpeak = (msgId: string, resp: CopilotResponse) => {
    if (speakingMessageId === msgId) {
      voiceAssist.stop();
      setSpeakingMessageId(null);
      return;
    }

    voiceAssist.stop();
    setSpeakingMessageId(msgId);

    const speechScript = `${resp.headline}. ${resp.summary}. Verdict: ${resp.sentiment} with ${resp.confidenceScore} percent confidence. ${
      resp.tradeSetup ? `Trade action: ${resp.tradeSetup.action}. Target ${resp.tradeSetup.target}, Stop loss ${resp.tradeSetup.stopLoss}.` : ''
    }`;

    voiceAssist.speak(speechScript, {
      onEnd: () => setSpeakingMessageId(null),
      onError: () => setSpeakingMessageId(null),
    });
  };

  const handleToggleVoiceInput = () => {
    if (isListening) {
      voiceAssist.stopListening();
      setIsListening(false);
      return;
    }

    if (!voiceAssist.isSTTSupported()) {
      alert('Speech recognition is not supported in this browser window. Please type your query in the prompt input.');
      return;
    }

    voiceAssist.startListening(
      (transcript) => {
        setIsListening(false);
        if (transcript) {
          setQuery(transcript);
          handleAsk(transcript);
        }
      },
      {
        onStart: () => setIsListening(true),
        onEnd: () => setIsListening(false),
        onError: () => setIsListening(false),
      }
    );
  };

  const handleResetChat = () => {
    voiceAssist.stop();
    setSpeakingMessageId(null);
    setMessages([]);
    handleAsk(`Provide comprehensive technical, fundamental, and tactical trade setup for ${selectedSymbol}`);
  };

  const handleSelectSymbol = (sym: string) => {
    setSelectedSymbol(sym);
    onSelectStock(sym);
    handleAsk(`Analyze ${sym} momentum, key price pivots, and quantitative outlook`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="flex h-full w-full max-w-2xl flex-col border-l border-slate-800 bg-[#0c1017] shadow-2xl animate-in slide-in-from-right duration-250">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#101622] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans font-bold text-base text-white">StockStar Copilot</h3>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-400">
                  AI ASSISTANT
                </span>
              </div>
              <p className="text-xs text-slate-400">Institutional Strategy, Technical Pivots & Quantitative Insights</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="copilot-reset-chat-btn"
              onClick={handleResetChat}
              title="Reset Chat Session"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              id="close-copilot-btn"
              onClick={onClose}
              title="Close Copilot"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick Stock Selector Bar */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800/80 bg-slate-900/60 px-4 py-2 text-xs no-scrollbar">
          <span className="text-slate-400 text-[11px] font-medium shrink-0">Focus:</span>
          {popularSymbols.map((sym) => {
            const isSelected = selectedSymbol === sym;
            const q = STOCKS_UNIVERSE[sym]?.quote;
            return (
              <button
                key={sym}
                onClick={() => handleSelectSymbol(sym)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono font-semibold shrink-0 transition-all border ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{sym}</span>
                {q && (
                  <span className={`text-[10px] ${q.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {q.changePercent >= 0 ? '+' : ''}{q.changePercent}%
                  </span>
                )}
              </button>
            );
          })}
          <button
            onClick={() => handleAsk('Audit my paper portfolio diversification, risk, and cash allocation')}
            className="rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1 text-xs font-mono text-teal-400 hover:border-teal-500/50 hover:bg-teal-950/20 shrink-0"
          >
            🛡️ Portfolio Audit
          </button>
        </div>

        {/* Active Stock Indicator Banner */}
        {activeStock && (
          <div className="flex items-center justify-between border-b border-slate-800/60 bg-slate-950/40 px-5 py-2 text-xs">
            <div className="flex items-center gap-2 font-mono">
              <span className="font-bold text-white">{activeStock.symbol}</span>
              <span className="text-slate-400">₹{activeStock.price.toLocaleString('en-IN')}</span>
              <span className={`font-semibold ${activeStock.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({activeStock.changePercent >= 0 ? '+' : ''}{activeStock.changePercent}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onSelectStock(selectedSymbol);
                  onSelectTab?.('terminal');
                  onClose();
                }}
                className="text-[11px] font-mono text-slate-400 hover:text-emerald-400 flex items-center gap-0.5"
              >
                <span>Terminal</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Quick Prompt Cards at the top */}
          {messages.length <= 1 && (
            <div className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-900/30 p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <Compass className="h-3.5 w-3.5 text-emerald-400" />
                <span>Suggested Strategies & Queries</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => handleAsk(`Give me an actionable trade setup for ${selectedSymbol} with entry, stop loss, and target`)}
                  className="rounded-lg border border-slate-800 bg-slate-900/80 p-2 text-left text-xs text-slate-300 hover:border-emerald-500/50 hover:bg-emerald-950/20 hover:text-white transition-all flex items-center justify-between"
                >
                  <span>🎯 Trade Setup for {selectedSymbol}</span>
                  <ChevronRight className="h-3 w-3 text-slate-500 shrink-0" />
                </button>
                <button
                  onClick={() => handleAsk(`What are the key technical support and resistance pivot levels for ${selectedSymbol}?`)}
                  className="rounded-lg border border-slate-800 bg-slate-900/80 p-2 text-left text-xs text-slate-300 hover:border-emerald-500/50 hover:bg-emerald-950/20 hover:text-white transition-all flex items-center justify-between"
                >
                  <span>📊 Pivots & Resistance</span>
                  <ChevronRight className="h-3 w-3 text-slate-500 shrink-0" />
                </button>
                <button
                  onClick={() => handleAsk(`Scan the market and show top 3 breakout stocks right now`)}
                  className="rounded-lg border border-slate-800 bg-slate-900/80 p-2 text-left text-xs text-slate-300 hover:border-emerald-500/50 hover:bg-emerald-950/20 hover:text-white transition-all flex items-center justify-between"
                >
                  <span>🚀 Top Breakout Candidates</span>
                  <ChevronRight className="h-3 w-3 text-slate-500 shrink-0" />
                </button>
                <button
                  onClick={() => handleAsk(`Explain VWAP pullback trading strategy for intraday execution`)}
                  className="rounded-lg border border-slate-800 bg-slate-900/80 p-2 text-left text-xs text-slate-300 hover:border-emerald-500/50 hover:bg-emerald-950/20 hover:text-white transition-all flex items-center justify-between"
                >
                  <span>💡 VWAP Strategy Blueprint</span>
                  <ChevronRight className="h-3 w-3 text-slate-500 shrink-0" />
                </button>
              </div>
            </div>
          )}

          {/* Messages Loop */}
          {messages.map((msg) => {
            if (msg.role === 'user') {
              return (
                <div key={msg.id} className="flex justify-end gap-2.5">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-emerald-600/90 px-4 py-3 text-xs text-white shadow-md">
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.query}</p>
                    <span className="block mt-1 text-[10px] text-emerald-200/80 text-right font-mono">{msg.timestamp}</span>
                  </div>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    <User className="h-4 w-4" />
                  </div>
                </div>
              );
            }

            const resp = msg.response;
            if (!resp) return null;
            const isSpeaking = speakingMessageId === msg.id;

            return (
              <div key={msg.id} className="flex justify-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mt-1">
                  <Bot className="h-4 w-4" />
                </div>

                <div className="w-full max-w-[92%] space-y-3 rounded-2xl rounded-tl-xs border border-slate-800 bg-[#111723] p-4 sm:p-5 shadow-xl">
                  {/* Card Header: Sentiment, Confidence & Audio Button */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-mono font-bold ${
                          resp.sentiment === 'BULLISH'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : resp.sentiment === 'BEARISH'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {resp.sentiment === 'BULLISH' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {resp.sentiment}
                      </span>
                      <span className="text-xs font-medium text-slate-200 line-clamp-1">{resp.headline}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSpeak(msg.id, resp)}
                        title={isSpeaking ? 'Stop audio' : 'Listen with AI Voice'}
                        className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-mono transition-colors border ${
                          isSpeaking
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 animate-pulse'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                        <span className="text-[10px] hidden sm:inline">{isSpeaking ? 'Stop' : 'Listen'}</span>
                      </button>

                      <div className="hidden sm:flex items-center gap-1 font-mono text-[11px]">
                        <span className="text-slate-400">Confidence:</span>
                        <span className="font-bold text-emerald-400">{resp.confidenceScore}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-xs leading-relaxed text-slate-200">{resp.summary}</p>

                  {/* Actionable Trade Setup Box */}
                  {resp.tradeSetup && (
                    <div className="rounded-xl border border-teal-500/20 bg-[#121c2b] p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                          <Target className="h-3.5 w-3.5" />
                          <span>Actionable Trade Matrix</span>
                        </span>
                        <span className="rounded bg-teal-500/20 border border-teal-500/40 px-2 py-0.5 text-[10px] font-mono font-bold text-teal-300">
                          ACTION: {resp.tradeSetup.action}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                        <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                          <span className="block text-[10px] text-slate-400">Entry Zone</span>
                          <span className="font-bold text-white">{resp.tradeSetup.suggestedEntry}</span>
                        </div>
                        <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                          <span className="block text-[10px] text-slate-400">Stop Loss</span>
                          <span className="font-bold text-rose-400">{resp.tradeSetup.stopLoss}</span>
                        </div>
                        <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                          <span className="block text-[10px] text-slate-400">Target</span>
                          <span className="font-bold text-emerald-400">{resp.tradeSetup.target}</span>
                        </div>
                        <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                          <span className="block text-[10px] text-slate-400">Risk : Reward</span>
                          <span className="font-bold text-teal-300">{resp.tradeSetup.riskRewardRatio}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Technical Pivots */}
                  {resp.technicalPivots && (
                    <div className="flex items-center justify-between rounded-lg bg-slate-900/50 p-2.5 text-xs font-mono border border-slate-800/60">
                      <div>
                        <span className="text-slate-400">Support: </span>
                        <span className="font-bold text-emerald-400">₹{resp.technicalPivots.support}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Pivot: </span>
                        <span className="font-bold text-slate-200">₹{resp.technicalPivots.pivot}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Resistance: </span>
                        <span className="font-bold text-amber-400">₹{resp.technicalPivots.resistance}</span>
                      </div>
                    </div>
                  )}

                  {/* Key Drivers */}
                  {resp.keyDrivers && resp.keyDrivers.length > 0 && (
                    <div className="space-y-1.5 rounded-xl bg-slate-900/50 p-3 border border-slate-800/50">
                      <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Zap className="h-3 w-3" />
                        <span>Core Catalysts & Drivers</span>
                      </span>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {resp.keyDrivers.map((driver, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">•</span>
                            <span>{driver}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Risk Factors */}
                  {resp.keyRisks && resp.keyRisks.length > 0 && (
                    <div className="space-y-1 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5 font-medium text-amber-400">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Risk Factors & Invalidation:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-400 pl-1">
                        {resp.keyRisks.map((risk, idx) => (
                          <li key={idx}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Follow-up Suggested Prompts */}
                  {resp.suggestedPrompts && resp.suggestedPrompts.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-slate-400">Suggested Next Questions:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {resp.suggestedPrompts.map((p, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAsk(p)}
                            className="rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300 hover:border-emerald-500/50 hover:bg-emerald-950/30 hover:text-white transition-all text-left"
                          >
                            💬 {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Shortcuts */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      id={`copilot-terminal-${msg.id}`}
                      onClick={() => {
                        onSelectStock(selectedSymbol);
                        onSelectTab?.('terminal');
                        onClose();
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow"
                    >
                      <Layers className="h-3.5 w-3.5" />
                      <span>Open in Terminal</span>
                    </button>

                    <button
                      id={`copilot-paper-${msg.id}`}
                      onClick={() => {
                        onSelectStock(selectedSymbol);
                        if (onOpenOrderModal) {
                          onOpenOrderModal();
                        } else {
                          onSelectTab?.('paper');
                          onClose();
                        }
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      <Wallet className="h-3.5 w-3.5" />
                      <span>Execute Paper Trade</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator in thread */}
          {loading && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-white">Copilot is analyzing market telemetry...</p>
                <p className="text-[11px] text-slate-400 font-mono">Evaluating order book, technical indicators, and quantitative model consensus</p>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar with Voice Mic + Send */}
        <div className="border-t border-slate-800 bg-[#101622] p-3 sm:p-4">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              id="copilot-query-input"
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={isListening ? 'Listening... Speak your question now' : `Ask Copilot about ${selectedSymbol}, trade setups, or strategies...`}
              disabled={loading}
              className={`flex-1 rounded-xl border px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                isListening
                  ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500 animate-pulse'
                  : 'border-slate-800 bg-[#090d14] focus:border-emerald-500 focus:ring-emerald-500'
              }`}
            />

            {/* Mic Speech-to-Text Button */}
            <button
              id="copilot-voice-mic-btn"
              type="button"
              onClick={handleToggleVoiceInput}
              title={isListening ? 'Stop listening' : 'Speak to Copilot'}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                isListening
                  ? 'bg-rose-600 text-white animate-bounce shadow-lg shadow-rose-600/30'
                  : 'bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            {/* Submit Button */}
            <button
              id="copilot-submit-query-btn"
              type="submit"
              disabled={loading || !query.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
            <span>Powered by Gemini AI & Real-time Quantitative Backtesting</span>
            <span className="hidden sm:inline">Press Enter to send • 🎙️ Speak anytime</span>
          </div>
        </div>

      </div>
    </div>
  );
};
