# Web Application Project Upgrade Specification

## Objective
Upgrade your existing project into a feature-rich, secure, scalable, and production-ready web application.

### Applicable Domains
* Event
* E-commerce
* Travel
* Social
* Real Estate
* Food
* AI
* SaaS
* Or similar platforms

> **Note:** No dummy, placeholder, or *lorem ipsum* content is allowed. All data and copy must reflect real-world usage.

---

## 1. Global UI & Design Rules

### Design System Rules
* **Color Palette:** Maximum 3 primary colors (+ optional neutral colors).
* **Theme Support:** Must support **Light Mode** and **Dark Mode** with proper contrast ratios.
* **Spacing:** Consistent spacing system (4px or 8px grid).
* **Border Radius:** Unified border-radius across all components (e.g., `rounded-xl`).
* **Typography:** Consistent typography scale across headings, subheadings, and body text.
* **Reusable UI Components:**
  * Button
  * Input
  * Card
  * Badge
  * Modal
  * Table
  * Dropdown

### Responsiveness
The application must be fully responsive across **Mobile**, **Tablet**, and **Desktop**.

* **Requirements:**
  * Zero layout breaking
  * No horizontal overflow / horizontal scrollbars
  * Consistent alignment and padding/margins
  * Responsive grid system
  * Mobile-friendly navigation (hamburger menu with accessible drawer/dropdown)

### Forms Standard
All forms must include:
* Client-side validation (required fields, format/type validation)
* Server-side validation
* User-friendly error messages and success messages
* Loading states (spinner or disabled submit button)
* Accessible inputs (proper label association via `htmlFor` / `id` attributes)

**Mandatory Forms:**
1. Login
2. Registration
3. Contact
4. Create Item
5. Edit Item
6. Profile Update

---

## 2. Home / Landing Page

### Navbar
* **Layout:** Full-width, sticky or fixed position.
* **Logged Out State (Minimum 4 routes):**
  * Home
  * Explore
  * About
  * Login
* **Logged In State (Minimum 6 routes):**
  * Home
  * Explore
  * Dashboard
  * Blog
  * Profile (Dropdown)
  * Logout
* **Features:** At least one advanced dropdown (User Profile menu or Mega menu) and fully responsive mobile drawer.

### Hero Section
* **Height:** Constrained to 60–70% of the viewport height ($60\text{–}70\text{ vh}$).
* **Content:** Clear heading, subheading, and a prominent Call-to-Action (CTA) button.
* **Interactive Element (At least one):**
  * Slider / Swiper
  * Image carousel
  * Interactive animation
  * Dynamic statistics counter
* Strong visual hierarchy.

### Meaningful Sections (Minimum 8)
Sections must reflect real domain data and functionality rather than static filler:
* Features
* Categories / Topics
* Services
* Dynamic Statistics (fetched from backend)
* Testimonials / Social Proof
* Featured Items
* Blog Preview / Latest Updates
* FAQ (Accordion)
* Newsletter Subscription
* Partners / Clients
* How It Works
* Secondary Call-to-Action

### Footer
* Fully functional internal and external navigation links
* Contact details & address
* Social media links
* Copyright notice
* Zero dead or broken links (`#` placeholders not allowed)

---

## 3. Core Listing / Card Section

### Card Structure
Each card must display:
* Image (optimized with fallback)
* Title
* Short description
* Meta information (e.g., price, date, rating, location)
* "View Details" button

### Card Specifications
* Equal height and width across rows
* Consistent border radius and elevation/shadows
* Uniform internal padding and alignment
* **Desktop Grid:** 4 cards per row
* Responsive grid layout adapting smoothly down to 1 column on mobile
* **Skeleton Loader:** Displayed during data fetching states
* **Data Source:** Dynamic API integration (no hardcoded mock arrays)

---

## 4. Details Page

> Must be publicly accessible without requiring mandatory authentication.

* **Media Section:** Multiple images presented through an image gallery, carousel, or thumbnail slider.
* **Content Sections:**
  * Detailed description / overview
  * Key specifications / attributes table or badges
  * Reviews / ratings breakdown (if applicable)
  * Related items / recommendations slider or grid

---

## 5. Listing / Explore Page

Must include:
* Full-text search bar
* Minimum 2 filter dimensions (e.g., category, price range, rating, location, date)
* Multi-option sorting (e.g., newest, price low-to-high, rating high-to-low)
* Pagination or infinite scrolling
* Backend-driven query execution (filtering/sorting handled via API query params)

