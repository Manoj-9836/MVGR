from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from scipy.linalg import expm
from scipy.optimize import minimize
from sklearn.ensemble import RandomForestClassifier
from statsmodels.stats.multitest import multipletests
from statsmodels.tools.sm_exceptions import EstimationWarning
from statsmodels.tsa.api import VAR
import warnings

app = Flask(__name__)
CORS(app)

PREDICTION_FEATURE_COLUMNS = [
    "sleep_hours",
    "screen_time_hours",
    "study_time_hours",
    "steps",
    "heart_rate",
]

DEFAULT_CAUSAL_COLUMNS = PREDICTION_FEATURE_COLUMNS + ["stress_score"]
PAPER_SLEEP_COLUMNS = [
    "EOG_1",
    "EOG_2",
    "EEG_LC",
    "EEG_LO",
    "EMG_Leg",
    "Snore",
    "ECG",
    "Nasal_Pressure",
    "Position",
    "Blood_Oxygen",
]
DYNOTEARS_LAMBDA_W = 0.0005
DYNOTEARS_LAMBDA_A = 0.005

# Domain-specific impact lookup keyed by (source, target) variable pair.
# Actions and expected-impact strings are referenced verbatim in JSON output
# and displayed to the user on the dashboard.
IMPACT_TEMPLATES: dict[tuple[str, str], dict] = {
    ("sleep_hours", "stress_score"): {
        "action": "Aim for 7–8 hours of sleep per night",
        "expected_impact": "+1 hour sleep → ~38% lower stress odds",
        "alternative": "Consistent bedtime 30 minutes earlier",
    },
    ("screen_time_hours", "stress_score"): {
        "action": "Cut screen exposure by 1 hour, especially before bed",
        "expected_impact": "−1 hour screen time → ~15% stress reduction",
        "alternative": "Enable blue-light filter after 8 PM",
    },
    ("study_time_hours", "stress_score"): {
        "action": "Add 15-minute breaks every 90 minutes of study",
        "expected_impact": "Structured breaks → ~10% lower stress score",
        "alternative": "Shift intense study sessions to morning hours",
    },
    ("steps", "stress_score"): {
        "action": "Target 8,000–10,000 steps per day",
        "expected_impact": "+2,000 steps/day → ~12% stress reduction",
        "alternative": "Replace a 20-minute break with a walk",
    },
    ("heart_rate", "stress_score"): {
        "action": "Practice 5-minute deep breathing exercises daily",
        "expected_impact": "Breathing techniques → ~8% heart rate drop",
        "alternative": "Try progressive muscle relaxation before sleep",
    },
    ("stress_score", "sleep_hours"): {
        "action": "Address stress directly—it is disrupting your sleep",
        "expected_impact": "Stress reduction → +30–45 min sleep recovery per night",
        "alternative": "Wind-down routine 1 hour before bed",
    },
    ("stress_score", "screen_time_hours"): {
        "action": "Replace stress-driven screen habits with a short walk",
        "expected_impact": "Stress management → ~20% less recreational screen time",
        "alternative": "Scheduled screen-free periods during peak-stress hours",
    },
    ("screen_time_hours", "sleep_hours"): {
        "action": "Reduce evening screen time to improve sleep onset",
        "expected_impact": "−1 hour screen time → ~20 min faster sleep onset",
        "alternative": "No screens 30 minutes before target bedtime",
    },
    ("sleep_hours", "screen_time_hours"): {
        "action": "Improve sleep duration to curb fatigue-driven screen use",
        "expected_impact": "+1 hour sleep → ~25% less passive screen time",
        "alternative": "Set app usage limits during low-energy hours",
    },
    ("steps", "sleep_hours"): {
        "action": "Keep daily step count above 7,000 to improve sleep quality",
        "expected_impact": "+1,500 steps/day → ~15 min more deep sleep",
        "alternative": "Evening walk of 10–15 minutes before winding down",
    },
    ("heart_rate", "sleep_hours"): {
        "action": "Lower resting heart rate through aerobic activity",
        "expected_impact": "−5 bpm resting HR → ~12% improvement in sleep efficiency",
        "alternative": "Cool room temperature supports lower HR and deeper sleep",
    },
}


