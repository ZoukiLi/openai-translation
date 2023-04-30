// ==UserScript==
// @name         OpenAI Translation Script
// @namespace    openai-translation
// @version      1
// @description  Adds a translation button to web pages powered by OpenAI's GPT-3 API
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    // Check if API key has been set, if not, prompt user for API key and store it securely
    const apiKey = GM_getValue("openaiTranslationApiKey");
    if (!apiKey) {
        const apiKeyInput = prompt("Please enter your OpenAI API key:");
        if (apiKeyInput) {
            GM_setValue("openaiTranslationApiKey", apiKeyInput);
        }
    }

    // Load CSS file
    const cssFile = document.createElement("link");
    cssFile.rel = "stylesheet";
    cssFile.href = "https://raw.githubusercontent.com/ZoukiLi/openai-translation/main/openai-translate-style.css";
    document.head.appendChild(cssFile);

    // Load JavaScript file with API key as query parameter
    const jsFile = document.createElement("script");
    jsFile.type = "text/javascript";
    jsFile.src = `https://raw.githubusercontent.com/ZoukiLi/openai-translation/main/translate.js?key=${encodeURIComponent(apiKey)}`;
    document.body.appendChild(jsFile);
})();
