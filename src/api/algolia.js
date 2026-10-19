import { algoliasearch } from 'algoliasearch';

// Algolia 검색 클라이언트 (질문 풀텍스트 검색)
// 키는 .env에서 관리
const client = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_SEARCH_KEY, // Search-only API key (공개 가능)
);

export const QUESTIONS_INDEX = 'questions';

export default client;
