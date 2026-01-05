/**
 * API aggregation and deduplication utilities
 * Feature: 004-bugfix-testing - User Story 3
 * Implements fuzzy matching using Jaro-Winkler algorithm
 */

import { compareTwoStrings } from 'string-similarity';
import type {
	ExternalCharacterData,
	AggregatedCharacter,
	CharacterDeduplicationMatch,
	FuzzyMatchConfig,
	DEFAULT_FUZZY_CONFIG,
	CharacterSource
} from '$lib/types/character';

/**
 * Calculate Jaro-Winkler similarity between two strings
 * Uses string-similarity library which implements a similar algorithm
 */
export function calculateSimilarity(str1: string, str2: string): number {
	const normalized1 = str1.toLowerCase().trim();
	const normalized2 = str2.toLowerCase().trim();
	return compareTwoStrings(normalized1, normalized2);
}

/**
 * Check if two strings match within a threshold
 */
export function fuzzyMatch(
	str1: string,
	str2: string,
	threshold: number = 0.85
): boolean {
	return calculateSimilarity(str1, str2) >= threshold;
}

/**
 * Find best match from a list of candidates
 */
export function findBestMatch(
	target: string,
	candidates: string[],
	threshold: number = 0.85
): { match: string; score: number } | null {
	let bestMatch: string | null = null;
	let bestScore = 0;

	for (const candidate of candidates) {
		const score = calculateSimilarity(target, candidate);
		if (score >= threshold && score > bestScore) {
			bestScore = score;
			bestMatch = candidate;
		}
	}

	return bestMatch ? { match: bestMatch, score: bestScore } : null;
}

/**
 * Check if two character names match (including variants)
 */
export function matchCharacterName(
	name1: string,
	variants1: string[] = [],
	name2: string,
	variants2: string[] = [],
	config: FuzzyMatchConfig
): { match: boolean; score: number; reason: string } {
	// Direct name match
	const nameScore = calculateSimilarity(name1, name2);
	if (nameScore >= config.name_threshold) {
		return { match: true, score: nameScore, reason: 'Direct name match' };
	}

	// Check variants if enabled
	if (config.use_name_variants) {
		// Check name1 against variants2
		for (const variant of variants2) {
			const score = calculateSimilarity(name1, variant);
			if (score >= config.name_threshold) {
				return { match: true, score, reason: `Name matches variant: ${variant}` };
			}
		}

		// Check name2 against variants1
		for (const variant of variants1) {
			const score = calculateSimilarity(name2, variant);
			if (score >= config.name_threshold) {
				return { match: true, score, reason: `Variant matches name: ${variant}` };
			}
		}

		// Check variants against variants
		for (const v1 of variants1) {
			for (const v2 of variants2) {
				const score = calculateSimilarity(v1, v2);
				if (score >= config.name_threshold) {
					return { match: true, score, reason: `Variant match: ${v1} ~ ${v2}` };
				}
			}
		}
	}

	return { match: false, score: nameScore, reason: 'No match found' };
}

/**
 * Check if two series names match (including variants)
 */
export function matchSeriesName(
	series1: string | undefined,
	variants1: string[] = [],
	series2: string | undefined,
	variants2: string[] = [],
	config: FuzzyMatchConfig
): { match: boolean; score: number; reason: string } {
	// If either series is undefined, consider it a weak match
	if (!series1 || !series2) {
		return { match: false, score: 0, reason: 'Series information missing' };
	}

	// Direct series match
	const seriesScore = calculateSimilarity(series1, series2);
	if (seriesScore >= config.series_threshold) {
		return { match: true, score: seriesScore, reason: 'Direct series match' };
	}

	// Check variants if enabled
	if (config.use_series_variants) {
		// Check series1 against variants2
		for (const variant of variants2) {
			const score = calculateSimilarity(series1, variant);
			if (score >= config.series_threshold) {
				return { match: true, score, reason: `Series matches variant: ${variant}` };
			}
		}

		// Check series2 against variants1
		for (const variant of variants1) {
			const score = calculateSimilarity(series2, variant);
			if (score >= config.series_threshold) {
				return { match: true, score, reason: `Variant matches series: ${variant}` };
			}
		}
	}

	return { match: false, score: seriesScore, reason: 'No series match' };
}

/**
 * Check if two character records represent the same character
 */
export function areCharactersDuplicates(
	char1: ExternalCharacterData,
	char2: ExternalCharacterData,
	config: FuzzyMatchConfig = DEFAULT_FUZZY_CONFIG
): CharacterDeduplicationMatch | null {
	const match_reasons: string[] = [];
	let total_score = 0;
	let match_count = 0;

	// Check name match
	const nameMatch = matchCharacterName(
		char1.name,
		char1.name_variants,
		char2.name,
		char2.name_variants,
		config
	);

	if (nameMatch.match) {
		match_reasons.push(nameMatch.reason);
		total_score += nameMatch.score;
		match_count++;
	} else {
		// If names don't match, not likely to be a duplicate
		return null;
	}

	// Check series match
	const seriesMatch = matchSeriesName(
		char1.series,
		char1.series_variants,
		char2.series,
		char2.series_variants,
		config
	);

	if (seriesMatch.match) {
		match_reasons.push(seriesMatch.reason);
		total_score += seriesMatch.score;
		match_count++;
	}

	// Calculate average confidence score
	const confidence_score = match_count > 0 ? total_score / match_count : 0;

	// Require both name AND series match for high confidence
	if (nameMatch.match && (seriesMatch.match || !char1.series || !char2.series)) {
		return {
			character_a: char1,
			character_b: char2,
			confidence_score,
			match_reasons
		};
	}

	return null;
}

