function sendMessage(message, sender = "bot") {
  const msgDiv = document.createElement("div");
  msgDiv.className = `bubble ${sender}`;
  msgDiv.textContent = message;
  document.getElementById("messages").appendChild(msgDiv);
  document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
}

function processInput() {
  const input = document.getElementById("userInput");
  const userMessage = input.value.trim();
  if (!userMessage) return;

  sendMessage(userMessage, "user");
  input.value = "";

  const msg = userMessage.toLowerCase();

  if (msg.includes("what is pesaway")) {
    sendMessage("Pesaway is a fintech platform offering secure, seamless payments, digital checkout, mobile remittance (MROs), and card payment integrations.");
  } else if (msg.includes("mro") || msg.includes("mobile remittance")) {
    sendMessage("MROs (Mobile Remittance Options) allow you to send or receive payments using mobile wallets across regions. Pesaway supports this securely and quickly.");
  } else if (msg.includes("card payment") || msg.includes("visa") || msg.includes("mastercard")) {
    sendMessage("Pesaway enables you to accept payments via major debit and credit cards through seamless integrations.");
  } else if (msg.includes("api") || msg.includes("integrate") || msg.includes("checkout")) {
    sendMessage("You can integrate Pesaway using REST APIs or hosted checkout forms. Learn more at developers.pesaway.com.");
  } else if (msg.includes("support") || msg.includes("contact")) {
    sendMessage("For support, visit https://pesaway.com/contact-us or contact the team directly on info@pesaway.com.");
  } else if (msg.includes("tell me about e-retail") || msg.includes("e-retail") || msg.includes("retail")) {
    sendMessage("Pesaway's e-Retail solution enables merchants to accept a wide range of payment methods including cards, mobile money, and bank transfers.");
    sendMessage("Merchant benefits include secure transactions, lower cart abandonment rates, real-time reporting, and seamless customer checkout experiences.");
    sendMessage("API integration offers developers a unified endpoint, real-time payment verification, refund processing, and customizable checkout flows.");
  } else if (msg.includes("bye") || msg.includes("exit")) {
    sendMessage("Thank you for using PwBot. Have a great day.");
  } else {
    sendMessage("I'm here to help you learn about Pesaway. Ask me about MROs, card payments, integrations, e-Retail, or our other services.");
  }
}

document.getElementById("sendBtn").addEventListener("click", processInput);

document.getElementById("userInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") processInput();
});

window.onload = () => {
  sendMessage("Welcome to PwBot.");
  sendMessage("Ask about Pesaway services like MROs, card payments, integrations, and more.");
};
