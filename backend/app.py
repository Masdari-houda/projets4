import os
import tempfile
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from inference_sdk import InferenceHTTPClient


load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


def _required_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def _make_client() -> InferenceHTTPClient:
    return InferenceHTTPClient(
        api_url=os.getenv("ROBOFLOW_API_URL", "https://serverless.roboflow.com"),
        api_key=_required_env("ROBOFLOW_API_KEY"),
    )


def _extract_birads(workflow_result: object) -> dict:
    """
    Extrait le BIRADS et la description depuis le résultat du workflow.
    Le workflow retourne une liste de résultats (un par requête).
    """
    try:
        # workflow_result est une liste
        if isinstance(workflow_result, list) and len(workflow_result) > 0:
            result = workflow_result[0]
        elif isinstance(workflow_result, dict):
            result = workflow_result
        else:
            return {"birads": "N/A", "description": "N/A", "raw": workflow_result}

        # Cherche dans les outputs possibles
        # Structure attendue: result["report"] = {"description": "...", "birads": 4, ...}
        report = result.get("report") or {}
        
        # Si report est encore wrappé dans "corrected_output"
        if "corrected_output" in report:
            data = report["corrected_output"]
        else:
            data = report

        birads = data.get("birads", "N/A")
        description = data.get("description", "N/A")
        warning = data.get("warning")
        qwen_birads = data.get("qwen_birads")
        gemini_birads = data.get("gemini_birads")
        classifier_mlo = data.get("classifier_mlo")
        classifier_cc = data.get("classifier_cc")
        detections = data.get("detections")
        override_reason = data.get("override_reason")

        return {
            "birads": birads,
            "description": description,
            "warning": warning,
            "details": {
                "qwen_birads": qwen_birads,
                "gemini_birads": gemini_birads,
                "classifier_mlo": classifier_mlo,
                "classifier_cc": classifier_cc,
                "detections": detections,
                "override_reason": override_reason,
            },
            "raw": result,
        }
    except Exception as e:
        return {"birads": "N/A", "description": "N/A", "error": str(e), "raw": workflow_result}


@app.get("/api/health")
def health():
    return jsonify({"ok": True})


@app.post("/api/analyze")
def analyze():
    mlo = request.files.get("mlo_image")
    cc = request.files.get("cc_image")

    if not mlo or not cc:
        return jsonify({"error": "Les fichiers mlo_image et cc_image sont obligatoires."}), 400

    patient = {
        "name": request.form.get("name", ""),
        "age": request.form.get("age", ""),
        "examDate": request.form.get("examDate", ""),
    }

    mlo_path = None
    cc_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(mlo.filename).suffix or ".jpg") as mlo_tmp:
            mlo.save(mlo_tmp.name)
            mlo_path = mlo_tmp.name

        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(cc.filename).suffix or ".jpg") as cc_tmp:
            cc.save(cc_tmp.name)
            cc_path = cc_tmp.name

        client = _make_client()
        workflow_result = client.run_workflow(
            workspace_name=_required_env("ROBOFLOW_WORKSPACE"),
            workflow_id=_required_env("ROBOFLOW_WORKFLOW_ID"),
            images={
                "mlo_image": mlo_path,
                "cc_image": cc_path,
            },
            use_cache=True,
        )

        extracted = _extract_birads(workflow_result)

        return jsonify(
            {
                "patient": patient,
                "birads": extracted["birads"],
                "description": extracted["description"],
                "warning": extracted.get("warning"),
                "details": extracted.get("details"),
                "rawWorkflowResult": workflow_result,
            }
        )
    except RuntimeError as env_error:
        return jsonify({"error": str(env_error)}), 500
    except Exception as err:
        return jsonify({"error": "Erreur pendant l'analyse", "details": str(err)}), 500
    finally:
        for file_path in (mlo_path, cc_path):
            if file_path and os.path.exists(file_path):
                os.remove(file_path)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=True)
