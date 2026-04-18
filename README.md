# ASCII Anything

**Free online ASCII art converter** — Transform any file into beautiful text-based art instantly. Images, videos, PDFs, Word docs, PowerPoint — if it exists, we'll ASCII-fy it.

🔗 **Live:** [asciianything.com](https://asciianything.com)

---

## Features

### 🖼️ Image Converter
- **🎨 Multiple Character Palettes** — Standard, Blocks, Circles, Matrix, Simple, and Detailed
- **🌈 Color or Grayscale** — Export with full RGB color or classic monochrome
- **📐 Adjustable Resolution** — From 20 to 200 characters wide
- **🔄 Invert Mode** — Flip brightness mapping for different effects
- **💾 Multiple Export Formats** — Download as TXT, HTML, or PNG
- **🔒 Client-Side Processing** — Your images never leave your browser

### 🎬 Video Converter
- **📹 Multi-Format Support** — MP4, MOV, AVI, MKV, GIF
- **⏱️ Adjustable Length** — Convert 1-30 seconds of footage
- **🎨 Color Preservation** — Optional full-color ASCII video output
- **🎵 Audio Preservation** — Original audio track kept in output
- **📥 Auto-Download** — MP4 file downloads automatically when ready

### 📄 Document Processor
- **📑 PDF Support** — Extracts text, renders title as ASCII banner
- **📝 Word Documents** — Full DOCX text extraction
- **📊 PowerPoint** — Extracts text from PPTX slides
- **📃 Plain Text** — Direct TXT file support
- **🎯 Smart Detection** — Auto-extracts and displays on upload

### ✏️ Text Banner Generator
- **🔤 25 Font Styles** — Slant, Doom, Big, Banner3, Small, Cyberlarge, 3-D, Gothic, Standard, Alligator, Alpha, Blocks, Bubble, Digital, Epic, Graffiti, LCD, Peaks, Poison, Rectangles, Shadow, Star Wars, Stop, Wavy, and more
- **📋 Copy to Clipboard** — One-click copy for code comments, READMEs
- **💾 Download as TXT** — Save banners for later use
- **⚡ Instant Preview** — See results in real-time

---

## How It Works

### Images
1. Upload any image (JPG, PNG, GIF, WebP, BMP, SVG)
2. Client-side pixel analysis converts to ASCII characters
3. Export as TXT, HTML, or PNG

### Videos
1. Upload video file (up to 50MB)
2. Server converts frame-by-frame using OpenCV
3. Encodes to MP4 with original audio preserved
4. Auto-downloads to your computer

### Documents
1. Upload PDF, DOCX, PPTX, or TXT
2. Server extracts text content
3. Renders title/first line as ASCII banner
4. Displays full extracted text

### Text Banners
1. Type any text (up to 50 chars)
2. Choose from 25 font styles
3. Copy or download instantly

---

## Tech Stack

### Frontend
- Pure HTML/CSS/JavaScript
- Canvas API for image processing
- No frameworks, no tracking

### Backend
- Flask (Python 3)
- **pymupdf** — PDF text extraction
- **python-docx** — Word document parsing
- **python-pptx** — PowerPoint parsing
- **OpenCV** — Video frame processing
- **ffmpeg** — Video encoding with audio
- **pyfiglet** — Text banner generation (571+ fonts)

### Infrastructure
- nginx reverse proxy
- Let's Encrypt SSL (auto-renewing)
- systemd service management
- 50MB upload limit

---

## Built By

This project was created by **Hermes Agent**, an autonomous AI coding agent.

👤 **Owner:** [trickysyntax](https://github.com/trickysyntax)  
🤖 **Developer:** [Hermes Agent](https://github.com/hermes-agent)

---

## License

MIT — Use it, fork it, break it, fix it.

---

## Acknowledgments

Character palettes inspired by classic ASCII art tools and the demoscene community.

Video processing powered by the `ascii-video` skill pipeline.

Document extraction via pymupdf, python-docx, and python-pptx.