---

## 6. Authentication & Authorization

### Features
* Dedicated Login and Registration pages
* Client and server password validation
* Comprehensive error handling (e.g., duplicate user, invalid credentials)
* JWT-based authentication (secure cookie or header transport)
* Client-side route protection & server-side role middleware
* User Roles: `User`, `Admin`

### Authentication Additions
* **Demo Login:** One-click auto-fill credentials for quick evaluation (both User and Admin)
* **Security:** Password hashing with `bcrypt` (salt rounds $\ge 10$)
* **Session Lifecycle:** Proper token expiration handling and graceful re-authentication
* **Social Login (Optional Bonus):** Google OAuth integration

---

## 7. Role-Based Dashboard

### Navigation Menus
* **User Sidebar (Minimum 4 items):**
  * Overview
  * My Items
  * Profile
  * Settings
* **Admin Sidebar (Minimum 6 items):**
  * Overview
  * Manage Users
  * Manage Items
  * Reports
  * Categories
  * Settings

### Dashboard Requirements
1. **Dynamic Metric Cards:** Total items, total users, revenue/activity (live database queries).
2. **Interactive Visualizations:**
   * Bar Chart
   * Line Chart
   * Pie / Donut Chart
   * *Tools:* Chart.js, Recharts, or ApexCharts with live dataset mapping.
3. **Data Tables:**
   * Server-side or robust client-side pagination
   * Search and filter controls
   * Column sorting
   * Action triggers (Edit, Delete, View modal/page)
4. **Profile Page:**
   * Editable user fields
   * Profile avatar upload/preview
   * Password change flow

---

## 8. Additional Pages (Minimum 3 Required)

Select at least 3 distinct pages:
* About Us
* Contact Us
* Blog / Articles
* Help & Support / Documentation
* Privacy Policy
* Terms & Conditions

### Contact Page Requirements
* Functional inquiry form
* Direct database persistence for submitted messages
* Field validation, feedback state, and email format verification

---

## 9. Backend Architecture

### Tech Stack
* **Runtime / Framework:** Node.js + Express
* **Database:** MongoDB (via Mongoose ODM)

### Directory Structure
```text
server/
├── index.js
├── routes/
├── controllers/
├── middleware/
├── models/
└── config/
```

### Architectural Principles
* **Modularity:** Separation of concerns (Routes $\rightarrow$ Controllers $\rightarrow$ Services/Models)
* **Error Handling:** Centralized async error handling middleware
* **HTTP Standards:** Semantic status codes (`200`, `201`, `400`, `401`, `403`, `404`, `500`)
* **Data Modeling:** Well-structured schemas with indexes and referenced relationships
* **Security Measures:**
  * Password hashing (`bcrypt`)
  * Request payload validation (`Joi` or `Zod`)
  * CORS whitelist configuration
  * Role-based access control (RBAC) middleware

---

## 10. Performance Optimization

* Image optimization (compressed formats like WebP, proper dimensions)
* Lazy loading for off-screen images and heavy route components
* Code splitting (React `lazy` / `Suspense` or Next.js dynamic imports)
* Memoization strategies to prevent redundant re-renders (`useMemo`, `useCallback`)
* Production build bundle optimization

---

## 11. Code Quality Standards

* Clean, modular, and organized folder hierarchy
* Highly reusable component architecture
* Custom React hooks for repeated stateful logic
* Environment variable isolation (`.env` files; secrets excluded from Git)
* Zero debugging statements (`console.log`, `debugger`) in production builds
* Semantic, descriptive Git commit history

---

## 12. Deployment Requirements

* **Frontend:** Deployed on Vercel, Netlify, or equivalent.
* **Backend:** Deployed on Render, Railway, VPS, or equivalent.
* **Production Integrity:**
  * Validated production environment variables
  * Verified live domain connectivity (HTTPS enabled)
  * Absolute removal of `localhost` endpoint references in production builds

---

## 13. Final Submission Deliverables

```text
Project Submission Summary:
├── Live Website URL: <URL>
├── GitHub Repository: <URL>
│   ├── Frontend Source Code
│   └── Backend Source Code
├── Demo Credentials:
│   ├── User:
│   │   ├── Email: user@example.com
│   │   └── Password: <password>
│   └── Admin:
│       ├── Email: admin@example.com
│       └── Password: <password>
└── Documentation: Comprehensive README.md
```