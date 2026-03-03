# GHG Goal Management System - Frontend Project Rules

## 개요
이 문서는 GHG Goal Management System Frontend 프로젝트의 코드 컨벤션, 스타일 가이드, 개발 규칙 및 보안 정책을 정의합니다.

---

## 1. 네이밍 컨벤션

### 1.1 파일 네이밍
- **Vue 컴포넌트**: PascalCase (예: `CommonTable.vue`, `ActivitySurveyRegi.vue`)
- **일반 컴포넌트**: PascalCase 또는 kebab-case 허용
- **TypeScript 파일**: camelCase (예: `api-services.ts`, `common-store.ts`)
- **유틸리티 파일**: camelCase (예: `common-util.ts`, `form-validation.ts`)
- **모델 파일**: camelCase (예: `auth.ts`, `common.ts`)
- **SCSS 파일**: kebab-case (예: `common-form.scss`, `common-layout.scss`)

### 1.2 변수 및 함수 네이밍
- **변수**: camelCase (예: `searchKeyword`, `isRegionOpen`)
- **상수**: PascalCase 또는 UPPER_SNAKE_CASE (예: `LocalStorageKey`, `HttpMethod`)
- **함수**: camelCase (예: `handleFilterChange`, `loadCodes`)
- **클래스**: PascalCase (예: `ApiServices`, `RestClient`, `PageInterceptor`)
- **인터페이스/타입**: PascalCase (예: `LoginResData`, `AuthStorageInfo`)

### 1.3 컴포넌트 네이밍
- **Vue 컴포넌트 파일명**: PascalCase
- **컴포넌트 사용**: kebab-case 또는 PascalCase (예: `<CommonTable />` 또는 `<common-table />`)

### 1.4 CSS/SCSS 클래스 네이밍
- **BEM (Block Element Modifier) 방식 사용**
- 형식: `.block__element--modifier`
- 예시:
  ```scss
  .table-container {
    &__top-info {
      &--title { }
      &--subtitle { }
    }
    &__footer {
      &--pagination { }
    }
  }
  ```

---

## 2. 파일 구조 및 디렉토리 규칙

### 2.1 프로젝트 구조
```
src/
├── api/              # API 서비스 레이어
├── assets/           # 정적 리소스 (이미지, SCSS 등)
├── components/       # 재사용 가능한 컴포넌트
├── composables/      # Vue Composition API 유틸리티
├── layouts/          # 레이아웃 컴포넌트
├── model/            # TypeScript 인터페이스 및 타입 정의
├── router/           # 라우터 설정
├── stores/           # Pinia 상태 관리
├── types/            # 타입 정의
├── utils/            # 유틸리티 함수
├── views/            # 페이지 컴포넌트
├── App.vue           # 루트 컴포넌트
├── main.ts           # 애플리케이션 진입점
└── enums.ts          # 열거형 정의
```

### 2.2 파일 생성 규칙
- **API 서비스**: `*-service.ts` 형식 (예: `common-service.ts`, `user-service.ts`)
- **Store**: `*-store.ts` 형식 (예: `common-store.ts`, `user-store.ts`)
- **Composable**: camelCase 함수명으로 export (예: `useLoginFormValidation`)
- **모델**: camelCase 단수형 (예: `auth.ts`, `user.ts`)

---

## 3. 코드 순서 및 배치 규칙

### 3.1 Vue Single File Component 구조

#### 기본 구조 순서
```vue
<script setup lang="ts">
// 1. Libraries (외부 라이브러리)
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// 2. Images/Assets
import searchIcon from "@/assets/files/icons/search_icon.svg";

// 3. API Services
import { apiServices } from "@/api/api-services";

// 4. Components
import CommonTable from "@/components/table/CommonTable.vue";

// 5. Utils/Composables
import CommonUtil from "@/utils/common-util";

// 6. Types/Interfaces
interface CustomInterface {
  // ...
}


/**************************************************************************************
 * SECTION: Props and Event
 */

const props = defineProps<{ /* ... */ }>();
const emit = defineEmits<{ /* ... */ }>();


/**************************************************************************************
 * SECTION: Variables (Refs, Reactive ..)
 */

const searchKeyword = ref<string>("");


/**************************************************************************************
 * SECTION: Computed  or Watcher
 */

const filteredList = computed(() => { /* ... */ });

watch(() => props.list, () => { /* ... */ });


/**************************************************************************************
 * SECTION: LifeCycle Hooks
 */

onBeforeMount(async () => { /* ... */ });

onMounted(async () => { /* ... */ });


/**************************************************************************************
 * SECTION: Functions (동기, 비동기)
 */

// ANCHOR: 핵심 함수는 ANCHOR 주석 사용
const handleSearch = () => { /* ... */ };
</script>

<template>
  <!-- Template 내용 -->
</template>

<style scoped lang="scss">
@use "@/assets/scss/variables/colors";
@use "@/assets/scss/variables/typography";
@use "@/assets/scss/common/common-form";
</style>
```

