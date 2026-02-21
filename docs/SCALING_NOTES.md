# Scaling Notes — TaskFlow

## Overview

TaskFlow is structured for straightforward scaling from a single-server dev setup to a horizontally-scaled cloud deployment. Below is the strategy for each layer.

---

## Frontend (Next.js)

- **Static hosting / CDN**: Deploy the Next.js app to **Vercel** or **AWS CloudFront** — pages and assets are cached globally at the edge.
- **Code splitting**: Next.js automatically splits bundles per page — only what's needed is downloaded.
- **Incremental Static Regeneration (ISR)**: Public pages (landing, docs) can use `revalidate` to serve cached HTML and regenerate in the background.
- **Dynamic API routes** (`/api/*`) run as serverless functions — they auto-scale with traffic.
- **Environment-based API URLs**: `NEXT_PUBLIC_API_URL` lets the frontend point to any backend environment.

---

## Backend (Node.js / Express)

- **Horizontal scaling**: Run multiple Express instances behind a **load balancer** (AWS ALB, NGINX). Because JWT is stateless, no session stickiness is needed.
- **PM2 / Docker**: Use PM2 cluster mode locally or Docker with replicas for multi-core usage.
- **Rate limiting**: Already implemented with `express-rate-limit`. For distributed deployments, move state to **Redis** (use `rate-limit-redis` store).
- **Containerization**: Dockerfile + Docker Compose for reproducible deploys. Use Kubernetes for orchestration at scale.
- **Secrets management**: Replace `.env` files with **AWS Secrets Manager** or **HashiCorp Vault**.

---

## Database (MongoDB)

- **Replica Sets**: Enable read replicas for read-heavy workloads. Writes go to primary, reads fan out to secondaries.
- **Sharding**: Shard the `tasks` collection by `userId` when data grows beyond a single node.
- **Indexing**: Already indexed `{ user, status }` and `{ user, createdAt }`. Add text indexes on `title` + `description` for MongoDB Atlas Search.
- **Connection pooling**: Mongoose manages a connection pool — tune `maxPoolSize` per instance.
- **MongoDB Atlas**: Managed service with auto-scaling, backups, and global clusters.

---

## Auth (JWT)

- **Stateless by design**: JWTs carry all auth info — no shared session store needed.
- **Refresh tokens**: Add a short-lived access token (15 min) + long-lived refresh token (30 days) stored in `httpOnly` cookies for higher security.
- **Token blacklisting on logout**: Store invalidated JWTs in Redis with TTL = token expiry for secure logout.

---

## Caching

- **Redis**: Cache frequent reads (user profile, task list) with short TTLs.
- **API response caching**: Add `Cache-Control` headers or use a reverse proxy (NGINX / Varnish).
- **Client-side**: SWR or React Query for stale-while-revalidate caching patterns.

---

## Observability

- **Logging**: Replace `morgan` with **Winston** + ship logs to **CloudWatch / Datadog**.
- **Error tracking**: Integrate **Sentry** for both frontend and backend.
- **Health checks**: `GET /api/health` is already implemented. Wire to load balancer health checks.
- **Metrics**: Expose Prometheus metrics via `prom-client` for latency, error rates, and throughput.

---

## CI/CD

- **GitHub Actions**: Run lint + tests on every PR, auto-deploy to staging on merge to `main`.
- **Blue/Green deploys**: Zero-downtime deployments by routing traffic to a new environment before decommissioning the old one.
