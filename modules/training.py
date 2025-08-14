import os
from src.processing_module.services.Excecutor import Excecutor
from paths import path_resolver

executor = Excecutor(
    TEXT_CLASSIFICATION_DATASETS_DIR_PATH=path_resolver['cl_datasets_path'],
    TEXT_CLASSIFICATION_MODEL_DIR_PATH=path_resolver['cl_model_path'],
    prediction_threshold=float(os.getenv('TEXT_CLASSIFICATION_PREDICTION_THRESHOLD', '0.85'))
)

if __name__ == "__main__":
    executor.train()