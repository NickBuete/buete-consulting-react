# Buete Consulting API Service

This folder hosts the Express/Prisma API that powers the Buete Consulting React application.

## Getting Started

1. Copy the sample environment file and provide your local connection credentials:
   ```bash
   cp .env.example .env
   ```
   Update `DATABASE_URL` to match your Postgres instance (the React project currently connects to `localhost:5432/postgres`).

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate the Prisma client (only required after schema changes):
   ```bash
   npx prisma generate
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The API defaults to port `4000`. Adjust the `PORT` value in `.env` if you need a different port.

5. Build for production (optional):
   ```bash
   npm run build
   npm start
   ```

## Available Endpoints

All endpoints are prefixed with `/api`.

- `GET /api/clients?search=<term>` – List clients with optional search.
- `POST /api/clients` – Create a client.
- `GET /api/clients/:id` – Fetch a single client including hosting info and subscriptions.
- `PATCH /api/clients/:id` – Update a client.
- `DELETE /api/clients/:id` – Delete a client (cascades to hosting info and subscriptions).
- `GET /api/clients/:clientId/hosting` – List hosting credentials for a client.
- `POST /api/clients/:clientId/hosting` – Create a hosting credential.
- `PATCH /api/clients/:clientId/hosting/:id` – Update a hosting credential.
- `DELETE /api/clients/:clientId/hosting/:id` – Remove a hosting credential.
- `GET /api/clients/:clientId/subscriptions` – List subscriptions for a client.
- `POST /api/clients/:clientId/subscriptions` – Create a subscription.
- `PATCH /api/clients/:clientId/subscriptions/:id` – Update a subscription.
- `DELETE /api/clients/:clientId/subscriptions/:id` – Remove a subscription.
- `GET /api/users` – List users (password hashes are never returned).
- `POST /api/users` – Create a user (passwords are hashed with bcrypt).
- `GET /api/users/:id` – Fetch a user.
- `PATCH /api/users/:id` – Update user fields (including optional password rotation).
- `DELETE /api/users/:id` – Delete a user.
- `GET /api/clinics` / `POST /api/clinics` / `PATCH /api/clinics/:id` / `DELETE /api/clinics/:id` – Manage referring clinics.
- `GET /api/prescribers` / `POST /api/prescribers` / `PATCH /api/prescribers/:id` / `DELETE /api/prescribers/:id` – Manage prescribers and link them to clinics.
- `GET /api/patients?search=<term>&clientId=<id>` – Search patients (optionally scoped to a business client); plus standard CRUD at `/api/patients/:id`.
- `GET /api/medications` – Retrieve the master medication catalogue; CRUD at `/api/medications/:id`.
- `GET /api/hmr/reviews` – List HMR workflows with filters (`status`, `patientId`, `clinicId`, `prescriberId`, `search`, `includeCompleted`).
- `POST /api/hmr/reviews` – Create a new HMR review from a referral (supports optional initial medications, symptom checks, and action items).
- `GET /api/hmr/reviews/:id` – Fetch the full HMR review including patient, prescriber, clinic, meds, symptoms, action items, attachments, and recent audit trail.
- `PATCH /api/hmr/reviews/:id` – Update referral, scheduling, assessment, or outcome details.
- `POST /api/hmr/reviews/:id/medications` / `PATCH` / `DELETE` – Manage the medication list captured during the interview.
- `POST /api/hmr/reviews/:id/symptoms` – Upsert symptom check responses (dizziness, falls, etc.); `DELETE /api/hmr/reviews/:id/symptoms/:symptom` removes a response.
- `POST /api/hmr/reviews/:id/action-items` / `PATCH` / `DELETE` – Track follow-up tasks and mark them completed (auto-stamps completion time).
- `POST /api/hmr/reviews/:id/attachments` – Register supporting documents (metadata only; wire to storage later).
- `POST /api/hmr/reviews/:id/audit` – Record significant workflow changes for compliance.

## Frontend Integration Tips

- Configure your React app to send requests to the API (e.g. `http://localhost:4000/api`).
- Use the provided routes to build dashboards for clients, hosting credentials, subscriptions, and user administration.
- Validation errors return HTTP `400` with details in the response `issues` field (from Zod).
- Conflicts such as duplicate emails return HTTP `409`.
- For HMR referrals, the expected flow is:
  1. Create or select the patient (`/api/patients`) and link to an optional business client.
  2. Capture or select the prescriber and clinic (`/api/prescribers`, `/api/clinics`).
  3. Create the HMR review (`POST /api/hmr/reviews`) with referral date/reason and scheduling info.
  4. Record interview data: medications, symptom responses, medical history, goals, barriers.
  5. Add action items for follow-up and set `followUpDueAt` (e.g. for the three-month review reminder).
  6. Generate the polished report client-side using the rich data returned by `GET /api/hmr/reviews/:id` and store the rendered URL/body on the review (`PATCH /api/hmr/reviews/:id`).
  7. Mark the review as `CLAIMED` once lodged and rely on `followUpDueAt` + action items for review reminders.
- Calendar integration: persist the Google Calendar event ID in `calendarEventId` (set during scheduling). When you hook up OAuth, use this field to sync updates/cancellations without schema changes.
- Audit logging and attachments endpoints are available so you can capture regulatory traceability and link external documents once storage is in place.

## Prisma Schema

The schema mirrors the existing Postgres tables (`clients`, `hosting_info`, `subscriptions`, and `users`). If you change the database structure, update `prisma/schema.prisma` and run `npx prisma generate` again.

Key new HMR tables include `patients`, `clinics`, `prescribers`, `hmr_reviews`, `hmr_medications`, `hmr_symptoms`, `hmr_action_items`, `hmr_attachments`, and `hmr_audit_logs`, giving you a normalized structure ready for clinical workflows and reporting.
