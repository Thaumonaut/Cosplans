# Capability Spec: CAP-021 — Social Media Capture & Share Target

**Feature:** FEAT-006 (Moodboard)
**Status:** Specified
**Version:** 1.0

---

## 21.1 Intent

Allow users to seamlessly capture inspiration from external apps (Instagram, TikTok, Pinterest, YouTube) directly into their moodboards without disrupting their flow.

## 21.2 Functional Requirements

### URL Parsing & Metadata
- **Input:** URL from clipboard or share action.
- **Processing:** 
  - Detect platform (Instagram, TikTok, YouTube, Pinterest, etc.).
  - Fetch metadata (oEmbed, OpenGraph, Twitter Card).
  - Extract: Title/Caption, Thumbnail/Image, Author, Original URL.
- **Output:** A new Node on the active moodboard (or "Inbox" moodboard if none selected).
- **Fallback:** If parsing fails, create a generic "Link" node with the raw URL.

### PWA Share Target (Android)
- **Integration:** The app must register as a Web Share Target in `manifest.json`.
- **Flow:** 
  1. User clicks "Share" in external app (e.g. Instagram).
  2. Selects "Cosplans" from Android share sheet.
  3. App opens to a "Quick Capture" modal.
  4. User confirms destination moodboard (default: last used).
  5. App parses URL in background and notifies success.

### Native Share Extension (iOS - Capacitor)
- **Integration:** Use Capacitor Share Extension plugin.
- **Flow:** Similar to Android, but handled via native iOS extension that passes data to the web view.

## 21.3 Component Strategy

- **`ShareTargetHandler.svelte`**: A dedicated route or invisible component that handles incoming share intent data.
- **`QuickCaptureModal.svelte`**: A lightweight modal specifically for confirming shared content.
- **`UrlParserService.ts`**: Shared service for fetching/parsing metadata.

## 21.4 Design & UX

- **Speed is Critical:** The capture flow must be fast (< 2s interact time).
- **Offline Support:** If offline, queue the URL to be parsed later.
- **Feedback:** "Saved to [Moodboard Name]" toast notification.

## 21.5 Constraints

- **Privacy:** Do not scrape private accounts. Handle 403/401 errors gracefully.
- **Performance:** Parsing happens on server (Edge Function) to avoid CORS issues, or via client-side proxy.

## 21.6 Verification

- **Manual:** Share a text/URL from another app to Cosplans.
- **Manual:** Paste a YouTube URL into the canvas; verify it turns into a video card.
