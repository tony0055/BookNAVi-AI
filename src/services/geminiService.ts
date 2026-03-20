import { GoogleGenAI, Type } from '@google/genai';
import { Curriculum, UserProfile, SimilarBook, BookRecommendation } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateCurriculum(profile: UserProfile): Promise<Curriculum> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in the environment.");
  }
  
  const prompt = `
당신은 사용자의 수준과 목표에 맞춰 책을 추천하고, 읽기 전/도중/이후의 시행착오를 줄여주는 AI 기반 독서 커리큘럼 설계자입니다.
사용자의 프로필을 바탕으로 '본질 학문 -> 핵심 도서 -> 응용 학문' 순서의 3단계 독서 커리큘럼을 제안해주세요.

[사용자 프로필]
- 관심 분야: ${profile.interest}
- 현재 지식 수준: ${profile.level}
- 학습 목표 및 활용 방식: ${profile.goal}
${profile.currentBook ? `- 현재 읽고 있거나 관심 있는 책: ${profile.currentBook}` : ''}

[요구사항]
1. 3권의 책을 추천해야 합니다.
   - 첫 번째 책: '선행 지식 (본질 학문)' 단계. 핵심 도서를 이해하기 위해 필요한 기초 지식 (예: 심리학, 수학, 철학 등).
   - 두 번째 책: '현재 목표 (핵심 도서)' 단계. 사용자의 관심 분야와 수준에 가장 잘 맞는 메인 도서.
   - 세 번째 책: '심화 및 활용 (응용 학문)' 단계. 핵심 도서를 읽은 후 실무나 더 깊은 이해를 위해 읽을 책.
2. 각 책에 대해 난이도, 설명 스타일(이론 중심, 실무 중심, 사례 위주 등), 추천 이유, 필요한 선수 지식을 명확히 작성하세요.
   - 추천 이유(reason)는 사용자의 현재 지식 수준(${profile.level})과 학습 목표(${profile.goal})에 이 책이 어떻게 부합하는지 매우 구체적이고 설득력 있게 작성하세요.
   *중요*: 난이도 필터가 의미 있게 작동하도록, 사용자의 현재 지식 수준(${profile.level})을 기준으로 세 권의 책 난이도(입문, 초급, 중급, 고급)를 점진적으로 다르게 배정하세요. (예: 사용자가 '초급'이라면 선행 지식은 '입문', 핵심 도서는 '초급', 심화 도서는 '중급'으로 배정)
3. 전체적인 학습 조언(overallAdvice)을 3~4문장으로 제공하세요.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallAdvice: { type: Type.STRING, description: '전체적인 학습 조언' },
          books: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: '고유 ID (임의 생성)' },
                stage: { 
                  type: Type.STRING, 
                  description: "단계. '선행 지식 (본질 학문)', '현재 목표 (핵심 도서)', '심화 및 활용 (응용 학문)' 중 하나"
                },
                title: { type: Type.STRING, description: '책 제목' },
                author: { type: Type.STRING, description: '저자' },
                difficulty: { 
                  type: Type.STRING, 
                  description: "난이도. '입문', '초급', '중급', '고급' 중 하나"
                },
                style: { type: Type.STRING, description: '설명 스타일 (예: 이론 중심, 실무 중심)' },
                reason: { type: Type.STRING, description: '이 책을 추천하는 구체적인 이유' },
                prerequisites: { type: Type.STRING, description: '이 책을 읽기 위해 필요한 선수 지식' },
                description: { type: Type.STRING, description: '책에 대한 간단한 한 줄 설명' }
              },
              required: ['id', 'stage', 'title', 'author', 'difficulty', 'style', 'reason', 'prerequisites', 'description']
            }
          }
        },
        required: ['overallAdvice', 'books']
      }
    }
  });

  const text = response.text;
  if (!text) {
    console.error("Gemini response has no text. Full response:", JSON.stringify(response, null, 2));
    throw new Error('Failed to generate curriculum (Empty response or blocked)');
  }
  
  try {
    return JSON.parse(text) as Curriculum;
  } catch (e) {
    console.error("Failed to parse JSON:", text);
    throw new Error('Failed to parse curriculum data');
  }
}

export async function adjustRecommendation(
  bookId: string, 
  currentBookTitle: string, 
  reason: string, 
  profile: UserProfile
): Promise<Curriculum['books'][0]> {
  const prompt = `
사용자가 추천받은 책 '${currentBookTitle}'이(가) 자신에게 맞지 않는다고 피드백을 주었습니다.
피드백을 반영하여 같은 단계에 맞는 다른 대체 도서를 1권 추천해주세요.

[사용자 프로필]
- 관심 분야: ${profile.interest}
- 현재 지식 수준: ${profile.level}
- 학습 목표 및 활용 방식: ${profile.goal}

[피드백 내용]
- 맞지 않는 이유: ${reason}

[요구사항]
피드백을 반영하여 난이도를 조절하거나 설명 방식을 바꾼 새로운 책을 추천하세요.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: '고유 ID (임의 생성)' },
          stage: { 
            type: Type.STRING, 
            description: "단계. '선행 지식 (본질 학문)', '현재 목표 (핵심 도서)', '심화 및 활용 (응용 학문)' 중 하나"
          },
          title: { type: Type.STRING, description: '책 제목' },
          author: { type: Type.STRING, description: '저자' },
          difficulty: { 
            type: Type.STRING, 
            description: "난이도. '입문', '초급', '중급', '고급' 중 하나"
          },
          style: { type: Type.STRING, description: '설명 스타일 (예: 이론 중심, 실무 중심)' },
          reason: { type: Type.STRING, description: '이 책을 대체 도서로 추천하는 구체적인 이유' },
          prerequisites: { type: Type.STRING, description: '이 책을 읽기 위해 필요한 선수 지식' },
          description: { type: Type.STRING, description: '책에 대한 간단한 한 줄 설명' }
        },
        required: ['id', 'stage', 'title', 'author', 'difficulty', 'style', 'reason', 'prerequisites', 'description']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error('Failed to generate alternative book');
  
  return JSON.parse(text) as Curriculum['books'][0];
}

export async function findSimilarBooks(book: BookRecommendation, profile: UserProfile): Promise<SimilarBook[]> {
  const prompt = `
사용자가 다음 책과 비슷한 주제나 난이도를 가진 다른 책을 찾고 있습니다.
기준 도서: '${book.title}' (저자: ${book.author}) - 난이도: ${book.difficulty}

[사용자 프로필]
- 관심 분야: ${profile.interest}
- 현재 지식 수준: ${profile.level}
- 학습 목표: ${profile.goal}

기준 도서와 유사한 테마, 혹은 비슷한 난이도를 가진 훌륭한 대체/심화 도서 2권을 추천해주세요.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: '고유 ID (임의 생성)' },
            title: { type: Type.STRING, description: '책 제목' },
            author: { type: Type.STRING, description: '저자' },
            difficulty: { 
              type: Type.STRING, 
              description: "난이도. '입문', '초급', '중급', '고급' 중 하나"
            },
            reason: { type: Type.STRING, description: '이 책이 기준 도서와 비슷한 이유 및 추천 이유' },
            description: { type: Type.STRING, description: '책에 대한 간단한 한 줄 설명' }
          },
          required: ['id', 'title', 'author', 'difficulty', 'reason', 'description']
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error('Failed to generate similar books');
  
  return JSON.parse(text) as SimilarBook[];
}
