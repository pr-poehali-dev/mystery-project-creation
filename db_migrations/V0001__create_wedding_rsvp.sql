CREATE TABLE t_p93124215_mystery_project_crea.wedding_rsvp (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  attendance VARCHAR(20) NOT NULL,
  guests_count INTEGER DEFAULT 1,
  dietary TEXT,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);