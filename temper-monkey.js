// ==UserScript==
// @name         OpenAI Translation Script
// @namespace    openai-translation
// @version      1
// @description  Adds a translation button to web pages powered by OpenAI's GPT-3 API
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(async function () {
    // Check if API key has been set, if not, prompt user for API key and store it securely
    const apiKey = GM_getValue("openaiTranslationApiKey");
    if (!apiKey) {
        const apiKeyInput = prompt("Please enter your OpenAI API key:");
        if (apiKeyInput) {
            GM_setValue("openaiTranslationApiKey", apiKeyInput);
        } else {
            alert(
                `Please enter an API key to use this script.
You can get an API key from <a href="https://platform.openai.com/account/api-keys">api-keys</a>.`);
            return;
        }
    }

    // Check config
    const targetLang = GM_getValue("openaiTranslationTargetLang") || "zh-CN";
    localStorage.setItem("openaiTranslationTargetLang", targetLang);

    // Check if translation method has been set, if not, set it to default value
    const translationMethod = GM_getValue("openaiTranslationMethod") || "openai";
    localStorage.setItem("openaiTranslationMethod", translationMethod);

    // Check if show time taken has been set, if not, set it to default value
    const showTimeTaken = GM_getValue("openaiTranslationShowTimeTaken") ?? true;
    localStorage.setItem("openaiTranslationShowTimeTaken", showTimeTaken);

    // Check if sleep time has been set, if not, set it to default value
    const sleepTime = GM_getValue("openaiTranslationSleepTime") ?? 1000;
    localStorage.setItem("openaiTranslationSleepTime", sleepTime);

    // Create configuration page
    const configPage = document.createElement('div');
    configPage.style.position = 'fixed';
    configPage.style.top = '20px';
    configPage.style.right = '20px';
    configPage.style.backgroundColor = '#fff';
    configPage.style.border = '1px solid #ddd';
    configPage.style.padding = '10px';
    configPage.style.zIndex = 9999;
    configPage.innerHTML = `
    <h3>OpenAI Translation Script Configuration</h3>
    <form>
        <label for="target-lang">Target Language:</label>
        <select id="target-lang" name="target-lang">
            <option value="zh-CN">Chinese (Simplified)</option>
            <option value="zh-TW">Chinese (Traditional)</option>
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="pt">Portuguese</option>
            <option value="ru">Russian</option>
            <option value="es">Spanish</option>
        </select>
        <br>
        <label for="translation-method">Translation Method:</label>
        <select id="translation-method" name="translation-method">
            <option value="openai">OpenAI</option>
            <option value="deepl">DeepL</option>
        </select>
        <br>
        <label for="show-time-taken">Show Time Taken:</label>
        <input type="checkbox" id="show-time-taken" name="show-time-taken">
        <br>
        <input type="submit" value="Save">
    </form>
`;

    // Add configuration page to document body
    document.body.appendChild(configPage);

    // Load saved configuration values
    const savedTargetLang = localStorage.getItem('openaiTranslationTargetLang') || 'zh-CN';
    document.querySelector(`#target-lang option[value="${savedTargetLang}"]`).selected = true;

    const savedTranslationMethod = localStorage.getItem('openaiTranslationMethod') || 'openai';
    document.querySelector(`#translation-method option[value="${savedTranslationMethod}"]`).selected = true;
    
    const savedShowTimeTaken = JSON.parse(localStorage.getItem('openaiTranslationShowTimeTaken'));
    document.querySelector('#show-time-taken').checked = savedShowTimeTaken;

    const savedSleepTime = localStorage.getItem('openaiTranslationSleepTime') || 1000;
    document.querySelector('#sleep-time').value = savedSleepTime;

    // Add event listener to configuration form
    configPage.querySelector('form').addEventListener('submit', function (event) {
        event.preventDefault();

        // Save configuration values to localStorage
        const newTargetLang = document.querySelector('#target-lang').value;
        localStorage.setItem('openaiTranslationTargetLang', newTargetLang);

        const newTranslationMethod = document.querySelector('#translation-method').value;
        localStorage.setItem('openaiTranslationMethod', newTranslationMethod);

        const newShowTimeTaken = document.querySelector('#show-time-taken').checked;
        localStorage.setItem('openaiTranslationShowTimeTaken', JSON.stringify(newShowTimeTaken));

        const newSleepTime = document.querySelector('#sleep-time').value;
        localStorage.setItem('openaiTranslationSleepTime', newSleepTime);
    });

    // Toggle between OpenAI and DeepL translation methods
    document.addEventListener('keydown', function (event) {
        if (event.ctrlKey && event.shiftKey && event.key === 'T') {
            const currentMethod = localStorage.getItem('openaiTranslationMethod') || 'openai';
            const newMethod = currentMethod === 'openai' ? 'deepl' : 'openai';
            localStorage.setItem('openaiTranslationMethod', newMethod);
            location.reload();
        }
    });


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
    // Register reset API key menu command
    GM_registerMenuCommand("Reset OpenAI API Key", function () {
        const confirmation = confirm("Are you sure you want to reset your API key?");
        if (confirmation) {
            GM_setValue("openaiTranslationApiKey", "");
            alert("API key reset successful. Please reload the page to apply changes.");
        }
    });
})();
