# How to Make Daksh Intelligence Public on the Internet 🌐

Here are the two best ways to make your app public so anyone can access it:

---

## ⚡ Method 1: Instant Public Link (1-Click from Your PC)

> **Best for:** Sharing with friends, family, or testing on mobile phones immediately without signing up for any cloud provider.

1. First, make sure your app is running:
   ```powershell
   python server.py
   ```
   *(or double-click `run.bat`)*

2. In a second window, simply double-click:
   ```cmd
   share_online.bat
   ```
   *(or run `python share_online.py`)*

3. **That's it!** A secure public HTTPS link will appear on your screen:
   ```text
   🚀 YOUR APP IS NOW LIVE ON THE PUBLIC INTERNET!
   🌐 PUBLIC SHARE LINK:  https://example-random-words.trycloudflare.com
   ```
4. Copy and send that link to anyone — they can open it on their iPhone, Android, or laptop anywhere in the world!

---

## ☁️ Method 2: Permanent 24/7 Cloud Hosting (Free)

> **Best for:** Leaving the app online permanently 24/7 even when your personal computer is turned off.

### Option A: Render.com (Recommended Free Cloud Host)
1. Create a free account at [render.com](https://render.com).
2. Click **New +** &rarr; **Web Service**.
3. Upload your code or connect your GitHub repository.
4. Settings:
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python server.py`
5. In **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your Google AI Studio API Key)*
   - `OWNER_PASSWORD`: *(Your secret owner password, e.g. daksh2026)*
6. Click **Deploy Web Service**! Render will give you a permanent URL like:
   `https://daksh-intelligence.onrender.com`

---

### Option B: Hugging Face Spaces (100% Free)
1. Go to [huggingface.co/spaces](https://huggingface.co/spaces) and click **Create new Space**.
2. Name your space `daksh-intelligence` and choose **Docker** (using the included `Dockerfile`).
3. Upload the files from this folder.
4. Add your `GEMINI_API_KEY` in **Settings &rarr; Variables and Secrets**.
5. Your app is live forever at:
   `https://huggingface.co/spaces/YOUR_USERNAME/daksh-intelligence`
