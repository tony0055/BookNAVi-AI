import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import HomeView from './components/HomeView';
import DetailsForm from './components/DetailsForm';
import CurriculumView from './components/CurriculumView';
import { UserProfile, Curriculum, BookRecommendation, SavedCurriculum } from './types';
import { generateCurriculum, adjustRecommendation } from './services/geminiService';
import { Loader2, Bookmark, X } from 'lucide-react';

type ViewState = 'home' | 'details' | 'curriculum';

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  const [draftInterest, setDraftInterest] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [activeCurriculumId, setActiveCurriculumId] = useState<string | null>(null);
  
  const [savedCurriculums, setSavedCurriculums] = useState<SavedCurriculum[]>(() => {
    const saved = localStorage.getItem('booknavi-curriculums');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<BookRecommendation[]>(() => {
    const saved = localStorage.getItem('booknavi-favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    localStorage.setItem('booknavi-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('booknavi-curriculums', JSON.stringify(savedCurriculums));
  }, [savedCurriculums]);

  const handleToggleFavorite = (book: BookRecommendation) => {
    setFavorites(prev => {
      const exists = prev.some(b => b.id === book.id);
      if (exists) return prev.filter(b => b.id !== book.id);
      return [...prev, book];
    });
  };

  const handleStartNew = (interest: string) => {
    setDraftInterest(interest);
    setView('details');
  };

  const handleProfileSubmit = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    setLoading(true);
    setError(null);
    try {
      const result = await generateCurriculum(newProfile);
      setCurriculum(result);
      
      const newSaved: SavedCurriculum = {
        id: crypto.randomUUID(),
        profile: newProfile,
        curriculum: result,
        createdAt: Date.now()
      };
      setSavedCurriculums(prev => [newSaved, ...prev]);
      setActiveCurriculumId(newSaved.id);
      setView('curriculum');
    } catch (err: any) {
      console.error("Curriculum generation error:", err);
      setError(`커리큘럼을 생성하는 중 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCurriculum = (id: string) => {
    const saved = savedCurriculums.find(c => c.id === id);
    if (saved) {
      setProfile(saved.profile);
      setCurriculum(saved.curriculum);
      setActiveCurriculumId(saved.id);
      setView('curriculum');
    }
  };

  const handleDeleteCurriculum = (id: string) => {
    if (window.confirm('이 커리큘럼을 삭제하시겠습니까?')) {
      setSavedCurriculums(prev => prev.filter(c => c.id !== id));
      if (activeCurriculumId === id) {
        handleReset();
      }
    }
  };

  const handleAdjustBook = async (bookId: string, reason: string) => {
    if (!profile || !curriculum) return;
    
    const bookToAdjust = curriculum.books.find(b => b.id === bookId);
    if (!bookToAdjust) return;

    try {
      const newBook = await adjustRecommendation(bookId, bookToAdjust.title, reason, profile);
      
      setCurriculum(prev => {
        if (!prev) return prev;
        const updatedCurriculum = {
          ...prev,
          books: prev.books.map(b => b.id === bookId ? newBook : b)
        };
        
        // Update saved curriculum as well
        if (activeCurriculumId) {
          setSavedCurriculums(saved => saved.map(c => 
            c.id === activeCurriculumId 
              ? { ...c, curriculum: updatedCurriculum }
              : c
          ));
        }
        
        return updatedCurriculum;
      });
    } catch (err) {
      console.error(err);
      alert('대체 도서를 찾는 중 오류가 발생했습니다.');
    }
  };

  const handleReset = () => {
    setProfile(null);
    setCurriculum(null);
    setError(null);
    setDraftInterest('');
    setActiveCurriculumId(null);
    setView('home');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg leading-none">B</span>
            </div>
            <span className="font-semibold text-xl tracking-tight text-slate-900">BookNavi AI</span>
          </div>
          <button
            onClick={() => setShowFavorites(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Bookmark size={18} className={favorites.length > 0 ? "fill-indigo-500 text-indigo-500" : ""} />
            <span className="hidden sm:inline">저장된 도서</span>
            {favorites.length > 0 && (
              <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">
                {favorites.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
            >
              <Loader2 className="animate-spin text-indigo-600" size={48} />
              <p className="text-lg font-medium text-slate-600">
                {profile?.interest} 분야의 맞춤형 커리큘럼을 설계하고 있습니다...
              </p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto text-center py-12"
            >
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100">
                {error}
              </div>
              <button
                onClick={() => setView('home')}
                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                홈으로 돌아가기
              </button>
            </motion.div>
          ) : view === 'home' ? (
            <motion.div key="home" exit={{ opacity: 0, y: -20 }}>
              <HomeView 
                onStartNew={handleStartNew}
                savedCurriculums={savedCurriculums}
                onOpenCurriculum={handleOpenCurriculum}
                onDeleteCurriculum={handleDeleteCurriculum}
              />
            </motion.div>
          ) : view === 'details' ? (
            <motion.div key="details" exit={{ opacity: 0, y: -20 }}>
              <DetailsForm 
                interest={draftInterest}
                onSubmit={handleProfileSubmit}
                onBack={() => setView('home')}
              />
            </motion.div>
          ) : (
            <motion.div key="curriculum" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CurriculumView
                curriculum={curriculum!}
                profile={profile!}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onAdjustBook={handleAdjustBook}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showFavorites && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFavorites(false)}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Bookmark className="text-indigo-500" size={20} />
                  저장된 도서
                </h2>
                <button
                  onClick={() => setShowFavorites(false)}
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {favorites.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Bookmark size={48} className="mx-auto mb-4 text-slate-300" />
                    <p>저장된 도서가 없습니다.</p>
                  </div>
                ) : (
                  favorites.map(book => (
                    <div key={book.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                      <button
                        onClick={() => handleToggleFavorite(book)}
                        className="absolute top-4 right-4 text-indigo-500 hover:text-indigo-600"
                      >
                        <Bookmark size={20} fill="currentColor" />
                      </button>
                      <div className="pr-8">
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md mb-2 inline-block">
                          {book.stage}
                        </span>
                        <h3 className="font-bold text-slate-900 leading-tight mb-1">{book.title}</h3>
                        <p className="text-sm text-slate-500 mb-2">{book.author}</p>
                        <p className="text-sm text-slate-700 line-clamp-2">{book.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
