"""
Defaults and initial configuration for Daksh Intelligence PC AI Assistant.
Ported from TypeScript (src/data/defaults.ts & src/types.ts).
"""

import time
from typing import List, Dict, Any

ASSISTANT_PERSONAS: List[Dict[str, Any]] = [
    {
        "id": "daksh-core",
        "name": "Daksh Intelligence",
        "title": "PC Desktop Copilot · by Daksh Bugalia",
        "description": "Ultra-fast, razor-sharp personal AI assistant for programming, script automation, workstation productivity, and PC tasks.",
        "badge": "Core Intelligence",
        "icon": "✨",
        "systemInstruction": """You are Daksh Intelligence, an elite PC Desktop AI Assistant created and owned by Daksh Bugalia.
You provide clear, direct, and structured responses.
When asked for scripts or commands, you provide ready-to-run snippets with comments.
When asked about complex concepts, provide bullet points and clear takeaways.
Keep explanations concise unless in-depth analysis is requested.
When asked who built or owns you, proudly state that you are Daksh Intelligence, personal PC copilot created and owned by Daksh Bugalia.""",
    },
    {
        "id": "code-architect",
        "name": "Nexus Architect",
        "title": "Senior Software Engineer & Debugger",
        "description": "Expert in full-stack code, algorithms, unit tests, refactoring, and fixing difficult compiler/runtime errors.",
        "badge": "Dev & Coding",
        "icon": "💻",
        "systemInstruction": """You are Nexus, a principal software architect on the user's PC.
When reviewing or writing code:
1. Deliver production-quality, type-safe, and idiomatic code.
2. Explain the root cause of errors directly before showing the fix.
3. Optimize for readability, edge cases, and performance.
4. Format code snippets cleanly with language identifiers.""",
    },
    {
        "id": "terminal-guru",
        "name": "Terminal Guru",
        "title": "OS & Shell Automation Specialist",
        "description": "Master of PowerShell, Bash, Git, Docker, network diagnostics, and PC workstation automation.",
        "badge": "Shell & SysAdmin",
        "icon": "⚡",
        "systemInstruction": """You are Terminal Guru, an expert in OS administration, command-line interfaces, and shell scripting (Windows PowerShell, Command Prompt, macOS/Linux Bash and Zsh).
Provide safe, efficient, and well-explained commands.
Always warn the user about destructive operations (like rm -rf or Remove-Item -Recurse) and suggest safer non-destructive alternatives.""",
    },
    {
        "id": "executive-planner",
        "name": "Echo Executive",
        "title": "Productivity & Writing Strategist",
        "description": "Turns messy thoughts into structured memos, executive summaries, actionable plans, and polished emails.",
        "badge": "Productivity",
        "icon": "📋",
        "systemInstruction": """You are Echo, a high-efficiency executive assistant.
You turn raw brain dumps, meeting transcripts, and rough notes into crisp, prioritized, action-oriented documents.
Format with clear headers, bullet points, and highlight next steps with assignees or deadlines when applicable.""",
    },
]

