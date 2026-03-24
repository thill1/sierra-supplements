-- Run after schema deploy (e.g. drizzle-kit push) if you manage SQL manually.
-- Homepage editable copy (single row, id = 1)

CREATE TABLE IF NOT EXISTS homepage_content (
    id INTEGER PRIMARY KEY DEFAULT 1,
    data JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Blog posts managed from Admin → Blog

CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    read_time TEXT NOT NULL DEFAULT '5 min',
    body TEXT NOT NULL,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON blog_posts (published);
