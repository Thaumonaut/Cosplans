import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
  console.log('[Share Handler][Server] Incoming request:', {
    path: url.pathname,
    search: url.search,
    params: Object.fromEntries(url.searchParams.entries())
  });
  // Get authenticated session
  const { session, user } = await locals.safeGetSession();

  console.log('[Share Handler][Server] Auth status:', {
    hasSession: Boolean(session),
    hasUser: Boolean(user)
  });

  // If not authenticated, redirect to login
  if (!session || !user) {
    const returnUrl = `/share-handler?${url.searchParams.toString()}`;
    console.log('[Share Handler][Server] Redirecting to login with return URL:', returnUrl);
    throw redirect(303, `/login?return=${encodeURIComponent(returnUrl)}`);
  }

  // Pass session data to the page
  return {
    session,
    user
  };
};
