document.getElementById("chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("chat-input");
    const message = input.value.trim();
    if (!message) return;
  
    addMessage("You", message);
    input.value = "";
  
     // Get Pomochan reply from backend
    getPomochanReply(message).then((reply) => {
        addMessage("Pomochan", reply);
    }).catch((err) => {
        addMessage("Pomochan", "Oops! I couldn't connect to my brain right now.");
        console.error(err);
    });

  });
  
  function addMessage(sender, text) {
    const log = document.getElementById("chat-log");
    const bubble = document.createElement("div");
    bubble.className = sender === "You" ? "message user" : "message pomo";
    bubble.textContent = `${sender}: ${text}`;
    log.appendChild(bubble);
    log.scrollTop = log.scrollHeight;
  }


  document.addEventListener("DOMContentLoaded", () => {
    const helpBtn = document.getElementById("help-button");
    const helpOverlay = document.getElementById("help-overlay");
    const closeHelp = document.getElementById("close-help");
  
    helpBtn.addEventListener("click", () => {
      helpOverlay.style.display = "block";
    });
  
    closeHelp.addEventListener("click", () => {
      helpOverlay.style.display = "none";
    });
  });
  
  async function getPomochanReply(prompt) {
    const res = await fetch("http://127.0.0.1:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: prompt })
    });
  
    const data = await res.json();
    return data.reply || "Hmm... I'm having trouble thinking right now!";
  }
  