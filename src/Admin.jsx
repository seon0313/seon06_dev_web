import { useState, useEffect, useCallback } from 'react'

function buildSrcDoc(html, js) {
  if (!html && !js) return ''
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:          #f7f6f2;
    --bg-card:     #ffffff;
    --text:        #111110;
    --text-muted:  #888884;
    --accent:      #2c5f8a;
    --accent-soft: #dce8f3;
    --line:        #e5e3de;
    --font-display: 'Cormorant Garamond', Georgia, serif;
    --font-body:    'DM Sans', system-ui, sans-serif;
  }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 16px;
    line-height: 1.8;
    -webkit-font-smoothing: antialiased;
    max-width: 820px;
    margin: 0 auto;
    padding: 64px 48px 120px;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    font-weight: 300;
    letter-spacing: -0.01em;
    line-height: 1.15;
    margin-bottom: 0.6em;
    margin-top: 1.6em;
    color: var(--text);
  }
  h1 { font-size: clamp(32px, 4vw, 52px); }
  h2 { font-size: clamp(24px, 3vw, 38px); }
  h3 { font-size: clamp(18px, 2vw, 26px); }
  p  { margin-bottom: 1.1em; }
  a  { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
  ul, ol { padding-left: 1.4em; margin-bottom: 1.1em; }
  li { margin-bottom: 0.4em; }
  hr { border: none; border-top: 1px solid var(--line); margin: 2em 0; }
  code {
    font-family: 'Fira Code', 'SF Mono', monospace;
    font-size: 0.875em;
    background: var(--accent-soft);
    color: var(--accent);
    padding: 2px 6px;
    border-radius: 4px;
  }
  pre {
    background: #1e1e2e;
    color: #cdd6f4;
    padding: 20px 24px;
    border-radius: 12px;
    overflow-x: auto;
    margin-bottom: 1.4em;
    font-size: 13px;
    line-height: 1.7;
  }
  pre code { background: none; color: inherit; padding: 0; font-size: inherit; }
  img { max-width: 100%; border-radius: 12px; margin: 0.6em 0; }
  blockquote {
    border-left: 3px solid var(--accent);
    padding-left: 1.2em;
    color: var(--text-muted);
    font-style: italic;
    margin: 1.4em 0;
  }
</style>
</head>
<body>
${html || ''}
${js ? `<script>\n${js}\n</script>` : ''}
</body>
</html>`
}

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
          <>
            <PostList
              token={token}
              onEdit={id => { setEditId(id); setView('edit') }}
              onNew={() => { setEditId(null); setView('edit') }}
            />
            <AuthCodesSection />
          </>
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
  title: '', category: 'software', description: '', content: '', js: '', link: '', published: false,
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
        js: p.js || '',
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
            srcDoc={
              form.content || form.js
                ? buildSrcDoc(form.content, form.js)
                : '<body style="font-family:sans-serif;color:#888;padding:20px">콘텐츠가 없습니다.</body>'
            }
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
            <label className="adm-label">HTML</label>
            <textarea
              className="adm-editor"
              value={form.content}
              onChange={e => set('content', e.target.value)}
              placeholder={'<h1>제목</h1>\n<p>본문 내용...</p>\n<div id="app"></div>'}
              spellCheck={false}
            />
          </div>

          <div className="adm-form-row">
            <label className="adm-label">
              JavaScript <span className="adm-muted">(&lt;script&gt; 태그 없이 작성)</span>
            </label>
            <textarea
              className="adm-editor"
              value={form.js}
              onChange={e => set('js', e.target.value)}
              placeholder={"document.getElementById('app').textContent = 'Hello!';\nconsole.log('loaded');"}
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

/* ─── AuthCodesSection ──────────────────────────────── */
function AuthCodesSection() {
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [genLabel, setGenLabel] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [customLabel, setCustomLabel] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth-codes', { headers: authHeader() })
      const data = await res.json().catch(() => ({}))
      setCodes(data.codes || [])
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function createCode(code, label) {
    if (!code.trim()) return
    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/auth-codes', {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), label: label.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error || `오류 (${res.status})`); return }
      load()
    } catch {
      setError('요청에 실패했습니다.')
    } finally {
      setCreating(false)
    }
  }

  async function toggleActive(row) {
    await fetch('/api/auth-codes', {
      method: 'PUT',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: row.id, is_active: row.is_active ? 0 : 1 }),
    })
    load()
  }

  async function deleteCode(id) {
    if (!confirm('삭제하시겠습니까?')) return
    await fetch('/api/auth-codes', {
      method: 'DELETE',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  return (
    <div className="adm-section">
      <div className="adm-section-header">
        <h2 className="adm-section-title">인증코드</h2>
      </div>

      {loading ? (
        <p className="adm-muted">불러오는 중...</p>
      ) : codes.length === 0 ? (
        <div className="adm-empty" style={{ marginBottom: '24px' }}>
          <p className="adm-muted">등록된 인증코드가 없습니다.</p>
        </div>
      ) : (
        <div className="adm-table-wrap" style={{ marginBottom: '24px' }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>코드</th>
                <th>라벨</th>
                <th>생성일</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {codes.map(row => (
                <tr key={row.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                      {row.code}
                    </span>
                  </td>
                  <td className="adm-muted" style={{ fontSize: '13px' }}>{row.label || '—'}</td>
                  <td className="adm-muted" style={{ fontSize: '12px' }}>{row.created_at?.slice(0, 10)}</td>
                  <td>
                    <button
                      className={`adm-status-badge ${row.is_active ? 'adm-published' : 'adm-draft'}`}
                      onClick={() => toggleActive(row)}
                    >
                      {row.is_active ? '활성' : '비활성'}
                    </button>
                  </td>
                  <td>
                    <button className="adm-btn-sm adm-btn-danger" onClick={() => deleteCode(row.id)}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
        {error && <p className="adm-error">{error}</p>}

        {/* UUID 자동 생성 */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            className="adm-input"
            style={{ flex: 1, minWidth: '160px' }}
            placeholder="라벨 (선택)"
            value={genLabel}
            onChange={e => setGenLabel(e.target.value)}
          />
          <button
            className="adm-btn-primary"
            disabled={creating}
            onClick={() => {
              const code = crypto.randomUUID()
              createCode(code, genLabel)
              setGenLabel('')
            }}
          >
            UUID 생성
          </button>
        </div>

        <p className="adm-muted" style={{ fontSize: '12px', textAlign: 'center' }}>또는 직접 입력</p>

        {/* 커스텀 코드 */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            className="adm-input"
            style={{ flex: 2, minWidth: '160px' }}
            placeholder="코드 문자열"
            value={customCode}
            onChange={e => setCustomCode(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && customCode.trim()) {
                createCode(customCode, customLabel)
                setCustomCode('')
                setCustomLabel('')
              }
            }}
          />
          <input
            className="adm-input"
            style={{ flex: 1, minWidth: '120px' }}
            placeholder="라벨 (선택)"
            value={customLabel}
            onChange={e => setCustomLabel(e.target.value)}
          />
          <button
            className="adm-btn-ghost"
            disabled={creating || !customCode.trim()}
            onClick={() => {
              createCode(customCode, customLabel)
              setCustomCode('')
              setCustomLabel('')
            }}
          >
            추가
          </button>
        </div>
      </div>
    </div>
  )
}
