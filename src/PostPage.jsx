import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function PostPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const contentRef = useRef(null)

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then(r => { if (!r.ok) { setNotFound(true); return null } return r.json() })
      .then(data => { if (data) setPost(data) })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!post?.js || !contentRef.current) return
    const script = document.createElement('script')
    script.textContent = post.js
    contentRef.current.appendChild(script)
    return () => { try { script.remove() } catch {} }
  }, [post])

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <nav style={navStyle}>
        <button
          onClick={() => navigate(-1)}
          style={backBtnStyle}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          ← 돌아가기
        </button>
        {post?.link && (
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            style={externalLinkStyle}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
          >
            외부 링크 ↗
          </a>
        )}
      </nav>

      <div style={bodyStyle}>
        {loading && <p style={mutedStyle}>불러오는 중...</p>}
        {notFound && <p style={mutedStyle}>글을 찾을 수 없습니다.</p>}
        {post && (
          <div ref={contentRef} className="post-content" dangerouslySetInnerHTML={{ __html: post.content || '' }} />
        )}
      </div>
    </div>
  )
}

const navStyle = {
  position: 'sticky', top: 0, zIndex: 100,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '20px 48px',
  backdropFilter: 'blur(12px)',
  background: 'rgba(247,246,242,0.88)',
  borderBottom: '1px solid var(--line)',
}

const backBtnStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px', fontWeight: 400,
  color: 'var(--text-muted)',
  background: 'none', border: 'none',
  cursor: 'pointer', transition: 'color 0.2s',
  padding: 0,
}

const externalLinkStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px', fontWeight: 500,
  padding: '7px 18px',
  borderRadius: '100px',
  background: 'var(--accent)',
  color: '#fff',
  transition: 'background 0.2s',
}

const bodyStyle = {
  maxWidth: '820px',
  margin: '0 auto',
  padding: '64px 48px 120px',
}

const mutedStyle = {
  fontFamily: 'var(--font-body)',
  color: 'var(--text-muted)',
}
