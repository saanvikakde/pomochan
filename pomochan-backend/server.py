from flask import Flask, request, jsonify 
import openai
from dotenv import load_dotenv
import os

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

with open("pomochan_prompt.txt", "r", encoding="utf-8") as f:
    POMOCHAN_PROMPT = f.read()

app = Flask(__name__) #create app 

chat_history = []

@app.route("/chat", methods=["POST"])

def chat():
    user_message = request.json.get("message", "")
    chat_history.append({"role": "user", "content": user_message})

    client = openai.OpenAI()  

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "system", "content": POMOCHAN_PROMPT}] + chat_history
    )
    reply = response.choices[0].message.content


    reply = response.choices[0].message.content
    chat_history.append({"role": "assistant", "content": reply})
    return jsonify({"reply": reply})


@app.route("/")

def home(): 
    return "Pomochan backend is running"

if __name__ == "__main__": 
    app.run(debug=True) #start server auto-reload