def label_from_score(score: float) -> str:
    if score < 3:
        return "Low"
    if score < 5:
        return "Medium"
    return "High"


def generate_training_data(rows: int = 800) -> pd.DataFrame:
    rng = np.random.default_rng(42)
    data = pd.DataFrame(
        {
            "sleep_hours": rng.uniform(4.0, 9.0, rows),
            "screen_time_hours": rng.uniform(1.5, 11.0, rows),
            "study_time_hours": rng.uniform(1.0, 9.0, rows),
            "steps": rng.integers(2000, 14000, rows),
            "heart_rate": rng.integers(58, 102, rows),
        }
    )

    sleep_deficit = np.maximum(0, 8 - data["sleep_hours"])
    stress_score = (
        0.35 * data["screen_time_hours"]
        + 0.35 * sleep_deficit
        + 0.30 * (data["heart_rate"] / 100)
    )

    data["stress_level"] = [label_from_score(score) for score in stress_score]
    return data


def train_model() -> RandomForestClassifier:
    train_df = generate_training_data()
    x_train = train_df[PREDICTION_FEATURE_COLUMNS]
    y_train = train_df["stress_level"]

    model = RandomForestClassifier(n_estimators=180, random_state=42)
    model.fit(x_train, y_train)
    return model


model = train_model()


def infer_causal_columns(df: pd.DataFrame, requested_columns: list[str] | None) -> list[str]:
    if requested_columns:
        missing = [column for column in requested_columns if column not in df.columns]
        if missing:
            raise ValueError(f"Missing causal columns: {', '.join(missing)}")
        return requested_columns

    if all(column in df.columns for column in DEFAULT_CAUSAL_COLUMNS):
        return DEFAULT_CAUSAL_COLUMNS

    if all(column in df.columns for column in PAPER_SLEEP_COLUMNS):
        return PAPER_SLEEP_COLUMNS

    numeric_columns = []
    for column in df.columns:
        converted = pd.to_numeric(df[column], errors="coerce")
        if converted.notna().any():
            numeric_columns.append(column)

    if len(numeric_columns) < 2:
        raise ValueError("At least two numeric columns are required for causal analysis")

    return numeric_columns


def prepare_causal_dataframe(
    records: list[dict], requested_columns: list[str] | None = None
) -> tuple[pd.DataFrame, list[str]]:
    df = pd.DataFrame(records)
    if df.empty:
        raise ValueError("Payload must include a non-empty 'records' list")

    columns = infer_causal_columns(df, requested_columns)
    clean = df[columns].copy()
    for column in columns:
        clean[column] = pd.to_numeric(clean[column], errors="coerce")

    clean = clean.dropna().reset_index(drop=True)
    if clean.empty:
        raise ValueError("No complete numeric rows available after cleaning")

    return clean, columns


def compute_aicc(aic: float, n_obs: int, total_params: int) -> float:
    denominator = n_obs - total_params - 1
    if denominator <= 0:
        return float("inf")
    return float(aic + (2 * total_params * (total_params + 1)) / denominator)


