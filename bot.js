const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// Typing Indicator
function showTypingIndicator() {
  const typingEl = document.getElementById("typing-indicator");
  if (typingEl) typingEl.style.display = "block";
}

function hideTypingIndicator() {
  const typingEl = document.getElementById("typing-indicator");
  if (typingEl) typingEl.style.display = "none";
}

function botReply(message, delay = 1500, showFeedback = false) {
  showTypingIndicator();
  setTimeout(() => {
    hideTypingIndicator();
    sendMessage(message, "bot", showFeedback);
  }, delay);
}
function sendMessage(message, sender = "bot", showFeedback = false) {
  // Create message bubble
  const msgDiv = document.createElement("div");
  msgDiv.className = `bubble ${sender}`;

  const textEl = document.createElement("div");
  textEl.className = "message-text";
  textEl.innerHTML = message;

  // Timestamp element 
  const timestampEl = document.createElement("small");
  timestampEl.className = "timestamp";
  const now = new Date();
  timestampEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  msgDiv.appendChild(textEl);
  msgDiv.appendChild(timestampEl);

  messagesEl.appendChild(msgDiv);

  // Feedback buttons (only for bot!)
  if (sender === "bot" && showFeedback) {
    const feedbackDiv = document.createElement("div");
    feedbackDiv.className = "feedback-buttons";

    const yesBtn = document.createElement("button");
    yesBtn.textContent = "Yes";
    yesBtn.className = "yes-btn";
    yesBtn.onclick = () => handleFeedback("yes", message);

    const noBtn = document.createElement("button");
    noBtn.textContent = "No";
    noBtn.className = "no-btn";
    noBtn.onclick = () => handleFeedback("no", message);

    feedbackDiv.appendChild(yesBtn);
    feedbackDiv.appendChild(noBtn);
    messagesEl.appendChild(feedbackDiv);
  }

  // Auto scroll
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
function handleFeedback(response, relatedMessage) {
  console.log(`Feedback: ${response} for "${relatedMessage}"`);
  
  // Replace buttons with thank-you text
  const feedbackDiv = event.target.parentElement;
  feedbackDiv.innerHTML = `<small>Thanks for your feedback!</small>`;
}

// Responses mapped to keywords
const responses = [
  {
    keywords: ["what is pesaway", "pesaway", "what does pesaway do"],
    reply: "Pesaway is a fintech platform offering secure, seamless payments, digital checkout, mobile remittance (MROs), and card payment integrations."
  },
  {
    keywords: ["mro", "mobile remittance"],
    reply: "MROs (Mobile Remittance Options) allow you to send or receive payments using mobile wallets across regions. Pesaway supports this securely and quickly."
  },
  {
    keywords: ["card payment", "visa", "mastercard"],
    reply: "Pesaway enables you to accept payments via major debit and credit cards through seamless integrations."
  },
  {
    keywords: ["api", "integrate", "checkout"],
    reply: `You can integrate Pesaway using REST APIs or hosted checkout forms. Learn more at <a href="developers.pesaway.com."target="_blank">Developers page</a>` 
  },
  {
    keywords: ["support", "contact"],
     reply: `For support, visit <a href="https://pesaway.com/contact-us" target="_blank">Pesaway contact page</a> 
          or email <a href="mailto:info@pesaway.com">info@pesaway.com</a>.`
},

  {
    keywords: ["e-retail", "retail"],
    reply: [
      "Pesaway's e-Retail solution enables merchants to accept a wide range of payment methods including cards, mobile money, and bank transfers.",
      "Merchant benefits include secure transactions, lower cart abandonment rates, real-time reporting, and seamless customer checkout experiences.",
      "API integration offers developers a unified endpoint, real-time payment verification, refund processing, and customizable checkout flows."
    ]
  },
  {
    keywords: ["onboarding"],
    reply: "To get started with Pesaway, you’ll need to register your business, provide KYC documentation, and complete verification. Once approved, you’ll receive access to the merchant dashboard."
  },
  {
    keywords: ["payments", "payment methods", "payment"],
    reply: "Pesaway Payments allow businesses to accept multiple payment methods such as card payments, mobile money, and bank transfers. Transactions are processed securely with real-time settlement notifications."
  },
  {
    keywords: ["igaming"],
    reply: "Pesaway’s iGaming payment solution is designed for online gaming platforms. It supports secure deposits, instant withdrawals, anti-fraud measures, and regulatory compliance."
  },
  {
    keywords: ["financial institutions"],
    reply: "Pesaway offers financial institutions advanced payment processing, cross-border remittances, real-time settlements, and API integrations."
  },
  {
    keywords: ["bye", "exit"],
    reply: "Thank you for using PwBot. Have a great day."
  }
];

// Process user input
function processInput() {
  const userMessage = inputEl.value.trim();
  if (!userMessage) return;

  sendMessage(userMessage, "user");
  inputEl.value = "";

  const msg = userMessage.toLowerCase();
  let matched = false;

  for (const item of responses) {
    if (item.keywords.some(kw => msg.includes(kw))) {
      if (Array.isArray(item.reply)) {
        item.reply.forEach((line, index) => {
          sendMessage(line, "bot", index === item.reply.length - 1); // Only last line gets feedback
        });
      } else {
        sendMessage(item.reply, "bot", true); // Show feedback
      }
      matched = true;
      break;
    }
  }

  if (!matched) {   
    sendMessage("I'm here to help you learn about Pesaway. Ask me about MROs, card payments, integrations, e-Retail, or our other services.", "bot", true);
  }
}

sendBtn.addEventListener("click", processInput);
inputEl.addEventListener("keydown", e => {
  if (e.key === "Enter") processInput();
});

window.onload = () => {
  sendMessage("Welcome to PwBot.");
  sendMessage("Ask about Pesaway services like MROs, card payments, integrations, and more.");
};
