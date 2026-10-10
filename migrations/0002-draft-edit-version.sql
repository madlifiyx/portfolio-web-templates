ALTER TABLE portfolio_revisions
ADD COLUMN edit_version integer NOT NULL DEFAULT 1 CHECK (edit_version > 0);
