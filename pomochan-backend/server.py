import boto3
import json
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv(dotenv_path="/Users/saanvikakde/pomochan/pomochan-backend/.env")

# Load Pomochan's system prompt
with open("pomochan_prompt.txt", "r", encoding="utf-8") as f:
    POMOCHAN_PROMPT = f.read()

app = Flask(__name__)
chat_history = []

# Set up Amazon Bedrock client for Claude 3
bedrock = boto3.client(
    "bedrock-runtime",
    region_name=os.getenv("AWS_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message", "")
    chat_history.append({"role": "user", "content": user_message})

    # Construct messages list (Claude 3 requires alternating roles)
    messages = []

    # If this is the first message, include the prompt with it
    if len(chat_history) == 1:
        combined = f"{POMOCHAN_PROMPT}\n\nUser: {user_message}"
        messages.append({"role": "user", "content": combined})
    else:
        for i, msg in enumerate(chat_history):
            # Skip first user message if already embedded with prompt
            if i == 0:
                messages.append({"role": "user", "content": f"{POMOCHAN_PROMPT}\n\nUser: {msg['content']}"})
            else:
                messages.append(msg)

    payload = {
        "anthropic_version": "bedrock-2023-05-31",
        "messages": messages,
        "max_tokens": 1024,
        "temperature": 0.7
    }

    try:
        response = bedrock.invoke_model(
            modelId="anthropic.claude-3-haiku-20240307-v1:0",
            body=json.dumps(payload),
            contentType="application/json",
            accept="application/json"
        )
        response_body = json.loads(response["body"].read().decode("utf-8"))
        reply = response_body.get("content", [{}])[0].get("text", "[No reply]")
    except Exception as e:
        reply = f"Pomochan: Oops! I had a hiccup: {str(e)}"

    chat_history.append({"role": "assistant", "content": reply})
    return jsonify({"reply": reply})


@app.route("/")
def home():
    return "Pomochan backend using Claude 3 Haiku is running!"

if __name__ == "__main__":
    app.run(debug=True)
