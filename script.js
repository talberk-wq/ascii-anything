// ===== ASCII ANYTHING - Image to ASCII Converter =====

// Character palettes
const PALETTES = {
    standard: ' .:-=+*#%@',
    blocks: ' ░▒▓█',
    circles: ' ○◉●◎',
    matrix: ' 01ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜ',
    simple: ' .XO@',
    detailed: ' \'`^",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'
};

// State
let currentImage = null;
let colorMode = 'grayscale';
let resolution = 80;
let palette = 'standard';
let inverted = false;

// DOM Elements
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const uploadPreview = document.getElementById('uploadPreview');
const uploadContent = uploadZone.querySelector('.upload-content');
const controls = document.getElementById('controls');
const output = document.getElementById('output');
const asciiPreview = document.getElementById('asciiPreview');
const asciiText = document.getElementById('asciiText');
const paletteSelect = document.getElementById('paletteSelect');
const resolutionSlider = document.getElementById('resolutionSlider');
const resolutionValue = document.getElementById('resolutionValue');
const invertCheck = document.getElementById('invertCheck');
const downloadBtn = document.getElementById('downloadBtn');
const tabBtns = document.querySelectorAll('.tab-btn');
const previewTab = document.getElementById('previewTab');
const textTab = document.getElementById('textTab');

// ===== EVENT LISTENERS =====

// Upload zone click
uploadZone.addEventListener('click', () => fileInput.click());

// File input change
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// Drag and drop
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
    }
});

// Controls
paletteSelect.addEventListener('change', (e) => {
    palette = e.target.value;
    if (currentImage) convertToASCII();
});

resolutionSlider.addEventListener('input', (e) => {
    resolution = parseInt(e.target.value);
    resolutionValue.textContent = `${resolution} chars`;
    if (currentImage) convertToASCII();
});

invertCheck.addEventListener('change', (e) => {
    inverted = e.target.checked;
    if (currentImage) convertToASCII();
});

// Color mode toggle
document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        colorMode = e.target.dataset.mode;
        if (currentImage) convertToASCII();
    });
});

// Tab switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        tabBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        const tabName = e.target.dataset.tab;
        previewTab.classList.toggle('active', tabName === 'preview');
        textTab.classList.toggle('active', tabName === 'text');
    });
});

// Download
downloadBtn.addEventListener('click', downloadASCII);

// ===== CORE FUNCTIONS =====

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            
            // Show preview
            uploadPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            uploadPreview.classList.add('active');
            uploadContent.style.display = 'none';
            
            // Show controls and output
            controls.style.display = 'grid';
            output.style.display = 'block';
            
            // Convert
            convertToASCII();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Store color data for PNG export
let colorData = [];

function convertToASCII() {
    if (!currentImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Calculate dimensions (maintain aspect ratio, account for character aspect ratio)
    const charAspectRatio = 0.5; // Characters are roughly twice as tall as wide
    const targetWidth = resolution;
    const targetHeight = Math.floor(resolution * (currentImage.height / currentImage.width) * charAspectRatio);

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Draw resized image
    ctx.drawImage(currentImage, 0, 0, targetWidth, targetHeight);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const pixels = imageData.data;

    // Convert to ASCII
    const paletteChars = PALETTES[palette];
    let ascii = '';
    let asciiHtml = '';
    colorData = []; // Reset color data

    for (let y = 0; y < targetHeight; y++) {
        const lineColors = [];
        for (let x = 0; x < targetWidth; x++) {
            const idx = (y * targetWidth + x) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];

            // Calculate brightness
            let brightness = 0.299 * r + 0.587 * g + 0.114 * b;
            
            if (inverted) {
                brightness = 255 - brightness;
            }

            // Map brightness to character index
            const charIdx = Math.floor((brightness / 255) * (paletteChars.length - 1));
            const char = paletteChars[charIdx];

            // Always build ascii string (for text file and PNG dimensions)
            ascii += char;
            
            if (colorMode === 'color') {
                asciiHtml += `<span style="color: rgb(${r},${g},${b})">${char}</span>`;
            }
            lineColors.push({r, g, b, char});
        }
        ascii += '\n';
        if (colorMode === 'color') {
            asciiHtml += '<br>';
        }
        colorData.push(lineColors);
    }

    // Update output
    asciiText.value = ascii;
    
    if (colorMode === 'color') {
        asciiPreview.innerHTML = asciiHtml;
    } else {
        asciiPreview.textContent = ascii;
    }
}

function downloadASCII() {
    if (!currentImage) return;

    const format = prompt('Download format:\n1. Text file (.txt)\n2. Colored HTML (.html)\n3. PNG image\n\nEnter 1, 2, or 3:', '1');

    if (format === '1') {
        downloadText();
    } else if (format === '2') {
        downloadHTML();
    } else if (format === '3') {
        downloadPNG();
    }
}

function downloadText() {
    const blob = new Blob([asciiText.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function downloadHTML() {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>ASCII Art</title>
    <style>
        body {
            background: #0a0a0f;
            padding: 40px;
            font-family: 'Courier New', monospace;
            font-size: 8px;
            line-height: 1;
        }
        pre { margin: 0; }
    </style>
</head>
<body>
<pre>${asciiPreview.innerHTML}</pre>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.html';
    a.click();
    URL.revokeObjectURL(url);
}

function downloadPNG() {
    // Create a canvas to render the ASCII
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Measure text
    ctx.font = '8px "JetBrains Mono", monospace';
    const charWidth = ctx.measureText('M').width;
    const charHeight = 10;
    
    const lines = asciiText.value.split('\n');
    const maxWidth = Math.max(...lines.map(l => l.length)) * charWidth;
    const height = lines.length * charHeight;
    
    canvas.width = maxWidth;
    canvas.height = height;
    
    // Fill background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw text
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.textBaseline = 'top';
    
    if (colorMode === 'color' && colorData.length > 0) {
        // Render with colors
        colorData.forEach((line, y) => {
            let xOffset = 0;
            line.forEach(pixel => {
                ctx.fillStyle = `rgb(${pixel.r},${pixel.g},${pixel.b})`;
                ctx.fillText(pixel.char, xOffset, y * charHeight);
                xOffset += charWidth;
            });
        });
    } else {
        // Grayscale mode
        ctx.fillStyle = '#ffffff';
        lines.forEach((line, y) => {
            ctx.fillText(line, 0, y * charHeight);
        });
    }
    
    // Download
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ascii-art.png';
        a.click();
        URL.revokeObjectURL(url);
    });
}

// ===== INITIALIZATION =====
console.log('🎨 ASCII Anything loaded and ready!');
