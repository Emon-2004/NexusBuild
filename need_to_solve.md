# Prioritized Fix & Upgrade Action Plan (need_to_solve.md)

Based on the audit of `project_upgrade_specification.md` and the existing codebase, this document outlines what needs to be solved, categorized by execution priority from **Critical Foundation Fixes** to **Feature Additions** and **Final Polish**.

---

## 🚨 Priority 1: Critical Fixes & Broken Functionality (Immediate Blockers)

These issues currently cause broken user experiences, authentication failures, or build errors.

### 1.1 Fix RLS Policies Blocking Public Forms
* **Problem:** In `database/supabase_schema.sql`, Row Level Security (RLS) is enabled on `leads` and `applications` with `FOR ALL USING (public.is_admin())`. Anonymous guest visitors submitting the **Contact Form** or **Register Form** receive a `403 Forbidden` error.
* **Fix Required:** Add explicit unauthenticated insert policies:
  ```sql
  CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
  CREATE POLICY "Anyone can insert applications" ON public.applications FOR INSERT WITH CHECK (true);
  ```

### 1.2 Seed Default Admin Account
* **Problem:** The hardcoded `admin@reliance.com` email was removed from `AuthContext.jsx`, but no default admin user was seeded in the `clients` table with `role = 'admin'`. Attempting to log in as an administrator results in "Your account is pending approval".
* **Fix Required:** Seed an active admin user in the SQL schema and ensure demo credentials exist.

### 1.3 Add One-Click "Demo Login" Buttons
* **Problem:** `project_upgrade_specification.md` (Section 6) explicitly mandates one-click demo credentials for quick evaluation:
  * **Demo User** button (`user@example.com`)
  * **Demo Admin** button (`admin@example.com`)
* **Fix Required:** Add pre-filled button triggers in `src/Pages/Login/Login.jsx`.

### 1.4 Purge Hardcoded Single-Tenant Branding
* **Problem:** The codebase still contains dozens of hardcoded references to "Reliance Housing Ltd.", "Shamabay New Market, Narayanganj", and specific emails across `About.jsx`, `TermsOfService.jsx`, `FinancialLedger.jsx`, `AdminDashboard.jsx`, etc.
* **Fix Required:** Replace all static company strings with dynamic values from `systemSettings` context or generic defaults.

---

## 🎨 Priority 2: UI/UX Standards & Theme System

Requirements defined in **Section 1 (Global UI & Design Rules)**.

### 2.1 Implement Light / Dark Mode Toggle
* **Problem:** Specification mandates full **Light Mode** and **Dark Mode** support with proper contrast. The site is currently hardcoded to light mode with static dark hex codes.
* **Fix Required:**
  * Configure DaisyUI / Tailwind dark mode theme (`light` and `dark`).
  * Add a global theme provider and a toggle button in the Navbar.
  * Adjust card, text, and background tokens to support both themes smoothly.

### 2.2 Standardize Reusable UI Component Primitives
* **Problem:** Section 1 mandates standardized reusable components in `src/Components/UI/` or `src/Components/Common/`:
  * `Button`
  * `Input`
  * `Card`
  * `Badge`
  * `Modal`
  * `Table`
  * `Dropdown`
* **Fix Required:** Create these core reusable primitives with consistent border radius (`rounded-xl` or token-based), padding, and color states.

---

## 🏠 Priority 3: Landing Page & Listing Enhancements

Requirements defined in **Sections 2, 3, 4, and 5**.

### 3.1 Expand Home Page to $\ge 8$ Meaningful Sections
* **Problem:** The specification mandates at least 8 distinct, content-rich sections. Currently, only 5 sections exist.
* **Additions Required:**
  1. **Dynamic Statistics Counter** (live count of projects, active clients, delivered units).
  2. **Testimonials / Client Reviews Carousel**.
  3. **FAQ Accordion** (interactive collapse/expand).
  4. **Newsletter Subscription Bar** (connected to database).
  5. **Latest Market Updates / Blog Preview**.
  6. **Partners / Certifications Grid**.

