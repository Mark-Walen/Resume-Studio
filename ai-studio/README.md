<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy Resume Pilot

This repository contains the React application and its AI/JD proxy API. The API
runs in Vite's development and preview servers, so the same routes are available
locally and in the Cloud Run container.

View your app in AI Studio: https://ai.studio/apps/3e51416a-1ff6-4ae5-8652-a627be00f163

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Google Cloud Run

Cloud Run is the recommended GCP product for this application. It scales to zero,
requires no VM or Kubernetes administration, and can deploy this repository's
Dockerfile directly.

1. Create or select a Google Cloud project and enable billing.
2. Open Cloud Shell in the Google Cloud console.
3. From this directory, deploy the source:

   ```sh
   gcloud run deploy resume-pilot \
     --source . \
     --region asia-east1 \
     --allow-unauthenticated \
     --min-instances 0 \
     --max-instances 3 \
     --memory 512Mi \
     --cpu 1
   ```

4. Open the HTTPS URL printed by the command. The frontend and `/api/*` routes
   are served from the same Cloud Run service.

The app works with a personal AI API key entered in its settings. To provide one
server-side instead, store it in Secret Manager and expose it as `AI_API_KEY` to
the Cloud Run service. Do not put a real key in `.env`, the Docker image, or Git.
For an unauthenticated public deployment, prefer personal keys until application
login and request quotas are added; otherwise anyone with the URL could consume
the shared server-side key.

The Google Cloud $300 welcome credit can pay for eligible Google Cloud resources
such as Cloud Run. New welcome credits issued after March 2, 2026 are not eligible
for Gemini Developer API / AI Studio token charges, so treat model usage and
backend hosting as separate billing items.

Useful checks after deployment:

```sh
curl https://YOUR-CLOUD-RUN-URL/api/health
```

The response should contain `{"status":"ok"}`. Keep minimum instances at zero
for a personal project so idle compute can scale down.
