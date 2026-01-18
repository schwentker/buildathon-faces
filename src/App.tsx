import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Users, Trophy, Clock, Play, ChevronRight, ChevronLeft,
  CheckCircle2, XCircle, RotateCcw, Linkedin,
  Sparkles, Target, Brain, Lock, Search, X, BookOpen, GraduationCap
} from 'lucide-react';
import { companyConfig } from './config/company';
import type { 
  TeamMember, GameMode, AppView, 
  Question, RoundData, GameState 
} from './types';
import { fetchTeamMembers, shuffleArray, getRandomOptions } from './lib/team-service';
import { getPhotoUrl, getPlaceholderUrl } from './lib/photo-utils';
import './index.css';

// ============ HOOKS ============

function useTeamData() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamMembers()
      .then(data => {
        setTeam(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { team, loading, error };
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      console.error('localStorage error:', err);
    }
  };

  return [storedValue, setValue] as const;
}

function useGameEngine(team: TeamMember[], totalRounds: number = 10) {
  const [state, setState] = useState<GameState>({
    mode: 'face-to-name',
    phase: 'idle',
    currentRound: 0,
    totalRounds,
    score: 0,
    rounds: [],
    currentQuestion: null,
  });
  
  // Track which members have been used as targets (no repeats)
  const usedMemberIds = useRef<Set<number>>(new Set());

  const generateQuestion = useCallback((members: TeamMember[], excludeIds: Set<number>): Question | null => {
    // Filter out already-used members
    const available = members.filter(m => !excludeIds.has(m.id));
    
    if (available.length === 0) {
      return null;
    }
    
    const shuffled = shuffleArray(available);
    const target = shuffled[0];
    const options = getRandomOptions(members, target, 4);
    
    return {
      target,
      options,
      startTime: Date.now(),
    };
  }, []);

  const startGame = useCallback((mode: GameMode) => {
    if (team.length < 4) return;
    
    // Reset used members
    usedMemberIds.current = new Set();
    
    const question = generateQuestion(team, usedMemberIds.current);
    if (!question) return;
    
    // Mark this member as used
    usedMemberIds.current.add(question.target.id);
    
    setState({
      mode,
      phase: 'question',
      currentRound: 1,
      totalRounds: Math.min(totalRounds, team.length), // Can't ask more than we have people
      score: 0,
      rounds: [],
      currentQuestion: question,
    });
  }, [team, totalRounds, generateQuestion]);

  const selectAnswer = useCallback((selectedId: number) => {
    if (!state.currentQuestion || state.phase !== 'question') return;
    
    const correct = selectedId === state.currentQuestion.target.id;
    const timeMs = Date.now() - state.currentQuestion.startTime;
    
    const roundData: RoundData = {
      question: state.currentQuestion,
      selectedId,
      correct,
      timeMs,
    };

    setState(prev => ({
      ...prev,
      phase: 'feedback',
      score: correct ? prev.score + 1 : prev.score,
      rounds: [...prev.rounds, roundData],
    }));
  }, [state.currentQuestion, state.phase]);

  const nextQuestion = useCallback(() => {
    if (state.currentRound >= state.totalRounds) {
      setState(prev => ({ ...prev, phase: 'results' }));
      return;
    }

    const question = generateQuestion(team, usedMemberIds.current);
    if (!question) {
      // No more available members
      setState(prev => ({ ...prev, phase: 'results' }));
      return;
    }
    
    // Mark this member as used
    usedMemberIds.current.add(question.target.id);
    
    setState(prev => ({
      ...prev,
      phase: 'question',
      currentRound: prev.currentRound + 1,
      currentQuestion: question,
    }));
  }, [state.currentRound, state.totalRounds, team, generateQuestion]);

  const resetGame = useCallback(() => {
    usedMemberIds.current = new Set();
    setState({
      mode: 'face-to-name',
      phase: 'idle',
      currentRound: 0,
      totalRounds,
      score: 0,
      rounds: [],
      currentQuestion: null,
    });
  }, [totalRounds]);

  return { state, startGame, selectAnswer, nextQuestion, resetGame };
}

// ============ COMPONENTS ============

