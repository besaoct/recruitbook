# RecruitBook

**RecruitBook** is a universal Recruitment Management & Applicant Tracking System (ATS) designed to manage the complete recruitment lifecycle — from creating a job opening and receiving applications to interviewing, selecting, offering, and converting a candidate into an employee.

It consists of two connected experiences:

* **Recruitment Management Portal** — used by administrators, HR teams, recruiters, hiring managers, and interviewers.
* **Public Careers Portal** — used by candidates to discover jobs and apply online.

---

# 1. Product Architecture

```text
                         RECRUITBOOK
                              │
              ┌───────────────┴────────────────┐
              │                                │
              ▼                                ▼
    RECRUITMENT MANAGEMENT              PUBLIC CAREERS
           PORTAL                           PORTAL
              │                                │
              │                         ┌──────┴──────┐
              │                         │             │
              │                      Browse Jobs   Apply
              │                         │             │
              │                         └──────┬──────┘
              │                                │
              └───────────────┬────────────────┘
                              ▼
                    RECRUITMENT PLATFORM
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
       ▼                      ▼                      ▼
   JOBS & OPENINGS        CANDIDATES           APPLICATIONS
       │                      │                      │
       └──────────────────────┼──────────────────────┘
                              ▼
                     RECRUITMENT PIPELINE
                              │
               ┌──────────────┼──────────────┐
               ▼              ▼              ▼
           SCREENING       INTERVIEWS     EVALUATION
               │              │              │
               └──────────────┼──────────────┘
                              ▼
                         SELECTION
                              │
                              ▼
                           OFFER
                              │
                              ▼
                           HIRED
                              │
                              ▼
                       HRM / ONBOARDING
```

---

# 2. User Types

## 2.1 System Administrator

Controls the entire RecruitBook installation.

* Company settings
* Users
* Roles
* Permissions
* Departments
* Locations
* Recruitment settings
* Pipeline configuration
* Email settings
* Templates
* Integrations
* Security
* Audit logs

---

## 2.2 HR Administrator

Manages the overall recruitment operation.

* Create jobs
* Manage candidates
* Manage applications
* Schedule interviews
* Manage offers
* View reports
* Manage recruitment workflows

---

## 2.3 Recruiter

Handles day-to-day recruitment.

* Create/manage applications
* Screen candidates
* Shortlist candidates
* Schedule interviews
* Communicate with candidates
* Move candidates through pipeline
* Prepare offers

---

## 2.4 Hiring Manager

Responsible for hiring for their department.

* View assigned job openings
* Review candidates
* Shortlist candidates
* Review interview results
* Provide feedback
* Approve/reject candidates
* Approve hiring decisions

---

## 2.5 Interviewer

Limited recruitment access.

* View assigned interviews
* View candidate information
* Conduct interviews
* Submit evaluation
* Provide recommendation

---

## 2.6 Candidate

Uses the public Careers Portal.

* Browse jobs
* Search jobs
* View job details
* Create account
* Submit application
* Upload resume
* Track application
* Receive notifications
* Schedule/confirm interviews
* View offer
* Accept/reject offer

---

# 3. Main Management Portal

```text
Dashboard
│
├── Jobs
│   ├── All Jobs
│   ├── Open Jobs
│   ├── Draft Jobs
│   ├── On Hold
│   ├── Closed Jobs
│   └── Create Job
│
├── Applications
│   ├── All Applications
│   ├── New
│   ├── Screening
│   ├── Shortlisted
│   ├── Interview
│   ├── Selected
│   ├── Offered
│   ├── Hired
│   └── Rejected
│
├── Candidates
│   ├── All Candidates
│   ├── Active
│   ├── Talent Pool
│   └── Archived
│
├── Interviews
│   ├── Calendar
│   ├── Upcoming
│   ├── Completed
│   └── Interview Feedback
│
├── Offers
│   ├── Draft
│   ├── Sent
│   ├── Accepted
│   ├── Rejected
│   └── Expired
│
├── Communications
│   ├── Email
│   ├── Templates
│   └── Communication History
│
├── Reports
│   ├── Recruitment
│   ├── Jobs
│   ├── Applications
│   ├── Candidates
│   ├── Interviews
│   └── Hiring
│
└── Settings
    ├── Company
    ├── Users
    ├── Roles
    ├── Departments
    ├── Locations
    ├── Pipeline
    ├── Application Forms
    ├── Templates
    ├── Notifications
    └── Integrations
```

