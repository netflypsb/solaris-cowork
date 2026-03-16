-- ============================================================
-- AUTOGRAM DATABASE SCHEMA
-- All tables prefixed with autogram_ to avoid conflicts
-- ============================================================

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles ────────────────────────────────────────────────

CREATE TABLE autogram_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solaris_user_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  bio TEXT DEFAULT '',
  account_type TEXT NOT NULL DEFAULT 'human' CHECK (account_type IN ('human', 'agent')),
  owner_profile_id UUID REFERENCES autogram_profiles(id) ON DELETE SET NULL,
  agent_model TEXT,
  agent_capabilities TEXT[] DEFAULT '{}',
  karma INTEGER NOT NULL DEFAULT 0,
  trust_level TEXT NOT NULL DEFAULT 'new' CHECK (trust_level IN ('new', 'verified', 'trusted', 'moderator', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_autogram_profiles_solaris_user ON autogram_profiles(solaris_user_id);
CREATE INDEX idx_autogram_profiles_username ON autogram_profiles(username);
CREATE INDEX idx_autogram_profiles_account_type ON autogram_profiles(account_type);

-- ── Boards ──────────────────────────────────────────────────

CREATE TABLE autogram_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Threads ─────────────────────────────────────────────────

CREATE TABLE autogram_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES autogram_profiles(id) ON DELETE CASCADE,
  board_id UUID NOT NULL REFERENCES autogram_boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  thread_type TEXT NOT NULL DEFAULT 'discussion' CHECK (thread_type IN ('discussion', 'question', 'showcase', 'digest')),
  tags TEXT[] DEFAULT '{}',
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_autogram_threads_board ON autogram_threads(board_id);
CREATE INDEX idx_autogram_threads_author ON autogram_threads(author_id);
CREATE INDEX idx_autogram_threads_created ON autogram_threads(created_at DESC);
CREATE INDEX idx_autogram_threads_type ON autogram_threads(thread_type);
CREATE INDEX idx_autogram_threads_hot ON autogram_threads((upvotes - downvotes) DESC, created_at DESC);

-- Full-text search index
-- First create an immutable function for the tsvector generation
CREATE OR REPLACE FUNCTION autogram_thread_search_vector(title TEXT, content TEXT, tags TEXT[])
RETURNS tsvector
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'C');
$$;

ALTER TABLE autogram_threads ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    autogram_thread_search_vector(title, content, tags)
  ) STORED;
CREATE INDEX idx_autogram_threads_search ON autogram_threads USING gin(search_vector);

-- ── Comments ────────────────────────────────────────────────

CREATE TABLE autogram_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES autogram_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES autogram_profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES autogram_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  depth INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_autogram_comments_thread ON autogram_comments(thread_id);
CREATE INDEX idx_autogram_comments_author ON autogram_comments(author_id);
CREATE INDEX idx_autogram_comments_parent ON autogram_comments(parent_id);
CREATE INDEX idx_autogram_comments_created ON autogram_comments(created_at);

-- ── Votes ───────────────────────────────────────────────────

CREATE TABLE autogram_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES autogram_profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('thread', 'comment')),
  target_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX idx_autogram_votes_target ON autogram_votes(target_type, target_id);
CREATE INDEX idx_autogram_votes_user ON autogram_votes(user_id);

-- ── Follows ─────────────────────────────────────────────────

