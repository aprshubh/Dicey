const fs = require('fs');
const path = require('path');

function getBase64Image(filename) {
    const filePath = path.join(__dirname, filename);
    if (!fs.existsSync(filePath)) return '';
    const bitmap = fs.readFileSync(filePath);
    return `data:image/jpeg;base64,${bitmap.toString('base64')}`;
}

const warmCeramicImg = getBase64Image('warm_ceramic.jpg');
const studioMinimalImg = getBase64Image('studio_minimal.jpg');
const minimalistSlateImg = getBase64Image('minimalist_slate.jpg');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dicey - Professional UI Palette Options</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #09090b;
            --card: #141417;
            --border: #27272a;
            --text-main: #f4f4f5;
            --text-muted: #a1a1aa;
            --accent: #3b82f6;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background-color: var(--bg);
            color: var(--text-main);
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            padding: 32px 20px 60px 20px;
            line-height: 1.5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 24px;
            border-bottom: 1px solid var(--border);
        }
        .badge {
            display: inline-block;
            background: #27272a;
            color: #38bdf8;
            font-size: 12px;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 9999px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            margin-bottom: 12px;
            border: 1px solid #3f3f46;
        }
        h1 {
            font-size: 32px;
            font-weight: 800;
            letter-spacing: -0.02em;
            color: #fafafa;
            margin-bottom: 8px;
        }
        p.subtitle {
            color: var(--text-muted);
            font-size: 15px;
            max-width: 650px;
            margin: 0 auto;
        }
        .cards-grid {
            display: flex;
            flex-direction: column;
            gap: 40px;
        }
        .card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
            transition: border-color 0.2s ease;
        }
        .card:hover {
            border-color: #3f3f46;
        }
        .card-header {
            padding: 24px 28px 16px 28px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .card-title-group h2 {
            font-size: 22px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .tag {
            font-size: 11px;
            padding: 3px 8px;
            border-radius: 6px;
            font-weight: 600;
        }
        .tag-recommended { background: #064e3b; color: #34d399; border: 1px solid #059669; }
        .tag-linear { background: #1e1b4b; color: #a5b4fc; border: 1px solid #4338ca; }
        .tag-nordic { background: #0c4a6e; color: #38bdf8; border: 1px solid #0284c7; }
        .card-desc {
            color: var(--text-muted);
            font-size: 14px;
            max-width: 750px;
        }
        .image-wrapper {
            width: 100%;
            background: #000000;
            text-align: center;
            border-top: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
        }
        .image-wrapper img {
            width: 100%;
            max-height: 600px;
            object-fit: contain;
            display: block;
        }
        .palette-section {
            padding: 20px 28px;
            background: #111114;
        }
        .palette-title {
            font-size: 12px;
            font-weight: 600;
            color: #71717a;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 12px;
        }
        .color-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
        }
        .chip {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #18181b;
            padding: 6px 12px 6px 6px;
            border-radius: 8px;
            border: 1px solid #27272a;
        }
        .chip-swatch {
            width: 26px;
            height: 26px;
            border-radius: 6px;
            border: 1px solid rgba(255,255,255,0.15);
        }
        .chip-info {
            display: flex;
            flex-direction: column;
        }
        .chip-name {
            font-size: 11px;
            font-weight: 600;
            color: #e4e4e7;
        }
        .chip-hex {
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            color: #a1a1aa;
        }
        .highlights {
            padding: 16px 28px 24px 28px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 16px;
            background: var(--card);
        }
        .highlight-item {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            font-size: 13px;
            color: #d4d4d8;
        }
        .highlight-dot {
            width: 6px;
            height: 6px;
            background: #3b82f6;
            border-radius: 50%;
            margin-top: 7px;
            flex-shrink: 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="badge">Dicey UI System Selection</div>
            <h1>Professional Eye-Friendly Color Palettes</h1>
            <p class="subtitle">Zero neon, zero glowing glare. Calm, refined, high-retention multiplayer board game interfaces designed for extended play sessions.</p>
        </header>

        <div class="cards-grid">
            <!-- OPTION 1: Warm Ceramic (Chess.com Style) -->
            <div class="card">
                <div class="card-header">
                    <div class="card-title-group">
                        <h2>Option 1: Tactile Warm Ceramic <span class="tag tag-recommended">RECOMMENDED &bull; CHESS.COM STYLE</span></h2>
                        <p class="card-desc">Warm charcoal & stone canvas (#1C1917) with soothing terracotta clay, sage green, honey amber, and dusty slate blue. Natural soft shadows, zero eye fatigue.</p>
                    </div>
                </div>
                <div class="image-wrapper">
                    <img src="${warmCeramicImg}" alt="Tactile Warm Ceramic Ludo UI">
                </div>
                <div class="palette-section">
                    <div class="palette-title">Palette Tokens & Colors</div>
                    <div class="color-chips">
                        <div class="chip"><div class="chip-swatch" style="background:#1C1917"></div><div class="chip-info"><span class="chip-name">Background</span><span class="chip-hex">#1C1917</span></div></div>
                        <div class="chip"><div class="chip-swatch" style="background:#292524"></div><div class="chip-info"><span class="chip-name">Card Surface</span><span class="chip-hex">#292524</span></div></div>
                        <div class="chip"><div class="chip-swatch" style="background:#F5F5F0"></div><div class="chip-info"><span class="chip-name">Board Track</span><span class="chip-hex">#F5F5F0</span></div></div>
                        <div class="chip"><div class="chip-swatch" style="background:#C2410C"></div><div class="chip-info"><span class="chip-name">Terracotta Red</span><span class="chip-hex">#C2410C</span></div></div>
                        <div class="chip"><div class="chip-swatch" style="background:#4D7C0F"></div><div class="chip-info"><span class="chip-name">Sage Olive</span><span class="chip-hex">#4D7C0F</span></div></div>
                        <div class="chip"><div class="chip-swatch" style="background:#B45309"></div><div class="chip-info"><span class="chip-name">Warm Amber</span><span class="chip-hex">#B45309</span></div></div>
                        <div class="chip"><div class="chip-swatch" style="background:#3B82F6"></div><div class="chip-info"><span class="chip-name">Slate Blue</span><span class="chip-hex">#3B82F6</span></div></div>
                    </div>
                </div>
                <div class="highlights">
                    <div class="highlight-item"><div class="highlight-dot"></div><div><strong>Aesthetic:</strong> Tactile board game feel like physical wood/ceramic pieces on stone table.</div></div>
                    <div class="highlight-item"><div class="highlight-dot"></div><div><strong>Eye Comfort:</strong> Warm background suppresses blue light strain completely.</div></div>
                    <div class="highlight-item"><div class="highlight-dot"></div><div><strong>Modern Touch:</strong> Sleek 1px divider lines, minimal avatar chips, clean dice cup tray.</div></div>
                </div>
            </div>

            <!-- OPTION 2: Modern Flat Studio (Linear / Notion Style) -->
            <div class="card">
                <div class="card-header">
                    <div class="card-title-group">
                        <h2>Option 2: Flat Studio Minimal <span class="tag tag-linear">LINEAR / NOTION STYLE</span></h2>
                        <p class="card-desc">Deep neutral zinc canvas (#09090B) with soft pastel muted colors, crisp 1px micro-borders, Inter typography, and razor-sharp geometric balance.</p>
                    </div>
                </div>
                <div class="image-wrapper">
                    <img src="${studioMinimalImg}" alt="Flat Studio Minimal Ludo UI">
                </div>
                <div class="palette-section">
                    <div class="palette-title">Palette Tokens & Colors</div>
                    <div class="color-chips">
                        <div class="chip"><div class="chip-swatch" style="background:#09090B"></div><div class="chip-info"><span class="chip-name">Background</span><span class="chip-hex">#09090B</span></div></div>
                        <div class="chip"><div class="chip-swatch" style="background:#18181B"></div><div class="chip-info"><span class="chip-name">Sidebar & Panels</span><span class="chip-hex">#18181B</span></div></div>
                        <div class="chip"><div class="chip-swatch" style="background:#FFFFFF"></div><div class="chip-info"><span class="chip-name">Board Track</span><span class="chip-hex">#FFFFFF</span></div></div>
                        <div class="chip"><div class="chip-swatch" style="background:#E11D48"></div><div class="chip-info"><span class="chip-name">Muted Rose</span><span class="chip-hex">#E11D48</span></div></div>
                        <div class="chip"><div class="chip-swatch" style="background:#10B981"></div><div class="chip-info"><span class="chip-name">Mint Emerald</span><span class="chip-hex">#10B981</span></div></div>
                        <div class="chip"><div class="chip-swatch" style="background:#F59E0B"></div><div class="chip-info"><span class="chip-name">Honey Gold</span><span class="chip-hex">#F59E0B</span></div></div>
                        <div class="chip"><div class="chip-swatch" style="background:#0EA5E9"></div><div class="chip-info"><span class="chip-name">Sky Cyan</span><span class="chip-hex">#0EA5E9</span></div></div>
                    </div>
                </div>
                <div class="highlights">
                    <div class="highlight-item"><div class="highlight-dot"></div><div><strong>Aesthetic:</strong> SaaS-grade precision with clean monochrome chrome and subtle pastel accents.</div></div>
                    <div class="highlight-item"><div class="highlight-dot"></div><div><strong>Information Density:</strong> Clean player list, minimal timer bars, integrated in-game chat box.</div></div>
                    <div class="highlight-item"><div class="highlight-dot"></div><div><strong>Vibe:</strong> High-end tech product rather than a gimmicky arcade game.</div></div>
                </div>
            </div>

            <!-- OPTION 3: Nordic Minimalist Slate -->
            <div class="card">
                <div class="card-header">
                    <div class="card-title-group">
                        <h2>Option 3: Nordic Minimalist Slate <span class="tag tag-nordic">CLEAN SCANDINAVIAN</span></h2>
                        <p class="card-desc">Deep slate-gray palette (#0F172A) with soft muted coral, seafoam green, warm ochre, and dusk blue. Clean grid alignment and subtle typography.</p>
                    </div>
                </div>
                <div class="image-wrapper">
                    <img src="${minimalistSlateImg}" alt="Nordic Minimalist Slate Ludo UI">
                </div>
                <div class="palette-section">
                    <div class="palette-title">Palette Tokens & Colors</div>
                    <div class="color-chips">
                        <div class="chip"><div class="chip-swatch" style="background:#0F172A"></div><div class="chip-info"><span class="chip-name">Background</span><span class="chip-hex">#0F172A</span></div></div>
                        <div class="chip"><div class="chip-swatch" style="background:#1E293B"></div><div class="chip-info"><span class="chip-name">Container Card</span><span class="chip-hex">#1E293B</span></div></div>
                        <div class="chip"><div class="chip-swatch" style="background:#F8FAFC"></div><div class="chip-info"><span class="chip-name">Board Track</span><span class="chip-hex">#F8FAFC</span></div></div>
                        <div class="chip"><div class="chip-swatch" style="background:#F43F5E"></div><div class="chip-info"><span class="chip-name">Muted Coral</span><span class="chip-hex">#F43F5E</span></div></div>
                        <div class="chip"><div class="chip-swatch" style="background:#14B8A6"></div><div class="chip-info"><span class="chip-name">Seafoam Teal</span><span class="chip-hex">#14B8A6</span></div></div>
                        <div class="chip"><div class="chip-swatch" style="background:#EAB308"></div><div class="chip-info"><span class="chip-name">Warm Ochre</span><span class="chip-hex">#EAB308</span></div></div>
                        <div class="chip"><div class="chip-swatch" style="background:#6366F1"></div><div class="chip-info"><span class="chip-name">Indigo Slate</span><span class="chip-hex">#6366F1</span></div></div>
                    </div>
                </div>
                <div class="highlights">
                    <div class="highlight-item"><div class="highlight-dot"></div><div><strong>Aesthetic:</strong> Cool slate undertones with high readability contrast.</div></div>
                    <div class="highlight-item"><div class="highlight-dot"></div><div><strong>Player Focus:</strong> Distinct token silhouettes without distracting reflections or flare.</div></div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'preview.html'), htmlContent, 'utf8');
console.log('Successfully regenerated preview.html with 3 professional matte UI designs!');