---

# 4. Dashboard

The RecruitBook dashboard provides a real-time overview of recruitment activity.

### Summary

* Open jobs
* Total applications
* New applications
* Candidates in screening
* Interviews today
* Pending evaluations
* Offers pending
* Hires this month

### Visual Analytics

* Applications over time
* Candidates by pipeline stage
* Applications by job
* Hiring by department
* Recruitment source performance
* Time-to-hire
* Offer acceptance rate

### Quick Actions

* Create Job
* Add Candidate
* Schedule Interview
* Create Offer
* View Applications

---

# 5. Job Management

## Job Opening

Each recruitment requirement is represented by a **Job Opening**.

### Job Information

* Job ID
* Job title
* Department
* Designation
* Location
* Employment type
* Work mode

  * On-site
  * Remote
  * Hybrid
* Number of vacancies
* Hiring manager
* Recruiter
* Salary range
* Currency
* Job status
* Opening date
* Closing date

### Job Description

* Job summary
* Responsibilities
* Requirements
* Qualifications
* Experience
* Required skills
* Preferred skills
* Benefits
* Working hours
* Other information

### Job Status

```text
Draft
  ↓
Published
  ↓
On Hold
  ↓
Closed
```

A job can also be archived.

---

# 6. Public Careers Portal

RecruitBook includes a public-facing careers website.

```text
                    CAREERS PORTAL
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
    Job Search         Job Details       Candidate
                                           Account
        │                 │                 │
        └─────────────────┼─────────────────┘
                          ▼
                       APPLY
                          │
                          ▼
                 APPLICATION FORM
                          │
                          ▼
                  APPLICATION SUBMIT
                          │
                          ▼
                APPLICATION TRACKING
```

## Public Pages

### Home

* Company branding
* Search jobs
* Featured jobs
* Departments
* Locations
* About company
* Benefits
* Careers information

### Jobs

Candidates can search/filter by:

* Keyword
* Job title
* Department
* Location
* Employment type
* Work mode
* Experience
* Date posted

### Job Details

Displays:

* Job title
* Location
* Department
* Employment type
* Salary if enabled
* Description
* Responsibilities
* Requirements
* Qualifications
* Benefits
* Application deadline

Primary action:

**Apply Now**

---

# 7. Candidate Application

The application form should be configurable per job.

## Basic Information

* Full name
* Email
* Phone
* Location
* Date of birth if required

## Professional Information

* Current designation
* Current company
* Total experience
* Relevant experience
* Expected salary
* Notice period
* Current salary

## Education

* Qualification
* Institution
* Passing year
* Grade/percentage

## Skills

* Skill
* Experience level

## Documents

* Resume/CV
* Cover letter
* Certificates
* Portfolio
* Other documents

## Custom Questions

Recruiters can create questions such as:

* Are you willing to relocate?
* Do you have experience with X?
* How many years of experience do you have with Y?

Question types:

* Text
* Long text
* Number
* Date
* Dropdown
* Multiple choice
* Checkbox
* File upload

---

# 8. Candidate Account

Candidates can optionally create an account.

### Candidate Dashboard

```text
Candidate Dashboard
│
├── Profile
├── My Applications
├── Interviews
├── Messages
├── Documents
├── Offers
└── Account Settings
```

### Application Tracking

Example:

```text
Applied
   ↓
Screening
   ↓
Shortlisted
   ↓
Interview
   ↓
Evaluation
   ↓
Selected
   ↓
Offer
   ↓
Hired
```

The candidate sees only the stages/statuses that the company chooses to expose.

---

# 9. Candidate Management

A candidate is stored independently from applications.

This is important because one candidate may apply to multiple jobs.

```text
Candidate
   │
   ├── Application → Job A
   │
   ├── Application → Job B
   │
   └── Application → Job C
```

## Candidate Profile

