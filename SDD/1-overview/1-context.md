# 1. Context

## 1.1 Background
FamilySearch hosts a large, shared, free family tree. Its own interface is dense and exposes many features. FamilySearch Visualizer is a small companion app that presents the tree in a simple, readable, progressively detailed way, starting from the signed-in user.

## 1.2 Problem statement
*(Assumption – confirm wording)* Users who only want to *see* their family structure must navigate a feature-heavy UI. They need a compact view that starts at themselves and grows one step at a time.

## 1.3 Stakeholders
| Stakeholder | Interest |
|-------------|----------|
| End user (hobbyist genealogist) | Quick, readable view of their own tree |
| Maintainer (h-ssiqueira) | Low-cost hosting, maintainable code base |
| FamilySearch | API provider; enforces throttling |
| Google | Identity provider behind FamilySearch's login (no direct integration from the app) |

## 1.4 Scope
**In scope**
- Sign in with Google through FamilySearch's identity service.
- Read the current user and relatives' details from FamilySearch.
- Render three tree views (see [objective](2-objective.md)).

**Out of scope (v1)**
- Editing any FamilySearch data (the app is read-only).
- Records, photos, sources, memories, ordinances.
- Server-side storage, user accounts of our own, sharing links.
- Non-FamilySearch data sources / GEDCOM import.

## 1.5 External systems
| System | Role | Notes |
|--------|------|-------|
| FamilySearch Identity (`ident.familysearch.org`) | Google login (`/oauth2/authorization/google`); creates the session/token | How the token reaches the SPA is unverified (OQ-21) |
| FamilySearch API | `users/current`, person details | Per-user throttling (HTTP 429 + `Retry-After`) |
| GitHub Pages / Actions | Hosting / CI-CD | Static files only |

## 1.6 Constraints
- No backend: every call is made from the browser; no secret can be kept.
- Authentication relies on the FamilySearch session token produced by the Google login address in `examples.md`; whether a page on `github.io` can receive it is unverified (OQ-21).
- GitHub Pages cannot set HTTP response headers and has no server-side routing.
- The app uses the website's internal endpoints exactly as in `examples.md` (ADR-10 not adopted); they may change without notice.
- Data belongs to FamilySearch users and may include living people: privacy by default.

## 1.7 Assumptions
- A: users already have a FamilySearch account.
- B: the visualizer is for personal use of one's own tree (no bulk/commercial extraction).
- C: modern evergreen browsers only.
