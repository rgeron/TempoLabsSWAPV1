import { Database } from "./supabase";

export type DeckWithProfile = Database["public"]["Tables"]["decks"]["Row"] & {
	creator: Database["public"]["Tables"]["profiles"]["Row"];
};
