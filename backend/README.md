# House of Daksha API

The API stores collection and dress records in PostgreSQL, serves published catalog data, and keeps admin images in Cloudinary.

## Local setup

1. Create a PostgreSQL database and a Cloudinary account.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`, a random `JWT_SECRET` of at least 32 characters, and the three Cloudinary credentials. Set `WEB_ORIGIN` to the exact frontend origin (for example, `http://localhost:5173`).
3. Install and start the API:

   ```sh
   cd backend
   npm install
   npm run dev
   ```

   The API creates its tables on startup.
4. In another terminal, create the first admin account:

   ```sh
   cd backend
   npm run admin:create
   ```

5. Start the frontend with `cd frontend && npm install && npm run dev`; open `#/admin/login` to manage the store.

The frontend proxies `/api` to `http://localhost:4000` during local development. For deployment, set `VITE_API_BASE_URL` to the API origin if it differs from the website origin, set `WEB_ORIGIN` to the deployed site origin, and use HTTPS. Keep `.env` and all provider secrets out of source control.

## Admin workflow

Create and publish a collection, then add dresses and assign them to that collection. Published collections appear on the Collections page; published dresses appear in Shop and their collection page. Each dress has a dedicated detail page with its price, description, sizes, fabric, care instructions, and photo.
