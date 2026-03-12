# Dashboard Enhancement Plan for Core System Actors

## Overview
This document outlines enhancements to align the existing dashboards with the institutional model:
- 4 Faculties (Engineering, Business, Applied Sciences, Student Affairs)
- Multiple Departments per Faculty
- 8 Core System Actors for MVP

## Current Implementation Status
✅ All 8 dashboards implemented:
1. Department (HOD) → DepartmentStaffDashboard
2. Faculty (Dean) → FacultyDashboard  
3. Quality Assurance → AdminDashboard (QA tabs)
4. Academic Affairs → AdminDashboard (Academic tabs)
5. Admissions → AdminDashboard (Admissions tabs)
6. Counseling → AdminDashboard (Counseling tabs)
7. IT Support → SystemAdminDashboard
8. Dean of Students → DeanOfStudentsDashboard

## Proposed Enhancements

### 1. Faculty Dashboard (Dean) - Enhanced
**Current:** Department Comparison, Escalated Cases, Trends tabs
**Proposed Additions:**
- Faculty-specific KPIs with actual faculty names:
  - Faculty of Engineering
  - Faculty of Business & Management Studies
  - Faculty of Applied Sciences & Technology
  - Faculty of Student Affairs
- Department comparison within each faculty
- Cross-faculty performance metrics
- Resource allocation indicators

### 2. Department Dashboard (HOD) - Enhanced
**Current:** My Feedback, Department Overview, Activity, Escalation Panel, Staff Performance
**Proposed Additions:**
- Department-specific metrics aligned with faculties
- Lab/equipment feedback tracking
- Course delivery feedback
- Timetable issue tracking

### 3. Admin Dashboard - Enhanced with Specific Offices
**Quality Assurance:**
- Institutional performance metrics
- Service standard compliance
- Complaint analysis
- Audit trail

**Academic Affairs:**
- Curriculum issues
- Examination feedback
- Academic regulations

**Admissions:**
- Application processing
- Enrollment errors
- Entry requirements issues

**Counseling:**
- Confidential case management
- Referral tracking
- Welfare indicators

### 4. IT Support Dashboard (SystemAdminDashboard) - Enhanced
- System uptime metrics
- Technical ticket tracking
- Portal failure monitoring
- Network issue tracking

### 5. Dean of Students - Enhanced
- Student welfare overview
- Accommodation issues
- Campus life concerns
- SRC liaison indicators

## Implementation Priority
1. Phase 1: Update Faculty Dashboard with actual faculty names
2. Phase 2: Enhance Department Dashboard with faculty association
3. Phase 3: Add specific KPIs to each admin office dashboard
4. Phase 4: Enhance IT Support and Dean of Students dashboards

## Feedback Routing Integration
Ensure feedback is correctly routed based on:
- Feedback Type → Destination
- Academic issue → Department / Academic Affairs
- Lecturer complaint → HOD
- Curriculum issue → Academic Affairs
- Admission problem → Admissions Office
- Mental health issue → Counseling Unit
- Facility problem → Department / Faculty
- System issue → IT Support
- Institutional quality issue → Quality Assurance
