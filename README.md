# 🌍 Disaster Response & Relief Coordination System

### CSE 471 — Group 02

A full-stack disaster response and relief coordination platform designed to improve emergency reporting, disaster monitoring, volunteer coordination, relief management, donations, communication, and administrative response.

The system is designed specifically around disaster-response scenarios in Bangladesh, including floods, cyclones, earthquakes, and other emergencies.

---

## 🚀 Project Overview

The Disaster Response & Relief Coordination System provides a centralized platform where citizens, volunteers, administrators, and relief coordinators can work together during emergency situations.

The platform connects:

- 🚨 Emergency incident reporting
- 🗺️ Live disaster mapping
- 👥 Volunteer management
- 📋 Volunteer task assignment
- 🌦️ Weather safety monitoring
- 🏕️ Emergency shelter information
- 💰 Relief campaigns and donations
- 💳 Stripe payment processing
- 📊 Donation and campaign analytics
- 📢 Emergency SMS broadcasting
- 📧 Donor email notifications
- 🏅 Volunteer completion certificates
- 🔐 Role-based authentication
- 🛡️ Administrative verification and management

---

# ✨ Key Features

## 🚨 Emergency Reporting

Users can report an emergency directly from the navigation menu.

Supported crisis types include:

- 🌊 Flood
- 🌀 Cyclone
- 🏚️ Earthquake
- 🚨 Other emergencies

Users can provide:

- Crisis type
- Detailed description
- Division
- District
- Upazila
- Address or landmark
- Current GPS location

Reports are submitted to the backend for administrative verification.

Only verified incidents with valid geographic coordinates are displayed on the live incident map.

---

# 🗺️ Live Disaster Map

The system provides an interactive disaster map powered by:

- Leaflet.js
- OpenStreetMap

The map displays verified active incidents using geographic coordinates.

Users can filter incidents by:

### Severity

- Low
- Medium
- Critical

### Crisis Type

- Flood
- Earthquake
- Cyclone
- Other

The map automatically refreshes incident information periodically so that newly verified emergencies can appear without manually refreshing the page.

---

# 👨‍💼 Admin Dashboard

Administrators have access to centralized disaster-management tools.

Admin functionality includes:

- Incident verification
- Incident management
- Volunteer management
- Mission/task management
- Donation management
- Campaign management
- Fund allocation
- Emergency alerts
- SMS broadcasting
- Email delivery logs
- Certificate generation
- Analytics
- Shelter management
- Crisis monitoring

---

# 👥 Volunteer Management

Volunteers can register and maintain their volunteer profiles.

Volunteer functionality includes:

- Volunteer registration
- Profile management
- Identification information
- Availability management
- Mission participation
- Task assignments
- Mission progress
- Completion tracking
- Completion certificates

The system also supports document/ID processing using OCR functionality.

---

# 📋 Volunteer Task Board

Administrators can assign relief missions and tasks to volunteers.

Volunteers can:

- View assigned tasks
- Accept assignments
- Track task progress
- Update task status
- Complete missions

The system keeps track of mission progress throughout the relief workflow.

---

# 🌦️ Weather Safety Tracker

The platform integrates weather information to help users and volunteers understand local environmental conditions.

Weather functionality includes:

- Current weather information
- Localized weather information
- Safety-related weather conditions
- Disaster-response context

Weather information is provided using the Open-Meteo API.

---

# 🏕️ Emergency Shelter Directory

The system provides information about emergency shelters and relief locations.

Shelter information can include:

- Shelter name
- Location
- Capacity
- Availability
- Contact information
- Regional information

This allows users and coordinators to identify potential emergency shelter locations.

---

# 💰 Relief Campaigns

Administrators can create and manage relief campaigns.

Campaign functionality includes:

- Campaign creation
- Campaign descriptions
- Fundraising targets
- Campaign progress
- Donation tracking
- Campaign analytics
- Donation history

Campaigns allow users to contribute financially to disaster-relief activities.

---

# 💳 Stripe Donations

The platform integrates Stripe for donation payments.

Donation functionality includes:

- Secure payment processing
- Stripe checkout
- Donation records
- Donation history
- Campaign association
- Payment status tracking
- Donation receipts

Stripe is configured for test/development payment processing.

---

# 📊 Donation & Campaign Analytics

Administrators can monitor campaign performance through analytics.

Analytics may include:

- Total donations
- Campaign targets
- Amount raised
- Donation counts
- Campaign performance
- Fund allocation information

This provides better transparency over relief fundraising.

---

# 📢 Emergency Alerts

Administrators can prepare emergency alerts for disaster-response situations.

Alerts can contain:

- Crisis information
- District targeting
- Severity level
- Emergency message
- Draft status

Alerts can later be used for communication and broadcasting.

---

# 📱 Emergency SMS Broadcast

The system provides an emergency SMS broadcasting interface for administrators.

Administrators can:

1. Select an alert draft
2. Select a target district
3. Preview volunteers
4. Review the emergency message
5. Send the broadcast
6. View delivery logs

SMS delivery supports Twilio integration with a mock/fallback mode for development.

Broadcast information includes:

- District
- Message
- Number of recipients
- Sent count
- Failed count
- Delivery status

---

# 📧 Email Notifications

The system can send donor thank-you emails after donations.

Administrators can view email delivery logs.

Email logs include:

- Donor email
- Delivery status
- Timestamp
- Retry functionality

Supported statuses include:

- Sent
- Failed
- Pending

Failed email deliveries can be retried from the admin interface.

---

# 🏅 Volunteer Completion Certificates

Volunteers can receive completion certificates after completing missions.

Certificate functionality includes:

- Volunteer identification
- Mission information
- Certificate serial number
- Completion date
- PDF certificate generation
- Certificate download

Administrators can also generate certificates using a Volunteer ID and Mission ID.

Certificates are generated as PDF documents.

---

# 🔐 Authentication & Authorization

The application uses role-based authentication.

Different users receive access to different parts of the platform.

Supported roles include:

- 👤 User
- 👥 Volunteer
- 👨‍💼 Admin

Authentication is handled using JWT-based authorization.

Protected API requests use:

```text
Authorization: Bearer <token>
```
