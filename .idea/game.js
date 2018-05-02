/**
 * Created by J Won on 23/04/2017.
 */

var myGamePiece;
var myBackground;
var myGround;
var myObstacles = [];
var myScore;
var mySound;
var myMusic;

//function to run the game
function startGame() {
    myGamePiece = new sprite(100, 70, "runningpika.gif", 10, 120, "image");
    mySound = new sound("pikachu.wav");
    myMusic = new sound("opening.mp3");
    myMusic.play();
    myBackground = new sprite(800, 400, "loopbackground.jpg", 0, 0, "background")
    myScore = new sprite("30px", "arial", "black", 600, 30, "text");
    myGround = new sprite(800, 5, "green", 0, 265)
    myObstacle = new sprite(50, 50, "exec.gif", 300, 120, "image");

    myGameArea.start();
}

//setting up the canvas where the game will be played.
var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.width = 800;
        this.canvas.height = 270;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);

        // setting up frame for counting multiple obstacles
        this.frameNo = 0

        this.interval = setInterval(updateGameArea, 20);

        //adding keydown and keyup function

        window.addEventListener('keydown', function (e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop: function () {
        clearInterval(this.interval);
    }
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {
        return true;
    }
    return false;
}

//setting up function for my game sprite
function sprite(width, height, color, x, y, type) {
    this.type = type;
    if (type == "image" || type == "background") {
        this.image = new Image();
        this.image.src = color;
    }
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.gravity = 0.05;
    this.gravitySpeed = 0;
    this.x = x;
    this.y = y;
    this.update = function () {
        ctx = myGameArea.context;
        if (type == "image" || type == "background") {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            if (type == "background") {
                ctx.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
            }
        }
        else if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

    }
    this.newPos = function () {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.hitBottom();
        if (this.type == "background") {
            if (this.x == -(this.width)) {
                this.x = 0;
            }
        }
    }

    this.hitBottom = function() {
        var rockbottom = myGameArea.canvas.height - this.height;
        if (this.y >rockbottom) {
            this.y = rockbottom;
            this.gravitySpeed = 0;
        }
    }

    // this.hitOther = function(otherobj) {
    //     var hitOther = myGameArea.canvas.height - otherobj.y;
    //     this.y = hitOther;
    //     this.gravitySpeed = 0;
    // }

    function accelerate(n) {
        myGamePiece.gravity = n;
    }

    // this.jumpOn = function (otherobj) {
    //     var mybottom = this.y + (this.height);
    //     var othertop = otherobj.y;
    //     var jump = false;
    //     if (mybottom == othertop){
    //         jump = true;
    //     }
    // }

    this.crashWith = function (otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x+100;
        var otherright = otherobj.x + (otherobj.width-80);
        var othertop = otherobj.y *1.5;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) ||
            (mytop > otherbottom) ||
            (myright < otherleft) ||
            (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }

}

//creating function to update game area to make sure the movement is updated
function updateGameArea() {

    //collision with obstacle, game ends
    var x, height, gap, minHeight, maxHeight, minGap, maxGap;
    for (i = 0; i < myObstacles.length; i += 1) {
        // if (myGamePiece.jumpOn(myObstacles[i])){
        //     mySound.play();
        //     myGamePiece.gravity = 0;
        //     myGamePiece.y = myGameArea.canvas.height - myObstacles[i].y;
        //
        //     return;
        // }
        if (myGamePiece.crashWith(myObstacles[i])) {
            mySound.play();
            myMusic.stop();
            myGameArea.stop();
            return;
        }
    }

    myGameArea.clear();
    myGameArea.frameNo += 1;

    //placing background
    myBackground.speedX = -1;
    myBackground.newPos();
    myBackground.update();

    //placing ground
    myGround.newPos();
    myGround.update();

    var minInterval = 200;
    var maxInterval = 400;
    var randomisedInterval = 250; //Math.floor(Math.random() * (maxInterval - minInterval) + minInterval);

    if (myGameArea.frameNo == 1 || everyinterval(randomisedInterval)) {
        x = myGameArea.canvas.width;

        //randomising obstacles
        minHeight = 50;
        maxHeight = 150;
        height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);

        //creating random obstacle images;

        switch (Math.floor((Math.random() * 6)+1)){
            case 1:
                randomImage = (new sprite(height, height, "exec.gif", x, 270-height, "image"));
                break;
            case 2:
                randomImage = (new sprite(height*1.15, height, "Blasty.png", x, 270-height, "image"));
                break;
            case 3:
                randomImage = (new sprite(height*1.01, height, "goldduck.png", x, 270-height, "image"));
                break;
            case 4:
                randomImage = (new sprite(height*0.62, height, "gyarados.png", x, 270-height, "image"));
                break;
            case 5:
                randomImage = (new sprite(height, height, "psyduck.png", x, 270-height, "image"));
                break;
            case 6:
                randomImage = (new sprite(height, height, "charizard.png", x, 270-height, "image"));
                break;
        }


        // minGap = 50;
        // maxGap = 200;
        // gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);

        //randomising pokemon

        myObstacles.push(randomImage);


        // myObstacles.push(new sprite(10, x - height - gap, "exec.gif", x, height + gap, "image"));
    }
    for (i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].x += -1;
        myObstacles[i].update();
    }

//updating score
    myScore.text = "SCORE: " + (myGameArea.frameNo);
    myScore.update();


    //creating speed functions initiated by controls
    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;
    if (myGameArea.keys && myGameArea.keys[37]) {
        myGamePiece.speedX = -1;
    }
    if (myGameArea.keys && myGameArea.keys[38]) {
        myGamePiece.speedY = -5;
        // accelerate(0.1);
    }
    if (myGameArea.keys && myGameArea.keys[39]) {
        myGamePiece.speedX = 1;
    }
    if (myGameArea.keys && myGameArea.keys[40]) {
        myGamePiece.speedY = 5;
    }

    myGamePiece.newPos();
    myGamePiece.update();
}

//adding sound

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function () {
        this.sound.play();
    }
    this.stop = function () {
        this.sound.pause();
        myGamePiece.image.src = "hurtpika.gif";
    }
}



//teleporting function, 20 steps to the right.
//blockade (10%)