// Initialize canvas
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

// Keep track of added texts and selected text index
let texts = [];
let selectedTextIndex = -1; // индекс выбранного текстового элемента, изначально -1 (ничего не выбрано)
let offsetX = 0; // смещение между координатами места клика и текущими координатами элемента
let offsetY = 0;
let isTextClicked = false;

// Listen for image upload
const imageUpload = document.getElementById("image-upload");
imageUpload.addEventListener("change", (event) => {
    const file = event.target.files[0];
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = () => {
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
});

// Add text to canvas
function addText() {
    const textInput = document.getElementById("text-input");
    const text = textInput.value;
    const textColor = document.getElementById("text-color").value;

    texts.push({
        text: text,
        x: canvas.width / 2,
        y: canvas.height / 2,
        color: textColor,
        fontFamily: "Arial",
        fontSize: 40
    });

    const textSelector = document.getElementById("text-selector");
    const option = document.createElement("option");
    option.text = text;
    option.value = texts.length - 1;
    textSelector.add(option);

    textInput.value = "";
    renderCanvas();
}

// Render canvas with texts
function renderCanvas() {
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw image
    const image = document.getElementById("image-upload");
    if (image.files && image.files[0]) {
        const img = new Image();
        img.onload = function() {
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
            drawTexts();
        };
        img.src = URL.createObjectURL(image.files[0]);
    } else {
        drawTexts();
    }
}

// Draw texts on canvas
function drawTexts() {
    texts.forEach((text, index) => {
        context.font = text.fontSize + "px " + text.fontFamily;
        context.fillStyle = text.color;
        context.textAlign = "center";
        context.fillText(text.text, text.x, text.y);

        // Add rectangle to text for selection
        const textWidth = context.measureText(text.text).width;
        const textHeight = text.fontSize;
        context.beginPath();
        context.rect(text.x - textWidth / 2, text.y - textHeight / 2, textWidth, textHeight);
        context.closePath();

        // Highlight selected text
        if (index === selectedTextIndex) {
            context.lineWidth = 2;
            context.strokeStyle = "blue";
            context.stroke();
        }
    });
}

// Move text on canvas
canvas.addEventListener("mousedown", selectText);
canvas.addEventListener("mousemove", moveText);
canvas.addEventListener("mouseup", deselectText);

function selectText(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Проверяем, попадает ли клик в какой-либо текстовый элемент
    for (let i = texts.length - 1; i >= 0; i--) {
        const text = texts[i];
        const textWidth = context.measureText(text.content).width; // ширина текста

        if (
            x >= text.x &&
            x <= text.x + textWidth &&
            y >= text.y - text.fontSize &&
            y <= text.y
        ) {
            selectedTextIndex = i;
            offsetX = x - text.x; // рассчитываем смещение
            offsetY = y - text.y;
            isTextClicked = true;
            break;
        }
    }
}

function moveText(event) {
    if (isTextClicked) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Обновляем координаты выбранного текстового элемента на холсте
        const text = texts[selectedTextIndex];
        text.x = x - offsetX;
        text.y = y - offsetY;
        renderCanvas();
    }
}

function deselectText() {
    isTextClicked = false;
    selectedTextIndex = -1; // сбрасываем индекс выбранного элемента 
}

renderCanvas(); // вызываем функцию отрисовки холста

// Change text style
function changeTextStyle() {
    const textSelector = document.getElementById("text-selector");
    selectedTextIndex = parseInt(textSelector.value);

    if (selectedTextIndex === -1) {
        clearTextStyle();
    } else {
        const selectedText = texts[selectedTextIndex];
        document.getElementById("font-family").value = selectedText.fontFamily;
        document.getElementById("font-size").value = selectedText.fontSize;
        document.getElementById("text-color").value = selectedText.color;
    }

    renderCanvas();
}

function changeFontFamily() {
    const fontFamily = document.getElementById("font-family").value;
    texts[selectedTextIndex].fontFamily = fontFamily;
    renderCanvas();
}

function changeFontSize() {
    const fontSize = document.getElementById("font-size").value;
    texts[selectedTextIndex].fontSize = parseInt(fontSize);
    renderCanvas();
}

function changeTextColor() {
    const textColor = document.getElementById("text-color").value;
    texts[selectedTextIndex].color = textColor;
    renderCanvas();
}

function clearTextStyle() {
    document.getElementById("font-family").value = "Arial";
    document.getElementById("font-size").value = 40;
    document.getElementById("text-color").value = "#000000";
}

// Save meme
function saveMeme() {
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "meme.png";
    link.click();
}