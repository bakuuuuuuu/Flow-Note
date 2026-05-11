# Flow-Note 🗂️

> 협업 일정 관리 실패 경험을 계기로 제작한, 칸반 보드와 캘린더 뷰를 결합해 태스크를 직관적으로 관리할 수 있는 웹 서비스

<br>

## 🔗 배포 URL

**https://flow-note-pi.vercel.app**

> 테스트 계정 없이 소셜 로그인(구글/카카오/네이버) 또는 일반 회원가입으로 바로 사용 가능합니다.

<br>

---

## 📸 스크린샷

### 🌐 대문 페이지
![대문](docs/images/Flow-Note%20대문.png)

---

### 🔐 로그인
![로그인](docs/images/Flow-Note%20로그인.png)

---

### 🏠 홈 화면
![홈](docs/images/Flow-Note%20홈%20화면.png)

---

### 📋 칸반 보드
![보드](docs/images/Flow-Note%20보드%20상세(보드%20탭).png)

---

### 🗂 카드 상세 모달
![카드상세](docs/images/Flow-Note%20카드%20상세%20모달.png)

---

### 📅 캘린더 탭
![캘린더](docs/images/Flow-Note%20카드%20상세(켈린더%20탭).png)

---

### 🔔 헤더 알림 드롭다운
![알림](docs/images/Flow-Note%20헤더%20알림%20드롭다운.png)

---

### 👤 마이페이지
![마이페이지](docs/images/Flow-Note%20마이페이지.png)

---

### 🎬 인터랙션

**📌 드래그 앤 드롭 카드 이동**
![DnD](docs/images/Flow-Note%20DnD.gif)

<br>

**📌 필터 적용**
![필터](docs/images/Flow-Note%20Filter.gif)

<br>

---

## 📌 목차

