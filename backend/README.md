# House of Daksha API (FastAPI)

The Python API preserves the storefront's `/api` routes and response shapes. It stores collections, products, and admin records in Supabase Postgres, signs the admin session cookie, and uploads product photos to Cloudinary.

## Run locally

1. Install Python 3.11 or newer and create a Cloudinary account.
2. In this directory, copy `.env.example` to `.env`. Set `DATABASE_URL`, a `JWT_SECRET` with at least 32 characters, the exact frontend `WEB_ORIGIN`, and Cloudinary credentials. Use the Supabase session-pooler URI for hosted deployments.
3. Install and run the API:

   ```sh
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload --host 0.0.0.0 --port 4000
   ```

   The API creates its tables at startup. The Vite frontend proxies `/api` to port 4000 in development.
4. In another terminal, create the first admin account:

   ```sh
   cd backend
   source .venv/bin/activate
   python scripts/create_admin.py admin@example.com
   ```

   It prompts for the password. Open the storefront at `#/admin/login`.

## Deploy the API to Railway

1. Create a Railway project from this repository and add a service using the `backend` directory as its root. Railway detects `requirements.txt`; use `uvicorn main:app --host 0.0.0.0 --port $PORT` as the start command.
2. Add these Railway variables: `DATABASE_URL`, `DATABASE_SSL=true`, `DATABASE_POOL_SIZE=5`, `JWT_SECRET` (a random value of at least 32 characters), `WEB_ORIGIN` (the exact Vercel site origin), `NODE_ENV=production`, `COOKIE_SAME_SITE=none`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
3. Generate a Railway public domain, then set `VITE_API_BASE_URL` in the Vercel frontend project to that API origin and redeploy the frontend. The health endpoint is `/api/health`.
4. In Railway's service shell, run `python scripts/create_admin.py your-admin-email`. Enter the password at the prompt.

Keep all database, signing, and Cloudinary secrets in the hosting provider's environment settings. A custom API subdomain can later be pointed to the Railway service without changing the database.

## Admin workflow

Create and publish a collection, then add dresses and assign them to that collection. Published collections appear on the Collections page; published dresses appear in Shop and the matching collection page. Each dress has a detail page with its price, description, sizes, fabric, care instructions, and photo.
