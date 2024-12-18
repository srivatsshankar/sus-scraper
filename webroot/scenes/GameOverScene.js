class GameOverScene extends Phaser.Scene {
    init(data) {
        this.finalHeight = data.finalHeight || 0;
        window.parent.postMessage({ type: 'userScore', data: {score: this.finalHeight} }, '*');
    }

    constructor(data) {
        super({ key: 'GameOverScene' });
        this.userData = '';
        this.highestScore = false;
        // this.finalHeight = data.finalHeight || 0;
        window.addEventListener('message', (event) => {            
            const { type, data } = event.data;
            if (type === 'devvit-message') {
                const { message } = data;
                
                if (message.type === 'userData') {
                    this.userData = message.data.username;
                    this.highestScore = message.data.highScore;
                }
            }
        });
        window.parent.postMessage({ type: 'userData', data: {score: this.finalHeight} }, '*');
    }

    preload() {
        // Background
        for (let i = 1; i <= 8; i++) {
            this.load.image(`bg${i}`, `/assets/images/bg/bg${i}.jpeg`);
        } 
        
        // Load all skyline images
        for (let i = 1; i <= 12; i++) {
            this.load.image(`skyline${i}`, `/assets/images/skylines/skyline-${i}.png`);
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

        // Congratulations text
        const title = this.finalHeight >= 50 ? `Congratulations u/${this.userData}!` : `Try Again u/${this.userData}!`;
        const chars = [];
        const charSpacing = 20;
        const startX = 400 - ((title.length * charSpacing) / 2);
   
        // Create individual character texts
        for (let i = 0; i < title.length; i++) {
            const char = this.add.text(startX + (i * charSpacing), 120, title[i], {
                fontFamily: '"Carrier Command", monospace',
                fontSize: '20px',
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
                y: 140,
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

        // Highest score or nothing
        const highestScore = this.highestScore;
        if (highestScore) {
            const highScoreText = this.add.text(400, 250, 'NEW HIGH SCORE!', {
                fontFamily: '"Carrier Command", monospace',
                fontSize: '24px',
                fill: '#ff0000',
                align: 'center',
                stroke: '#000',
                strokeThickness: 4
            }).setOrigin(0.5);
    
            // Create flashing effect
            this.tweens.add({
                targets: highScoreText,
                alpha: 0,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }

        // Display final height
        const heightText = this.add.text(400, 300, '', {
            fontFamily: '"Carrier Command", monospace',
            fontSize: '16px',
            fill: '#fff',
            align: 'center',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Setup typewriter text
        const fullText = `Final Height: ${this.finalHeight}m`;
        let currentChar = 0;
        
        // Typewriter effect
        const typewriterTimer = this.time.addEvent({
            delay: 100,
            repeat: fullText.length - 1,
            callback: () => {
                heightText.text += fullText[currentChar];
                currentChar++;
                
                // Start bobbing animation after last character
                if (currentChar === fullText.length) {
                    this.tweens.add({
                        targets: heightText,
                        y: '+=10',
                        duration: 1500,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                }
            }
        });

        // Buttons
        const buttonWidth = 200;
        const buttonHeight = 60;

        // Leaderboard button (moved up)
        const leaderboardButton = this.add.rectangle(400, 420, buttonWidth, buttonHeight)
            .setStrokeStyle(4, 0x0099ff)
            .setFillStyle(0x0099ff, 0.7);

        const leaderboardText = this.add.text(400, 420, 'Leader Board', {
            fontFamily: '"Carrier Command", monospace',
            fontSize: '16px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        // Menu button
        const menuButton = this.add.rectangle(400, 500, buttonWidth, buttonHeight)
            .setStrokeStyle(4, 0x0099ff)
            .setFillStyle(0x0099ff, 0.7);

        const menuText = this.add.text(400, 500, 'Main Menu', {
            fontFamily: '"Carrier Command", monospace',
            fontSize: '16px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        // Make buttons interactive
        [leaderboardButton, menuButton].forEach(btn => {
            btn.setInteractive();
            btn.on('pointerover', () => btn.setFillStyle(0x0099ff, 0.85));
            btn.on('pointerout', () => btn.setFillStyle(0x0099ff, 0.7));
        });

        leaderboardButton.on('pointerdown', () => this.scene.start('LeaderboardScene'));
        menuButton.on('pointerdown', () => this.scene.start('MenuScene'));

        // Add bobbing animation to buttons and text
        [
            { button: leaderboardButton, text: leaderboardText },
            { button: menuButton, text: menuText }
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