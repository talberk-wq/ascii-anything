// ===== ASCII ANYTHING - Universal File Converter =====

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
let currentFile = null;
let fileType = null;
let colorMode = 'grayscale';
let resolution = 80;
let palette = 'standard';
let inverted = false;
let colorData = [];

// DOM Elements
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const uploadPreview = document.getElementById('uploadPreview');
const videoPreview = document.getElementById('videoPreview');
const uploadContent = uploadZone.querySelector('.upload-content');
const imageControls = document.getElementById('imageControls');
const videoControls = document.getElementById('videoControls');
const output = document.getElementById('output');
const asciiPreview = document.getElementById('asciiPreview');
const asciiText = document.getElementById('asciiText');
const paletteSelect = document.getElementById('paletteSelect');
const resolutionSlider = document.getElementById('resolutionSlider');
const resolutionValue = document.getElementById('resolutionValue');
const invertCheck = document.getElementById('invertCheck');
const downloadBtn = document.getElementById('downloadBtn');
const convertVideoBtn = document.getElementById('convertVideoBtn');
const tabBtns = document.querySelectorAll('.tab-btn');
const previewTab = document.getElementById('previewTab');
const textTab = document.getElementById('textTab');

// File type detection
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'image/gif'];
const DOCUMENT_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain'];

// ===== EVENT LISTENERS =====

uploadZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

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

// Image controls
paletteSelect.addEventListener('change', (e) => {
    palette = e.target.value;
    if (currentImage) convertToASCII();
});

resolutionSlider.addEventListener('input', (e) => {
    resolution = parseInt(e.target.value);
    resolutionValue.textContent = `${resolution} chars`;
    if (currentImage) convertToASCII();
});

document.querySelectorAll('.control-toggle .toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.target.parentElement.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        colorMode = e.target.dataset.mode;
        if (currentImage) convertToASCII();
    });
});

invertCheck.addEventListener('change', (e) => {
    inverted = e.target.checked;
    if (currentImage) convertToASCII();
});

// Video controls
const videoLengthSlider = document.getElementById('videoLengthSlider');
const videoLengthValue = document.getElementById('videoLengthValue');
videoLengthSlider.addEventListener('input', (e) => {
    videoLengthValue.textContent = `${e.target.value} sec`;
});

convertVideoBtn.addEventListener('click', convertVideo);

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

downloadBtn.addEventListener('click', downloadASCII);

// ===== CORE FUNCTIONS =====

function handleFile(file) {
    currentFile = file;
    
    // Detect file type
    if (IMAGE_TYPES.includes(file.type) || file.name.toLowerCase().endsWith('.svg')) {
        fileType = 'image';
        handleImage(file);
    } else if (VIDEO_TYPES.includes(file.type)) {
        fileType = 'video';
        handleVideo(file);
    } else if (DOCUMENT_TYPES.includes(file.type) || 
               /\.(txt|pdf|docx|pptx)$/i.test(file.name)) {
        fileType = 'document';
        handleDocument(file);
    } else {
        alert('Unsupported file type. Please upload an image, video, or document.');
    }
}

function handleImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            
            uploadPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            uploadPreview.style.display = 'block';
            videoPreview.style.display = 'none';
            uploadContent.style.display = 'none';
            
            imageControls.style.display = 'grid';
            videoControls.style.display = 'none';
            output.style.display = 'none';
            
            convertToASCII();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function handleVideo(file) {
    const url = URL.createObjectURL(file);
    videoPreview.innerHTML = `<video id="videoElement" controls style="max-width:100%;max-height:300px;"><source src="${url}" type="${file.type}"></video>`;
    videoPreview.style.display = 'block';
    uploadPreview.style.display = 'none';
    uploadContent.style.display = 'none';
    
    imageControls.style.display = 'none';
    videoControls.style.display = 'grid';
    output.style.display = 'none';
}

function handleDocument(file) {
    uploadPreview.innerHTML = `<div style="padding:20px;text-align:center;">📄 ${file.name}</div>`;
    uploadPreview.style.display = 'block';
    videoPreview.style.display = 'none';
    uploadContent.style.display = 'none';
    
    imageControls.style.display = 'none';
    videoControls.style.display = 'none';
    
    extractDocumentText(file);
}

function showOutput() {
    output.style.display = 'block';
    // Switch to preview tab
    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === 'preview'));
    previewTab.classList.add('active');
    textTab.classList.remove('active');
}

// ===== IMAGE CONVERSION =====

