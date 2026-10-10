CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE CHECK (singleton),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sessions_expiry_idx ON sessions (expires_at);

CREATE TABLE portfolio_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  version integer NOT NULL UNIQUE CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE UNIQUE INDEX one_active_draft_idx ON portfolio_revisions (status) WHERE status = 'draft';
CREATE UNIQUE INDEX one_active_published_idx ON portfolio_revisions (status) WHERE status = 'published';

CREATE TABLE assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL,
  object_key text NOT NULL,
  original_filename text NOT NULL,
  content_type text NOT NULL,
  byte_size bigint NOT NULL CHECK (byte_size > 0),
  etag text,
  checksum_sha256 text NOT NULL,
  width integer CHECK (width IS NULL OR width > 0),
  height integer CHECK (height IS NULL OR height > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bucket, object_key)
);

CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_id uuid NOT NULL UNIQUE REFERENCES portfolio_revisions(id) ON DELETE CASCADE,
  name text NOT NULL,
  pronouns text,
  headline text NOT NULL,
  about text NOT NULL,
  avatar_asset_id uuid REFERENCES assets(id),
  resume_asset_id uuid REFERENCES assets(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_id uuid NOT NULL REFERENCES portfolio_revisions(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('work', 'education')),
  organization text NOT NULL,
  role_or_program text NOT NULL,
  website_url text,
  logo_asset_id uuid REFERENCES assets(id),
  start_year integer NOT NULL CHECK (start_year BETWEEN 1900 AND 2200),
  start_month integer CHECK (start_month BETWEEN 1 AND 12),
  end_year integer CHECK (end_year BETWEEN 1900 AND 2200),
  end_month integer CHECK (end_month BETWEEN 1 AND 12),
  is_current boolean NOT NULL DEFAULT false,
  description text,
  sort_order integer NOT NULL CHECK (sort_order >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (NOT is_current OR (end_year IS NULL AND end_month IS NULL)),
  CHECK (end_month IS NULL OR end_year IS NOT NULL),
  CHECK (
    end_year IS NULL OR end_year > start_year OR
    (end_year = start_year AND COALESCE(end_month, 12) >= COALESCE(start_month, 1))
  )
);

CREATE INDEX experiences_revision_order_idx ON experiences (revision_id, kind, sort_order);

CREATE TABLE technologies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_id uuid NOT NULL REFERENCES portfolio_revisions(id) ON DELETE CASCADE,
  name text NOT NULL,
  normalized_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (revision_id, normalized_name)
);

CREATE TABLE profile_technologies (
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  technology_id uuid NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  sort_order integer NOT NULL CHECK (sort_order >= 0),
  PRIMARY KEY (profile_id, technology_id)
);

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_id uuid NOT NULL REFERENCES portfolio_revisions(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  project_date date,
  image_asset_id uuid REFERENCES assets(id),
  client_name text,
  project_type text,
  project_role text,
  sort_order integer NOT NULL CHECK (sort_order >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX projects_revision_order_idx ON projects (revision_id, sort_order);

CREATE TABLE project_technologies (
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  technology_id uuid NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  sort_order integer NOT NULL CHECK (sort_order >= 0),
  PRIMARY KEY (project_id, technology_id)
);

CREATE TABLE platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_id uuid NOT NULL REFERENCES portfolio_revisions(id) ON DELETE CASCADE,
  key text NOT NULL,
  name text NOT NULL,
  default_icon_asset_id uuid REFERENCES assets(id),
  sort_order integer NOT NULL CHECK (sort_order >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (revision_id, key)
);

CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_id uuid NOT NULL REFERENCES portfolio_revisions(id) ON DELETE CASCADE,
  platform_id uuid REFERENCES platforms(id),
  label_override text,
  url text NOT NULL,
  icon_asset_id uuid REFERENCES assets(id),
  sort_order integer NOT NULL CHECK (sort_order >= 0),
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX contacts_revision_order_idx ON contacts (revision_id, sort_order);

CREATE TABLE project_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  platform_id uuid REFERENCES platforms(id),
  label text,
  url text NOT NULL,
  sort_order integer NOT NULL CHECK (sort_order >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX project_links_project_order_idx ON project_links (project_id, sort_order);

CREATE FUNCTION enforce_profile_technology_revision() RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    JOIN technologies t ON t.id = NEW.technology_id
    WHERE p.id = NEW.profile_id AND p.revision_id = t.revision_id
  ) THEN
    RAISE EXCEPTION 'profile technology revision mismatch';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profile_technology_revision_trigger
BEFORE INSERT OR UPDATE ON profile_technologies
FOR EACH ROW EXECUTE FUNCTION enforce_profile_technology_revision();

CREATE FUNCTION enforce_project_technology_revision() RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM projects p
    JOIN technologies t ON t.id = NEW.technology_id
    WHERE p.id = NEW.project_id AND p.revision_id = t.revision_id
  ) THEN
    RAISE EXCEPTION 'project technology revision mismatch';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_technology_revision_trigger
BEFORE INSERT OR UPDATE ON project_technologies
FOR EACH ROW EXECUTE FUNCTION enforce_project_technology_revision();

CREATE FUNCTION enforce_contact_platform_revision() RETURNS trigger AS $$
BEGIN
  IF NEW.platform_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM platforms p
    WHERE p.id = NEW.platform_id AND p.revision_id = NEW.revision_id
  ) THEN
    RAISE EXCEPTION 'contact platform revision mismatch';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contact_platform_revision_trigger
BEFORE INSERT OR UPDATE ON contacts
FOR EACH ROW EXECUTE FUNCTION enforce_contact_platform_revision();

CREATE FUNCTION enforce_project_link_platform_revision() RETURNS trigger AS $$
BEGIN
  IF NEW.platform_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM projects project
    JOIN platforms platform ON platform.id = NEW.platform_id
    WHERE project.id = NEW.project_id AND project.revision_id = platform.revision_id
  ) THEN
    RAISE EXCEPTION 'project link platform revision mismatch';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_link_platform_revision_trigger
BEFORE INSERT OR UPDATE ON project_links
FOR EACH ROW EXECUTE FUNCTION enforce_project_link_platform_revision();
