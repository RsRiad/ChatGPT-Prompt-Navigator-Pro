document.getElementById("toggleNav").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab.url.includes("chat.openai.com") || tab.url.includes("chatgpt.com")) {
    chrome.tabs.sendMessage(tab.id, { action: "toggleNavigator" });
  } else {
    alert("Please open ChatGPT to use this extension!");
  }
});
