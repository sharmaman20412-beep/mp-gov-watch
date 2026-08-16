# MP Gov Watch

I want to build a public transparency website for the Madhya Pradesh Government that lists every government work — from the smallest task (streetlight repair, drain cleaning, hand pump installation) to the biggest project (roads, bridges, schools, hospitals, dams) — along with its exact sanctioned budget. The core purpose is to stop corruption: if any official or contractor demands more money than the government's officially sanctioned amount for that work, citizens should be able to file a complaint directly against it.

Build the website with the following features:

1. PROJECT/WORK DIRECTORY

   - Name of the work, department (PWD, Municipal Corporation, Water Resources, Panchayat, etc.), district/block/village

   - Officially sanctioned budget (exact amount, government order/document number as proof)

   - Amount spent so far

   - Contractor/agency name and contact details

   - Start date and official deadline for completion

   - Current status: Planned / In Progress / Delayed / Completed

2. DEADLINE TRACKER

   - Progress bar/countdown for every project showing time remaining

   - Automatic red "Delayed" tag if the deadline passes and work is incomplete

3. OVERCHARGING / EXTORTION COMPLAINT SYSTEM (core feature)

   - On every project's page, a clear "Report Overcharging" button

   - Citizen can report: what work it is, how much extra money was demanded, by whom (official/contractor name if known), when, and upload photo/video/audio proof or a payment receipt

   - The system automatically compares the amount reported against the official sanctioned budget shown on that project, and flags the case as "Overcharging Alert" if the claimed demand exceeds the sanctioned amount

   - Every complaint gets a unique tracking number so the citizen can check status anytime

   - Complaint auto-routes to the concerned department officer; if no action/response within a fixed time (e.g. 7 or 15 days), it auto-escalates to the next higher authority (District Collector, Anti-Corruption Bureau, etc.)

   - Option to file the complaint anonymously for citizen safety

4. GENERAL DELAY/QUALITY COMPLAINT SYSTEM

   - Separate complaint option for work that is delayed, of poor quality, or incomplete (not just money-related)

   - Same tracking number + escalation logic applies

5. SEARCH & FILTER

   - Filter by district, department, budget range, status (delayed/completed/ongoing/overcharging alert)

   - Map view showing project locations

6. PUBLIC DASHBOARD

   - Total projects, budget sanctioned vs. spent, number delayed, number of overcharging complaints — shown with graphs/charts

   - District-wise and department-wise comparison

   - A public "corruption heat map" highlighting departments/districts with most overcharging complaints

7. ADMIN PANEL (for government officials)

   - Login to update project status, upload documents/photos of completed work

   - Respond to and resolve complaints, with mandatory reason/action logged publicly

8. CITIZEN LOGIN

   - Mobile number/Aadhaar-based OTP login

   - Dashboard to track all complaints filed by that citizen and their status

9. LANGUAGE & ACCESSIBILITY

   - Available in both Hindi and English

   - Fully mobile-responsive so people in villages can use it easily on basic smartphones

10. DATA INTEGRITY

    - All sanctioned budget data must be sourced from official government orders/tender documents (uploaded as proof, not just typed numbers)

    - Every edit to a project's budget or status is logged with timestamp and editor's name for full transparency (no silent edits allowed)

Suggested tech stack: React/Next.js frontend, Node.js or Django backend, PostgreSQL database, Google Maps/Leaflet for location mapping. The site must be secure (HTTPS, encrypted storage) since it will hold sensitive citizen and government data, and should support high traffic since it's meant for statewide public use.

Please design the full system: database schema, main page wireframes/layout, and the complaint escalation workflow in detail.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/53ca3797-de1a-42d7-9152-ba2f44a30c39).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
