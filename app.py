"""
====================================================================
 Vision Vortex - Digital Farm Management Portal
 app.py

 This single file contains EVERY page of the website (HTML + CSS,
 all written inside this one Python file using Flask) so that the
 whole frontend can be viewed just by running this one file.

 I put everything in one file on purpose because that's what was
 asked - normally I would split HTML/CSS into separate templates
 and static files (and I did that in the "real" project structure),
 but this file is a self-contained version so it's easy to just
 run "python app.py" and see every page without setting up MySQL
 or Node.js first.

 HOW TO RUN:
    1. pip install flask
    2. python app.py
    3. open http://127.0.0.1:5000 in your browser

 NOTE: This file only shows the FRONTEND design (all pages, with
 sample/demo data). It does not connect to the real MySQL database -
 that part is handled by the Node.js backend (see /backend folder
 in the main project). Buttons like "Login" and "Add Animal" here
 just show what the page looks like; they don't actually save data,
 since this file's only job is to display all the pages together.
====================================================================
"""

from flask import Flask, request

app = Flask(__name__)

# --------------------------------------------------------------
# 1. CSS - written once here and reused on every page
# --------------------------------------------------------------
CSS_STYLES = """
    :root {
        --green: #16a34a;
        --green-dark: #15803d;
        --green-light: #dcfce7;
        --blue: #2563eb;
        --blue-light: #dbeafe;
        --white: #ffffff;
        --gray-text: #4b5563;
        --bg: #f7faf8;
    }

    * { box-sizing: border-box; }

    body {
        font-family: 'Segoe UI', Arial, sans-serif;
        background-color: var(--bg);
        color: #1f2937;
        margin: 0;
        padding: 0;
    }

    /* ---------- Navbar ---------- */
    .navbar-custom {
        background: linear-gradient(90deg, var(--green-dark), var(--green));
        padding: 14px 30px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    .navbar-custom .brand {
        color: white;
        font-size: 22px;
        font-weight: 700;
        text-decoration: none;
    }
    .navbar-custom .nav-links {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
    }
    .navbar-custom .nav-links a {
        color: #eafff1;
        text-decoration: none;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
    }
    .navbar-custom .nav-links a:hover,
    .navbar-custom .nav-links a.active {
        background-color: rgba(255,255,255,0.18);
        color: white;
    }

    /* ---------- Layout helpers ---------- */
    .page-wrap { max-width: 1150px; margin: 0 auto; padding: 30px 20px 60px 20px; }
    .section-title { font-size: 26px; font-weight: 700; margin-bottom: 6px; color: var(--green-dark); }
    .section-sub { color: var(--gray-text); margin-bottom: 25px; }

    /* ---------- Cards ---------- */
    .card-box {
        background: var(--white);
        border-radius: 16px;
        padding: 22px;
        box-shadow: 0 4px 18px rgba(0,0,0,0.06);
        border: 1px solid #eef2ef;
        margin-bottom: 20px;
    }
    .grid {
        display: grid;
        gap: 20px;
    }
    .grid-2 { grid-template-columns: repeat(2, 1fr); }
    .grid-3 { grid-template-columns: repeat(3, 1fr); }
    .grid-4 { grid-template-columns: repeat(4, 1fr); }
    @media (max-width: 900px) {
        .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 600px) {
        .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
        .navbar-custom { flex-direction: column; align-items: flex-start; }
    }

    /* ---------- Buttons ---------- */
    .btn-vv {
        display: inline-block;
        background-color: var(--green);
        color: white;
        border: none;
        padding: 10px 22px;
        border-radius: 10px;
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;
        font-size: 14px;
    }
    .btn-vv:hover { background-color: var(--green-dark); color: white; }
    .btn-blue { background-color: var(--blue); }
    .btn-blue:hover { background-color: #1d4ed8; }
    .btn-outline {
        background: white;
        border: 2px solid var(--green);
        color: var(--green-dark);
    }

    /* ---------- Forms ---------- */
    .form-box { max-width: 420px; margin: 40px auto; }
    .form-control-vv {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 10px;
        margin-bottom: 14px;
        font-size: 14px;
    }
    label.vv-label { font-weight: 600; font-size: 14px; margin-bottom: 4px; display: block; }

    /* ---------- Tables ---------- */
    table.vv-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    table.vv-table th {
        background-color: var(--green-light);
        text-align: left;
        padding: 10px;
        color: var(--green-dark);
    }
    table.vv-table td { padding: 10px; border-bottom: 1px solid #f0f0f0; }
    table.vv-table tr:hover { background-color: #fafffb; }

    /* ---------- Badges ---------- */
    .badge-vv {
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
    }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-red { background: #fee2e2; color: #b91c1c; }
    .badge-amber { background: #fef3c7; color: #92400e; }
    .badge-blue { background: var(--blue-light); color: #1e40af; }

    /* ---------- Hero (Home page) ---------- */
    .hero {
        background: linear-gradient(135deg, var(--green-dark), var(--green));
        color: white;
        padding: 70px 20px;
        text-align: center;
    }
    .hero h1 { font-size: 34px; margin-bottom: 12px; }
    .hero p { font-size: 16px; max-width: 600px; margin: 0 auto 25px auto; opacity: 0.95; }

    /* ---------- Sidebar (dashboard-style pages) ---------- */
    .dash-layout { display: flex; gap: 20px; }
    .dash-sidebar {
        width: 210px;
        background: var(--white);
        border-radius: 16px;
        padding: 16px;
        box-shadow: 0 4px 18px rgba(0,0,0,0.06);
        height: fit-content;
    }
    .dash-sidebar a {
        display: block;
        padding: 10px 12px;
        border-radius: 8px;
        color: #374151;
        text-decoration: none;
        font-size: 14px;
        margin-bottom: 4px;
    }
    .dash-sidebar a:hover, .dash-sidebar a.active { background: var(--green-light); color: var(--green-dark); font-weight: 600; }
    .dash-main { flex: 1; min-width: 0; }
    @media (max-width: 800px) {
        .dash-layout { flex-direction: column; }
        .dash-sidebar { width: 100%; }
    }

    .stat-number { font-size: 26px; font-weight: 700; color: var(--green-dark); }
    .stat-label { font-size: 13px; color: var(--gray-text); }

    footer.vv-footer {
        background-color: #14532d;
        color: #d1fae5;
        text-align: center;
        padding: 20px;
        font-size: 13px;
        margin-top: 40px;
    }
"""

