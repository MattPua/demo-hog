<wizard-report>
# PostHog post-wizard report

The wizard has completed a full PostHog integration for this TanStack Start application. Here's a summary of what was added:

- **`posthog-js`, `posthog-node`, and `@posthog/react`** were installed as dependencies.
- **`PostHogProvider`** was added to `src/routes/__root.tsx`, wrapping the entire app with autocapture, session replay, and exception tracking enabled.
- **`src/utils/posthog-server.ts`** was created as a singleton PostHog Node.js client for server-side event capture in API routes.
- **Vite reverse proxy** was configured in `vite.config.ts` to proxy `/ingest/*` requests to PostHog, avoiding ad-blocker issues.
- **Environment variables** (`VITE_PUBLIC_POSTHOG_PROJECT_TOKEN`, `VITE_PUBLIC_POSTHOG_HOST`) were written to `.env`.
- **5 custom events** were instrumented across 5 files (3 client-side, 2 server-side).

| Event | Description | File |
|-------|-------------|------|
| `post_deep_view_clicked` | User clicks "Deep View" link on a post detail page | `src/routes/posts.$postId.tsx` |
| `user_json_viewed` | User clicks "View as JSON" on a user detail page | `src/routes/users.$userId.tsx` |
| `deferred_counter_incremented` | User clicks the Increment button on the deferred demo page | `src/routes/deferred.tsx` |
| `api_users_listed` | Server-side: all users fetched via GET /api/users | `src/routes/api/users.ts` |
| `api_user_fetched` | Server-side: a single user fetched via GET /api/users/:userId | `src/routes/api/users.$userId.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1615394)
- [All tracked events over time](/insights/7CD2vvZD)
- [Post deep view clicks](/insights/nBJ2mRh1)
- [User profile JSON views](/insights/p79IRGln)
- [Deferred counter interactions](/insights/uFOKQuoj)
- [API usage — users endpoints](/insights/mM98jzy7)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
