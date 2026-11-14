import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Logo from './Logo.jsx'
import { getJSON } from './prefetch.js'

export default function PostPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const contentRef = useRef(null)

  useEffect(() => {
    getJSON(`/api/posts/${id}`)
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
      <header className="s-post-nav">
        <div className="s-container s-nav-inner">
          <button type="button" className="s-back" onClick={() => navigate(-1)}>← cd ..</button>
          <Link to="/" className="s-brand" aria-label="seon06.dev 홈">
            <Logo size={22} />
            <span className="s-hide-sm">seon06<em>.dev</em></span>
          </Link>
          {post?.link ? (
            <a href={post.link} target="_blank" rel="noopener noreferrer" className="s-btn s-btn-primary" style={{ padding: '7px 14px', fontSize: '13px' }}>
              외부 링크 ↗
            </a>
          ) : <span style={{ width: 1 }} />}
        </div>
      </header>

      <div className="s-post-body">
        {loading && <p className="s-post-muted">불러오는 중...</p>}
        {notFound && <p className="s-post-muted">글을 찾을 수 없습니다.</p>}
        {post && (
          <div ref={contentRef} className="post-content" dangerouslySetInnerHTML={{ __html: post.content || '' }} />
        )}
      </div>
    </div>
  )
}
