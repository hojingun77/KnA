# K&A 개발 지침

사용자가 2026-11-02 구현 순서 1번을 승인해 활성화한 프로젝트 지침이다.

## 작업 브랜치 고정 (2026-11-03 사용자 지시)

- 이 작업 사본의 개발·커밋·push·pull 대상은 `codex/llm-prototype` 브랜치로 고정한다. 외부 LLM·sLLM 연동 프로토타입을 개발하는 브랜치다.
- `main`은 안정 시연용 로컬 프로토타입이다. 이 사본에서 `main`에 커밋·push·merge·rebase·force push를 하지 않으며, `main`을 이 브랜치로 되돌리거나 덮어쓰지 않는다. 두 브랜치의 병합은 사용자가 명시적으로 요청한 경우에만 검토한다.
- 새 작업 브랜치를 만들지 않고 이 브랜치에서 작업한다. 하네스 10절의 "짧은 작업 브랜치" 원칙보다 이 고정 지시를 우선한다.
- `.githooks/pre-push`가 `codex/llm-prototype` 외의 원격 브랜치로 가는 push를 차단한다. 훅을 우회(`--no-verify`)하거나 `core.hooksPath` 설정을 지우지 않는다.

## 기준 문서

- 작업 전 [프로젝트 하네스](docs/harness/PROJECT_HARNESS.md)를 읽고 해당 작업의 정책을 따른다.
- 답변 평가·점수·채택 작업은 [답변 평가 룰](docs/harness/ANSWER_EVALUATION_RULES.md)의 `kna-evidence-v1`을 함께 따른다.
- 질문 등록·보상·포인트 작업은 [질문 보상 룰](docs/harness/QUESTION_REWARD_RULES.md)의 `kna-reward-v1`을 함께 따른다.
- [구현 계획](docs/IMPLEMENTATION_PLAN.md)에서 현재 단계를 확인한다. 사용자가 지정한 범위까지만 구현하고 검증한 결과를 기록한다.
- 최신 사용자 지시를 우선한다. 과거 Figma 검토 기록의 철회된 제안이나 당시 비활성 설명으로 현재 정책을 되돌리지 않는다.

## 구현 경계

- 목표는 로컬 데이터 기반 시연 프로토타입이다. React/Vite/JSX·Tailwind·Router·Zustand·i18next 구성을 유지한다.
- 데이터는 비동기 저장소 모듈을 통해 IndexedDB로 읽고 쓴다. 미래 서버 교체 경계는 확보하되 동기화 엔진은 미리 만들지 않는다.
- 외부 호출의 개발 범위는 로컬 Node API를 통한 질문 보상 분류와 제한된 검색 기반 답변 평가다. 키는 서버에만 두며 `VITE_*`·브라우저·DB에 넣지 않는다.
- 이 브랜치(`codex/llm-prototype`)는 하네스 2026-11-03 개정에 따라 외부 호출 범위를 ① 사용자가 실행하는 질문·답변 번역(Google Translation 주, 로컬 sLLM 대체, [번역 룰](docs/harness/TRANSLATION_RULES.md)) ② 로컬 sLLM 질문 보상 분류로 한정한다. 답변 평가·자동 채택·파인튜닝은 구현하지 않는다.
- Firebase·Algolia·실제 상품권·자동 본문 번역·RAG 구축·실제 모델 학습·배포는 현재 구현 범위로 자동 추가하지 않는다.
- 기능이 구현되거나 검증되지 않았으면 완료됐다고 기록하지 않는다. 정책 활성화와 기능 구현 완료는 구분한다.
- 화면 구현 전 해당 Figma 프레임을 확인한다. 사용자 확정 보상 포인트 표기와 채택 확인 문구를 유지한다.

## 실행과 검증

- Node 24를 사용한다(`.nvmrc`). 설치·실행 안내는 [README](README.md)를 따른다.
- 기존 명령은 `npm run dev`, `npm run lint`, `npm run build`, `npm run preview`다. 현재 별도 테스트 스크립트는 없다.
- 변경 경로에 맞게 검증하고 결과를 보고한다. 단순 문구 변경에 테스트 인프라나 새 의존성을 추가하지 않는다.
- 기존 사용자 변경을 보존한다. 커밋·push·PR·배포는 사용자 요청이 있을 때만 수행한다.
