import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SavedCurriculum } from '../types';
import { Brain, ArrowRight, BookOpen, Trash2, Clock } from 'lucide-react';

interface Props {
  onStartNew: (interest: string) => void;
  savedCurriculums: SavedCurriculum[];
  onOpenCurriculum: (id: string) => void;
  onDeleteCurriculum: (id: string) => void;
}

export default function HomeView({ onStartNew, savedCurriculums, onOpenCurriculum, onDeleteCurriculum }: Props) {
  const [interest, setInterest] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interest.trim()) return;
    onStartNew(interest.trim());
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 pt-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mb-6">
          <BookOpen size={32} />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">
          나만의 독서 커리큘럼 설계
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
          관심 분야와 목표를 알려주시면, 본질부터 응용까지 이어지는 맞춤형 도서를 추천해 드립니다.
        </p>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto relative">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-indigo-500">
              <Brain size={24} />
            </div>
            <input
              type="text"
              required
              placeholder="어떤 전공이나 학문 분야에 관심이 있으신가요? (예: 마케팅, AI)"
              className="w-full pl-12 pr-32 py-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all text-lg shadow-sm"
              value={interest}
              onChange={e => setInterest(e.target.value)}
            />
            <button
              type="submit"
              disabled={!interest.trim()}
              className="absolute right-2 top-2 bottom-2 px-6 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
            >
              시작하기
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </motion.div>

      {savedCurriculums.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-16"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="text-slate-400" size={20} />
              최근 설계한 커리큘럼
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedCurriculums.map((saved) => (
              <div 
                key={saved.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group cursor-pointer relative"
                onClick={() => onOpenCurriculum(saved.id)}
              >
                <div className="pr-8">
                  <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md mb-3">
                    {saved.profile.level}
                  </span>
                  <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-1">
                    {saved.profile.interest}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                    {saved.profile.goal}
                  </p>
                  <div className="text-xs text-slate-400">
                    {new Date(saved.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCurriculum(saved.id);
                  }}
                  className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="삭제"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
