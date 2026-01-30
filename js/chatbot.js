// AI Chatbot Core Logic
// Integrates with Gemini AI for intelligent tool recommendations

class AIChatbot {
    constructor() {
        this.apiKey = null; // Will be set from admin config
        this.conversationHistory = [];
        this.toolsData = []; // Will be loaded from Firestore
        this.isInitialized = false;
    }

    async initialize() {
        try {
            // Load API key from Firestore config
            const config = await this.loadConfig();
            this.apiKey = config.geminiApiKey;

            // Load tools data for recommendations
            await this.loadToolsData();

            this.isInitialized = true;
            console.log('✅ AI Chatbot initialized');
        } catch (error) {
            console.error('❌ Chatbot initialization failed:', error);
        }
    }

    async loadConfig() {
        // Load from Firestore or use environment variable
        return {
            geminiApiKey: 'AIzaSyCNVtXGRPNqx38f4mG1_x9S-hs-wxy7Ae8',
            model: 'gemini-pro',
            maxTokens: 1000
        };
    }

    async loadToolsData() {
        try {
            // Load tools from Firestore using data service
            if (window.dataService) {
                this.toolsData = await window.dataService.getAllTools();
                console.log(`✅ Loaded ${this.toolsData.length} tools from Firestore`);
            } else {
                // Fallback to JSON if data service not available
                const response = await fetch('data/tools.json');
                this.toolsData = await response.json();
                console.log(`✅ Loaded ${this.toolsData.length} tools from JSON`);
            }
        } catch (error) {
            console.error('Error loading tools:', error);
            this.toolsData = [];
        }
    }

    async sendMessage(userMessage) {
        if (!this.isInitialized) {
            return {
                success: false,
                message: 'Chatbot is not initialized. Please try again.'
            };
        }

        // Add user message to history
        this.conversationHistory.push({
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        });

        try {
            // Generate AI response
            const response = await this.generateResponse(userMessage);

            // Add bot response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: response.message,
                toolsRecommended: response.tools || [],
                timestamp: new Date()
            });

            return {
                success: true,
                message: response.message,
                tools: response.tools || [],
                suggestedQuestions: response.suggestedQuestions || []
            };
        } catch (error) {
            console.error('Error generating response:', error);
            return {
                success: false,
                message: 'Sorry, I encountered an error. Please try again.'
            };
        }
    }

    async generateResponse(userMessage) {
        // Check if user is asking for tool recommendations
        const intent = this.detectIntent(userMessage);

        if (intent === 'tool_search') {
            return await this.handleToolSearch(userMessage);
        } else if (intent === 'general_info') {
            return this.handleGeneralInfo(userMessage);
        } else {
            return await this.handleGeminiQuery(userMessage);
        }
    }

    detectIntent(message) {
        const lowerMessage = message.toLowerCase();

        // Tool search keywords
        const toolKeywords = ['find', 'recommend', 'suggest', 'tool', 'ai for', 'best', 'help me'];
        if (toolKeywords.some(keyword => lowerMessage.includes(keyword))) {
            return 'tool_search';
        }

        // General info keywords
        const infoKeywords = ['what is', 'how does', 'about hubsnap', 'features'];
        if (infoKeywords.some(keyword => lowerMessage.includes(keyword))) {
            return 'general_info';
        }

        return 'general';
    }

    async handleToolSearch(message) {
        // Extract keywords and search tools
        const keywords = this.extractKeywords(message);
        const matchedTools = this.searchTools(keywords);

        if (matchedTools.length === 0) {
            return {
                message: "I couldn't find any tools matching your criteria. Could you be more specific about what you're looking for?",
                tools: [],
                suggestedQuestions: [
                    "Show me AI tools for video editing",
                    "Find free AI writing tools",
                    "What are the best AI tools for design?"
                ]
            };
        }

        // Generate response with tool recommendations
        const toolsList = matchedTools.slice(0, 5).map((tool, index) =>
            `${index + 1}. **${tool.name}** by ${tool.company} - ${tool.description.substring(0, 100)}...`
        ).join('\n\n');

        const message = `I found ${matchedTools.length} tools that might help you:\n\n${toolsList}\n\nWould you like to know more about any of these tools?`;

        return {
            message,
            tools: matchedTools.slice(0, 5),
            suggestedQuestions: [
                "Tell me more about " + matchedTools[0].name,
                "Show me free alternatives",
                "Compare these tools"
            ]
        };
    }

    handleGeneralInfo(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('hubsnap') || lowerMessage.includes('about')) {
            return {
                message: "HubSnap is your comprehensive AI tools discovery platform! We help you:\n\n• Discover 1,100+ AI tools organized by use case\n• Find the right AI for your specific needs\n• Access execution guides and templates\n• Compare tools and pricing\n\nWhat would you like to explore?",
                tools: [],
                suggestedQuestions: [
                    "Show me trending AI tools",
                    "Find free AI tools",
                    "What categories do you have?"
                ]
            };
        }

        return {
            message: "I'm here to help you discover AI tools! You can ask me to:\n\n• Find tools for specific tasks\n• Recommend free alternatives\n• Compare different tools\n• Suggest tools by category\n\nWhat can I help you with?",
            tools: [],
            suggestedQuestions: [
                "Find AI tools for content creation",
                "Show me video editing tools",
                "What are the best free AI tools?"
            ]
        };
    }

    async handleGeminiQuery(message) {
        // For now, return a helpful response
        // TODO: Integrate actual Gemini API
        return {
            message: "I'm here to help you find the perfect AI tools! Try asking me:\n\n• 'Find AI tools for [your task]'\n• 'Show me free alternatives to [tool name]'\n• 'What are the best tools for [category]?'\n\nWhat would you like to know?",
            tools: [],
            suggestedQuestions: [
                "Find AI tools for video editing",
                "Show me free writing tools",
                "What's trending in AI?"
            ]
        };
    }

    extractKeywords(message) {
        // Simple keyword extraction
        const stopWords = ['find', 'show', 'me', 'the', 'a', 'an', 'for', 'to', 'in', 'on', 'with'];
        const words = message.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => !stopWords.includes(word) && word.length > 2);

        return words;
    }

    searchTools(keywords) {
        if (!this.toolsData || this.toolsData.length === 0) {
            return [];
        }

        return this.toolsData.filter(tool => {
            const searchText = `${tool.name} ${tool.company} ${tool.category} ${tool.description}`.toLowerCase();
            return keywords.some(keyword => searchText.includes(keyword));
        }).sort((a, b) => {
            // Sort by relevance (number of keyword matches)
            const aMatches = keywords.filter(k =>
                `${a.name} ${a.category} ${a.description}`.toLowerCase().includes(k)
            ).length;
            const bMatches = keywords.filter(k =>
                `${b.name} ${b.category} ${b.description}`.toLowerCase().includes(k)
            ).length;
            return bMatches - aMatches;
        });
    }

    getConversationHistory() {
        return this.conversationHistory;
    }

    clearHistory() {
        this.conversationHistory = [];
        localStorage.removeItem('chatbot_history');
    }

    saveHistory() {
        localStorage.setItem('chatbot_history', JSON.stringify(this.conversationHistory));
    }

    loadHistory() {
        const saved = localStorage.getItem('chatbot_history');
        if (saved) {
            this.conversationHistory = JSON.parse(saved);
        }
    }
}

// Initialize chatbot instance
window.aiChatbot = new AIChatbot();