# --------------------------------------------------------------
# 2. List of pages used to build the navbar (label, url, endpoint name)
# --------------------------------------------------------------
NAV_ITEMS = [
    ("Home", "/"),
    ("About", "/about"),
    ("Features", "/features"),
    ("Dashboard", "/dashboard"),
    ("Animals", "/animals"),
    ("Medicines", "/medicines"),
    ("Vaccination", "/vaccination"),
    ("Analytics", "/analytics"),
    ("Reports", "/reports"),
    ("Contact", "/contact"),
    ("FAQ", "/faq"),
]


def build_navbar(active_path):
    """Builds the top navbar HTML and highlights whichever page is active."""
    links_html = ""
    for label, url in NAV_ITEMS:
        active_class = " active" if url == active_path else ""
        links_html += f'<a class="{active_class.strip()}" href="{url}">{label}</a>'

    return f"""
    <div class="navbar-custom">
        <a class="brand" href="/">🌱 Vision Vortex</a>
        <div class="nav-links">
            {links_html}
            <a href="/login/farmer">Login</a>
            <a href="/register">Register</a>
        </div>
    </div>
    """


def base_page(title, active_path, body_html, extra_head=""):
    """
    This is the master template every page is built from.
    title        -> shown in the browser tab
    active_path  -> which nav link should be highlighted
    body_html    -> the actual content of that page
    extra_head   -> optional extra <script>/<link> tags (used for charts)
    """
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Vision Vortex</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
    <style>{CSS_STYLES}</style>
    {extra_head}
</head>
<body>
    {build_navbar(active_path)}
    <div class="page-wrap">
        {body_html}
    </div>
    <footer class="vv-footer">
        &copy; 2026 Vision Vortex &mdash; Digital Farm Management Portal (B.Tech Mini Project)
    </footer>
