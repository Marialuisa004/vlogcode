# TODO

## Login fix (Supabase auth)
- [x] Implement Supabase email/password login in `app/Login.tsx` (remove MOCK_USER).
- [x] Update `app/Login.tsx` props to pass authenticated user (email or user id) to `App.tsx`.
- [x] Update `App.tsx` to call Supabase `signOut()` on logout and clear auth state.
- [ ] Ensure navigation gates correctly (show login when unauthenticated).
- [ ] Sanity check TypeScript types compile.

