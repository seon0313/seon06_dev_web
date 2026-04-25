import { useEffect, useState, useCallback } from 'react'

const CATEGORIES = [
  { key: 'all',      label: 'All' },
  { key: 'software', label: 'Software' },
  { key: 'hardware', label: 'Hardware' },
  { key: 'service',  label: 'Service' },
]

/* ─── CONFIG — 여기만 수정하세요 ──────────────────── */
const ME = {
  name:       'Choo Yun Seon',
  initials:   'YS',
  role:       'Researcher',
  tagline:    'I build things that matter.',
  location:   'Seoul, Korea',
  email:      'seon06.dev@gmail.com',
  github:     'https://github.com/seon0313',
  bio: [
    '문제를 명확히 이해하고, 단순하고 견고한 해결책을 만드는 데 집중합니다.',
    'Python, Java, Kotlin, C 등 다양한 언어를 다루며, 좋은 코드와 좋은 사용자 경험 모두를 중요하게 생각합니다.',
  ],
  skills: [
    { label: 'Language', items: 'Python · Java · Kotlin · C' },
    { label: 'Contact',  items: 'seon06.dev@gmail.com' },
    { label: 'GitHub',   items: 'github.com/seon0313' },
  ],
}
/* ───────────────────────────────────────────────────── */

export default function App() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ minHeight: '100dvh' }}>
      <Nav initials={ME.initials} github={ME.github} />
      <Hero visible={visible} me={ME} />
      <Projects />
      <About me={ME} />
      <Footer initials={ME.initials} />
    </div>
  )
}

