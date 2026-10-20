FROM python:3.11-slim

WORKDIR /app

# Install dependencies as root FIRST so permissions succeed
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Create non-root user with UID 1000 for Hugging Face Spaces security
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1

WORKDIR $HOME/app

# Copy all application files
COPY --chown=user:user . .

# Hugging Face Spaces uses port 7860
ENV PORT=7860
EXPOSE 7860

CMD ["python", "server.py"]
