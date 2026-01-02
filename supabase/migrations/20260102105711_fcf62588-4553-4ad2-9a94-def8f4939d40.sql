-- Add DEADLIFT ΜΕ ΑΛΤΗΡΕΣ exercise to ΠΛΑΤΗ category
INSERT INTO exercises (name, category) 
VALUES ('DEADLIFT ΜΕ ΑΛΤΗΡΕΣ', 'ΠΛΑΤΗ')
ON CONFLICT DO NOTHING;