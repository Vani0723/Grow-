# 🚀 1-Click Deployment Guide (100% Free)

This guide shows how to deploy your **Smart Market Watchlist** full-stack application (Frontend + Backend + Database) for free using **Render**, **Vercel**, and **MongoDB Atlas**.

---

## 🛠️ Step 1: Set Up Free Database (MongoDB Atlas)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create an **M0 Free Cluster**.
3. Under **Database Access**, create a database user and password.
4. Under **Network Access**, add IP `0.0.0.0/0` (Allow Access from Anywhere).
5. Click **Connect** → **Drivers** and copy your `MONGO_URI`:
   ```env
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/smart-watchlist?retryWrites=true&w=majority
   ```

---

## ⚡ Step 2: Deploy on Render.com (Recommended - Single Full Stack Web Service)

1. Sign up at [Render.com](https://render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository: `https://github.com/Vani0723/Grow-.git`
4. Fill in the deployment settings:
   - **Name**: `smart-market-watchlist`
   - **Environment**: `Node`
   - **Region**: Oregon or Singapore
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Scroll down to **Environment Variables** and add:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | `mongodb+srv://...` (from Step 1) |
   | `JWT_SECRET` | `super_secret_jwt_key_123!` |
   | `REFRESH_SECRET` | `super_secret_refresh_key_456!` |
   | `PORT` | `5002` |

6. Click **Create Web Service**. Your application will be live in 2 minutes at `https://smart-market-watchlist.onrender.com`!

---

## 🌐 Alternative: Deploy Frontend on Vercel + Backend on Render

If you prefer separate deployment:
- **Backend**: Deploy `/server` folder on Render or Railway.
- **Frontend**: Connect `/client` folder to Vercel ([vercel.com](https://vercel.com)) with environment variable `VITE_API_URL=https://your-backend.onrender.com`.

---

## 🚢 Local Production Test

To test the production build locally before deploying:

```bash
npm run build
npm start
```
Then visit `http://localhost:5002` in your browser.
