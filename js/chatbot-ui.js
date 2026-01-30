// AI Chatbot UI Component
// Handles the visual interface and user interactions

class ChatbotUI {
    constructor() {
        this.isOpen = false;
        this.isMinimized = false;
        this.chatbot = window.aiChatbot;
        this.container = null;
        this.messagesContainer = null;
        this.inputField = null;
    }

    initialize() {
        this.createChatWidget();
        this.attachEventListeners();
        this.chatbot.loadHistory();
        this.renderHistory();
        console.log('✅ Chatbot UI initialized');
    }

    createChatWidget() {
        const widget = document.createElement('div');
        widget.id = 'chatbot-widget';
        widget.innerHTML = `
            <!-- Chat Button -->
            <button id="chat-toggle-btn" class="chat-toggle-btn" aria-label="Open chat">
                <i class="fas fa-comments"></i>
                <span class="chat-badge">AI</span>
            </button>

            <!-- Chat Window -->
            <div id="chat-window" class="chat-window" style="display: none;">
                <!-- Header -->
                <div class="chat-header">
                    <div class="chat-header-content">
                        <div class="chat-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div>
                            <h3>HubSnap AI Assistant</h3>
                            <p class="chat-status">
                                <span class="status-dot"></span>
                                Online
                            </p>
                        </div>
                    </div>
                    <div class="chat-header-actions">
                        <button id="chat-minimize-btn" class="chat-action-btn" aria-label="Minimize">
                            <i class="fas fa-minus"></i>
                        </button>
                        <button id="chat-close-btn" class="chat-action-btn" aria-label="Close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <!-- Messages -->
                <div id="chat-messages" class="chat-messages">
                    <!-- Welcome message -->
                    <div class="chat-message bot-message">
                        <div class="message-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="message-content">
                            <p>👋 Hi! I'm your AI assistant. I can help you find the perfect AI tools for your needs!</p>
                            <p style="margin-top: 0.5rem; font-size: 0.9rem;">Try asking:</p>
                        </div>
                    </div>
                    
                    <!-- Suggested questions -->
                    <div class="suggested-questions">
                        <button class="suggested-question" data-question="Find AI tools for video editing">
                            🎬 Video editing tools
                        </button>
                        <button class="suggested-question" data-question="Show me free AI writing tools">
                            ✍️ Free writing tools
                        </button>
                        <button class="suggested-question" data-question="What are trending AI tools?">
                            📈 Trending tools
                        </button>
                    </div>
                </div>

                <!-- Input -->
                <div class="chat-input-container">
                    <div class="chat-input-wrapper">
                        <input 
                            type="text" 
                            id="chat-input" 
                            class="chat-input" 
                            placeholder="Ask me anything about AI tools..."
                            autocomplete="off"
                        />
                        <button id="chat-send-btn" class="chat-send-btn" aria-label="Send message">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    <div class="chat-footer-text">
                        Powered by Gemini AI
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(widget);

        this.container = document.getElementById('chat-window');
        this.messagesContainer = document.getElementById('chat-messages');
        this.inputField = document.getElementById('chat-input');
    }

    attachEventListeners() {
        // Toggle chat
        document.getElementById('chat-toggle-btn').addEventListener('click', () => {
            this.toggleChat();
        });

        // Close chat
        document.getElementById('chat-close-btn').addEventListener('click', () => {
            this.closeChat();
        });

        // Minimize chat
        document.getElementById('chat-minimize-btn').addEventListener('click', () => {
            this.minimizeChat();
        });

        // Send message
        document.getElementById('chat-send-btn').addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter key to send
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Suggested questions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggested-question')) {
                const question = e.target.dataset.question;
                this.inputField.value = question;
                this.sendMessage();
            }
        });
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        this.isOpen = true;
        this.container.style.display = 'flex';
        this.inputField.focus();

        // Initialize chatbot if not already done
        if (!this.chatbot.isInitialized) {
            this.chatbot.initialize();
        }
    }

    closeChat() {
        this.isOpen = false;
        this.container.style.display = 'none';
    }

    minimizeChat() {
        this.isMinimized = !this.isMinimized;
        if (this.isMinimized) {
            this.container.classList.add('minimized');
        } else {
            this.container.classList.remove('minimized');
        }
    }

    async sendMessage() {
        const message = this.inputField.value.trim();
        if (!message) return;

        // Clear input
        this.inputField.value = '';

        // Add user message to UI
        this.addMessage(message, 'user');

        // Show typing indicator
        this.showTypingIndicator();

        // Get bot response
        const response = await this.chatbot.sendMessage(message);

        // Hide typing indicator
        this.hideTypingIndicator();

        // Add bot response to UI
        if (response.success) {
            this.addMessage(response.message, 'bot');

            // Add tool cards if any
            if (response.tools && response.tools.length > 0) {
                this.addToolCards(response.tools);
            }

            // Add suggested questions
            if (response.suggestedQuestions && response.suggestedQuestions.length > 0) {
                this.addSuggestedQuestions(response.suggestedQuestions);
            }
        } else {
            this.addMessage(response.message, 'bot');
        }

        // Save history
        this.chatbot.saveHistory();

        // Scroll to bottom
        this.scrollToBottom();
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;

        messageDiv.innerHTML = `
            ${sender === 'bot' ? '<div class="message-avatar"><i class="fas fa-robot"></i></div>' : ''}
            <div class="message-content">
                <p>${this.formatMessage(text)}</p>
                <span class="message-time">${this.formatTime(new Date())}</span>
            </div>
        `;

        // Remove existing suggested questions before adding new message
        const existingSuggestions = this.messagesContainer.querySelector('.suggested-questions');
        if (existingSuggestions) {
            existingSuggestions.remove();
        }

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addToolCards(tools) {
        const toolsContainer = document.createElement('div');
        toolsContainer.className = 'tool-cards-container';

        tools.forEach(tool => {
            const card = document.createElement('a');
            const url = tool.website_url || tool.websiteUrl || tool.url || '#';
            card.href = url;
            card.target = '_blank';
            card.className = 'tool-card-mini';
            card.innerHTML = `
                <div class="tool-card-header">
                    <strong>${tool.name}</strong>
                    <span class="tool-badge">${tool.pricing}</span>
                </div>
                <p class="tool-card-company">${tool.company}</p>
                <p class="tool-card-category">${tool.category}</p>
            `;
            toolsContainer.appendChild(card);
        });

        this.messagesContainer.appendChild(toolsContainer);
        this.scrollToBottom();
    }

    addSuggestedQuestions(questions) {
        const container = document.createElement('div');
        container.className = 'suggested-questions';

        questions.forEach(question => {
            const btn = document.createElement('button');
            btn.className = 'suggested-question';
            btn.dataset.question = question;
            btn.textContent = question;
            container.appendChild(btn);
        });

        this.messagesContainer.appendChild(container);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'typing-indicator';
        indicator.className = 'chat-message bot-message';
        indicator.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        this.messagesContainer.appendChild(indicator);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    formatMessage(text) {
        // Convert markdown-style formatting
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    renderHistory() {
        const history = this.chatbot.getConversationHistory();
        history.forEach(msg => {
            this.addMessage(msg.content, msg.role === 'user' ? 'user' : 'bot');
            if (msg.toolsRecommended && msg.toolsRecommended.length > 0) {
                this.addToolCards(msg.toolsRecommended);
            }
        });
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }
}

// Initialize chatbot UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.chatbotUI = new ChatbotUI();
    window.chatbotUI.initialize();
});
