var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1 },
            debug: false // Set to true to see physics bodies
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
    },
    scene: [MenuScene, GameScene, GameOverScene, LeaderboardScene, InstructionsScene, AboutScene]
};

var game = new Phaser.Game(config);