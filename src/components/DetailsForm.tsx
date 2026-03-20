import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { Target, ArrowRight, ArrowLeft, BookOpen } from 'lucide-react';

interface Props {
  interest: string;
  onSubmit: (profile: UserProfile) => void;
  onBack: () => void;
}

export default function DetailsForm({ interest, onSubmit, onBack }: Props) {
  const [profile, setProfile] = useState<UserProfile>({
    interest,
    level: '입문',
    goal: '',
    currentBook: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.goal) return;
    onSubmit(profile);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-100"
    >
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            상세 정보 입력
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            <span className="font-semibold text-indigo-600">{interest}</span> 분야에 대한 맞춤형 커리큘럼을 위해 조금 더 알려주세요.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            해당 분야에 대한 현재 지식 수준은 어느 정도인가요?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['입문', '초급', '중급', '고급'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setProfile({ ...profile, level })}
                className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  profile.level === level
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
            <Target size={18} className="text-indigo-500" />
            이 분야를 공부해서 궁극적으로 어떻게 활용하고 싶으신가요?
          </label>
          <textarea
            required
            rows={3}
            placeholder="예: 마케팅 실무에 심리학적 원리를 적용하고 싶어요. / AI 서비스 기획을 위해 기초 개념을 잡고 싶어요."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
            value={profile.goal}
            onChange={e => setProfile({ ...profile, goal: e.target.value })}
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-500" />
            (선택) 현재 읽고 있거나 관심 있는 책이 있다면 적어주세요.
          </label>
          <input
            type="text"
            placeholder="예: 뇌과학 마케팅, 생각에 관한 생각"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            value={profile.currentBook}
            onChange={e => setProfile({ ...profile, currentBook: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={!profile.goal.trim()}
          className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
        >
          맞춤형 커리큘럼 생성하기
          <ArrowRight size={20} />
        </button>
      </form>
    </motion.div>
  );
}
