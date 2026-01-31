import { useState, useEffect, useCallback } from 'react';
import { 
  Users, ChevronRight, CheckCircle2, 
  XCircle, Sparkles, Target, Brain, BookOpen
} from 'lucide-react';
import { supabase } from './lib/supabase';
import type { Personality } from './types';
import confetti from 'canvas-confetti';

// --- Utility: Shuffle ---
const shuffleArray = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

// --- Sub-Component: Photo Avatar (Fixes No Photos Bug) ---
function PhotoAvatar({ member, size = 'md' }: { member: Personality; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const [imgError, setImgError] = useState(false);
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  return (
    <div className={`${sizeClasses[size]} photo-frame rounded-full overflow-hidden flex-shrink-0 bg-slate-700`}>
      <img
        src={imgError ? `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name)}&background=random` : member.image_url}
        alt={member.full_name}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

export default function App() {
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'home' | 'play' | 'results' | 'study' | 'team'>('home');
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('sandbox-high-score') || '0'));

  // Game State
  const [mode, setMode] = useState<'face-to-name' | 'face-to-title' | 'title-to-face'>('face-to-name');
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quizPool, setQuizPool] = useState<Personality[]>([]);
  const [options, setOptions] = useState<Personality[]>([]);
  const [mistakes, setMistakes] = useState<Personality[]>([]);
  const [studyIndex, setStudyIndex] = useState(0);

  useEffect(() => {
    async function getData() {
      const { data } = await supabase.from('game_personalities').select('*');
      if (data) setPersonalities(data);
      setLoading(false);
    }
    getData();
  }, []);

  // --- Logic Fix: Mixed Gender Distractors ---
const generateTurn = useCallback((target: Personality, all: Personality[]) => {
  // 1. Filter by gender to keep distractors consistent
  const sameGenderPool = all.filter(p => p.gender === target.gender && p.id !== target.id);
  
  // 2. Ensure unique titles/names using a Set
  const uniqueDistractors: Personality[] = [];
  const seenValues = new Set([mode === 'face-to-title' ? target.title : target.full_name]);

  const shuffledPool = sameGenderPool.sort(() => 0.5 - Math.random());
  
  for (const p of shuffledPool) {
    const val = mode === 'face-to-title' ? p.title : p.full_name;
    if (!seenValues.has(val) && uniqueDistractors.length < 3) {
      seenValues.add(val);
      uniqueDistractors.push(p);
    }
  }

  setOptions(shuffleArray([target, ...uniqueDistractors]));
  setIsAnswered(false);
  setSelectedId(null);
}, [mode]);

  const startGame = (gameMode: typeof mode) => {
    const pool = shuffleArray(personalities).slice(0, 10);
    setQuizPool(pool);
    setMode(gameMode);
    setCurrentRound(1);
    setScore(0);
    setMistakes([]);
    generateTurn(pool[0], personalities);
    setView('play');
  };

  const handleGuess = (selected: Personality) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedId(selected.id);
    const correct = selected.id === quizPool[currentRound - 1].id;
    if (correct) {
      setScore(s => s + 1);
    } else {
      setMistakes(m => [...m, quizPool[currentRound - 1]]);
    }
  };

  const nextQuestion = () => {
    if (currentRound < 10) {
      const nextIdx = currentRound;
      setCurrentRound(prev => prev + 1);
      generateTurn(quizPool[nextIdx], personalities);
    } else {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('sandbox-high-score', score.toString());
      }
      if (score >= 8) confetti({ particleCount: 150, spread: 70 });
      setView('results');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-mesh flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-mesh px-4 py-8 md:py-12 text-slate-200">
      <div className="max-w-2xl mx-auto">
        
        {/* VIEW: HOME */}
        {view === 'home' && (
          <div className="text-center animate-in fade-in duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" /> Team Recognition Game
            </div>
            <h1 className="text-5xl font-black text-white mb-2 tracking-tight uppercase">Buildathon Judges</h1>
            <p className="text-slate-400 text-lg mb-8 italic tracking-wide">Learn the Team</p>
            
            <div className="grid gap-4 max-w-lg mx-auto mb-12">
              <ModeCard icon={Users} title="Face → Name" desc="See a photo, guess the name" onClick={() => startGame('face-to-name')} />
              <ModeCard icon={Target} title="Title → Face" desc="See a job title, find the person" onClick={() => startGame('title-to-face')} />
              <ModeCard icon={Brain} title="Face → Title" desc="See a photo, guess their role" onClick={() => startGame('face-to-title')} />
              <div className="pt-4 border-t border-white/10">
                <ModeCard icon={BookOpen} title="Study Mode" desc="Flip through cards to learn everyone" onClick={() => setView('study')} />
              </div>
            </div>
          </div>
        )}

        {/* VIEW: PLAY */}
        {view === 'play' && quizPool[currentRound - 1] && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end mb-4 text-sm font-bold text-slate-400">
              <span>Question {currentRound} of 10</span>
              <span className="text-blue-400">{score} Correct</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full mb-12 overflow-hidden">
              <div className="h-full progress-fill" style={{ width: `${(currentRound / 10) * 100}%` }} />
            </div>

            <div className="flex flex-col items-center">
              {mode !== 'title-to-face' ? (
                <div className="mb-8">
                  <PhotoAvatar member={quizPool[currentRound-1]} size="xl" />
                </div>
              ) : (
                <div className="text-center mb-12 py-10 px-6 glass rounded-3xl w-full">
                   <p className="text-blue-400 uppercase tracking-widest text-xs font-black mb-2">Find the person whose title is:</p>
                   <h2 className="text-3xl font-bold text-white italic">"{quizPool[currentRound-1].title}"</h2>
                </div>
              )}

              <h2 className="text-2xl font-bold text-white mb-8 text-center">
                {mode === 'face-to-name' && "Who is this person?"}
                {mode === 'face-to-title' && "What is their role?"}
                {mode === 'title-to-face' && "Who is this?"}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {options.map(opt => {
                  const isCorrect = opt.id === quizPool[currentRound-1].id;
                  const isSelected = selectedId === opt.id;
                  return (
                    <button 
                      key={opt.id} 
                      disabled={isAnswered}
                      onClick={() => handleGuess(opt)}
                      className={`option-btn p-5 rounded-2xl text-left font-bold flex items-center justify-between 
                        ${isAnswered && isCorrect ? 'correct' : ''} 
                        ${isAnswered && isSelected && !isCorrect ? 'incorrect' : ''}
                        ${isAnswered && !isSelected && isCorrect ? 'reveal-correct' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        {mode === 'title-to-face' && <PhotoAvatar member={opt} size="sm" />}
                        <span>{mode === 'face-to-title' ? (opt.title || 'Team Member') : opt.full_name}</span>
                      </div>
                      {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                      {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400" />}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="w-full mt-8 animate-in fade-in slide-in-from-top-4">
                  <div className="glass rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6">
                    <PhotoAvatar member={quizPool[currentRound-1]} size="lg" />
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-2xl font-bold text-white">{quizPool[currentRound-1].full_name}</h3>
                      <p className="text-blue-400 font-bold">{quizPool[currentRound-1].title}</p>
                      <p className="text-slate-400 text-sm mt-1">{quizPool[currentRound-1].organization}</p>
                    </div>
                    <button onClick={nextQuestion} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black transition-all">
                      NEXT QUESTION →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: RESULTS */}
        {view === 'results' && (
          <div className="text-center py-12 animate-in zoom-in duration-500">
            <div className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 p-1 mb-8">
              <div className="w-full h-full bg-slate-900 rounded-full flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-white">{score}</span>
                <span className="text-xs font-bold text-slate-500 uppercase">of 10</span>
              </div>
            </div>
            <h2 className="text-4xl font-black text-white mb-8">
              {score === 10 ? "PERFECT SCORE! 🎉" : score >= 7 ? "GREAT JOB! 🚀" : "KEEP LEARNING! 💪"}
            </h2>
            
            {mistakes.length > 0 && (
              <div className="glass rounded-3xl p-6 text-left mb-8">
                <h3 className="text-red-400 font-black mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
                  <XCircle className="w-5 h-5" /> Review Mistakes
                </h3>
                <div className="grid gap-3">
                  {mistakes.map((m, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
                      <PhotoAvatar member={m} size="sm" />
                      <div>
                        <div className="font-bold text-white">{m.full_name}</div>
                        <div className="text-xs text-slate-500">{m.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => setView('home')} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-3xl shadow-xl shadow-blue-500/20 transition-all uppercase tracking-widest">
              Play Again
            </button>
          </div>
        )}

        {/* VIEW: STUDY */}
        {view === 'study' && personalities[studyIndex] && (
          <div className="animate-in fade-in duration-500 text-center">
             <button onClick={() => setView('home')} className="mb-8 text-slate-500 hover:text-white flex items-center gap-2 mx-auto font-black uppercase text-[10px] tracking-[0.2em] transition-colors">
               ← Exit Study Mode
             </button>
             <div className="glass rounded-[40px] p-10 relative">
                <div className="relative z-10">
                   <div className="flex justify-center mb-8">
                      <PhotoAvatar member={personalities[studyIndex]} size="xl" />
                   </div>
                   <h2 className="text-4xl font-black text-white mb-2 tracking-tight">{personalities[studyIndex].full_name}</h2>
                   <p className="text-blue-400 text-xl font-bold mb-6">{personalities[studyIndex].title}</p>
                   <div className="bg-slate-900/50 p-6 rounded-3xl text-slate-400 text-sm leading-relaxed mb-10 min-h-[100px] border border-white/5 italic">
                     "{personalities[studyIndex].bio_blurb || "A valued member of the Buildathon team."}"
                   </div>
                   <div className="flex items-center gap-4">
                      <button disabled={studyIndex === 0} onClick={() => setStudyIndex(s => s - 1)} className="flex-1 bg-slate-800 p-5 rounded-2xl font-black disabled:opacity-20 transition-all uppercase text-xs tracking-widest">PREV</button>
                      <div className="text-slate-500 font-mono text-xs font-bold">{studyIndex + 1} / {personalities.length}</div>
                      <button disabled={studyIndex === personalities.length - 1} onClick={() => setStudyIndex(s => s + 1)} className="flex-1 bg-blue-600 p-5 rounded-2xl font-black disabled:opacity-20 transition-all uppercase text-xs tracking-widest">NEXT</button>
                   </div>
                </div>
             </div>
          </div>
        )}
        
        <footer className="mt-20 text-center opacity-30 text-[10px] font-black uppercase tracking-[0.3em]">
          Built with ❤️ for Enterprise Buildathons
        </footer>
      </div>
    </div>
  );
}

function ModeCard({ title, desc, icon: Icon, onClick }: { title: string, desc: string, icon: any, onClick: () => void }) {
  return (
    <button onClick={onClick} className="glass p-6 rounded-3xl text-left w-full hover:border-blue-500 hover:bg-blue-500/5 transition-all group">
      <div className="flex items-center gap-5">
        <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-black text-white text-lg group-hover:text-blue-400 transition-colors uppercase tracking-tight">{title}</h3>
          <p className="text-sm text-slate-500 font-medium">{desc}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-blue-500" />
      </div>
    </button>
  );
}