# PlanPop — Plan big. Stress zero.

> A GenAI event-planning assistant for **weddings, birthdays and community events** —
> budgets, timelines, vendor checklists and personalized ideas in under a minute.

- **Live URL:** `https://<your-project>.run.app` _(replace after deploy)_
- **Status:** production-ready (see `docs/BUILD_LOG.md` for the full build record).

---

## Problem statement & chosen vertical

Create a GenAI-powered planning assistant that helps users organize weddings, birthdays and
community events with budgets, timelines, vendor checklists and personalized ideas.

| Brief element                    | How PlanPop solves it                                                      |
| -------------------------------- | -------------------------------------------------------------------------- |
| GenAI-powered                    | Gemini (`gemini-2.5-flash`) generates the plan, ideas and chat refinements |
| Weddings / Birthdays / Community | Event-type wizard with type-specific prompts & templates                   |
| Budgets                          | AI budget split + editable tracker with overspend alerts                   |
| Timelines                        | AI milestone timeline back-scheduled from the event date                   |
| Vendor checklists                | AI vendor checklist by category with status tracking                       |
| Personalized ideas               | Themes/décor/food/activities generated from stated preferences             |
| Organize                         | Dashboard, localStorage persistence, export/share                          |

## Tech stack

React 18 + Vite + TypeScript (strict) · Zustand · plain-CSS design tokens (neobrutalism) ·
Node 20 + Express · `@google/genai` · Zod · Helmet + strict CSP · deployed as a single
container on Google Cloud Run.

## Run locally

```bash
cp .env.example .env     # then add your GEMINI_API_KEY
npm ci
npm run dev              # Vite + Express together
```

## Scripts

| Script                                  | Purpose                                                       |
| --------------------------------------- | ------------------------------------------------------------- |
| `npm run dev`                           | Vite client + Express server (concurrently)                   |
| `npm run build`                         | Build client (`dist/client`) and server (`dist/server`)       |
| `npm run start`                         | Run the production server                                     |
| `npm run lint` / `typecheck` / `format` | Static quality gates                                          |
| `npm run test` / `test:coverage`        | Unit + component + API tests                                  |
| `npm run test:e2e`                      | Playwright E2E + axe accessibility                            |
| `npm run verify`                        | Full gate: lint + format + typecheck + coverage + build + e2e |

## Deploy to Cloud Run

### Prerequisites

- Google Cloud project with billing enabled
- `gcloud` CLI installed and authenticated (`gcloud auth login`)
- Gemini API key

### Steps

```bash
# 1. Set your project
export PROJECT_ID=your-gcp-project-id
gcloud config set project $PROJECT_ID

# 2. Enable required APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com

# 3. Store the Gemini API key in Secret Manager
echo -n "YOUR_GEMINI_API_KEY" | \
  gcloud secrets create GEMINI_API_KEY --data-file=- --replication-policy=automatic

# 4. Grant Cloud Run access to the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:$(gcloud iam service-accounts list \
    --filter='displayName:Compute Engine default' --format='value(email)')" \
  --role="roles/secretmanager.secretAccessor"

# 5. Deploy (builds from Dockerfile, non-root, port 8080)
gcloud run deploy planpop \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=3 \
  --port=8080

# 6. Note the Service URL printed — that is your live URL.
```

## Documentation

- Architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Security: [`SECURITY.md`](SECURITY.md)
- Accessibility: [`docs/A11Y.md`](docs/A11Y.md)
- Decisions log: [`docs/DECISIONS.md`](docs/DECISIONS.md)
- Build log: [`docs/BUILD_LOG.md`](docs/BUILD_LOG.md)

## Google services used

Gemini API · Cloud Run · Secret Manager · Google Calendar links · Google Maps links.

## Assumptions & limitations

See [`docs/DECISIONS.md`](docs/DECISIONS.md). User data stays in the browser (localStorage) by
default; no account is required.