### 3.2 Update Hero Section Constraints
* **Problem:** Hero height must be constrained to **60–70 vh** with at least one interactive element (image slider/swiper or interactive animation).
* **Fix Required:** Update `Home.jsx` hero container styles and add an interactive slider or stats element.

### 3.3 Listing Grid: Switch to 4 Cards Per Row
* **Problem:** Section 3 specifies **4 cards per row on desktop** with equal dimensions and skeleton loaders. Currently, the grid uses 3 columns (`lg:grid-cols-3`).
* **Fix Required:** Update `Projects.jsx` and featured listing sections to `lg:grid-cols-4`.

### 3.4 Listing Page (`/projects`): Sorting & Pagination
* **Problem:** Section 5 requires:
  * Multi-option sorting (Price: Low to High, Price: High to Low, Newest, Size).
  * Pagination or Infinite Scrolling (currently displays all items in a single view without pages).
* **Fix Required:** Implement sorting controls and pagination buttons in `Projects.jsx`.

### 3.5 Property Details Page (`/project-details/:id`)
* **Problem:** Section 4 requires:
  * Customer reviews & rating breakdown section.
  * Related items / recommendations slider or grid.
* **Fix Required:** Add reviews component and a "Similar Properties" section in `ProjectDetails.jsx`.

---

## 📊 Priority 4: Role-Based Dashboard & Interactive Visualizations

Requirements defined in **Section 7 (Role-Based Dashboard)**.

### 4.1 Install Charting Library & Add Visualizations
* **Problem:** Specification mandates live vector charts:
  * **Bar Chart** (Monthly revenue or inquiries).
  * **Line Chart** (Construction milestones or cash flow over time).
  * **Pie / Donut Chart** (Property types / sales status distribution).
* **Fix Required:**
  * Install `recharts` (or `chart.js`).
  * Integrate live charts into both **Client Dashboard** (`Overview.jsx`) and **Admin Dashboard** (`AdminDashboard.jsx`).

### 4.2 Client Dashboard Sidebar & Pages
* **Problem:** User sidebar requires at minimum:
  * `Overview`
  * `My Items` / `My Properties`
  * `Profile` (editable fields, avatar preview, password change)
  * `Settings`
* **Fix Required:** Add dedicated routes and components for Client Profile and Settings.

### 4.3 Data Table Interactivity
* **Problem:** Admin and user tables must include column sorting, search/filter inputs, pagination, and modal action triggers (Edit / Delete / View).

---

## 📰 Priority 5: Additional Pages & Route Completeness

Requirements defined in **Section 8 (Additional Pages)** and **Navbar**.

### 5.1 Implement Blog System (`/blog` and `/blog/:id`)
* **Problem:** The logged-in Navbar specification requires a **Blog** link, and the landing page requires a blog preview.
* **Fix Required:** Create `/blog` page listing real-estate market insights/news, with dynamic article detail views.

### 5.2 Clean Up Footer Links
* **Problem:** Zero dead or `#` placeholder links allowed.
* **Fix Required:** Link all social icons and footer navigation to actual routes or valid external URLs.

---

## ⚙️ Priority 6: Backend Architecture & Validation

Requirements defined in **Section 9 (Backend Architecture)**.

### 6.1 Modular Express Server Structure
* **Problem:** Currently `backend/server.js` contains route handlers inline.
* **Fix Required:** Restructure backend into:
  ```text
  backend/ (or server/)
  ├── routes/
  │   ├── auth.routes.js
  │   ├── projects.routes.js
  │   ├── leads.routes.js
  │   └── chat.routes.js
  ├── controllers/
  ├── middleware/ (auth, error handler)
  ├── config/
  └── server.js
  ```
* **Validation:** Add request validation middleware (using `Zod` or `Joi`) for login, registration, and inquiry endpoints.

---

## 🧪 Priority 7: Testing & Deployment Readiness

Requirements defined in **Sections 10, 11, and 12**.

* [ ] Fix missing `@playwright/test` package dependencies so `npm run test:e2e` passes cleanly.
* [ ] Remove all hardcoded `http://localhost:5000` or `5001` references across frontend code; use environment variable `VITE_API_URL`.
* [ ] Run `npm run lint` and clean up unused imports/variables.
* [ ] Verify production build (`npm run build`).
