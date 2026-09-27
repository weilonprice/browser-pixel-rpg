// 16-Bit Pixel Art Renderer & Texture Generator
// Directly implements the art style of Crownstone / 16-bit Kingdom Builder

export class PixelArtGenerator {
  constructor() {
    this.cache = new Map();
    this.pixellabAssets = new Map();

    // Authentic PixelLab Generated 4-Directional Hero Sprites
    this.heroSprites = {
      down: new Image(),
      up: new Image(),
      left: new Image(),
      right: new Image()
    };
    this.heroSprites.down.src = 'assets/images/hero/hero_south.png';
    this.heroSprites.up.src = 'assets/images/hero/hero_north.png';
    this.heroSprites.right.src = 'assets/images/hero/hero_east.png';
    this.heroSprites.left.src = 'assets/images/hero/hero_west.png';
  }

  getPixellabImage(category, name) {
    const key = `${category}/${name}`;
    if (!this.pixellabAssets.has(key)) {
      const img = new Image();
      img.src = `assets/images/pixellab/${category}/${name}.png`;
      this.pixellabAssets.set(key, img);
    }
    return this.pixellabAssets.get(key);
  }

  drawPixellabAsset(ctx, category, name, x, y, size = 32, centered = true) {
    const img = this.getPixellabImage(category, name);
    if (img && img.complete && img.naturalWidth > 0) {
      if (centered) {
        ctx.drawImage(img, Math.round(x - size / 2), Math.round(y - size / 2), size, size);
      } else {
        ctx.drawImage(img, Math.round(x), Math.round(y), size, size);
      }
      return true;
    }
    return false;
  }