1. [프로젝트 소개](#-프로젝트-소개)
2. [주요 기능](#-주요-기능)
3. [기술 스택](#-기술-스택)
4. [시스템 아키텍처](#-시스템-아키텍처)
5. [폴더 구조](#-폴더-구조)
6. [ERD](#-erd)
7. [API 명세](#-api-명세)
8. [트러블슈팅](#-트러블슈팅)
9. [실행 방법](#-실행-방법)

<br>

---

## 💡 프로젝트 소개

지난 팀 프로젝트에서 일정 관리 없이 개발을 진행하다 프로젝트가 흐지부지 파토난 경험이 있습니다.
그 경험을 바탕으로 **"체계적인 일정 관리와 강제성 있는 프로세스"** 의 중요성을 느꼈고,
직접 사용할 수 있는 태스크 관리 도구를 만들기로 했습니다.

- **칸반 보드**로 태스크를 시각적으로 관리
- **캘린더 뷰**로 전체 일정을 한눈에 파악
- **D-Day 알림**으로 마감 임박 태스크 자동 알림
- **소셜 로그인**으로 간편한 시작

| 구분 | 내용 |
|------|------|
| 개발 기간 | 2026.01 ~ 2026.05 |
| 개발 인원 | 1인 (개인 프로젝트) |
| 배포 환경 | Vercel (프론트) + Render (백엔드) + MongoDB Atlas (DB) |

<br>

---

## ✨ 주요 기능

### 🔐 인증
- 이메일/비밀번호 일반 회원가입 및 로그인
- 구글 / 카카오 / 네이버 소셜 로그인 (OAuth 2.0)
- JWT 이중 토큰 인증 (AccessToken 15분 + RefreshToken 7일)
- 이메일 기반 비밀번호 재설정 (Nodemailer)
- 회원가입 시 이용약관 동의 처리

### 📋 칸반 보드
- 보드 / 리스트 / 카드 CRUD
- 드래그 앤 드롭으로 카드 이동 (dnd-kit, pos 중간값 알고리즘)
- 카드 상세: 상태, 우선순위, 라벨, 기간, 첨부파일, 활동기록
- 보드 필터 (라벨 / 상태 / 마감일 기준)
- 보드 공유 링크 복사

### 📅 캘린더
- FullCalendar 기반 월/주 뷰
- 카드 마감일 기준 일정 표시
- 날짜당 3개 초과 시 더보기 모달

### 🔔 알림
- 마감 24시간 이내 카드 자동 알림 (node-cron 스케줄러)
- 헤더 벨 아이콘 드롭다운 미리보기
- 마이페이지 알림 탭 (카테고리 필터 / 날짜 그룹핑 / 읽음 처리)

### 🔍 검색
- 보드 + 카드 통합 검색
- 검색어 하이라이트
- 최근 검색어 5개 저장/삭제

### 👤 마이페이지
- 프로필 이미지 업로드/삭제
- 닉네임, 상태메시지, 비밀번호 변경
- 소셜 연동 현황 표시
- 회원탈퇴 시 연관 데이터 일괄 삭제

<br>

---

## 🛠 기술 스택

### Frontend
| 기술 | 선택 이유 |
|------|-----------|
| React (Vite) | 컴포넌트 재사용성과 빠른 HMR로 개발 생산성 향상 |
| Tailwind CSS v4 | CSS 변수 기반 디자인 토큰 관리로 다크모드 전환 일원화 |
| Zustand | Redux 대비 가볍고 보일러플레이트 없는 전역 상태 관리 |
| dnd-kit | 접근성을 고려한 드래그 앤 드롭 라이브러리 |
| FullCalendar | 월/주 뷰 캘린더 구현에 최적화된 라이브러리 |
| Axios | 인터셉터를 활용한 토큰 갱신 자동화 |

### Backend
| 기술 | 선택 이유 |
|------|-----------|
| Node.js + Express | 프론트엔드와 동일한 JavaScript 환경으로 컨텍스트 스위칭 최소화 |
| MongoDB + Mongoose | 칸반 카드의 유연한 스키마 구조에 적합한 문서형 DB |
| JWT (이중 토큰) | AccessToken 탈취 대응을 위한 RefreshToken 분리 운영 |
| passport.js | 구글/카카오/네이버 OAuth 2.0 소셜 로그인 전략 통합 관리 |
| node-cron | 마감 임박 알림 자동화를 위한 서버 스케줄러 |
| Nodemailer | 비밀번호 재설정 이메일 발송 |

### Infra
| 기술 | 용도 |
|------|------|
| Vercel | 프론트엔드 배포 |
| Render | 백엔드 서버 배포 |
| MongoDB Atlas | 클라우드 DB |

<br>

---

## 🏗 시스템 아키텍처

```
[Client - Vercel]
    React (Vite)
    Zustand / Axios
         │
         │ HTTPS REST API
         ▼
[Server - Render]
    Node.js + Express
    passport.js (OAuth)
    node-cron (Scheduler)
         │
         │ Mongoose
         ▼
[Database - MongoDB Atlas]
    Users / Boards / Lists
    Cards / Notifications
    Activities / SearchHistory
```

<br>

---

## 📁 폴더 구조

```
flow-note/
├── client/                  # 프론트엔드 (React + Vite)
│   └── src/
│       ├── api/             # Axios API 모듈
│       ├── components/
│       │   ├── board/       # 칸반 보드 관련 컴포넌트
│       │   ├── common/      # 공통 컴포넌트 (Modal, Logo 등)
│       │   ├── layout/      # 레이아웃 (Header, Sidebar, AuthLayout)
│       │   └── mypage/      # 마이페이지 탭 컴포넌트
│       ├── pages/           # 페이지 컴포넌트
│       ├── store/           # Zustand 전역 상태
│       ├── constants/       # 상수 정의
│       └── utils/           # 유틸 함수
│
└── server/                  # 백엔드 (Node.js + Express)
    ├── config/              # passport.js 소셜 로그인 설정
    ├── controllers/         # 비즈니스 로직
    ├── middleware/          # 인증, 유효성 검사, 이미지 리사이즈
    ├── models/              # Mongoose 스키마
    ├── routes/              # API 라우터
    ├── utils/               # 알림 생성, 스케줄러, 파일 업로드
    ├── validators/          # Joi 입력 유효성 검사
    └── server.js            # 서버 진입점
```

<br>

---

## 🗄 ERD

| Collection | 주요 필드 |
|------------|-----------|
| **Users** | email, password, nickname, profile_img, provider, social_id, is_profile_complete |
| **Boards** | title, category, is_starred, start_date, deadline, bg_theme, owner_id, members[] |
| **Lists** | title, board_id, pos |
| **Cards** | title, content, list_id, board_id, owner_id, status, priority, labels[], due_date, pos, attachments[], checklists[] |
| **Notifications** | user_id, category, type, title, content, link_url, is_read |
| **Activities** | board_id, card_id, user_id, action_type, action, field, old_value, new_value |
| **SearchHistory** | userId, keyword |

<br>

---

## 📡 API 명세

### 인증 `/api/users`
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | /register | 회원가입 | ❌ |
| POST | /login | 로그인 | ❌ |
| POST | /logout | 로그아웃 | ❌ |
| POST | /refresh | 토큰 갱신 | ❌ |
| POST | /forgot-password | 비밀번호 재설정 메일 발송 | ❌ |
| PATCH | /reset-password/:token | 비밀번호 재설정 | ❌ |
| GET | /profile | 내 프로필 조회 | ✅ |
| PATCH | /profile | 프로필 수정 | ✅ |
| PATCH | /profile/image | 프로필 이미지 변경 | ✅ |
| DELETE | /profile/image | 프로필 이미지 삭제 | ✅ |
| PATCH | /password | 비밀번호 변경 | ✅ |
| DELETE | /account | 회원탈퇴 | ✅ |
| PATCH | /social-setup | 소셜 회원 추가 정보 입력 | ✅ |

### 소셜 로그인 `/auth`
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /google | 구글 로그인 시작 |
| GET | /google/callback | 구글 콜백 처리 |
| GET | /kakao | 카카오 로그인 시작 |
| GET | /kakao/callback | 카카오 콜백 처리 |
| GET | /naver | 네이버 로그인 시작 |
| GET | /naver/callback | 네이버 콜백 처리 |

### 보드 `/api/boards`
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| GET | / | 내 보드 목록 조회 | ✅ |
| POST | / | 보드 생성 | ✅ |
| GET | /:id | 보드 상세 조회 | ✅ |
| PATCH | /:id | 보드 수정 | ✅ |
| DELETE | /:id | 보드 삭제 | ✅ |

### 리스트 `/api/lists`
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | / | 리스트 생성 | ✅ |
| PATCH | /:id | 리스트 수정 | ✅ |
| PATCH | /:id/move | 리스트 순서 변경 | ✅ |
| DELETE | /:id | 리스트 삭제 | ✅ |

### 카드 `/api/cards`
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| GET | /board/:boardId | 보드의 카드 목록 조회 | ✅ |
| POST | / | 카드 생성 | ✅ |
| PATCH | /:id | 카드 수정 | ✅ |
| DELETE | /:id | 카드 삭제 | ✅ |
| PATCH | /:id/transfer | 카드 이동 (DnD) | ✅ |
| POST | /:id/attachments | 첨부파일 업로드 | ✅ |
| DELETE | /:id/attachments/:attachmentId | 첨부파일 삭제 | ✅ |

### 알림 `/api/notifications`
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| GET | / | 내 알림 목록 조회 | ✅ |
| PATCH | /:id/read | 알림 읽음 처리 | ✅ |
| PATCH | /read-all | 전체 읽음 처리 | ✅ |
| DELETE | /:id | 알림 삭제 | ✅ |

### 검색 `/api/search`
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| GET | / | 통합 검색 | ✅ |
| POST | /history | 검색어 저장 | ✅ |
| GET | /history | 최근 검색어 조회 | ✅ |
| DELETE | /history/:id | 검색어 삭제 | ✅ |

<br>

---

## 🔧 트러블슈팅

### 1. 배포 환경 소셜 로그인 Redirect URI 불일치

**문제**
로컬에서 정상 동작하던 소셜 로그인이 배포 후 `KOE006` / `redirect_uri_mismatch` 오류 발생.

**원인**
카카오/네이버/구글 개발자 콘솔에 로컬 URI(`http://localhost:5000/...`)만 등록되어 있었고,
실제 Render 배포 URL이 `flow-note-api.onrender.com`이 아닌 `flow-note.onrender.com`으로
환경변수와 불일치하는 문제가 겹쳐서 발생.

**해결**
각 플랫폼 콘솔에 배포 URL(`https://flow-note.onrender.com/auth/...`)을 추가 등록하고,
서버 환경변수의 콜백 URL도 실제 Render URL과 일치하도록 수정.

---

### 2. Vercel SPA 라우팅 404 문제

**문제**
소셜 로그인 콜백 후 `/auth/callback` 경로로 리다이렉트 시 `404: NOT_FOUND` 발생.

**원인**
Vercel은 기본적으로 요청 경로에 해당하는 실제 파일을 찾는다.
React SPA는 모든 라우팅을 `index.html` 하나에서 처리하는데,
`vercel.json` 설정 없이 배포하면 클라이언트 사이드 라우트를 인식하지 못해 404가 발생.

**해결**
`vercel.json`에 모든 경로를 `index.html`로 rewrite하는 설정 추가.

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### 3. DnD stale closure 문제

**문제**
카드를 드래그하여 다른 리스트로 이동할 때 잘못된 위치에 삽입되는 버그 발생.

**원인**
`handleDragEnd` 내부에서 `lists` 상태를 직접 참조하면 클로저로 인해
드래그 시작 시점의 이전 값을 캡처하는 stale closure 문제 발생.

**해결**
`useRef`로 `lists`의 최신 값을 항상 동기화하여 `handleDragEnd`에서 `listsRef.current`를 참조하도록 수정.

```js
const listsRef = useRef(lists)
useEffect(() => {
  listsRef.current = lists
}, [lists])
```

---

### 4. 다크모드 새로고침 시 초기화 문제

**문제**
다크모드로 전환 후 새로고침하면 항상 라이트모드로 돌아오는 현상 발생.

**원인**
Zustand `themeStore`의 초기값이 하드코딩(`'light'`)되어 있어,
`localStorage`에 저장된 테마 값을 무시하고 항상 라이트모드로 초기화.

**해결**
`themeStore` 초기값을 `localStorage`에서 즉시 읽어오도록 수정.

```js
const useThemeStore = create((set) => ({
  theme: localStorage.getItem('theme') || 'light',
  // ...
}))
```

<br>

---

## 🚀 실행 방법

### 사전 준비
- Node.js 18 이상
- MongoDB (로컬 또는 Atlas)
- 구글/카카오/네이버 개발자 콘솔 앱 등록 및 Client ID/Secret 발급

### 환경변수 설정

`server/.env` 파일 생성 후 아래 내용 작성:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

CLIENT_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

KAKAO_CLIENT_ID=your_kakao_rest_api_key
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_CALLBACK_URL=http://localhost:5000/auth/kakao/callback

NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
NAVER_CALLBACK_URL=http://localhost:5000/auth/naver/callback

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 설치 및 실행

```bash
# 백엔드
cd flow-note/server
npm install
npm run dev

# 프론트엔드 (새 터미널)
cd flow-note/client
npm install
npm run dev
```

로컬 서버: `http://localhost:5173`

<br>

---

## 📝 개발 블로그

프로젝트 전 과정을 포스팅으로 기록했습니다.

👉 **[황가의 코딩일기 - Flow-Note 제작기](https://youngjin99.tistory.com/43)**
