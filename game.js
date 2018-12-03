var player;
var Gromflomites;
var cursors;
var score = 0;
var scoreString = '';
var scoreText;
var lives;
var livingEnemies = [];
var bullets;
var bulletTime = 0;
var fireButton;
var laser;
var firingTimer = 0;

//create a new game with phaser
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { 
	preload: preload, 
	create: create, 
	update: update, 
	},false,true);
//insert google font to be used later
WebFontConfig = {
    google: {families: ['Press Start 2P']}
};
//load all the elements 
function preload() {
	this.load.image('bullet', 'assets/bullet.png');
	this.load.image('laser', 'assets/laser.png');
	this.load.spritesheet('rick', 'assets/rick.png', 64, 64);
	this.load.spritesheet('enemy', 'assets/enemy.png', 64, 64);
	this.load.image('background','assets/background.png');
	this.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
}
//create the game 
function create() {
	//scale to center
	game.scale.pageAlignHorizontally = true;
	game.scale.pageAlignVertically = true;
	game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	//set physics
	game.physics.startSystem(Phaser.Physics.ARCADE);
	//add background
	game.add.image(0, 0,'background');
	//create the Rick 
    player = game.add.sprite(400, 550, 'rick');
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.collideWorldBounds=true;
	//create a group of gromflomites
    Gromflomites = game.add.group();
    Gromflomites.enableBody = true;
    Gromflomites.physicsBodyType = Phaser.Physics.ARCADE;
	//add gromflomites to the game
    createGromflomites();
    //create lives text and sprites
    createLives();
    //create score board
    createScore();
	//movement
    cursors = game.input.keyboard.createCursorKeys();
    //firing
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    //Ricks bullets
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    createbullets();
    //Gromflomites lasers
    Lasers = game.add.group();
    Lasers.enableBody = true;
    Lasers.physicsBodyType = Phaser.Physics.ARCADE;
    createLasers();
}
function createLives(){
    //add lives and life text
    lives = game.add.group();
    game.add.text(game.world.width - 140, 15, 'Lives: ', { font: '20px Press Start 2P', fill: '#fff' });
    //set how many lives the player will have and place life strites
    for (var i = 0; i < 4; i++){
        var rick = lives.create(game.world.width - 125 + (35 * i), 60, 'rick');
        rick.anchor.setTo(0.5, 0.5);
        rick.alpha = 0.4;
    }
}
function createBullets(){
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
    Lasers.createMultiple(30, 'laser');
    Lasers.setAll('anchor.x', 0.5);
    Lasers.setAll('anchor.y', 1);
    Lasers.setAll('outOfBoundsKill', true);
    Lasers.setAll('checkWorldBounds', true);
}
function createLasers(){
    Lasers.createMultiple(30, 'laser');
    Lasers.setAll('anchor.x', 0.5);
    Lasers.setAll('anchor.y', 1);
    Lasers.setAll('outOfBoundsKill', true);
    Lasers.setAll('checkWorldBounds', true);
}
function createScore(){
    //show score on top
    scoreString = 'Score: ';
    scoreText = game.add.text(10, 15, scoreString + score, { font: '20px Press Start 2P', fill: '#fff' });
}

function createGromflomites () {
	//four rows
    for (var i = 0; i < 4; i++){
    	//of 9 gromflomites
        for (var j = 0; j < 11; j++){
        	//where to create and animation
            var Gromflomite = Gromflomites.create(j * 70  , i * 70, 'enemy');
            Gromflomite.anchor.setTo(0.5, 0.5);
            Gromflomite.animations.add('bite', [ 0, 1], 20, true);
            Gromflomite.play('bite');
            Gromflomite.body.moves = false;
        }
    }
	//start from
    Gromflomites.x = 50;
    Gromflomites.y = 125;
	//makes movement happen
    var tween = game.add.tween(Gromflomites).to( { y: 300 }, 3000, Phaser.Easing.Linear.None, true, 0, 1000, true);
}

function update() {

    if (player.alive){
        player.body.velocity.setTo(0, 0);

        if (cursors.left.isDown){
            player.body.velocity.x = -200;
        }
        else if (cursors.right.isDown){
            player.body.velocity.x = 200;
        }
        else if(cursors.up.isDown){
            player.body.velocity.y = -200;
        }
        else if(cursors.down.isDown){
            player.body.velocity.y = 200;
        }
        //player shoots
        playerShoots();
        //Gromflomites shoot
        gromoflitesShoot();
        
        game.physics.arcade.overlap(bullets, Gromflomites, bulletOverlap);
        game.physics.arcade.overlap(Lasers, player, playerOverlap);
        game.physics.arcade.overlap(Gromflomites, player, playerGromflomiteOverlap);
        game.physics.arcade.overlap(bullets, Lasers, lasersOverlap);
    }
}

function bulletOverlap (bullet, Gromflomite) {
    //when you hit them
    bullet.kill();
    Gromflomite.kill();
    //increase score 
    score += 1;
    scoreText.text = scoreString + score;
    if (Gromflomites.countLiving() == 0){
        Lasers.callAll('kill');
        player.body.enable = false;
        game.add.text(200, 300, 'YOU WON!!! ', { font: '50px Press Start 2P', fill: '#fff' });
    }
}

function lasersOverlap (bullet, laser) {
    bullet.kill();
    laser.kill();
}

function playerOverlap (player,laser) {
    laser.kill();
    live = lives.getFirstAlive();
    if (live){
        live.kill();
        playerInvincible();
    }
    // When Rick dies
    if (lives.countLiving() < 1){
        player.kill();
        Lasers.callAll('kill');
        player.body.enable = false;
		game.add.text(100, 300, 'GAME OVER :(', { font: '50px Press Start 2P', fill: '#fff' });
    }
}

function playerGromflomiteOverlap (player,Gromflomite) {
    life = lives.getFirstAlive();
    if (life){
        if (!player.invincible) {
            life.kill();
            Gromflomite.kill();
            playerInvincible();
        }
    }
    // When Rick dies
    if (lives.countLiving() < 1){
        player.kill();
        Lasers.callAll('kill');
        player.body.enable = false;
		game.add.text(100, 300, 'GAME OVER :(', { font: '50px Press Start 2P', fill: '#fff' });
    }
}

function playerInvincible(){
    player.invincible=true;
    game.time.events.add(2000,function(){player.invincible=false;}, this);
}
function gromoflitesShoot(){
    if (game.time.now > firingTimer){
			laser = Lasers.getFirstExists(false);
    		livingEnemies.length=0;
    		Gromflomites.forEachAlive(function(Gromflomite){livingEnemies.push(Gromflomite);});
    		if (laser && livingEnemies.length > 0){
        		var random=game.rnd.integerInRange(0,livingEnemies.length-1);
        		var shooter=livingEnemies[random];
        		laser.reset(shooter.body.x, shooter.body.y);
        		game.physics.arcade.moveToObject(laser,player,120);
        		firingTimer = game.time.now + 2000;
    		}
        }
}

function playerShoots(){
    if (fireButton.isDown && player.body.enable){
        if (game.time.now > bulletTime){
        	bullet = bullets.getFirstExists(false);
    		if (bullet){
            	bullet.reset(player.x, player.y + 4);
            	bullet.body.velocity.y = -600;
            	bulletTime = game.time.now + 400;
        	}
    	}
    }
}
