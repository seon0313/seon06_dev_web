import { createElement, Fragment, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo, { LogoArrow } from './Logo.jsx'

const CATEGORIES = [
  { key: 'all',      label: 'all' },
  { key: 'software', label: 'software' },
  { key: 'hardware', label: 'hardware' },
  { key: 'service',  label: 'service' },
]

/* ─── CONFIG — 여기만 수정하세요 ──────────────────── */
const ME = {
  name:       'Choo Yun Seon',
  nameKo:     '추윤선',
  role:       'Researcher',
  tagline:    'I build things that matter.',
  intro:      '소프트웨어부터 하드웨어, 서비스까지 직접 만들고 운영합니다.',
  location:   'Seoul, KR',
  email:      'seon06.dev@gmail.com',
  github:     'https://github.com/seon0313',
  blog:       'https://blog.seon06.dev',
  bio: [
    '문제를 명확히 이해하고, 단순하고 견고한 해결책을 만드는 데 집중합니다.',
    'Python, Java, Kotlin, C 등 다양한 언어를 다루며, 좋은 코드와 좋은 사용자 경험 모두를 중요하게 생각합니다.',
  ],
  stack: [
    { name: 'Python', color: '#4f7bff', short: 'py' },
    { name: 'Java',   color: '#ffb547', short: 'java' },
    { name: 'Kotlin', color: '#a48bff', short: 'kt' },
    { name: 'C',      color: '#22d3ee', short: 'c' },
  ],
}
/* ───────────────────────────────────────────────────── */

export default function App() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(d => setProjects((d.posts || []).map(p => ({
        id: p.id, category: p.category,
        title: p.title, desc: p.description, link: p.link || '',
      }))))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="s-site">
      <div className="s-glow s-glow-1" aria-hidden="true" />
      <div className="s-glow s-glow-2" aria-hidden="true" />
      <Nav />
      <main id="top">
        <Hero me={ME} projectCount={loading ? null : projects.length} />
        <Projects projects={projects} loading={loading} />
        <About me={ME} />
      </main>
      <Footer />
    </div>
  )
}

/* ─── Nav ────────────────────────────────────────────── */
function Nav() {
  const [where, setWhere] = useState('home')

  useEffect(() => {
    const ids = ['about', 'projects']
    const onScroll = () => {
      const y = window.scrollY + 140
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      if (atBottom && window.scrollY > 0) { setWhere(ids[0]); return }
      const hit = ids.find(id => {
        const el = document.getElementById(id)
        return el && y >= el.offsetTop
      })
      setWhere(hit || 'home')
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="s-nav">
      <div className="s-container s-nav-inner">
        <a className="s-brand" href="#top" aria-label="seon06.dev 홈">
          <Logo size={26} />
          <span>seon06<em>.dev</em></span>
          <span className="s-crumb">/ <b>{where}</b></span>
        </a>
        <nav className="s-nav-links" aria-label="주요 메뉴">
          <a href="#projects" className="s-hide-sm">~/projects</a>
          <a href="#about" className="s-hide-sm">~/about</a>
          <a href={ME.blog} className="s-ext" target="_blank" rel="noopener noreferrer">blog</a>
          <a href={ME.github} className="s-gh" target="_blank" rel="noopener noreferrer">github</a>
        </nav>
      </div>
    </header>
  )
}

/* ─── Hero ───────────────────────────────────────────── */
const PROMPTS = ['whoami', 'ls ~/projects', 'cat about.md']

function useTyped(words) {
  const [text, setText] = useState(words[0])
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let w = 0, i = words[0].length, del = false, timer
    const tick = () => {
      const word = words[w]
      if (!del && i === word.length) { del = true; timer = setTimeout(tick, 2200); return }
      if (del && i === 0) { del = false; w = (w + 1) % words.length; timer = setTimeout(tick, 300); return }
      i += del ? -1 : 1
      setText(words[w].slice(0, i))
      timer = setTimeout(tick, del ? 40 : 85)
    }
    timer = setTimeout(tick, 2600)
    return () => clearTimeout(timer)
  }, [words])
  return text
}

const K = t => <span className="t-k">{t}</span>
const S = t => <span className="t-s">'{t}'</span>
const N = t => <span className="t-n">{t}</span>

function profileLines(me, projectCount) {
  const stack = me.stack.flatMap((s, i) => i ? [', ', S(s.short)] : [S(s.short)])
  return [
    [K('export const'), ' ', <span className="t-p">seon</span>, ' = {'],
    ['  name:     ', S(me.nameKo), ','],
    ['  role:     ', S(me.role), ','],
    ['  base:     ', S(me.location), ','],
    ['  stack:    [', ...stack, '],'],
    ['  projects: ', N(projectCount ?? '…'), ','],
    ['  motto:    ', S(me.tagline), ','],
    ['}'],
  ]
}

