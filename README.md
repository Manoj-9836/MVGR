# HabitLens - Student Wellness Pattern Analyzer

HabitLens is a full-stack prototype that collects student wellness signals and transforms them into stress/productivity insights.

## Tech Stack

- Frontend: React + Chart.js
- Backend: Node.js + Express + MongoDB
- Analysis Microservice: Python + Pandas + scikit-learn (RandomForestClassifier)

Note: If MongoDB is unavailable, backend auto-runs in in-memory fallback mode for prototype testing.

## Folder Structure

```text
/frontend
  /src
    /components
    /pages
    /charts
/backend
  /models
  /routes
  /controllers
  server.js
/analysis
  stress_model.py
```

## API Routes

- `POST /api/wellness`
- `GET /api/wellness`
- `GET /api/analysis`
- `GET /api/insights`

Python service:

- `POST /predict-stress`
- `POST /causal-analysis`

## Setup

1. Copy backend environment file:

```bash
copy backend\.env.example backend\.env
```

2. Install JavaScript dependencies:

```bash
npm install
npm run setup
```

3. Install Python dependencies:

```bash
pip install -r analysis/requirements.txt
```

4. Start backend + frontend:

```bash
npm start
```

5. Optional: start backend + frontend + analysis microservice together:

```bash
npm run start:all
```

## Sample Data Loader

```bash
npm run load-sample --prefix backend
```

By default this loads `backend/data/expandedSampleData.json` when present, or falls back to `backend/data/sampleData.json`.

For direct database import without the loader transformation, use `backend/data/importReadyData.json`.

## Add Requested student-demo Record

Adds the exact row below to the same MongoDB URI configured in `backend/.env` (`MONGO_URI`) and avoids duplicate inserts.

```bash
npm run add-student-demo --prefix backend
```

## If You Get ENOSPC (No Space Left on Device)

On your machine this happened while installing frontend dependencies. Run:

```bash
npm cache clean --force
```

Then free disk space and retry:

```bash
npm run setup:frontend
```

You can still install backend first and run backend-only while fixing space:

```bash
npm run setup:backend
npm run start --prefix backend
```

## Recommended Start Order (Windows)

Use 3 terminals from project root:

1. Backend

```bash
npm run start --prefix backend
```

2. Frontend

```bash
npm run start --prefix frontend
```

3. Python analysis service

```bash
python analysis/stress_model.py
```

Or run everything together:

```bash
npm run start:all
```

## Example Wellness Input

```json
{
  "sleep_hours": 7.1,
  "screen_time_hours": 4.5,
  "study_time_hours": 5,
  "steps": 8300,
  "heart_rate": 74
}
```