</body>
</html>"""


def dash_sidebar(active):
    """Used on the internal app pages (Dashboard, Animals, Medicines, etc.)."""
    items = [
        ("Dashboard", "/dashboard", "bi-speedometer2"),
        ("Animal Registration", "/animals", "bi-clipboard-pulse"),
        ("Medicine Records", "/medicines", "bi-capsule"),
        ("Vaccination", "/vaccination", "bi-shield-plus"),
        ("Analytics", "/analytics", "bi-bar-chart-line"),
        ("Reports", "/reports", "bi-file-earmark-text"),
        ("Settings", "/settings", "bi-gear"),
    ]
    html = '<div class="dash-sidebar">'
    for label, url, icon in items:
        cls = "active" if url == active else ""
        html += f'<a class="{cls}" href="{url}"><i class="bi {icon}"></i> {label}</a>'
    html += "</div>"
    return html


# ================================================================
# 3. ROUTES - one function per page
# ================================================================

@app.route("/")
def home():
    body = """
    <div style="margin:-30px -20px 30px -20px;">
        <div class="hero">
            <h1>Digital Farm Management Portal</h1>
            <p>A simple web platform to help farmers and veterinarians track livestock health,
               antimicrobial usage and withdrawal periods &mdash; built as a first-year B.Tech mini project
               by Team Vision Vortex.</p>
            <a class="btn-vv" href="/register">Get Started</a>
            <a class="btn-vv btn-outline" href="/features" style="margin-left:10px;">See Features</a>
        </div>
    </div>

    <div class="grid grid-3">
        <div class="card-box">
            <i class="bi bi-capsule" style="font-size:26px;color:#16a34a;"></i>
            <h5 style="margin-top:10px;">Antimicrobial Tracking</h5>
            <p style="color:#6b7280;font-size:14px;">Record every medicine given to an animal, along with dosage
            and withdrawal period, so nothing gets forgotten.</p>
        </div>
        <div class="card-box">
            <i class="bi bi-shield-plus" style="font-size:26px;color:#2563eb;"></i>
            <h5 style="margin-top:10px;">Vaccination Reminders</h5>
            <p style="color:#6b7280;font-size:14px;">Know exactly when the next vaccination for each animal is due.</p>
        </div>
        <div class="card-box">
            <i class="bi bi-bar-chart-line" style="font-size:26px;color:#16a34a;"></i>
            <h5 style="margin-top:10px;">Simple Analytics</h5>
            <p style="color:#6b7280;font-size:14px;">A dashboard that shows animal health status and medicine usage at a glance.</p>
        </div>
    </div>

    <div class="card-box" style="text-align:center;">
        <h5>Why this project?</h5>
        <p style="color:#6b7280;">Many small farms still keep medicine records on paper. This makes it hard to track
        withdrawal periods correctly, which can lead to antimicrobial residues in milk/meat. This portal is our attempt,
        as first-year students, to build a simple digital solution for this real problem.</p>
    </div>
    """
    return base_page("Home", "/", body)


@app.route("/about")
def about():
    body = """
    <h1 class="section-title">About This Project</h1>
    <p class="section-sub">Team Vision Vortex &mdash; B.Tech CSE, First Year Mini Project</p>

    <div class="card-box">
        <p>This project, <b>"Development of a Digital Farm Management Portal for Antimicrobial Usage Tracking"</b>,
        was built to help farmers keep digital records of their livestock instead of paper registers. We focused
        specifically on antimicrobial (medicine) usage because improper record keeping of medicines can lead to
        Antimicrobial Resistance (AMR), which is a real and serious problem in both animal and human health.</p>
        <p>As first-year students, we tried to keep the technology simple and easy to understand &mdash; HTML, CSS,
        JavaScript and Bootstrap on the frontend, and Node.js with MySQL on the backend &mdash; while still solving
        a genuine, practical problem.</p>
    </div>

    <div class="grid grid-2">
        <div class="card-box">
            <h5>Our Motivation</h5>
            <p style="color:#6b7280;font-size:14px;">During research for this project we read that WHO and FAO both
            list antimicrobial resistance as one of the top global health threats, and that better record-keeping
            on farms is one of the simplest ways to reduce misuse of antimicrobials.</p>
        </div>
        <div class="card-box">
            <h5>Team Vision Vortex</h5>
            <p style="color:#6b7280;font-size:14px;">A team of first-year CSE (AI &amp; ML) students who worked
            together on the frontend design, backend logic and database design for this mini project.</p>
        </div>
    </div>
    """
    return base_page("About", "/about", body)


@app.route("/features")
def features():
    feature_list = [
        ("bi-person-check", "Role-Based Login", "Separate login for Farmer, Veterinarian and Admin."),
        ("bi-clipboard-pulse", "Animal Registration", "Add and manage animal records with tag, breed, age and health status."),
        ("bi-capsule", "Antimicrobial Usage Tracking", "Log medicine name, dosage, vet name and withdrawal period for every treatment."),
        ("bi-shield-plus", "Vaccination Management", "Track vaccination history and upcoming due dates."),
        ("bi-exclamation-triangle", "Withdrawal Period Alerts", "Get an alert while an animal is still inside its medicine withdrawal period."),
        ("bi-box-seam", "Medicine Inventory", "Keep track of how much medicine stock is left on the farm."),
        ("bi-bar-chart-line", "Analytics Dashboard", "Simple charts showing animal health and medicine usage trends."),
        ("bi-file-earmark-text", "PDF Reports", "Generate a printable report of any module's data."),
        ("bi-search", "Search &amp; Filter", "Quickly find animals or medicine records."),
        ("bi-phone", "Responsive Design", "Works on mobile, tablet and desktop screens."),
    ]
    cards = ""
    for icon, title, desc in feature_list:
        cards += f"""
        <div class="card-box">
            <i class="bi {icon}" style="font-size:24px;color:#16a34a;"></i>
            <h6 style="margin-top:10px;font-weight:700;">{title}</h6>
            <p style="color:#6b7280;font-size:13px;">{desc}</p>
        </div>"""

    body = f"""
    <h1 class="section-title">Features</h1>
    <p class="section-sub">Everything this portal currently supports</p>
    <div class="grid grid-3">{cards}</div>
    """
    return base_page("Features", "/features", body)


def login_page(role_label, role_value, icon):
    body = f"""
    <div class="form-box card-box">
        <div style="text-align:center;margin-bottom:15px;">
            <i class="bi {icon}" style="font-size:30px;color:#16a34a;"></i>
            <h4>{role_label} Login</h4>
        </div>
        <form action="#" method="post">
            <label class="vv-label">Email</label>
            <input class="form-control-vv" type="email" placeholder="you@example.com" required>

            <label class="vv-label">Password</label>
            <input class="form-control-vv" type="password" placeholder="••••••••" required>

            <input type="hidden" name="role" value="{role_value}">
            <button class="btn-vv" style="width:100%;" type="submit">Login as {role_label}</button>
        </form>
        <p style="text-align:center;margin-top:14px;font-size:13px;">
            Don't have an account? <a href="/register">Register here</a>
        </p>
    </div>
    <p style="text-align:center;font-size:12px;color:#9ca3af;">
        Note: this is a frontend demo page. Actual login is handled by the Node.js backend (see /backend/routes/auth.js).
    </p>
    """
    return base_page(f"{role_label} Login", "/login/" + role_value, body)


@app.route("/login/farmer")
def login_farmer():
    return login_page("Farmer", "farmer", "bi-person-badge")


@app.route("/login/vet")
def login_vet():
    return login_page("Veterinarian", "vet", "bi-heart-pulse")


@app.route("/login/admin")
def login_admin():
    return login_page("Admin", "admin", "bi-person-gear")


@app.route("/register")
def register():
    body = """
    <div class="form-box card-box">
        <div style="text-align:center;margin-bottom:15px;">
            <i class="bi bi-person-plus" style="font-size:30px;color:#16a34a;"></i>
            <h4>Create an Account</h4>
        </div>
        <form action="#" method="post">
            <label class="vv-label">Full Name</label>
            <input class="form-control-vv" type="text" placeholder="Your name" required>

            <label class="vv-label">Email</label>
            <input class="form-control-vv" type="email" placeholder="you@example.com" required>

            <label class="vv-label">I am registering as</label>
            <select class="form-control-vv">
                <option value="farmer">Farmer</option>
                <option value="vet">Veterinarian</option>
            </select>

            <label class="vv-label">Farm Name (optional)</label>
            <input class="form-control-vv" type="text" placeholder="Your farm name">

            <label class="vv-label">Password</label>
            <input class="form-control-vv" type="password" placeholder="Create a password" required>

            <button class="btn-vv" style="width:100%;" type="submit">Create Account</button>
        </form>
        <p style="text-align:center;margin-top:14px;font-size:13px;">
            Already have an account? <a href="/login/farmer">Login here</a>
        </p>
    </div>
    """
    return base_page("Register", "/register", body)


@app.route("/dashboard")
def dashboard():
    sidebar = dash_sidebar("/dashboard")
    main = """
    <div class="dash-main">
        <h1 class="section-title">Dashboard</h1>
        <p class="section-sub">Welcome back, Ramesh Kumar (Green Valley Farm)</p>

        <div class="grid grid-4">
            <div class="card-box"><div class="stat-number">18</div><div class="stat-label">Total Animals</div></div>
            <div class="card-box"><div class="stat-number">15</div><div class="stat-label">Healthy Animals</div></div>
            <div class="card-box"><div class="stat-number">3</div><div class="stat-label">Under Treatment</div></div>
            <div class="card-box"><div class="stat-number">2</div><div class="stat-label">Withdrawal Period Active</div></div>
        </div>

        <div class="grid grid-2">
            <div class="card-box">
                <h6>Medicine Usage (Last 6 Months)</h6>
                <canvas id="medChart" height="180"></canvas>
            </div>
            <div class="card-box">
                <h6>Animal Health Status</h6>
                <canvas id="healthChart" height="180"></canvas>
            </div>
        </div>

        <div class="card-box">
            <h6>Recent Alerts</h6>
            <table class="vv-table">
                <tr><th>Type</th><th>Message</th><th>Date</th></tr>
                <tr><td><span class="badge-vv badge-amber">Withdrawal</span></td><td>Animal #A104 withdrawal period active until 2026-07-28</td><td>2026-07-20</td></tr>
                <tr><td><span class="badge-vv badge-blue">Vaccination</span></td><td>Animal #A110 vaccination due in 5 days</td><td>2026-07-21</td></tr>
                <tr><td><span class="badge-vv badge-red">Stock</span></td><td>Oxytetracycline stock is low (2 bottles left)</td><td>2026-07-22</td></tr>
            </table>
        </div>
    </div>
    """
    body = f'<div class="dash-layout">{sidebar}{main}</div>'

    chart_script = """
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>
    <script>
        window.addEventListener('DOMContentLoaded', function () {
            new Chart(document.getElementById('medChart'), {
                type: 'bar',
                data: {
                    labels: ['Feb','Mar','Apr','May','Jun','Jul'],
                    datasets: [{ label: 'Medicine records added', data: [4,6,3,8,5,7], backgroundColor: '#16a34a' }]
                },
                options: { plugins: { legend: { display: false } } }
            });
            new Chart(document.getElementById('healthChart'), {
                type: 'doughnut',
                data: {
                    labels: ['Healthy','Under Treatment','Sick'],
                    datasets: [{ data: [15,3,0], backgroundColor: ['#16a34a','#f59e0b','#ef4444'] }]
                }
            });
        });
    </script>
    """
    return base_page("Dashboard", "/dashboard", body, extra_head=chart_script)


@app.route("/animals")
def animals():
    sidebar = dash_sidebar("/animals")
    main = """
    <div class="dash-main">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
            <div>
                <h1 class="section-title" style="margin-bottom:0;">Animal Registration</h1>
                <p class="section-sub">Manage all registered animals</p>
            </div>
            <button class="btn-vv"><i class="bi bi-plus-lg"></i> Add Animal</button>
        </div>

        <div class="card-box">
            <input class="form-control-vv" style="max-width:300px;display:inline-block;" placeholder="Search by tag or name...">
            <table class="vv-table" style="margin-top:10px;">
                <tr><th>Tag</th><th>Name</th><th>Species</th><th>Age</th><th>Health Status</th><th>Action</th></tr>
                <tr><td>A101</td><td>Ganga</td><td>Cow</td><td>4</td><td><span class="badge-vv badge-green">Healthy</span></td><td><i class="bi bi-pencil"></i> <i class="bi bi-trash"></i></td></tr>
                <tr><td>A102</td><td>Kaveri</td><td>Buffalo</td><td>5</td><td><span class="badge-vv badge-green">Healthy</span></td><td><i class="bi bi-pencil"></i> <i class="bi bi-trash"></i></td></tr>
                <tr><td>A104</td><td>Lakshmi</td><td>Cow</td><td>3</td><td><span class="badge-vv badge-amber">Under Treatment</span></td><td><i class="bi bi-pencil"></i> <i class="bi bi-trash"></i></td></tr>
            </table>
        </div>
    </div>
    """
    body = f'<div class="dash-layout">{sidebar}{main}</div>'
    return base_page("Animal Registration", "/animals", body)


@app.route("/medicines")
def medicines():
    sidebar = dash_sidebar("/medicines")
    main = """
    <div class="dash-main">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
            <div>
                <h1 class="section-title" style="margin-bottom:0;">Medicine Records (Antimicrobial Tracking)</h1>
                <p class="section-sub">Every medicine given to an animal, with withdrawal period</p>
            </div>
            <button class="btn-vv"><i class="bi bi-plus-lg"></i> Add Record</button>
        </div>

        <div class="card-box">
            <table class="vv-table">
                <tr><th>Animal</th><th>Medicine</th><th>Dosage</th><th>Given By</th><th>Withdrawal Ends</th><th>Status</th></tr>
                <tr><td>Lakshmi (A104)</td><td>Oxytetracycline</td><td>10ml / day</td><td>Dr. Anjali Sharma</td><td>2026-07-28</td><td><span class="badge-vv badge-amber">Active</span></td></tr>
                <tr><td>Ganga (A101)</td><td>Multivitamin</td><td>5ml / day</td><td>Dr. Anjali Sharma</td><td>-</td><td><span class="badge-vv badge-green">Completed</span></td></tr>
                <tr><td>Kaveri (A102)</td><td>Amoxicillin</td><td>2 tablets / day</td><td>Dr. Anjali Sharma</td><td>2026-07-24</td><td><span class="badge-vv badge-amber">Active</span></td></tr>
            </table>
        </div>

        <div class="card-box" style="background:#fef3c7;border:1px solid #fde68a;">
            <b>Why withdrawal period matters:</b> milk or meat from an animal should not be sold while its
            withdrawal period is still active, since medicine residue may still be present in its body.
            This page automatically calculates "Withdrawal Ends" as (End Date + Withdrawal Days).
        </div>
    </div>
    """
    body = f'<div class="dash-layout">{sidebar}{main}</div>'
    return base_page("Medicine Records", "/medicines", body)


@app.route("/vaccination")
def vaccination():
    sidebar = dash_sidebar("/vaccination")
    main = """
    <div class="dash-main">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
            <div>
                <h1 class="section-title" style="margin-bottom:0;">Vaccination Tracking</h1>
                <p class="section-sub">Vaccination history and upcoming due dates</p>
            </div>
            <button class="btn-vv"><i class="bi bi-plus-lg"></i> Schedule Vaccination</button>
        </div>
        <div class="card-box">
            <table class="vv-table">
                <tr><th>Animal</th><th>Vaccine</th><th>Given On</th><th>Next Due</th><th>Status</th></tr>
                <tr><td>Ganga (A101)</td><td>FMD Vaccine</td><td>2026-01-15</td><td>2026-07-15</td><td><span class="badge-vv badge-red">Overdue</span></td></tr>
                <tr><td>Kaveri (A102)</td><td>Brucellosis</td><td>2026-06-01</td><td>2026-12-01</td><td><span class="badge-vv badge-green">On Track</span></td></tr>
                <tr><td>Lakshmi (A104)</td><td>HS Vaccine</td><td>2026-07-01</td><td>2026-07-28</td><td><span class="badge-vv badge-amber">Due Soon</span></td></tr>
            </table>
        </div>
    </div>
    """
    body = f'<div class="dash-layout">{sidebar}{main}</div>'
    return base_page("Vaccination", "/vaccination", body)


@app.route("/analytics")
def analytics():
    sidebar = dash_sidebar("/analytics")
    main = """
    <div class="dash-main">
        <h1 class="section-title">Analytics</h1>
        <p class="section-sub">Farm-wide trends</p>
        <div class="grid grid-2">
            <div class="card-box"><h6>Vaccination Compliance</h6><canvas id="c1" height="180"></canvas></div>
            <div class="card-box"><h6>Antimicrobial Usage by Type</h6><canvas id="c2" height="180"></canvas></div>
        </div>
    </div>
    """
    body = f'<div class="dash-layout">{sidebar}{main}</div>'
    chart_script = """
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>
    <script>
        window.addEventListener('DOMContentLoaded', function () {
            new Chart(document.getElementById('c1'), {
                type: 'line',
                data: { labels: ['Feb','Mar','Apr','May','Jun','Jul'],
                    datasets: [{ label: '% vaccinated on time', data: [70,75,80,78,85,90], borderColor:'#2563eb', fill:false }] }
            });
            new Chart(document.getElementById('c2'), {
                type: 'pie',
                data: { labels: ['Antibiotics','Vitamins','Antiparasitic','Other'],
                    datasets: [{ data: [45,25,20,10], backgroundColor: ['#16a34a','#2563eb','#f59e0b','#9ca3af'] }] }
            });
        });
    </script>
    """
    return base_page("Analytics", "/analytics", body, extra_head=chart_script)


@app.route("/reports")
def reports():
    sidebar = dash_sidebar("/reports")
    report_types = ["Animal Report", "Medicine / Antimicrobial Report", "Vaccination Report", "Inventory Report"]
    cards = ""
    for r in report_types:
        cards += f"""
        <div class="card-box">
            <i class="bi bi-file-earmark-pdf" style="font-size:22px;color:#16a34a;"></i>
            <h6 style="margin-top:8px;">{r}</h6>
            <button class="btn-vv" style="margin-top:6px;"><i class="bi bi-download"></i> Download PDF</button>
        </div>"""
    main = f"""
    <div class="dash-main">
        <h1 class="section-title">Reports</h1>
        <p class="section-sub">Generate a printable report for any module</p>
        <div class="grid grid-2">{cards}</div>
    </div>
    """
    body = f'<div class="dash-layout">{sidebar}{main}</div>'
    return base_page("Reports", "/reports", body)


@app.route("/settings")
def settings():
    sidebar = dash_sidebar("/settings")
    main = """
    <div class="dash-main">
        <h1 class="section-title">Settings</h1>
        <p class="section-sub">Manage your account</p>
        <div class="card-box" style="max-width:450px;">
            <label class="vv-label">Full Name</label>
            <input class="form-control-vv" value="Ramesh Kumar">
            <label class="vv-label">Farm Name</label>
            <input class="form-control-vv" value="Green Valley Farm">
            <label class="vv-label">Phone</label>
            <input class="form-control-vv" value="9876543210">
            <button class="btn-vv">Save Changes</button>
        </div>
    </div>
    """
    body = f'<div class="dash-layout">{sidebar}{main}</div>'
    return base_page("Settings", "/settings", body)


@app.route("/contact")
def contact():
    body = """
    <h1 class="section-title">Contact Us</h1>
    <p class="section-sub">Questions about this project? Reach out to Team Vision Vortex.</p>
    <div class="card-box form-box">
        <input class="form-control-vv" placeholder="Your Name">
        <input class="form-control-vv" placeholder="Your Email">
        <textarea class="form-control-vv" rows="4" placeholder="Your Message"></textarea>
        <button class="btn-vv" style="width:100%;">Send Message</button>
    </div>
    """
    return base_page("Contact", "/contact", body)


@app.route("/faq")
def faq():
    qa = [
        ("What is a withdrawal period?", "It is the time after giving medicine to an animal during which its milk or meat should not be sold, since medicine residue may still be present."),
        ("Why is antimicrobial tracking important?", "Overuse or wrong recording of antimicrobials can lead to Antimicrobial Resistance (AMR), which makes future treatments less effective."),
        ("Who can use this portal?", "Farmers, veterinarians, and an admin who manages the overall system."),
        ("Is this project connected to a real database?", "Yes, the full project (see /backend folder) uses a MySQL database with Node.js and Express. This page is only the frontend design."),
    ]
    items = ""
    for q, a in qa:
        items += f"""
        <div class="card-box">
            <b>{q}</b>
            <p style="color:#6b7280;font-size:14px;margin-top:6px;">{a}</p>
        </div>"""
    body = f"""
    <h1 class="section-title">Frequently Asked Questions</h1>
    {items}
    """
    return base_page("FAQ", "/faq", body)


# --------------------------------------------------------------
# 4. 404 PAGE
# --------------------------------------------------------------
@app.errorhandler(404)
def page_not_found(e):
    body = """
    <div style="text-align:center;padding:60px 20px;">
        <h1 style="font-size:70px;color:#16a34a;margin-bottom:0;">404</h1>
        <p style="font-size:18px;color:#4b5563;">Oops! This page does not exist.</p>
        <a class="btn-vv" href="/">Go back to Home</a>
    </div>
    """
    return base_page("Page Not Found", "", body), 404


# --------------------------------------------------------------
# 5. Run the app
# --------------------------------------------------------------
if __name__ == "__main__":
    # debug=True just so the server auto-reloads while I was building this
    app.run(debug=True, port=5000)