function Hero({ me, projectCount }) {
  const typed = useTyped(PROMPTS)
  const [first, ...rest] = me.name.split(' ')

  useEffect(() => {
    const onKey = e => {
      if (e.key.toLowerCase() !== 'p' || e.metaKey || e.ctrlKey || e.altKey) return
      if (/input|textarea|select/i.test(document.activeElement?.tagName || '')) return
      document.getElementById('projects')?.scrollIntoView()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <section className="s-hero">
      <div className="s-container s-hero-grid">
        <div>
          <div className="s-prompt s-rise">
            <span className="s-ps">➜</span><span className="s-path">~</span>
            <span className="s-cmd">{typed}</span><span className="s-caret" aria-hidden="true" />
          </div>
          <h1 className="s-hero-name s-rise s-d1">
            <span className="s-grad">{first}</span><br />
            <span className="s-grad">{rest.join(' ')}</span><span className="s-slash"> /</span>
          </h1>
          <p className="s-lede s-rise s-d2"><b>{me.role}</b> in Seoul.<br />{me.intro}</p>
          <div className="s-stack s-rise s-d2" aria-label="주로 쓰는 언어">
            {me.stack.map(s => (
              <span key={s.name} className="s-tag"><i style={{ background: s.color }} />{s.name}</span>
            ))}
          </div>
          <div className="s-actions s-rise s-d3">
            <a className="s-btn s-btn-primary" href="#projects">./projects <span className="s-kbd">P</span></a>
            <a className="s-btn s-btn-ghost" href="#about">contact</a>
          </div>
        </div>

        <div className="s-term s-rise s-d4" aria-label="프로필 요약">
          <div className="s-term-bar"><i /><i /><i /><span>profile.ts</span></div>
          <pre>
            {profileLines(me, projectCount).map((parts, i) => (
              <span key={i} className="s-code-line">
                <span className="s-ln">{i + 1}</span>{createElement(Fragment, null, ...parts)}
              </span>
            ))}
          </pre>
        </div>
      </div>
      <a className="s-scroll-hint" href="#projects" aria-label="프로젝트로 이동"><LogoArrow size={34} /></a>
    </section>
  )
}

/* ─── Projects ───────────────────────────────────────── */
function Projects({ projects, loading }) {
  const [active, setActive] = useState('all')
  const count = key => key === 'all' ? projects.length : projects.filter(p => p.category === key).length
  const filtered = active === 'all' ? projects : projects.filter(p => p.category === active)

  return (
    <section id="projects" className="s-section">
      <div className="s-container">
        <div className="s-sec-head">
          <div>
            <p className="s-sec-label"><span>$</span> ls ~/projects</p>
            <h2>What I&apos;ve built.</h2>
          </div>
          <div className="s-filters" role="group" aria-label="카테고리 필터">
            {CATEGORIES.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                aria-pressed={active === key}
                onClick={() => setActive(key)}
              >--{label}<span className="s-count">{loading ? '' : count(key)}</span></button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="s-empty-state">불러오는 중...</div>
        ) : (
          <div className="s-projects">
            {filtered.map(p => (
              <Link key={p.id} to={`/posts/${p.id}`} className="s-card">
                <div className="s-card-top">
                  <span className="s-cat">{p.category}</span>
                  {p.link && <span className="s-live">external ↗</span>}
                </div>
                <h3>{p.title}</h3>
                {p.desc && <p>{p.desc}</p>}
                <div className="s-card-foot">
                  <span>~/posts/{p.id}</span>
                  <span className="s-go">open →</span>
                </div>
              </Link>
            ))}
            <div className="s-card s-card-empty" aria-hidden="true">
              <span>$ touch next-project<br /><small>다음 프로젝트 준비 중</small></span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/* ─── About ──────────────────────────────────────────── */
function About({ me }) {
  const [copied, setCopied] = useState('copy')

  function copyEmail(e) {
    const target = e.currentTarget.parentElement.querySelector('dd')
    const fallback = () => {
      const r = document.createRange()
      r.selectNodeContents(target)
      const sel = window.getSelection()
      sel.removeAllRanges(); sel.addRange(r)
      setCopied('selected')
    }
    try {
      navigator.clipboard.writeText(me.email).then(() => {
        setCopied('copied')
        setTimeout(() => setCopied('copy'), 1600)
      }, fallback)
    } catch { fallback() }
  }

  return (
    <section id="about" className="s-section">
      <div className="s-container s-about">
        <div>
          <p className="s-sec-label"><span>$</span> cat about.md</p>
          <h2 className="s-about-title">Nice to<br /><span className="s-grad">meet you.</span></h2>
        </div>
        <div>
          <div className="s-bio">
            {me.bio.map((para, i) => <p key={i}>{para}</p>)}
          </div>
          <dl className="s-facts">
            <div className="s-fact">
              <dt>email</dt>
              <dd><a href={`mailto:${me.email}`}>{me.email}</a></dd>
              <button type="button" className="s-copy" onClick={copyEmail}>{copied}</button>
            </div>
            <div className="s-fact">
              <dt>github</dt>
              <dd><a href={me.github} target="_blank" rel="noopener noreferrer">{me.github.replace('https://', '')} ↗</a></dd>
              <span />
            </div>
            <div className="s-fact">
              <dt>blog</dt>
              <dd><a href={me.blog} target="_blank" rel="noopener noreferrer">{me.blog.replace('https://', '')} ↗</a></dd>
              <span />
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}

/* ─── Footer (statusline) ────────────────────────────── */
function Footer() {
  return (
    <footer className="s-statusline">
      <div className="s-container s-statusline-inner">
        <span className="s-mode">NORMAL</span>
        <span><Logo size={14} />seon06.dev</span>
        <span className="s-hide-sm">⎇ main</span>
        <span className="s-grow" />
        <span className="s-hide-sm">React · Cloudflare Pages</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  )
}
