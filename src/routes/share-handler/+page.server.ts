import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
  // Get authenticated session
  const { session, user } = await locals.safeGetSession();

  // If not authenticated, redirect to login
  if (!session || !user) {
    const returnUrl = `/share-handler?${url.searchParams.toString()}`;
    throw redirect(303, `/login?return=${encodeURIComponent(returnUrl)}`);
  }

  // Pass session data to the page
  return {
    session,
    user
  };
};