* Candidate ID
* Name
* Contact information
* Address
* Resume
* Profile photo
* Education
* Skills
* Experience
* Current company
* Current designation
* Expected salary
* Notice period
* Documents
* Notes
* Tags
* Source
* Communication history
* Application history

---

# 10. Talent Pool

Candidates can be retained even when they are not selected for the current job.

Example:

```text
Job A
Candidate rejected
        ↓
Talent Pool
        ↓
Future Job Opening
        ↓
Candidate invited to apply
```

Recruiters can search the talent pool by:

* Skills
* Experience
* Location
* Department
* Previous applications
* Tags
* Education

---

# 11. Application Management

An **Application** connects a candidate to a particular job opening.

### Application

```text
Application
│
├── Candidate
├── Job
├── Recruiter
├── Source
├── Applied Date
├── Current Stage
├── Status
├── Resume
├── Screening
├── Interviews
├── Evaluations
├── Notes
├── Offer
└── Hiring
```

---

# 12. Recruitment Pipeline

RecruitBook should have a configurable pipeline.

### Default Pipeline

```text
Applied
   ↓
Screening
   ↓
Shortlisted
   ↓
Interview
   ↓
Evaluation
   ↓
Selected
   ↓
Offer
   ↓
Hired
```

Rejected candidates can exit from any stage.

```text
                 ┌── Rejected
                 │
Applied → Screening → Shortlisted → Interview → Selected → Offer → Hired
                           │              │          │
                           └── Rejected   └── Rejected
```

## Pipeline Customization

Administrators can:

* Add stages
* Remove stages
* Rename stages
* Reorder stages
* Set stage permissions
* Set required actions
* Set automatic notifications
* Set stage-specific forms

---

# 13. Kanban Recruitment Board

A visual recruitment board can display:

```text
┌──────────┬────────────┬────────────┬────────────┬──────────┐
│ Applied  │ Screening  │ Shortlist  │ Interview  │ Selected │
├──────────┼────────────┼────────────┼────────────┼──────────┤
│ Candidate│ Candidate  │ Candidate  │ Candidate  │Candidate │
│ Candidate│ Candidate  │ Candidate  │ Candidate  │          │
│ Candidate│            │            │            │          │
└──────────┴────────────┴────────────┴────────────┴──────────┘
```

Recruiters can move candidates between stages according to permissions.

---

# 14. Screening

Recruiters can review applications before shortlisting.

### Screening Information

* Resume review
* Qualification match
* Experience match
* Skill match
* Salary expectations
* Notice period
* Location
* Custom screening questions
* Recruiter notes
* Screening score

### Actions

* Shortlist
* Reject
* Request information
* Move to another job
* Add to talent pool

---

# 15. Interview Management

## Interview

An application can have multiple interview rounds.

Example:

```text
Application
    │
    ├── HR Screening
    │
    ├── Technical Interview
    │
    ├── Manager Interview
    │
    └── Final Interview
```

### Interview Details

* Interview ID
* Application
* Candidate
* Interview round
* Interview type
* Date
* Start time
* End time
* Interviewer
* Interview panel
* Location
* Meeting link
* Notes
* Status

### Interview Types

* In-person
* Phone
* Video
* Online assessment
* Other

---

# 16. Interview Calendar

RecruitBook should provide:

* Day view
* Week view
* Month view
* Interviewer calendar
* Candidate calendar
* Interview room availability

### Interview Status

```text
Scheduled
   ↓
Confirmed
   ↓
Completed
```

Alternative outcomes:

```text
Cancelled
Rescheduled
No Show
```

---

# 17. Interview Evaluation

Each interview can have an evaluation form.

### Evaluation

* Technical knowledge
* Communication
* Problem solving
* Experience
* Job knowledge
* Team fit
* Leadership
* Custom criteria
* Overall rating
* Strengths
* Weaknesses
* Comments
* Recommendation

### Recommendation

```text
Strong Hire
Hire
Consider
Reject
```

Evaluation forms can be customized according to the organization's recruitment process.

---

# 18. Selection

Once interviews/evaluations are completed:

```text
Candidate
    ↓
Evaluation Complete
    ↓
Hiring Decision
    │
    ├── Selected
    └── Rejected
```

Selection can require approval from:

* Recruiter
* Hiring Manager
* HR
* Department Head
* Other configured approvers

