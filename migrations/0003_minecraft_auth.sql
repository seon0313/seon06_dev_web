CREATE TABLE auth_codes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  code       TEXT    NOT NULL UNIQUE,
  label      TEXT    NOT NULL DEFAULT '',
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  is_active  INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_auth_codes_active ON auth_codes(is_active);
