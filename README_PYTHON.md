# Daksh Intelligence · Python Workstation Edition

> **Personal PC AI Assistant & Workstation Copilot**  
> Originally built in Google Gemini / AI Studio by Daksh Bugalia, converted to **100% Pure Python**.

---

## 🚀 Quick Start (1-Click Run)

### Option 1: Double-Click Batch File (Easiest)
Simply double-click:
```cmd
run.bat
```
This automatically verifies dependencies and launches the app in your browser!

### Option 2: Run via Terminal / PowerShell
1. Open PowerShell or Command Prompt in this folder:
   ```powershell
   cd "c:\Users\Admin\Downloads\New folder"
   ```
2. Install dependencies:
   ```powershell
   python -m pip install -r requirements.txt
   ```
3. Run the interactive Streamlit Web App:
   ```powershell
   python -m streamlit run app.py
   ```
4. The app opens in your browser at `http://localhost:8501`.

---

## 🔑 Setting your Gemini API Key

You can configure your key in either of two ways:
1. **Directly in the App Sidebar:** Paste your key into the **🔑 Gemini API Key** field in the sidebar.
2. **Environment Variable:** Set `GEMINI_API_KEY` in Windows or create a `.env` file:
   ```env
   GEMINI_API_KEY=AIzaSy...your-gemini-key
   ```
*(Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey))*

---

## 📂 Converted Python Files Overview

| File | Description |
| :--- | :--- |
| **`app.py`** | **Main Web Application (Streamlit)**: Includes AI Chat Copilot with multi-turn memory, System Toolkit, Knowledge Base URL scraper, Task Manager, Code Studio sandbox, and Settings. |
| **`server.py`** | **FastAPI Backend Server**: 1-to-1 replacement for `server.ts`. Implements `/api/chat` (SSE streaming), `/api/quick-tool`, `/api/knowledge/fetch-url`, `/api/health`, `/api/voice/tts`, and `/api/voice/transcribe`. |
| **`gemini_client.py`** | **Gemini AI Engine**: Supports streaming responses, fallback candidate models (`gemini-2.5-flash`, `gemini-1.5-flash`, `gemini-2.0-flash`), knowledge base grounding injection, task context injection, multimodal vision/file attachments, and quick tools. Works with both `google-genai` SDK and direct REST fallback. |
| **`scraper.py`** | **Web URL Ingestion**: Clean webpage reader that strips HTML boilerplate, extracts titles, calculates word count, and grounds chat queries with ingested content. |
| **`defaults.py`** | **Default Configurations & Data**: Personas (Daksh Core, Nexus Architect, Terminal Guru, Echo Executive), default tasks, PC guides, and quick actions. |
| **`requirements.txt`** | **Python Dependencies**: `streamlit`, `google-genai`, `fastapi`, `uvicorn`, `requests`, `pydantic`. |
| **`run.bat`** | **Windows 1-Click Launcher**: Runs the app with a single click. |

---

## 🌟 Included Capabilities in the Python App

1. **💬 AI Copilot (Chat):**
   - Live streaming responses from Gemini models.
   - Switchable personas: *Daksh Core*, *Nexus Code Architect*, *Terminal Guru*, and *Echo Executive*.
   - Multimodal attachment support (images, logs, source code files).
   - Knowledge base grounding and active task context injected into prompt.
2. **🛠️ System Toolkit:**
   - **PowerShell Script Generator** with admin checks and safety guards.
   - **Bash / Linux Automation Generator** with error trapping.
   - **Code Architect & Debugger** to diagnose stack traces.
   - **Regex Pattern Specialist** with explanations and test cases.
   - **Executive Summarizer** for meetings and memos.
3. **📚 Knowledge Base:**
   - Ingest any public web URL (strips HTML and stores plain content).
   - Add custom manual guides or text files.
   - AI assistant cites ingested documents automatically.
4. **📋 Task Manager:**
   - Add tasks with priorities (High, Medium, Low) and due dates.
   - Real-time status toggling.
   - Active pending tasks are automatically grounded into chat context so the AI always knows your deadlines.
5. **💻 Code Studio Sandbox:**
   - Scratchpad to write and test Python scripts directly.
   - Live script execution capturing standard output and errors.
   - "Ask AI to Optimize / Fix" button.
6. **⚙️ Profile & System:**
   - Hardware detection (OS version, CPU architecture, Python runtime).
   - JSON backup export of your conversations and tasks.
