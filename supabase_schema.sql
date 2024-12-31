-- Modify decks table to replace flashcardsurl with flashcardcontent
ALTER TABLE decks 
  DROP COLUMN IF EXISTS flashcardsurl,
  ADD COLUMN IF NOT EXISTS flashcardcontent TEXT;