/**
 * Deduplicate a list of external character data
 * Groups matching characters together
 */
export function deduplicateCharacters(
	characters: ExternalCharacterData[],
	config: FuzzyMatchConfig = DEFAULT_FUZZY_CONFIG
): ExternalCharacterData[][] {
	const groups: ExternalCharacterData[][] = [];
	const processed = new Set<number>();

	for (let i = 0; i < characters.length; i++) {
		if (processed.has(i)) continue;

		const group: ExternalCharacterData[] = [characters[i]];
		processed.add(i);

		// Find all matches for this character
		for (let j = i + 1; j < characters.length; j++) {
			if (processed.has(j)) continue;

			const match = areCharactersDuplicates(characters[i], characters[j], config);
			if (match && match.confidence_score >= 0.8) {
				group.push(characters[j]);
				processed.add(j);
			}
		}

		groups.push(group);
	}

	return groups;
}

/**
 * Merge multiple external character records into a single aggregated character
 */
export function mergeCharacterData(
	characters: ExternalCharacterData[]
): Omit<AggregatedCharacter, 'id' | 'created_at' | 'updated_at'> {
	if (characters.length === 0) {
		throw new Error('Cannot merge empty character list');
	}

	// Collect all unique names and variants
	const nameSet = new Set<string>();
	const seriesSet = new Set<string>();
	const sources: CharacterSource[] = [];
	const external_ids: Record<CharacterSource, string> = {} as any;
	const api_responses: Record<CharacterSource, unknown> = {} as any;

	let bestDescription = '';
	let bestImage: string | undefined;
	let totalConfidence = 0;

	for (const char of characters) {
		// Add name and variants
		nameSet.add(char.name);
		if (char.name_variants) {
			char.name_variants.forEach((v) => nameSet.add(v));
		}

		// Add series and variants
		if (char.series) {
			seriesSet.add(char.series);
			if (char.series_variants) {
				char.series_variants.forEach((v) => seriesSet.add(v));
			}
		}

		// Track source and external ID
		sources.push(char.source);
		external_ids[char.source] = char.external_id;
		if (char.metadata) {
			api_responses[char.source] = char.metadata;
		}

		// Use longest description
		if (char.description && char.description.length > bestDescription.length) {
			bestDescription = char.description;
		}

		// Use first available image (prioritize certain sources)
		if (!bestImage && char.image_url) {
			bestImage = char.image_url;
		}

		totalConfidence += 1; // Each matching source increases confidence
	}

	// Primary name is the most common or first
	const names = Array.from(nameSet);
	const primary_name = names[0];
	const name_variants = names.slice(1);

	// Primary series is the most common or first
	const seriesArray = Array.from(seriesSet);
	const primary_series = seriesArray[0] || 'Unknown';
	const series_variants = seriesArray.slice(1);

	// Calculate confidence score based on number of matching sources
	const confidence_score = Math.min(characters.length / 3, 1); // Max at 3 sources

	return {
		name: primary_name,
		name_variants,
		series: primary_series,
		series_variants,
		description: bestDescription,
		image_url: bestImage,
		source_apis: sources,
		external_ids,
		metadata: {
			confidence_score,
			last_updated: new Date().toISOString(),
			api_responses
		}
	};
}

/**
 * Fallback chain for character data
 * Try multiple APIs in order, return first successful result
 */
export async function fetchWithFallback<T>(
	fetchers: Array<() => Promise<T | null>>,
	fallbackValue: T
): Promise<T> {
	for (const fetcher of fetchers) {
		try {
			const result = await fetcher();
			if (result !== null) {
				return result;
			}
		} catch (error) {
			console.warn('Fetcher failed, trying next:', error);
			continue;
		}
	}
	return fallbackValue;
}

/**
 * Normalize character name for comparison
 */
export function normalizeCharacterName(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^\w\s]/g, '') // Remove special characters
		.replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Extract potential name variants (e.g., "John Smith" -> ["John", "Smith", "John Smith"])
 */
export function extractNameVariants(name: string): string[] {
	const variants = new Set<string>();
	variants.add(name);

	// Split by common separators
	const parts = name.split(/[,\/\(\)]/);
	parts.forEach((part) => {
		const trimmed = part.trim();
		if (trimmed) variants.add(trimmed);
	});

	// Handle "Last, First" format
	if (name.includes(',')) {
		const [last, first] = name.split(',').map((s) => s.trim());
		if (first && last) {
			variants.add(`${first} ${last}`);
		}
	}

	return Array.from(variants);
}



