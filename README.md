# Abot-Kamay — PWD Services Digital Platform

**Abot-Kamay** is an official digital services platform for Persons with Disabilities (PWD) in **Barangay San Antonio de Padua I, Dasmariñas, Cavite**. The system centralizes PWD registration, document requests, application tracking, and barangay staff administration into a single, accessible web application.

> *"Accessible Support, Within Reach."*

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started — Running Locally](#getting-started--running-locally)
- [System Overview](#system-overview)
- [Portal Breakdown](#portal-breakdown)
  - [PWD Member Portal](#-pwd-member-portal)
  - [Barangay Staff Portal](#-barangay-staff-portal)
  - [System Administrator Portal](#-system-administrator-portal)
- [Database Architecture](#database-architecture)
- [Project Structure](#project-structure)

---

## Tech Stack

| Category | Technology |
|---|---|
| **Frontend Framework** | React 19 with TypeScript |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS v4 |
| **Animations** | Motion (Framer Motion) |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **PDF Generation** | jsPDF + html2canvas |
| **Backend / Database** | Firebase (Firestore, Authentication) |
| **Date Utilities** | date-fns |
| **Class Utilities** | clsx + tailwind-merge |
| **AI Integration** | Google Generative AI (Gemini) |

---

## Getting Started — Running Locally

### Prerequisites

Make sure the following are installed on your machine before proceeding:

- **Node.js** v18 or higher — [Download here](https://nodejs.org/)
- **npm** v9 or higher (comes with Node.js)
- **Git** — [Download here](https://git-scm.com/)
- A code editor such as **Visual Studio Code**

### Step 1 — Clone the Repository

Open your terminal (Command Prompt, PowerShell, or Terminal) and run:

```bash
git clone https://github.com/harleneee/AbotKamay.git
cd AbotKamay
```

### Step 2 — Install Dependencies

Inside the project folder, install all required packages:

```bash
npm install
```

This will install all libraries listed in `package.json` including React, Firebase, Tailwind CSS, and the PDF generation tools.

### Step 3 — Firebase Configuration

The Firebase configuration is already included in `firebase-applet-config.json` at the project root. This file connects the app to the live Firebase project (Firestore database and Authentication). **No additional setup is required** to connect to the existing database — it works out of the box.

If you wish to connect to your own Firebase project instead:

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Email/Password Authentication** under Authentication → Sign-in method.
3. Create a **Firestore Database** in production mode.
4. Copy your Firebase config and replace the contents of `firebase-applet-config.json`:

```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_PROJECT.firebaseapp.com",
  "projectId": "YOUR_PROJECT_ID",
  "storageBucket": "YOUR_PROJECT.appspot.com",
  "messagingSenderId": "YOUR_SENDER_ID",
  "appId": "YOUR_APP_ID",
  "databaseId": "YOUR_DATABASE_ID"
}
```

5. Deploy the Firestore security rules by running:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

### Step 4 — Run the Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:3000** in your browser.

### Step 5 — Build for Production (Optional)

To create an optimized production build:

```bash
npm run build
```

The compiled files will be output to the `dist/` folder, ready to deploy to any static hosting service (Firebase Hosting, Vercel, Netlify, etc.).

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server at port 3000 |
| `npm run build` | Build the app for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run TypeScript type checks |
| `npm run clean` | Delete the `dist/` build folder |

---

## System Overview

Abot-Kamay is a **role-based web application** with three distinct user types, each with their own dashboard and set of features:

| Role | Description |
|---|---|
| **PWD Member** | A registered Person with Disability who uses the platform to submit forms, track applications, and receive announcements. |
| **Barangay Staff (Kawani)** | A barangay employee who manages PWD records, reviews applications, and communicates with members. |
| **System Administrator** | A superuser with full access to all features including user management, audit logs, and system settings. |

All users authenticate through a single login page. The system automatically routes each user to their appropriate dashboard based on their assigned role stored in the Firestore database.

---

## Portal Breakdown

---

### 👤 PWD Member Portal

The PWD Member portal is designed to be simple and accessible. After logging in, a registered PWD member can access the following features:

---

#### Dashboard Overview

The first screen the member sees after login is a summary dashboard. It displays:

- **Active application count** — how many submissions are currently being processed.
- **Status breakdown** — a quick view showing how many applications are Pending, Approved, Returned, or Rejected.
- **Recent submissions** — a short list of the member's latest form submissions with their current status.

This overview gives the member an at-a-glance picture of their account activity without needing to navigate to multiple pages.

---

#### Digital Forms (Mga Digital na Form)

This is the core feature for PWD members. The platform currently supports **four official government forms** that members can fill out and submit entirely online:

**1. PWD Burial Assistance Form**
Used to apply for burial assistance provided by the barangay to PWD members or their immediate family. The member fills in the deceased's details, the relationship to the PWD, and the requesting member's information. Upon submission, the form is sent to the barangay staff for review.

**2. DOH PRPWD Registry Form (Department of Health)**
The official Department of Health Philippine Registry for Persons with Disability registration form. This is a comprehensive multi-tab form collecting:
- Personal information (name, birthdate, sex, civil status, blood type)
- Residential address
- Contact details
- Type and cause of disability (with specific subcategories)
- Educational attainment
- Employment status and occupation
- Government ID references (SSS, GSIS, Pag-IBIG/PSN, PhilHealth)
- Family background (father, mother)

This form mirrors the official DOH paper form and is submitted digitally to the system.

**3. Barangay Certificate of Burial Assistance (Sertipiko ng Tulong-Libing)**
A certificate form issued by the Barangay that formally documents the burial assistance granted. The member fills in their details and the deceased's information, and the system generates a formatted letter-style certificate that can be downloaded as a PDF.

**4. Certificate of Cancellation of PWD Membership (Sertipiko ng Pagkansela)**
Used when a PWD member needs to formally cancel their membership — for reasons such as transferring to another barangay, voluntary cancellation, or reclassification. The member selects the applicable reason and signs off on the form.

**How form submission works:**
- Each form generates a unique **ticket/reference number** in the format `AK-YYYYMMDD-XXXX` (e.g., `AK-20260518-0012`) upon submission.
- This reference number is stored in the database and linked to the member's account.
- The member is shown a success screen with their ticket number after submitting.
- All submitted forms can be viewed, downloaded as PDF, or tracked through the Application Tracking page.

---

#### Application Tracking (Mga Aplikasyon)

The Application Tracking page shows the member a **full history of all their form submissions** in a searchable, filterable table. Each row displays:

- The applicant's name and avatar initials
- The ticket/reference number
- The form type (e.g., "DOH PRPWD Registry Form")
- The date submitted
- The **current status** displayed as a color-coded badge in Filipino:
  - 🔵 **Nakabinbin** (Pending) — submitted, awaiting review
  - 🟡 **Sinusuri** (For Review) — currently being evaluated by staff
  - 🟢 **Inaprubahan** (Approved) — application has been approved
  - 🟣 **Ibinalik** (Returned) — sent back to the member for corrections
  - 🔴 **Tinanggihan** (Rejected) — application was rejected with a reason

**Available actions per record:**
- **Tingnan (View)** — opens a document preview modal showing the full formatted form as it would appear on paper, with a download-as-PDF button.
- **Burahin (Delete)** — allows the member to remove their own application record. Requires a confirmation step before deletion.

When an admin or staff member updates an application's status, the member automatically receives a **notification** inside the platform (shown in the notification bell in the top navigation bar) explaining what happened and what the next steps are.

---

#### Announcements

Members can view official announcements posted by the barangay. These may include event schedules, reminders, policy updates, or important news relevant to PWD members. Announcements are displayed chronologically.

---

#### Profile and Settings

The member can view and update their personal profile information including their name, contact number, address, and demographic details. This information is stored in Firestore and is referenced when auto-filling certain form fields.

---

### 🏢 Barangay Staff Portal

Barangay Staff members (Kawani) have an elevated set of permissions compared to regular members. They can access all member-facing features plus a range of administrative tools for managing the barangay's PWD program.

---

#### Dashboard Overview (Staff)

The staff overview dashboard is more detailed than the member version. It includes:

- **Real-time statistics** — total number of applications broken down by status.
- **Recent application list** — the latest submissions from all members, not just their own.
- **Quick action shortcuts** to the most commonly used pages.

---

#### PWD Member Directory

This is the master registry of all registered PWD members in the barangay. Staff can:

- **View all PWD records** — a paginated table listing every registered member with their name, PWD ID number, disability type, contact number, barangay, and verification status.
- **Filter by status** — tabs for All Records, Verified, Pending, In Review, and Deceased.
- **Search** — by member name or PWD ID number.
- **Add a new PWD record** — opens a 6-tab form modal to enter comprehensive member data:
  - *Personal* — names, birthdate, sex, civil status, blood type
  - *Contact* — phone number, email, and full address
  - *Disability* — type and cause of disability
  - *Employment* — educational attainment, employment status, occupation
  - *Family & IDs* — SSS, GSIS, PhilHealth, Pag-IBIG numbers, guardian information
  - *System* — PWD ID number, registration date, record status
- **Edit an existing record** — same 6-tab form pre-filled with the member's current data.
- **View a member's profile** — read-only full-detail view.
- **Delete a record** — permanent deletion with a confirmation prompt.
- **Export to CSV** — downloads the entire directory as a CSV file for offline record-keeping.

---

#### Application Management (Mga Rekord ng Aplikasyon)

Staff can view and act on **all applications submitted by all members** in the system. The table is searchable and filterable by status. For each application, staff can:

- **Tingnan (View)** — opens the full formatted document preview.
- **Suriin (Review)** — opens the Review modal where staff selects an action:
  - *Sinusuri* — Mark as For Review (actively being evaluated)
  - *Inaprubahan* — Approve the application
  - *Ibinabalik* — Return to member for correction (requires a written reason)
  - *Tinanggihan* — Reject the application (requires a written reason)
  - Once saved, the member is **automatically notified** via the notification system.
- **Burahin (Delete)** — remove a record with confirmation.

---

#### Requirements Verification

A dedicated page for verifying the supporting documents attached to an application. Staff can work through a checklist of required documents (e.g., medical certificate, proof of residency) and mark each as verified.

---

#### Announcements Management

Staff can **create and manage announcements** that are visible to all members. This is used to communicate events, reminders, and important updates to the PWD community.

---

#### Reports

The Reports page provides a visual analytics dashboard with charts and statistics about the PWD program, including application trends, disability type breakdowns, and service utilization rates. Built with the Recharts library.

---

#### Help & Support

A reference page with guides and contact information for system support.

---

### 🔐 System Administrator Portal

System Administrators have all the same access as Barangay Staff, plus exclusive tools for managing the platform itself.

---

#### User Management (Pamamahala ng Gumagamit)

This page is **exclusive to administrators** and is used to manage all user accounts in the system. The admin can:

- **View all users** — a table listing every registered user with their name, role (Admin, Staff, or Member), email, contact number, status, and account creation date.
- **Filter by role** — tabs for All Users, Admins, Staff, and Members.
- **Search** — by name or email.
- **View a user's security profile** — a side panel showing the selected user's complete account details including role badge, email, status, demographic information, contact details, and account timestamps.
- **Add a new user (Bagong Gumagamit)** — the admin can create brand-new admin or staff accounts directly from the dashboard. This is critical because admin and staff accounts **cannot self-register** through the public page — they can only be granted access by an existing administrator. The process:
  - Admin selects the role: System Admin or Kawani ng Barangay
  - Fills in the new user's name, email, password, and optional contact number
  - The system creates the Firebase Authentication account and the corresponding Firestore user document simultaneously, without logging out the current admin session (using a secondary Firebase app instance)
- **Deactivate a user** — marks a user account as inactive to revoke access without deleting their data.

---

#### Audit Logs

A chronological, append-only log of all significant actions performed in the system — including form submissions, status changes, user creation, and record deletions. Each entry records the action type, the user who performed it, and the timestamp. This provides accountability and a complete paper trail of all system activity.

---

#### Settings

Profile and account settings page where the administrator can update their own personal information stored in Firestore.

---

## Database Architecture

Abot-Kamay uses **Google Cloud Firestore**, a NoSQL document database, as its sole backend data store. There is no separate server or REST API — the React frontend communicates directly with Firestore using the Firebase SDK, with access controlled by security rules deployed from `firestore.rules`.

### Firestore Collections

The database is organized into the following top-level collections:

---

#### `users`

Stores the profile and role of every registered user in the system.

| Field | Type | Description |
|---|---|---|
| `uid` | string | Firebase Authentication UID (same as the document ID) |
| `name` | string | Full name of the user |
| `email` | string | Login email address |
| `role` | `'admin' \| 'staff' \| 'member'` | Determines which portal and features are accessible |
| `contactNumber` | string | Phone number |
| `address` | string | Home address |
| `age` | string | Age |
| `gender` | string | Gender |
| `birthdate` | string | Date of birth |
| `avatarUrl` | string | Profile photo URL |
| `status` | `'active' \| 'deactivated'` | Account status |
| `createdAt` | Timestamp | Account creation time |
| `updatedAt` | Timestamp | Last profile update time |

**How it is used:** When a user logs in, `onAuthStateChanged` fires and the app fetches this document using the authenticated user's UID. The `role` field determines which sidebar navigation items and dashboard pages are rendered. Admin-created accounts (staff and admin roles) are written here by the User Management page using a secondary Firebase app instance so the current admin session is not interrupted.

---

#### `pwd_profiles`

The master directory of all PWD members registered with the barangay.

| Field | Type | Description |
|---|---|---|
| `pwdNumber` | string | Official PWD ID number |
| `firstName`, `middleName`, `lastName` | string | Full legal name |
| `disabilityType` | string | Category of disability |
| `disabilityCause` | string | Cause of disability |
| `contactNumber` | string | Phone number |
| `barangay`, `city`, `province` | string | Address broken down by level |
| `dob` | string | Date of birth |
| `sex` | string | Sex |
| `civilStatus` | string | Marital status |
| `educationalAttainment` | string | Highest education completed |
| `employmentStatus` | string | Current employment status |
| `bloodType` | string | Blood type |
| `idReference` | object | SSS, GSIS, PSN, PhilHealth numbers |
| `familyBackground` | object | Guardian name and contact |
| `dateRegistered` | string | Date added to the system |
| `status` | string | `Verified`, `Pending`, `In Review`, or `Deceased` |

**How it is used:** Read and written exclusively by admin and staff (enforced by `isStaff()` in Firestore security rules). The PWD Profiles page uses a real-time `onSnapshot` listener so the directory table updates instantly when any staff member adds, edits, or deletes a record — no page refresh needed.

---

#### `applications`

Every form submission made by PWD members is stored as a single document in this collection.

| Field | Type | Description |
|---|---|---|
| `applicationId` | string | Same as the Firestore document ID |
| `referenceNumber` | string | Human-readable ticket number, e.g. `AK-20260518-0012` |
| `userId` | string | UID of the member who submitted |
| `applicantName` | string | Name of the applicant |
| `applicantEmail` | string | Email of the applicant |
| `formType` | string | One of: `pwd_burial_assistance`, `doh_prpwd_registry`, `burial_assistance_certificate`, `cancellation_certificate` |
| `formTitle` | string | Human-readable form name |
| `formData` | object | Full serialized JSON of all form field values |
| `status` | string | `draft`, `pending`, `for_review`, `approved`, `returned`, `rejected`, or `completed` |
| `remarks` | string | Staff notes or reason for rejection/return |
| `reviewedBy` | string | Name of the staff member who reviewed it |
| `reviewedAt` | Timestamp | When the review decision was made |
| `submittedAt` | Timestamp | When the form was originally submitted |
| `updatedAt` | Timestamp | Last update timestamp |

**How it is used:** Members create new documents here on form submission. Staff read all documents (via `isStaff()` rule) and use `updateDoc` to change the `status` and `remarks` fields. Members can only read, update, or delete their own documents (enforced by `resource.data.userId == request.auth.uid`). The `referenceNumber` is generated by `applicationService.ts` using a Firestore transaction to guarantee unique, sequential IDs.

---

#### `counters`

Used internally by the application service to generate sequential daily reference numbers.

| Field | Type | Description |
|---|---|---|
| `date` | string | The current date in `YYYYMMDD` format |
| `count` | number | The daily submission counter, incremented for each new application |

**How it is used:** `generateApplicationReference()` in `src/lib/applicationService.ts` runs a Firestore **transaction** that reads the current counter for today's date, increments it atomically, saves it back, and returns the formatted reference number `AK-YYYYMMDD-XXXX`. The transaction guarantees that two simultaneous submissions never receive the same number.

---

#### `notifications`

Stores in-app notifications delivered to users when their application status changes.

| Field | Type | Description |
|---|---|---|
| `userId` | string | UID of the recipient member |
| `title` | string | Notification heading |
| `message` | string | Full notification body text |
| `type` | string | `info`, `success`, `warning`, or `error` |
| `isRead` | boolean | Whether the user has opened/read it |
| `createdAt` | Timestamp | When the notification was created |

**How it is used:** When a staff member saves a review decision (approve / return / reject), `sendNotification()` in `ApplicationTracking.tsx` creates a new document here. The member's dashboard uses a real-time listener filtered by their `userId` to show a live badge count on the notification bell icon. Clicking the bell marks all notifications as `isRead: true` via `updateDoc`.

---

#### `announcements`

Stores official announcements broadcast by the barangay to all members.

| Field | Type | Description |
|---|---|---|
| `title` | string | Announcement heading |
| `content` | string | Full announcement body text |
| `category` | string | Category label (e.g., Event, Reminder) |
| `authorId` | string | UID of the staff who created it |
| `createdAt` | Timestamp | Publication timestamp |

**How it is used:** Created and managed by staff and admin. Readable by anyone including unauthenticated visitors (`allow read: if true`) so announcements can be shown publicly if needed.

---

#### `audit_logs`

An append-only record of all significant system events. Documents are never updated or deleted.

| Field | Type | Description |
|---|---|---|
| `action` | string | Human-readable description of what happened |
| `userId` | string | UID of who triggered the action |
| `userName` | string | Display name of the actor |
| `targetType` | string | Which collection was affected |
| `applicationId` | string | Related application ID (if applicable) |
| `reviewedBy` | string | Reviewer name (for review events) |
| `timestamp` | Timestamp | When the action occurred |

**How it is used:** `addDoc` is called to append a new entry at key events: form submission, application status update, PWD record deletion, and user creation. Readable only by staff and admins. This collection acts as a tamper-resistant activity trail for accountability purposes.

---

### Firestore Security Rules Summary

Access is controlled by `firestore.rules` at the project root and must be deployed to Firebase to take effect. The key rules are:

| Collection | Read | Create | Update | Delete |
|---|---|---|---|---|
| `users` | Any signed-in user | Owner (member role only) or admin | Owner or admin | — |
| `pwd_profiles` | Staff / Admin only | Staff / Admin only | Staff / Admin only | Staff / Admin only |
| `applications` | Staff/Admin, or own records | Owner only | Staff/Admin, or owner | Staff/Admin, or owner |
| `counters` | Any signed-in user | Any signed-in user | Any signed-in user | — |
| `notifications` | Own records only | Staff / Admin only | Own records only | — |
| `announcements` | Public (anyone) | Staff / Admin only | Staff / Admin only | Staff / Admin only |
| `audit_logs` | Staff / Admin only | Any signed-in user | — | — |

---

## Project Structure

```
AbotKamay/
├── public/                          # Static assets (images, logos)
├── src/
│   ├── components/
│   │   ├── DocumentViewerModal.tsx  # PDF preview & download modal for all form types
│   │   ├── PWDProfileModal.tsx      # Add/edit PWD record (6-tab form)
│   │   └── PWDViewModal.tsx         # Read-only PWD profile view modal
│   ├── lib/
│   │   ├── firebase.ts              # Firebase app initialization (exports db, auth)
│   │   ├── applicationService.ts    # Generates AK-YYYYMMDD-XXXX reference numbers
│   │   ├── utils.ts                 # cn() class merger, generateRef() helper
│   │   └── firestore-errors.ts      # Structured Firestore error logging
│   ├── pages/
│   │   ├── LandingPage.tsx          # Public landing page
│   │   ├── AuthPage.tsx             # Login & 2-step member registration
│   │   ├── Dashboard.tsx            # Main shell with sidebar + role-based routing
│   │   └── dashboard/
│   │       ├── Overview.tsx                  # Summary stats dashboard
│   │       ├── DigitalForms.tsx              # Form selection + submission history
│   │       ├── ApplicationTracking.tsx       # Full application table + review modal
│   │       ├── PWDProfiles.tsx               # PWD member directory
│   │       ├── RequirementsVerification.tsx  # Document checklist workflow
│   │       ├── ApplicationReview.tsx         # Case review interface
│   │       ├── Reports.tsx                   # Analytics charts
│   │       ├── Announcements.tsx             # Announcement management
│   │       ├── UserManagement.tsx            # Admin-only user account management
│   │       ├── AuditLogs.tsx                 # System activity log
│   │       ├── Settings.tsx                  # Profile settings
│   │       ├── Profile.tsx                   # User profile view
│   │       ├── HelpSupport.tsx               # Help & support page
│   │       └── forms/
│   │           ├── BurialForm.tsx            # PWD Burial Assistance form
│   │           ├── DOHForm.tsx               # DOH PRPWD Registry form
│   │           ├── BrgyCertForm.tsx          # Barangay Burial Certificate
│   │           └── CancellationForm.tsx      # PWD Membership Cancellation form
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces (User, PWDProfile, Application, etc.)
│   ├── App.tsx                      # Root component + AuthContext provider
│   ├── main.tsx                     # React DOM entry point
│   └── index.css                    # Global styles
├── firestore.rules                  # Firestore security rules (deploy with Firebase CLI)
├── firebase-applet-config.json      # Firebase project configuration
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Developer Notes

- **Admin and Staff accounts cannot self-register.** They must be created by an existing administrator through the User Management page.
- **PWD Member accounts** can self-register through the public registration page.
- **Firestore security rules** must be deployed to Firebase after any changes to `firestore.rules`:
  ```bash
  firebase deploy --only firestore:rules
  ```
- The `firebase-applet-config.json` file connects to the live project database. For production deployments intended to be publicly accessible, move sensitive config values to environment variables.

---

*Developed for Barangay San Antonio de Padua I, Dasmariñas, Cavite.*