function convertToASCII() {
    if (!currentImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const charAspectRatio = 0.5;
    const targetWidth = resolution;
    const targetHeight = Math.floor(resolution * (currentImage.height / currentImage.width) * charAspectRatio);

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.drawImage(currentImage, 0, 0, targetWidth, targetHeight);

    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const pixels = imageData.data;

    const paletteChars = PALETTES[palette];
    let ascii = '';
    let asciiHtml = '';
    colorData = [];

    for (let y = 0; y < targetHeight; y++) {
        const lineColors = [];
        for (let x = 0; x < targetWidth; x++) {
            const idx = (y * targetWidth + x) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];

            let brightness = 0.299 * r + 0.587 * g + 0.114 * b;
            
            if (inverted) {
                brightness = 255 - brightness;
            }

            const charIdx = Math.floor((brightness / 255) * (paletteChars.length - 1));
            const char = paletteChars[charIdx];

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

    asciiText.value = ascii;
    
    if (colorMode === 'color') {
        asciiPreview.innerHTML = asciiHtml;
    } else {
        asciiPreview.textContent = ascii;
    }
    
    showOutput();
}

// ===== DOCUMENT PROCESSING =====

async function extractDocumentText(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/document', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.error) {
            alert('Error: ' + result.error);
            return;
        }
        
        // Display banner + text
        asciiPreview.innerHTML = `<pre style="font-size:0.7em;">${result.banner}</pre>`;
        asciiText.value = result.text;
        
        showOutput();
        
    } catch (error) {
        alert('Error processing document: ' + error.message);
    }
}

// ===== VIDEO PROCESSING =====

async function convertVideo() {
    if (!currentFile) return;
    
    const length = parseInt(document.getElementById('videoLengthSlider').value);
    const resolution = parseInt(document.getElementById('videoResolution').value);
    const color = document.getElementById('videoColor').checked;
    
    // Show progress
    document.getElementById('videoProgress').style.display = 'block';
    document.getElementById('progressBar').style.width = '10%';
    document.getElementById('progressText').textContent = 'Uploading...';
    
    const formData = new FormData();
    formData.append('file', currentFile);
    formData.append('length', length);
    formData.append('resolution', resolution);
    formData.append('color', color);
    
    try {
        document.getElementById('progressBar').style.width = '30%';
        document.getElementById('progressText').textContent = 'Converting to ASCII...';
        
        const response = await fetch('/api/video', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        document.getElementById('progressBar').style.width = '100%';
        
        if (result.error) {
            document.getElementById('progressText').textContent = 'Error: ' + result.error;
            return;
        }
        
        document.getElementById('progressText').textContent = 'Complete! Downloading...';
        
        // Auto-download
        const a = document.createElement('a');
        a.href = result.download_url;
        a.download = `ascii_${currentFile.name.split('.')[0]}.mp4`;
        a.click();
        
        // Show in preview
        asciiPreview.innerHTML = `
            <div style="text-align:center;padding:40px;">
                <h3>✅ ASCII Video Created!</h3>
                <p>Downloaded: ascii_${currentFile.name.split('.')[0]}.mp4</p>
                <p style="margin-top:20px;">${result.message || ''}</p>
            </div>
        `;
        asciiText.value = `ASCII Video Conversion Complete\n\nInput: ${currentFile.name}\nLength: ${length}s\nResolution: ${resolution} chars\nColor: ${color ? 'Yes' : 'No'}\n\nDownloaded to your computer.`;
        
        showOutput();
        
    } catch (error) {
        document.getElementById('progressText').textContent = 'Error: ' + error.message;
    }
}

// ===== DOWNLOAD =====

function downloadASCII() {
    if (!currentImage && !asciiText.value) return;

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
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    ctx.font = '8px "JetBrains Mono", monospace';
    const charWidth = ctx.measureText('M').width;
    const charHeight = 10;
    
    const lines = asciiText.value.split('\n');
    const maxWidth = Math.max(...lines.map(l => l.length)) * charWidth;
    const height = lines.length * charHeight;
    
    canvas.width = maxWidth;
    canvas.height = height;
    
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.textBaseline = 'top';
    
    if (colorMode === 'color' && colorData.length > 0) {
        colorData.forEach((line, y) => {
            let xOffset = 0;
            line.forEach(pixel => {
                ctx.fillStyle = `rgb(${pixel.r},${pixel.g},${pixel.b})`;
                ctx.fillText(pixel.char, xOffset, y * charHeight);
                xOffset += charWidth;
            });
        });
    } else {
        ctx.fillStyle = '#ffffff';
        lines.forEach((line, y) => {
            ctx.fillText(line, 0, y * charHeight);
        });
    }
    
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
