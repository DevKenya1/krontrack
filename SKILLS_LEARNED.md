# 🎓 Skills Learned — Krontrack Project

> A detailed breakdown of every technical skill acquired and reinforced
> while building Krontrack from scratch.
>
> **Developer:** Emmanuel M. Jesse · Dev Kenya
> **Duration:** Full-stack build from zero to production-ready
> **Stack:** Django · React · PostgreSQL · Redis · Celery · Docker · TypeScript

---

## 1. 🐍 Django & Python Backend

### Django Fundamentals
- Setting up a Django project with **split settings** (base/development/production)
- Creating multiple **Django apps** with proper separation of concerns
- Writing **models** with UUIDs, relationships, choices, computed properties, and `Meta` classes
- Using **`__str__`**, `@property`, and `save()` overrides
- Understanding `auto_now`, `auto_now_add`, `null`, `blank`, `unique_together`

### Django REST Framework
- Building **ViewSets** (ModelViewSet, ReadOnlyModelViewSet)
- Writing **serializers** with nested relationships, computed fields, and custom validation
- Implementing **custom actions** with `@action` decorator (`clock-in`, `approve`, `submit`)
- Using **filters** (`django-filter`), **search**, and **ordering** backends
- Implementing **pagination** (PageNumberPagination with custom classes)
- Setting up **permissions** with role-based logic
- Handling **JWT authentication** with SimpleJWT (access tokens, refresh tokens, blacklisting)

### Database Design
- Designing a **normalized relational schema** across 12+ tables
- Using **UUID primary keys** for security and distribution
- Setting up **foreign keys** with `on_delete` strategies
- Using **JSONB fields** for flexible metadata storage
- Writing **complex querysets** with `filter()`, `exclude()`, `select_related()`, `prefetch_related()`
- Using **queryset unions** with the `|` operator
- Understanding **database migrations** — making, running, and squashing

### Celery & Async Tasks
- Configuring **Celery** with Redis as a broker and result backend
- Writing **`@shared_task`** functions for background processing
- Setting up **Celery Beat** for scheduled periodic tasks
- Using **crontab()** expressions for timing (every 30 min, weekly, daily)
- Understanding **task autodiscovery** with `autodiscover_tasks()`
- Chaining tasks and handling **task failures gracefully**

### Django Channels & WebSockets
- Configuring **ASGI** with `ProtocolTypeRouter`
- Writing **`AsyncWebsocketConsumer`** classes
- Using **channel layers** with Redis backend
- Implementing **group messaging** for per-user notification rooms
- Handling **connect**, **disconnect**, **receive** lifecycle methods
- Running with **Daphne** ASGI server instead of standard `runserver`

### Authentication & Security
- Implementing **JWT authentication** with token rotation and blacklisting
- Setting up **OAuth2 SSO** with `social-auth-app-django`
- Writing a **custom social auth pipeline** to auto-create employee profiles
- Configuring **CORS** with `django-cors-headers`
- Understanding **AUTHENTICATION_BACKENDS** for multiple auth methods
- Using **`python-decouple`** for 12-factor environment variable management

### Django Signals
- Writing **`@receiver`** signal handlers with `post_save`
- Using signals for **loose coupling** between apps
- Triggering **async Celery tasks** from signals
- Understanding signal **sender** filtering and `created` flag

### Admin & Tooling
- Registering models with `@admin.register` decorator
- Customizing `list_display`, `list_filter`, `search_fields`, `raw_id_fields`
- Using **`django-extensions`** for development utilities

---

## 2. ⚛️ React & TypeScript Frontend

### React Architecture
- Organizing a project with **feature-based folder structure**
- Building **reusable components** (MetricCard, StatusRow, DropItem)
- Writing **custom hooks** (`useWebSocket`, `useAuth`)
- Understanding the **component lifecycle** with `useEffect` cleanup
- Using **`useRef`** for DOM references (file inputs, dropdown click-outside detection)
- Implementing **controlled forms** with real-time validation

### TypeScript
- Defining **interfaces** for all API response shapes
- Using **generics** (`PaginatedResponse<T>`)
- Writing **discriminated unions** for status types
- Typing **event handlers** (`React.FormEvent`, `React.ChangeEvent`)
- Using **`Record<string, T>`** for dictionary types
- Handling **optional chaining** and **nullish coalescing** safely

### State Management
- Using **Zustand** for global client state (auth, attendance, notifications)
- Differentiating between **server state** (React Query) and **client state** (Zustand)
- Writing Zustand **actions** that call APIs and update state
- Using **`localStorage`** for token persistence across sessions
- Handling **optimistic updates** in notification marking

### Routing
- Setting up **React Router v6** with nested layouts
- Implementing **protected routes** with role-based guards
- Using **`<Outlet />`** for nested page rendering
- Programmatic navigation with **`useNavigate`**
- Using **`NavLink`** with active state styling

### API Integration
- Building an **Axios instance** with base URL and default headers
- Writing **request interceptors** to attach JWT tokens
- Writing **response interceptors** for automatic token refresh on 401
- Handling **API errors** with typed error objects
- Using **`FormData`** for file uploads (avatar images)