### 3.2 TypeScript 파일 구조

#### API Service 클래스
```typescript
// 1. Imports
import type RestClient from "@/api/rest-client";
import BaseService from "@/api/base-service";
import { HttpMethod } from "@/enums";

// 2. 클래스 정의
/**
 * 서비스 설명
 * @class
 */
class ServiceName extends BaseService {
  constructor(restClient: RestClient) {
    super(restClient);
  }

  // 3. Public 메서드
  async methodName() {
    // ...
  }
}

export default ServiceName;
```

#### Store 파일
```typescript
// 1. Imports
import { defineStore } from "pinia";
import { ref, computed } from "vue";

// 2. Store 정의
export const useStoreName = defineStore("storeName", () => {
  // 3. State
  const stateValue = ref<Type>(initialValue);

  // 4. Actions
  async function actionName() {
    // ...
  }

  // 5. Getters (Computed)
  const getterName = computed(() => { /* ... */ });

  // 6. Return
  return { stateValue, actionName, getterName };
});
```

### 3.3 주석 규칙

#### SECTION 주석
- 큰 섹션을 구분할 때 사용(SECTION 순서도 고정)
```typescript
/**************************************************************************************
 * SECTION: Props and Event
 */

/**************************************************************************************
 * SECTION: Variables (Refs, Reactive ..)
 */

/**************************************************************************************
 * SECTION: Computed  or Watcher
 */

/**************************************************************************************
 * SECTION: LifeCycle Hooks
 */

/**************************************************************************************
 * SECTION: Functions (동기, 비동기)
 */
```

#### ANCHOR 주석
- 핵심 함수나 중요한 변수를 표시할 때 사용
```typescript
// ANCHOR: 필터 변경 핸들러
const handleFilterChange = () => { /* ... */ };
```

#### NOTE 주석
- 코드에 대한 설명이나 주의사항을 표시할 때 사용
```typescript
// NOTE: 필터 변경 시 첫 페이지로 이동
currentPage.value = 1;
```

---

## 4. TypeScript 규칙

### 4.1 타입 정의
- **명시적 타입 지정 권장**: 모든 변수, 함수 매개변수, 반환값에 타입 명시
```typescript
const searchKeyword = ref<string>("");
const pageLimit = ref<number>(10);
const filteredList = computed(() => { /* ... */ });
```

### 4.2 인터페이스 및 타입
- **인터페이스**: 객체 구조를 정의할 때 사용
```typescript
interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}
```

### 4.3 Enum 사용
- **열거형**: 상수 값들을 정의할 때 사용
```typescript
export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
  PUT = "PUT",
  DELETE = "DELETE",
}
```

### 4.4 타입 가드
- **null/undefined 체크**: `CommonUtil.isNullOrEmpty()` 사용
```typescript
if (!CommonUtil.isNullOrEmpty(value)) {
  // 처리
}
```

---

## 5. Vue 컴포넌트 규칙

### 5.1 Composition API 사용
- **`<script setup>` 사용 필수**: 모든 컴포넌트는 `<script setup lang="ts">` 사용
- Options API 사용 금지

### 5.2 Props 정의
```typescript
const props = defineProps<{
  columns: {
    key: string;
    title?: string;
    label: string;
    width?: string;
  }[];
  list: any[];
  defaultEmptyText: string;
}>();
```

### 5.3 Emits 정의
```typescript
const emit = defineEmits<{
  (e: "rowAction", action: string, row: any): void;
  (e: "filterChange", filterValue: string | null): void;
}>();
```

### 5.4 반응형 변수
- **`ref`**: 기본 타입 및 단일 객체
- **`reactive`**: 복잡한 객체 (제한적 사용)
- **`computed`**: 계산된 속성