---

# 19. Offer Management

## Offer

* Offer ID
* Candidate
* Application
* Job
* Designation
* Department
* Salary
* Allowances
* Benefits
* Joining date
* Reporting manager
* Work location
* Offer expiry date
* Terms
* Offer status

### Offer Status

```text
Draft
  ↓
Pending Approval
  ↓
Approved
  ↓
Sent
  ↓
Accepted
```

Alternative:

```text
Rejected
Expired
Withdrawn
```

---

# 20. Offer Letter Generation

RecruitBook can contain document templates.

Example:

```text
{{candidate_name}}
{{job_title}}
{{department}}
{{salary}}
{{joining_date}}
{{company_name}}
{{reporting_manager}}
```

The system automatically replaces variables with actual data and generates the offer letter.

Possible formats:

* PDF
* Printable document
* Email attachment

---

# 21. Hiring Conversion

The most important integration point:

```text
Candidate
     ↓
Application
     ↓
Selected
     ↓
Offer Accepted
     ↓
Hired
     ↓
Create Employee
```

If RecruitBook is connected to an HRM system:

```text
RecruitBook
     │
     │ Candidate hired
     ▼
HRM
     │
     ├── Employee Profile
     ├── Department
     ├── Designation
     ├── Salary
     ├── Documents
     ├── Joining Date
     └── Onboarding
```

Candidate information should transfer automatically rather than being entered again.

---

# 22. Recruitment Sources

RecruitBook should track where candidates came from.

### Default Sources

* Careers website
* Direct application
* Employee referral
* Job portal
* Recruitment agency
* Social media
* Walk-in
* Email
* Other

Sources should be customizable.

This allows reports such as:

```text
Applications
     │
     ├── Careers Website
     ├── Job Portal
     ├── Referral
     ├── Agency
     └── Social Media
```

---

# 23. Communication System

RecruitBook should maintain communication history for each application.

### Communication Types

* Email
* System notification
* Interview invitation
* Interview reminder
* Shortlist notification
* Rejection notification
* Offer notification

### Email Templates

Templates can contain variables:

```text
{{candidate_name}}
{{job_title}}
{{interview_date}}
{{interview_time}}
{{interviewer_name}}
{{company_name}}
```

### Communication Timeline

```text
12 Aug
Application received

13 Aug
Screening email sent

15 Aug
Interview invitation sent

18 Aug
Interview completed

20 Aug
Offer sent
```

---

# 24. Notifications

Notifications can be triggered by events.

Examples:

```text
New Application
       ↓
Recruiter Notification

Interview Scheduled
       ↓
Candidate + Interviewer Notification

Evaluation Pending
       ↓
Interviewer Notification

Offer Approved
       ↓
Recruiter Notification

Offer Accepted
       ↓
HR Notification
```

Channels can include:

* In-app
* Email
* SMS
* Other integrations

---

# 25. Recruitment Reports

## Job Reports

* Open positions
* Closed positions
* Vacancies
* Applications per job
* Job performance

## Candidate Reports

* Candidate count
* Candidates by stage
* Candidate sources
* Talent pool

## Application Reports

* Applications received
* Applications by job
* Applications by source
* Application conversion

## Interview Reports

* Scheduled interviews
* Completed interviews
* Cancelled interviews
* Interviewer workload
* Evaluation results

## Hiring Reports

* Hires
* Rejections
* Offer acceptance
* Time to hire
* Time to fill
* Cost per hire

---

# 26. Search & Filters

Global search should allow users to search:

* Candidate name
* Email
* Phone
* Application ID
* Job ID
* Job title
* Skills

Advanced filtering:

* Department
* Location
* Experience
* Skills
* Stage
* Status
* Recruiter
* Hiring manager
* Source
* Application date
* Interview date
* Salary
* Notice period

---

# 27. Roles & Permissions

Permissions should be modular.

```text
Users
  │
  ├── Administrator
  ├── HR
  ├── Recruiter
  ├── Hiring Manager
  └── Interviewer
```

Each role can have permissions such as:

* View
* Create
* Edit
* Delete
* Approve
* Reject
* Export
* Manage
* Assign

Permissions can be applied to:

