export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Proxy for downloading
    if (url.pathname === "/proxy-image") {
      const imageUrl = url.searchParams.get("url");
      if (!imageUrl) return new Response("Missing URL", { status: 400 });

      try {
        const imageResponse = await fetch(imageUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Image Tool)"
          }
        });
        
        const newHeaders = new Headers(imageResponse.headers);
        newHeaders.set("Access-Control-Allow-Origin", "*");

        return new Response(imageResponse.body, {
          status: imageResponse.status,
          headers: newHeaders
        });
      } catch (err) {
        return new Response("Failed to fetch image", { status: 500 });
      }
    }

    // UI Response
    return new Response(htmlUI(), {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  },
};

function htmlUI() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Tools</title>
    <style>
        :root {
            --primary: #0d82c5;
            --primary-hover: #0946b6;
            --bg: #c7baba;
            --card: #ffffff;
            --text: #0f172a;
            --text-muted: #64748b;
            --border: #e2e8f0;
            --radius: 12px;
        }
        * { box-sizing: border-box; outline: none; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
            background-color: var(--bg);
            color: var(--text);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .app-container {
            background: var(--card);
            width: 100%;
            max-width: 480px;
            border-radius: var(--radius);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        /* Header */
        header { padding: 1.5rem; text-align: center; border-bottom: 1px solid var(--border); background: #f1f5f9; }
        h1 { margin: 0; font-size: 1.25rem; font-weight: 700; color: var(--text); }
        
        /* Tabs */
        .tabs { display: flex; background: #f1f5f9; padding: 0 1rem; gap: 0.5rem; }
        .tab {
            flex: 1; padding: 12px; text-align: center; cursor: pointer;
            font-size: 0.9rem; font-weight: 600; color: var(--text-muted);
            border-bottom: 2px solid transparent; transition: all 0.2s;
        }
        .tab:hover { color: var(--primary); }
        .tab.active {
            color: var(--primary); border-bottom-color: var(--primary);
            background: white; border-radius: 8px 8px 0 0;
        }

        /* Content */
        .content { padding: 1.5rem; }
        .section { display: none; animation: fadeIn 0.3s ease; }
        .section.active { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

        /* Form Elements */
        .form-group { margin-bottom: 1.25rem; }
        label { display: block; margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
        
        input[type="text"], input[type="number"], select {
            width: 100%; padding: 10px 12px;
            border: 1px solid var(--border); border-radius: 8px;
            font-size: 1rem; transition: border-color 0.2s;
        }
        input:focus, select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }

        /* Range Slider */
        input[type=range] {
            width: 100%; cursor: pointer;
        }

        /* File Drop */
        .file-drop-area {
            border: 2px dashed var(--border); border-radius: var(--radius);
            padding: 2rem; text-align: center; cursor: pointer;
            transition: all 0.2s; position: relative;
        }
        .file-drop-area:hover { border-color: var(--primary); background: #eff6ff; }
        .file-drop-area input {
            position: absolute; left: 0; top: 0; width: 100%; height: 100%;
            opacity: 0; cursor: pointer;
        }
        .file-msg { color: var(--text-muted); font-size: 0.9rem; pointer-events: none; }

        /* Grid Layouts */
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .dimensions-grid { display: grid; grid-template-columns: 1fr auto 1fr; gap: 10px; align-items: end; }
        
        .lock-btn {
            height: 42px; width: 42px; display: flex; align-items: center; justify-content: center;
            border: 1px solid var(--border); border-radius: 8px; background: white;
            cursor: pointer; color: var(--text-muted);
        }
        .lock-btn.locked { background: #eff6ff; color: var(--primary); border-color: var(--primary); }
        .lock-icon { width: 18px; height: 18px; fill: currentColor; }

        /* Buttons */
        .btn {
            width: 100%; padding: 12px; border: none; border-radius: 8px;
            font-size: 1rem; font-weight: 600; cursor: pointer;
            transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-primary { background-color: var(--primary); color: white; }
        .btn-primary:hover { background-color: var(--primary-hover); }
        .btn-primary:disabled { background-color: #cbd5e1; cursor: not-allowed; }

        /* Status */
        #status-area {
            margin-top: 1rem; padding: 0.75rem; border-radius: 8px;
            font-size: 0.9rem; text-align: center; display: none;
        }
        .status-success { background: #dcfce7; color: #166534; }
        .status-error { background: #fee2e2; color: #991b1b; }

        /* Mode Toggle */
        .mode-toggle { display: flex; gap: 1rem; margin-bottom: 1rem; font-size: 0.9rem; }
        .radio-label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
        
        .divider { border-top: 1px solid var(--border); margin: 1.5rem 0; }
    </style>
</head>
<body>

<div class="app-container">
    <header>
        <h1>Image Tools</h1>
    </header>
    
    <div class="tabs">
        <div class="tab active" onclick="switchTab('download')">URL Downloader</div>
        <div class="tab" onclick="switchTab('resize')">Editor</div>
    </div>

    <div class="content">
        <div id="section-download" class="section active">
            <div class="form-group">
                <label>Image URL</label>
                <input type="text" id="urlInput" placeholder="https://example.com/photo.jpg">
            </div>
            <button class="btn btn-primary" id="downloadBtn" onclick="downloadFromUrl()">
                Download Image
            </button>
        </div>

        <div id="section-resize" class="section">
            <div class="form-group">
                <div class="file-drop-area" id="dropArea">
                    <span class="file-msg" id="fileMsg">Click or Drag image here</span>
                    <input type="file" id="fileInput" accept="image/*" onchange="loadFile(this)">
                </div>
            </div>

            <div id="resizeControls" style="display:none;">
                
                <div class="divider"></div>

                <div class="mode-toggle">
                    <label class="radio-label">
                        <input type="radio" name="resizeMode" value="dimensions" checked onchange="toggleMode()"> Dimensions
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="resizeMode" value="percentage" onchange="toggleMode()"> Percentage
                    </label>
                </div>

                <div id="dimensions-group" class="dimensions-grid form-group">
                    <div>
                        <label>Width</label>
                        <input type="number" id="widthPx" oninput="onDimChange('w')">
                    </div>
                    <div class="lock-btn locked" id="lockBtn" onclick="toggleLock()" title="Lock Aspect Ratio">
                        <svg class="lock-icon" viewBox="0 0 24 24"><path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/></svg>
                    </div>
                    <div>
                        <label>Height</label>
                        <input type="number" id="heightPx" oninput="onDimChange('h')">
                    </div>
                </div>

                <div id="percentage-group" class="form-group" style="display:none;">
                    <label>Scale Percentage</label>
                    <input type="number" id="scalePercent" placeholder="50" value="50">
                </div>

                <div class="grid-2 form-group">
                    <div>
                        <label>Format</label>
                        <select id="exportFormat" onchange="toggleQualitySlider()">
                            <option value="image/jpeg">JPEG</option>
                            <option value="image/png">PNG</option>
                            <option value="image/webp">WEBP</option>
                        </select>
                    </div>
                    <div id="quality-wrapper">
                        <label style="display:flex; justify-content:space-between;">
                            Quality <span id="qualityVal">80%</span>
                        </label>
                        <input type="range" id="exportQuality" min="10" max="100" value="80" oninput="updateQualityDisplay()">
                    </div>
                </div>

                <button class="btn btn-primary" onclick="processResize()">
                    Process & Download
                </button>
            </div>
        </div>

        <div id="status-area"></div>
    </div>
</div>

<script>
    let originalImage = null;
    let aspectRatio = 0;
    let isLocked = true;

    // Tab Controls
    function switchTab(tab) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        
        if(tab === 'download') {
            document.querySelectorAll('.tab')[0].classList.add('active');
            document.getElementById('section-download').classList.add('active');
        } else {
            document.querySelectorAll('.tab')[1].classList.add('active');
            document.getElementById('section-resize').classList.add('active');
        }
        hideStatus();
    }

    // URL Download
    async function downloadFromUrl() {
        const url = document.getElementById('urlInput').value;
        const btn = document.getElementById('downloadBtn');

        if (!url) return showStatus('Please enter a valid URL', 'error');

        btn.disabled = true;
        btn.innerHTML = 'Downloading...';
        
        try {
            const proxyUrl = '/proxy-image?url=' + encodeURIComponent(url);
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error('Could not fetch image');

            const blob = await response.blob();
            // Try to detect extension
            const type = response.headers.get('content-type') || 'image/jpeg';
            const ext = type.split('/')[1] || 'jpg';
            
            triggerDownload(blob, \`downloaded-image.\${ext}\`);
            showStatus('Download started!', 'success');
        } catch (e) {
            showStatus(e.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Download Image';
        }
    }

    // Editor
    
    function loadFile(input) {
        const file = input.files[0];
        if (!file) return;

        document.getElementById('fileMsg').innerText = file.name;
        document.getElementById('dropArea').style.borderColor = 'var(--primary)';

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                originalImage = img;
                aspectRatio = img.width / img.height;
                
                document.getElementById('widthPx').value = img.width;
                document.getElementById('heightPx').value = img.height;
                
                document.getElementById('resizeControls').style.display = 'block';
                showStatus(\`Loaded: \${img.width} x \${img.height} px\`, 'success');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Toggle between px and % inputs
    function toggleMode() {
        const mode = document.querySelector('input[name="resizeMode"]:checked').value;
        if (mode === 'dimensions') {
            document.getElementById('dimensions-group').style.display = 'grid';
            document.getElementById('percentage-group').style.display = 'none';
        } else {
            document.getElementById('dimensions-group').style.display = 'none';
            document.getElementById('percentage-group').style.display = 'block';
        }
    }

    // Aspect Ratio Lock
    function toggleLock() {
        isLocked = !isLocked;
        const btn = document.getElementById('lockBtn');
        if (isLocked) {
            btn.classList.add('locked');
            onDimChange('w'); // Resync
        } else {
            btn.classList.remove('locked');
        }
    }

    // Calculate Aspect Ratio
    function onDimChange(source) {
        if (!isLocked || !originalImage) return;
        const wInput = document.getElementById('widthPx');
        const hInput = document.getElementById('heightPx');

        if (source === 'w' && wInput.value) {
            hInput.value = Math.round(wInput.value / aspectRatio);
        } else if (source === 'h' && hInput.value) {
            wInput.value = Math.round(hInput.value * aspectRatio);
        }
    }

    // Quality Slider Logic
    function updateQualityDisplay() {
        const val = document.getElementById('exportQuality').value;
        document.getElementById('qualityVal').innerText = val + '%';
    }

    function toggleQualitySlider() {
        const format = document.getElementById('exportFormat').value;
        const wrapper = document.getElementById('quality-wrapper');
        // PNG is lossless, so quality slider is irrelevant
        if (format === 'image/png') {
            wrapper.style.opacity = '0.3';
            wrapper.style.pointerEvents = 'none';
        } else {
            wrapper.style.opacity = '1';
            wrapper.style.pointerEvents = 'auto';
        }
    }

    // Main Process Function
    function processResize() {
        if (!originalImage) return;

        // 1. Calculate Dimensions
        const mode = document.querySelector('input[name="resizeMode"]:checked').value;
        let finalW, finalH;

        if (mode === 'dimensions') {
            finalW = parseInt(document.getElementById('widthPx').value);
            finalH = parseInt(document.getElementById('heightPx').value);
        } else {
            const pct = parseInt(document.getElementById('scalePercent').value) / 100;
            finalW = originalImage.width * pct;
            finalH = originalImage.height * pct;
        }

        if (!finalW || !finalH) return showStatus('Invalid dimensions', 'error');

        // 2. Prepare Settings
        const format = document.getElementById('exportFormat').value;
        // Convert 0-100 to 0.0-1.0
        const quality = parseInt(document.getElementById('exportQuality').value) / 100;

        // 3. Canvas Operations
        const canvas = document.createElement('canvas');
        canvas.width = finalW;
        canvas.height = finalH;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(originalImage, 0, 0, finalW, finalH);

        // 4. Export
        canvas.toBlob((blob) => {
            if (!blob) return showStatus('Error creating image', 'error');
            
            // Determine extension
            let ext = 'jpg';
            if (format === 'image/png') ext = 'png';
            if (format === 'image/webp') ext = 'webp';

            triggerDownload(blob, \`processed-image.\${ext}\`);
            
            // Calculate size savings for fun feedback
            const sizeKB = (blob.size / 1024).toFixed(1);
            showStatus(\`Saved as \${ext.toUpperCase()} (\${sizeKB} KB)\`, 'success');

        }, format, quality);
    }

    function triggerDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    function showStatus(msg, type) {
        const el = document.getElementById('status-area');
        el.innerText = msg;
        el.className = type === 'success' ? 'status-success' : 'status-error';
        el.style.display = 'block';
    }

    function hideStatus() {
        document.getElementById('status-area').style.display = 'none';
    }
</script>
</body>
</html>
  `;
}