### 5.5 라이프사이클 훅
- 필요한 경우에만 사용
- 일반적인 순서: `onBeforeMount` → `onMounted` → `onBeforeUnmount` → `onUnmounted`

---

## 6. API 및 서비스 레이어 규칙

### 6.1 API 서비스 구조
- **Singleton 패턴**: `ApiServices` 클래스는 싱글톤 패턴 사용
- **BaseService 상속**: 모든 서비스는 `BaseService`를 상속받음
- **RestClient 주입**: 생성자에서 `RestClient` 인스턴스를 주입받음

### 6.2 HTTP 메서드
- **Enum 사용**: `HttpMethod` enum을 사용하여 HTTP 메서드 지정
```typescript
const res = await this.restClient.call<ApiResponse>(
  HttpMethod.GET,
  "/api/endpoint"
);
```

### 6.3 에러 처리
- **Axios 에러 처리**: `RestClient`에서 통합 처리
- **401 에러**: 자동으로 로그인 페이지로 리디렉션
- **에러 응답**: `ApiResponseError` 타입으로 반환

### 6.4 요청 파라미터
- **RequestParameter 타입 사용**: body, params, form, headers를 포함한 객체 사용

---

## 7. 상태 관리 (Pinia) 규칙

### 7.1 Store 구조
- **Setup Store 방식 사용**: `defineStore`의 두 번째 인자로 함수 전달
```typescript
export const useStoreName = defineStore("storeName", () => {
  // State
  const state = ref<Type>(initialValue);
  
  // Actions
  function action() { /* ... */ }
  
  // Getters
  const getter = computed(() => { /* ... */ });
  
  return { state, action, getter };
});
```

### 7.2 Store 네이밍
- **파일명**: `*-store.ts`
- **Store ID**: 파일명과 동일한 camelCase 사용 (예: `"commonStore"`)

---

## 8. 스타일링 규칙 (SCSS)

### 8.1 SCSS 파일 구조
- **Variables 사용**: `@use` 지시어로 변수 및 믹스인 import
```scss
@use "@/assets/scss/variables/colors";
@use "@/assets/scss/variables/typography";
@use "@/assets/scss/common/common-form";
```

### 8.2 BEM 네이밍
- **블록**: 컴포넌트의 최상위 요소
- **요소**: `__element`
- **수정자**: `--modifier`

### 8.3 중첩 규칙
- **최대 3단계 중첩 권장**: 과도한 중첩 금지
- **& 사용**: 부모 선택자 참조 시 사용

### 8.4 스타일 범위
- **scoped 사용**: 컴포넌트 스타일은 항상 `<style scoped lang="scss">` 사용
- **전역 스타일**: 최소화하고 필요시에만 사용

---

## 9. 라우터 규칙

### 9.1 라우트 정의
- **네이밍 규칙**: kebab-case (예: `"activity-survey-regi-detail"`)
- **Path 규칙**: kebab-case로 계층 구조 표현

### 9.2 Route Meta
- **sidebar 메타 정보**: 사이드바 구성 정보 포함
```typescript
meta: {
  sidebar: {
    category: "지정운영",
    subcategory: "예비관리업체 지정",
    title: "활동자료조사표 등록",
    level: 3,
    order: 1,
    hidden: true, // 선택적
    parentPath: "/kgct/designation/activity-survey-registration" // 선택적
  }
}
```

### 9.3 네비게이션 가드
- **PageInterceptor 사용**: 인증 및 권한 체크는 `PageInterceptor`에서 처리

---

## 10. 보안 규칙

### 10.1 인증 및 인가
- **쿠키 기반 인증**: `withCredentials: true` 사용
- **HTTP-only 쿠키**: 서버에서 관리하는 HttpOnly 쿠키 사용
- **라우터 가드**: `PageInterceptor`를 통한 인증 체크

### 10.2 환경 변수
- **환경 변수 사용**: API URL 등 민감한 정보는 `.env` 파일에 저장
- **접두사**: `VITE_` 접두사 필수 (예: `VITE_KEA_API_SERVER`)
- **Git 추적 금지**: `.env.local` 파일은 `.gitignore`에 포함

### 10.3 입력 검증
- **클라이언트 사이드 검증**: `vee-validate`와 `yup` 사용
- **서버 사이드 검증**: 클라이언트 검증만으로는 부족, 서버 검증 필수

