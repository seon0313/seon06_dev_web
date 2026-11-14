import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import PostPage from './PostPage.jsx'

// 관리자 화면은 방문자에게 필요 없으니 따로 떼어 필요할 때만 받음
const Admin = lazy(() => import('./Admin.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/posts/:id" element={<PostPage />} />
        <Route path="/admin/*" element={<Suspense fallback={null}><Admin /></Suspense>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
