# 🖥️ EnrollSys: Enrollment and Student Profile Management System

This document details the functional specifications and workflows of EnrollSys, a web-based system designed to automate the initial enrollment process for the Computer Studies Department at EVSU – Ormoc Campus.

---

## I. Architectural Overview

EnrollSys uses a modern, responsive stack and a Waterfall methodology for structured development.

| Layer | Technology | Role in System |
| :--- | :--- | :--- |
| **Frontend/UI** | **Next.js (React) & TypeScript** | Provides a fast, type-safe, and responsive user interface (UX) for all user roles. |
| **Backend/BaaS** | **Supabase** | Functions as the integrated backend, supplying **PostgreSQL Database**, **Authentication**, **Row Level Security (RLS)**, and **Secure File Storage**. |
| **Methodology** | **Waterfall** | Structured, phase-based approach (Requirements $\rightarrow$ Design $\rightarrow$ Implementation) suitable for Capstone execution. |

---

## II. Core Workflow: The Two Phases of Enrollment

The system enforces a structured, multi-step process for student enrollment clearance.

### Phase 1: Application and Administrative Review (Vetting)

**Goal:** Verify student eligibility and collect initial required documentation.

### Phase 2: Enrollment, Subject Selection, and Profile Completion

**Goal:** Finalize the student's academic standing, course load, and departmental clearance.

---

## III. Detailed User Flow Specifications

The system is controlled by strong Role-Based Access Control (RBAC) governed by Supabase RLS.

### A. Super Administrator / Dean / Admin Flow

This flow focuses on system setup, user management, and the crucial initial import of candidate enrollee data.

| Flow ID | Step | User Action (Admin) | System Action | Status Update |
| :--- | :--- | :--- | :--- | :--- |
| **SA-1** | **Access Upload Module** | Logs in; navigates to **Candidate Management** $\rightarrow$ **CSV Upload**. | System verifies Super Admin role and loads the upload interface. | Dashboard shows **Upload CSV** button. |
| **SA-2** | **CSV File Upload** | Clicks **Upload CSV**; selects the file. | System parses the file and performs initial **Validation Checks** (e.g., matching headers, file format). | **Validation Check 1:** *Successful* or *Error: Invalid format*. |
| **SA-3** | **Data Insertion** | Confirms the upload. | **1. Integrity Check:** Checks `personal_email` and `application_no` for **duplicates**. **2. Data Mapping:** Inserts non-duplicate records into the `candidate_enrollees` table. | If Duplicates: Prompts Admin to **Skip** or **Overwrite**. |
| **SA-4** | **Data Management** | Views the **Candidate List** table; clicks **Edit** on a row to correct data. | System displays paginated list; enforces unique constraints on edited fields (email/application no.). | Table View of all candidate data is visible. |
| **SA-5** | **Send Invitation** | Clicks **Send Invitation Email** (single row) or **Batch Send Invitation** (multiple rows). | **1. Token Generation:** Generates a unique, time-limited `invitation_token`. **2. Email Send:** Sends the secure registration link: `[Your Domain]/register?token=[token]`. **3. Status Update:** Updates the candidate record. | Status: **Invitation Sent** (Triggers Student Flow ST-1). |
| **SA-6** | **System Configuration**| Updates Subject List, Prerequisite Rules, or Required Document List. | System updates core database configuration tables. | Configuration updated globally. |
| **SA-7** | **User Management** | Creates, modifies, or deletes user accounts; Assigns/updates **User Roles** (Officer, Instructor). | Supabase Authentication/User Management API is used. | User Role assigned/updated. |

### B. Student Flow

The process from application initiation to final departmental clearance.