### 10.4 XSS 방지
- **v-html 사용 금지**: 가능한 한 템플릿 바인딩 사용
- **사용자 입력 이스케이프**: 외부 라이브러리 사용 시 주의

---

## 11. 폼 검증 규칙

### 11.1 VeeValidate 사용
- **yup 스키마**: 모든 폼 검증은 `yup` 스키마로 정의
```typescript
const loginFormSchema = yup.object({
  email: yup.string().required().email(),
  password: yup.string().required().min(9).max(100),
});
```

### 11.2 Composable 패턴
- **검증 로직 분리**: 각 폼 타입별로 composable 함수 생성
- **네이밍**: `use{FormName}FormValidation` 형식

---

## 12. 유틸리티 함수 규칙

### 12.1 정적 클래스
- **CommonUtil**: 유틸리티 함수는 정적 클래스로 관리
```typescript
class CommonUtil {
  static isNullOrEmpty<T>(obj: T | null | undefined): boolean {
    // ...
  }
  
  static formatDate(dateString: string | Date): string | null {
    // ...
  }
}
```

### 12.2 함수 분류
- **파일별 분류**: 기능별로 파일 분리 (예: `common-util.ts`, `form-validation.ts`)

---

## 13. 에러 처리 규칙

### 13.1 API 에러 처리
- **통합 에러 처리**: `RestClient`에서 통합 처리
- **사용자 피드백**: 에러 발생 시 적절한 메시지 표시 (SweetAlert2 등 사용)

### 13.2 에러 타입
- **ApiResponseError**: API 응답 에러 타입 정의
- **타입 가드**: 에러 타입 체크 후 처리

---

## 14. 성능 최적화 규칙

### 14.1 이미지 최적화
- **SVG 사용**: 가능한 한 SVG 아이콘 사용
- **이미지 경로**: `@/assets/files/icons/` 경로 사용

### 14.2 코드 분할
- **동적 import**: 큰 컴포넌트는 필요시 동적 import 고려

### 14.3 반응형 최적화
- **불필요한 반응성 제거**: `markRaw` 사용 고려
- **Computed 최적화**: 불필요한 계산 방지

---

## 15. 테스트 규칙

### 15.1 테스트 파일 위치
- 테스트 파일은 각 소스 파일과 같은 디렉토리에 배치하거나 `__tests__` 디렉토리 사용

### 15.2 테스트 명령어
- **개발 모드**: `npm run dev`
- **빌드**: `npm run build`
- **타입 체크**: `npm run type-check`
- **린트**: `npm run lint`

---

## 16. Git 커밋 규칙

### 16.1 커밋 메시지 형식
- **형식**: `[타입] 간단한 설명`
- **타입**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### 16.2 브랜치 네이밍
- **형식**: `feature/기능명`, `fix/버그명`, `hotfix/긴급수정명`

---

## 17. 코드 리뷰 체크리스트

### 17.1 필수 체크 항목
- [ ] TypeScript 타입이 올바르게 정의되어 있는가?
- [ ] 컴포넌트가 `<script setup>` 형식을 사용하는가?
- [ ] 네이밍 컨벤션이 준수되었는가?
- [ ] 주석이 적절히 작성되었는가? (SECTION, ANCHOR, NOTE)
- [ ] 에러 처리가 적절한가?
- [ ] 보안 규칙을 준수하는가?
- [ ] SCSS 스타일이 BEM 방식으로 작성되었는가?
- [ ] 불필요한 코드나 주석이 없는가?

---

## 18. 참고 자료

### 18.1 주요 라이브러리
- **Vue 3**: Composition API 중심
- **TypeScript**: 타입 안정성
- **Pinia**: 상태 관리
- **Vue Router**: 라우팅
- **VeeValidate + Yup**: 폼 검증
- **Axios**: HTTP 클라이언트
- **Bootstrap 5**: UI 프레임워크
- **SCSS**: 스타일 전처리기

### 18.2 개발 도구
- **Vite**: 빌드 도구
- **ESLint**: 코드 품질 관리
- **Vue TSC**: TypeScript 타입 체크

---

## 19. 변경 이력

- **2024-01-XX**: 초기 버전 작성

---

**이 규칙은 프로젝트 진행에 따라 지속적으로 업데이트됩니다. 모든 개발자는 이 규칙을 준수해야 합니다.**

