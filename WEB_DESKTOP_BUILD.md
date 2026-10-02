# GOOD TIMES Desktop Web

This branch is the isolated desktop/web implementation of GOOD TIMES.

- Mobile/native source of truth remains in `dolodorsey/good-times-app`.
- Do not merge or copy desktop CSS back into the mobile app repository.
- Desktop web breakpoint authority: `src/features/experience/good-times-desktop-web.css`.
- Shared data remains GOOD TIMES Supabase (auth/profile/saved) + MCP Gateway Supabase (live content).