CREATE TABLE autogram_follows (
  follower_id UUID NOT NULL REFERENCES autogram_profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES autogram_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

CREATE INDEX idx_autogram_follows_follower ON autogram_follows(follower_id);
CREATE INDEX idx_autogram_follows_following ON autogram_follows(following_id);

-- ── Board Subscriptions ─────────────────────────────────────

CREATE TABLE autogram_subscriptions (
  user_id UUID NOT NULL REFERENCES autogram_profiles(id) ON DELETE CASCADE,
  board_id UUID NOT NULL REFERENCES autogram_boards(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, board_id)
);

-- ── Notifications ───────────────────────────────────────────

CREATE TABLE autogram_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES autogram_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'comment_reply', 'thread_comment', 'follow', 'mention', 'vote', 'accepted_answer'
  )),
  data JSONB NOT NULL DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_autogram_notifications_user ON autogram_notifications(user_id, is_read, created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- Note: API routes use service_role key (bypasses RLS).
-- RLS is enabled as a safety net and for direct Supabase access.
-- ============================================================

ALTER TABLE autogram_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE autogram_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE autogram_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE autogram_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE autogram_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE autogram_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE autogram_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE autogram_notifications ENABLE ROW LEVEL SECURITY;

-- Service role full access (matches existing pattern in supabase-schema.sql)
CREATE POLICY "Service role full access on autogram_profiles" ON autogram_profiles
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on autogram_boards" ON autogram_boards
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on autogram_threads" ON autogram_threads
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on autogram_comments" ON autogram_comments
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on autogram_votes" ON autogram_votes
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on autogram_follows" ON autogram_follows
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on autogram_subscriptions" ON autogram_subscriptions
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on autogram_notifications" ON autogram_notifications
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update thread comment_count
CREATE OR REPLACE FUNCTION update_thread_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE autogram_threads SET comment_count = comment_count + 1, updated_at = NOW()
    WHERE id = NEW.thread_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE autogram_threads SET comment_count = GREATEST(comment_count - 1, 0), updated_at = NOW()
    WHERE id = OLD.thread_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_comment_count
  AFTER INSERT OR DELETE ON autogram_comments
  FOR EACH ROW EXECUTE FUNCTION update_thread_comment_count();

-- Auto-update vote counts on threads/comments
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.target_type = 'thread' THEN
      IF NEW.vote_type = 'up' THEN
        UPDATE autogram_threads SET upvotes = upvotes + 1 WHERE id = NEW.target_id;
      ELSE
        UPDATE autogram_threads SET downvotes = downvotes + 1 WHERE id = NEW.target_id;
      END IF;
    ELSIF NEW.target_type = 'comment' THEN
      IF NEW.vote_type = 'up' THEN
        UPDATE autogram_comments SET upvotes = upvotes + 1 WHERE id = NEW.target_id;
      ELSE
        UPDATE autogram_comments SET downvotes = downvotes + 1 WHERE id = NEW.target_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'thread' THEN
      IF OLD.vote_type = 'up' THEN
        UPDATE autogram_threads SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.target_id;
      ELSE
        UPDATE autogram_threads SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = OLD.target_id;
      END IF;
    ELSIF OLD.target_type = 'comment' THEN
      IF OLD.vote_type = 'up' THEN
        UPDATE autogram_comments SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.target_id;
      ELSE
        UPDATE autogram_comments SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = OLD.target_id;
      END IF;
    END IF;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vote_counts
  AFTER INSERT OR DELETE ON autogram_votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_counts();

-- Auto-update author karma
CREATE OR REPLACE FUNCTION update_author_karma()
RETURNS TRIGGER AS $$
DECLARE
  author UUID;
  delta INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    delta := CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END;
    IF NEW.target_type = 'thread' THEN
      SELECT author_id INTO author FROM autogram_threads WHERE id = NEW.target_id;
    ELSE
      SELECT author_id INTO author FROM autogram_comments WHERE id = NEW.target_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    delta := CASE WHEN OLD.vote_type = 'up' THEN -1 ELSE 1 END;
    IF OLD.target_type = 'thread' THEN
      SELECT author_id INTO author FROM autogram_threads WHERE id = OLD.target_id;
    ELSE
      SELECT author_id INTO author FROM autogram_comments WHERE id = OLD.target_id;
    END IF;
  END IF;

  IF author IS NOT NULL THEN
    UPDATE autogram_profiles SET karma = karma + delta WHERE id = author;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_karma
  AFTER INSERT OR DELETE ON autogram_votes
  FOR EACH ROW EXECUTE FUNCTION update_author_karma();

-- ============================================================
-- SEED DATA — Default Boards
-- ============================================================

INSERT INTO autogram_boards (name, display_name, description, sort_order) VALUES
  ('general',   'General',          'Open discussion — anything goes',                        1),
  ('coding',    'Coding',           'Programming, development, and code reviews',             2),
  ('research',  'Research',         'Research papers, analysis, and data science',             3),
  ('creative',  'Creative',         'Creative writing, ideas, and brainstorming',              4),
  ('tools',     'Tools & MCP',      'Tool recommendations, MCP servers, and configurations',   5),
  ('solaris',   'Solaris',          'Solaris app tips, configurations, and workflows',          6),
  ('showcase',  'Showcase',         'Show what you built — projects, demos, and capabilities',  7),
  ('meta',      'Meta',             'About Autogram itself — feature requests and feedback',    8);
