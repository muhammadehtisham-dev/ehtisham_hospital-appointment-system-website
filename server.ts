import { GoogleGenAI } from "@google/genai";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import express from "express";
import jwt from "jsonwebtoken";
import path from "path";
import { createServer as createViteServer } from "vite";

const db = new Database("hospital.db");

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'patient',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    experience INTEGER NOT NULL,
    availability TEXT NOT NULL,
    image_url TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
  );
`);

// Seed initial doctors if empty
const doctorCount = db.prepare("SELECT COUNT(*) as count FROM doctors").get() as { count: number };
if (doctorCount.count === 0) {
  const seedDoctors = [
    { name: "Dr. Sarah Johnson", specialization: "Cardiologist", experience: 12, availability: "Mon-Fri, 9AM-5PM", image_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200", description: "Expert in heart health and cardiovascular diseases." },
    { name: "Dr. Michael Chen", specialization: "Neurologist", experience: 15, availability: "Tue-Sat, 10AM-6PM", image_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200", description: "Specializing in brain disorders and nervous system." },
    { name: "Dr. Emily Brown", specialization: "Pediatrician", experience: 8, availability: "Mon-Thu, 8AM-4PM", image_url: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200", description: "Dedicated to child healthcare and wellness." },
    { name: "Dr. James Wilson", specialization: "Orthopedic", experience: 20, availability: "Wed-Sun, 11AM-7PM", image_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200", description: "Expert in bone and joint surgeries." }
  ];
  const insertDoctor = db.prepare("INSERT INTO doctors (name, specialization, experience, availability, image_url, description) VALUES (?, ?, ?, ?, ?, ?)");
  seedDoctors.forEach(d => insertDoctor.run(d.name, d.specialization, d.experience, d.availability, d.image_url, d.description));
}

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-123";

// Middleware for Auth
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(name, email, hashedPassword, role || 'patient');
    const token = jwt.sign({ id: result.lastInsertRowid, email, role: role || 'patient', name }, JWT_SECRET);
    res.status(201).json({ token, user: { id: result.lastInsertRowid, name, email, role: role || 'patient' } });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// --- DOCTOR ROUTES ---
app.get("/api/doctors", (req, res) => {
  const doctors = db.prepare("SELECT * FROM doctors").all();
  res.json(doctors);
});

app.post("/api/doctors", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { name, specialization, experience, availability, image_url, description } = req.body;
  const result = db.prepare("INSERT INTO doctors (name, specialization, experience, availability, image_url, description) VALUES (?, ?, ?, ?, ?, ?)").run(name, specialization, experience, availability, image_url, description);
  res.status(201).json({ id: result.lastInsertRowid });
});

app.delete("/api/doctors/:id", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  db.prepare("DELETE FROM doctors WHERE id = ?").run(req.params.id);
  res.sendStatus(204);
});

// --- APPOINTMENT ROUTES ---
app.post("/api/appointments", authenticateToken, (req: any, res) => {
  const { doctor_id, appointment_date, appointment_time } = req.body;
  const patient_id = req.user.id;

  // Check for double booking
  const existing = db.prepare("SELECT * FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ?").get(doctor_id, appointment_date, appointment_time);
  if (existing) {
    return res.status(400).json({ error: "Time slot already booked for this doctor" });
  }

  const result = db.prepare("INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time) VALUES (?, ?, ?, ?)").run(patient_id, doctor_id, appointment_date, appointment_time);
  res.status(201).json({ id: result.lastInsertRowid });
});

app.get("/api/appointments/patient", authenticateToken, (req: any, res) => {
  const appointments = db.prepare(`
    SELECT a.*, d.name as doctor_name, d.specialization 
    FROM appointments a 
    JOIN doctors d ON a.doctor_id = d.id 
    WHERE a.patient_id = ?
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `).all(req.user.id);
  res.json(appointments);
});

app.get("/api/appointments/admin", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const appointments = db.prepare(`
    SELECT a.*, d.name as doctor_name, u.name as patient_name 
    FROM appointments a 
    JOIN doctors d ON a.doctor_id = d.id 
    JOIN users u ON a.patient_id = u.id
    ORDER BY a.appointment_date DESC
  `).all();
  res.json(appointments);
});

app.patch("/api/appointments/:id/status", authenticateToken, (req: any, res) => {
  const { status } = req.body;
  db.prepare("UPDATE appointments SET status = ? WHERE id = ?").run(status, req.params.id);
  res.sendStatus(204);
});

// --- AI CHATBOT ROUTE ---
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    
    // Fetch doctors for context
    const doctors = db.prepare("SELECT name, specialization, availability FROM doctors").all() as any[];
    const doctorsContext = doctors.map(d => `${d.name} (${d.specialization}) - Available: ${d.availability}`).join("\n");

    const systemInstruction = `You are a helpful hospital assistant for "MediCare Hospital". 
    You can help patients book appointments, cancel them, and list doctors.
    Current Doctors List:
    ${doctorsContext}
    
    If a user wants to book, ask for doctor name, date, and time.
    If a user wants to cancel, ask for appointment ID.
    Be polite and professional.`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemInstruction }] },
        ...history.map((h: any) => ({ role: h.role, parts: [{ text: h.text }] })),
        { role: "user", parts: [{ text: message }] }
      ]
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

// --- VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(3000, "0.0.0.0", () => {
    console.log("Server running on http://localhost:3000");
  });
}

startServer();
