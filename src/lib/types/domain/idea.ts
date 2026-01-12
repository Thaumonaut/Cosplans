export type IdeaDifficulty = "beginner" | "intermediate" | "advanced";
export type IdeaStatus = "saved" | "converted";

export interface Idea {
  id: string;
  teamId: string;
  title: string; // Required: custom title or auto-generated from character + series
  character?: string | null; // Optional: character name (e.g., "Zoro", "Spider-Man", "OC: Kai")
  series?: string | null; // Optional: series name (e.g., "One Piece", "Marvel", null for OCs)
  description?: string;
  difficulty: IdeaDifficulty;
  estimatedCost?: number; // stored in cents (e.g., 599 = $5.99) to avoid floating point errors
  images: string[];
  tags: string[];
  notes?: string;
  status: IdeaStatus;
  convertedProjectId?: string | null;
  primaryImageIndex?: number; // Index of the primary/header image (0-based, defaults to 0)
  createdAt: string;
  updatedAt: string;
}

export interface IdeaCreate {
  title?: string | null; // Optional: if not provided, will be auto-generated from character + series
  character?: string | null; // Optional: character name
  series?: string | null; // Optional: series name
  description?: string;
  difficulty: IdeaDifficulty;
  estimatedCost?: number; // stored in cents (e.g., 599 = $5.99) to avoid floating point errors
  images?: string[];
  tags?: string[];
  notes?: string;
}

export interface IdeaUpdate {
  title?: string | null;
  character?: string | null;
  series?: string | null;
  description?: string;
  difficulty?: IdeaDifficulty;
  estimatedCost?: number; // stored in cents (e.g., 599 = $5.99) to avoid floating point errors
  images?: string[];
  tags?: string[];
  notes?: string;
  status?: IdeaStatus;
  convertedProjectId?: string | null;
  primaryImageIndex?: number; // Index of the primary/header image (0-based)
}

/**
 * Generate title for an idea from character and series
 * Format: "{character} from {series} cosplay" or "{character} cosplay" or "{series} cosplay"
 * Used when user doesn't provide a custom title
 */
export function generateIdeaTitle(character?: string | null, series?: string | null): string {
  const char = character?.trim();
  const ser = series?.trim();

  if (char && ser) {
    return `${char} from ${ser} cosplay`;
  }
  if (char) {
    return `${char} cosplay`;
  }
  if (ser) {
    return `${ser} cosplay`;
  }

  return "Untitled Idea";
}

/**
 * Helper to get display title for an idea
 * For Idea objects, title is always present (required field)
 * For IdeaCreate, may need to generate if not provided
 */
export function getIdeaDisplayTitle(idea: Idea | IdeaCreate): string {
  // If custom title provided, use it
  if (idea.title?.trim()) {
    return idea.title.trim();
  }

  // For IdeaCreate, generate from character + series
  return generateIdeaTitle(idea.character, idea.series);
}
