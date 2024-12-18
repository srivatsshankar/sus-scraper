class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.gameTime = 10; // 90 seconds
        this.isGameActive = true;
        this.finalHeight = 0;
        // Initialize class properties
        this.shapes = [];
        this.shapeGroups = {};
        // Add message listener
        window.addEventListener('message', (event) => {
            // console.log('Message received in MenuScene:', event.data);
            
            const { type, data } = event.data;
            if (type === 'devvit-message') {
                // console.log('Devvit message:', data);
                const { message } = data;
                
                if (message.type === 'initialData') {
                    // console.log('Initial data received:', message.data);
                    // Store data for game use
                    this.shapes = message.data.shapes;
                    this.shapeGroups = message.data.shapeGroups;
                }
            }
        });
        window.parent.postMessage({ type: 'initialData' }, '*');
    }

    preload() {
        // Shapes
        this.load.image('rectangle', '/assets/images/rectangle.png');
        this.load.image('triangle', '/assets/images/triangle.png');
        this.load.image('rightTriangle', '/assets/images/right-triangle.png');
        this.load.image('circle', '/assets/images/circle.png');
        this.load.image('square', '/assets/images/square.png');
        this.load.image('trapezoid', '/assets/images/trapezoid.png');
        this.load.image('rhombus', '/assets/images/rhombus.png');

        // Floor
        this.load.image('ground', '/assets/images/ground.png');
        this.load.image('ground-particles-1', '/assets/images/ground-particles-1.png');
        this.load.image('ground-particles-2', '/assets/images/ground-particles-2.png');
        this.load.image('ground-particles-3', '/assets/images/ground-particles-3.png');

        // Rocks
        this.load.image('rock', '/assets/images/rock.png');
        this.load.image('rock-3', '/assets/images/rock-3.png');
        this.load.image('rock-4', '/assets/images/rock-4.png');

        // Particles
        this.load.image('particle', '/assets/images/particle.png');
        this.load.image('brick', 'assets/images/brick.png');

        // Background
        for (let i = 1; i <= 8; i++) {
            this.load.image(`bg${i}`, `/assets/images/bg/bg${i}.jpeg`);
        } 
        
        // Load all skyline images
        for (let i = 1; i <= 12; i++) {
            this.load.image(`skyline${i}`, `/assets/images/skylines/skyline-${i}.png`);
        }   

    }

    // Menu icons
    createShapePreview(type, x, y) {
        const previewSize = 40; // Increased from 30
        let preview;
        
        switch (type) {
            case 'square':
                preview = this.add.image(x, y, 'square');
                break;
            case 'rectangle':
                preview = this.add.image(x, y, 'rectangle');
                break;
            case 'circle':
                preview = this.add.image(x, y, 'circle');
                break;
            case 'triangle':
                preview = this.add.image(x, y, 'triangle');
                break;
            case 'rightTriangle':
                preview = this.add.image(x, y, 'rightTriangle');
                break;
            case 'trapezoid':
                preview = this.add.image(x, y, 'trapezoid');
                break;
            case 'rhombus':
                preview = this.add.image(x, y, 'rhombus');
                break;
        }
        return preview;
    }

    // Exit confirmation dialog
    // Show exit confirmation dialog
    // Function to pause the timer
    pauseTimer() {
        if (this.countdownTimer) {
            this.countdownTimer.paused = true;
        }
    }

    // Function to resume the timer
    resumeTimer() {
        if (this.countdownTimer) {
            this.countdownTimer.paused = false;
        }
    }

    // Function to show exit confirmation
    showExitConfirmation() {
        // Pause Matter.js physics
        this.matter.world.pause();

        // Add input blocker
        this.inputBlocker = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0)
        .setOrigin(0)
        .setInteractive()
        .setDepth(1000);

        // Prevent input on underlying shapes
        this.inputBlocker.on('pointerdown', () => { /* Do nothing */ });

        this.confirmBox = this.add.container(360, 200).setScrollFactor(0).setDepth(1001); // Above inputBlocker
    
        const background = this.add.rectangle(0, 0, 300, 200, 0x000000, 0.8);
        const confirmText = this.add.text(0, -20, 'Return to Main Menu?', {
            fontFamily: '"Carrier Command", monospace',
            fontSize: '16px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
    
        const yesButton = this.add.text(-80, 30, 'Yes', {
            fontFamily: '"Carrier Command", monospace',
            fontSize: '14px',
            fill: '#00ff00',
            align: 'center',
            backgroundColor: '#ffffff',
            padding: { x: 10, y: 5 }
        }).setInteractive().on('pointerdown', () => {
            this.resetTimer();
            this.scene.start('MenuScene');
        });
    
        const noButton = this.add.text(30, 30, 'No', {
            fontFamily: '"Carrier Command", monospace',
            fontSize: '14px',
            fill: '#ff0000',
            align: 'center',
            backgroundColor: '#ffffff',
            padding: { x: 10, y: 5 }
        }).setInteractive().on('pointerdown', () => {
            this.confirmBox.destroy();
            this.inputBlocker.destroy();
            this.matter.world.resume();
            this.resumeTimer();
        });
    
        // Add hover effects for navigation buttons
        [yesButton, noButton].forEach(button => {
            button.on('pointerover', () => button.setTint(0x0000ff));
            button.on('pointerout', () => button.clearTint());
        });
    
        this.confirmBox.add([background, confirmText, yesButton, noButton]);
    }

    // Function to reset the timer
    resetTimer() {
        this.gameTime = 90; // Define INITIAL_GAME_TIME appropriately
        this.timerText.setText(`Time: ${this.gameTime}`);
    }

    create() {
        // Randomly select background
        const bgCount = 8; // number of bg images
        const randomBgNum = Phaser.Math.Between(1, bgCount);
        
        // Create background with random image
        this.bg = this.add.image(400, 300, `bg${randomBgNum}`)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(-3);

        // Fit background to screen
        this.bg.setDisplaySize(900, 675);

        // Randomly select 3 unique skyline images
        const skylineNumbers = Phaser.Utils.Array.Shuffle([1,2,3,4,5,6,7,8,9,10,11,12]).slice(0,3);

        // Create skyline layers
        let skylineTweens = [];
        this.parallaxEnabled = false;

        this.skylines = skylineNumbers.map((num, index) => {
            const skyline = this.add.image(400, 600, `skyline${num}`)
                .setOrigin(0.5)
                .setScrollFactor(0)
                .setDepth(-2 + index)
                .setTint(0xffffff);
            
            skyline.setDisplaySize(900, 675);
            
            // Store tween reference
            const tween = this.tweens.add({
                targets: skyline,
                y: 300,
                duration: 2000,
                ease: 'Cubic.easeOut',
                delay: index * 200,
                onComplete: () => {
                    // Check if this is the last tween
                    if (index === skylineNumbers.length - 1) {
                        this.parallaxEnabled = true;
                    }
                }
            });
            
            skylineTweens.push(tween);
            return skyline;
        });

        // Update parallax effect
        this.input.on('pointermove', (pointer) => {
            if (!this.parallaxEnabled) return;
            
            const centerX = this.cameras.main.width / 2;
            const centerY = this.cameras.main.height / 2;
            
            const moveFactorX = (pointer.x - centerX) / centerX;
            const moveFactorY = (pointer.y - centerY) / centerY;
            
            // Move background slightly
            this.bg.x = 400 + (moveFactorX * 7);
            this.bg.y = 300 + (moveFactorY * 7);
            
            // Move skylines with increasing intensity
            this.skylines.forEach((skyline, index) => {
                const intensity = (index + 1) * 8;
                skyline.x = 400 + (moveFactorX * intensity);
                skyline.y = 300 + (moveFactorY * intensity);
            });
        });

        // Create parallax floor layers
        const floorWidth = 800;
        const floorY = 580;
        const floorHeight = 40;

        // Brown background rectangle for floor
        this.floorBg = this.add.rectangle(400, floorY, floorWidth, floorHeight, 0x8B4513)
            .setOrigin(0.5, 0.5)
            .setDepth(-1);

        // Base ground layer (backmost)
        this.groundBase = this.add.tileSprite(400, floorY, floorWidth, floorHeight, 'ground')
            .setOrigin(0.5, 0.5)
            .setDepth(0);

        // Particle layers
        this.particleLayer1 = this.add.tileSprite(400, floorY, floorWidth, floorHeight, 'ground-particles-1')
            .setOrigin(0.5, 0.5)
            .setDepth(1)
            .setAlpha(0.7);

        this.particleLayer2 = this.add.tileSprite(400, floorY, floorWidth, floorHeight, 'ground-particles-2')
            .setOrigin(0.5, 0.5)
            .setDepth(2)
            .setAlpha(0.7);

        this.particleLayer3 = this.add.tileSprite(400, floorY, floorWidth, floorHeight, 'ground-particles-3')
            .setOrigin(0.5, 0.5)
            .setDepth(3)
            .setAlpha(0.7);

        // Track mouse movement
        this.input.on('pointermove', (pointer) => {
            const centerX = this.cameras.main.width / 2;
            const centerY = this.cameras.main.height / 2;
            const moveFactorX = (pointer.x - centerX) / centerX;
            const moveFactorY = (pointer.y - centerY) / centerY;

            // Apply different movement speeds to each layer for both X and Y
            this.particleLayer1.tilePositionX = -moveFactorX * 14;
            this.particleLayer1.tilePositionY = -moveFactorY * 4;

            this.particleLayer2.tilePositionX = -moveFactorX * 16;
            this.particleLayer2.tilePositionY = -moveFactorY * 6;

            this.particleLayer3.tilePositionX = -moveFactorX * 10;
            this.particleLayer3.tilePositionY = -moveFactorY * 2;
        });

        // Create floor physics body
        this.matter.add.rectangle(400, 580, 800, 40, {
            isStatic: true,
            restitution: 0.5,
            friction: 0.5,
            render: {
                visible: false
            }
        });

        // Add invisible left wall (1px wide)
        this.matter.add.rectangle(0, 300, 1, 1200, {
            isStatic: true,
            restitution: 0.5,
            friction: 0.5,
            render: {
            visible: false
            }
        });

        // Add invisible right wall (1px wide)
        this.matter.add.rectangle(800, 300, 1, 1200, {
            isStatic: true,
            restitution: 0.5,
            friction: 0.5,
            render: {
            visible: false
            }
        });

        // Add decorative rocks
        const rockTextures = ['rock', 'rock-3', 'rock-4'];
        const numRocks = Phaser.Math.Between(3, 4);
        const floorLevel = 580; // Slightly above floor level
        
        // Generate random positions ensuring rocks don't overlap
        const usedPositions = [];
        for (let i = 0; i < numRocks; i++) {
            let x;
            do {
                x = Phaser.Math.Between(50, 750);
            } while (usedPositions.some(pos => Math.abs(pos - x) < 50));
            
            usedPositions.push(x);
            
            const randomRock = Phaser.Utils.Array.GetRandom(rockTextures);
            
            // Create glow effect
            const glow = this.add.image(x, floorLevel, randomRock)
                .setDepth(3)
                .setOrigin(0.5, 1)
                .setTint(0xffaa00)
                .setAlpha(0.2)
                .setScale(1.1);
        
            // Create rock with darker tint
            const rock = this.add.image(x, floorLevel, randomRock)
                .setDepth(4)
                .setOrigin(0.5, 1)
                .setTint(0x666666); // Add darker tint
        
            // Add glow animation
            this.tweens.add({
                targets: glow,
                alpha: { from: 0.1, to: 0.3 },
                scale: { from: 1.1, to: 1.15 },
                duration: 1500,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        }

        // Impact Animation
        this.activeShapes = [];
        this.impactEmitter = this.add.particles(0, 0, 'particle', {
            speed: { min: 50, max: 150 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 300,
            quantity: 25,
            active: false,
        });

        // Shape generator goes here
        // 1. Setup shape configuration
        const shapeTypes = ['square', 'rectangle', 'rhombus', 'trapezoid', 'triangle', 'rightTriangle', 'circle'];
        const shapes = JSON.parse(this.shapes);
        const shapeGroups = JSON.parse(this.shapeGroups);
        
        // 2. Generate random shapes
        // const numShapes = Phaser.Math.Between(9, 16);
        // for (let i = 0; i < numShapes; i++) {
        //     const type = Phaser.Utils.Array.GetRandom(shapeTypes);
        //     const size = Phaser.Math.Between(30, 50);
        //     shapes.push({ type, size });
            
        //     if (!shapeGroups[type]) {
        //         shapeGroups[type] = { count: 0 };
        //     }
        //     shapeGroups[type].count++;
        // }

        // 3. Create menu UI
        const menuWidth = 75;  // narrower width
        const menuHeight = 400; // taller height
        const menuX = 10;
        const menuY = 10;        
        
        // Menu background
        this.add.rectangle(menuX, menuY, menuWidth, menuHeight, 0xf0f0f0)
            .setOrigin(0, 0)
            .setScrollFactor(0);

        // 4. Create menu items
        Object.keys(shapeGroups).forEach((type, index) => {
            const y = menuY + 40 + (index * 50); // 50px spacing between items
            const x = menuX + (menuWidth / 2); // centered horizontally

            // Create menu item container
            const container = this.add.container(x, y);
            container.setScrollFactor(0);

            // Create shape-specific preview
            const preview = this.createShapePreview(type, 0, 0);
            const countText = this.add.text(15, 15, shapeGroups[type].count, {
                fontFamily: '"Carrier Command", monospace',
                fontSize: '14px',
                fill: '#000',
                backgroundColor: '#ffffff',
                padding: { x: 2, y: 2 }
            }).setOrigin(0, 0);

            container.add([preview, countText]);
            preview.setInteractive({ draggable: true });

            // Ghost shape for dragging
            let ghostShape = null;
            let isDragging = false;

            preview.on('dragstart', (pointer, dragX, dragY) => {
                if (shapeGroups[type].count > 0) {
                    isDragging = true;
                    const shapesOfType = shapes.filter(shape => shape.type === type);
                    const shapeSize = shapeGroups[type].count;
                    const size = shapesOfType[shapeSize - 1].size; // Phaser.Math.Between(20, 40);
                    
                    // Create graphics for shape
                    const graphics = this.add.graphics();
                    graphics.lineStyle(2, 0x000000);
                    graphics.fillStyle(0xFFFFFF, 1);

                    // Container to hold graphics
                    const container = this.add.container(pointer.x, pointer.y);
                    
                    const options = {
                        restitution: 0.5,
                        friction: 1,
                        isSensor: false
                    };

                    // Create shape based on type
                    switch (type) {
                        case 'square':
                            graphics.fillRect(-size/2, -size/2, size, size);
                            graphics.strokeRect(-size/2, -size/2, size, size);
                            // const brickTile = this.add.tileSprite(-size/2, -size/2, size, size, 'brick').setOrigin(0, 0);
                            // container.add(brickTile);
                            ghostShape = this.matter.add.gameObject(container, {
                                ...options,
                                shape: { type: 'rectangle', width: size, height: size }
                            });
                            break;
                        case 'rectangle':
                            graphics.strokeRect(-size * 0.75, -size / 2, size * 1.5, size);
                            graphics.fillRect(-size * 0.75, -size / 2, size * 1.5, size);
                            ghostShape = this.matter.add.gameObject(container, {
                                ...options,
                                shape: { type: 'rectangle', width: size*1.5, height: size }
                            });
                            break;
                        case 'circle':
                            graphics.fillCircle(0, 0, size/2);
                            graphics.strokeCircle(0, 0, size/2);

                            ghostShape = this.matter.add.gameObject(container, {
                                ...options,
                                shape: { type: 'circle', radius: size/2 }
                            });
                            break;
                        case 'triangle':
                            const trianglePoints = [
                                { x: 0, y: -size/2 },
                                { x: size/2, y: size/2 },
                                { x: -size/2, y: size/2 }
                            ];
                            graphics.fillPoints(trianglePoints, true);
                            graphics.strokePoints(trianglePoints, true);
                            ghostShape = this.matter.add.gameObject(container, {
                                ...options,
                                shape: { type: 'fromVerts', verts: trianglePoints }
                            });
                            break;
                        case 'rightTriangle':
                            const rtPoints = [
                                { x: -size/2, y: -size/2 },
                                { x: size/2, y: -size/2 },
                                { x: -size/2, y: size/2 }
                            ];
                            graphics.fillPoints(rtPoints, true);
                            graphics.strokePoints(rtPoints, true);
                            ghostShape = this.matter.add.gameObject(container, {
                                ...options,
                                shape: { type: 'fromVerts', verts: rtPoints }
                            });
                            break;
                        case 'trapezoid':
                            const trapPoints = [
                                { x: -size*0.25, y: -size/2 },  // Top left
                                { x: size*0.25, y: -size/2 },   // Top right
                                { x: size/2, y: size/2 },       // Bottom right
                                { x: -size/2, y: size/2 }       // Bottom left
                            ];
                            graphics.fillPoints(trapPoints, true);
                            graphics.strokePoints(trapPoints, true);
                            ghostShape = this.matter.add.gameObject(container, {
                                ...options,
                                shape: { type: 'fromVerts', verts: trapPoints }
                            });
                            break;
                        case 'rhombus':
                            const rhombusPoints = [
                                { x: 0, y: -size/2 },      // Top
                                { x: size/2, y: 0 },       // Right
                                { x: 0, y: size/2 },       // Bottom
                                { x: -size/2, y: 0 }       // Left
                            ];
                            graphics.fillPoints(rhombusPoints, true);
                            graphics.strokePoints(rhombusPoints, true);
                            ghostShape = this.matter.add.gameObject(container, {
                                ...options,
                                shape: { type: 'fromVerts', verts: rhombusPoints }
                            });
                            break;
                    }
                    container.add(graphics);
                }
            });
            
            preview.on('drag', (pointer, dragX, dragY) => {
                if (isDragging && ghostShape) {
                    this.matter.body.setPosition(ghostShape.body, {
                        x: pointer.x,
                        y: pointer.y
                    });
                }
            });
            
            preview.on('dragend', (pointer) => {
                if (isDragging && ghostShape) {
                    const isOutsideMenu = (
                        pointer.x > menuX + menuWidth + 20 ||
                        pointer.x < menuX - 20 ||
                        pointer.y > menuY + menuHeight + 20 ||
                        pointer.y < menuY - 20
                    );
            
                    if (isOutsideMenu) {
                        // Update count and menu
                        shapeGroups[type].count--;
                        countText.setText(shapeGroups[type].count);
                        
                        if (shapeGroups[type].count === 0) {
                            preview.setVisible(false);
                            countText.setVisible(false);
                        }

                        // Add collision detection to shape
                        ghostShape.setDataEnabled();
                        ghostShape.setData('isActiveShape', true);
                        this.activeShapes.push(ghostShape);
                        
                        // Add collision listener
                        ghostShape.setOnCollide((data) => {
                            const collision = data.collision;
                            const pos = collision.supports[0] || {
                                x: collision.bodyA.position.x,
                                y: collision.bodyA.position.y
                            };
                            
                            // Create impact effect
                            this.impactEmitter.setPosition(pos.x, pos.y);
                            this.impactEmitter.setActive(true);
                            this.impactEmitter.explode();
                            
                            // Add small screen shake
                            this.cameras.main.shake(10, 0.003);
                        });
                    } else {
                        // Remove shape if dropped inside menu
                        // this.matter.world.remove(ghostShape);
                        ghostShape.destroy(); // Removes physics body
                        ghostShape.graphics.destroy(); // Remove graphics
                        container.destroy(); // Remove container
                    }
                    
                    ghostShape = null;
                    isDragging = false;
                }
            });
        });

        // Add mouse constraint for dragging
        this.matter.add.mouseSpring({
            stiffness: 0.02,
            damping: 0.2
        });

        // Add height display text
        this.heightText = this.add.text(620, 20, 'Height: 0', {
            fontFamily: '"Carrier Command", monospace',
            fontSize: '16px',
            fill: '#000',
            align: 'center',
            padding: { x: 4, y: 4 },
            backgroundColor: '#ffffff',
            stroke: '#ffffff',
            strokeThickness: 2
        });
        this.heightText.setScrollFactor(0);

        // Add timer text
        this.timerText = this.add.text(360, 20, `Time: ${this.gameTime}`, {
            fontFamily: '"Carrier Command", monospace',
            fontSize: '16px',
            fill: '#000',
            align: 'center',
            padding: { x: 4, y: 4 },
            backgroundColor: '#ffffff',
            stroke: '#ffffff',
            strokeThickness: 2
        });
        this.timerText.setScrollFactor(0);

        // Start countdown timer
        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        // Add exit button
        this.exitButton = this.add.text(670, 60, 'Exit', {
            fontFamily: '"Carrier Command", monospace',
            fontSize: '16px',
            fill: '#ff0000',
            align: 'center',
            padding: { x: 4, y: 4 },
            backgroundColor: '#ffffff',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setInteractive();

        this.exitButton.setScrollFactor(0);

        // Exit button click handler
        this.exitButton.on('pointerdown', () => {
            this.pauseTimer();
            this.showExitConfirmation();
        });

        // Onhover effect for exit button
        this.exitButton.on('pointerover', () => this.exitButton.setTint(0x0000ff));
        this.exitButton.on('pointerout', () => this.exitButton.clearTint());
    }

    updateTimer() {
        this.gameTime--;
        this.timerText.setText(`Time: ${this.gameTime}`);

        // Warning flash at 5 seconds
        if (this.gameTime === 5) {
            const warningFlash = this.time.addEvent({
                delay: 500,
                callback: () => {
                    this.timerText.setVisible(!this.timerText.visible);
                },
                repeat: 9  // 5 seconds = 10 flashes at 500ms
            });
        }

        if (this.gameTime <= 0) {
            this.isGameActive = false;
            this.countdownTimer.remove();

            // Release any shape currently being dragged
            this.matter.world.removeConstraint(this.matter.world.localWorld.constraints[0]);

            // Disable mouse constraint
            this.matter.world.localWorld.constraints = [];
            
            // Flash timer text
            let flashCount = 0;
            const flashTimer = this.time.addEvent({
                delay: 500,
                callback: () => {
                    this.timerText.setVisible(!this.timerText.visible);
                    this.timerText.setColor('#ff0000');
                    flashCount++;
                    if (flashCount >= 6) { // 3 seconds = 6 flashes at 500ms
                        flashTimer.remove();
                        this.timerText.setVisible(true);
                    }
                },
                loop: true
            });
            
            // Wait 3 seconds and transition
            this.time.addEvent({
                delay: 3000,
                callback: () => {
                    // Reset timer before transition
                    this.resetTimer();
                    this.timerText.setVisible(true);
                    this.timerText.setColor('#ffffff');

                    // Calculate final height one last time
                    const bodies = this.matter.world.getAllBodies().filter(body => !body.isStatic);
                    let highestY = 580;
                    
                    bodies.forEach(body => {
                        const bodyTopY = body.bounds.min.y;
                        if (bodyTopY < highestY) {
                            highestY = bodyTopY;
                        }
                    });
                    
                    this.finalHeight = Math.floor(580 - highestY);
                    
                    // Ensure transition to GameOverScene
                    this.scene.start('GameOverScene', { finalHeight: this.finalHeight });
                },
                callbackScope: this,
                loop: false
            });
        }
    }

    update() {
        // Get all non-static bodies
        const bodies = this.matter.world.getAllBodies().filter(body => !body.isStatic);
    
        if (bodies.length > 0) {
            let highestY = 580;  // Start from floor level
            
            bodies.forEach(body => {
                // Get absolute Y position of top of body
                const bodyTopY = body.bounds.min.y;
                if (bodyTopY < highestY) {
                    highestY = bodyTopY;
                }
            });
    
            // Calculate height from floor (580) to highest point
            const structureHeight = 580 - highestY;
            
            // Represent in whole number, not decimal
            const heightInMeters = Math.floor(structureHeight);
            
            this.heightText.setText(`Height: ${heightInMeters}`);
        }

        // Check if game is still active
        if (!this.isGameActive) return;
    }
}