PC_QUICK_ACTIONS: List[Dict[str, Any]] = [
    {
        "id": "ps-clean-temp",
        "title": "Clean Windows Temp Files",
        "category": "system",
        "osTarget": "windows",
        "description": "Safe PowerShell script to clear user and system temp directories",
        "prompt": "Write a safe PowerShell script to calculate and clean up %TEMP% and Windows temp files with administrator elevation check.",
    },
    {
        "id": "ps-large-files",
        "title": "Find Top 15 Largest Files",
        "category": "system",
        "osTarget": "windows",
        "description": "Locate disk-hogging files on any drive in PowerShell",
        "prompt": "Write a PowerShell one-liner or script to scan the current drive or directory and output the top 15 largest files formatted in MB/GB.",
    },
    {
        "id": "bash-batch-rename",
        "title": "Batch Rename Files",
        "category": "script",
        "osTarget": "all",
        "description": "Rename files matching a pattern with timestamp or sequence",
        "prompt": "Write a cross-platform script (Bash and Python) to safely batch-rename all files in a folder matching a pattern, adding an incremental counter and creation date.",
    },
    {
        "id": "git-undo-commit",
        "title": "Undo Last Git Commit",
        "category": "script",
        "osTarget": "all",
        "description": "Safe Git workflow to rewind commits while keeping changes",
        "prompt": "Explain the difference between git reset --soft HEAD~1 and git reset --hard HEAD~1, and show how to safely amend or undo the last local commit.",
    },
    {
        "id": "kill-port-process",
        "title": "Kill Process Holding Port",
        "category": "system",
        "osTarget": "all",
        "description": "Find PID using port 3000 / 8080 and terminate it",
        "prompt": "Show how to find the process ID (PID) holding port 3000 on both Windows (netstat / Stop-Process) and Linux/macOS (lsof / kill), then terminate it.",
    },
    {
        "id": "summarize-notes",
        "title": "Condense Meeting Notes",
        "category": "writing",
        "osTarget": "all",
        "description": "Extract decisions, action items, and open questions",
        "prompt": "Format and condense these notes into: 1. Executive Summary, 2. Key Decisions Made, 3. Immediate Action Items (Who & What), 4. Open Questions.",
    },
    {
        "id": "regex-sanitize",
        "title": "Regex for Data Extraction",
        "category": "data",
        "osTarget": "all",
        "description": "Match emails, phone numbers, UUIDs, or IP addresses",
        "prompt": "Provide regular expressions with full explanations for: 1. RFC-compliant Email, 2. IPv4 address, 3. ISO 8601 Datetime, 4. Semantic Versioning string.",
    },
]

DEFAULT_KNOWLEDGE_DOCUMENTS: List[Dict[str, Any]] = [
    {
        "id": "doc-pc-optimization",
        "title": "PC Performance Optimization & Workstation Tuning Manual",
        "source": "manual",
        "fileType": "Markdown Guide",
        "wordCount": 380,
        "createdAt": int(time.time() * 1000) - 3600000 * 24,
        "tags": ["PC Tuning", "PowerShell", "Hardware", "Performance"],
        "summary": "Comprehensive desktop maintenance: RAM caching, startup hygiene, temperature management, and SSD trimming.",
        "content": """# PC Performance Optimization & Workstation Tuning Manual
Author: Daksh Intelligence Operations
Category: Hardware & System Maintenance

## 1. Memory & Cache Management
- Windows Standby RAM Purging: Windows caches background memory aggressively. When running heavy workloads (IDEs, LLMs, 3D rendering), invoke RAMMap or PowerShell Garbage Collection to reclaim inactive cache.
- Virtual Memory Paging: For PC systems with 16GB-64GB RAM, allocate a fixed Pagefile of 1.5x physical RAM on the fastest NVMe drive to prevent fragmentation.

## 2. Disk & File System Hygiene
- SSD TRIM Automation: Ensure Windows Periodic TRIM is scheduled weekly via 'Optimize-Volume -DriveLetter C -ReTrim -Verbose'.
- Temporary Directory Maintenance: Clean '%TEMP%' and 'C:\\Windows\\Temp' periodically. Never delete lock files held by active processes.
- Windows Update Cache: Flush 'C:\\Windows\\SoftwareDistribution\\Download' if disk space is constrained or update services hang.

## 3. High Performance Power Profile
- Enable Ultimate Performance plan using powercfg: 'powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61'.
- Prevents CPU core parking and PCIe link state power reduction during intensive compiles.""",
    },
    {
        "id": "doc-daksh-system",
        "title": "Daksh Intelligence Architecture & Specification Guide",
        "source": "manual",
        "fileType": "System Spec",
        "wordCount": 320,
        "createdAt": int(time.time() * 1000) - 3600000 * 12,
        "tags": ["Daksh Intelligence", "Architecture", "CLI Tasks", "Memory"],
        "summary": "Official specification of Daksh Intelligence, created by Daksh Bugalia, detailing short-term memory, voice modes, and task CLI syntax.",
        "content": """# Daksh Intelligence Architecture & Specification Guide
Creator & Owner: Daksh Bugalia
Version: 2.4 Workstation Edition

## Overview
Daksh Intelligence is a dedicated PC AI Assistant and Workstation Copilot engineered by Daksh Bugalia. It runs natively in your workstation browser with server-side Gemini 3.8 Flash acceleration, real-time voice synthesis, multi-turn short-term memory, and an integrated task CLI.

## Key Capabilities
1. Short-Term Memory: Maintains context across the last 10 conversational turns (20 user/model messages) to recall active code snippets, variables, user decisions, and preferences.
2. Grounded Knowledge Ingestion: Allows ingesting text files (.txt, .md, .log, .json), PDFs, and web URLs. Querying synthesizes answers strictly grounded in active documents with citations.
3. Task Management CLI: Interactive terminal interface supporting commands:
   - 'task add "<title>" --due "<date>" --p <high|medium|low>'
   - 'task list [all|pending|completed]'
   - 'task done <id>'
   - 'task rm <id>'
   - 'task remind <id> "<time>"'
4. Voice Wave Engine: Real-time speech recognition coupled with high-fidelity speech generation.""",
    },
    {
        "id": "doc-devops-cheatsheet",
        "title": "DevOps & Git Terminal Playbook for PC Developers",
        "source": "manual",
        "fileType": "Cheatsheet",
        "wordCount": 340,
        "createdAt": int(time.time() * 1000) - 3600000 * 6,
        "tags": ["Git", "DevOps", "Terminal", "Docker"],
        "summary": "Essential terminal recipes for debugging ports, git rebase safety, docker cleaning, and SSH keys.",
        "content": """# DevOps & Git Terminal Playbook for PC Developers
Reference: Workstation Productivity Suite

## 1. Port Diagnostics & Process Management
- Windows PowerShell: Find process holding port: 'Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess'. Terminate: 'Stop-Process -Id <PID> -Force'.
- Unix/macOS: 'lsof -i :3000' and 'kill -9 <PID>'.

## 2. Git Clean & Emergency Recovery
- Undo last commit without losing files: 'git reset --soft HEAD~1'.
- Stash with untracked files: 'git stash -u'.
- Prune obsolete remote tracking branches: 'git fetch --prune'.
- Interactive rebase on last 4 commits: 'git rebase -i HEAD~4'.

## 3. Docker Hygiene on PC Workstations
- Prune all stopped containers, dangling images, and build cache: 'docker system prune -af --volumes'.
- Inspect container memory & CPU consumption: 'docker stats --no-stream'.""",
    },
]

