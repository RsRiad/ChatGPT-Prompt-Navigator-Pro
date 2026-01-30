# 🧭 ChatGPT Prompt Navigator
&lt;!-- Optional: Add badges --&gt;
![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![Chrome](https://img.shields.io/badge/Chrome-Compatible-green)
![Edge](https://img.shields.io/badge/Edge-Compatible-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

A powerful browser extension that adds an interactive **Table of Contents** to ChatGPT conversations. Navigate through long chats instantly without endless scrolling!

## ✨ Features

- **📋 Automatic Prompt Detection** — Instantly detects all your questions/prompts in the conversation
- **🚀 One-Click Navigation** — Jump to any prompt with smooth scrolling
- **🎯 Visual Highlighting** — Selected prompts glow temporarily so you never lose your place
- **🌓 Dark/Light Mode** — Automatically adapts to ChatGPT's theme
- **📱 Collapsible Panel** — Minimize or hide when you need more space
- **⚡ Shadow DOM Technology** — Survives React re-renders and stays persistent
- **🔒 Privacy First** — No data collection, works entirely offline

## 📸 How It Works

| Feature | Description |
|---------|-------------|
| **Auto-Scan** | Detects new messages as ChatGPT generates responses |
| **Smart Scroll** | Click any item to smoothly scroll to that location |
| **SPA Support** | Works even when switching between conversations |
| **Persistent** | Won't disappear when ChatGPT updates its interface |
<img width="1905" height="868" alt="image" src="https://github.com/user-attachments/assets/0d815195-29ff-4d1e-bcec-69a009eed8d6" />

## 🚀 Installation

### Method 1: Chrome Web Store (Coming Soon)
*Pending review...*

### Method 2: Manual Installation (Developer Mode)

```markdown
### Method 2: Manual Installation (Developer Mode)

#### Step 1: Download
```bash
# Clone the repository
git clone https://github.com/RsRiad/ChatGPT-Prompt-Navigator-Pro.git

# Or download as ZIP and extract
```

#### Step 2: Install in Chrome/Edge
1. Open Chrome/Edge and navigate to:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

2. **Enable "Developer mode"** (toggle in top-right corner)

3. Click **"Load unpacked"** button

4. Select the `chatgpt-prompt-navigator` folder you downloaded

5. **Done!** 🎉 The extension icon will appear in your toolbar

#### Step 3: Use It
1. Go to [chat.openai.com](https://chat.openai.com) or [chatgpt.com](https://chatgpt.com)
2. Open any conversation
3. Look for the **"📋 Prompt Navigator"** panel on the right side
4. Click any prompt to jump to it!

## 🛠️ For Developers

### File Structure
```
chatgpt-prompt-navigator/
├── 📄 manifest.json          # Extension configuration
├── 📄 content.js             # Main logic (content script)
├── 📄 styles.css             # Panel styling (optional backup)
├── 📄 popup.html             # Extension popup UI
├── 📄 popup.js               # Popup functionality
├── 📁 icons/
│   ├── icon16.png           # Toolbar icon (16x16)
│   ├── icon48.png           # Extension page icon (48x48)
│   └── icon128.png          # Store icon (128x128)
└── 📄 README.md             # This file
```

### Building from Source
```bash
# 1. Clone repository
git clone https://github.com/RsRiad/ChatGPT-Prompt-Navigator-Pro.git

# 2. Navigate to the folder
cd ChatGPT-Prompt-Navigator-Pro

# 3. Make your changes to content.js or popup.html

# 4. Load in browser
# Follow Method 2 (Manual Installation) above
```

### Key Technical Details
- **Manifest Version**: 3 (Latest Chrome standard)
- **Architecture**: Shadow DOM for isolation
- **Observer**: MutationObserver for real-time updates
- **Storage**: Chrome Storage API for user preferences

## 🎮 Usage Tips

| Tip | Description |
|-----|-------------|
| **Collapse** | Click `−` to minimize, `+` to expand |
| **Hide** | Click `×` to hide, floating button appears to reopen |
| **Refresh** | If panel disappears, press F5 to reload the page |
| **Long Chats** | Panel shows scrollbar when list is long |

## 🐛 Troubleshooting

**Extension not showing?**
- ✅ Ensure you're on `chat.openai.com` or `chatgpt.com`
- ✅ Check that extension is enabled in `chrome://extensions/`
- ✅ Try refreshing the ChatGPT page (F5)

**Panel disappears?**
- This is fixed in v1.1+ using Shadow DOM technology
- If it happens: Reload the page or click the extension icon

**Not detecting prompts?**
- ChatGPT sometimes updates its HTML structure
- Check console (F12 → Console) for errors
- Create an issue if problems persist

## 📝 Changelog

### v1.1.0 (Current)
- ✅ Fixed disappearing panel issue (Shadow DOM implementation)
- ✅ Added SPA navigation support (route changes)
- ✅ Improved dark mode detection
- ✅ Added auto-restore functionality

### v1.0.0
- 🎉 Initial release
- ✅ Basic prompt detection
- ✅ Navigation panel
- ✅ Smooth scrolling

## 🤝 Contributing

Contributions are welcome! 

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Reporting Bugs
Please use the [GitHub Issues](../../issues) page and include:
- Browser version
- Extension version
- Screenshot (if applicable)
- Steps to reproduce

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the need to navigate long ChatGPT conversations
- Built with Manifest V3 standards
- Icons generated via [icon generator tool]

---

**Made with ❤️ by [Md. Rawha Siddiqi Riad](https://github.com/RsRiad)**

⭐ **Star this repo if you find it helpful!** ⭐
```