def select_var_order_aicc(df: pd.DataFrame, max_order: int = 19) -> int:
    n_rows, n_columns = df.shape
    upper_bound = min(max_order, max(1, (n_rows - 1) // max(n_columns, 1)))
    best_order = 1
    best_aicc = float("inf")

    warnings.filterwarnings("ignore", category=EstimationWarning)
    for order in range(1, upper_bound + 1):
        try:
            fitted = VAR(df).fit(order)
            aic = float(fitted.aic)
        except Exception:
            continue

        total_params = n_columns * (n_columns * order + 1)
        aicc = compute_aicc(aic, int(fitted.nobs), total_params)
        if aicc < best_aicc:
            best_aicc = aicc
            best_order = order

    return best_order


def fit_var_with_backoff(df: pd.DataFrame, selected_order: int):
    for order in range(selected_order, 0, -1):
        try:
            fitted = VAR(df).fit(order)
            return fitted, order
        except Exception:
            continue

    raise ValueError("Unable to fit a stable VAR model for the supplied data")


def granger_causal_scan(
    df: pd.DataFrame,
    selected_order: int,
    alpha: float = 0.05,
) -> dict:
    fitted, selected_order = fit_var_with_backoff(df, selected_order)
    tests = []
    raw_p_values = []

    for target in df.columns:
        for source in df.columns:
            if source == target:
                continue

            result = fitted.test_causality(target, [source], kind="f")
            p_value = float(np.asarray(result.pvalue).reshape(-1)[0])
            tests.append(
                {
                    "source": source,
                    "target": target,
                    "lag_order": selected_order,
                    "test_statistic": round(float(result.test_statistic), 6),
                    "raw_p_value": round(p_value, 6),
                }
            )
            raw_p_values.append(p_value)

    if raw_p_values:
        rejected, adjusted, _, _ = multipletests(raw_p_values, alpha=alpha, method="fdr_by")
    else:
        rejected = []
        adjusted = []

    edges = []
    for index, test in enumerate(tests):
        corrected_p_value = float(adjusted[index]) if len(adjusted) else float(test["raw_p_value"])
        significant = bool(rejected[index]) if len(rejected) else False
        test["corrected_p_value"] = round(corrected_p_value, 6)
        test["significant"] = significant
        if significant:
            edges.append(
                {
                    "from": test["source"],
                    "to": test["target"],
                    "lag_order": selected_order,
                    "p_value": round(corrected_p_value, 6),
                }
            )

    return {
        "method": "conditional_granger_var",
        "selected_order": selected_order,
        "alpha": alpha,
        "multiple_testing_correction": "fdr_by",
        "tests": tests,
        "edges": edges,
    }


def standardize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    standardized = df.copy().astype(float)
    std = standardized.std(axis=0, ddof=0).replace(0, 1)
    return (standardized - standardized.mean(axis=0)) / std


def build_lagged_design(df: pd.DataFrame, order: int) -> tuple[np.ndarray, np.ndarray]:
    values = df.to_numpy(dtype=float)
    current = values[order:]
    lagged = [values[order - lag : len(values) - lag] for lag in range(1, order + 1)]
    history = np.concatenate(lagged, axis=1)
    return current, history


def dynotears_acyclicity(w_matrix: np.ndarray) -> float:
    return float(np.trace(expm(w_matrix * w_matrix)) - w_matrix.shape[0])


def dynotears_objective_and_gradient(
    params: np.ndarray,
    current: np.ndarray,
    history: np.ndarray,
    dimension: int,
    order: int,
    lambda_w: float,
    lambda_a: float,
    rho: float,
    alpha: float,
) -> tuple[float, np.ndarray]:
    w_size = dimension * dimension
    w_matrix = params[:w_size].reshape(dimension, dimension)
    a_matrix = params[w_size:].reshape(dimension * order, dimension)

    residual = current - current @ w_matrix - history @ a_matrix
    n_rows = current.shape[0]

    loss = 0.5 / n_rows * np.sum(residual**2)
    grad_w = -(current.T @ residual) / n_rows
    grad_a = -(history.T @ residual) / n_rows

    epsilon = 1e-8
    smooth_w = np.sqrt(w_matrix**2 + epsilon)
    smooth_a = np.sqrt(a_matrix**2 + epsilon)
    loss += lambda_w * float(np.sum(smooth_w)) + lambda_a * float(np.sum(smooth_a))
    grad_w += lambda_w * (w_matrix / smooth_w)
    grad_a += lambda_a * (a_matrix / smooth_a)

    h_value = dynotears_acyclicity(w_matrix)
    exp_term = expm(w_matrix * w_matrix)
    grad_h = exp_term.T * (2.0 * w_matrix)
    loss += 0.5 * rho * h_value * h_value + alpha * h_value
    grad_w += (rho * h_value + alpha) * grad_h
    np.fill_diagonal(grad_w, 0.0)

    gradient = np.concatenate([grad_w.ravel(), grad_a.ravel()])
    return float(loss), gradient


def optimize_dynotears(
    df: pd.DataFrame,
    selected_order: int,
    lambda_w: float = DYNOTEARS_LAMBDA_W,
    lambda_a: float = DYNOTEARS_LAMBDA_A,
    max_iter: int = 12,
) -> tuple[np.ndarray, np.ndarray, float]:
    standardized = standardize_dataframe(df)
    current, history = build_lagged_design(standardized, selected_order)
    dimension = standardized.shape[1]

    w_size = dimension * dimension
    total_params = w_size + dimension * selected_order * dimension
    params = np.zeros(total_params)
    rho = 1.0
    alpha = 0.0
    h_value = float("inf")

    bounds = [(None, None)] * total_params
    for index in range(dimension):
        diagonal = index * dimension + index
        bounds[diagonal] = (0.0, 0.0)

    for _ in range(max_iter):
        result = minimize(
            lambda x: dynotears_objective_and_gradient(
                x,
                current,
                history,
                dimension,
                selected_order,
                lambda_w,
                lambda_a,
                rho,
                alpha,
            )[0],
            params,
            jac=lambda x: dynotears_objective_and_gradient(
                x,
                current,
                history,
                dimension,
                selected_order,
                lambda_w,
                lambda_a,
                rho,
                alpha,
            )[1],
            method="L-BFGS-B",
            bounds=bounds,
        )

        params = result.x
        w_matrix = params[:w_size].reshape(dimension, dimension)
        h_new = dynotears_acyclicity(w_matrix)
        alpha += rho * h_new

        if abs(h_new) <= 1e-8:
            h_value = h_new
            break

        if h_new > 0.25 * h_value:
            rho *= 10.0

        h_value = h_new

    w_matrix = params[:w_size].reshape(dimension, dimension)
    a_matrix = params[w_size:].reshape(dimension * selected_order, dimension)
    return w_matrix, a_matrix, float(h_value)


def dynotears_edges(
    columns: list[str],
    w_matrix: np.ndarray,
    a_matrix: np.ndarray,
    selected_order: int,
    threshold: float = 0.05,
) -> tuple[list[dict], list[dict], list[dict]]:
    dimension = len(columns)
    instantaneous_edges = []
    lagged_edges = []
    aggregated: dict[tuple[str, str], dict] = {}

    for source_index, source in enumerate(columns):
        for target_index, target in enumerate(columns):
            if source == target:
                continue

            weight = float(w_matrix[source_index, target_index])
            if abs(weight) >= threshold:
                instantaneous_edges.append(
                    {
                        "from": source,
                        "to": target,
                        "weight": round(weight, 6),
                        "type": "instantaneous",
                    }
                )
                aggregated[(source, target)] = {
                    "from": source,
                    "to": target,
                    "weight": round(weight, 6),
                    "best_lag": 0,
                }

            for lag in range(1, selected_order + 1):
                lag_row = (lag - 1) * dimension + source_index
                lag_weight = float(a_matrix[lag_row, target_index])
                if abs(lag_weight) < threshold:
                    continue

                lagged_edges.append(
                    {
                        "from": source,
                        "to": target,
                        "weight": round(lag_weight, 6),
                        "lag": lag,
                        "type": "lagged",
                    }
                )

                key = (source, target)
                existing = aggregated.get(key)
                if existing is None or abs(lag_weight) > abs(existing["weight"]):
                    aggregated[key] = {
                        "from": source,
                        "to": target,
                        "weight": round(lag_weight, 6),
                        "best_lag": lag,
                    }

    return list(aggregated.values()), instantaneous_edges, lagged_edges


def score_based_structure_learning(
    df: pd.DataFrame,
    selected_order: int,
    lambda_w: float = DYNOTEARS_LAMBDA_W,
    lambda_a: float = DYNOTEARS_LAMBDA_A,
) -> dict:
    w_matrix, a_matrix, acyclicity = optimize_dynotears(
        df,
        selected_order,
        lambda_w=lambda_w,
        lambda_a=lambda_a,
    )
    edges, instantaneous_edges, lagged_edges = dynotears_edges(
        list(df.columns), w_matrix, a_matrix, selected_order
    )

    return {
        "algorithm": "dynotears_linear",
        "selected_order": selected_order,
        "lambda_w": lambda_w,
        "lambda_a": lambda_a,
        "acyclicity": round(acyclicity, 8),
        "edges": edges,
        "instantaneous_edges": instantaneous_edges,
        "lagged_edges": lagged_edges,
    }


def generate_recommendations(
    granger_tests: list[dict],
    score_based: dict,
) -> tuple[dict | None, list[dict]]:
    """Derive personalised recommendations from Granger + DYNOTEARS results.

    Returns
    -------
    primary_leverage_point
        The single variable most causally responsible for stress (highest
        BY-corrected Granger confidence), formatted for UI display.
    recommendations
        All significant causal edges involving stress_score, sorted by
        descending confidence score, each annotated with action text,
        expected_impact, alternative action, and a DYNOTEARS corroboration flag.
    """
    recommendations: list[dict] = []
    dynotears_parents: set[str] = set(score_based.get("parents_of_stress", []))

    for test in granger_tests:
        if not test.get("significant"):
            continue
        source = test["source"]
        target = test["target"]
        if target != "stress_score" and source != "stress_score":
            continue

        corrected_p = float(test.get("corrected_p_value", test.get("raw_p_value", 1.0)))
        confidence_score = round(max(0.0, (1.0 - corrected_p) * 100.0), 1)
        tmpl = IMPACT_TEMPLATES.get((source, target), {})

        recommendations.append(
            {
                "source": source,
                "target": target,
                "causal_pattern": f"{source} \u2192 {target}",
                "confidence_score": confidence_score,
                "p_value": round(corrected_p, 6),
                "corroborated_by_dynotears": (
                    source in dynotears_parents and target == "stress_score"
                ),
                "action": tmpl.get("action", f"Monitor and manage {source}"),
                "expected_impact": tmpl.get(
                    "expected_impact", "Consistent improvement expected with targeted changes"
                ),
                "alternative": tmpl.get("alternative", f"Track {source} consistently over time"),
            }
        )

    recommendations.sort(key=lambda r: r["confidence_score"] if r["confidence_score"] is not None else -1, reverse=True)

    # If Granger found no stress-related significant edges, fall back to DYNOTEARS parents
    has_granger_stress_recs = any(
        r["target"] == "stress_score" or r["source"] == "stress_score"
        for r in recommendations
    )
    if not has_granger_stress_recs:
        dyn_edges = [
            e for e in score_based.get("edges", []) if e.get("to") == "stress_score"
        ]
        for edge in sorted(dyn_edges, key=lambda e: abs(e.get("weight", 0.0)), reverse=True):
            src = edge["from"]
            tmpl = IMPACT_TEMPLATES.get((src, "stress_score"), {})
            recommendations.append(
                {
                    "source": src,
                    "target": "stress_score",
                    "causal_pattern": f"{src} \u2192 stress_score",
                    "confidence_score": None,
                    "p_value": None,
                    "corroborated_by_dynotears": True,
                    "action": tmpl.get("action", f"Monitor and manage {src}"),
                    "expected_impact": tmpl.get(
                        "expected_impact", "Improvement expected with targeted changes"
                    ),
                    "alternative": tmpl.get(
                        "alternative", f"Track {src} consistently over time"
                    ),
                    "source_method": "dynotears_only",
                }
            )

    # Primary leverage point: top Granger source → stress_score
    primary_leverage_point: dict | None = None
    top = next((r for r in recommendations if r["target"] == "stress_score"), None)
    if top:
        primary_leverage_point = {
            "variable": top["source"],
            "confidence_score": top["confidence_score"],
            "p_value": top["p_value"],
            "action": top["action"],
            "expected_impact": top["expected_impact"],
            "alternative": top["alternative"],
            "corroborated_by_dynotears": top["corroborated_by_dynotears"],
        }
    elif dynotears_parents:
        dyn_edges = [
            e for e in score_based.get("edges", []) if e.get("to") == "stress_score"
        ]
        if dyn_edges:
            best = max(dyn_edges, key=lambda e: abs(e.get("weight", 0.0)))
            tmpl = IMPACT_TEMPLATES.get((best["from"], "stress_score"), {})
            primary_leverage_point = {
                "variable": best["from"],
                "confidence_score": None,
                "p_value": None,
                "action": tmpl.get("action", f"Monitor and manage {best['from']}"),
                "expected_impact": tmpl.get(
                    "expected_impact", "Improvement expected with targeted changes"
                ),
                "alternative": tmpl.get("alternative", f"Track {best['from']} consistently"),
                "corroborated_by_dynotears": True,
                "source": "dynotears_only",
            }

    return primary_leverage_point, recommendations


def build_causal_response(
    df: pd.DataFrame,
    columns: list[str],
    alpha: float = 0.05,
    max_order: int = 19,
) -> dict:
    if len(df) < 12:
        return {
            "message": "At least 12 records are recommended for stable causal analysis",
            "records_used": len(df),
            "variables": columns,
            "granger": {"tests": [], "edges": []},
            "score_based_structure_learning": {
                "algorithm": "dynotears_linear",
                "edges": [],
                "instantaneous_edges": [],
                "lagged_edges": [],
            },
        }

    selected_order = select_var_order_aicc(df, max_order=max_order)
    granger = granger_causal_scan(df, selected_order=selected_order, alpha=alpha)
    selected_order = int(granger["selected_order"])
    score_based = score_based_structure_learning(df, selected_order=selected_order)

    response = {
        "records_used": len(df),
        "variables": columns,
        "selected_order": selected_order,
        "granger": granger,
        "score_based_structure_learning": score_based,
    }

    if "stress_score" in columns:
        response["granger_against_stress"] = [
            test
            for test in granger["tests"]
            if test["target"] == "stress_score"
        ]
        response["score_based_structure_learning"]["parents_of_stress"] = [
            edge["from"]
            for edge in score_based["edges"]
            if edge["to"] == "stress_score"
        ]
        primary_leverage_point, recommendations = generate_recommendations(
            granger["tests"], score_based
        )
        response["primary_leverage_point"] = primary_leverage_point
        response["recommendations"] = recommendations

    return response


@app.get("/health")
def health() -> tuple:
    return jsonify({"status": "ok", "service": "habitlens-analysis"}), 200


@app.post("/predict-stress")
def predict_stress() -> tuple:
    payload = request.get_json(force=True)

    missing = [feature for feature in PREDICTION_FEATURE_COLUMNS if feature not in payload]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    features = pd.DataFrame(
        [
            {
                "sleep_hours": float(payload["sleep_hours"]),
                "screen_time_hours": float(payload["screen_time_hours"]),
                "study_time_hours": float(payload["study_time_hours"]),
                "steps": float(payload["steps"]),
                "heart_rate": float(payload["heart_rate"]),
            }
        ]
    )

    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    confidence = float(np.max(probabilities))

    return (
        jsonify(
            {
                "predicted_stress_level": prediction,
                "confidence": round(confidence, 3),
            }
        ),
        200,
    )


@app.post("/causal-analysis")
def causal_analysis() -> tuple:
    payload = request.get_json(force=True)
    records = payload.get("records", []) if isinstance(payload, dict) else []

    if not isinstance(records, list) or not records:
        return jsonify({"error": "Payload must include a non-empty 'records' list"}), 400

    requested_columns = payload.get("columns") if isinstance(payload, dict) else None
    alpha = float(payload.get("alpha", 0.05)) if isinstance(payload, dict) else 0.05
    max_order = int(payload.get("max_order", 19)) if isinstance(payload, dict) else 19
    max_order = max(1, min(max_order, 19))

    try:
        df, columns = prepare_causal_dataframe(records, requested_columns=requested_columns)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    if len(df) <= 3:
        return (
            jsonify(
                {
                    "error": (
                        "Not enough clean records for causal analysis. "
                        f"Need at least 4, received {len(df)}"
                    )
                }
            ),
            400,
        )

    try:
        result = build_causal_response(df, columns, alpha=alpha, max_order=max_order)
        return jsonify(result), 200
    except Exception as error:  # pragma: no cover
        return jsonify({"error": f"Causal analysis failed: {str(error)}"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False, use_reloader=False)
