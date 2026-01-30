# AI Chatbot - Setup Guide

## 🎯 What's Been Implemented

### Phase 1: AI Chatbot System ✅
The chatbot is now live on your website! Here's what's included:

#### Core Features:
1. **Intelligent Tool Search** - Chatbot understands natural language queries
2. **Tool Recommendations** - Suggests AI tools from your website database
3. **Conversation History** - Saves chat history in browser localStorage
4. **Suggested Questions** - Quick-action buttons for common queries
5. **Mobile Responsive** - Works perfectly on all devices
6. **Beautiful UI** - Glassmorphism design matching your site aesthetic

#### Files Created:
- `js/chatbot.js` - Core chatbot logic and AI integration
- `js/chatbot-ui.js` - Chat interface and user interactions
- `css/chatbot.css` - Chatbot styling and animations
- `js/firebase-config.js` - Updated with Firestore support

## 🚀 How to Use

### For Users:
1. Click the floating chat button (bottom-right corner)
2. Ask questions like:
   - "Find AI tools for video editing"
   - "Show me free writing tools"
   - "What are trending AI tools?"
3. Click on tool cards to visit tool pages
4. Use suggested questions for quick searches

### For Admins:
The chatbot currently works with your existing `tools.js` data. To enable full AI features:

#### Step 1: Get Gemini API Key (FREE)
1. Visit: https://ai.google.dev/
2. Click "Get API Key"
3. Create a new API key (free tier: 60 requests/minute)
4. Copy the API key

#### Step 2: Add API Key to Config
Open `js/chatbot.js` and replace line 25:
```javascript
geminiApiKey: 'YOUR_GEMINI_API_KEY', // Replace with your actual key
```

With:
```javascript
geminiApiKey: 'YOUR-ACTUAL-API-KEY-HERE',
```

## 🎨 Customization

### Change Chatbot Colors:
Edit `css/chatbot.css`:
```css
/* Line 16 - Chat button gradient */
background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));

/* Line 76 - Chat header gradient */
background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
```

### Modify Welcome Message:
Edit `js/chatbot-ui.js`, line 35:
```javascript
<p>👋 Hi! I'm your AI assistant. I can help you find the perfect AI tools for your needs!</p>
```

### Update Suggested Questions:
Edit `js/chatbot-ui.js`, lines 43-51:
```html
<button class="suggested-question" data-question="Your question here">
    🎬 Your label here
</button>
```

## 🔧 Advanced Configuration

### Enable Full Gemini AI Integration:
Once you have your API key, the chatbot will:
- Generate more intelligent responses
- Understand complex queries
- Provide contextual recommendations
- Learn from conversation history

### Firestore Integration (Phase 2):
To store conversations in Firestore:
1. Enable Firestore in Firebase Console
2. Update `js/chatbot.js` to save conversations
3. Create admin panel to view chat analytics

## 📊 Features Roadmap

### Completed ✅:
- [x] Chat widget UI
- [x] Tool search and recommendations
- [x] Conversation history (localStorage)
- [x] Mobile responsive design
- [x] Suggested questions
- [x] Tool cards in chat

### Coming Soon 🚧:
- [ ] Full Gemini AI integration
- [ ] Firestore conversation storage
- [ ] Admin analytics dashboard
- [ ] Multi-language support
- [ ] Voice input
- [ ] File attachments

## 🐛 Troubleshooting

### Chatbot not appearing?
1. Check browser console for errors
2. Verify `css/chatbot.css` is loading
3. Ensure `js/chatbot.js` and `js/chatbot-ui.js` are loading
4. Hard refresh (Ctrl+F5 or Cmd+Shift+R)

### Tool recommendations not working?
1. Verify `tools.js` is loaded
2. Check that `window.toolsData` exists in console
3. Ensure tool data has required fields (name, company, category, description)

### Styling issues?
1. Check that `css/chatbot.css` is loaded after `style.css`
2. Verify CSS variables are defined in `style.css`
3. Clear browser cache

## 💡 Tips

1. **Test Different Queries**: Try various ways of asking for tools
2. **Use Keywords**: Include specific categories or use cases
3. **Check History**: Conversations persist across page reloads
4. **Clear History**: Call `window.aiChatbot.clearHistory()` in console

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Review this documentation
3. Test with different browsers
4. Verify all files are loading correctly

---

**Next Steps**: Get your Gemini API key and enable full AI features! 🚀
