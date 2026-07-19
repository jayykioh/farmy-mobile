# Technical Specification - Farm Snap Disease Classification (Farm Snap Spec)

## 1. Classification Model Details
*   The system uses an image classification model trained on crop diseases (focusing on rice paddies) to identify issues:
    *   Rice Blast (Đạo ôn)
    *   Brown Spot (Đốm nâu)
    *   Bacterial Leaf Blight (Bạc lá)

## 2. API Response Interface
*   Endpoint: `POST /plant-scans`
*   Response Payload Schema:
    ```json
    {
      "success": true,
      "data": {
        "is_plant": true,
        "disease_name": "Rice Blast",
        "confidence": 0.942,
        "symptoms": [
          "Spindle-shaped spots with ash-gray centers on leaves.",
          "Lesions expand rapidly causing leaf death."
        ],
        "treatment": {
          "organic": "Apply garlic/ginger extracts or use Trichoderma bio-formulations.",
          "chemical": "Use fungicides containing Tricyclazole or Fuji-one."
        }
      }
    }
    ```
