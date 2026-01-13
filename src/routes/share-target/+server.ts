/**
 * Share Target POST Handler
 * Feature: 006-brainstorming-moodboard
 *
 * Receives shared content from the OS (via PWA Share Target API)
 * and redirects to the share handler UI after checking authentication.
 */

import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  console.log('[Share Target] Received share request');

  try {
    // Parse the multipart form data
    const formData = await request.formData();

    // Extract shared content
    const title = formData.get('title')?.toString() || '';
    const text = formData.get('text')?.toString() || '';
    const url = formData.get('url')?.toString() || '';

    // Files (images/videos) - for Phase 2
    // const files = formData.getAll('media') as File[];

    console.log('[Share Target] Parsed data:', { title, text, url });

    // Check if user is authenticated
    // Note: session is set by authGuard hook in hooks.server.ts
    const session = locals.session;

    // Build query params for share handler
    const params = new URLSearchParams();
    if (title) params.set('title', title);
    if (text) params.set('text', text);
    if (url) params.set('url', url);

    // If not authenticated, redirect to login with return URL
    if (!session || !session.user) {
      console.log('[Share Target] User not authenticated, redirecting to login');
      const returnUrl = `/share-handler?${params.toString()}`;
      throw redirect(303, `/login?return=${encodeURIComponent(returnUrl)}`);
    }

    // User is authenticated, redirect to share handler UI
    console.log('[Share Target] User authenticated, redirecting to share handler');
    throw redirect(303, `/share-handler?${params.toString()}`);
  } catch (error) {
    // If it's a redirect, rethrow it
    if (error instanceof Response && error.status >= 300 && error.status < 400) {
      throw error;
    }

    // Log other errors and redirect to error page
    console.error('[Share Target] Error processing share:', error);
    throw redirect(303, '/dashboard?error=share_failed');
  }
};
