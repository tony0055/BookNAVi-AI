import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Curriculum, UserProfile, BookRecommendation } from '../types';
import BookCard from './BookCard';
import { ArrowDown, Sparkles, RefreshCcw, Filter } from 'lucide-react';

interface Props {
  curriculum: Curriculum;
  profile: UserProfile;
  favorites: BookRecommendation[];
  onToggleFavorite: (book: BookRecommendation) => void;
  onAdjustBook: (bookId: string, reason: string) => Promise<void>;
  onReset: () => void;
}

export default function CurriculumView({ curriculum, profile, favorites, onToggleFavorite, onAdjustBook, onReset }: Props) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('전체');

  const difficulties = ['전체', '입문', '초급', '중급', '고급'];

  const filteredBooks = selectedDifficulty === '전체' 
    ? curriculum.books 
    : curriculum.books.filter(book => book.difficulty === selectedDifficulty);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mb-6 shadow-sm border border-indigo-100">
          <Sparkles size={32} />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">
          맞춤형 독서 커리큘럼
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {profile.interest} 분야의 {profile.level} 수준에 맞춘 3단계 독서 경로입니다.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-indigo-50/50 rounded-2xl p-6 mb-8 border border-indigo-100/50"
      >
        <h3 className="text-sm font-semibold text-indigo-900 uppercase tracking-wider mb-2">
          AI 학습 조언
        </h3>
        <p className="text-indigo-800/80 leading-relaxed text-lg">
          {curriculum.overallAdvice}
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"
      >
        <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
          <Filter size={18} className="text-indigo-500" />
          난이도 필터
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {difficulties.map(diff => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedDifficulty === diff
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="space-y-8 relative">
        <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-slate-200 hidden md:block" />
        
        <AnimatePresence mode="popLayout">
          {filteredBooks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, py: 20 }}
              animate={{ opacity: 1, py: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed"
            >
              <p className="text-slate-500 font-medium">해당 난이도의 추천 도서가 없습니다.</p>
            </motion.div>
          ) : (
            filteredBooks.map((book, index) => {
              const originalIndex = curriculum.books.findIndex(b => b.id === book.id);
              
              return (
                <motion.div
                  layout
                  key={book.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative flex flex-col md:flex-row gap-6 md:gap-8 items-start"
                >
                  <div className="hidden md:flex flex-col items-center mt-6 z-10">
                    <div className="w-16 h-16 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center shadow-sm">
                      <span className="text-xl font-bold text-slate-400">{originalIndex + 1}</span>
                    </div>
                    {index < filteredBooks.length - 1 && (
                      <ArrowDown className="text-slate-300 mt-4" size={24} />
                    )}
                  </div>
                  
                  <div className="flex-1 w-full">
                    <BookCard 
                      book={book} 
                      profile={profile}
                      isFavorited={favorites.some(f => f.id === book.id)}
                      onToggleFavorite={() => onToggleFavorite(book)}
                      onAdjust={onAdjustBook} 
                    />
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-16 text-center"
      >
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
        >
          <RefreshCcw size={18} />
          새로운 커리큘럼 설계하기
        </button>
      </motion.div>
    </div>
  );
}
