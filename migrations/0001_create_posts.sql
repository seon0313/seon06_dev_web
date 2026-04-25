CREATE TABLE IF NOT EXISTS posts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  category    TEXT    NOT NULL DEFAULT 'software',
  description TEXT    NOT NULL DEFAULT '',
  content     TEXT    NOT NULL DEFAULT '',
  link        TEXT    NOT NULL DEFAULT '',
  published   INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_category  ON posts(category);
