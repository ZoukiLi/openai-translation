const apiUrl = "https://api.openai.com/v1/completions";

const apiKey = `<API_KEY_HERE>`;
const destinationLang = localStorage.getItem("openaiTranslationDestinationLang") || "Chinese (Simplified)";
const showTimeTaken = true;
const sleepTime = 1000;
const tagNamesToCheck = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "li"];

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

// prompt to send to OpenAI's API
const getPrompt = (text) => 
`Translate the following paragraph into ${destinationLang}:
${text}

${destinationLang} Translation:`;
// debug mode
const debug = false;
const debugLog = (message) => {
    if (debug) {
        console.log(message);
    }
};

// Function to send a request to OpenAI's API
// returns a promise that resolves to the translated text
// on error, returns a promise that resolves to "Error translating text"
const fetchOpenai = async (input) => {
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
        .catch((error) => {
            console.error(error);
            return "Error translating text";
        });
}

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

        // if there is no parent, return false
        if (!parent) {
            return false;
        }

        // if the parent is already in the elements array, return true
        if (elements.includes(parent)) {
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

// fetch the translation from OpenAI and display it
const fetchTranslation = async (id, lang) => {
    const paragraph = originContents[id];
    const text = paragraph.textContent.trim();
    const cleanText = text.replace(/(<([^>]+)>)/gi, '');
    const words = cleanText.split(/\s+/);
    const wordsText = words.join(' ');
    const prompt = getPrompt(wordsText);
    debugLog(`Prompt: ${prompt}`);

    // time how long it takes to translate
    const startTime = performance.now();
    const result = await fetchOpenai(prompt);
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
    translation.textContent = result + (showTimeTaken ? ` (${timeTaken.toFixed(2)} ms)` : "");
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
    button.onclick = () => fetchTranslation(id, destinationLang);

    translationArea.appendChild(button);
    translationArea.appendChild(translation);
    return translationArea;
};

// remove all translation areas
const removeTranslationAreas = () => {
    // get all translation areas
    const translationAreas = document.getElementsByClassName(className);
    for (const translationArea of translationAreas) {
        // remove the translation area from the document
        document.body.removeChild(translationArea);
    }
}

// add a translation area for each paragraph
const addTranslationAreas = () => {
    for (let i = 0; i < originContents.length; i++) {
        const paragraph = originContents[i];
        const translationArea = createTranslationArea(i);
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
        await fetchTranslation(i, destinationLang);
        await new Promise(r => setTimeout(r, sleepTime));
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

    button.innerHTML = runIconHTML;
    button.onclick = () => toggleRunOrPause(button);
    // insert the button to the top of the page
    document.body.insertBefore(button, document.body.firstChild);
}

// initialize all the translation areas
const initTranslationAreas = () => {
    removeTranslationAreas();
    originContents = document.getElementsByTagName("p");
    addTranslationAreas();
    addRunAllButton();
}

// initialize the translation areas when the page loads
window.onload = initTranslationAreas;
