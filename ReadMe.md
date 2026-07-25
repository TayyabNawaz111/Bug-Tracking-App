# Bug Tracking Application

## Project Overview
The goal of this project is to build a bug tracking application that allows teams to track, manage, and resolve bugs or issues in their projects. The application should be intuitive, user-friendly, and efficient in handling bug reports.

## Functional Requirements

### 1. User Management
- **Sign Up, Login, and Logout**: Users can sign up, log in, and log out of the application.
- **User Roles**: The system supports different user roles, including:
  - **Admin**: Full access to all features, including managing users and roles.
  - **Developer**: Can view and manage assigned bugs, update bug statuses, and add comments.
  - **Tester**: Can report bugs, comment on bugs.

### 2. Project Management
- **Project Creation**: Users can create and manage multiple projects, each having the following details:
  - Title
  - Description
  - Start Date
  - End Date
- **User Assignment to Projects**: Users can be assigned to projects with specific roles, such as Developer or Tester.

### 3. Bug Reporting and Tracking
- **Create Bug Reports**: Users can create bug reports that include:
  - Title
  - Description
  - Severity (Low, Medium, High, Critical)
  - Status (Open, In Progress, Resolved, Closed)
  - Assigned Developer
  - Attachments (screenshots, logs, videos)
- **Comments**: Users can comment on bugs for discussion, updates, and sharing information.

### 4. Notification System
- **Bug Assignment Notifications**: Users will receive notifications when a bug is assigned to them.
- **Status Change Notifications**: Notifications will be sent when the status of a bug is updated.
- **Comment Notifications**: Users will receive notifications when new comments are added to bugs.

### 6. Activity Log
- **Track Actions**: The application records all activities such as bug creation, status changes, and updates.

### 7. Integration and API
- **RESTful API**: The system provides basic RESTful API endpoints for CRUD operations on users, projects, and bugs.
---

## Database Schema

The database schema for the bug tracking application is provided below in PlantUML format and as a `.puml` file at `./images/db-schema.puml`.

You can view or render the schema by:

- Opening `images/db-schema.puml` in a PlantUML-aware editor (VS Code PlantUML extension), or
- Paste the contents into the online PlantUML editor: https://plantuml.com/plantuml

PlantUML source:

```plantuml
@startuml
hide circle

entity "User" as User {
  * id : INT <<PK>>
  --
  name : VARCHAR
  email : VARCHAR
  password : VARCHAR
  deletedAt : TIMESTAMP
  createdAt : TIMESTAMP
  updatedAt : TIMESTAMP
}

entity "Role" as Role {
  * id : INT <<PK>>
  --
  name : VARCHAR
}

entity "Project" as Project {
  * id : INT <<PK>>
  --
  title : VARCHAR
  description : TEXT
  startDate : DATE
  endDate : DATE
  createdBy : INT <<FK User.id>>
}

entity "ProjectUser" as ProjectUser {
  * id : INT <<PK>>
  --
  projectId : INT <<FK Project.id>>
  userId : INT <<FK User.id>>
}

entity "Ticket" as Ticket {
  * id : INT <<PK>>
  --
  title : VARCHAR
  description : TEXT
  stepsToReproduce : TEXT
  status : VARCHAR
  severity : VARCHAR
  projectId : INT <<FK Project.id>>
  createdBy : INT <<FK User.id>>
  assignedTo : INT <<FK User.id>>
}

entity "Comment" as Comment {
  * id : INT <<PK>>
  --
  content : TEXT
  fileUrl : VARCHAR
  createdBy : INT <<FK User.id>>
  ticketId : INT <<FK Ticket.id>>
}

entity "Attachment" as Attachment {
  * id : INT <<PK>>
  --
  title : VARCHAR
  fileUrl : VARCHAR
  ticketId : INT <<FK Ticket.id>>
}

entity "Notification" as Notification {
  * id : INT <<PK>>
  --
  title : VARCHAR
  description : TEXT
  ticketId : INT <<FK Ticket.id>>
}

entity "ActivityLog" as ActivityLog {
  * id : INT <<PK>>
  --
  title : VARCHAR
  description : TEXT
  projectId : INT <<FK Project.id>>
}

' Relationships / cardinalities
Role ||--o{ User : "has"
User ||--o{ Project : "created"
Project ||--o{ ProjectUser : "has"
User ||--o{ ProjectUser : "member"
Project ||--o{ Ticket : "has"
Ticket ||--o{ Comment : "has"
Ticket ||--o{ Attachment : "has"
Ticket ||--o{ Notification : "has"
Project ||--o{ ActivityLog : "has"

' Ticket relations to User
User ||--o{ Ticket : "created"
User ||--o{ Ticket : "assigned"

@enduml
```

## Technologies Used
- **Frontend**: React.js
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