* Jobs
* Candidates
* Applications
* Interviews
* Evaluations
* Offers
* Reports
* Settings

---

# 28. Settings

## Company

* Company name
* Logo
* Address
* Contact information
* Branding

## Recruitment

* Pipeline stages
* Application statuses
* Candidate statuses
* Sources
* Interview types
* Evaluation criteria

## Careers Portal

* Portal branding
* Domain
* Job visibility
* Application settings
* Candidate registration
* Required fields
* Privacy policy
* Terms

## Communication

* Email server
* Email templates
* Notification rules

## Documents

* Resume requirements
* File types
* File size limits
* Offer templates

---

# 29. Audit Log

RecruitBook should record important actions.

Example:

```text
12 Aug 10:32
John created Job #JOB-001

12 Aug 11:15
Sarah shortlisted Candidate #CAN-104

12 Aug 14:20
Mike scheduled Interview #INT-028

13 Aug 09:05
Sarah approved Candidate #CAN-104

13 Aug 10:10
Offer #OFF-012 sent
```

Audit records should include:

* User
* Action
* Object
* Date/time
* Previous value
* New value
* IP/device information where appropriate

---

# 30. Core Data Model

```text
Organization
     │
     ├── Users
     ├── Departments
     ├── Locations
     └── Jobs
            │
            └── Applications
                    │
                    └── Candidate
                           │
                           ├── Interviews
                           │      └── Evaluations
                           │
                           ├── Communications
                           │
                           ├── Documents
                           │
                           └── Offer
                                  │
                                  ▼
                                Hiring
                                  │
                                  ▼
                              Employee
```

---

# 31. Core Entities

```text
Organization
User
Role
Permission

Department
Location

Job
JobSkill
JobRequirement

Candidate
CandidateSkill
CandidateEducation
CandidateExperience
CandidateDocument

Application
ApplicationStage
ApplicationNote
ApplicationSource

Interview
InterviewParticipant
InterviewEvaluation

Offer
OfferTemplate

Communication
EmailTemplate
Notification

TalentPool

AuditLog
```

---

# 32. Application Lifecycle

```text
                    ┌──────────────┐
                    │   Job Open   │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Candidate    │
                    │ Applies      │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Screening   │
                    └──────┬───────┘
                           │
                    ┌──────┴──────┐
                    │             │
                    ▼             ▼
               Shortlisted     Rejected
                    │
                    ▼
                 Interview
                    │
                    ▼
                Evaluation
                    │
             ┌──────┴──────┐
             │             │
             ▼             ▼
          Selected       Rejected
             │
             ▼
           Offer
             │
       ┌─────┴─────┐
       │           │
       ▼           ▼
   Accepted     Rejected
       │
       ▼
     Hired
       │
       ▼
   HRM / Employee
```

---

# 33. Public + Private Architecture

The system should logically separate the public Careers Portal from the internal Management Portal.

```text
                         RECRUITBOOK
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
       PUBLIC APPLICATION                 INTERNAL SYSTEM
             │                               │
       Careers Website                   Admin Portal
             │                               │
       Job Listings                      Dashboard
             │                               │
       Job Details                       Jobs
             │                               │
       Application Form                  Candidates
             │                               │
       Candidate Account                 Applications
             │                               │
       Application Status                Interviews
             │                               │
             └──────────────┬────────────────┘
                            │
                            ▼
                     RECRUITBOOK CORE
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
      Jobs             Candidates          Applications
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                       Pipeline
                            │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
            Interviews   Offers       Hiring
                │           │           │
                └───────────┼───────────┘
                            ▼
                       HRM Integration
```

---

# 34. Recommended Product Modules

RecruitBook can be built as a modular system.

