# ADUJI — Video, Live & Community

A responsive React + Vite starter for an ADUJI social video experience. It includes a feed UI, creator cards, video upload flow, Supabase email/password authentication, a Live section, live chat UI, virtual gift catalogue, and a demo coin wallet.

## You do not need a terminal to preview the website

The easiest route is GitHub + Vercel:

1. Upload the **contents of this project folder** to the root of your GitHub repository. The root must show `index.html`, `package.json`, `src/`, and `supabase/` together. Do not upload only `index.html`.
2. In Vercel, import the GitHub repository. Framework preset: **Vite**. Root Directory: `./` if `index.html` and `package.json` are at the repository root. Build command: `npm run build`. Output directory: `dist`.
3. In Vercel → Project Settings → Environment Variables, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` using your Supabase project URL and publishable key. Redeploy after adding them.
4. In Supabase → SQL Editor, run the full `supabase/schema.sql` script once.
5. Open the Vercel deployment URL in your browser. You can view the website without installing anything or opening a terminal.

## Local preview is optional

If you ever choose to preview locally, Node.js is required and `npm run dev` starts Vite. This is not required for the GitHub/Vercel path above.

## Live streaming and gifts — important status

- The Live Studio and live-room UI are included, but **real camera broadcasting is not active yet**. A real streaming provider such as LiveKit, Agora, or Livepeer must be selected and its server-side credentials configured. Never put a streaming provider's secret API key in `VITE_*` variables or browser code.
- Live chat and gift database tables are included in the Supabase schema, but this frontend's chat and gift interactions are currently a local preview, not persisted to the database.
- Gifts use demo coins only. No real purchases, cash value, creator payouts, or payment processor are enabled.
- Demo feed items are illustrative, not verified creators or real live broadcasts. Uploaded video records can load from Supabase when configured.

## Supabase storage

The SQL script creates the `aduji-videos` bucket and starter RLS policies. Review storage limits, moderation, copyright controls, abuse reporting, rate limiting, and privacy settings before opening uploads to the public.

## Before public launch

Add a real streaming provider integration, persist likes/follows/comments/chat/gifts, secure coin accounting with server-side functions (never trust a browser balance), age-appropriate safety/moderation tools, report/block flows, privacy policy and terms, and load/security tests. The current demo coin balance is client-side only and can be changed by a user, so it must not be used for real-money value.
