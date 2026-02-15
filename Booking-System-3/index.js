require("dotenv").config();

const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const path = require("path");

// Timestamp
function timestamp() {
  const now = new Date();
  return now.toISOString().replace("T", " ").replace("Z", "");
}

// --- Middleware ---
app.use(express.json()); // Parse application/json
app.use(express.urlencoded({ extended: true })); // Parse form data

// Serve everything in ./public as static assets
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

// FIXED: Content Security Policy (more permissive for development)
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; connect-src 'self' http://localhost:5000"
  );
  next();
});

// --- Views (HTML pages) ---
// GET /  -> serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// FIXED: GET /resources -> serve resources.html directly (not JSON)
app.get("/resources", (req, res) => {
  res.sendFile(path.join(publicDir, "resources.html"));
});

// FIXED: GET /resources.html -> also works directly
app.get("/resources.html", (req, res) => {
  res.sendFile(path.join(publicDir, "resources.html"));
});

// ============= ADDED: MISSING ROUTES (fix 404 errors) =============

// Login route
app.get("/login", (req, res) => {
  res.json({ 
    success: true, 
    message: "Login endpoint - UI coming soon",
    timestamp: timestamp()
  });
});

// Register route
app.get("/register", (req, res) => {
  res.json({ 
    success: true, 
    message: "Register endpoint - UI coming soon",
    timestamp: timestamp()
  });
});

// Bookings route
app.get("/bookings", (req, res) => {
  res.json({ 
    success: true, 
    bookings: [
      { id: 1, resource: "Sample Booking 1", date: "2026-02-15" },
      { id: 2, resource: "Sample Booking 2", date: "2026-02-16" }
    ],
    message: "Bookings retrieved successfully"
  });
});

// POST /bookings
app.post("/bookings", (req, res) => {
  const { resource, date, price } = req.body;
  console.log("New booking created:", { resource, date, price });
  res.json({ 
    success: true, 
    message: "Booking created successfully",
    booking: { id: Date.now(), resource, date, price }
  });
});

// Privacy policy
app.get("/privacypolicy", (req, res) => {
  res.json({ 
    success: true, 
    message: "Privacy Policy",
    content: "Your privacy is important to us. This policy explains how we handle your data."
  });
});

// Terms of use
app.get("/terms", (req, res) => {
  res.json({ 
    success: true, 
    message: "Terms of Use",
    content: "Please read these terms carefully before using our service."
  });
});

// Cookie policy
app.get("/cookiepolicy", (req, res) => {
  res.json({ 
    success: true, 
    message: "Cookie Policy",
    content: "We use cookies to improve your experience on our site."
  });
});

// ============= API ROUTES =============

// FIXED: GET /api/resources -> JSON data for JavaScript
app.get("/api/resources", (req, res) => {
  res.json({ 
    success: true, 
    resources: [
      { id: 1, name: "Conference Room", price: 0.18, unit: "hour", available: true, description: "Perfect for meetings" },
      { id: 2, name: "Projector", price: 0, unit: "day", available: true, description: "HD Projector for presentations" },
      { id: 3, name: "Meeting Room", price: 25, unit: "hour", available: true, description: "Small meeting room with whiteboard" }
    ]
  });
});

// FIXED: POST /api/resources -> create/update/delete based on "action"
app.post("/api/resources", (req, res) => {
  const {
    action = "",
    resourceName = "",
    resourceDescription = "",
    resourceAvailable = false,
    resourcePrice = 0,
    resourcePriceUnit = "",
  } = req.body || {};

  // Normalize inputs
  const resourceAction = String(action).trim();
  const name = String(resourceName).trim();
  const description = String(resourceDescription || "").trim(); // FIXED: use actual description
  const available = resourceAvailable === "true" || resourceAvailable === true;
  const price = Number.isFinite(Number(resourcePrice))
    ? Number(resourcePrice)
    : 0;
  const unit = String(resourcePriceUnit || "").trim();

  // Log to console
  console.log("The client's POST request ", `[${timestamp()}]`);
  console.log("--------------------------");
  console.log("Action ➡️ ", resourceAction);
  console.log("Name ➡️ ", name);
  console.log("Description ➡️ ", description);
  console.log("Available ➡️ ", available);
  console.log("Price ➡️ ", price);
  console.log("Price unit ➡️ ", unit);
  console.log("--------------------------");
  
  // Return success with created resource
  return res.json({ 
    success: true, 
    message: "Resource created successfully",
    resource: {
      id: Date.now(),
      name,
      description,
      available,
      price,
      unit,
      created: timestamp()
    }
  });
});

// FIXED: Handle POST to /resources (form submissions)
app.post("/resources", (req, res) => {
  console.log("Form submitted to /resources", `[${timestamp()}]`);
  console.log("Body:", req.body);
  
  // Redirect back to resources page after creation
  res.redirect("/resources");
});

// ============= ADDED: Health check endpoint =============
app.get("/health", (req, res) => {
  res.json({ 
    success: true, 
    status: "OK", 
    timestamp: timestamp(),
    uptime: process.uptime()
  });
});

// --- Fallback 404 for unknown API routes ---
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found", success: false });
});

// FIXED: 404 handler for any unmatched routes
app.use((req, res) => {
  // Don't send JSON for HTML requests
  if (req.url.includes(".html") || req.url === "/resources") {
    return res.status(404).sendFile(path.join(publicDir, "404.html"));
  }
  
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.url} not found`,
    tip: "Check available routes: /, /login, /register, /bookings, /privacypolicy, /terms, /cookiepolicy, /resources, /resources.html, /api/resources, /health"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ 
    success: false, 
    message: "Something went wrong on the server",
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Available routes:`);
  console.log(`- GET  / -> index.html`);
  console.log(`- GET  /resources -> resources.html`);
  console.log(`- GET  /resources.html -> resources.html`);
  console.log(`- GET  /login`);
  console.log(`- GET  /register`);
  console.log(`- GET  /bookings`);
  console.log(`- POST /bookings`);
  console.log(`- GET  /privacypolicy`);
  console.log(`- GET  /terms`);
  console.log(`- GET  /cookiepolicy`);
  console.log(`- GET  /api/resources (JSON data)`);
  console.log(`- POST /api/resources (create resources)`);
  console.log(`- POST /resources (form handler)`);
  console.log(`- GET  /health`);
});