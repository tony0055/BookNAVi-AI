import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookRecommendation, SimilarBook, UserProfile } from '../types';
import { Book, Info, AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Bookmark, Library } from 'lucide-react';
import { findSimilarBooks } from '../services/geminiService';

interface Props {
  book: BookRecommendation;
  profile: UserProfile;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onAdjust: (bookId: string, reason: string) => Promise<void>;
}

export default function BookCard({ book, profile, isFavorited, onToggleFavorite, onAdjust }: Props) {
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustReason, setAdjustReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [similarBooks, setSimilarBooks] = useState<SimilarBook[] | null>(null);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  const handleAdjust = async () => {
    if (!adjustReason) return;
    setLoading(true);
    try {
      await onAdjust(book.id, adjustReason);
      setIsAdjusting(false);
      setAdjustReason('');
    } finally {
      setLoading(false);
    }
  };

  const getStageColor = (stage: string) => {
    if (stage.includes('선행')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (stage.includes('핵심')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const handleFindSimilar = async () => {
    if (similarBooks) {
      setSimilarBooks(null);
      return;
    }
    setLoadingSimilar(true);
    try {
      const books = await findSimilarBooks(book, profile);
      setSimilarBooks(books);
    } catch (err) {
      console.error(err);
      alert('비슷한 도서를 찾는 중 오류가 발생했습니다.');
    } finally {
      setLoadingSimilar(false);
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStageColor(book.stage)}`}>
            {book.stage}
          </span>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                {book.difficulty}
              </span>
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                {book.style}
              </span>
            </div>
            <button
              onClick={onToggleFavorite}
              className={`p-1.5 rounded-full transition-colors ${
                isFavorited 
                  ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
                  : 'text-slate-400 hover:bg-slate-100'
              }`}
              title={isFavorited ? "저장 취소" : "도서 저장"}
            >
              <Bookmark size={18} fill={isFavorited ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        <div className="flex gap-4 items-start mb-6">
          <div className="w-16 h-20 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200">
            <Book className="text-slate-400" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1">{book.title}</h3>
            <p className="text-sm text-slate-500 mb-2">{book.author}</p>
            <p className="text-slate-700 text-sm leading-relaxed">{book.description}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50">
            <h4 className="text-sm font-semibold text-indigo-900 flex items-center gap-2 mb-2">
              <Info size={16} className="text-indigo-500" />
              추천 이유
            </h4>
            <p className="text-sm text-indigo-800/80 leading-relaxed">
              {book.reason}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-slate-400" />
              선수 지식
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {book.prerequisites}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setIsAdjusting(!isAdjusting)}
              className="text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={14} />
              이 책이 맞지 않나요?
            </button>
            <button
              onClick={handleFindSimilar}
              className="text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
            >
              {loadingSimilar ? <RefreshCw size={14} className="animate-spin" /> : <Library size={14} />}
              {similarBooks ? '비슷한 도서 닫기' : '비슷한 도서 찾기'}
            </button>
          </div>

          <AnimatePresence>
            {isAdjusting && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-4"
              >
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <label className="block text-sm font-medium text-slate-700">
                    어떤 점이 아쉬운가요? (예: 너무 어렵다, 실무 위주면 좋겠다)
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                    value={adjustReason}
                    onChange={e => setAdjustReason(e.target.value)}
                    placeholder="대체 도서를 찾기 위한 이유를 적어주세요."
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsAdjusting(false)}
                      className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleAdjust}
                      disabled={loading || !adjustReason}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors"
                    >
                      {loading ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          찾는 중...
                        </>
                      ) : (
                        '다른 책 추천받기'
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {similarBooks && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-4"
              >
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Library size={16} className="text-indigo-500" />
                    추천하는 비슷한 도서
                  </h4>
                  <div className="space-y-3">
                    {similarBooks.map(simBook => (
                      <div key={simBook.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-bold text-slate-900 text-sm">{simBook.title}</h5>
                            <p className="text-xs text-slate-500">{simBook.author}</p>
                          </div>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                            {simBook.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 mb-2 line-clamp-2">{simBook.description}</p>
                        <div className="bg-indigo-50/50 p-2 rounded border border-indigo-100/50">
                          <p className="text-xs text-indigo-800/80 leading-relaxed">
                            <span className="font-semibold mr-1">추천 이유:</span>
                            {simBook.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
