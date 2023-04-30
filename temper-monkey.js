// ==UserScript==
// @name         OpenAI Translation Script
// @namespace    openai-translation
// @version      1
// @description  Adds a translation button to web pages powered by OpenAI's GPT-3 API
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(async function() {
    // Check if API key has been set, if not, prompt user for API key and store it securely
    const apiKey = GM_getValue("openaiTranslationApiKey");
    if (!apiKey) {
        const apiKeyInput = prompt("Please enter your OpenAI API key:");
        if (apiKeyInput) {
            GM_setValue("openaiTranslationApiKey", apiKeyInput);
        } else {
            alert(
`Please enter an API key to use this script.
You can get an API key from https://platform.openai.com/account/api-keys`);
            return;
        }
    }

    // Check if destination language has been set, if not, prompt user for destination language and store it
    const destinationLang = GM_getValue("openaiTranslationDestinationLang");
    if (!destinationLang) {
        const destinationLangInput = prompt("Please enter the destination language: (default: Chinese (Simplified))");
        if (destinationLangInput) {
            GM_setValue("openaiTranslationDestinationLang", destinationLangInput);
        } else {
            GM_setValue("openaiTranslationDestinationLang", "Chinese (Simplified)");
        }
    }
    localStorage.setItem("openaiTranslationDestinationLang", GM_getValue("openaiTranslationDestinationLang"));

    // Load CSS file
    const cssResponse = await fetch('https://raw.githubusercontent.com/ZoukiLi/openai-translation/main/openai-translate-style.css');
    const cssText = await cssResponse.text();
    const cssFile = document.createElement("style");
    cssFile.textContent = cssText;
    document.head.appendChild(cssFile);

    // Load JavaScript file with API key as query parameter
    const jsResponse = await fetch(`https://raw.githubusercontent.com/ZoukiLi/openai-translation/main/translate.js`);
    const jsText = await jsResponse.text();
    // replace API key in JavaScript file
    const jsTextWithKey = jsText.replace('<API_KEY_HERE>', apiKey);
    const jsFile = document.createElement("script");
    jsFile.textContent = jsTextWithKey;
    document.body.appendChild(jsFile);
})();