function PhotoAvatar({ 
  member, 
  size = 'md',
  showBorder = true 
}: { 
  member: TeamMember; 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBorder?: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const photoUrl = getPhotoUrl(member.full_name);
  const fallbackUrl = getPlaceholderUrl(member.full_name);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  return (
    <div className={`${sizeClasses[size]} ${showBorder ? 'photo-frame' : ''} rounded-full overflow-hidden flex-shrink-0 bg-slate-700`}>
      {!imgLoaded && (
        <div className="w-full h-full flex items-center justify-center text-slate-500">
          <Users className="w-1/3 h-1/3" />
        </div>
      )}
      <img
        src={imgError ? fallbackUrl : photoUrl}
        alt={member.full_name}
        className={`w-full h-full object-cover ${imgLoaded ? 'block' : 'hidden'}`}
        onLoad={() => setImgLoaded(true)}
        onError={() => {
          setImgError(true);
          setImgLoaded(true);
        }}
      />
    </div>
  );
}

function PersonDetails({ member }: { member: TeamMember }) {
  return (
    <div className="glass rounded-xl p-4 mt-4 animate-slide-up">
      <div className="flex items-start gap-4">
        <PhotoAvatar member={member} size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-xl font-bold">{member.full_name}</h3>
          <p className="text-moraware-blue font-medium">{member.title || 'Team Member'}</p>
          {member.education && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
              <GraduationCap className="w-4 h-4" />
              <span>{member.education}</span>
            </div>
          )}
          {member.bio && (
            <p className="text-sm text-gray-400 mt-2">{member.bio}</p>
          )}
          {member.linkedin_url && (
            <a
              href={member.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-sm text-[#0A66C2] hover:underline"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function OptionButton({ 
  member, 
  mode,
  isSelected, 
  isCorrect, 
  showResult,
  onClick,
  disabled,
}: { 
  member: TeamMember;
  mode: GameMode;
  isSelected: boolean;
  isCorrect: boolean;
  showResult: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  let className = 'option-btn w-full p-4 rounded-xl text-left flex items-center gap-4';
  
  if (showResult) {
    if (isCorrect) {
      className += ' correct';
    } else if (isSelected && !isCorrect) {
      className += ' incorrect';
    } else if (!isSelected && isCorrect) {
      className += ' reveal-correct';
    }
  }

  const displayContent = () => {
    switch (mode) {
      case 'face-to-name':
        return (
          <span className="font-medium text-lg">{member.full_name}</span>
        );
      case 'title-to-face':
        return (
          <>
            <PhotoAvatar member={member} size="sm" showBorder={false} />
            <span className="font-medium">{member.full_name}</span>
          </>
        );
      case 'face-to-title':
        return (
          <span className="font-medium">{member.title || 'Team Member'}</span>
        );
      default:
        return member.full_name;
    }
  };

  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {displayContent()}
      {showResult && isCorrect && (
        <CheckCircle2 className="ml-auto text-green-400 w-6 h-6" />
      )}
      {showResult && isSelected && !isCorrect && (
        <XCircle className="ml-auto text-red-400 w-6 h-6" />
      )}
    </button>
  );
}

function ProgressBar({ current, total, score }: { current: number; total: number; score: number }) {
  const percentage = (current / total) * 100;

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Question {current} of {total}</span>
          <span className="text-moraware-blue font-semibold">{score} correct</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="progress-fill h-full rounded-full" style={{ width: `${percentage}%` }} />
        </div>
      </div>
    </div>
  );
}

function ModeCard({ 
  title, 
  description, 
  icon: Icon, 
  onClick, 
  disabled = false 
}: { 
  title: string; 
  description: string; 
  icon: typeof Users;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className={`mode-card glass p-6 rounded-2xl text-left w-full ${disabled ? 'coming-soon' : 'cursor-pointer'}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-moraware-blue/20">
          <Icon className="w-6 h-6 text-moraware-blue" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg mb-1">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
        {!disabled && (
          <ChevronRight className="ml-auto w-5 h-5 text-gray-500 mt-1" />
        )}
        {disabled && (
          <Lock className="ml-auto w-5 h-5 text-gray-600 mt-1" />
        )}
      </div>
    </button>
  );
}

function TeamCard({ member, onClick }: { member: TeamMember; onClick: () => void }) {
  return (
    <button
      className="team-card glass p-4 rounded-xl text-left w-full"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <PhotoAvatar member={member} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold truncate">{member.full_name}</h3>
          <p className="text-sm text-gray-400 truncate">{member.title || 'Team Member'}</p>
        </div>
      </div>
    </button>
  );
}

function TeamModal({ 
  member, 
  onClose 
}: { 
  member: TeamMember | null; 
  onClose: () => void;
}) {
  if (!member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="glass rounded-3xl p-8 max-w-md w-full animate-scale-in relative" onClick={e => e.stopPropagation()}>
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col items-center text-center">
          <PhotoAvatar member={member} size="xl" />
          <h2 className="font-display text-2xl font-bold mt-6">{member.full_name}</h2>
          <p className="text-moraware-blue font-medium mt-1">{member.title || 'Team Member'}</p>
          
          {member.education && (
            <div className="flex items-center gap-2 mt-3 text-gray-400">
              <GraduationCap className="w-4 h-4" />
              <span>{member.education}</span>
            </div>
          )}
          
          {member.bio && (
            <p className="text-gray-400 mt-3">{member.bio}</p>
          )}
          
          {member.linkedin_url && (
            <a
              href={member.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center gap-2 px-4 py-2 bg-[#0A66C2] rounded-lg hover:bg-[#004182] transition-colors"
            >
              <Linkedin className="w-5 h-5" />
              View LinkedIn
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ VIEWS ============

function HomeView({ 
  onStartGame, 
  onBrowseTeam,
  onStudyMode,
  highScore,
}: { 
  onStartGame: (mode: GameMode) => void;
  onBrowseTeam: () => void;
  onStudyMode: () => void;
  highScore: number;
}) {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-moraware-blue/20 text-moraware-blue text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Team Recognition Game
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
          {companyConfig.name}
        </h1>
        <p className="text-gray-400 text-lg">{companyConfig.tagline}</p>
        
        {highScore > 0 && (
          <div className="mt-6 inline-flex items-center gap-2 text-moraware-orange">
            <Trophy className="w-5 h-5" />
            <span className="font-medium">Best Score: {highScore}/10</span>
          </div>
        )}
      </div>

      {/* Game Modes */}
      <div className="space-y-4 max-w-lg mx-auto mb-8">
        <h2 className="font-display text-lg font-semibold text-gray-300 mb-4">Quiz Modes</h2>
        
        <ModeCard
          title="Face → Name"
          description="See a photo, guess the name"
          icon={Users}
          onClick={() => onStartGame('face-to-name')}
        />
        
        <ModeCard
          title="Title → Face"
          description="See a job title, find the person"
          icon={Target}
          onClick={() => onStartGame('title-to-face')}
        />
        
        <ModeCard
          title="Face → Title"
          description="See a photo, guess their role"
          icon={Brain}
          onClick={() => onStartGame('face-to-title')}
        />

        <div className="pt-4 border-t border-white/10">
          <h2 className="font-display text-lg font-semibold text-gray-300 mb-4">Learn</h2>
          
          <ModeCard
            title="Study Mode"
            description="Flip through cards to learn everyone"
            icon={BookOpen}
            onClick={onStudyMode}
          />
        </div>

        <div className="pt-4 border-t border-white/10">
          <ModeCard
            title="Timed Mode"
            description="60 seconds to answer as many as you can"
            icon={Clock}
            disabled
          />
          
          <div className="mt-4">
            <ModeCard
              title="Spaced Repetition"
              description="Focus on people you get wrong"
              icon={RotateCcw}
              disabled
            />
          </div>
        </div>
      </div>

      {/* Browse Team Button */}
      <div className="text-center">
        <button
          onClick={onBrowseTeam}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-gray-300"
        >
          <Search className="w-5 h-5" />
          Browse Team Members
        </button>
      </div>
    </div>
  );
}

function StudyView({
  team,
  onBack,
}: {
  team: TeamMember[];
  onBack: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const shuffledTeam = useRef(shuffleArray(team));
  
  const currentMember = shuffledTeam.current[currentIndex];
  
  const goNext = () => {
    setShowDetails(false);
    setCurrentIndex(prev => (prev + 1) % shuffledTeam.current.length);
  };
  
  const goPrev = () => {
    setShowDetails(false);
    setCurrentIndex(prev => (prev - 1 + shuffledTeam.current.length) % shuffledTeam.current.length);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      if (showDetails) {
        goNext();
      } else {
        setShowDetails(true);
      }
    } else if (e.key === 'ArrowLeft') {
      goPrev();
    }
  }, [showDetails]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="font-display text-xl font-bold">Study Mode</h1>
        <div className="text-sm text-gray-400">
          {currentIndex + 1} / {shuffledTeam.current.length}
        </div>
      </div>

      {/* Flashcard */}
      <div className="glass rounded-2xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <PhotoAvatar member={currentMember} size="xl" />
        </div>
        
        {!showDetails ? (
          <div>
            <p className="text-gray-400 mb-4">Who is this?</p>
            <button
              onClick={() => setShowDetails(true)}
              className="px-6 py-3 rounded-xl bg-moraware-blue hover:bg-moraware-blue/80 transition-colors font-semibold"
            >
              Reveal Answer
            </button>
          </div>
        ) : (
          <div className="animate-slide-up">
            <h2 className="font-display text-2xl font-bold mb-2">{currentMember.full_name}</h2>
            <p className="text-moraware-blue font-medium">{currentMember.title || 'Team Member'}</p>
            
            {currentMember.education && (
              <div className="flex items-center justify-center gap-2 mt-3 text-gray-400">
                <GraduationCap className="w-4 h-4" />
                <span>{currentMember.education}</span>
              </div>
            )}
            
            {currentMember.bio && (
              <p className="text-gray-400 mt-3">{currentMember.bio}</p>
            )}
            
            {currentMember.linkedin_url && (
              <a
                href={currentMember.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-[#0A66C2] hover:underline"
              >
                <Linkedin className="w-4 h-4" />
                View LinkedIn
              </a>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={goPrev}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>
        <button
          onClick={goNext}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      <p className="text-center text-gray-500 text-sm mt-4">
        Use arrow keys or spacebar to navigate
      </p>
    </div>
  );
}

function PlayView({ 
  gameState,
  onSelectAnswer,
  onNextQuestion,
}: { 
  gameState: GameState;
  onSelectAnswer: (id: number) => void;
  onNextQuestion: () => void;
}) {
  const { currentQuestion, phase, currentRound, totalRounds, score, mode, rounds } = gameState;
  
  if (!currentQuestion) return null;

  const lastRound = rounds[rounds.length - 1];
  const showResult = phase === 'feedback';

  const getQuestionPrompt = () => {
    switch (mode) {
      case 'face-to-name':
        return 'Who is this person?';
      case 'title-to-face':
        return `Who is the ${currentQuestion.target.title}?`;
      case 'face-to-title':
        return 'What is their role?';
      default:
        return 'Who is this?';
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <ProgressBar current={currentRound} total={totalRounds} score={score} />
      
      {/* Question Display */}
      <div className="text-center mb-8">
        {(mode === 'face-to-name' || mode === 'face-to-title') && (
          <div className="flex justify-center mb-6">
            <PhotoAvatar member={currentQuestion.target} size="xl" />
          </div>
        )}
        
        <h2 className="font-display text-2xl font-semibold text-gray-200">
          {getQuestionPrompt()}
        </h2>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {currentQuestion.options.map(option => (
          <OptionButton
            key={option.id}
            member={option}
            mode={mode}
            isSelected={lastRound?.selectedId === option.id}
            isCorrect={option.id === currentQuestion.target.id}
            showResult={showResult}
            onClick={() => onSelectAnswer(option.id)}
            disabled={showResult}
          />
        ))}
      </div>

      {/* Feedback with Person Details */}
      {showResult && (
        <div className="animate-slide-up">
          {lastRound?.correct ? (
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                Correct!
              </div>
            </div>
          ) : (
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 text-red-400">
                <XCircle className="w-5 h-5" />
                Incorrect
              </div>
            </div>
          )}
          
          {/* Show person details after answer */}
          <PersonDetails member={currentQuestion.target} />
          
          <div className="text-center mt-6">
            <button
              onClick={onNextQuestion}
              className="px-8 py-3 rounded-xl bg-moraware-blue hover:bg-moraware-blue/80 transition-colors font-semibold flex items-center gap-2 mx-auto"
            >
              {currentRound >= totalRounds ? 'See Results' : 'Next Question'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultsView({ 
  gameState,
  onPlayAgain,
  onBrowseTeam,
  onHome,
}: { 
  gameState: GameState;
  onPlayAgain: () => void;
  onBrowseTeam: () => void;
  onHome: () => void;
}) {
  const { score, totalRounds, rounds } = gameState;
  const percentage = Math.round((score / totalRounds) * 100);
  const mistakes = rounds.filter(r => !r.correct);
  const avgTime = Math.round(rounds.reduce((sum, r) => sum + r.timeMs, 0) / rounds.length / 1000 * 10) / 10;

  const getMessage = () => {
    if (percentage === 100) return "Perfect! You know everyone! 🎉";
    if (percentage >= 80) return "Great job! Almost there!";
    if (percentage >= 60) return "Good progress! Keep practicing!";
    if (percentage >= 40) return "Getting there! Try again?";
    return "Keep learning! You got this!";
  };

  return (
    <div className="max-w-lg mx-auto text-center animate-fade-in">
      {/* Score */}
      <div className="mb-8">
        <div className="score-badge inline-flex items-center justify-center w-32 h-32 rounded-full mb-6">
          <div>
            <div className="text-4xl font-display font-bold">{score}</div>
            <div className="text-sm opacity-80">of {totalRounds}</div>
          </div>
        </div>
        
        <h2 className="font-display text-3xl font-bold mb-2">{getMessage()}</h2>
        <p className="text-gray-400">Average response time: {avgTime}s</p>
      </div>

      {/* Mistakes Review */}
      {mistakes.length > 0 && (
        <div className="glass rounded-2xl p-6 mb-8 text-left">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-400" />
            Review Mistakes ({mistakes.length})
          </h3>
          <div className="space-y-3">
            {mistakes.map((round, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <PhotoAvatar member={round.question.target} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{round.question.target.full_name}</div>
                  <div className="text-sm text-gray-400 truncate">{round.question.target.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onPlayAgain}
          className="px-6 py-3 rounded-xl bg-moraware-blue hover:bg-moraware-blue/80 transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          Play Again
        </button>
        <button
          onClick={onBrowseTeam}
          className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <Users className="w-5 h-5" />
          Browse Team
        </button>
        <button
          onClick={onHome}
          className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-gray-400 flex items-center justify-center gap-2"
        >
          Home
        </button>
      </div>

      {/* Save Progress Placeholder */}
      <div className="mt-8 p-4 rounded-xl border border-dashed border-gray-700 text-gray-500">
        <Lock className="w-5 h-5 mx-auto mb-2" />
        <p className="text-sm">Sign in to save your progress and compete on the leaderboard</p>
        <button className="mt-2 text-moraware-blue text-sm hover:underline" disabled>
          Coming Soon
        </button>
      </div>
    </div>
  );
}

function TeamView({ 
  team, 
  onBack,
}: { 
  team: TeamMember[];
  onBack: () => void;
}) {
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const filtered = team.filter(m => 
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (m.title?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="font-display text-2xl font-bold">Team Directory</h1>
        <div className="w-20" />
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search by name or title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-moraware-blue focus:outline-none transition-colors"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(member => (
          <TeamCard 
            key={member.id} 
            member={member}
            onClick={() => setSelectedMember(member)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No team members found matching "{search}"
        </div>
      )}

      {/* Modal */}
      <TeamModal 
        member={selectedMember} 
        onClose={() => setSelectedMember(null)} 
      />
    </div>
  );
}

// ============ MAIN APP ============

export default function App() {
  const { team, loading, error } = useTeamData();
  const [view, setView] = useState<AppView | 'study'>('home');
  const [highScore, setHighScore] = useLocalStorage('moraware-high-score', 0);
  
  const { state: gameState, startGame, selectAnswer, nextQuestion, resetGame } = useGameEngine(
    team,
    companyConfig.game.defaultRounds
  );

  // Update high score when game ends
  useEffect(() => {
    if (gameState.phase === 'results' && gameState.score > highScore) {
      setHighScore(gameState.score);
    }
  }, [gameState.phase, gameState.score, highScore, setHighScore]);

  // Sync view with game phase
  useEffect(() => {
    if (gameState.phase === 'question' || gameState.phase === 'feedback') {
      setView('play');
    } else if (gameState.phase === 'results') {
      setView('results');
    }
  }, [gameState.phase]);

  const handleStartGame = (mode: GameMode) => {
    startGame(mode);
  };

  const handleHome = () => {
    resetGame();
    setView('home');
  };

  const handlePlayAgain = () => {
    startGame(gameState.mode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-moraware-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading team data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="text-center glass p-8 rounded-2xl max-w-md">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">Failed to Load Team</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-lg bg-moraware-blue hover:bg-moraware-blue/80 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {view === 'home' && (
          <HomeView
            onStartGame={handleStartGame}
            onBrowseTeam={() => setView('team')}
            onStudyMode={() => setView('study')}
            highScore={highScore}
          />
        )}
        
        {view === 'study' && (
          <StudyView
            team={team}
            onBack={handleHome}
          />
        )}
        
        {view === 'play' && (
          <PlayView
            gameState={gameState}
            onSelectAnswer={selectAnswer}
            onNextQuestion={nextQuestion}
          />
        )}
        
        {view === 'results' && (
          <ResultsView
            gameState={gameState}
            onPlayAgain={handlePlayAgain}
            onBrowseTeam={() => setView('team')}
            onHome={handleHome}
          />
        )}
        
        {view === 'team' && (
          <TeamView
            team={team}
            onBack={handleHome}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-sm text-gray-600">
        Built with ❤️ for {companyConfig.name}
      </footer>
    </div>
  );
}
