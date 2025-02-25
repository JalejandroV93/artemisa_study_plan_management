
# Artemisa: Interactive Study Plan Management

**Artemisa** is a web application developed with Next.js and shadcn/ui for Liceo Taller San Miguel, designed to manage and access academic study plans interactively. Inspired by the institution's philosophy of using art as a pedagogical framework, Artemisa empowers teachers and administrators to create, edit, and visualize study plans, fostering creativity and comprehensive student development.

**Tagline:** Where art and education transform lives.

---

## Table of Contents

- [Artemisa: Interactive Study Plan Management](#artemisa-interactive-study-plan-management)
  - [Table of Contents](#table-of-contents)
  - [Description](#description)
  - [Key Features](#key-features)
  - [Technologies Used](#technologies-used)
  - [Prerequisites](#prerequisites)
  - [Installation and Setup](#installation-and-setup)
    - [Local Setup (without Docker)](#local-setup-without-docker)
    - [Docker Setup](#docker-setup)
  - [Environment Variables](#environment-variables)
  - [Project Structure](#project-structure)
  - [API Routes](#api-routes)
  - [Deployment](#deployment)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contact](#contact)

---

## Description

Artemisa provides a modern and intuitive interface for managing academic study plans.  It's built with a focus on user experience, performance, and scalability.  The application allows for:

*   Creating, editing, and deactivating subjects.
*   Associating subjects with grades and groups.
*   Defining detailed study plans, including vision, mission, objectives, didactics, and cross-cutting projects.
*   Managing benchmarks and learning evidence for each trimester.
*   User authentication and authorization (Admin and Teacher roles).
*   Auditing of user activity.

The name "Artemisa" reflects the school's focus on art and a higher purpose, connecting to the planned "Picasso" AI integration for enhanced teaching assistance.

---

## Key Features

*   **Secure Authentication:** Supports both traditional login (username/password) and Single Sign-On (SSO) using JWT.
*   **Study Plan Management:** Create, edit, view, and deactivate study plans organized by subject, grade, and group.
*   **Cross-Cutting Projects:** Associate projects shared among multiple subjects.
*   **Activity Log:** Tracks user actions (viewing, creating, updating, deleting) for auditing purposes.
*   **Data Structure for RAG:** Designed to integrate with Retrieval-Augmented Generation (RAG) systems.
*   **Academic Calendar Management:** Define academic years, start/end dates, and trimester configurations.
*   **User Roles:** Differentiated access for Admin and Teacher roles.
* **Responsive Design:** Built with a mobile-first approach using shadcn/ui.

---

## Technologies Used

*   **Frontend:**
    *   Next.js (React framework)
    *   React
    *   TypeScript
    *   shadcn/ui (UI component library)
    *   Tailwind CSS (styling)
    *   Framer Motion (animations)
    *   Zustand (state management)
    *   React Hook Form (form handling)
    *   Zod (schema validation)
*   **Backend:**
    *   Node.js
    *   Prisma (ORM)
    *   PostgreSQL (database)
*   **Authentication:**
    *   JWT (JSON Web Tokens)
    *   bcryptjs (password hashing)
*   **Deployment:**
    *   Vercel (recommended)
    *   Docker (containerization)
*  **Queue:**
  *  BullMQ
  * Redis
---

## Prerequisites

Before setting up the application, ensure you have the following installed:

*   Node.js (v18 or higher recommended)
*   npm or yarn (package manager)
*   PostgreSQL (local or remote instance)
*   (Optional) Docker and Docker Compose

---

## Installation and Setup

### Local Setup (without Docker)

1.  **Clone the Repository:**

    ```bash
    git clone <your-repository-url>
    cd <your-project-directory>
    ```

    Replace `<your-repository-url>` with the actual URL and `<your-project-directory>` with the project's folder name.

2.  **Install Dependencies:**

    ```bash
    npm install  # Or yarn install
    ```

3.  **Configure Environment Variables:**

    Create a `.env` file in the root of the project and add the following content, adjusting the values as needed:

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/ev_teachers_db?schema=public"
    AUTH_SECRET="your_super_secret_key" # Generate a strong, random secret.
    NEXT_PUBLIC_API_URL="http://localhost:3000/api" # Adjust for production
    ```
   * **AUTH_SECRET** is a very important secret. Generate it, for instance, with `openssl rand -base64 32`
   * **DATABASE_URL:** Ensure the database and schema exist.  The user must have appropriate permissions.

4.  **Set Up Prisma:**

    ```bash
    npx prisma generate
    npx prisma db push   # Use this for initial setup and schema changes.
    # OR, if you prefer migrations:
    # npx prisma migrate dev --name init
    npx prisma db seed # Seed initial data (sections, grades, groups)
    ```
    *  `prisma db push` is preferred for development, as it directly applies the schema to your database. Use migrations (`prisma migrate dev`) for more controlled changes, especially in team environments or for production deployments.

5.  **Run the Development Server:**

    ```bash
    npm run dev # Or yarn dev
    ```

    The application will be available at `http://localhost:3000`.

### Docker Setup

1.  **Clone the Repository:** (Same as step 1 above)

2.  **Configure Environment Variables:**
    Create the `.env` file as in step 3 of Local Setup.  The `docker-compose.yml` already includes environment variables for the database and Redis, but you'll still need `AUTH_SECRET` and `NEXT_PUBLIC_API_URL` (for local development with Docker, keep this as `http://localhost:3000/api`).

3.  **Build and Run with Docker Compose:**

    ```bash
    docker-compose up --build
    ```
    *  `--build`:  This ensures the Docker image is rebuilt, incorporating any recent code changes.
    * This command starts the application, database, and Redis services defined in `docker-compose.yml`. The application will be accessible at `http://localhost:8100` (as defined in your `docker-compose.yml`).  The Prisma migrations and seed script are run automatically as part of the container startup.

---

## Environment Variables

The following environment variables are required:

*   **`DATABASE_URL`:**  Connection string for your PostgreSQL database.  (e.g., `postgresql://user:password@host:port/database?schema=public`)
*   **`AUTH_SECRET`:** A strong, random secret used for JWT signing and verification.  Generate a secure one.
*   **`NEXT_PUBLIC_API_URL`:** The base URL for your API endpoints.  For local development, this is usually `http://localhost:3000/api`.  For production, this will be your domain name (e.g., `https://your-app.com/api`).
* **REDIS_URL**: URL to connect to Redis

---

## Project Structure

```
├── components/       # Reusable React components, organized by feature and using shadcn/ui
├── prisma/           # Prisma schema, migrations, and seed script
│   ├── migrations/   # Database migration files
│   ├── schema.prisma # Database schema definition
│   └── seed.ts       # Script to populate the database with initial data
├── src/
│   ├── app/          # Next.js pages (routes) and API endpoints
│   │   ├── api/      # API routes
│   │   │   └── v1/   # Versioned API endpoints (e.g., /api/v1/subjects)
│   │   └── v1/       # Protected routes (dashboard)
│   │       └── (dashboard)/ # Layout for authenticated users
│   ├── assets/       # Static assets (images, styles)
│   ├── components/   # Reusable React components
│   │   ├── ui/       # shadcn/ui components (extended and customized)
│   │   ├── providers/  # Context providers (e.g., AuthProvider, ThemeProvider)
│   │   └── ...       # Other components organized by feature
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions, helpers, and configurations
│   │   ├── auth.ts      # Server-side authentication logic
│   │   ├── auth-client.ts # Client-side authentication functions
│   │   ├── prisma.ts    # Prisma client instance
│   │   ├── tokens.ts    # JWT handling (using jose)
│   │   └── utils.ts     # General utility functions
│   ├── types/        # TypeScript type definitions
│   └── ...
├── .env              # Environment variables (IMPORTANT: DO NOT COMMIT THIS FILE)
├── next.config.js   # Next.js configuration
├── tailwind.config.ts # Tailwind CSS configuration
└── ...               # Other configuration files
```

---

## API Routes

The API is organized under `/api/v1`. Here's a summary of the key endpoints (replace `:id` with the actual resource ID):

*   **Authentication:**
    *   `POST /api/auth/login`: Traditional login with username and password.
    *   `POST /api/auth/sso`: Single Sign-On (SSO) login with a JWT from an external provider.
    *   `POST /api/auth/logout`: Logout (clears the authentication cookie).
    *   `GET /api/auth/me`: Get the currently authenticated user.
*   **Users:**
    *   `GET /api/v1/users`: Get all users (admin only, paginated, search, sort).
    *   `POST /api/v1/users`: Create a new user (admin only).
    *   `GET /api/v1/users/:id`: Get a specific user by ID (admin or self).
    *   `PUT /api/v1/users/:id`: Update a user (admin only).
    *   `DELETE /api/v1/users/:id`: Delete a user (admin only).
    *   `PUT /api/v1/users/:id/block`: Block a user (admin only).
    *   `PUT /api/v1/users/:id/unblock`: Unblock a user (admin only).
    *   `PUT /api/v1/users/account/update`: Update the current user's profile.
    *   `PUT /api/v1/users/account/change-password`: Change the current user's password.
*   **Subjects:**
    *   `GET /api/v1/subjects`: Get all subjects (optional `gradeId` filter).
    *   `POST /api/v1/subjects`: Create a new subject (admin only).
    *   `GET /api/v1/subjects/:id`: Get a specific subject by ID.
    *   `PUT /api/v1/subjects/:id`: Update a subject (admin only).
    *   `DELETE /api/v1/subjects/:id`: Delete a subject (admin only, cascades to related data).
*   **Grades:**
    *  `GET /api/v1/grades`: Get all grades (optional `sectionId` filter).
    *   `POST /api/v1/grades`: Create a new grade (admin only, auto-creates groups A and B).
    *   `GET /api/v1/grades/:id`: Get a specific grade by ID.
    *   `PUT /api/v1/grades/:id`: Update a grade (admin only).
    *   `DELETE /api/v1/grades/:id`: Delete a grade (admin only, cascades to related groups and gradeOfferings).
*  **Groups:**
    *   `GET /api/v1/groups`: Get all groups (optional `gradeId` filter).
    *   `POST /api/v1/groups`: Create a new group (admin only).
    *   `GET /api/v1/groups/:id`: Get a specific group by ID.
    *   `PUT /api/v1/groups/:id`: Update a group (admin only).
    *   `DELETE /api/v1/groups/:id`: Delete a group (admin only, cascades to related enrollments).
*   **Sections:**
    *   `GET /api/v1/sections`: Get all sections.
    *   `POST /api/v1/sections`: Create a new section (admin only).
    *   `GET /api/v1/sections/:id`: Get a specific section by ID.
    *   `PUT /api/v1/sections/:id`: Update a section (admin only).
    *   `DELETE /api/v1/sections/:id`: Delete a section (admin only, cascades to related grades).
*   **Grade Offerings:**
    *   `POST /api/v1/grade-offerings`: Create a new grade offering (admin only).
    *   `PUT /api/v1/grade-offerings/:id`: Update a grade offering (admin only).
* **Trimesters:**
    * `PUT /api/v1/trimesters/:id` : Update a trimester (admin only)
* **Academic Years:**
    * `GET /api/v1/academic-years` : Get all academic years
    * `POST /api/v1/academic-years`: Create a new academic year
    * `GET /api/v1/academic-years/:id` : Get an academic year
    * `PUT /api/v1/academic-years/:id` : Update an academic year
    * `DELETE /api/v1/academic-years/:id` : Delete an academic year
*  **Projects**
   * `GET /api/v1/projects`: Get all projects
---

## Deployment

**Vercel (Recommended):**

1.  **Connect to Vercel:** Link your GitHub repository to Vercel.
2.  **Configure Environment Variables:** Add the environment variables from your `.env` file to the Vercel project settings.  **Crucially**, set the `NEXT_PUBLIC_API_URL` to your Vercel deployment URL (e.g., `https://your-app-name.vercel.app/api`).
3.  **Deploy:** Vercel will automatically deploy your application on every push to the connected branch.  Vercel handles building the Next.js application.
4.  **Database Setup:** You'll need a separate, hosted PostgreSQL database (e.g., on AWS, DigitalOcean, Heroku, or a managed PostgreSQL provider).  Vercel does *not* provide a database.  Ensure your `DATABASE_URL` environment variable in Vercel points to this database.  Run `npx prisma migrate deploy` (or `npx prisma db push` if you are not managing migrations) *after* setting the `DATABASE_URL` in Vercel, and *before* the first deployment, to create the tables.

**Other Platforms (e.g., AWS, DigitalOcean, Heroku):**

Deployment to other platforms will generally involve:

1.  **Setting up a server:** You'll need a virtual machine or a container service (e.g., Docker on a VM, AWS ECS, Heroku with a Dockerfile).
2.  **Building the application:** `npm run build`
3.  **Running the application:**  `npm run start` (you'll likely use a process manager like PM2 to keep the application running).
4.  **Configuring a reverse proxy:**  Use Nginx or a similar server to handle incoming requests and forward them to your Node.js application.
5.  **Database Setup:** (As with Vercel, you need a separate PostgreSQL database).  Run `npx prisma migrate deploy` (or `npx prisma db push`) on the server *after* setting the `DATABASE_URL` environment variable.

---

## Contributing

Contributions are welcome!  Please follow these steps:

1.  Fork the repository.
2.  Create a new branch: `git checkout -b feature/your-feature-name`
3.  Make your changes and commit them: `git commit -m "Add: Your commit message"`
4.  Push your branch: `git push origin feature/your-feature-name`
5.  Create a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

For questions or support, please contact [javam2639@gmail.com](mailto:javam2639@gmail.com).
