# K&A 로컬 프로토타입

한국 거주 외국인의 생활·행정 Q&A를 시연하기 위한 React 앱입니다. IndexedDB 기반 두 데모 계정, 로그인, 질문 작성·조회, 포인트 화면을 1차 구현했습니다. 답변·채택·로컬 Node API·LLM 기능과 전체 디자인 검수는 아직 진행 중입니다.

## 개발 환경

- Node.js 24, npm 사용. `.nvmrc`에 개발용 Node 버전을 지정했습니다.
- React 19, Vite 8, JavaScript/JSX, Tailwind CSS 3, React Router, Zustand, i18next.
- `package-lock.json`을 기준으로 설치합니다. `npm ci`는 기존 `node_modules`를 재설치하므로 최초 설치나 잠금 파일 변경 시 사용합니다.

```sh
# nvm을 사용하는 경우
nvm use

# 최초 의존성 설치
npm ci

# 프론트 개발 서버
npm run dev
```

기본 주소는 `http://localhost:5173`입니다. 해당 포트가 사용 중이면 Vite가 출력한 실제 주소를 확인하세요. 개발 서버는 localhost에만 바인딩하며 `Ctrl+C`로 종료합니다. 현재 실행에는 `.env`, Firebase 프로젝트, API 키가 필요하지 않습니다.

## 확인 명령

```sh
npm run lint
npm run build
npm run preview
```

- `lint`: ESLint 검사.
- `build`: `dist/`에 프론트 정적 빌드 생성.
- `preview`: 빌드 결과를 기본 `http://localhost:4173`에서 확인. 먼저 `build`를 실행합니다.
- 현재 별도 테스트 명령은 없습니다. 빌드 성공만으로 질문·포인트·LLM 동작을 검증한 것으로 간주하지 않습니다.

## 환경 변수

- 현재 프론트 실행에는 환경 변수를 설정하지 않습니다.
- `.env.example`은 빈 값만 담는 공유 템플릿입니다. 향후 서버 연결 시 필요할 때만 `.env`로 복사합니다. `.env`와 `.env.*`는 Git에서 제외하며 `.env.example`만 예외입니다.
- `OPENAI_API_KEY`는 향후 로컬 Node API가 읽을 서버 전용 키입니다. 현재 서버와 키 로더는 없으며, 값을 채우는 것만으로 LLM 기능이 동작하지 않습니다.
- 실제 키를 `VITE_*` 환경 변수, 프론트 코드, IndexedDB 또는 로그에 넣지 않습니다.
- Firebase·Algolia 패키지와 초기화 파일은 기존 스캐폴딩에 남아 있지만 현재 화면에서는 사용하지 않습니다. 이를 위해 콘솔 계정이나 Emulator를 설정할 필요가 없습니다.

## 개발 기준과 진행 상태

- [AGENTS.md](AGENTS.md): 프로젝트 개발 지침 진입점.
- [프로젝트 하네스](docs/harness/PROJECT_HARNESS.md): 활성 제품·아키텍처·검증 기준.
- [답변 평가 룰](docs/harness/ANSWER_EVALUATION_RULES.md), [질문 보상 룰](docs/harness/QUESTION_REWARD_RULES.md): 확정 LLM 계약.
- [구현 순서와 상태](docs/IMPLEMENTATION_PLAN.md): 단계별 범위·완료 기준·검증 기록.

현재 데이터 서버·온라인 동기화·상품권 발급·배포는 연결하지 않았습니다. 로그인은 테스트 전용 로컬 데모 흐름이며 실제 인증 보안 기능은 아닙니다. 다른 PC로 소스 코드를 옮겨도 브라우저의 IndexedDB 데이터는 함께 이동하지 않습니다.
