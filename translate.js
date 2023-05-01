const apiUrl = "https://api.openai.com/v1/completions";

const apiKeyGet = `<API_KEY_HERE>`;
const apiKeyGetOrSecret = apiKeyGet.match('API_KEY_HERE') ? secretApiKey : apiKeyGet;
const apiKey = apiKeyGetOrSecret ?? '';

const getDestinationLang = () => localStorage.getItem("openaiTranslationTargetLang") || "zh-CN";
const getTranslationMethod = () => localStorage.getItem("openaiTranslationMethod") || "openai";

const getShowTimeTaken = () => JSON.parse(localStorage.getItem("openaiTranslationShowTimeTaken")) ?? false;
const getSleepTime = () => localStorage.getItem("openaiTranslationSleepTime") ?? 1000;

const tagNamesToCheck = ["p", "h1", "h2", "h3", "h4", "h5", "h6"];

// icons
const runIconHTML = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-right" viewBox="0 0 16 16">
    <path d="M6 12.796V3.204L11.481 8 6 12.796zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753z"/>
</svg>
    `;
const pauseIconHTML = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
    <path d="M6 5h2v6H6V5zm4 0h2v6h-2V5z"/>
</svg>
    `;
const reloadIconHTML = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
  <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
</svg>
    `;

// debug mode - set to true to see debug messages
const debugLog = (message) => {
    // if debug not defined, set to false
    if (typeof debug === "undefined") {
        debug = false;
    }
    if (debug) {
        console.log(message);
    }
};

// Function to send a request to OpenAI's API
// returns a promise that resolves to the translated text
const fetchOpenaiResponse = async (input) => {
    const data = JSON.stringify({
        model: "text-davinci-003",
        prompt: input,
        max_tokens: 2048,
    });

    return fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: data,
    })
        .then((response) => response.json())
        .then((json) => json.choices[0].text)
}

// prompt to send to OpenAI's API
const getPrompt = (text) =>
    `Translate the following paragraph into ${getDestinationLang()}:
${text}

