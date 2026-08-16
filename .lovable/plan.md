# MP Government Works Transparency Portal

A statewide public portal listing every sanctioned government work with its exact budget, deadline tracking, and a citizen complaint system for overcharging and delays.

## Phase 1 — Foundation (this build)

**Design system + shell**
- Hindi/English toggle (i18n dictionary, persisted), mobile-first layout tuned for low-end phones.
- Palette: MP government civic identity — deep indigo/saffron accent on warm neutral paper, not generic SaaS. Devanagari-capable typography (Noto Sans Devanagari + Inter-alternative sans).

**Backend (Lovable Cloud)**
- Enable Cloud (Postgres + auth + storage + server functions). Seed realistic MP demo data (districts, departments, works) via migration.

**Core pages**
- `/` Home: hero with statewide totals, search bar, district/department quick filters, recent overcharging alerts.
- `/works` Directory: filters (district, block, department, status, budget range), card/table list, sort.
- `/works/$id` Work detail: sanctioned budget + govt order document link, spent-so-far bar, contractor details, timeline/deadline countdown, auto "Delayed" tag, public edit log, "Report Overcharging" and "Report Delay/Quality" buttons.
- `/complaints/track` Track by complaint number.
- `/dashboard` Public dashboard: charts (sanctioned vs spent, delayed count, complaints by department/district) + corruption heat map.

## Phase 2 — Complaints + citizen accounts
- Complaint forms (overcharging + delay/quality), file/photo/audio upload to Cloud storage, anonymous option.
- Auto-flag "Overcharging Alert" when demanded amount exceeds sanctioned.
- Unique tracking number (e.g. `MPT-2026-000123`), status timeline, public response log.
- Citizen login (OTP via mobile) + `/my-complaints` dashboard.

## Phase 3 — Admin + escalation engine
- Role-gated admin panel (`admin`, `dept_officer`, `collector`) — roles in a separate table, never on profile.
- Update status, upload completion proof; every budget/status edit written to an immutable audit log shown publicly.
- Escalation: complaint unanswered 7 days → department head, 15 days → District Collector, 30 days → Anti-Corruption Bureau. Runs on a scheduled job + on-read check.

## Phase 4 — Map & polish
- Leaflet map view of works with status-coloured markers, district heat map layer.
- SEO, accessibility pass, performance for high traffic.

## Data model (Phase 1 tables)

```text
departments(id, name_en, name_hi, code)
districts(id, name_en, name_hi)
works(id, title_en, title_hi, department_id, district_id, block, village,
      sanctioned_amount, spent_amount, govt_order_no, govt_order_url,
      contractor_name, contractor_contact, start_date, deadline,
      completed_on, status, lat, lng, created_at)
work_audit_log(id, work_id, field, old_value, new_value, changed_by, changed_at, reason)
complaints(id, tracking_no, work_id, type, amount_demanded, accused_name,
           incident_date, description, is_anonymous, citizen_id,
           status, overcharge_flag, escalation_level, last_action_at, created_at)
complaint_evidence(id, complaint_id, file_path, kind)
complaint_actions(id, complaint_id, actor_role, action, reason, created_at)  -- public
user_roles(id, user_id, role)  -- separate table, has_role() security definer
```

Public reads (works, aggregate stats, complaint status by tracking number) go through narrow anon SELECT policies; citizen and officer data stays behind auth with RLS scoped to `auth.uid()` and role checks.

## Escalation workflow

```text
Complaint filed
  -> auto-route to department officer for that department+district
  -> officer responds (mandatory action + reason, logged publicly)
  no response in  7 days -> Level 2: Department Head
  no response in 15 days -> Level 3: District Collector
  no response in 30 days -> Level 4: Anti-Corruption Bureau (flagged publicly)
Overcharging Alert (demanded > sanctioned) starts at Level 2 immediately.
```

## Notes
- Real Aadhaar OTP verification requires a licensed UIDAI gateway; Phase 2 uses mobile-number OTP and leaves an Aadhaar hook for later.
- Demo data is clearly labelled sample data until real government orders are loaded.
