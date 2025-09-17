document.addEventListener('DOMContentLoaded', function() {
  const messagesEl = document.getElementById("messages");
  const inputEl = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const recentChatsEl = document.getElementById("recent-chats");
  const clearChatsBtn = document.getElementById("clear-chats");
  const translateToggleBtn = document.getElementById("translateToggle");
  const googleTranslateEl = document.getElementById("google_translate_element");
  
  // Currency Converter Elements
  const currencyConverterBtn = document.getElementById("currency-converter-btn");
  const currencyConverterPanel = document.getElementById("currency-converter-panel");
  const backToChatsBtn = document.getElementById("back-to-chats");
  const amountInput = document.getElementById("amount");
  const fromCurrencySelect = document.getElementById("from-currency");
  const toCurrencySelect = document.getElementById("to-currency");
  const convertBtn = document.getElementById("convert-btn");
  const conversionResult = document.getElementById("conversion-result");
  const conversionError = document.getElementById("conversion-error");
  const lastUpdatedText = document.getElementById("last-updated-text");
  
  // Base currency list with names
  const baseCurrencyList = {
    "USD": "US Dollar",
    "EUR": "Euro",
    "GBP": "British Pound",
    "KES": "Kenyan Shilling",
    "TZS": "Tanzanian Shilling",
    "UGX": "Ugandan Shilling",
    "NGN": "Nigerian Naira",
    "ZAR": "South African Rand",
    "GHS": "Ghanaian Cedi",
    "XOF": "West African CFA Franc",
    "XAF": "Central African CFA Franc",
    "ETB": "Ethiopian Birr",
    "RWF": "Rwandan Franc",
    "BIF": "Burundian Franc",
    "MWK": "Malawian Kwacha",
    "MZN": "Mozambican Metical",
    "MAD": "Moroccan Dirham",
    "EGP": "Egyptian Pound",
    "CNY": "Chinese Yuan",
    "JPY": "Japanese Yen",
    "ZMW": "Zambian Kwacha",
    "SOS": "Somali Shilling",
    "SDG": "Sudanese Pound",
    "LRD": "Liberian Dollar",
  };
  
  // Initialize with loading state
  fromCurrencySelect.innerHTML = '<option value="">Loading currencies...</option>';
  toCurrencySelect.innerHTML = '<option value="">Loading currencies...</option>';
  
  // Google Translate toggle functionality
  translateToggleBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    googleTranslateEl.classList.toggle('show');
  });
  // Close Google Translate when clicking outside
  document.addEventListener('click', function(event) {
    if (!translateToggleBtn.contains(event.target) && !googleTranslateEl.contains(event.target)) {
      googleTranslateEl.classList.remove('show');
    }
  });
  // Currency Converter functionality
  currencyConverterBtn.addEventListener('click', function() {
    recentChatsEl.style.display = 'none';
    currencyConverterPanel.style.display = 'flex';
    clearChatsBtn.style.display = 'none';
    currencyConverterBtn.style.display = 'none';
    
    loadExchangeRates();
  });
  backToChatsBtn.addEventListener('click', function() {
    currencyConverterPanel.style.display = 'none';
    recentChatsEl.style.display = 'block';
    clearChatsBtn.style.display = 'flex';
    currencyConverterBtn.style.display = 'flex';
  });
  // Exchange rates data and caching
  let exchangeRates = {};
  let lastUpdated = null;
  let supportedCurrencies = [];
  
  // Build currency dropdowns
  function buildCurrencyDropdowns() {
    fromCurrencySelect.innerHTML = '';
    toCurrencySelect.innerHTML = '';
    
    // Sort currencies alphabetically
    const sortedCurrencies = [...supportedCurrencies].sort();
    
    sortedCurrencies.forEach(code => {
      const name = baseCurrencyList[code] || code;
      const option1 = document.createElement("option");
      option1.value = code;
      option1.textContent = `${code} - ${name}`;
      fromCurrencySelect.appendChild(option1);
      
      const option2 = document.createElement("option");
      option2.value = code;
      option2.textContent = `${code} - ${name}`;
      toCurrencySelect.appendChild(option2);
    });
    
    // Set default values
    if (supportedCurrencies.includes("USD")) {
      fromCurrencySelect.value = "USD";
    } else if (supportedCurrencies.length > 0) {
      fromCurrencySelect.value = supportedCurrencies[0];
    }
    
    if (supportedCurrencies.includes("KES")) {
      toCurrencySelect.value = "KES";
    } else if (supportedCurrencies.length > 1) {
      toCurrencySelect.value = supportedCurrencies[1];
    } else if (supportedCurrencies.length > 0) {
      toCurrencySelect.value = supportedCurrencies[0];
    }
  }
  
  // Load exchange rates from API or cache
  function loadExchangeRates() {
    // Check if we have cached rates that are less than 24 hours old
    const cachedRates = localStorage.getItem('exchangeRates');
    const cachedTime = localStorage.getItem('exchangeRatesTime');
    const cachedSupportedCurrencies = localStorage.getItem('supportedCurrencies');
    
    if (cachedRates && cachedTime && cachedSupportedCurrencies) {
      const now = new Date().getTime();
      const cacheAge = now - parseInt(cachedTime);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (cacheAge < twentyFourHours) {
        exchangeRates = JSON.parse(cachedRates);
        supportedCurrencies = JSON.parse(cachedSupportedCurrencies);
        lastUpdated = new Date(parseInt(cachedTime));
        buildCurrencyDropdowns();
        updateLastUpdatedText();
        return;
      }
    }
    
    // Fetch updated rates from API
    fetchExchangeRates();
  }
  
  // Fetch exchange rates from API (exchangerate-api.com)
  function fetchExchangeRates() {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(response => response.json())
      .then(data => {
        if (data && data.rates) {
          exchangeRates = data.rates;
          supportedCurrencies = Object.keys(exchangeRates);
          lastUpdated = new Date();
          
          localStorage.setItem('exchangeRates', JSON.stringify(exchangeRates));
          localStorage.setItem('exchangeRatesTime', lastUpdated.getTime().toString());
          localStorage.setItem('supportedCurrencies', JSON.stringify(supportedCurrencies));
          
          buildCurrencyDropdowns();
          updateLastUpdatedText();
          clearConversionError();
        } else {
          showConversionError('Failed to load exchange rates');
          showCurrencyLoadError();
        }
      })
      .catch(error => {
        console.error('Error fetching exchange rates:', error);
        showConversionError('Network error. Please try again later.');
        showCurrencyLoadError();
      });
  }
  
  // Show currency load error in dropdowns
  function showCurrencyLoadError() {
    fromCurrencySelect.innerHTML = '<option value="">Error loading currencies</option>';
    toCurrencySelect.innerHTML = '<option value="">Error loading currencies</option>';
  }

  // Update last updated text
  function updateLastUpdatedText() {
    if (lastUpdated) {
      lastUpdatedText.textContent = `Last updated: ${lastUpdated.toLocaleString()}`;
    }
  }
  // Convert currency
  convertBtn.addEventListener('click', function() {
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    
    if (isNaN(amount) || amount <= 0) {
      showConversionError('Please enter a valid amount');
      return;
    }
    
    if (fromCurrency === toCurrency) {
      showConversionResult(amount, toCurrency);
      return;
    }
    
    if (Object.keys(exchangeRates).length === 0) {
      // rates not loaded — try to fetch before converting
      showConversionError('Exchange rates not loaded. Loading now...');
      fetchExchangeRates().then(() => {
        // After fetching, try conversion again
        convertCurrency(amount, fromCurrency, toCurrency);
      });
      return;
    }
    
    // Try conversion using cached rates
    convertCurrency(amount, fromCurrency, toCurrency);
  });
  
  // Function to handle the actual conversion
  function convertCurrency(amount, fromCurrency, toCurrency) {
    // Check if both currencies exist in our rates
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
      showConversionError(`Currency not supported. Available currencies: ${supportedCurrencies.slice(0, 5).join(', ')}...`);
      return;
    }
    
    // Convert to USD first, then to target currency
    const usdAmount = amount / exchangeRates[fromCurrency];
    const result = usdAmount * exchangeRates[toCurrency];
    
    showConversionResult(result, toCurrency);
    clearConversionError();
  }
  
  // Show conversion result
  function showConversionResult(amount, currency) {
    conversionResult.textContent = `${amount.toFixed(2)} ${currency}`;
    conversionResult.style.display = 'block';
  }
  // Show conversion error
  function showConversionError(message) {
    conversionError.textContent = message;
    conversionError.style.display = 'block';
    conversionResult.style.display = 'none';
  }
  // Clear conversion error
  function clearConversionError() {
    conversionError.style.display = 'none';
  }
  // Typing Indicator 
  function showTypingIndicator() {
    const typingEl = document.createElement("div");
    typingEl.className = "message bot";
    typingEl.id = "typing-bubble";
    typingEl.innerHTML = `
      <div class="message-icon">
        <img src="min.png" alt="Bot" class="bot-icon-img">
      </div>
      <div class="bubble bot typing">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    `;
    messagesEl.appendChild(typingEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function hideTypingIndicator() {
    const typingEl = document.getElementById("typing-bubble");
    if (typingEl) typingEl.remove();
  }
  function botReply(message, delay = 1200, showFeedback = false) {
    showTypingIndicator();
    setTimeout(() => {
      hideTypingIndicator();
      sendMessage(message, "bot", showFeedback);
    }, delay);
  }
  // Send Message 
  function sendMessage(message, sender = "bot", showFeedback = false) {
    const wrapper = document.createElement("div");
    wrapper.className = `message ${sender}`;
    
    // Message icon
    const iconDiv = document.createElement("div");
    iconDiv.className = "message-icon";
    if (sender === "bot") {
      iconDiv.innerHTML = `<img src="min.png" alt="Bot" class="bot-icon-img">`;
    } else {
      iconDiv.innerHTML = '<i class="fi-rr-user"></i>';
    }
    wrapper.appendChild(iconDiv);
    
    // Message bubble
    const bubble = document.createElement("div");
    bubble.className = `bubble ${sender}`;
    bubble.innerHTML = Array.isArray(message) ? message.join("<br><br>") : message;
    
    // Timestamp
    const timestamp = document.createElement("small");
    timestamp.textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    bubble.appendChild(timestamp);
    wrapper.appendChild(bubble);
    
    messagesEl.appendChild(wrapper);
    
    // Feedback buttons for bot
    if (sender === "bot" && showFeedback) {
      const feedbackDiv = document.createElement("div");
      feedbackDiv.className = "feedback-buttons";
      const yesBtn = document.createElement("button");
      yesBtn.innerHTML = '<i class="fi-rr-check"></i> Yes';
      yesBtn.className = "yes-btn";
      yesBtn.onclick = (ev) => handleFeedback("yes", message, ev);
      const noBtn = document.createElement("button");
      noBtn.innerHTML = '<i class="fi-rr-cross"></i> No';
      noBtn.className = "no-btn";
      noBtn.onclick = (ev) => handleFeedback("no", message, ev);
      feedbackDiv.appendChild(yesBtn);
      feedbackDiv.appendChild(noBtn);
      messagesEl.appendChild(feedbackDiv);
    }
    
    messagesEl.scrollTop = messagesEl.scrollHeight;
    if (sender === "user") saveRecentChat(message);
  }
  // Feedback 
  function handleFeedback(response, relatedMessage, ev) {
    console.log(`Feedback: ${response} for "${relatedMessage}"`);
    const feedbackDiv = ev.target.parentElement;
    feedbackDiv.innerHTML = `<small><i class="fi-rr-check-circle"></i> Thanks for your feedback!</small>`;
  }
  // Recent Chats
  function saveRecentChat(message) {
    let chats = JSON.parse(localStorage.getItem("recentChats")) || [];
    chats.unshift(message);
    if (chats.length > 10) chats = chats.slice(0, 10);
    localStorage.setItem("recentChats", JSON.stringify(chats));
    renderRecentChats();
  }
  function renderRecentChats() {
    recentChatsEl.innerHTML = "";
    const chats = JSON.parse(localStorage.getItem("recentChats")) || [];
    chats.forEach((chat) => {
      const li = document.createElement("li");
      li.innerHTML = `<i class="fi-rr-comment"></i> ${chat}`;
      li.onclick = () => {
        inputEl.value = chat;
        processInput();
      };
      recentChatsEl.appendChild(li);
    });
  }
  clearChatsBtn.onclick = () => {
    localStorage.removeItem("recentChats");
    renderRecentChats();
  };
  
  // Human Agent Transfer Feature
  function showHumanAgentForm() {
    const formWrapper = document.createElement("div");
    formWrapper.className = "message bot";
    formWrapper.id = "human-agent-form";
    
    // Message icon
    const iconDiv = document.createElement("div");
    iconDiv.className = "message-icon";
    iconDiv.innerHTML = `<img src="min.png" alt="Bot" class="bot-icon-img">`;
    formWrapper.appendChild(iconDiv);
    
    // Form container
    const formContainer = document.createElement("div");
    formContainer.className = "bubble bot human-agent-form";
    
    formContainer.innerHTML = `
      <h4>Transfer to Human Agent</h4>
      <p>Please fill out the form below and our support team will contact you shortly.</p>
      <div class="form-group">
        <label for="user-name">Name:</label>
        <input type="text" id="user-name" placeholder="Your full name" required>
      </div>
      <div class="form-group">
        <label for="user-email">Email:</label>
        <input type="email" id="user-email" placeholder="your.email@example.com" required>
      </div>
      <div class="form-group">
        <label for="user-phone">Phone:</label>
        <input type="tel" id="user-phone" placeholder="Your phone number">
      </div>
      <div class="form-group">
        <label for="user-message">How can we help you?</label>
        <textarea id="user-message" rows="3" placeholder="Describe your issue in detail" required></textarea>
      </div>
      <div class="form-actions">
        <button id="submit-human-request" class="submit-btn">Submit Request</button>
        <button id="cancel-human-request" class="cancel-btn">Cancel</button>
      </div>
    `;
    
    formWrapper.appendChild(formContainer);
    messagesEl.appendChild(formWrapper);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    
    // Add event listeners to form buttons
    document.getElementById('submit-human-request').addEventListener('click', submitHumanAgentRequest);
    document.getElementById('cancel-human-request').addEventListener('click', cancelHumanAgentRequest);
  }
  
  function submitHumanAgentRequest() {
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const phone = document.getElementById('user-phone').value;
    const message = document.getElementById('user-message').value;
    
    if (!name || !email || !message) {
      alert('Please fill in all required fields.');
      return;
    }
    
    // Remove the form
    const formEl = document.getElementById('human-agent-form');
    if (formEl) formEl.remove();
    
    // Show confirmation message
    const confirmation = `
      <strong>Request Submitted!</strong><br>
      Thank you, ${name}! Your support request has been submitted. Our team will contact you at ${email} ${phone ? `or ${phone}` : ''} within 24 hours.
    `;
    
    botReply(confirmation);
    
    console.log('Human agent request:', { name, email, phone, message });
  }
  
  function cancelHumanAgentRequest() {
    const formEl = document.getElementById('human-agent-form');
    if (formEl) formEl.remove();
    
    botReply("No problem! Is there anything else I can help you with?");
  }
  
  // Bot Responses
  const responses = [
    {
      keywords: [
        "requirement", "requirements", "what do i need", "sign up requirements", "register requirements",
        "documents", "what documents", "kyc", "verification"
      ],
      reply: `
        <strong>Pesaway Registration Requirements:</strong><br>
        <ul>
          <li><b>Individuals:</b> Valid email address, phone number, and National ID or Passport.</li>
          <li><b>Businesses:</b> Certificate of Incorporation, KRA PIN, CR12 (or equivalent), and Director IDs.</li>
        </ul>
        <a href="https://docs.pesaway.com/user/#requirements" target="_blank">See full requirements</a>
      `,
    },
    {
      keywords: ["how to register", "sign up", "create account", "register", "onboarding", "getting started"],
      reply: `
        <strong>How to register on Pesaway:</strong><br>
        1. Go to <a href="https://accounts.pesaway.com/identity/register" target="_blank">Pesaway Registration</a>.<br>
        2. Fill in your details and submit.<br>
        3. Verify your email and phone.<br>
        4. Upload required documents for KYC.<br>
        5. Wait for approval.<br>
        <a href="https://docs.pesaway.com/user/#requirements" target="_blank">More info</a>
      `,
    },
    {
      keywords: ["what is pesaway", "pesaway", "what does pesaway do"],
      reply: "Pesaway is a comprehensive payment platform that enables businesses to accept payments, send payouts, and manage financial transactions. Our platform supports multiple payment methods including mobile money, cards, and bank transfers with a focus on the African market.",
    },
    {
      keywords: ["mro", "mobile remittance", "mobile money"],
      reply: "Pesaway supports mobile money remittances (MROs) allowing you to send and receive payments through popular mobile wallets like M-Pesa, Airtel Money, and Tigo Pesa. This service enables instant money transfers across different mobile networks and regions.",
    },
    {
      keywords: ["card payment", "visa", "mastercard"],
      reply: "Pesaway provides seamless card payment processing for Visa, Mastercard, and other major card networks. Our solution includes secure payment gateways, fraud detection, and easy integration with your existing systems.",
    },
    {
      keywords: ["api", "integrate", "checkout", "developer"],
      reply: `Pesaway offers comprehensive APIs and SDKs for developers to integrate payment functionality into websites and mobile applications. You can access our developer documentation at <a href="https://docs.pesaway.com" target="_blank">docs.pesaway.com</a> for detailed integration guides.`,
    },
    {
      keywords: ["support", "contact", "help"],
      reply: `For support and assistance, you can contact our customer service team through the help center at <a href="https://docs.pesaway.com/user/" target="_blank">docs.pesaway.com/user/</a> or email us at <a href="mailto:support@pesaway.com">support@pesaway.com</a>. We're available 24/7 to assist you.`,
    },
    {
      keywords: ["e-retail", "retail", "ecommerce"],
      reply: [
        "Pesaway's e-Retail solution is designed for online businesses and e-commerce platforms. It enables you to accept multiple payment methods from customers across Africa.",
        "Key features include secure checkout experiences, automated payment processing, real-time transaction monitoring, and easy integration with popular e-commerce platforms.",
        "Our solution helps reduce cart abandonment and increase conversion rates by offering customers their preferred payment options."
      ],
    },
    {
      keywords: ["payments", "payment methods", "payment options"],
      reply: "Pesaway supports a wide range of payment methods including mobile money (M-Pesa, Airtel Money, Tigo Pesa), credit and debit cards (Visa, Mastercard), bank transfers, and digital wallets. This multi-payment approach ensures you can serve customers with different payment preferences.",
    },
    {
      keywords: ["igaming", "gaming", "betting"],
      reply: "Pesaway offers specialized payment solutions for the iGaming industry, including secure deposit and withdrawal processing, multi-currency support, fraud prevention tools, and compliance with gaming regulations. Our solution ensures fast, reliable transactions for gaming platforms.",
    },
    {
      keywords: ["financial institutions", "banks", "fintech"],
      reply: "Pesaway partners with financial institutions to provide innovative payment solutions, including white-label payment processing, cross-border payment capabilities, and API integrations for banking and fintech applications.",
    },
    {
      keywords: ["bye", "exit", "goodbye"],
      reply: "Thank you for using Pesaway. If you have any more questions, feel free to ask. Have a great day!",
    },
    {
      keywords: ["how do i top up", "top up account", "load money", "add funds"],
      reply: `
        To top up your Pesaway account:<br>
        1. Log in to your Pesaway dashboard<br>
        2. Navigate to the "Wallet" or "Funds" section<br>
        3. Select "Add Funds" or "Top Up"<br>
        4. Choose your preferred payment method<br>
        5. Enter the amount and follow the prompts to complete the transaction
      `,
    },
    {
      keywords: ["format phone numbers", "phone number error"],
      reply: `
        When formatting phone numbers for transactions:<br>
        1. Use the international format without spaces or special characters<br>
        2. Include the country code (e.g., 254 for Kenya)<br>
        3. For bulk uploads, ensure all numbers follow the same format<br>
        4. Example: 254712345678 instead of +254 712 345 678
      `,
    },
    {
      keywords: ["bulk sms auto approve", "auto approve bulk sms"],
      reply: `
        To enable auto-approval for bulk SMS:<br>
        1. Log in to your Pesaway dashboard<br>
        2. Go to Settings > SMS Preferences<br>
        3. Enable "Auto-approve Bulk SMS" option<br>
        4. Save your changes<br>
        5. Alternatively, contact our support team at <a href="mailto:support@pesaway.com">support@pesaway.com</a> to enable this feature for your account.
      `,
    },
    {
      keywords: ["view recent payments", "recent payments", "transaction history"],
      reply: `
        To view your recent payments:<br>
        1. Log in to your Pesaway dashboard<br>
        2. Navigate to the "Transactions" or "Payments" section<br>
        3. You'll see a list of your recent transactions with details like amount, date, status, and recipient<br>
        4. Use the filters to search for specific transactions or date ranges
      `,
    },
    {
      keywords: ["check recent sms", "check recent airtime", "recent sms", "recent airtime"],
      reply: `
        To check your recent SMS or airtime transactions:<br>
        1. Log in to your Pesaway dashboard<br>
        2. Go to the "Transactions" section<br>
        3. Use the filter options to select "SMS" or "Airtime" transaction types<br>
        4. View detailed information about each transaction including status and delivery reports
      `,
    },
    {
      keywords: ["currency converter", "exchange rate", "convert currency"],
      reply: "You can use our currency converter in the sidebar to check exchange rates between different currencies. It supports major African currencies and international currencies like USD, EUR, and GBP.",
    },
    {
      keywords: ["fees", "pricing", "charges"],
      reply: "Pesaway offers competitive pricing with transparent fees. Transaction fees vary based on payment method, transaction volume, and business type. For detailed pricing information, please refer to our pricing page or contact our sales team for a customized quote based on your specific business needs.",
    },
    {
      keywords: ["security", "fraud prevention"],
      reply: "Pesaway employs industry-leading security measures including end-to-end encryption, fraud detection algorithms, PCI DSS compliance, and regular security audits. We also offer additional security features like two-factor authentication and transaction monitoring to protect your business and customers.",
    },
    {
      keywords: ["settlement", "withdraw funds", "transfer to bank"],
      reply: "Settlement timelines depend on your account type and the payment method. Most settlements are processed within 1-3 business days. You can initiate withdrawals from your Pesaway wallet to your bank account through the dashboard. For specific settlement schedules, please check your account settings or contact support.",
    },
    {
      keywords: ["refund", "dispute", "chargeback"],
      reply: `To process a refund, go to the transaction details in your dashboard and select "Issue Refund". Refunds are typically processed within 5-7 business days. For disputes or chargebacks, our team will guide you through the process and provide the necessary documentation to resolve the issue.`,
    },
    {
      keywords: ["webhooks", "notifications", "callbacks"],
      reply: "Pesaway provides webhook notifications to keep you updated about transaction status changes. You can configure webhook URLs in your dashboard settings to receive real-time notifications for events like successful payments, failed transactions, and settlement completions.",
    },
    {
      keywords: ["human agent", "talk to human", "real person", "support agent", "customer service"],
      reply: "I'd be happy to transfer you to a human agent who can provide more personalized assistance.",
      showForm: true
    }
    
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
      if (item.keywords.some((kw) => msg.includes(kw))) {
        botReply(item.reply, 1200, true);
        if (item.showForm) {
          setTimeout(() => showHumanAgentForm(), 2500);
        }
        matched = true;
        break;
      }
    }
    if (!matched) {
      botReply(
        "I'm sorry, I don't have information about that topic. Would you like me to transfer you to a human agent who can better assist you?",
        1200,
        true
      );
      setTimeout(() => {
        const transferBtn = document.createElement("button");
        transferBtn.className = "transfer-btn";
        transferBtn.textContent = "Transfer to Human Agent";
        transferBtn.onclick = showHumanAgentForm;
        messagesEl.appendChild(transferBtn);
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }, 2500);
    }
  }
  // Attach event listeners
  sendBtn.addEventListener("click", processInput);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") processInput();
  });
  // FAQ Button Handlers
  document.querySelectorAll('.faq-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      inputEl.value = btn.textContent.replace(/.*?\s/, ''); 
      processInput();
    });
  });
  // Initialize the chat
  botReply("Welcome to Pesaway Assistant!");
  botReply("I'm here to help you with payments, mobile money, API integration, and other Pesaway services. You can also use the currency converter in the sidebar to check exchange rates. How can I assist you today?");
  renderRecentChats();
});