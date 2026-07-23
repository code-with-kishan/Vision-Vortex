# 🌱 Vision Vortex — Digital Farm Management Portal
### (Antimicrobial Usage Tracking) — B.Tech First Year Mini Project

This is a simple full-stack web project that helps farmers and vets keep digital
records of livestock, medicine usage (especially antimicrobials), vaccinations,
and medicine inventory, instead of using paper registers.

---

## 1. Tech Stack Used

- **Frontend:** Plain HTML, CSS, JavaScript, Bootstrap 5 (no framework, no build step)
- **Backend:** Node.js + Express.js
- **Database:** MySQL
- **Authentication:** express-session + bcryptjs (session-based login, not JWT — kept simple on purpose)
- **Charts:** Chart.js (loaded from CDN)

We picked this stack because it only uses concepts a first-year CSE student
already knows: basic HTML/CSS/JS, simple SQL, and basic server-side routes.

---

## 2. Folder Structure

```
vision-vortex/
├── backend/
│   ├── config/db.js          -> MySQL connection pool
│   ├── middleware/authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── animalRoutes.js
│   │   ├── medicineRoutes.js     (antimicrobial tracking + withdrawal period logic)
│   │   ├── vaccinationRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── alertRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── userRoutes.js         (admin only)
│   │   └── reportRoutes.js
│   ├── db/
│   │   ├── schema.sql          -> run this first to create the database
│   │   └── seed.js             -> run this to create 3 test logins
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── index.html, about.html, features.html, faq.html, contact.html, 404.html
    ├── register.html, login-farmer.html, login-vet.html, login-admin.html
    ├── css/style.css
    ├── js/api.js
    └── pages/
        ├── dashboard.html
        ├── animals.html
        ├── medicines.html
        ├── vaccination.html
        ├── inventory.html
        ├── analytics.html
        ├── reports.html
        ├── settings.html
        └── admin.html
```

---

## 3. Installation Steps

### Step 1 — Set up the database
1. Open MySQL Workbench (or the `mysql` command line).
2. Run the file `backend/db/schema.sql`. This creates the database
   `vision_vortex_farm` and all the tables.

### Step 2 — Set up the backend
```bash
cd backend
npm install
cp .env.example .env
```
Open `.env` and put in your own MySQL password:
```
DB_PASSWORD=your_mysql_password
```
Then run the seed script once, to create test accounts:
```bash
npm run seed
```
Then start the server:
```bash
npm run dev
```
The backend will now be running at `http://localhost:5000`.

### Step 3 — Open the frontend
The frontend does not need any build step — it's plain HTML/CSS/JS.
The easiest way to run it is with the **Live Server** extension in VS Code:
1. Open the `frontend` folder in VS Code.
2. Right-click `index.html` → "Open with Live Server".
3. It will usually open at `http://127.0.0.1:5500`.

(If your Live Server opens on a different port, update `CLIENT_URL` in the
backend's `.env` file to match, and restart the backend.)

### Step 4 — Login
Use one of the seeded test accounts:
| Role   | Email             | Password      |
|--------|-------------------|---------------|
| Farmer | farmer@test.com   | Password@123  |
| Vet    | vet@test.com      | Password@123  |
| Admin  | admin@test.com    | Password@123  |

Or click "Get Started" on the home page to register your own farmer/vet account.

---

## 4. Important Concept — Withdrawal Period

This is the main idea behind the "antimicrobial tracking" part of the project.

When an antimicrobial medicine is given to an animal, its milk or meat should
not be sold for a certain number of days after the treatment ends — this is
called the **withdrawal period**. It exists so that medicine residue does not
end up in the food supply.

In our system:
- You enter the medicine's `End Date` and the `Withdrawal Period (in days)`.
- The backend automatically calculates `withdrawal_end_date = end_date + withdrawal_days`.
- If that date is still in the future, the animal shows up under "Active
  Withdrawal Periods" on the dashboard, and a badge appears on the Medicine
  Records page.

---

## 5. PDF Reports

We did not use a PDF library (like pdfkit) to keep things simple. Instead,
the Reports page loads the data into a normal HTML table, and there is a
"Print / Save as PDF" button that uses the browser's own print feature
(`window.print()`). When you print, choose "Save as PDF" as the destination,
and you'll get a real PDF file of the report.

---

## 6. Known Limitations (see report for full list)

- Password reset by email is not implemented (would need a mail service).
- Deleting an animal does not automatically delete its medicine/vaccination
  history in the UI warning sense — the database does cascade-delete them
  (see `ON DELETE CASCADE` in schema.sql), but there's no "are you sure, this
  will also delete X medicine records" warning yet.
- No automatic email/SMS reminders — alerts are only visible inside the app.

---

## 7. Deployment (optional, for demo purposes)

- Backend can be deployed to Render (Node.js web service).
- Database can be hosted on a free MySQL host such as Railway or Clever Cloud.
- Frontend can be deployed as a static site on Netlify or Vercel — just update
  `API_BASE` in `frontend/js/api.js` to point to your deployed backend URL.
