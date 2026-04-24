# Portfolio

개인 포트폴리오 사이트. React + Vite 기반, Cloudflare Pages 배포.

## 🚀 빠른 시작

```bash
npm install
npm run dev
```

## ✏️ 내용 수정

`src/App.jsx` 상단의 `ME` 객체만 수정하면 됩니다.

```js
const ME = {
  name:     'Your Name',       // 이름
  initials: 'YN',              // 이니셜 (Nav, Avatar에 표시)
  role:     'Full-Stack Developer',
  tagline:  'I build things for the web.',
  location: 'Seoul, Korea',
  email:    'hello@yourname.dev',
  github:   'https://github.com/yourname',
  bio: [
    '첫 번째 문단...',
    '두 번째 문단...',
  ],
  skills: [
    { label: 'Language', items: 'TypeScript · Python · Go' },
    // ...
  ],
}
```

## ☁️ Cloudflare Pages 배포

### 방법 1 — GitHub 연결 (권장)

1. GitHub에 레포 push
2. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create**
3. **Pages** 탭 → **Connect to Git** → 레포 선택
4. 빌드 설정:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. **Save and Deploy** 클릭

### 방법 2 — Wrangler CLI

```bash
npm install -g wrangler
wrangler login
npm run build
wrangler pages deploy dist --project-name=portfolio
```

## 🔒 보안 체크리스트

- [x] 환경 변수 / API 키 없음 — 완전 정적 사이트
- [x] `rel="noopener noreferrer"` 외부 링크에 적용
- [x] 개인 정보는 `ME` 객체 한 곳에만 집중
- [x] `.gitignore`에 `node_modules`, `dist` 포함
