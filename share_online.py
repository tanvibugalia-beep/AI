"""
Instant Public URL Launcher for Daksh Intelligence.
Uses Cloudflare Tunnels (100% Free, No Account Needed) to give you a public HTTPS URL.
"""

import os
import sys
import subprocess
import urllib.request
import re
import time

CLOUDFLARED_URL = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
EXE_PATH = os.path.join(os.path.dirname(__file__), "cloudflared.exe")

def ensure_cloudflared():
    if not os.path.exists(EXE_PATH):
        print("[*] Downloading Cloudflare Tunnel helper (1-time download)...")
        urllib.request.urlretrieve(CLOUDFLARED_URL, EXE_PATH)
        print("[*] Download complete!")

def start_public_tunnel(port=3000):
    ensure_cloudflared()
    print(f"\n========================================================")
    print(f"      MAKING DAKSH INTELLIGENCE PUBLIC ONLINE")
    print(f"========================================================\n")
    print(f"[*] Starting tunnel to local port {port}...")
    print(f"[*] Your public link is being generated...\n")

    cmd = [EXE_PATH, "tunnel", "--url", f"http://localhost:{port}"]
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )

    tunnel_url = None
    for line in iter(process.stdout.readline, ''):
        match = re.search(r"(https://[a-zA-Z0-9-]+\.trycloudflare\.com)", line)
        if match:
            tunnel_url = match.group(1)
            print("\n" + "=" * 64)
            print("🚀 YOUR APP IS NOW LIVE ON THE PUBLIC INTERNET!")
            print(f"🌐 PUBLIC SHARE LINK:  {tunnel_url}")
            print("=" * 64 + "\n")
            print("Anyone in the world on any phone or PC can open this link!")
            print("Keep this terminal window open while you want the app to stay online.\n")
            
            # Try to open browser with the public link
            try:
                import webbrowser
                webbrowser.open(tunnel_url)
            except Exception:
                pass

        if "ERR" in line:
            print(line.strip())

    process.wait()

if __name__ == "__main__":
    start_public_tunnel(3000)
