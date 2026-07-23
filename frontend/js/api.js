// Small helper file so we don't have to repeat fetch() options
// (like credentials: "include") in every single page.

const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" 
  ? "http://localhost:5000/api" 
  : "/api";

async function apiRequest(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include", // IMPORTANT: sends the session cookie along with the request
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(API_BASE + endpoint, options);
  const data = await response.json();

  if (!response.ok) {
    // throw so that calling code's try/catch can show the message
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

// Checks if someone is logged in; if not, sends them back to the home page.
// Call this at the top of every protected page's <script>.
async function requireLogin() {
  try {
    const res = await apiRequest("/auth/me");
    return res.user;
  } catch (err) {
    window.location.href = "index.html";
  }
}

function showToast(message, isError = false) {
  // very small custom toast using bootstrap alert, no extra library needed
  const container = document.getElementById("toast-container");
  if (!container) {
    alert(message); // fallback if a page forgot to add the container div
    return;
  }
  const div = document.createElement("div");
  div.className = `alert ${isError ? "alert-danger" : "alert-success"} shadow-sm`;
  div.style.minWidth = "250px";
  div.textContent = message;
  container.appendChild(div);
  setTimeout(() => div.remove(), 3500);
}
