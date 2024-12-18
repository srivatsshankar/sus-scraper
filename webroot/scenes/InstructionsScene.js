class InstructionsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InstructionsScene' });
        this.currentIndex = 0;
        this.instructions = [
            { image: 'inst1', text: 'Drag and drop shapes to build your\n skyscraper as high as possible' },
            { image: 'inst2', text: 'Choose from the available inventory' },
            { image: 'inst3', text: 'Make every second count. You only have 90 seconds\n to build your skyscraper!' },
            { image: 'inst4', text: 'Inventory can be pulled from the menu onto the worksite' },
            { image: 'inst5', text: 'Objects can be stacked to build taller structures' },
            { image: 'inst6', text: 'The higher you go the more points you get' },
            { image: 'inst7', text: 'Top players get highs scores!' },
            { image: 'inst8', text: 'Try to get onto the leader board!' }
        ];
    }

    preload() {
        // Load all background images
        for (let i = 1; i <= 8; i++) {
            this.load.image(`bg${i}`, `/assets/images/bg/bg${i}.jpeg`);
        } 
        
        // Load all skyline images
        for (let i = 1; i <= 12; i++) {
            this.load.image(`skyline${i}`, `/assets/images/skylines/skyline-${i}.png`);
        }

        // Load instruction images
        for (let i = 1; i <= 8; i++) {
            this.load.image(`inst${i}`, `/assets/images/inst/${i}.png`);
        }
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

            // Game title
            const title = 'Instructions';
            const chars = [];
            const charSpacing = 25;
            const startX = 400 - ((title.length * charSpacing) / 2);
            
            // Create individual character texts at higher position
            for (let i = 0; i < title.length; i++) {
                const char = this.add.text(startX + (i * charSpacing), 150, title[i], {
                fontFamily: '"Carrier Command", monospace',
                fontSize: '32px',
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 4
                }).setOrigin(0.5, 0.5).setAlpha(0);
                chars.push(char);
            }

            // Initial reveal animation with wave at higher position
            chars.forEach((char, index) => {
                this.tweens.add({
                    targets: char,
                    alpha: 1,
                    y: 60,
                    duration: 300,
                    delay: index * 50,
                    ease: 'Power2',
                    onComplete: () => {
                        if (index === chars.length - 1) {
                            chars.forEach((c, i) => {
                                this.tweens.add({
                                    targets: c,
                                    y: 80,
                                    duration: 1000,
                                    yoyo: true,
                                    repeat: -1,
                                    ease: 'Sine.easeInOut',
                                    delay: i * 100
                                });
                            });
                        }
                    }
                });
            });

            // Create instruction container
            this.instructionContainer = this.add.container(400, 300);
            
            // Add instruction image and text
            this.currentImage = this.add.image(0, 0, 'inst1').setOrigin(0.5);

            // Set max height while maintaining aspect ratio
            const scaleRatio = Math.min(400 / this.currentImage.height, 1);
            this.currentImage.setScale(scaleRatio);

            this.currentText = this.add.text(0, 100, this.instructions[0].text, {
                fontFamily: '"Carrier Command", monospace',
                fontSize: '16px',
                fill: '#fff',
                align: 'center',
                stroke: '#000',
                strokeThickness: 2
            }).setOrigin(0.5);

            this.instructionContainer.add([this.currentImage, this.currentText]);

            // Add navigation buttons
            const prevButton = this.add.text(150, 450, '< PREV', {
                fontFamily: '"Carrier Command", monospace',
                fontSize: '20px',
                fill: '#fff'
            }).setInteractive();

            const nextButton = this.add.text(550, 450, 'NEXT >', {
                fontFamily: '"Carrier Command", monospace',
                fontSize: '20px',
                fill: '#fff'
            }).setInteractive();

            // Add hover effects for navigation buttons
            [prevButton, nextButton].forEach(button => {
                button.on('pointerover', () => button.setTint(0x0000ff));
                button.on('pointerout', () => button.clearTint());
            });

            // Add button handlers
            prevButton.on('pointerdown', () => this.navigate(-1));
            nextButton.on('pointerdown', () => this.navigate(1));
        
        
            // Back button
            const buttonWidth = 200;
            const buttonHeight = 60;
            const backButton = this.add.rectangle(400, 550, buttonWidth, buttonHeight)
                .setStrokeStyle(4, 0x0099ff) // Bright blue border
                .setFillStyle(0x0099ff, 0.7); // Semi-transparent blue fill

            // Create pixel-style text
            const backText = this.add.text(400, 550, 'Main Menu', {
                fontFamily: '"Carrier Command", monospace',
                fontSize: '16px',
                color: '#ffffff',
                resolution: 1,
                antialias: false
            }).setOrigin(0.5);

            // Make interactive
            backButton.setInteractive();
            backButton.on('pointerover', () => {
                backButton.setFillStyle(0x0099ff, 0.85);
            });
            backButton.on('pointerout', () => {
                backButton.setFillStyle(0x0099ff, 0.7);
            });
            backButton.on('pointerdown', () => {
                this.scene.start('MenuScene');
            });

            // Add bobbing animation to buttons and text
            [
                { button: backButton, text: backText }
            ].forEach((pair, index) => {
                this.tweens.add({
                    targets: [pair.button, pair.text],
                    y: '+=5',
                    duration: 1500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                    delay: index * 150
                });
            });
    }

    navigate(direction) {
        this.currentIndex = Phaser.Math.Clamp(
            this.currentIndex + direction,
            0,
            this.instructions.length - 1
        );
        
        const instruction = this.instructions[this.currentIndex];
        this.currentImage.setTexture(instruction.image);
        this.currentText.setText(instruction.text);
    }

}