${getDestinationLang()} Translation:`;
// translate the text using the fetchOpenaiResponse function
// returns a promise that resolves to the translated text
// on error, returns a promise that resolves to "Error translating text"
const fetchOpenaiTranslation = async (text, targetLang) => {
    const prompt = getPrompt(text);
    // send the prompt to OpenAI's API
    const response = await fetchOpenaiResponse(prompt)
        .catch((error) => {
            debugLog(`Error: ${error.message}`);
            return "Error translating text";
        });
    return response;
};

// translate the text using the deep-translator API

const fetchDeepLTranslation = async (text, targetLang) => {
    const url = 'https://deep-translator-api.azurewebsites.net/google/';
    const params = {
        source: 'auto',
        target: targetLang,
        text: text
    };
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(params)
        });

        const result = await response.json();

        if (result.error) {
            throw new Error(result.error);
        }

        return result.translation;
    } catch (error) {
        debugLog(`Error: ${error.message}`);
        return "Error translating text";
    }
};

// Simple word count function to test the example
const wordCount = async (text, targetLang) => {
    const words = text.split(" ");
    // count the number of english words
    const englishWords = words.filter((word) => {
        return word.match(/[a-z',.]/i);
    });
    // count the number of non-english words
    const nonEnglishWords = words.filter((word) => {
        return !word.match(/[a-z',.]/i);
    });
    const result1 = `English words: ${englishWords.length}`;
    const result2 = `Non-English words: ${nonEnglishWords.length}`;
    const result3 = `Total words: ${words.length}`;
    return `${result1}\n${result2}\n${result3}`;
};

// map of translation methods

const translationMethodMap = {
    "openai": fetchOpenaiTranslation,
    "deepl": fetchDeepLTranslation,
    "wordcount": wordCount,
};


// class name for the translation area
const className = 'openai-translation-class';
const buttonClassName = 'openai-translation-button-class';
// name for the translation area, button, and other elements
// args: id - the id of the paragraph
// returns a map for the ids of the translation area, button, and span
const getElementName = (id) => {
    return {
        translationAreaName: `openai-translation-area-${id}`,
        buttonName: `openai-translation-button-${id}`,
        spanName: `openai-translation-span-${id}`,
    };
};

// paragraphs on the page to translate
// remove the translation areas by class name
const getOriginalParagraphs = () => {

    // get all elements with the tag names
    const elements = tagNamesToCheck.flatMap((tagName) => {
        return Array.from(document.getElementsByTagName(tagName));
    });
    // filter out elements that are empty or have no text
    // or with openai-translation-class
    // or one of its ancestors is already in elements
    const checkAncestorInList = (element) => {
        // get the parent node
        const parent = element.parentNode;

        // if parent is window, return false
        if (parent === window || parent === document || parent === document.body || parent === Window) {
            return false;
        }

        // if there is no parent, return true
        if (!parent) {
            return true;
        }

        // if the parent is already in the elements array, return true
        if (elements.includes(parent)) {
            return true;
        }

        // if the parent style is position: fixed, return true
        const style = window.getComputedStyle(parent);
        if (style.position === "fixed") {
            return true;
        }

        // if the parent class contains openai-translation-class, return true
        if (parent.classList.contains(className)) {
            return true;
        }

        // otherwise, recurse with the parent element
        return checkAncestorInList(parent);
    };

    const filteredElements = elements.filter((element) => {
        return element.textContent.trim() !== ""
            && !element.classList.contains(className)
            && !checkAncestorInList(element);
    }
    );
    return filteredElements;
}
let originContents = getOriginalParagraphs();

// fetch the translation and display it
const fetchTranslation = async (id, lang) => {
    const paragraph = originContents[id];
    const text = paragraph.textContent.trim();
    const cleanText = text.replace(/(<([^>]+)>)/gi, '');
    const words = cleanText.split(/\s+/);
    const wordsText = words.join(' ');

    // time how long it takes to translate
    const startTime = performance.now();
    const translationFunction = translationMethodMap[getTranslationMethod()];
    const result = await translationFunction(wordsText, lang);
    const endTime = performance.now();
    const timeTaken = endTime - startTime;
    debugLog(`Result: ${result}`);
    debugLog(`Time taken: ${timeTaken} ms`);

    const translation = document.getElementById(getElementName(id).spanName);
    if (!translation) {
        console.error(`Could not find translation span for id ${id}`);
        return;
    }
    // show time at most 2 decimal places
    translation.textContent = result + (getShowTimeTaken() ? ` (${timeTaken.toFixed(2)} ms)` : "");
    translation.style.display = "block";
};


// create an area for each paragraph to show the translation and a button to translate
const createTranslationArea = (id) => {
    const translationArea = document.createElement("div");
    translationArea.id = getElementName(id).translationAreaName;
    translationArea.className = className;
    translationArea.style.display = "flex";

    const translation = document.createElement("span");
    translation.id = getElementName(id).spanName;
    translation.className = className;

    const button = document.createElement("button");
    button.id = getElementName(id).buttonName;
    button.className = className + " " + buttonClassName;
    button.innerHTML = runIconHTML;
    // call fetchTranslation when the button is clicked
    button.onclick = () => fetchTranslation(id, getDestinationLang());

    translationArea.appendChild(button);
    translationArea.appendChild(translation);
    return translationArea;
};

// remove all translation areas
const removeTranslationAreas = () => {
    // get all translation areas
    const translationAreas = document.getElementsByClassName(className);
    // remove all translation areas
    while (translationAreas.length > 0) {
        translationAreas[0].parentNode.removeChild(translationAreas[0]);
    }
}

// add a translation area for each paragraph
const addTranslationAreas = () => {
    for (let i = 0; i < originContents.length; i++) {
        const paragraph = originContents[i];
        const translationArea = createTranslationArea(i);
        debugLog(`Adding translation area ${translationArea.id}`);
        // insert the translation area after the paragraph
        paragraph.parentNode.insertBefore(translationArea, paragraph.nextSibling);
    }
}

// add a button to run all translations or pause all translations
let isRunning = false;

const runAllTranslation = async () => {
    for (let i = 0; i < originContents.length; i++) {
        if (!isRunning) {
            break;
        }
        await fetchTranslation(i, getDestinationLang());
        await new Promise(r => setTimeout(r, getSleepTime()));
    }
}

const toggleRunOrPause = async (sender) => {
    if (isRunning) {
        isRunning = false;
        sender.innerHTML = runIconHTML;
        return;
    }
    isRunning = true;
    sender.innerHTML = pauseIconHTML;
    // catch all errors so that the button can be reset
    try {
        await runAllTranslation();
    } catch (e) {
        console.error(e);
    }

    isRunning = false;
    sender.innerHTML = runIconHTML;
}

const addRunAllButton = () => {
    const button = document.createElement("button");
    button.id = "openai-run-all-button";
    button.className = className + " " + buttonClassName;
    debugLog(`Adding run all button with class ${button.className}`);

    button.innerHTML = runIconHTML;
    button.onclick = () => toggleRunOrPause(button);
    // insert the button to the top of the page
    document.body.insertBefore(button, document.body.firstChild);
}

// add reload button
// do not show until dom changes
const addReloadButton = () => {
    const button = document.createElement("button");
    button.id = "openai-reload-button";
    button.className = className + " " + buttonClassName;
    debugLog(`Adding reload button with class ${button.className}`);

    button.innerHTML = reloadIconHTML;
    button.onclick = () => initTranslationAreas();
    // insert the button to the top of the page after the run all button
    document.body.insertBefore(button, document.getElementById("openai-run-all-button").nextSibling);
    // hide the button
    button.style.display = "none";
}

// initialize all the translation areas
const initTranslationAreas = () => {
    pushHandleDomChanges();
    removeTranslationAreas();
    originContents = getOriginalParagraphs();
    addTranslationAreas();
    addRunAllButton();
    addReloadButton();
    popHandleDomChanges();
}

// initialize the translation areas when the page loads
let initialized = false;
window.onload = () => {
    initTranslationAreas();
    initialized = true;
}

// initialize the translation areas every 0.5 seconds after the page loads
const initTranslationAreasInterval = 500;
const initTranslationTimer = setInterval(() => {
    if (!initialized) {
        initTranslationAreas();
        initialized = true;
    } else {
        clearInterval(initTranslationTimer);
    }
}, initTranslationAreasInterval);


// handel dom change
// set up the mutation observer
const observer = new MutationObserver((mutations) => {
    // if the DOM changes should not be handled, return
    if (!getHandleDomChanges()) {
        return;
    }

    debugLog(`DOM changed, ${mutations.length} mutations`)
    debugLog(mutations);

    // otherwise, handle the DOM changes
    pushHandleDomChanges();
    // initTranslationAreas();
    // show the reload button
    const reloadButton = document.getElementById("openai-reload-button");
    if (reloadButton) {
        debugLog("show reload button");
        reloadButton.style.display = "block";
    }
    popHandleDomChanges();
});

// start observing the DOM
observer.observe(document.body, {
    childList: true,
    subtree: true,
});

// flag to indicate whether the DOM changes should be handled
let handleDomChangesDepth = 0;
let pushHandleDomChanges = () => handleDomChangesDepth++;
let popHandleDomChanges = () => handleDomChangesDepth--;
let getHandleDomChanges = () => handleDomChangesDepth === 0;
