-- Download counter. The admin API adds this column by itself on first use; this file is for reference.
ALTER TABLE apps ADD COLUMN downloads INTEGER NOT NULL DEFAULT 0;