```text
RECRUITBOOK
│
├── Core
│   ├── Organization
│   ├── Users
│   ├── Roles & Permissions
│   └── Settings
│
├── Job Management
│   ├── Jobs
│   ├── Job Descriptions
│   ├── Requirements
│   └── Publishing
│
├── Candidate Management
│   ├── Candidates
│   ├── Documents
│   ├── Skills
│   └── Talent Pool
│
├── Application Management
│   ├── Applications
│   ├── Screening
│   └── Pipeline
│
├── Interview Management
│   ├── Scheduling
│   ├── Calendar
│   ├── Interviewers
│   └── Evaluations
│
├── Offer Management
│   ├── Offers
│   ├── Approvals
│   ├── Templates
│   └── Offer Letters
│
├── Careers Portal
│   ├── Public Jobs
│   ├── Application Forms
│   ├── Candidate Accounts
│   └── Application Tracking
│
├── Communication
│   ├── Email
│   ├── Templates
│   └── Notifications
│
├── Reports & Analytics
│
└── Integrations
    ├── HRM
    ├── Email
    ├── Calendar
    ├── Video Meetings
    └── Job Portals
```

---

# 35. Installation / Setup

RecruitBook should use the same universal philosophy as the other business software products.

It should **not** have separate versions for:

* Retail
* Restaurant
* Factory
* Office
* School
* Hospital
* Agency

Instead, RecruitBook is universal.

During installation:

```text
                 RECRUITBOOK SETUP
                        │
                        ▼
                 Company Details
                        │
                        ▼
                 Create Admin
                        │
                        ▼
                Select Features
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
       Jobs        Candidates      Interviews
          │             │             │
          ├─────────────┼─────────────┤
          ▼             ▼             ▼
       Offers       Careers Portal   Reports
                        │
                        ▼
                    Configure
                        │
                        ▼
                  Finish Setup
```

Features can be enabled/disabled:

```text
☑ Job Management
☑ Candidate Management
☑ Applications
☑ Recruitment Pipeline
☑ Interviews
☑ Evaluations
☑ Offers
☑ Careers Portal
☑ Candidate Accounts
☑ Communication
☑ Reports
☐ Recruitment Agency Management
☐ Employee Referral
☐ Advanced Analytics
☐ Job Portal Integrations
```

The underlying system remains the same; enabled modules simply control which features are available to the organization.

---

# 36. Future Integrations

RecruitBook should be designed so that it can later integrate with other software.

```text
                    RECRUITBOOK
                         │
       ┌─────────────────┼─────────────────┐
       ▼                 ▼                 ▼
      HRM             Payroll           Email
       │
       ▼
   Employee
       │
       ▼
   Onboarding
       │
       ▼
   Attendance
       │
       ▼
     Leave
       │
       ▼
    Payroll
```

Other possible integrations:

* Calendar
* Video conferencing
* Job portals
* Email providers
* SMS
* Digital signatures
* Document storage
* Accounting
* Identity/authentication systems

---

# 37. Recommended Product Boundary

RecruitBook should focus specifically on:

> **Finding → Evaluating → Hiring people**

The HRM system should take over after hiring.

### RecruitBook

```text
Job
 ↓
Application
 ↓
Candidate
 ↓
Screening
 ↓
Interview
 ↓
Evaluation
 ↓
Selection
 ↓
Offer
 ↓
Hire
```

### HRM

```text
Employee
 ↓
Onboarding
 ↓
Attendance
 ↓
Leave
 ↓
Payroll
 ↓
Performance
 ↓
Training
 ↓
Promotion
 ↓
Exit
```

The two systems can share data, but they remain separate products.

---

# 38. Final Product Structure

```text
                         ┌─────────────────────┐
                         │     RECRUITBOOK     │
                         │ Recruitment + ATS   │
                         └──────────┬──────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
       Careers Portal        Management Portal         Integrations
             │                      │                      │
             │                      │                 ┌────┴────┐
             │                      │                 ▼         ▼
             │                      │                HRM      Email
             │                      │
             │              ┌───────┴────────┐
             │              │                │
             ▼              ▼                ▼
          Jobs         Candidates       Applications
             │              │                │
             └──────────────┼────────────────┘
                            ▼
                       Pipeline
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
         Screening      Interviews     Evaluation
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                        Selection
                            │
                            ▼
                          Offer
                            │
                            ▼
                          Hired
                            │
                            ▼
                       HRM / Onboarding
```

## Product Definition

**RecruitBook = Universal Recruitment Management + Applicant Tracking + Careers Portal**

Its core promise is:

> **Create jobs, attract candidates, manage applications, run interviews, evaluate applicants, send offers, and convert successful candidates into employees — all from one recruitment platform.**