/* ─── Nav ────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'About',    href: '#about',                    external: false, mobileHide: true },
  { label: 'Projects', href: '#projects',                 external: false, mobileHide: true },
  { label: 'Blog',     href: 'https://blog.seon06.dev',   external: true  },
]

function Nav({ initials, github }) {
  return (
    <nav style={styles.nav} className="c-nav">
      <span style={styles.navLogo}>{initials}</span>
      <div style={styles.navLinks} className="c-nav-links">
        {NAV_LINKS.map(({ label, href, external, mobileHide }) => (
          <a
            key={label}
            href={href}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            style={styles.navLink}
            className={mobileHide ? 'c-nav-link-hide' : ''}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >{label}</a>
        ))}
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...styles.navLink, ...styles.navCta }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--text)'; e.currentTarget.style.color = 'var(--bg)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text)' }}
        >GitHub ↗</a>
      </div>
    </nav>
  )
}

/* ─── Hero ───────────────────────────────────────────── */
function Hero({ visible, me }) {
  return (
    <section style={styles.hero} className="c-hero-section">
      {/* 배경 장식 */}
      <div style={styles.heroBgCircle} />

      <div style={styles.heroInner} className="c-hero-inner">
        {/* 좌 — 텍스트 */}
        <div style={styles.heroLeft}>
          <p style={{
            ...styles.heroLabel,
            animation: visible ? 'fadeUp 0.7s var(--ease-out) 0.1s both' : 'none',
          }}>
            ✦ {me.location}
          </p>

          <h1
            className="c-hero-name"
            style={{
              ...styles.heroName,
              animation: visible ? 'fadeUp 0.8s var(--ease-out) 0.2s both' : 'none',
            }}
          >
            {me.name.split(' ').map((word, i) => (
              <span key={i} style={{ display: 'block' }}>{word}</span>
            ))}
          </h1>

          <div style={{
            ...styles.heroRoleRow,
            animation: visible ? 'fadeUp 0.8s var(--ease-out) 0.35s both' : 'none',
          }}>
            <span style={styles.heroRoleBadge}>{me.role}</span>
          </div>

          <p style={{
            ...styles.heroTagline,
            animation: visible ? 'fadeUp 0.8s var(--ease-out) 0.45s both' : 'none',
          }}>
            {me.tagline}
          </p>

          <div style={{
            animation: visible ? 'fadeUp 0.8s var(--ease-out) 0.55s both' : 'none',
            display: 'flex', gap: '12px', flexWrap: 'wrap',
          }}>
            <a
              href="#about"
              style={styles.btnPrimary}
              onMouseEnter={e => e.currentTarget.style.background = '#1a3d5c'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
            >
              About me
            </a>
            <a
              href={`mailto:${me.email}`}
              style={styles.btnSecondary}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--text)'; e.currentTarget.style.color = 'var(--bg)'; e.currentTarget.style.borderColor = 'var(--text)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--line)' }}
            >
              Contact
            </a>
          </div>
        </div>

        {/* 우 — 카드 */}
        <div
          className="c-hero-card"
          style={{
            ...styles.heroCard,
            animation: visible ? 'fadeUp 0.9s var(--ease-out) 0.4s both' : 'none',
          }}
        >
          <div style={styles.heroCardAvatar}>
            {me.initials}
          </div>
          <div style={styles.heroCardDivider} />
          {me.skills.map(s => (
            <div key={s.label} style={styles.heroCardRow}>
              <span style={styles.heroCardLabel}>{s.label}</span>
              <span style={styles.heroCardItem}>{s.items}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 스크롤 힌트 */}
      <div style={styles.scrollHint}>
        <span style={styles.scrollText}>Scroll</span>
        <div style={styles.scrollArrow}>↓</div>
      </div>
    </section>
  )
}

/* ─── Projects ───────────────────────────────────────── */
function Projects() {
  const [active, setActive] = useState('all')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(d => setProjects(d.posts.map(p => ({
        id: p.id, category: p.category,
        title: p.title, desc: p.description, link: p.link || '',
      }))))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useCallback(
    () => active === 'all' ? projects : projects.filter(p => p.category === active),
    [active, projects]
  )()

  return (
    <section id="projects" style={styles.projects} className="c-section">
      <div style={styles.projectsInner}>
        <div style={styles.projectsHeader} className="c-proj-header">
          <div>
            <p style={styles.sectionLabel}>— Projects</p>
            <h2 style={styles.projectsHeading}>What I've built.</h2>
          </div>
          <div style={styles.tabs}>
            {CATEGORIES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                style={{
                  ...styles.tab,
                  ...(active === key ? styles.tabActive : {}),
                }}
              >{label}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>불러오는 중...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>프로젝트를 준비 중입니다.</p>
          </div>
        ) : (
          <div style={styles.projectGrid}>
            {filtered.map(p => (
              <a
                key={p.id}
                href={p.link || undefined}
                target={p.link ? '_blank' : undefined}
                rel="noopener noreferrer"
                style={{ ...styles.projectCard, ...(!p.link ? { cursor: 'default' } : {}) }}
                onMouseEnter={e => { if (p.link) e.currentTarget.style.borderColor = 'var(--accent)' }}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
              >
                <span style={styles.projectCatBadge}>{CATEGORIES.find(c => c.key === p.category)?.label}</span>
                <h3 style={styles.projectTitle}>{p.title}</h3>
                <p style={styles.projectDesc}>{p.desc}</p>
                {p.link && <span style={styles.projectArrow}>↗</span>}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ─── About ──────────────────────────────────────────── */
function About({ me }) {
  return (
    <section id="about" style={styles.about} className="c-section">
      <div style={styles.aboutInner} className="c-about-inner">
        <div style={styles.aboutLeft}>
          <p style={styles.sectionLabel}>— About</p>
          <h2 style={styles.aboutHeading}>
            Nice to<br />
            <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>meet you.</em>
          </h2>
        </div>

        <div style={styles.aboutRight} className="c-about-right">
          {me.bio.map((para, i) => (
            <p key={i} style={{ ...styles.aboutPara, ...(i > 0 ? { marginTop: '1.2em' } : {}) }}>
              {para}
            </p>
          ))}

          <div style={styles.aboutContact}>
            <a
              href={`mailto:${me.email}`}
              style={styles.contactLink}
              className="c-contact-link"
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}
            >
              {me.email} ↗
            </a>
            <a
              href={me.github}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.contactLink}
              className="c-contact-link"
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Footer ─────────────────────────────────────────── */
function Footer({ initials }) {
  return (
    <footer style={styles.footer} className="c-footer">
      <span style={styles.footerLogo}>{initials}</span>
      <span style={styles.footerCopy}>© {new Date().getFullYear()} · Built with React + Cloudflare Pages</span>
    </footer>
  )
}

/* ─── Styles ─────────────────────────────────────────── */
const styles = {
  /* Nav */
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 48px',
    backdropFilter: 'blur(12px)',
    background: 'rgba(247,246,242,0.85)',
    borderBottom: '1px solid var(--line)',
  },
  navLogo: {
    fontFamily: 'var(--font-display)',
    fontSize: '22px',
    fontWeight: 600,
    letterSpacing: '0.05em',
    color: 'var(--text)',
  },
  navLinks: { display: 'flex', alignItems: 'center', gap: '8px' },
  navLink: {
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    fontWeight: 400,
    color: 'var(--text-muted)',
    padding: '6px 14px',
    transition: 'color 0.2s',
  },
  navCta: {
    color: 'var(--text)',
    border: '1px solid var(--line)',
    borderRadius: '100px',
    transition: 'background 0.2s, color 0.2s',
  },

  /* Hero */
  hero: {
    position: 'relative',
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '120px 48px 80px',
    overflow: 'hidden',
  },
  heroBgCircle: {
    position: 'absolute',
    top: '-10%', right: '-5%',
    width: '600px', height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  heroInner: {
    maxWidth: '1100px', margin: '0 auto', width: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '60px',
    alignItems: 'center',
  },
  heroLeft: { display: 'flex', flexDirection: 'column', gap: '24px' },
  heroLabel: {
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    fontWeight: 500,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
  },
  heroName: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(64px, 8vw, 108px)',
    fontWeight: 300,
    lineHeight: 1.0,
    letterSpacing: '-0.02em',
    color: 'var(--text)',
  },
  heroRoleRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  heroRoleBadge: {
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    fontWeight: 500,
    padding: '5px 14px',
    borderRadius: '100px',
    background: 'var(--accent-soft)',
    color: 'var(--accent)',
    letterSpacing: '0.03em',
  },
  heroTagline: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(20px, 2.5vw, 28px)',
    fontWeight: 300,
    fontStyle: 'italic',
    color: 'var(--text-muted)',
    lineHeight: 1.4,
  },

  /* Buttons */
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center',
    fontFamily: 'var(--font-body)',
    fontSize: '14px', fontWeight: 500,
    padding: '12px 28px',
    borderRadius: '100px',
    background: 'var(--accent)',
    color: '#fff',
    transition: 'background 0.2s',
    cursor: 'pointer',
  },
  btnSecondary: {
    display: 'inline-flex', alignItems: 'center',
    fontFamily: 'var(--font-body)',
    fontSize: '14px', fontWeight: 400,
    padding: '11px 28px',
    borderRadius: '100px',
    border: '1px solid var(--line)',
    color: 'var(--text)',
    transition: 'background 0.2s, color 0.2s, border-color 0.2s',
    cursor: 'pointer',
  },

  /* Hero Card */
  heroCard: {
    width: '260px',
    background: 'var(--bg-card)',
    border: '1px solid var(--line)',
    borderRadius: '20px',
    padding: '28px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 4px 32px rgba(0,0,0,0.06)',
    flexShrink: 0,
  },
  heroCardAvatar: {
    width: '52px', height: '52px',
    borderRadius: '14px',
    background: 'var(--accent)',
    color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    fontSize: '20px', fontWeight: 600,
    marginBottom: '4px',
  },
  heroCardDivider: {
    height: '1px',
    background: 'var(--line)',
    margin: '4px 0',
  },
  heroCardRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  heroCardLabel: {
    fontFamily: 'var(--font-body)',
    fontSize: '10px',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--text-muted)',
  },
  heroCardItem: {
    fontFamily: 'var(--font-body)',
    fontSize: '12.5px',
    fontWeight: 400,
    color: 'var(--text)',
    lineHeight: 1.5,
  },

  /* Scroll hint */
  scrollHint: {
    position: 'absolute',
    bottom: '36px', left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '6px',
    color: 'var(--text-muted)',
  },
  scrollText: {
    fontFamily: 'var(--font-body)',
    fontSize: '11px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  scrollArrow: {
    fontSize: '16px',
    animation: 'scrollBob 1.8s ease-in-out infinite',
  },

  /* Projects */
  projects: {
    padding: '120px 48px',
    borderTop: '1px solid var(--line)',
  },
  projectsInner: {
    maxWidth: '1100px', margin: '0 auto',
    display: 'flex', flexDirection: 'column', gap: '52px',
  },
  projectsHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '24px',
  },
  projectsHeading: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(40px, 4.5vw, 60px)',
    fontWeight: 300,
    lineHeight: 1.1,
    letterSpacing: '-0.01em',
    marginTop: '12px',
  },
  tabs: {
    display: 'flex', gap: '6px', flexWrap: 'wrap',
  },
  tab: {
    fontFamily: 'var(--font-body)',
    fontSize: '13px', fontWeight: 400,
    padding: '6px 16px',
    borderRadius: '100px',
    border: '1px solid var(--line)',
    background: 'transparent',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all 0.18s',
  },
  tabActive: {
    background: 'var(--text)',
    color: 'var(--bg)',
    borderColor: 'var(--text)',
  },
  projectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  projectCard: {
    position: 'relative',
    display: 'flex', flexDirection: 'column', gap: '10px',
    padding: '28px 24px',
    background: 'var(--bg-card)',
    border: '1px solid var(--line)',
    borderRadius: '16px',
    transition: 'border-color 0.2s',
    textDecoration: 'none', color: 'inherit',
  },
  projectCatBadge: {
    fontFamily: 'var(--font-body)',
    fontSize: '10px', fontWeight: 500,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    color: 'var(--accent)',
  },
  projectTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '22px', fontWeight: 400,
    letterSpacing: '-0.01em',
    color: 'var(--text)',
  },
  projectDesc: {
    fontFamily: 'var(--font-body)',
    fontSize: '14px', fontWeight: 300,
    lineHeight: 1.7,
    color: 'var(--text-muted)',
    flex: 1,
  },
  projectArrow: {
    fontFamily: 'var(--font-body)',
    fontSize: '16px',
    color: 'var(--accent)',
    marginTop: '8px',
  },
  emptyState: {
    padding: '80px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px dashed var(--line)',
    borderRadius: '16px',
  },
  emptyText: {
    fontFamily: 'var(--font-body)',
    fontSize: '15px',
    color: 'var(--text-muted)',
  },

  /* About */
  about: {
    padding: '120px 48px',
    borderTop: '1px solid var(--line)',
  },
  aboutInner: {
    maxWidth: '1100px', margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1.4fr',
    gap: '80px',
    alignItems: 'start',
  },
  aboutLeft: { display: 'flex', flexDirection: 'column', gap: '20px' },
  sectionLabel: {
    fontFamily: 'var(--font-body)',
    fontSize: '12px',
    fontWeight: 500,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
  },
  aboutHeading: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(48px, 5vw, 72px)',
    fontWeight: 300,
    lineHeight: 1.1,
    letterSpacing: '-0.01em',
  },
  aboutRight: { paddingTop: '40px' },
  aboutPara: {
    fontFamily: 'var(--font-body)',
    fontSize: '17px',
    fontWeight: 300,
    lineHeight: 1.8,
    color: '#333330',
  },
  aboutContact: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '40px',
    paddingTop: '32px',
    borderTop: '1px solid var(--line)',
  },
  contactLink: {
    fontFamily: 'var(--font-display)',
    fontSize: '22px',
    fontWeight: 300,
    color: 'var(--text)',
    transition: 'color 0.2s',
    lineHeight: 1.5,
  },

  /* Footer */
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 48px',
    borderTop: '1px solid var(--line)',
  },
  footerLogo: {
    fontFamily: 'var(--font-display)',
    fontSize: '18px',
    fontWeight: 600,
    letterSpacing: '0.05em',
  },
  footerCopy: {
    fontFamily: 'var(--font-body)',
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
}
