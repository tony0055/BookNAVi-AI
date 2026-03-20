export interface UserProfile {
  interest: string;
  level: string;
  goal: string;
  currentBook?: string;
}

export interface BookRecommendation {
  id: string;
  stage: '선행 지식 (본질 학문)' | '현재 목표 (핵심 도서)' | '심화 및 활용 (응용 학문)';
  title: string;
  author: string;
  difficulty: '입문' | '초급' | '중급' | '고급';
  style: string; // e.g., '이론 중심', '실무 중심', '사례 위주'
  reason: string;
  prerequisites: string;
  description: string;
}

export interface SimilarBook {
  id: string;
  title: string;
  author: string;
  difficulty: '입문' | '초급' | '중급' | '고급';
  reason: string;
  description: string;
}

export interface Curriculum {
  books: BookRecommendation[];
  overallAdvice: string;
}

export interface SavedCurriculum {
  id: string;
  profile: UserProfile;
  curriculum: Curriculum;
  createdAt: number;
}
