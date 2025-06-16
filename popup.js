document.getElementById("chat-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("chat-input");
  const message = input.value.trim();
  if (!message) return;

  addMessage("You", message);
  input.value = "";

  getPomochanReply(message)
    .then((reply) => {
      addMessage("Pomochan", reply);
    })
    .catch((err) => {
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
  const chatBtn = document.getElementById("chat-button");
  const helpBtn = document.getElementById("help-button");
  const timerBtn = document.getElementById("timer-button");
  const chalkOverlay = document.getElementById("chalk-overlay");
  const textOverlay = document.getElementById("overlay-text");
  const timer = document.getElementById("pomodoro-timer");

  chatBtn.addEventListener("click", () => {
    timer.style.display = "none";
    chalkOverlay.style.display = "none";
  });

  helpBtn.addEventListener("click", () => {
    timer.style.display = "none";
    chalkOverlay.style.display = "block";
    textOverlay.style.display = "block";
  });

  timerBtn.addEventListener("click", () => {
    timer.style.display = "block";
    chalkOverlay.style.display = "block";
    textOverlay.style.display = "none";
  });
});

async function getPomochanReply(prompt) {
  const res = await fetch("http://127.0.0.1:5000/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: prompt }),
  });

  const data = await res.json();
  return data.reply || "Hmm... I'm having trouble thinking right now!";
}

// -------------------------------------
// 🕒 Pomodoro Timer with Persistence
// -------------------------------------

let minutes = 25;
let totalSeconds = minutes * 60;
let isPaused = true;

const timerDisplay = document.getElementById("timer-display");
const increaseBtn = document.getElementById("increase-time");
const decreaseBtn = document.getElementById("decrease-time");

function updateTimerDisplay() {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  timerDisplay.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function syncTimerDisplay() {
  chrome.runtime.sendMessage({ type: "GET_TIMER" }, (res) => {
    const t = res.pomodoro;
    if (t && t.running && t.endTime) {
      const remaining = Math.max(0, Math.floor((t.endTime - Date.now()) / 1000));
      totalSeconds = remaining;
      isPaused = false;
      updateTimerDisplay();
    } else {
      totalSeconds = minutes * 60;
      isPaused = true;
      updateTimerDisplay();
    }
  });
}

document.getElementById("start-timer").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "START_TIMER", duration: minutes });
});

document.getElementById("pause-timer").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "PAUSE_TIMER" });
  isPaused = true;
});

document.getElementById("reset-timer").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "RESET_TIMER" }, () => {
    totalSeconds = minutes * 60;
    updateTimerDisplay();
  });
});

increaseBtn.addEventListener("click", () => {
  minutes = Math.min(minutes + 1, 60);
  totalSeconds = minutes * 60;
  updateTimerDisplay();
});

decreaseBtn.addEventListener("click", () => {
  minutes = Math.max(minutes - 1, 1);
  totalSeconds = minutes * 60;
  updateTimerDisplay();
});

// Sync every second
syncTimerDisplay();
setInterval(syncTimerDisplay, 1000);
