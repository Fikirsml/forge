# Git Workflow

This is the workflow we use for every ticket. It's a simplified version of
what you'll find at most product companies (trunk-based development with
short-lived feature branches).

## Branch naming

```
<type>/<ticket-number>-<short-description>
```

Examples:
- `feat/12-user-signup-endpoint`
- `fix/18-refresh-token-expiry`
- `chore/03-eslint-config`

Types: `feat`, `fix`, `refactor`, `chore`, `test`, `docs`

## Commit messages (Conventional Commits)

```
<type>(<scope>): <short summary, imperative mood>

<optional body: why, not what>
```

Examples:
- `feat(auth): add JWT refresh token rotation`
- `fix(issues): prevent duplicate issue creation on double submit`
- `test(auth): cover expired token rejection`

Imperative mood = "add X" not "added X" or "adds X". This matches how git
itself describes commits ("this commit will... add X").

Keep commits small and atomic — one logical change per commit. It's fine to
have 4-5 commits in a PR; it's not fine to have one 800-line commit called
"stuff".

## The daily flow

1. Pull latest `main`: `git checkout main && git pull`
2. Branch: `git checkout -b feat/12-user-signup-endpoint`
3. Work in small commits as you go
4. Before opening the PR, **self-review your own diff** (`git diff main`).
   Would you approve this if a teammate sent it to you?
5. Push: `git push -u origin feat/12-user-signup-endpoint`
6. Open PR against `main`, fill out the template completely
7. Wait for CI to go green
8. I review it like a senior engineer would (paste me the diff or link)
9. Address feedback as new commits (don't force-push during review —
   that erases the review history; squash at merge time instead)
10. Squash-merge into `main`, delete the branch

## Rules of thumb

- **PRs under ~400 lines changed.** If a ticket is ballooning past that,
  it's a sign the ticket should have been split — flag it and we'll break
  it down.
- **No direct commits to `main`.** Even solo, always go through a PR. This
  is the habit that matters, not the formality.
- **CI must be green before merge.** No exceptions, even for "trivial"
  fixes — this is precisely the discipline that prevents production
  incidents.
- **Write the PR description for a reviewer who has zero context.** This
  is a skill in itself and one hiring managers specifically look for when
  they browse your GitHub history.
