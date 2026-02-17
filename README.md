# Cloudflare Worker: Image Download and Converter

This tool designed for a Cloudflare Workers. It is designed to download images based on URL, or adjust quality/compression/sizing of an image, then convert to a different format if required. All within the browser; no server upload required.

<img width="859" height="554" alt="image" src="https://github.com/user-attachments/assets/0cb472bd-1f83-4cd9-a69e-94d41e8645fb" />

<img width="863" height="791" alt="image" src="https://github.com/user-attachments/assets/5d74f4a3-5313-4310-8fa6-737a798f4570" />


---

## Prerequisites

* **Node.js** and **npm** installed.
* **Cloudflare Account** for Workers access, free tier is fine
* **Wrangler CLI** installed.

---

## Installation & Setup

### 1. Create a Cloudflare Worker

You need to create a new Worker project.

Install Wrangler (CLI): 
```bash
npm install -g wrangler
```
Login: 
```bash
wrangler login
```
Create Project: 
```bash
wrangler init image-convert-tool
```
1. Worker Type: Worker Only
2. Do you want to use TypeScript? No - select JavaScript
3. Do you want to deploy your application - No, we need to config it first!


## 2. Install Dependencies

This project uses wrangler to build and deploy.

```bash
npm install
```

## 3. Project Configuration (wrangler.jsonc)

Ensure your wrangler.jsonc file is configured with your worker name and routes.

```bash
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "image-convert-tool",
  "main": "src/index.js",
  "compatibility_date": "2025-11-27",
  "observability": {
    "enabled": true
  },
  "routes": [
    {
      "pattern": "tool.your-domain.com",
      "custom_domain": true
    }
  ]
}
```
## 4. The Code

**Replace the content of src/index.js with the "index.js" in this Repo. This combines the Frontend (HTML) and Backend (API Logic).**


# Local Development

To run the worker locally for testing:

```bash
npx wrangler dev
```
This will start a local server (usually at http://localhost:8787) where you can test the UI.

# Deployment

To deploy the worker to the Cloudflare Edge:
```bash
npx wrangler deploy
```
If you have connected this repository to Cloudflare Workers via GitHub, pushing to the main branch will automatically trigger a deployment.
