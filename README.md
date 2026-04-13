# GoTasks: Real-Time Project Collaboration Platform

GoTasks is a high-performance, full-stack project management platform designed for real-time collaboration. It leverages **Django Channels** and **Redis** to provide an instantaneous Kanban experience, backed by a resilient **PostgreSQL** architecture optimized for low-latency data retrieval.

## System Architecture

The application is built on a decoupled, containerized architecture designed for scalability and high availability:

* **Gateway Layer**: Nginx serves as the single entry point, handling SSL termination, static file delivery, and routing both HTTP and WebSocket traffic through a unified interface.
* **Application Layer**: An ASGI-native Django environment powered by Daphne. It utilizes custom JWT Middleware to authenticate real-time WebSocket streams.
* **Concurrency Layer**: Redis acts as the high-speed message broker (Channel Layer), enabling cross-instance communication and real-time state synchronization.
* **Data Layer**: PostgreSQL with persistent connection pooling (`CONN_MAX_AGE`) and optimized B-Tree indexing.

---

## Key Features

### Real-Time Collaboration
* **Live Kanban Updates**: Tasks moved on one board reflect instantly across all connected clients using WebSocket broadcasts.
* **Instant Notifications**: Real-time alerts for task assignments, status changes, and new comments.
* **Global State Management**: Powered by **Zustand** on the frontend for snappy, reactive UI transitions without prop-drilling.

### Performance & Optimization
* **N+1 Query Prevention**: Custom querysets utilize `.select_related()` and `.prefetch_related()` combined with `.annotate(Count())` to ensure the dashboard loads efficiently with minimal database hits.
* **Secure WebSocket Auth**: Custom ASGI middleware intercepts the handshake to validate JWTs in the query string before establishing a stateful connection.
* **Database Integrity**: Django Signals manage cascading `updated_at` timestamps to ensure precise project sorting without manual view logic.

### Security
* **JWT Authentication**: Stateless authentication with automatic token rotation and blacklisting support.
* **Row-Level Security**: Strict `Q` object filtering in Django Views ensures users can only access data belonging to projects they are authorized members of.
* **Production Hardened**: Pre-configured with secure headers, CSRF trusted origins, and non-root Docker execution environments.

---

## Tech Stack

| Component | Technology |
| :--- | :--- |
| **Backend** | Django 4.2 (LTS), Django REST Framework |
| **Real-Time** | Django Channels (ASGI), Daphne |
| **Frontend** | React 18, Vite, Tailwind CSS |
| **State** | Zustand (Global State & Fetching) |
| **Database** | PostgreSQL 15 |
| **Cache/Broker** | Redis 7 |
| **DevOps** | Docker, Docker Compose, Nginx |

---

## Quick Start

### Prerequisites
* Docker & Docker Compose
* Node.js (Optional, for local frontend development outside of Docker)

### One-Command Setup
We provide a comprehensive setup script that handles `.env` creation, container builds, migrations, static asset collection, and superuser initialization.

```bash
# 1. Clone the repository
git clone [https://github.com/aanalpatil24/GoTasks-Project-Collaboration-Platform.git](https://github.com/aanalpatil24/GoTasks-Project-Collaboration-Platform.git)
cd gotasks

# 2. Run the automated setup
chmod +x setup.sh
./setup.sh