DEFAULT_TASKS: List[Dict[str, Any]] = [
    {
        "id": "task-1",
        "numericId": 1,
        "title": "Review Daksh Intelligence knowledge base integration & test citations",
        "description": "Verify document querying and URL ingestion flow for workstation copilot.",
        "completed": False,
        "priority": "high",
        "dueDate": "Today",
        "reminderTime": "17:00",
        "createdAt": int(time.time() * 1000) - 3600000 * 4,
        "category": "Development",
    },
    {
        "id": "task-2",
        "numericId": 2,
        "title": "Run weekly SSD TRIM & clear %TEMP% cache in PowerShell",
        "description": "Follow optimization guide from PC Performance Manual.",
        "completed": False,
        "priority": "medium",
        "dueDate": "Tomorrow",
        "reminderTime": "10:00",
        "createdAt": int(time.time() * 1000) - 3600000 * 2,
        "category": "PC Maintenance",
    },
    {
        "id": "task-3",
        "numericId": 3,
        "title": "Ingest external project documentation URL into Knowledge Base",
        "description": "Test live web scraping endpoint with remote technical docs.",
        "completed": True,
        "priority": "low",
        "dueDate": "Friday",
        "createdAt": int(time.time() * 1000) - 3600000 * 8,
        "category": "Research",
    },
]

DEFAULT_ACCOUNT: Dict[str, Any] = {
    "id": "usr-member",
    "name": "Workstation User",
    "email": "user@workstation.local",
    "role": "Workstation Member",
    "currentProfile": "Workstation Dev",
    "memberSince": "October 2026",
    "systemicConfig": {
        "osPlatform": "windows",
        "defaultShell": "powershell",
        "terminalTheme": "graphite",
        "globalSystemicPrompt": "Systemic rule: Ensure all scripts, commands, and code snippets are safe, idempotent, and accompanied by executable comments.",
        "autoSaveInterval": 5,
    },
}
