// Input Management for Mouse & Keyboard

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = {};
    
    // Mouse state
    this.mouse = {
      screenX: 0,
      screenY: 0,
      worldX: 0,
      worldY: 0,
      tileX: 0,
      tileY: 0,
      isDown: false,
      isRightDown: false,
      justPressed: false,
      justRightPressed: false
    };

    // Movement vector
    this.movement = { x: 0, y: 0 };

    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.screenX = e.clientX - rect.left;
      this.mouse.screenY = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.mouse.isDown = true;
        this.mouse.justPressed = true;
      } else if (e.button === 2) {
        this.mouse.isRightDown = true;
        this.mouse.justRightPressed = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.mouse.isDown = false;
      } else if (e.button === 2) {
        this.mouse.isRightDown = false;
      }
    });

    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  update(camera) {
    // Calculate movement vector from WASD or Arrow Keys
    let dx = 0;
    let dy = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;

    // Normalize diagonal movement
    const len = Math.hypot(dx, dy);
    if (len > 0) {
      this.movement.x = dx / len;
      this.movement.y = dy / len;
    } else {
      this.movement.x = 0;
      this.movement.y = 0;
    }

    // Convert mouse screen coordinates to world coordinates
    if (camera) {
      const worldPos = camera.screenToWorld(this.mouse.screenX, this.mouse.screenY);
      this.mouse.worldX = worldPos.x;
      this.mouse.worldY = worldPos.y;
      this.mouse.tileX = Math.floor(worldPos.x / 32);
      this.mouse.tileY = Math.floor(worldPos.y / 32);
    }
  }

  // Clear single-frame triggers
  endFrame() {
    this.mouse.justPressed = false;
    this.mouse.justRightPressed = false;
  }

  isKeyJustPressed(code) {
    return !!this.keys[code];
  }
}