### Real-time Features
- Opening and managing **WebSocket connections** in React
- Implementing **reconnection logic** with attempt limits
- Falling back gracefully to **polling** when WebSocket unavailable
- Handling WebSocket **message parsing** and state updates

### UI/UX Engineering
- Building a complete UI using only **inline styles** and CSS variables (no component library)
- Implementing **gradient design system** with consistent tokens
- Creating a **collapsible sidebar** with CSS transitions
- Building **dropdown menus** with click-outside detection
- Implementing **tab navigation** patterns
- Designing **status badges**, **metric cards**, **data tables**
- Handling **loading states**, **empty states**, **error states** consistently
- Building a **live clock** that updates every second

---

## 3. 🗄️ Database & PostgreSQL

- Creating and managing a **PostgreSQL database** via psql CLI
- Creating **users** with specific privileges using `GRANT`
- Understanding **transaction isolation levels**
- Using Django ORM to generate and run **migrations**
- Querying the database through the ORM (no raw SQL needed)
- Understanding **indexes**, **unique constraints**, and **foreign key cascades**
- Using **JSONB** for flexible metadata without schema changes

---

## 4. 🔄 Redis

- Running Redis as a **cache backend** via `django-redis`
- Using Redis as a **Celery message broker** and result store
- Using Redis as a **Django Channels channel layer** for WebSocket routing
- Understanding Redis **key-value** storage and TTL

---

## 5. 🐳 Docker & DevOps

- Writing **multi-service `docker-compose.yml`** files
- Defining **health checks** for database and Redis services
- Writing **multi-stage Dockerfiles** (builder + runtime)
- Configuring **service dependencies** with `depends_on` + `condition`
- Mounting **named volumes** for persistent data
- Setting up **Nginx** as a reverse proxy with upstream configuration
- Configuring **WebSocket upgrade headers** in Nginx
- Separating **dev** and **production** compose files
- Understanding **environment variable** injection into containers

---

## 6. 🔐 Authentication Patterns

- **JWT flow**: login → access token → API calls → refresh on expiry → blacklist on logout
- **OAuth2 flow**: redirect → authorization code → token exchange → user info → profile creation
- **RBAC**: defining roles, enforcing at API level, filtering querysets by role
- **Token storage**: localStorage vs httpOnly cookies trade-offs
- **Auto-refresh**: interceptor-based transparent token renewal

---

## 7. 🏗️ Software Architecture

- **Plugin/adapter pattern**: `BaseHRAdapter` with hookable lifecycle methods
- **Signal-driven architecture**: decoupled apps communicating via Django signals
- **Repository pattern**: API layer in frontend separated from UI components
- **Feature folder structure**: self-contained feature modules
- **Settings splitting**: base/dev/prod with environment-specific overrides
- **12-factor app principles**: config from environment, stateless processes
- **Versioned API design**: `/api/v1/` namespace for future compatibility

---

## 8. 🛠️ Developer Tooling

- **PowerShell scripting** for file generation and project setup
- **Python scripting** for file writing when shell encoding fails
- **VS Code** workflow for full-stack development
- **Git** project structure and `.gitignore` configuration
- **pip** dependency management with `requirements.txt`
- **npm** package management with `package.json`
- **Vite** build tool configuration and optimization
- **Environment files** (`.env`, `.env.example`, `.env.production`)

---

## 9. 🧠 Problem-Solving Skills

Throughout this project, real engineering challenges were encountered and solved:

| Problem | Solution |
|---------|----------|
| PowerShell mangles backticks in heredocs | Used Python scripts to write files instead |
| VS Code locks files during writes | Closed file tabs before overwriting |
| `utils` module not found by Django | Created `__init__.py`, fixed Python path |
| Duplicate `frontend/frontend/` folder | Identified with `Get-ChildItem -Recurse`, deleted nested copy |
| Vite caching stale module resolutions | Used `npm run dev -- --force` to bust cache |
| `runserver` doesn't support WebSockets | Switched to Daphne ASGI server |
| HR/Admin couldn't approve PTO | Fixed role check from `is_manager` to include `hr`/`admin` |
| WebSocket spamming 404 on reconnect | Added max attempt counter with polling fallback |
| Settings split broke `manage.py` | Updated `DJANGO_SETTINGS_MODULE` in `manage.py` and `wsgi.py` |

---

## 10. 📐 What You Can Build Next

With the skills from this project, you can confidently build:

- **Any SaaS application** with multi-role access control
- **Real-time dashboards** with WebSocket data feeds
- **Any REST API** with Django REST Framework
- **Background processing systems** with Celery
- **OAuth2-integrated applications** (login with Google, GitHub, etc.)
- **Containerized microservices** with Docker
- **Data-heavy frontends** with React + TypeScript + Zustand
- **Production-ready systems** with proper env management, security, and deployment

---

<div align="center">

## 🏆 Summary

> This project covers **Full-Stack Web Development** end-to-end:
> from database schema design to REST API to real-time WebSockets
> to React state management to Docker deployment.
>
> **Every concept here is production-applicable.**
> Not tutorial code. Not toy examples.
> Real engineering decisions, real trade-offs, real solutions.

**Emmanuel M. Jesse · Dev Kenya · 2026**

*Built with discipline, curiosity, and a lot of coffee. ☕*

</div>
