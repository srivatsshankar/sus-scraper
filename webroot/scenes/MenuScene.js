class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
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
    }

    create() {
        // Request initial data
        // console.log(this.shapes);
        // console.log(this.shapeGroups);

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
        const title = 'Suspicious Skyscraper';
        const chars = [];
        const charSpacing = 25;
        const startX = 400 - ((title.length * charSpacing) / 2);
        
        // Create individual character texts
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

        // Initial reveal animation with wave
        chars.forEach((char, index) => {
            this.tweens.add({
                targets: char,
                alpha: 1,
                y: 100,
                duration: 300,
                delay: index * 50,
                ease: 'Power2',
                onComplete: () => {
                    // Start continuous wave after reveal
                    if (index === chars.length - 1) {
                        chars.forEach((c, i) => {
                            this.tweens.add({
                                targets: c,
                                y: 120,
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

        // Create button background
        const buttonWidth = 200;
        const buttonHeight = 60;
        
        // Start Game Button
        const startButton = this.add.rectangle(400, 240, buttonWidth, buttonHeight)
        .setStrokeStyle(4, 0x0099ff)
        .setFillStyle(0x0099ff, 0.7);

        const startText = this.add.text(400, 240, 'Start Game', {
        fontFamily: '"Carrier Command", monospace',
        fontSize: '16px',
        fill: '#fff',
        align: 'center'
        }).setOrigin(0.5);

        // Leaderboard Button
        const leaderboardButton = this.add.rectangle(400, 320, buttonWidth, buttonHeight)
        .setStrokeStyle(4, 0x0099ff)
        .setFillStyle(0x0099ff, 0.7);

        const leaderboardText = this.add.text(400, 320, 'Leaderboard', {
        fontFamily: '"Carrier Command", monospace',
        fontSize: '16px',
        fill: '#fff',
        align: 'center'
        }).setOrigin(0.5);

        // Instructions Button
        const instructionsButton = this.add.rectangle(400, 400, buttonWidth, buttonHeight)
        .setStrokeStyle(4, 0x0099ff)
        .setFillStyle(0x0099ff, 0.7);

        const instructionsText = this.add.text(400, 400, 'Instructions', {
        fontFamily: '"Carrier Command", monospace',
        fontSize: '16px',
        fill: '#fff',
        align: 'center'
        }).setOrigin(0.5);

        // About Button
        const aboutButton = this.add.rectangle(400, 480, buttonWidth, buttonHeight)
        .setStrokeStyle(4, 0x0099ff)
        .setFillStyle(0x0099ff, 0.7);

        const aboutText = this.add.text(400, 480, 'About', {
        fontFamily: '"Carrier Command", monospace',
        fontSize: '16px',
        fill: '#fff',
        align: 'center'
        }).setOrigin(0.5);

        // Update interactive buttons array
        [startButton, leaderboardButton, instructionsButton, aboutButton].forEach(btn => {
            btn.setInteractive();
            btn.on('pointerover', () => btn.setFillStyle(0x0099ff, 0.85));
            btn.on('pointerout', () => btn.setFillStyle(0x0099ff, 0.7));
        });

        // Add click handlers
        startButton.on('pointerdown', () => this.scene.start('GameScene'));
        leaderboardButton.on('pointerdown', () => this.scene.start('LeaderboardScene'));
        instructionsButton.on('pointerdown', () => this.scene.start('InstructionsScene'));
        aboutButton.on('pointerdown', () => this.scene.start('AboutScene'));

        // Update bobbing animation array
        [
        { button: startButton, text: startText },
        { button: leaderboardButton, text: leaderboardText },
        { button: instructionsButton, text: instructionsText },
        { button: aboutButton, text: aboutText }
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
}