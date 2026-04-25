import { useState, useEffect, useCallback } from 'react'

const CATEGORIES = [
  { key: 'software', label: 'Software' },
  { key: 'hardware', label: 'Hardware' },
  { key: 'service',  label: 'Service' },
]

const TOKEN_KEY = 'admin_token'

function authHeader() {
  return { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY) || ''}` }
}

/* ─── Root ─────────────────────────────────────────── */
export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [view, setView] = useState('list')   // 'login' | 'list' | 'edit'
  const [editId, setEditId] = useState(null)

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setToken('')
    setView('list')
  }

  if (!token) {
    return <LoginView onLogin={t => { localStorage.setItem(TOKEN_KEY, t); setToken(t) }} />
  }

  return (
    <div className="adm-root">
      <header className="adm-header">
        <span className="adm-logo">YS · Admin</span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {view !== 'list' && (
            <button className="adm-btn-ghost" onClick={() => setView('list')}>← 목록</button>
          )}
          <button className="adm-btn-ghost" onClick={logout}>로그아웃</button>
        </div>
      </header>

      <main className="adm-main">
        {view === 'list' && (
          <PostList
            token={token}
            onEdit={id => { setEditId(id); setView('edit') }}
            onNew={() => { setEditId(null); setView('edit') }}
          />
        )}
        {view === 'edit' && (
          <PostEditor
            editId={editId}
            token={token}
            onSaved={() => setView('list')}
            onBack={() => setView('list')}
          />
        )}
      </main>
    </div>
  )
}

/* ─── LoginView ─────────────────────────────────────── */
function LoginView({ onLogin }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      })
      if (!res.ok) { setError('비밀번호가 틀렸습니다.'); return }
      const { token } = await res.json()
      onLogin(token)
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="adm-login-wrap">
      <div className="adm-login-card">
        <h1 className="adm-login-title">Admin</h1>
        <p className="adm-login-sub">seon06.dev 관리자 페이지</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input
            type="password"
            className="adm-input"
            placeholder="비밀번호"
            value={pw}
            onChange={e => setPw(e.target.value)}
            autoFocus
          />
          {error && <p className="adm-error">{error}</p>}
          <button type="submit" className="adm-btn-primary" disabled={loading}>
            {loading ? '확인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ─── PostList ──────────────────────────────────────── */
function PostList({ token, onEdit, onNew }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/posts?all=1', { headers: authHeader() })
      .then(r => r.json())
      .then(d => setPosts(d.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  async function togglePublish(post) {
    await fetch(`/api/posts/${post.id}`, {
      method: 'PUT',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...post, published: post.published ? 0 : 1 }),
    })
    load()
  }

  async function deletePost(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await fetch(`/api/posts/${id}`, { method: 'DELETE', headers: authHeader() })
    load()
  }

  return (
    <div className="adm-section">
      <div className="adm-section-header">
        <h2 className="adm-section-title">글 목록</h2>
        <button className="adm-btn-primary" onClick={onNew}>+ 새 글</button>
      </div>

      {loading ? (
        <p className="adm-muted">불러오는 중...</p>
      ) : posts.length === 0 ? (
        <div className="adm-empty">
          <p className="adm-muted">아직 작성된 글이 없습니다.</p>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>제목</th>
                <th>카테고리</th>
                <th>상태</th>
                <th>작성일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td className="adm-td-title">{post.title}</td>
                  <td>
                    <span className="adm-cat-badge">
                      {CATEGORIES.find(c => c.key === post.category)?.label || post.category}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`adm-status-badge ${post.published ? 'adm-published' : 'adm-draft'}`}
                      onClick={() => togglePublish(post)}
                      title="클릭하여 공개/비공개 전환"
                    >
                      {post.published ? '공개' : '비공개'}
                    </button>
                  </td>
                  <td className="adm-muted" style={{ fontSize: '12px' }}>
                    {post.created_at?.slice(0, 10)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="adm-btn-sm" onClick={() => onEdit(post.id)}>수정</button>
                      <button className="adm-btn-sm adm-btn-danger" onClick={() => deletePost(post.id)}>삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ─── PostEditor ────────────────────────────────────── */
const EMPTY_FORM = {
  title: '', category: 'software', description: '', content: '', link: '', published: false,
}

function PostEditor({ editId, token, onSaved, onBack }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(!!editId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    if (!editId) { setForm(EMPTY_FORM); setLoading(false); return }
    fetch(`/api/posts/${editId}?all=1`, { headers: authHeader() })
      .then(r => r.json())
      .then(p => setForm({
        title: p.title || '',
        category: p.category || 'software',
        description: p.description || '',
        content: p.content || '',
        link: p.link || '',
        published: !!p.published,
      }))
      .catch(() => setError('글을 불러올 수 없습니다.'))
      .finally(() => setLoading(false))
  }, [editId])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSave() {
    if (!form.title.trim()) { setError('제목을 입력하세요.'); return }
    setSaving(true)
    setError('')
    try {
      const url = editId ? `/api/posts/${editId}` : '/api/posts'
      const method = editId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { setError('저장에 실패했습니다.'); return }
      onSaved()
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="adm-muted" style={{ padding: '40px' }}>불러오는 중...</p>

  return (
    <div className="adm-section">
      <div className="adm-section-header">
        <h2 className="adm-section-title">{editId ? '글 수정' : '새 글 작성'}</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`adm-btn-ghost ${preview ? 'adm-btn-ghost-active' : ''}`}
            onClick={() => setPreview(v => !v)}
          >
            {preview ? '에디터' : '미리보기'}
          </button>
          <button className="adm-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {error && <p className="adm-error" style={{ marginBottom: '16px' }}>{error}</p>}

      {preview ? (
        <div className="adm-preview-wrap">
          <iframe
            className="adm-preview-frame"
            srcDoc={form.content || '<p style="color:#888;font-family:sans-serif;padding:20px">콘텐츠가 없습니다.</p>'}
            title="미리보기"
          />
        </div>
      ) : (
        <div className="adm-form">
          <div className="adm-form-row">
            <label className="adm-label">제목 *</label>
            <input
              className="adm-input"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="글 제목"
            />
          </div>

          <div className="adm-form-row">
            <label className="adm-label">카테고리</label>
            <select
              className="adm-select"
              value={form.category}
              onChange={e => set('category', e.target.value)}
            >
              {CATEGORIES.map(c => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="adm-form-row">
            <label className="adm-label">설명 <span className="adm-muted">(카드에 표시)</span></label>
            <textarea
              className="adm-textarea"
              rows={3}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="간단한 설명을 입력하세요."
            />
          </div>

          <div className="adm-form-row">
            <label className="adm-label">링크</label>
            <input
              className="adm-input"
              type="url"
              value={form.link}
              onChange={e => set('link', e.target.value)}
              placeholder="https://"
            />
          </div>

          <div className="adm-form-row">
            <label className="adm-label">
              콘텐츠 <span className="adm-muted">(HTML + JS 사용 가능)</span>
            </label>
            <textarea
              className="adm-editor"
              value={form.content}
              onChange={e => set('content', e.target.value)}
              placeholder={'<h1>제목</h1>\n<p>본문 내용...</p>\n<script>console.log("hello")</script>'}
              spellCheck={false}
            />
          </div>

          <div className="adm-form-row adm-form-row-inline">
            <label className="adm-label" style={{ marginBottom: 0 }}>
              <input
                type="checkbox"
                checked={form.published}
                onChange={e => set('published', e.target.checked)}
                style={{ marginRight: '8px', accentColor: 'var(--accent)' }}
              />
              공개 (체크 시 메인 사이트에 표시)
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
