const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// Create typing indicator element in chat area
function showTypingIndicator() {
  const typingEl = document.createElement("div");
  typingEl.className = "bubble bot typing-indicator";
  typingEl.innerHTML = `
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="dot"></span>
  `;
  typingEl.id = "typing-bubble";
  messagesEl.appendChild(typingEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function hideTypingIndicator() {
  const typingEl = document.getElementById("typing-bubble");
  if (typingEl) typingEl.remove();
}

function botReply(message, delay = 1500, showFeedback = false) {
  showTypingIndicator();
  setTimeout(() => {
    hideTypingIndicator();
    sendMessage(message, "bot", showFeedback);
  }, delay);
}

// Send Message Function
function sendMessage(message, sender = "bot", showFeedback = false) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `bubble ${sender}`;

  const textEl = document.createElement("div");
  textEl.className = "message-text";
  textEl.innerHTML = message;

  // Timestamp
  const timestampEl = document.createElement("small");
  timestampEl.className = "timestamp";
  const now = new Date();
  timestampEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  msgDiv.appendChild(textEl);
  msgDiv.appendChild(timestampEl);
  messagesEl.appendChild(msgDiv);

  // Feedback for bot
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

  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function handleFeedback(response, relatedMessage) {
  console.log(`Feedback: ${response} for "${relatedMessage}"`);
  const feedbackDiv = event.target.parentElement;
  feedbackDiv.innerHTML = `<small>Thanks for your feedback!</small>`;
}

// Responses
const responses = [
  { keywords: ["what is pesaway", "pesaway", "what does pesaway do"], reply: "Pesaway is a fintech platform offering secure, seamless payments, digital checkout, mobile remittance (MROs), and card payment integrations." },
  { keywords: ["mro", "mobile remittance"], reply: "MROs (Mobile Remittance Options) allow you to send or receive payments using mobile wallets across regions. Pesaway supports this securely and quickly." },
  { keywords: ["card payment", "visa", "mastercard"], reply: "Pesaway enables you to accept payments via major debit and credit cards through seamless integrations." },
  { keywords: ["api", "integrate", "checkout"], reply: `You can integrate Pesaway using REST APIs or hosted checkout forms. Learn more at <a href="developers.pesaway.com" target="_blank">Developers page</a>` },
  { keywords: ["support", "contact"], reply: `For support, visit <a href="https://pesaway.com/contact-us" target="_blank">Pesaway contact page</a> or email <a href="mailto:info@pesaway.com">info@pesaway.com</a>.` },
  { keywords: ["e-retail", "retail"], reply: [
      "Pesaway's e-Retail solution enables merchants to accept a wide range of payment methods including cards, mobile money, and bank transfers.",
      "Merchant benefits include secure transactions, lower cart abandonment rates, real-time reporting, and seamless customer checkout experiences.",
      "API integration offers developers a unified endpoint, real-time payment verification, refund processing, and customizable checkout flows."
    ] },
  { keywords: ["onboarding"], reply: "To get started with Pesaway, register your business, provide KYC documentation, and complete verification. Once approved, you'll get access to the merchant dashboard." },
  { keywords: ["payments", "payment methods", "payment"], reply: "Pesaway Payments allow businesses to accept multiple payment methods such as card payments, mobile money, and bank transfers." },
  { keywords: ["igaming"], reply: "Pesaway’s iGaming solution supports secure deposits, instant withdrawals, anti-fraud measures, and regulatory compliance." },
  { keywords: ["financial institutions"], reply: "Pesaway offers financial institutions payment processing, cross-border remittances, and API integrations." },
  { keywords: ["bye", "exit"], reply: "Thank you for using PwBot. Have a great day." },
  // FAQ entries
  { keywords: ["how do i topup", "top up account", "load money"], reply: `
    To load money into the system, follow these steps:<br>
    1. Log into your <a href ="https://accounts.pesaway.com/identity/login">PesaWay account</a><br>
    2. On the Left Sidebar, click on <strong>Billing</strong>.<br>
    3. On the drop down menu, click on <strong>Payment Methods</strong>.<br>
    4. Select the Payment Method you prefer and proceed with the given steps.
  ` },
  { keywords: ["format phone numbers", "phone number error"], reply: `
    If your file upload failed with the error "Invalid Phone Number", add an apostrophe (') in front of the numbers and make sure they start with 254.<br>
    For many rows, use Excel formulas to fix them faster.
  ` },
  { keywords: ["separate names excel", "split names"], reply: `
    If names are in one cell, use Excel’s “Text to Columns” feature or refer to this tutorial (opens new window) to split them into separate columns.
  ` },
  { keywords: ["bulk sms auto approve", "auto approve bulk sms"], reply: `
    By default, only single SMS is auto-approved. To have Bulk SMS auto-approved, email <a href="mailto:support@pesaway.com">support@pesaway.com</a>.<br>
    We will notify you immediately once the change is made.
  ` }
];

// Process Input
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
          botReply(line, 1500, index === item.reply.length - 1);
        });
      } else {
        botReply(item.reply, 1500, true);
      }
      matched = true;
      break;
    }
  }

  if (!matched) {
    botReply("I'm here to help you learn about Pesaway. Ask me about MROs, card payments, integrations, e-Retail, or our other services.", 1500, true);
  }
}

sendBtn.addEventListener("click", processInput);
inputEl.addEventListener("keydown", e => {
  if (e.key === "Enter") processInput();
});

window.onload = () => {
  botReply("Welcome to PwBot.");
  botReply("Ask about Pesaway services like MROs, card payments, integrations, and more.");
};