| Flow ID | Step | User Action | System Action | Status Update |
| :--- | :--- | :--- | :--- | :--- |
| **ST-1** | **Registration Access** | Clicks the **secure link** from the invitation email (SA-5). | System verifies the `invitation_token`; prompts for password creation/profile setup. | Directed to **Phase 1 Application Dashboard**. |
| **ST-2** | **Document Upload** | Uploads required files (e.g., PSA, Diploma, FHE) for their specific student type. | System stores files in Supabase Storage. | Document Statuses: **PENDING VERIFICATION**. |
| **ST-3** | **Document Tracking** | Views the Documents module dashboard. | System displays real-time status updates (via Supabase Realtime). | Status: **APPROVED**, **REJECTED**, or **PENDING**. |
| **ST-4** | **Rejection Handling** | If **REJECTED**, reads the mandatory reason; re-uploads the corrected document. | System allows re-upload; logs the revision. | Status reverts to **PENDING VERIFICATION**. |
| **ST-5** | **Phase 2 Access** | All required Phase 1 documents are **APPROVED**. | System unlocks **Phase 2 Modules** (Profile Completion, Subject Selection). | Enrollment Status: **CLEARED FOR ENROLLMENT**. |
| **ST-6** | **Subject Selection** | Accesses Subject Enrolled module; attempts to select subjects. | System performs **Prerequisite Validation** (checks against prerequisites defined in SA-6). | If Prereq failed: **BLOCKED**. If successful: **ADDED TO LOAD**. |
| **ST-7** | **Finalization** | Confirms subject load, profile, and ensures all requirements are met. | System generates a summary of the student's academic load. | Enrollment Status: **DEPARTMENTALLY CLEARED**. |
| **ST-8** | **External Confirmation**| Views "Next Steps" and proceeds to the official EVSU Portal. | System directs student to the official system (System Boundary). | Final Status: **ENROLLED**. |

### C. Organization Officer Flow

The Officer's role is primary verification and clearance (Phase 1).

| Flow ID | Step | User Action | System Action | Privilege Check |
| :--- | :--- | :--- | :--- | :--- |
| **OF-1** | **Access Queue** | Logs in; navigates to the **Pending Applications** module. | System filters student data to show those in **PENDING DOCUMENT VERIFICATION** status. | Role: **Organization Officer**. RLS: Access to all Student document data. |
| **OF-2** | **Document Review** | Selects a Student; views the uploaded files. | System securely displays the document; logs the Officer's ID and review timestamp. | RLS: Prevent editing of student profile data. |
| **OF-3** | **Verification Decision** | Clicks **APPROVE** or **REJECT** for each document. | If REJECT: Forces **Mandatory Reason** input, which is notified to the Student (ST-4). | Action is logged to the Audit Trail. |
| **OF-4** | **Grant Clearance** | All required documents are **APPROVED**. Clicks **Grant Enrollment Clearance**. | System updates the Student's status; unlocks Phase 2 modules for the Student. | Status: **CLEARED FOR ENROLLMENT**. |
| **OF-5** | **Reporting** | Accesses the Reporting module. | System generates real-time reports on enrollment count and verification status. | Role: **Organization Officer** (Read/View permissions). |

### D. Faculty/Instructor Flow

The Instructor's role is focused on academic vetting and specialized verification (Phase 2).

| Flow ID | Step | User Action | System Action | Privilege Check |
| :--- | :--- | :--- | :--- | :--- |
| **FA-1** | **Access Module** | Logs in; navigates to the **Academic Verification** module. | System filters and displays a list of **Transfer/Returnee** students requiring grade or FHE verification. | Role: **Instructor**. RLS: Access only to academic documents (Grades, TOR, FHE). |
| **FA-2** | **Academic Review** | Reviews a Student's submitted grades, TOR, or FHE form. | System cross-references the documents with academic requirements. | RLS: Restricted to specific student documents only. |
| **FA-3** | **Final Vetting** | Submits a **VETTED** or **REQUIRES RE-ASSESSMENT** decision. | System logs the decision; if VETTED, the subject selection module (ST-6) is fully enabled. | Decision is logged and tied to the Student's academic record. |
| **FA-4** | **Grade Encoding** | (Future scope) Encodes final grades for classes taught. | System updates the student's record and makes the grade visible on the Student Dashboard. | RLS: Limited to classes/subjects they are assigned to teach. |