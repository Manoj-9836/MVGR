# HabitLens - Student Wellness Pattern Analyzer

![React](https://img.shields.io/badge/React-18.0-blue?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)
![Python](https://img.shields.io/badge/Python-3.8+-yellow?style=flat-square&logo=python)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

> A comprehensive full-stack prototype system that collects student wellness signals and leverages causal analysis to generate actionable stress and productivity insights.

## 📋 Overview

HabitLens empowers students and educators by transforming daily wellness metrics into meaningful insights. The system captures sleep patterns, screen time, study hours, physical activity, and heart rate, then applies advanced causal analysis to identify key drivers of stress and productivity.

### Key Features

- 🎯 **Multi-Source Wellness Tracking** — Captures sleep, screen time, study hours, steps, and heart rate
- 📊 **Interactive Dashboard** — Real-time visualization of wellness trends with responsive design
- 🧠 **Causal Analysis Engine** — Identifies cause-and-effect relationships in wellness data using Granger causality and DYNOTEARS
- 📈 **Stress Prediction** — Forecasts stress levels based on historical patterns
- 🌍 **Multilingual Support** — Full localization in English, Hindi, Telugu, and Tamil
- 🔒 **Fallback Mode** — Operates in-memory when MongoDB is unavailable
- ⚡ **Production-Ready** — Modular architecture designed for easy extension

---

## 🛠️ Tech Stack

### Frontend
- **React 18** — Modern component-based UI framework
- **Vite 6** — Lightning-fast build tool and dev server
- **Chart.js 4** — Powerful data visualization library
- **CSS3** — Custom properties with responsive design

### Backend
- **Node.js + Express** — RESTful API server
- **MongoDB** — NoSQL database (with in-memory fallback)
- **JavaScript (ES6+)**

### Analysis Microservice
- **Python 3.8+** — Data processing and ML
- **Pandas** — DataFrame manipulation
- **scikit-learn** — Machine learning (RandomForestClassifier)
- **Granger Causality** — Temporal dependency analysis
- **DYNOTEARS** — Causal structure learning

---

## 📁 Project Structure

```
HabitLens/
├── frontend/                      # React + Vite frontend application
│   ├── src/
│   │   ├── components/            # Reusable React components
│   │   ├── pages/                 # Page-level components
│   │   ├── charts/                # Chart visualizations
│   │   ├── services/              # API clients and utilities
│   │   ├── styles/                # Global CSS
│   │   ├── utils/                 # Helper functions and i18n
│   │   └── index.jsx              # App entrypoint
│   ├── package.json               # Frontend dependencies
│   └── vite.config.js             # Vite configuration
│
├── backend/                       # Node.js + Express API server
│   ├── controllers/               # Request handlers
│   ├── routes/                    # API route definitions
│   ├── models/                    # Data models and schemas
│   ├── data/                      # Sample data files
│   ├── scripts/                   # Database utilities
│   ├── utils/                     # Helper functions
│   ├── server.js                  # Express app setup
│   ├── package.json               # Backend dependencies
│   └── .env.example               # Environment template
│
├── analysis/                      # Python causal analysis microservice
│   ├── stress_model.py            # ML model and causal analysis
│   └── requirements.txt           # Python dependencies
│
├── data.json                      # Root-level data storage
├── package.json                   # Root-level npm scripts
└── README.md                      # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v16+ and **npm** v8+
- **Python** 3.8+ with pip
- **MongoDB** (optional — backend uses in-memory mode if unavailable)
- **Windows**, **macOS**, or **Linux**

### Installation

#### 1. Clone and Navigate
```bash
cd HabitLens
```

#### 2. Configure Backend Environment
```bash
copy backend\.env.example backend\.env
```

Edit `.env` to set your MongoDB URI (or leave blank for in-memory mode):
```env
MONGO_URI=mongodb://localhost:27017/habitlens
PORT=5000
```

#### 3. Install All Dependencies
```bash
npm install
npm run setup
```

This installs both backend and frontend dependencies.

#### 4. Install Python Dependencies
```bash
pip install -r analysis/requirements.txt
```

---

## ▶️ Running the Application

### Option 1: Everything Together (Recommended)
```bash
npm run start:all
```

This starts the backend (port 5000), frontend (port 3002), and Python analysis service (port 5001) simultaneously.

### Option 2: Individual Services (3 Terminals)

**Terminal 1 — Backend API**
```bash
npm run start --prefix backend
```
Runs on: `http://localhost:5000`

**Terminal 2 — Frontend App**
```bash
npm run start --prefix frontend
```
Runs on: `http://localhost:3002`

**Terminal 3 — Python Analysis Service**
```bash
python analysis/stress_model.py
```
Runs on: `http://localhost:5001`

---

## 📡 API Documentation

### Wellness Data Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/wellness` | Submit a wellness record |
| `GET` | `/api/wellness` | Retrieve all wellness records |
| `GET` | `/api/analysis` | Get stress prediction results |
| `GET` | `/api/insights` | Retrieve causal insights and recommendations |

### Example Wellness Record

```json
{
  "sleep_hours": 7.1,
  "screen_time_hours": 4.5,
  "study_time_hours": 5.0,
  "steps": 8300,
  "heart_rate": 74
}
```

### Python Analysis Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/predict-stress` | Get stress prediction for input data |
| `POST` | `/causal-analysis` | Run causal analysis on historical data |

---

## 📊 Sample Data

### Load Sample Data
```bash
npm run load-sample --prefix backend
```

This loads test data from:
- `backend/data/expandedSampleData.json` (if available), or
- `backend/data/sampleData.json` (fallback)

### Add Student Demo Record
```bash
npm run add-student-demo --prefix backend
```

Adds a pre-configured student record to MongoDB (avoids duplicates).

### Direct Database Import
```bash
# Uses importReadyData.json without transformation
npm run import-data --prefix backend
```

---

## 🔧 Troubleshooting

### ENOSPC Error (No Space Left on Device)

If you encounter ENOSPC during npm install:

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Free disk space** on your device

3. **Retry setup:**
   ```bash
   npm run setup:frontend
   ```

4. **Alternative — Install services separately:**
   ```bash
   npm run setup:backend
   npm run start --prefix backend
   ```
   
   Then fix frontend space and retry:
   ```bash
   npm run setup:frontend
   npm run start --prefix frontend
   ```

### MongoDB Connection Issues

If MongoDB is unavailable, the backend automatically switches to **in-memory mode** for development and testing. No additional configuration needed.

To use a remote MongoDB:
```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/habitlens
```

### Port Already in Use

If ports 5000, 3002, or 5001 are already in use:

**Backend (Node.js):**
```bash
npm run start --prefix backend -- --port 5005
```

**Frontend (Vite):**
```bash
npm run start --prefix frontend -- --port 3005
```

**Python Service:**
Edit `analysis/stress_model.py` and change the port number.

---

## 🌐 Localization

HabitLens supports multiple languages out of the box:

- 🇬🇧 **English**
- 🇮🇳 **Hindi** (हिंदी)
- 🇮🇳 **Telugu** (తెలుగు)
- 🇮🇳 **Tamil** (தமிழ்)

Switch languages in the Settings panel within the dashboard. Language preference is saved to `localStorage`.

---

## 📈 Features in Detail

### Dashboard
- Real-time wellness metrics visualization
- Daily habit tracking (sleep, screen time, daily steps)
- Weekly productivity trend analysis
- Responsive design (mobile, tablet, desktop)

### Insights Engine
- Identifies primary leverage points for stress reduction
- Generates causal recommendations based on data patterns
- AI advisor panel with live status updates
- Expected impact estimates

### Causal Analysis
- Granger causality testing for temporal relationships
- DYNOTEARS for structure learning
- Bidirectional feedback detection
- Statistical significance assessment

---

## 📝 Development

### Environment Variables

Create `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/habitlens
PORT=5000
NODE_ENV=development
```

### Building for Production

**Frontend:**
```bash
npm run build --prefix frontend
```
Outputs optimized bundle to `frontend/dist/`

**Full Build:**
```bash
npm run build
```

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request with a clear description

---

## 📄 License

This project is licensed under the **MIT License** — see LICENSE file for details.

---

## 🎓 Credits

HabitLens is designed to support student wellness through data-driven insights. Built with ❤️ for the AI Club community.

For questions or support, open an issue on the repository.

---

## 📞 Support

- **Issues:** Use GitHub Issues for bug reports and feature requests
- **Documentation:** See individual component README files
- **Stack:** React 18, Node.js, Python 3.8+, MongoDB (optional)