  // Helper to create an offscreen pixel canvas
  createCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { canvas: c, ctx };
  }

  // --- NATURE & GROUND TILES ---

  drawGrassTile(ctx, x, y, size, variant = 0) {
    // Base vibrant moss green
    ctx.fillStyle = '#4ba338';
    ctx.fillRect(x, y, size, size);

    // Subtle grass texture dapples
    ctx.fillStyle = '#5cba46';
    ctx.fillRect(x + 4, y + 6, 2, 4);
    ctx.fillRect(x + 18, y + 14, 3, 3);
    ctx.fillRect(x + 10, y + 22, 2, 3);
    ctx.fillRect(x + 24, y + 4, 3, 2);

    ctx.fillStyle = '#398328';
    ctx.fillRect(x + 6, y + 10, 2, 2);
    ctx.fillRect(x + 20, y + 18, 2, 2);
    ctx.fillRect(x + 12, y + 26, 2, 2);

    // Occasional flower tufts matching references
    if (variant === 1) {
      // Blue flowers
      ctx.fillStyle = '#3f78e0';
      ctx.fillRect(x + 8, y + 8, 3, 3);
      ctx.fillRect(x + 14, y + 10, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 9, y + 9, 1, 1);
    } else if (variant === 2) {
      // Red/Yellow flowers
      ctx.fillStyle = '#e84133';
      ctx.fillRect(x + 20, y + 12, 3, 3);
      ctx.fillStyle = '#f5c531';
      ctx.fillRect(x + 21, y + 13, 1, 1);
      ctx.fillRect(x + 8, y + 20, 2, 2);
    }
  }

  drawDirtPathTile(ctx, x, y, size) {
    // Warm golden dirt
    ctx.fillStyle = '#c8924f';
    ctx.fillRect(x, y, size, size);

    // Highlight and shadow grains
    ctx.fillStyle = '#deb070';
    ctx.fillRect(x + 4, y + 6, 4, 2);
    ctx.fillRect(x + 18, y + 12, 5, 2);
    ctx.fillRect(x + 8, y + 22, 3, 2);

    // Pebbles
    ctx.fillStyle = '#7a7f8a';
    ctx.fillRect(x + 14, y + 8, 3, 2);
    ctx.fillRect(x + 24, y + 20, 2, 2);
    ctx.fillStyle = '#555963';
    ctx.fillRect(x + 14, y + 10, 3, 1);

    // Dark dirt edge shadow
    ctx.fillStyle = '#a67236';
    ctx.fillRect(x + 2, y + 28, 4, 2);
    ctx.fillRect(x + 22, y + 4, 3, 2);
  }

  drawCobblestoneTile(ctx, x, y, size) {
    // Medieval stone paving
    ctx.fillStyle = '#4a505b';
    ctx.fillRect(x, y, size, size);

    const stones = [
      { sx: 2, sy: 2, sw: 12, sh: 8, col: '#727a87' },
      { sx: 16, sy: 2, sw: 14, sh: 8, col: '#626a77' },
      { sx: 2, sy: 12, sw: 14, sh: 8, col: '#6a727f' },
      { sx: 18, sy: 12, sw: 12, sh: 8, col: '#78818f' },
      { sx: 2, sy: 22, sw: 12, sh: 8, col: '#626a77' },
      { sx: 16, sy: 22, sw: 14, sh: 8, col: '#727a87' },
    ];

    for (const s of stones) {
      // Stone body
      ctx.fillStyle = s.col;
      ctx.fillRect(x + s.sx, y + s.sy, s.sw, s.sh);
      // Top highlight
      ctx.fillStyle = '#8f98a6';
      ctx.fillRect(x + s.sx, y + s.sy, s.sw, 1);
      // Bottom shadow
      ctx.fillStyle = '#383d47';
      ctx.fillRect(x + s.sx, y + s.sy + s.sh - 1, s.sw, 1);
    }
  }

  drawWaterTile(ctx, x, y, size, time = 0) {
    ctx.fillStyle = '#346ba8';
    ctx.fillRect(x, y, size, size);

    // Animated water shimmer ripples
    const offset = Math.floor(Math.sin(time * 3 + x + y) * 2);
    ctx.fillStyle = '#4c87cb';
    ctx.fillRect(x + 4 + offset, y + 6, 8, 2);
    ctx.fillRect(x + 18 - offset, y + 18, 10, 2);

    ctx.fillStyle = '#7eb7f5';
    ctx.fillRect(x + 6 + offset, y + 7, 4, 1);
    ctx.fillRect(x + 20 - offset, y + 19, 5, 1);
  }

  // --- HARVESTABLE OBJECTS ---

  drawPineTree(ctx, x, y, hitShake = 0) {
    ctx.save();
    ctx.translate(x + hitShake, y);

    // Dark selective outline shadow base
    ctx.fillStyle = 'rgba(18, 24, 14, 0.4)';
    ctx.beginPath();
    ctx.ellipse(16, 42, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk
    ctx.fillStyle = '#543216';
    ctx.fillRect(13, 28, 6, 14);
    ctx.fillStyle = '#7a4a23';
    ctx.fillRect(14, 28, 3, 14);
    ctx.fillStyle = '#1c130b'; // trunk outline
    ctx.fillRect(12, 28, 1, 14);
    ctx.fillRect(19, 28, 1, 14);

    // 3-Tiered Pine Foliage with crisp dark green outline
    const tiers = [
      { y: 22, w: 28, h: 12, peak: 4 },
      { y: 12, w: 22, h: 12, peak: 14 },
      { y: 0,  w: 16, h: 14, peak: 24 }
    ];

    for (const t of tiers) {
      const bx = 16 - t.w / 2;
      // Dark outline triangle
      ctx.fillStyle = '#142817';
      ctx.beginPath();
      ctx.moveTo(16, t.y - t.peak / 2);
      ctx.lineTo(bx - 1, t.y + t.h + 1);
      ctx.lineTo(bx + t.w + 1, t.y + t.h + 1);
      ctx.closePath();
      ctx.fill();

      // Main deep pine green
      ctx.fillStyle = '#26632d';
      ctx.beginPath();
      ctx.moveTo(16, t.y - t.peak / 2 + 1);
      ctx.lineTo(bx + 1, t.y + t.h);
      ctx.lineTo(bx + t.w - 1, t.y + t.h);
      ctx.closePath();
      ctx.fill();

      // Needle highlights
      ctx.fillStyle = '#3da349';
      ctx.beginPath();
      ctx.moveTo(16, t.y - t.peak / 2 + 2);
      ctx.lineTo(bx + 4, t.y + t.h - 2);
      ctx.lineTo(16, t.y + t.h - 1);
      ctx.closePath();
      ctx.fill();

      // Scalloped needle teeth at bottom
      ctx.fillStyle = '#1b4a21';
      for (let i = 0; i < t.w - 4; i += 4) {
        ctx.fillRect(bx + 2 + i, t.y + t.h - 2, 2, 2);
      }
    }

    ctx.restore();
  }

  drawOakTree(ctx, x, y, hitShake = 0) {
    ctx.save();
    ctx.translate(x + hitShake, y);

    // Shadow
    ctx.fillStyle = 'rgba(18, 24, 14, 0.4)';
    ctx.beginPath();
    ctx.ellipse(16, 42, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk
    ctx.fillStyle = '#543216';
    ctx.fillRect(12, 26, 8, 16);
    ctx.fillStyle = '#7a4a23';
    ctx.fillRect(14, 26, 4, 16);

    // Round Fluffy Foliage Canopy (Zelda/Stardew Style)
    // Dark outline circle cluster
    ctx.fillStyle = '#17361a';
    ctx.beginPath();
    ctx.arc(16, 16, 17, 0, Math.PI * 2);
    ctx.arc(10, 20, 10, 0, Math.PI * 2);
    ctx.arc(22, 20, 10, 0, Math.PI * 2);
    ctx.fill();

    // Mid tone
    ctx.fillStyle = '#2f7a36';
    ctx.beginPath();
    ctx.arc(16, 16, 15, 0, Math.PI * 2);
    ctx.arc(10, 20, 8, 0, Math.PI * 2);
    ctx.arc(22, 20, 8, 0, Math.PI * 2);
    ctx.fill();

    // Sunny upper highlight
    ctx.fillStyle = '#53b05c';
    ctx.beginPath();
    ctx.arc(14, 13, 10, 0, Math.PI * 2);
    ctx.arc(19, 14, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawTreeStump(ctx, x, y) {
    // Cut tree stump with growth rings
    ctx.fillStyle = '#422710';
    ctx.fillRect(x + 8, y + 16, 16, 10);
    // Top flat face
    ctx.fillStyle = '#c79258';
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 16, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Dark rings
    ctx.strokeStyle = '#855628';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 16, 4, 2, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawRock(ctx, x, y, hitShake = 0) {
    ctx.save();
    ctx.translate(x + hitShake, y);

    // Stone shadow
    ctx.fillStyle = 'rgba(18, 20, 24, 0.4)';
    ctx.beginPath();
    ctx.ellipse(16, 26, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark outline boulder
    ctx.fillStyle = '#22252a';
    ctx.beginPath();
    ctx.roundRect(4, 10, 24, 16, 4);
    ctx.fill();

    // Body
    ctx.fillStyle = '#585e6b';
    ctx.beginPath();
    ctx.roundRect(5, 11, 22, 14, 3);
    ctx.fill();

    // Facet highlights & shadows
    ctx.fillStyle = '#838b99';
    ctx.fillRect(7, 12, 12, 6);
    ctx.fillRect(8, 18, 6, 4);

    ctx.fillStyle = '#393d45';
    ctx.fillRect(19, 16, 7, 8);
    ctx.fillRect(10, 23, 15, 2);

    ctx.restore();
  }

  // --- CUTAWAY BUILDINGS (Matching Image 4) ---

  drawTavern(ctx, x, y, w, h, time = 0) {
    // 4x3 tiles (128 x 96 px)
    const px = x;
    const py = y;

    // Foundation and outer stone walls with dark outline
    ctx.fillStyle = '#1c140f'; // dark outline
    ctx.fillRect(px, py, w, h);

    // Stone walls
    ctx.fillStyle = '#545b68';
    ctx.fillRect(px + 2, py + 2, w - 4, h - 4);

    // Cutaway Interior: Wood floorboards
    ctx.fillStyle = '#8f572a';
    ctx.fillRect(px + 8, py + 8, w - 16, h - 16);

    // Wood plank lines
    ctx.fillStyle = '#6e401c';
    for (let row = py + 8; row < py + h - 16; row += 10) {
      ctx.fillRect(px + 8, row, w - 16, 1);
    }

    // Fireplace & Chimney (Top Left)
    ctx.fillStyle = '#343840';
    ctx.fillRect(px + 12, py + 4, 28, 20);
    // Hearth opening
    ctx.fillStyle = '#141416';
    ctx.fillRect(px + 16, py + 10, 20, 14);
    // Animated glowing fire
    const flicker = Math.sin(time * 12) * 2;
    ctx.fillStyle = '#e64a19';
    ctx.fillRect(px + 18, py + 14 - flicker, 16, 10 + flicker);
    ctx.fillStyle = '#ffb300';
    ctx.fillRect(px + 20, py + 16 - flicker, 12, 6 + flicker);
    ctx.fillStyle = '#fff9c4';
    ctx.fillRect(px + 23, py + 18, 6, 3);

    // Tavern Bar Counter (Top Center to Right)
    ctx.fillStyle = '#522e15';
    ctx.fillRect(px + 48, py + 16, 60, 10);
    ctx.fillStyle = '#7a4623';
    ctx.fillRect(px + 48, py + 14, 60, 4);

    // Ale Steins / Mugs on Bar
    ctx.fillStyle = '#f5c042';
    ctx.fillRect(px + 54, py + 10, 4, 5);
    ctx.fillRect(px + 72, py + 10, 4, 5);
    ctx.fillRect(px + 90, py + 10, 4, 5);
    ctx.fillStyle = '#ffffff'; // foam
    ctx.fillRect(px + 54, py + 9, 4, 2);
    ctx.fillRect(px + 72, py + 9, 4, 2);
    ctx.fillRect(px + 90, py + 9, 4, 2);

    // Tavern Tables & Stools
    const tables = [
      { tx: px + 28, ty: py + 48 },
      { tx: px + 76, ty: py + 48 }
    ];

    for (const t of tables) {
      // Table shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(t.tx + 12, t.ty + 18, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Table round top
      ctx.fillStyle = '#3c200c';
      ctx.beginPath();
      ctx.ellipse(t.tx + 12, t.ty + 10, 13, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6a3c1a';
      ctx.beginPath();
      ctx.ellipse(t.tx + 12, t.ty + 9, 11, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ale mug on table
      ctx.fillStyle = '#e8b030';
      ctx.fillRect(t.tx + 10, t.ty + 4, 3, 4);
      ctx.fillStyle = '#fff';
      ctx.fillRect(t.tx + 10, t.ty + 3, 3, 1);

      // Stools
      ctx.fillStyle = '#542d13';
      ctx.fillRect(t.tx - 4, t.ty + 10, 6, 6);
      ctx.fillRect(t.tx + 22, t.ty + 10, 6, 6);
    }

    // Stairs to Upper Floor (Right side)
    ctx.fillStyle = '#42240e';
    for (let s = 0; s < 5; s++) {
      ctx.fillRect(px + w - 24, py + 12 + (s * 4), 14, 3);
      ctx.fillStyle = '#6b3c1b';
      ctx.fillRect(px + w - 24, py + 12 + (s * 4), 14, 1);
    }

    // Tavern Signboard & Entrance (Bottom)
    ctx.fillStyle = '#1c140f';
    ctx.fillRect(px + 52, py + h - 8, 24, 8); // doorway
  }

  drawBlacksmith(ctx, x, y, w, h, time = 0) {
    // 3x3 tiles (96 x 96 px)
    const px = x;
    const py = y;

    // Dark outline
    ctx.fillStyle = '#1a1816';
    ctx.fillRect(px, py, w, h);

    // Stone walls
    ctx.fillStyle = '#4f5561';
    ctx.fillRect(px + 2, py + 2, w - 4, h - 4);

    // Cutaway Stone floor
    ctx.fillStyle = '#6c7380';
    ctx.fillRect(px + 6, py + 6, w - 12, h - 12);

    // The Forge Oven (Center Top)
    ctx.fillStyle = '#2b2f38';
    ctx.fillRect(px + 30, py + 8, 36, 26);
    // Glowing red fiery interior
    const glow = Math.sin(time * 10) * 3;
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(px + 36, py + 14, 24, 18);
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(px + 38, py + 16 - glow, 20, 14 + glow);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(px + 42, py + 19, 12, 8);

    // Chimney atop forge
    ctx.fillStyle = '#1e2026';
    ctx.fillRect(px + 40, py - 4, 16, 12);

    // Anvil (Center)
    ctx.fillStyle = '#1f242e';
    ctx.beginPath();
    ctx.moveTo(px + 42, py + 48);
    ctx.lineTo(px + 54, py + 48);
    ctx.lineTo(px + 58, py + 54);
    ctx.lineTo(px + 52, py + 58);
    ctx.lineTo(px + 44, py + 58);
    ctx.lineTo(px + 38, py + 54);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#626d7f'; // horn highlight
    ctx.fillRect(px + 43, py + 48, 10, 3);

    // Weapon Rack on Left Wall
    ctx.fillStyle = '#3c200c';
    ctx.fillRect(px + 8, py + 18, 6, 28);
    ctx.fillStyle = '#b4bcc9'; // swords
    ctx.fillRect(px + 10, py + 20, 2, 24);
    ctx.fillRect(px + 12, py + 22, 2, 20);

    // Water Quench Trough (Right Wall)
    ctx.fillStyle = '#3c2415';
    ctx.fillRect(px + w - 24, py + 24, 16, 22);
    ctx.fillStyle = '#2980b9'; // water
    ctx.fillRect(px + w - 22, py + 26, 12, 18);
  }

  drawWatchtower(ctx, x, y, w, h) {
    // 2x2 tiles (64 x 64 px)
    const px = x;
    const py = y;

    // Heavy Timber corner posts
    ctx.fillStyle = '#3a1f0d';
    ctx.fillRect(px + 10, py + 16, 6, 44);
    ctx.fillRect(px + w - 16, py + 16, 6, 44);

    // Cross braces
    ctx.strokeStyle = '#5a3418';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px + 12, py + 24);
    ctx.lineTo(px + w - 12, py + 54);
    ctx.moveTo(px + w - 12, py + 24);
    ctx.lineTo(px + 12, py + 54);
    ctx.stroke();

    // Wooden ladder
    ctx.fillStyle = '#6a3c1c';
    ctx.fillRect(px + 28, py + 22, 2, 38);
    ctx.fillRect(px + 34, py + 22, 2, 38);
    for (let r = py + 26; r < py + 58; r += 6) {
      ctx.fillRect(px + 28, r, 8, 2);
    }

    // Elevated Guard Platform
    ctx.fillStyle = '#241306';
    ctx.fillRect(px + 4, py + 12, w - 8, 6);
    ctx.fillStyle = '#7a4622';
    ctx.fillRect(px + 5, py + 13, w - 10, 4);

    // Railing
    ctx.fillStyle = '#42240e';
    ctx.fillRect(px + 4, py + 6, w - 8, 2);
    ctx.fillRect(px + 6, py + 6, 2, 6);
    ctx.fillRect(px + w - 8, py + 6, 2, 6);
    ctx.fillRect(px + 31, py + 6, 2, 6);

    // Roof Canopy
    ctx.fillStyle = '#1c0f05';
    ctx.beginPath();
    ctx.moveTo(px + w / 2, py - 12);
    ctx.lineTo(px + 2, py + 4);
    ctx.lineTo(px + w - 2, py + 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#8a4e25';
    ctx.beginPath();
    ctx.moveTo(px + w / 2, py - 10);
    ctx.lineTo(px + 4, py + 3);
    ctx.lineTo(px + w - 4, py + 3);
    ctx.closePath();
    ctx.fill();

    // Kingdom Green Banner hanging
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(px + 14, py + 18, 8, 14);
    ctx.fillStyle = '#f1c40f'; // crest
    ctx.fillRect(px + 16, py + 22, 4, 4);
  }

  drawLumberCamp(ctx, x, y, w, h) {
    // 3x2 tiles (96 x 64 px)
    const px = x;
    const py = y;

    // Ground sawdust
    ctx.fillStyle = '#d4aa63';
    ctx.beginPath();
    ctx.ellipse(px + w / 2, py + h / 2, 38, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Timber Shelter Posts
    ctx.fillStyle = '#4a2912';
    ctx.fillRect(px + 12, py + 10, 5, 36);
    ctx.fillRect(px + 56, py + 10, 5, 36);

    // Saw Table with Circular Saw Blade
    ctx.fillStyle = '#6a3c1a';
    ctx.fillRect(px + 22, py + 24, 28, 14);
    // Iron Saw blade
    ctx.fillStyle = '#bdc3c7';
    ctx.beginPath();
    ctx.arc(px + 36, py + 22, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7f8c8d';
    ctx.beginPath();
    ctx.arc(px + 36, py + 22, 3, 0, Math.PI * 2);
    ctx.fill();

    // Stacked Timber Logs (Right)
    const logs = [
      { lx: px + 68, ly: py + 28 },
      { lx: px + 78, ly: py + 28 },
      { lx: px + 73, ly: py + 20 }
    ];
    for (const log of logs) {
      ctx.fillStyle = '#4a2912';
      ctx.beginPath();
      ctx.ellipse(log.lx, log.ly, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d79e5b';
      ctx.beginPath();
      ctx.ellipse(log.lx, log.ly, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawFarm(ctx, x, y, w, h) {
    // 2x2 tiles (64 x 64 px)
    const px = x;
    const py = y;

    // Tilled Soil Rows
    ctx.fillStyle = '#5c3818';
    ctx.fillRect(px + 4, py + 4, w - 8, h - 8);

    for (let r = py + 8; r < py + h - 8; r += 12) {
      ctx.fillStyle = '#3c220c';
      ctx.fillRect(px + 6, r, w - 12, 3);

      // Carrots / Wheat alternating
      for (let c = px + 10; c < px + w - 10; c += 10) {
        // Carrot greens
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(c, r - 3, 4, 3);
        // Orange carrot top
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(c + 1, r, 2, 2);
      }
    }

    // Wooden Fence Border
    ctx.fillStyle = '#523016';
    ctx.fillRect(px + 2, py + 2, w - 4, 3);
    ctx.fillRect(px + 2, py + h - 5, w - 4, 3);
    ctx.fillRect(px + 2, py + 2, 3, h - 4);
    ctx.fillRect(px + w - 5, py + 2, 3, h - 4);
  }

  drawWall(ctx, x, y, size) {
    // Modular Palisade / Stone Wall segment
    ctx.fillStyle = '#22262d';
    ctx.fillRect(x + 4, y, size - 8, size);

    // Stone texture
    ctx.fillStyle = '#585f6d';
    ctx.fillRect(x + 5, y + 1, size - 10, size - 2);

    // Crenellation / battlement on top
    ctx.fillStyle = '#7a8291';
    ctx.fillRect(x + 6, y + 1, 6, 8);
    ctx.fillRect(x + 18, y + 1, 6, 8);

    // Mortar lines
    ctx.fillStyle = '#383d47';
    ctx.fillRect(x + 5, y + 12, size - 10, 1);
    ctx.fillRect(x + 5, y + 22, size - 10, 1);
  }

  drawStreetLamp(ctx, x, y, time = 0) {
    // Hanging lantern post
    ctx.fillStyle = '#3c2210';
    ctx.fillRect(x + 14, y + 6, 4, 26);
    ctx.fillRect(x + 14, y + 6, 12, 3);

    // Hanging glass lantern
    ctx.fillStyle = '#1c150e';
    ctx.fillRect(x + 22, y + 9, 6, 9);

    // Warm amber glowing core
    const pulse = Math.sin(time * 5) * 0.15 + 0.85;
    ctx.fillStyle = `rgba(255, 193, 7, ${pulse})`;
    ctx.fillRect(x + 23, y + 11, 4, 5);
  }

  // --- CHARACTERS & ANIMATIONS ---

  drawHero(ctx, x, y, state = 'idle', dir = 'down', frame = 0, tool = 'axe') {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    // Green reticle / selection ring under feet (Matching reference scene)
    ctx.strokeStyle = '#4cd964';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 8, 12, 5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Shadow under character
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 7, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = state === 'walk' ? (Math.sin(frame * Math.PI * 2) * 1.5) : (Math.sin(frame * Math.PI) * 0.5);
    const py = bob;

    // Authentic PixelLab Generated 32x32 Hero Sprite
    const img = this.heroSprites[dir] || this.heroSprites.down;
    if (img && img.complete && img.naturalWidth > 0) {
      // Draw PixelLab crisp sprite centered horizontally (-16), feet aligned to y + 6 (-26)
      ctx.drawImage(img, -16, -26 + py, 32, 32);

      // Tool / Weapon swing animation
      if (state === 'swing') {
        ctx.save();
        const swingDir = (dir === 'left') ? -1 : 1;
        ctx.translate(swingDir * 8, -6 + py);
        ctx.rotate(swingDir * ((frame * Math.PI) - Math.PI / 3));

        // Handle
        ctx.fillStyle = '#6d421e';
        ctx.fillRect(0, -12, 3, 16);

        if (tool === 'axe') {
          // Steel Axe head
          ctx.fillStyle = '#b8c2cc';
          ctx.beginPath();
          ctx.moveTo(3, -12);
          ctx.lineTo(12, -16);
          ctx.lineTo(10, -6);
          ctx.closePath();
          ctx.fill();
        } else {
          // Sword blade
          ctx.fillStyle = '#cfd7e0';
          ctx.fillRect(-1, -20, 5, 14);
          ctx.fillStyle = '#f1c40f'; // guard
          ctx.fillRect(-3, -6, 9, 2);
        }
        ctx.restore();
      }

      ctx.restore();
      return;
    }

    // Procedural Fallback while images are loading
    ctx.fillStyle = '#161917';
    ctx.fillRect(-7, -10 + py, 14, 15);
    ctx.fillStyle = '#2e8b38';
    ctx.fillRect(-6, -9 + py, 12, 13);
    ctx.fillStyle = '#5c3314';
    ctx.fillRect(-6, -2 + py, 12, 3);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(-2, -2 + py, 4, 3);
    ctx.fillStyle = '#42240e';
    ctx.fillRect(-5, 4, 4, 4);
    ctx.fillRect(1, 4, 4, 4);
    ctx.fillStyle = '#1c1b18';
    ctx.beginPath();
    ctx.roundRect(-9, -24 + py, 18, 16, 5);
    ctx.fill();
    ctx.fillStyle = '#fcd0a1';
    ctx.beginPath();
    ctx.roundRect(-8, -23 + py, 16, 14, 4);
    ctx.fill();
    ctx.fillStyle = '#f5c542';
    ctx.beginPath();
    ctx.roundRect(-9, -25 + py, 18, 9, [5, 5, 0, 0]);
    ctx.fill();
    ctx.fillRect(-8, -17 + py, 4, 3);
    ctx.fillRect(4, -17 + py, 4, 3);
    ctx.fillStyle = '#1c1712';
    if (dir === 'left') {
      ctx.fillRect(-6, -18 + py, 2, 3);
    } else if (dir === 'right') {
      ctx.fillRect(4, -18 + py, 2, 3);
    } else if (dir === 'down') {
      ctx.fillRect(-4, -18 + py, 2, 3);
      ctx.fillRect(2, -18 + py, 2, 3);
    }
    ctx.restore();
  }

  drawVillager(ctx, x, y, role = 'lumberjack', dir = 'down', frame = 0) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 7, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = Math.sin(frame * Math.PI * 2) * 1.2;
    const py = bob;

    // Body based on occupation role
    let tunicColor = '#3a6ea5'; // default blue
    let hatColor = '#d4aa63';

    if (role === 'lumberjack') {
      tunicColor = '#4169e1'; // blue overalls
      hatColor = '#deb887';   // straw hat
    } else if (role === 'farmer') {
      tunicColor = '#8b5a2b';
      hatColor = '#e5c158';
    } else if (role === 'blacksmith') {
      tunicColor = '#4a4e58';
      hatColor = '#c0392b';   // red bandana
    } else if (role === 'archer') {
      tunicColor = '#2e7d32'; // forest green
      hatColor = '#1b5e20';
    } else if (role === 'swordsman') {
      tunicColor = '#5d6d7e'; // chainmail / iron
      hatColor = '#7f8c8d';   // kettle helmet
    }

    // Tunic
    ctx.fillStyle = '#1a1816';
    ctx.fillRect(-6, -9 + py, 12, 14);
    ctx.fillStyle = tunicColor;
    ctx.fillRect(-5, -8 + py, 10, 12);

    // Boots
    ctx.fillStyle = '#3c220f';
    ctx.fillRect(-4, 4, 3, 4);
    ctx.fillRect(1, 4, 3, 4);

    // Head
    ctx.fillStyle = '#1c1b18';
    ctx.beginPath();
    ctx.roundRect(-8, -22 + py, 16, 14, 4);
    ctx.fill();

    // Skin
    ctx.fillStyle = '#f8cf9e';
    ctx.beginPath();
    ctx.roundRect(-7, -21 + py, 14, 12, 3);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#221a14';
    ctx.fillRect(-3, -16 + py, 2, 2);
    ctx.fillRect(1, -16 + py, 2, 2);

    // Hat / Helmet / Accessory
    ctx.fillStyle = hatColor;
    ctx.fillRect(-8, -24 + py, 16, 6);

    // Special NPC props
    if (role === 'maid') {
      // White bonnet
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-7, -24 + py, 14, 5);
      // Carrying beer steins on a tray
      ctx.fillStyle = '#7a4623';
      ctx.fillRect(6, -8 + py, 10, 2); // tray
      ctx.fillStyle = '#f5c042'; // beer
      ctx.fillRect(7, -13 + py, 3, 5);
      ctx.fillRect(12, -13 + py, 3, 5);
      ctx.fillStyle = '#ffffff'; // foam
      ctx.fillRect(7, -14 + py, 3, 1);
      ctx.fillRect(12, -14 + py, 3, 1);
    } else if (role === 'scholar') {
      // Hooded scholar with open parchment map
      ctx.fillStyle = '#eedcbe';
      ctx.fillRect(-5, -6 + py, 10, 7);
      ctx.fillStyle = '#8c5e32'; // map markings
      ctx.fillRect(-3, -4 + py, 6, 1);
      ctx.fillRect(-3, -2 + py, 4, 1);
    } else if (role === 'sparring') {
      // Sparring sword and round shield
      ctx.fillStyle = '#bdc3c7';
      ctx.fillRect(6, -12 + py, 2, 10);
      ctx.fillStyle = '#8b5a2b';
      ctx.beginPath();
      ctx.ellipse(-7, -4 + py, 4, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // --- LIVESTOCK ANIMALS ---

  drawCow(ctx, x, y, frame = 0) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = Math.sin(frame * Math.PI * 2) * 0.8;

    // Body (White with black dairy patches)
    ctx.fillStyle = '#1c1b18'; // outline
    ctx.beginPath();
    ctx.roundRect(-14, -8 + bob, 28, 16, 4);
    ctx.fill();

    ctx.fillStyle = '#f5f5f5'; // white body
    ctx.beginPath();
    ctx.roundRect(-13, -7 + bob, 26, 14, 3);
    ctx.fill();

    // Black spots
    ctx.fillStyle = '#222326';
    ctx.fillRect(-8, -6 + bob, 7, 6);
    ctx.fillRect(4, -4 + bob, 6, 8);
    ctx.fillRect(-3, 0 + bob, 5, 5);

    // Legs
    ctx.fillStyle = '#e6e6e6';
    ctx.fillRect(-10, 7, 3, 5);
    ctx.fillRect(-5, 7, 3, 5);
    ctx.fillRect(4, 7, 3, 5);
    ctx.fillRect(8, 7, 3, 5);
    // Hooves
    ctx.fillStyle = '#3c220f';
    ctx.fillRect(-10, 11, 3, 2);
    ctx.fillRect(-5, 11, 3, 2);
    ctx.fillRect(4, 11, 3, 2);
    ctx.fillRect(8, 11, 3, 2);

    // Head
    ctx.fillStyle = '#1c1b18';
    ctx.beginPath();
    ctx.roundRect(8, -14 + bob, 12, 12, 3);
    ctx.fill();
    ctx.fillStyle = '#f5f5f5';
    ctx.beginPath();
    ctx.roundRect(9, -13 + bob, 10, 10, 2);
    ctx.fill();

    // Pink muzzle
    ctx.fillStyle = '#f5b7b1';
    ctx.fillRect(15, -9 + bob, 5, 6);

    // Horns
    ctx.fillStyle = '#d4ac0d';
    ctx.fillRect(10, -16 + bob, 2, 3);
    ctx.fillRect(14, -16 + bob, 2, 3);

    // Eye
    ctx.fillStyle = '#1c1b18';
    ctx.fillRect(12, -11 + bob, 2, 2);

    ctx.restore();
  }

  drawSheep(ctx, x, y, frame = 0) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 6, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = Math.sin(frame * Math.PI * 2) * 0.6;

    // Fluffy wool body
    ctx.fillStyle = '#222326'; // outline
    ctx.beginPath();
    ctx.arc(0, bob, 9, 0, Math.PI * 2);
    ctx.arc(-5, bob, 7, 0, Math.PI * 2);
    ctx.arc(5, bob, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, bob, 8, 0, Math.PI * 2);
    ctx.arc(-5, bob, 6, 0, Math.PI * 2);
    ctx.arc(5, bob, 6, 0, Math.PI * 2);
    ctx.fill();

    // Head (Beige/tan)
    ctx.fillStyle = '#d7ccc8';
    ctx.beginPath();
    ctx.roundRect(6, -5 + bob, 7, 7, 2);
    ctx.fill();
    ctx.fillStyle = '#222326';
    ctx.fillRect(10, -3 + bob, 1.5, 1.5);

    // Legs
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(-4, 5, 2, 4);
    ctx.fillRect(3, 5, 2, 4);

    ctx.restore();
  }

  drawChicken(ctx, x, y, frame = 0) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    const peck = (Math.sin(frame * Math.PI * 4) > 0.5) ? 2 : 0;

    // Body
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Red comb & yellow beak
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(2, -6 + peck, 2, 3);
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(5, -3 + peck, 3, 2);

    // Eye
    ctx.fillStyle = '#000';
    ctx.fillRect(3, -4 + peck, 1, 1);

    // Legs
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(-1, 3, 1, 3);
    ctx.fillRect(2, 3, 1, 3);

    ctx.restore();
  }

  // --- SPECIAL PROPS & TRAINING GROUNDS ---

  drawArcheryTarget(ctx, x, y) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    // Wooden Tripod Legs
    ctx.strokeStyle = '#5a3418';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-7, 14);
    ctx.moveTo(0, 0);
    ctx.lineTo(7, 14);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 15);
    ctx.stroke();

    // Red & White Bullseye Rings
    const rings = [
      { r: 9, col: '#e74c3c' },
      { r: 7, col: '#ffffff' },
      { r: 5, col: '#e74c3c' },
      { r: 3, col: '#ffffff' },
      { r: 1.5, col: '#f1c40f' }
    ];

    for (const rg of rings) {
      ctx.fillStyle = rg.col;
      ctx.beginPath();
      ctx.arc(0, -4, rg.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawTrainingDummy(ctx, x, y) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    // Wooden base pole
    ctx.fillStyle = '#4a2b13';
    ctx.fillRect(-2, 4, 4, 12);

    // Straw body
    ctx.fillStyle = '#d4aa63';
    ctx.beginPath();
    ctx.roundRect(-7, -8, 14, 14, 3);
    ctx.fill();

    // Straw head
    ctx.beginPath();
    ctx.arc(0, -13, 5, 0, Math.PI * 2);
    ctx.fill();

    // Cross wooden arms
    ctx.fillStyle = '#5c3517';
    ctx.fillRect(-12, -4, 24, 3);

    // Target stitches / face
    ctx.fillStyle = '#3a200d';
    ctx.fillRect(-2, -14, 1.5, 1.5);
    ctx.fillRect(1, -14, 1.5, 1.5);
    ctx.fillRect(-1, -11, 3, 1);

    ctx.restore();
  }

  drawScarecrow(ctx, x, y) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    // Wood post
    ctx.fillStyle = '#5c3314';
    ctx.fillRect(-2, -4, 4, 22);
    ctx.fillRect(-14, -8, 28, 3);

    // Tattered tunic
    ctx.fillStyle = '#3a6ea5';
    ctx.fillRect(-6, -8, 12, 12);

    // Straw head & floppy hat
    ctx.fillStyle = '#e5c158';
    ctx.beginPath();
    ctx.arc(0, -12, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#8c5529'; // hat brim
    ctx.fillRect(-9, -16, 18, 3);
    ctx.fillRect(-5, -21, 10, 5);

    ctx.restore();
  }

  drawStoneWell(ctx, x, y) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Circular stone well body
    ctx.fillStyle = '#2c3038';
    ctx.beginPath();
    ctx.ellipse(0, 6, 13, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5a6270';
    ctx.beginPath();
    ctx.ellipse(0, 5, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Water opening
    ctx.fillStyle = '#1c2833';
    ctx.beginPath();
    ctx.ellipse(0, 4, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden roof supports & shingles
    ctx.fillStyle = '#543216';
    ctx.fillRect(-10, -10, 2, 14);
    ctx.fillRect(8, -10, 2, 14);

    // Roof
    ctx.fillStyle = '#7a4623';
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(-13, -8);
    ctx.lineTo(13, -8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawHandcart(ctx, x, y, cargo = 'potatoes') {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    // Wheels
    ctx.fillStyle = '#3a200e';
    ctx.beginPath();
    ctx.arc(-7, 8, 5, 0, Math.PI * 2);
    ctx.arc(7, 8, 5, 0, Math.PI * 2);
    ctx.fill();

    // Wooden Cart Bed
    ctx.fillStyle = '#6a3c1c';
    ctx.fillRect(-12, -2, 24, 9);
    ctx.fillStyle = '#8b5228';
    ctx.fillRect(-11, -1, 22, 7);

    // Handle
    ctx.strokeStyle = '#4a2810';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12, 2);
    ctx.lineTo(20, 6);
    ctx.stroke();

    // Cargo
    if (cargo === 'potatoes') {
      ctx.fillStyle = '#d4aa63';
      for (let i = -8; i <= 6; i += 4) {
        ctx.fillRect(i, -5, 4, 4);
      }
    } else {
      // Wood logs
      ctx.fillStyle = '#4a2810';
      ctx.fillRect(-8, -6, 16, 4);
      ctx.fillRect(-6, -9, 12, 4);
    }

    ctx.restore();
  }

  drawCottage(ctx, x, y, w, h) {
    const px = x;
    const py = y;

    // Stone foundation & walls
    ctx.fillStyle = '#1c1b18';
    ctx.fillRect(px, py, w, h);

    ctx.fillStyle = '#5a6270';
    ctx.fillRect(px + 2, py + 2, w - 4, h - 4);

    // Chimney (Top Left)
    ctx.fillStyle = '#383d47';
    ctx.fillRect(px + 8, py - 10, 10, 14);

    // Red clay tiled pitched roof
    ctx.fillStyle = '#b8442e';
    ctx.beginPath();
    ctx.moveTo(px + w / 2, py - 14);
    ctx.lineTo(px - 2, py + 14);
    ctx.lineTo(px + w + 2, py + 14);
    ctx.closePath();
    ctx.fill();

    // Roof tile lines
    ctx.strokeStyle = '#8a2d1c';
    ctx.lineWidth = 1;
    for (let r = py - 8; r < py + 14; r += 5) {
      ctx.beginPath();
      ctx.moveTo(px + 4, r);
      ctx.lineTo(px + w - 4, r);
      ctx.stroke();
    }

    // Wooden door (Bottom center)
    ctx.fillStyle = '#4a2912';
    ctx.fillRect(px + w / 2 - 6, py + h - 14, 12, 14);
    ctx.fillStyle = '#f1c40f'; // brass doorknob
    ctx.fillRect(px + w / 2 + 2, py + h - 7, 2, 2);

    // Glass Windows with wooden frames
    ctx.fillStyle = '#85c1e9';
    ctx.fillRect(px + 10, py + 20, 8, 8);
    ctx.fillRect(px + w - 18, py + 20, 8, 8);
  }

  drawBarn(ctx, x, y, w, h) {
    const px = x;
    const py = y;

    // Dark timber outline
    ctx.fillStyle = '#1b120a';
    ctx.fillRect(px, py, w, h);

    // Barn outer plank walls
    ctx.fillStyle = '#5c3517';
    ctx.fillRect(px + 3, py + 3, w - 6, h - 6);

    // Cutaway Interior: Wood floor with straw
    ctx.fillStyle = '#7a4820';
    ctx.fillRect(px + 6, py + 6, w - 12, h - 12);

    // Hay loft in upper half
    ctx.fillStyle = '#3d200b';
    ctx.fillRect(px + 8, py + 8, w - 16, 26);
    ctx.fillStyle = '#d4aa63'; // golden hay piles
    ctx.fillRect(px + 12, py + 10, w - 24, 20);

    // Animal stalls partitions
    ctx.fillStyle = '#522c10';
    ctx.fillRect(px + 36, py + 34, 4, h - 42);
    ctx.fillRect(px + 68, py + 34, 4, h - 42);

    // Water & Feed Troughs
    ctx.fillStyle = '#3a2211';
    ctx.fillRect(px + 10, py + 42, 18, 8);
    ctx.fillStyle = '#2980b9'; // water
    ctx.fillRect(px + 11, py + 43, 16, 6);

    // Straw bedding on floor
    ctx.fillStyle = '#e5c158';
    ctx.fillRect(px + 44, py + 46, 18, 12);
    ctx.fillRect(px + 76, py + 46, 18, 12);
  }


  drawEnemy(ctx, x, y, type = 'bandit', dir = 'down', frame = 0) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 7, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = Math.sin(frame * Math.PI * 2) * 1.5;
    const py = bob;

    if (type === 'bandit') {
      // Hooded dark rogue with dagger
      ctx.fillStyle = '#1c1e24';
      ctx.fillRect(-6, -9 + py, 12, 14);
      ctx.fillStyle = '#3a3e4a';
      ctx.fillRect(-5, -8 + py, 10, 12);

      // Dark cowl / hood
      ctx.fillStyle = '#1c1e24';
      ctx.beginPath();
      ctx.roundRect(-8, -23 + py, 16, 15, 4);
      ctx.fill();

      // Mask slit & glowing yellow menace eyes
      ctx.fillStyle = '#0f1013';
      ctx.fillRect(-5, -16 + py, 10, 5);
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(-3, -15 + py, 2, 2);
      ctx.fillRect(1, -15 + py, 2, 2);

      // Dagger
      ctx.fillStyle = '#bdc3c7';
      ctx.fillRect(6, -6 + py, 6, 2);
    } else if (type === 'goblin') {
      // Green goblin with bone club
      ctx.fillStyle = '#1a2414';
      ctx.fillRect(-6, -9 + py, 12, 14);
      ctx.fillStyle = '#4a7c2f'; // goblin skin
      ctx.fillRect(-5, -8 + py, 10, 12);

      // Head & pointy ears
      ctx.fillStyle = '#3c6824';
      ctx.beginPath();
      ctx.roundRect(-7, -21 + py, 14, 12, 3);
      ctx.fill();
      // Pointy ears
      ctx.fillRect(-10, -18 + py, 3, 4);
      ctx.fillRect(7, -18 + py, 3, 4);

      // Red eyes
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(-3, -16 + py, 2, 2);
      ctx.fillRect(1, -16 + py, 2, 2);

      // Bone club
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(6, -12 + py, 3, 10);
    } else if (type === 'wolf') {
      // Dark wolf with glowing red eyes
      ctx.fillStyle = '#2c3e50';
      ctx.beginPath();
      ctx.roundRect(-10, -12 + py, 20, 14, 4);
      ctx.fill();

      // Snout
      ctx.fillRect(8, -8 + py, 6, 6);

      // Glowing red eyes
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(6, -10 + py, 2, 2);
    }

    ctx.restore();
  }
}
