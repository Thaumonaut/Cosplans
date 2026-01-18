/**
 * Character type definitions for multi-API aggregation
 * Feature: 004-bugfix-testing - User Story 3
 */

export type CharacterSource = 'myanimelist' | 'anilist' | 'igdb' | 'comicvine' | 'tmdb';

export interface ExternalCharacterData {
	source: CharacterSource;
	external_id: string;
	name: string;
	name_variants?: string[];
	series?: string;
	series_variants?: string[];
	description?: string;
	image_url?: string;
	metadata?: Record<string, unknown>;
	fetched_at: string;
}

export interface AggregatedCharacter {
	id: string;
	name: string;
	name_variants: string[];
	series: string;
	series_variants: string[];
	description: string;
	image_url?: string;
	source_apis: CharacterSource[];
	external_ids: Record<CharacterSource, string>;
	metadata: {
		confidence_score: number;
		last_updated: string;
		api_responses?: Record<CharacterSource, unknown>;
	};
	created_at: string;
	updated_at: string;
}

export interface CharacterSearchParams {
	name: string;
	series?: string;
	sources?: CharacterSource[];
	fuzzy?: boolean;
	limit?: number;
}

export interface CharacterSearchResult {
	characters: AggregatedCharacter[];
	sources_queried: CharacterSource[];
	total_results: number;
	query_time_ms: number;
}

export interface CharacterDeduplicationMatch {
	character_a: ExternalCharacterData;
	character_b: ExternalCharacterData;
	confidence_score: number;
	match_reasons: string[];
}

export interface FuzzyMatchConfig {
	name_threshold: number; // Jaro-Winkler threshold (0-1)
	series_threshold: number;
	use_name_variants: boolean;
	use_series_variants: boolean;
}

export const DEFAULT_FUZZY_CONFIG: FuzzyMatchConfig = {
	name_threshold: 0.85,
	series_threshold: 0.8,
	use_name_variants: true,
	use_series_variants: true
};



