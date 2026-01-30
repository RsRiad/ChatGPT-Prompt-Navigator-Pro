(function () {
  "use strict";

  // Prevent multiple instances
  if (window.chatGPTNavigatorActive) return;
  window.chatGPTNavigatorActive = true;

  let navPanel = null;
  let shadowHost = null;
  let promptList = [];
  let isCollapsed = false;
  let lastUrl = location.href;

  const CONFIG = {
    maxChars: 40,
    highlightDuration: 2000,
    checkInterval: 1000,
  };

  // Initialize with retry mechanism
  function init() {
    console.log("[Prompt Navigator] Initializing...");

    // Wait for ChatGPT to fully load
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", waitForChat);
    } else {
      waitForChat();
    }
  }

  function waitForChat() {
    // Wait for the actual chat container to exist
    const checkExist = setInterval(() => {
      const chatContainer =
        document.querySelector("main") ||
        document.querySelector('[data-testid="conversation-turn-0"]') ||
        document.querySelector("[data-message-author-role]");

      if (chatContainer && document.body) {
        clearInterval(checkExist);
        createPersistentPanel();
        observeChatChanges();
        scanExistingMessages();
        setupSPAHandler();
      }
    }, 500);
  }

  // Create panel using Shadow DOM (survives React re-renders)
  function createPersistentPanel() {
    // Remove existing completely
    cleanup();

    // Create a shadow host that persists outside React's reach
    shadowHost = document.createElement("div");
    shadowHost.id = "gpt-navigator-host";
    shadowHost.style.cssText =
      "position: fixed; top: 0; right: 0; width: 0; height: 0; z-index: 2147483647; pointer-events: none;";

    // Attach shadow root
    const shadow = shadowHost.attachShadow({ mode: "open" });

    // Create panel inside shadow DOM
    const panelContainer = document.createElement("div");
    panelContainer.style.cssText = "pointer-events: auto;";

    // Inject styles into shadow DOM
    const style = document.createElement("style");
    style.textContent = getStyles();

    // Create actual panel HTML
    panelContainer.innerHTML = `
            <div id="gpt-navigator-panel" class="gpt-navigator-panel">
                <div class="gpt-nav-header">
                    <span class="gpt-nav-title">📋 Prompt Navigator</span>
                    <div class="gpt-nav-controls">
                        <button id="gpt-nav-collapse" title="Toggle Panel">−</button>
                        <button id="gpt-nav-close" title="Hide">×</button>
                    </div>
                </div>
                <div id="gpt-nav-content" class="gpt-nav-content">
                    <div class="gpt-nav-empty">Loading prompts...</div>
                </div>
            </div>
            <button id="gpt-nav-toggle" class="gpt-nav-toggle" style="display: none;">📋</button>
        `;

    shadow.appendChild(style);
    shadow.appendChild(panelContainer);
    document.body.appendChild(shadowHost);

    // Get references from shadow DOM
    navPanel = shadow.getElementById("gpt-navigator-panel");
    const content = shadow.getElementById("gpt-nav-content");
    const toggleBtn = shadow.getElementById("gpt-nav-toggle");

    // Event listeners (bind to shadow DOM elements)
    shadow.getElementById("gpt-nav-collapse").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleCollapse();
    });

    shadow.getElementById("gpt-nav-close").addEventListener("click", (e) => {
      e.stopPropagation();
      hidePanel();
    });

    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showPanel();
    });

    // Check theme
    checkTheme(shadow);

    // Load saved state
    chrome.storage.local.get(["navigatorCollapsed"], (result) => {
      if (result.navigatorCollapsed) {
        toggleCollapse();
      }
    });
  }

  function getStyles() {
    return `
            :host {
                all: initial;
            }
            
            .gpt-navigator-panel {
                position: fixed;
                top: 80px;
                right: 20px;
                width: 280px;
                max-height: calc(100vh - 100px);
                background: #ffffff;
                border: 1px solid #e5e5e5;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                flex-direction: column;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                transition: all 0.3s ease;
                overflow: hidden;
                color: #343541;
            }
            
            .gpt-navigator-panel.dark-mode {
                background: #202123;
                border-color: #4d4d4f;
                color: #ececf1;
            }
            
            .gpt-navigator-panel.collapsed {
                width: auto;
                min-width: 150px;
            }
            
            .gpt-nav-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                border-bottom: 1px solid #e5e5e5;
                background: rgba(0, 0, 0, 0.02);
                flex-shrink: 0;
                font-weight: 600;
                font-size: 14px;
            }
            
            .dark-mode .gpt-nav-header {
                border-bottom-color: #4d4d4f;
                background: rgba(255, 255, 255, 0.02);
            }
            
            .gpt-nav-controls {
                display: flex;
                gap: 6px;
            }
            
            .gpt-nav-controls button {
                background: none;
                border: none;
                cursor: pointer;
                width: 24px;
                height: 24px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                line-height: 1;
                transition: background 0.2s;
                color: inherit;
                pointer-events: auto;
            }
            
            .gpt-navigator-panel.dark-mode .gpt-nav-controls button:hover {
                background: #2d2d2d;
            }
            
            .gpt-navigator-panel:not(.dark-mode) .gpt-nav-controls button:hover {
                background: #f7f7f8;
            }
            
            .gpt-nav-content {
                overflow-y: auto;
                flex: 1;
                padding: 8px;
                max-height: calc(100vh - 180px);
            }
            
            .gpt-nav-content::-webkit-scrollbar {
                width: 6px;
            }
            
            .gpt-nav-content::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .gpt-nav-content::-webkit-scrollbar-thumb {
                background: rgba(128, 128, 128, 0.3);
                border-radius: 3px;
            }
            
            .gpt-nav-item {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                padding: 10px 12px;
                margin-bottom: 4px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 13px;
                line-height: 1.4;
                text-align: left;
                border: none;
                background: none;
                width: 100%;
                color: inherit;
                pointer-events: auto;
            }
            
            .gpt-navigator-panel.dark-mode .gpt-nav-item:hover {
                background: #2d2d2d;
            }
            
            .gpt-navigator-panel:not(.dark-mode) .gpt-nav-item:hover {
                background: #f7f7f8;
            }
            
            .gpt-nav-item.active {
                background: rgba(16, 163, 127, 0.1) !important;
                border-left: 3px solid #10a37f;
            }
            
            .gpt-nav-number {
                background: #10a37f;
                color: white;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: 600;
                flex-shrink: 0;
                margin-top: 1px;
            }
            
            .gpt-nav-text {
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                word-break: break-word;
            }
            
            .gpt-nav-empty {
                text-align: center;
                padding: 20px;
                color: #888;
                font-size: 13px;
                font-style: italic;
            }
            
            .gpt-nav-toggle {
                position: fixed;
                top: 100px;
                right: 20px;
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: #10a37f;
                color: white;
                border: none;
                cursor: pointer;
                font-size: 20px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 2147483647;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s;
                pointer-events: auto;
            }
            
            .gpt-nav-toggle:hover {
                transform: scale(1.1);
            }
            
            @media (max-width: 1400px) {
                .gpt-navigator-panel {
                    width: 240px;
                }
            }
            
            @media (max-width: 1200px) {
                .gpt-navigator-panel {
                    width: 200px;
                    top: 60px;
                    right: 10px;
                }
                .gpt-nav-text {
                    -webkit-line-clamp: 1;
                }
            }
        `;
  }

  function toggleCollapse() {
    isCollapsed = !isCollapsed;
    const content = navPanel.shadowRoot
      ? navPanel.shadowRoot.getElementById("gpt-nav-content")
      : document.getElementById("gpt-nav-content");
    const toggleBtn = getShadowElement("gpt-nav-toggle");
    const collapseBtn = getShadowElement("gpt-nav-collapse");

    if (isCollapsed) {
      navPanel.style.display = "none";
      if (toggleBtn) toggleBtn.style.display = "flex";
      if (collapseBtn) collapseBtn.innerHTML = "+";
      navPanel.classList.add("collapsed");
    } else {
      navPanel.style.display = "flex";
      if (toggleBtn) toggleBtn.style.display = "none";
      if (collapseBtn) collapseBtn.innerHTML = "−";
      navPanel.classList.remove("collapsed");
    }

    chrome.storage.local.set({ navigatorCollapsed: isCollapsed });
  }

  function hidePanel() {
    if (navPanel) navPanel.style.display = "none";
    const toggleBtn = getShadowElement("gpt-nav-toggle");
    if (toggleBtn) {
      toggleBtn.style.display = "flex";
      toggleBtn.style.right = "20px";
    }
  }

  function showPanel() {
    if (navPanel) navPanel.style.display = "flex";
    const toggleBtn = getShadowElement("gpt-nav-toggle");
    if (toggleBtn) toggleBtn.style.display = "none";
    if (isCollapsed) toggleCollapse();
  }

  function getShadowElement(id) {
    if (!shadowHost || !shadowHost.shadowRoot) return null;
    return shadowHost.shadowRoot.getElementById(id);
  }

  function checkTheme(shadow) {
    const isDark =
      document.documentElement.classList.contains("dark") ||
      document.querySelector('html[class*="dark"]') ||
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const panel = shadow
      ? shadow.getElementById("gpt-navigator-panel")
      : navPanel;
    if (panel) {
      if (isDark) {
        panel.classList.add("dark-mode");
        panel.classList.remove("light-mode");
      } else {
        panel.classList.add("light-mode");
        panel.classList.remove("dark-mode");
      }
    }
  }

  // Robust observation
  let observer = null;
  function observeChatChanges() {
    if (observer) observer.disconnect();

    observer = new MutationObserver((mutations) => {
      // Check if our panel was removed
      if (!document.getElementById("gpt-navigator-host")) {
        console.log("[Prompt Navigator] Panel removed, re-injecting...");
        createPersistentPanel();
        scanExistingMessages();
        return;
      }

      // Check for new messages
      let shouldUpdate = false;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (
              node.getAttribute("data-message-author-role") === "user" ||
              node.querySelector('[data-message-author-role="user"]')
            ) {
              shouldUpdate = true;
            }
          }
        });
      });

      if (shouldUpdate) {
        setTimeout(scanExistingMessages, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function scanExistingMessages() {
    const userMessages = document.querySelectorAll(
      '[data-message-author-role="user"]',
    );

    promptList = [];
    userMessages.forEach((msg, index) => {
      const text = getMessageText(msg);
      const id = `user-prompt-${index}-${Date.now()}`;

      // Ensure element has ID for navigation
      if (!msg.id) msg.id = id;

      promptList.push({
        id: msg.id,
        text: truncateText(text, CONFIG.maxChars),
        fullText: text,
        element: msg,
      });
    });

    updateNavigationList();
  }

  function getMessageText(element) {
    const selectors = [
      ".whitespace-pre-wrap",
      ".markdown-content",
      '[data-message-author-role="user"] .markdown-content',
      ".text-message",
      "p",
    ];

    for (let selector of selectors) {
      const el = element.matches(selector)
        ? element
        : element.querySelector(selector);
      if (el && el.textContent.trim()) {
        return el.textContent.trim();
      }
    }

    return element.textContent.trim();
  }

  function truncateText(text, maxChars) {
    if (text.length <= maxChars) return text;
    return text.substring(0, maxChars) + "...";
  }

  function updateNavigationList() {
    const content = getShadowElement("gpt-nav-content");
    if (!content) return;

    content.innerHTML = "";

    if (promptList.length === 0) {
      content.innerHTML =
        '<div class="gpt-nav-empty">No prompts detected yet...</div>';
      return;
    }

    promptList.forEach((prompt, index) => {
      const item = document.createElement("div");
      item.className = "gpt-nav-item";
      item.innerHTML = `
                <span class="gpt-nav-number">${index + 1}</span>
                <span class="gpt-nav-text" title="${escapeHtml(prompt.fullText)}">${escapeHtml(prompt.text)}</span>
            `;

      item.addEventListener("click", () => navigateToPrompt(prompt.id));
      content.appendChild(item);
    });

    const title = getShadowElement("gpt-navigator-panel").querySelector(
      ".gpt-nav-title",
    );
    if (title) {
      title.textContent = `📋 Prompt Navigator (${promptList.length})`;
    }
  }

  function navigateToPrompt(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
      // Try to find by searching DOM
      const messages = document.querySelectorAll(
        '[data-message-author-role="user"]',
      );
      const index = parseInt(elementId.split("-")[2]);
      if (messages[index]) {
        messages[index].scrollIntoView({ behavior: "smooth", block: "center" });
        highlightElement(messages[index]);
      }
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "center" });
    highlightElement(element);

    // Update active state
    const items = shadowHost.shadowRoot.querySelectorAll(".gpt-nav-item");
    items.forEach((item) => item.classList.remove("active"));

    // Find the clicked item and mark active
    const clickedItem = Array.from(items).find((item) =>
      item.innerHTML.includes(elementId.split("-")[2]),
    );
    if (clickedItem) clickedItem.classList.add("active");
  }

  function highlightElement(element) {
    element.style.transition = "background 0.3s";
    element.style.background = "rgba(16, 163, 127, 0.2)";

    setTimeout(() => {
      element.style.background = "";
    }, CONFIG.highlightDuration);
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Handle SPA navigation (ChatGPT uses React Router)
  function setupSPAHandler() {
    // Watch for URL changes
    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        console.log("[Prompt Navigator] URL changed, re-scanning...");
        setTimeout(scanExistingMessages, 1000);
      }
    }, 1000);

    // Keep checking if panel exists
    setInterval(() => {
      if (!document.getElementById("gpt-navigator-host")) {
        createPersistentPanel();
        scanExistingMessages();
      }
    }, 2000);
  }

  function cleanup() {
    const existing = document.getElementById("gpt-navigator-host");
    if (existing) existing.remove();
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleNavigator") {
      if (!navPanel || !document.getElementById("gpt-navigator-host")) {
        createPersistentPanel();
        scanExistingMessages();
      } else {
        if (navPanel.style.display === "none") {
          showPanel();
        } else {
          hidePanel();
        }
      }
    }
  });

  // Start
  init();
})();
