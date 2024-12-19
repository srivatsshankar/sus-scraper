class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LeaderboardScene' });
        this.leaderboard = {};
        window.addEventListener('message', (event) => {            
            const { type, data } = event.data;
            if (type === 'devvit-message') {
                const { message } = data;
                
                if (message.type === 'leaderboard') {
                    this.leaderboard = message.data.leaderboard;
                }
            }
        });
        window.parent.postMessage({ type: 'leaderboard' }, '*');
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
        console.log(this.leaderboard);
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
        const title = 'Leader Board';
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
                y: 80,
                duration: 300,
                delay: index * 50,
                ease: 'Power2',
                onComplete: () => {
                    if (index === chars.length - 1) {
                        chars.forEach((c, i) => {
                            this.tweens.add({
                                targets: c,
                                y: 100,
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

        // Mock high scores data
        const highScores = this.leaderboard;

        // Debug log and display scores
        highScores.forEach((entry, index) => {
            
            const yPos = 180 + (index * 70);
            
            // Container background
            const container = this.add.rectangle(400, yPos, 300, 50, 0xFFFFFF)
                .setStrokeStyle(2, 0xCCCCCC)
                .setOrigin(0.5);
        
            // Format and display score
            const formattedScore = `u/${entry.member} - ${entry.score}m`;
            const scoreText = this.add.text(400, yPos, formattedScore, {
                fontFamily: '"Carrier Command", monospace',
                fontSize: '16px',
                fill: '#000',
                align: 'center'
            }).setOrigin(0.5);
        
            // Bobbing animation
            this.tweens.add({
                targets: [container, scoreText],
                y: '+=5',
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: index * 150
            });
        });

        // Create back button
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
}