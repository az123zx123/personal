// The point and size class used in this program
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}


// The player class used in this program
function Player() {
    this.node = svgdoc.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;

}

Player.prototype.isOnPlatform = function() {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y){
            if (node.getAttribute('type') == 'disappearing') {
                var platformOpacity = parseFloat(node.getAttribute("opacity"));
                platformOpacity -= 0.1;
                node.setAttribute("opacity",platformOpacity,null);
                if (platformOpacity <= 0.0) {
                    platforms.removeChild(node);
                }
            } return true;
        }
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

function goodthingCollidePlatform(thingPosition, thingSize){
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseInt(node.getAttribute("x"));
        var y = parseInt(node.getAttribute("y"));
        var w = parseInt(node.getAttribute("width"));
        var h = parseInt(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(thingPosition, thingSize, pos, size)) {
            return true;
        }
    }
    return false;
}



Player.prototype.collidePlatform = function(position) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }

}

Player.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}


//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(40, 40);         // The size of the player
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 420);   // The initial position of the player
var EXIT_SIZE = new Size(60, 60);           // The size of the exit
var PORTAL_SIZE = new Size(10, 40);         // The size of the portal

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 25;                     // The time interval of running the game

var BULLET_SIZE = new Size(10, 10);         // The size of a bullet
var BULLET_SPEED = 10.0;                    // The speed of a bullet
                                            //  = pixels it moves each game loop
var SHOOT_INTERVAL = 200.0;                 // The period when shooting is disabled
var canShoot = true;                        // A flag indicating whether the player can shoot a bullet

var MONSTER_SIZE = new Size(40, 40);        // The size of a monster
var GOODTHING_SIZE = new Size(15,15);      // The size of a goodthing

var name="Anonymous";                       //users name
var previousName="";
var nameTag=null;
var zoomMode= false;                        //zoom mode
var flip=false;                             //the direction
var level=1;                                //the level
var score=0;
var numberOfGoodThingsRemaining = 0;
var bonus = 1;



//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum

var svgdoc = null;                          // SVG root document node
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var zoom = 1.0;                             // The zoom level of the screen
var cheatMode = false;
var goodstuff = 8;
var monster_shoot = true;
var POINT_OF_GOOD_THING = 10;
var numberOfBullets = 8;
var timeLeft = 60;
var timeLeftInterval = null;

bgm = new Audio("ChillingMusic.wav");
bgm.volume = 0.5;
bgm.addEventListener("ended", function() {
    this.play();
}, false);



//
// The load function for the SVG document
//
function load(evt) {
    // Set the root node to the global variable
    svgdoc = evt.target.ownerDocument;

    // Attach keyboard events
    svgdoc.documentElement.addEventListener("keydown", keydown, false);
    svgdoc.documentElement.addEventListener("keyup", keyup, false);

    // Remove text nodes in the 'platforms' group
    cleanUpGroup("platforms", true);

    bgm.play();

}

function insertName() {
    var nameInput = prompt("Please enter your name ", previousName);
    if (nameInput.length == 0 || nameInput == null || nameInput == undefined || nameInput == "" || nameInput == undefined)
        name = "Anonymous";
    else
        name = nameInput;
    previousName=name;
    svgdoc.getElementById("name_value").firstChild.data = name;
    nameTag = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    nameTag.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#name");
    svgdoc.getElementById("player_name").appendChild(nameTag);
    nameTag.setAttribute("x", player.position.x);
    nameTag.setAttribute("y", player.position.y - 5);





}

function startGame(){
    clearInterval(GAME_INTERVAL);
    clearInterval(timeLeftInterval);



    cleanUpGroup("monsters", false);
    cleanUpGroup("player_name", false);
    cleanUpGroup("bullets", false);

    svgdoc.getElementById('start').style.setProperty("visibility", "hidden", null);
    cheatMode = false;
    player = new Player();
    bgm.play();

    for(var i=0;i<level+5;i++) {
        createMonster();
    }


       createSpecialMonster();
    var platforms = svgdoc.getElementById("platforms");

    var dissPlat1 = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
    dissPlat1.setAttribute("x", 320);
    dissPlat1.setAttribute("y", 320);
    dissPlat1.setAttribute("width", 60);
    dissPlat1.setAttribute("height", 20);
    dissPlat1.setAttribute("type", "disappearing");
    dissPlat1.setAttribute("opacity", 1);
    dissPlat1.setAttribute("style", "fill:black;");
    platforms.appendChild(dissPlat1);
    var dissPlat2 = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
    dissPlat2.setAttribute("x", 40);
    dissPlat2.setAttribute("y", 120);
    dissPlat2.setAttribute("width", 60);
    dissPlat2.setAttribute("height", 20);
    dissPlat2.setAttribute("type", "disappearing");
    dissPlat2.setAttribute("opacity", 1);
    dissPlat2.setAttribute("style", "fill:black;");
    platforms.appendChild(dissPlat2);
    var dissPlat3 = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
    dissPlat3.setAttribute("x", 440);
    dissPlat3.setAttribute("y", 440);
    dissPlat3.setAttribute("width", 60);
    dissPlat3.setAttribute("height", 20);
    dissPlat3.setAttribute("type", "disappearing");
    dissPlat3.setAttribute("opacity", 1);
    dissPlat3.setAttribute("style", "fill:black;");
    platforms.appendChild(dissPlat3);
    // Create the exit
    createExit();

    createGoodThings(goodstuff);

    timeLeft=60;
    numberOfBullets=8;
    svgdoc.getElementById("timeBar").setAttribute("width",120);

    svgdoc.getElementById("numberOfBullets").firstChild.data = numberOfBullets;


    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);
    timeLeftInterval = setInterval("timeCheck()",1000);


}

//
// This function removes all/certain nodes under a group
//
function cleanUpGroup(id, textOnly) {
    var node, next;
    var group = svgdoc.getElementById(id);
    node = group.firstChild;
    while (node != null) {
        next = node.nextSibling;
        if (!textOnly || node.nodeType == 3) // A text node
            group.removeChild(node);
        node = next;
    }
}


//
// This function creates the monsters in the game
//
function createSpecialMonster() {
    var monster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    var monPos = new Point(Math.floor(Math.random()*500), Math.floor(Math.random()*350));
    monster.setAttribute("x",monPos.x);
    monster.setAttribute("y",monPos.y);
    //set moving destination
    var monsterFinalPos = new Point(Math.floor(Math.random()*510+50), Math.floor(Math.random()*480+40));
    monster.setAttribute("Dx", monsterFinalPos.x);
    monster.setAttribute("Dy", monsterFinalPos.y);
    monster.setAttribute("shoot", true);

    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    svgdoc.getElementById("monsters").appendChild(monster);
}

function createMonster() {

    var monster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    var monPos = new Point(Math.floor(Math.random()*500), Math.floor(Math.random()*350));
    monster.setAttribute("x",monPos.x);
    monster.setAttribute("y",monPos.y);
    //set moving destination
    //avoid running to player start place
       var monsterFinalPos = new Point(Math.floor(Math.random()*510+50), Math.floor(Math.random()*480+40));
    monster.setAttribute("Dx", monsterFinalPos.x);
    monster.setAttribute("Dy", monsterFinalPos.y);

    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    svgdoc.getElementById("monsters").appendChild(monster);



}

function createExit(){
    var exit = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    exit.setAttribute("x", 20);
    exit.setAttribute("y", 20);
    exit.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#exit");
    svgdoc.getElementById("exit_here").appendChild(exit);
}

function createGoodThings(numberOfGoodThings) {
    numberOfGoodThingsRemaining = numberOfGoodThings;
    for (var i = 0; i < numberOfGoodThings; i++) {
        var x = 0, y = 0;
        do {
            var goodThingInitPos = new Point(Math.floor(Math.random()*520+40), Math.floor(Math.random()*480)+40);
            x = goodThingInitPos.x;
            y = goodThingInitPos.y;
        } while (intersect(PLAYER_INIT_POS, PLAYER_SIZE, goodThingInitPos, GOODTHING_SIZE) || goodthingCollidePlatform(goodThingInitPos, GOODTHING_SIZE) || collideGoodThing(goodThingInitPos, GOODTHING_SIZE));
        createGoodThing(x, y);

    }
}

function createGoodThing(x, y) {
    var goodThing = svgdoc.createElementNS('http://www.w3.org/2000/svg', 'use');
    goodThing.setAttribute('x', x);
    goodThing.setAttribute('y', y);
    goodThing.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#goodthing");
    svgdoc.getElementById('goodThings').appendChild(goodThing);
}

function moveMonsters(){
    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var node = monsters.childNodes.item(i);
        var currX = parseInt(node.getAttribute("x"));
        var currY = parseInt(node.getAttribute("y"));
        var tarX = parseInt(node.getAttribute("Dx"));
        var tarY = parseInt(node.getAttribute("Dy"));
        if (tarX < currX){
            node.setAttribute("flip",0);
            node.setAttribute("transform","translate(" + (2*currX + MONSTER_SIZE.w)  + "," + 0 + ") scale(-1, 1)");}
            else{
            node.setAttribute("flip",1);
            node.setAttribute("transform","");}

        if(currX==tarX&&currY==tarY){;
            //set moving destination
            var Fx=Math.floor(Math.random()*520+40);
            var Fy=Math.floor(Math.random()*480+40);
            node.setAttribute("Dx", Fx);
            node.setAttribute("Dy", Fy);
        }else if(currX==tarX&&currY!=tarY){
            if(currY>tarY)
                node.setAttribute("y",currY-1);
            else
                node.setAttribute("y",currY+1);
        }else if(currX!=tarX&&currY==tarY){
            if(currX>tarX)
                node.setAttribute("x",currX-1);
            else
                node.setAttribute("x",currX+1);
        }else if(currX!=tarX&&currY!=tarY){
            if(currY>tarY)
                node.setAttribute("y",currY-1);
            else
                node.setAttribute("y",currY+1);
            if(currX>tarX)
                node.setAttribute("x",currX-1);
            else
                node.setAttribute("x",currX+1);
        }

            }
}
//
// This function shoots a bullet from the player
//
function shootBullet() {
    if(numberOfBullets<=0&&(!cheatMode)){
        return;
    }
    // Disable shooting for a short period of time
    canShoot=false;
    setTimeout("canShoot=true",SHOOT_INTERVAL);
    if(!cheatMode){
        numberOfBullets--;
        svgdoc.getElementById("numberOfBullets").firstChild.data = numberOfBullets;
    }else{
        svgdoc.getElementById("numberOfBullets").firstChild.data = "infinite";
    }
    var pew = new Audio("shoot.wav");
    pew.play();
    // Create the bullet using the use node
    var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    svgdoc.getElementById("bullets").appendChild(bullet);
    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
    var bullet_x = player.position.x + PLAYER_SIZE.w/2.0 - BULLET_SIZE.w/2.0;
    var bullet_y = player.position.y + PLAYER_SIZE.h/2.0 - BULLET_SIZE.h/2.0;
    bullet.setAttribute("x",bullet_x);
    bullet.setAttribute("y",bullet_y);
    if (flip){
        bullet.setAttribute("speed",-BULLET_SPEED);
    }
    else
        bullet.setAttribute("speed", BULLET_SPEED);
}


//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            player.motion = motionType.LEFT;
            break;

        case "D".charCodeAt(0):
            player.motion = motionType.RIGHT;
            break;
			
        case "W".charCodeAt(0):
            if (player.isOnPlatform()||cheatMode) {
                player.verticalSpeed = JUMP_SPEED;
            }
            break;

        case 32: // spacebar = shoot
            if (canShoot) shootBullet();
            break;

        case "C".charCodeAt(0):
            cheatMode = true;
            player.node.setAttribute("opacity",0.5);
            break;
        case "V".charCodeAt(0):
            cheatMode = false;
            player.node.setAttribute("opacity",1);
            break;

	//add a case to shoot bullet
    }
}


//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;

        case "D".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
    }
}


//
// This function checks collision
//


function collisionDetection() {
    // check portal
    // first portal
    if(intersect(new Point(585,500),PORTAL_SIZE, player.position, PLAYER_SIZE))
    {
        player.position.x = 400;
        player.position.y = 120;
        player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");
    }

    //second portal
    if(intersect(new Point(445,80),PORTAL_SIZE, player.position, PLAYER_SIZE))
    {
        player.position.x = 540;
        player.position.y = 520;
        player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");
    }

    // Check whether the player collides with a monster
    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
        var x = parseInt(monster.getAttribute("x"));
        var y = parseInt(monster.getAttribute("y"));

        // For each monster check if it overlaps with the player
        // if yes, stop the game
        if (intersect(player.position, PLAYER_SIZE, new Point(x, y), MONSTER_SIZE)&&(!cheatMode)) {
            bgm.pause();
            bgm.currenttime = 0;
            var pew = new Audio("game_over.wav");
            pew.play();
            clearInterval(gameInterval);
            clearInterval(timeLeftInterval);
            // Get the high score table from cookies
            var table = getHighScoreTable();


            // Create the new score record
            var record = new ScoreRecord(name, score);

            // Insert the new score record
            var pos = table.length;
            for (var i = 0; i < table.length; i++) {
                if (record.score > table[i].score) {
                    pos = i;
                    break;
                }
            }
            table.splice(pos, 0, record);

            // Store the new high score table
            setHighScoreTable(table);

            // Show the high score table
            showHighScoreTable(table,pos);
            return;
        }

    }

    // Check whether a bullet hits a monster
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));

        for (var j = 0; j < monsters.childNodes.length; j++) {
            var monster = monsters.childNodes.item(j);
            var mx = parseInt(monster.getAttribute("x"));
            var my = parseInt(monster.getAttribute("y"));

            if (intersect(new Point(x, y), BULLET_SIZE, new Point(mx, my), MONSTER_SIZE)) {
                monsters.removeChild(monster);
                bullets.removeChild(bullet);
                var pew = new Audio("monsterdie.mp3");
                pew.play();

                score += 10*bonus;
                svgdoc.getElementById("score").firstChild.data = score;
            }

            // For each bullet check if it overlaps with any monster
            // if yes, remove both the monster and the bullet
        }
    }



    // Check whether the player collides with a good thing
    var goodThings = svgdoc.getElementById("goodThings");
    for (var i = 0; i < goodThings.childNodes.length; i++) {
        var goodThing = goodThings.childNodes.item(i);
        var goodThingX = parseInt(goodThing.getAttribute('x'));
        var goodThingY = parseInt(goodThing.getAttribute('y'));
        var goodThingPosition = new Point(goodThingX, goodThingY);
        if (intersect(player.position, PLAYER_SIZE, goodThingPosition, GOODTHING_SIZE)) {
            goodThings.removeChild(goodThing);
            i--;
            numberOfGoodThingsRemaining--;
                score += bonus * POINT_OF_GOOD_THING;
                svgdoc.getElementById("score").firstChild.data = score;

        }
    }

    var doors=svgdoc.getElementById("exit_here");
        var door = doors.childNodes.item(0);
        var x = parseInt(door.getAttribute("x"));
        var y = parseInt(door.getAttribute("y"));
        if(intersect(new Point(x, y), EXIT_SIZE, player.position, PLAYER_SIZE)&&numberOfGoodThingsRemaining==0) {
            var pew = new Audio("exit_door.wav");
            pew.play();
            gameLevelUp();
        }

}

function collideGoodThing(thingPosition, thingSize) {
    var goodThings = svgdoc.getElementById('goodThings');
    for (var i = 0; i< goodThings.childNodes.length; i++) {
        var node = goodThings.childNodes.item(i);
        if (node.nodeName != 'use') continue;
        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var pos = new Point(x, y);
        if (intersect(thingPosition, thingSize, pos, GOODTHING_SIZE)) return true;
    }
    return false;
}
//
// This function updates the position of the bullets
//
function moveBullets() {
    // Go through all bullets
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);

        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        node.setAttribute("x", x + parseInt(node.getAttribute("speed")));

        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w) {
            bullets.removeChild(node);
            i--;
        }
    }
}

    function moveMonsterBullet() {
        // Go through all monster bullets
        var monsterBullets = svgdoc.getElementById("monster_bullets");
        for (var i = 0; i < monsterBullets.childNodes.length; i++) {
            var node = monsterBullets.childNodes.item(i);
            var mx = parseInt(node.getAttribute("x"));
            var my = parseInt(node.getAttribute("y"));
                node.setAttribute('x', mx + parseInt(node.getAttribute("speed")));
            // If the bullet is not inside the screen delete it from the group
            if (parseInt(node.getAttribute('x')) > SCREEN_SIZE.w) {
                monsterBullets.removeChild(node);
                i--;
            }
            // Check whether the player collides with a monster bullets
                // For each monster check if it overlaps with the player
                // if yes, stop the game
                if (intersect(player.position, PLAYER_SIZE, new Point(mx, my), BULLET_SIZE)&&(!cheatMode)) {
                    var pew = new Audio("game_over.wav");
                    pew.play();
                    clearInterval(gameInterval);
                    clearInterval(timeLeftInterval);
                    // Get the high score table from cookies
                    var table = getHighScoreTable();


                    // Create the new score record
                    var record = new ScoreRecord(name, score);

                    // Insert the new score record
                    var pos = table.length;
                    for (var i = 0; i < table.length; i++) {
                        if (record.score > table[i].score) {
                            pos = i;
                            break;
                        }
                    }
                    table.splice(pos, 0, record);

                    // Store the new high score table
                    setHighScoreTable(table);

                    // Show the high score table
                    showHighScoreTable(table,pos);
                    return;
                }



        }

    }

function timeCheck(){
    timeLeft--;
    if(timeLeft<=0){
        var pew = new Audio("game_over.wav");
        pew.play();
        clearInterval(gameInterval);
        clearInterval(timeLeftInterval);
        // Get the high score table from cookies
        var table = getHighScoreTable();


        // Create the new score record
        var record = new ScoreRecord(name, score);

        // Insert the new score record
        var pos = table.length;
        for (var i = 0; i < table.length; i++) {
            if (record.score > table[i].score) {
                pos = i;
                break;
            }
        }
        table.splice(pos, 0, record);

        // Store the new high score table
        setHighScoreTable(table);

        // Show the high score table
        showHighScoreTable(table,pos);
        return;
    }
    svgdoc.getElementById("timeLeft").firstChild.data = timeLeft;
    var width = parseInt(svgdoc.getElementById("timeBar").getAttribute("width"))-2;
    svgdoc.getElementById("timeBar").setAttribute("width",width);
}



//
// This function updates the position and motion of the player in the system
//
function gamePlay() {
    // Check collisions, call the collisionDetection when you create the monsters and bullets
    collisionDetection();

    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();
    
    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT){
        flip = true;
        displacement.x = -MOVE_DISPLACEMENT;}
    if (player.motion == motionType.RIGHT){
        flip = false;
        displacement.x = MOVE_DISPLACEMENT;}

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;



    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;
    //Move the monsters
    moveMonsters();

    specialMonster();

    // Move the bullets, call the movebullets when you create the monsters and bullets

    moveBullets();

    //opacityCheck()

    moveMonsterBullet();

    updateScreen();
}

function gameLevelUp(){
    // Stop time and the game
    clearInterval(gameInterval);
    clearInterval(timeLeftInterval);
    cleanUpGroup("goodThings", false);
    cleanUpGroup("monsters", false);
    cleanUpGroup("bullets", false);


    // Level score
    score += level*100*bonus;
    score += timeLeft*bonus;
    svgdoc.getElementById("score").firstChild.data = score;
    startGame();
}

function specialMonster(){
    //special monster
    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monNode = monsters.childNodes.item(i);
        if(monNode.getAttribute("shoot")){
            if(monster_shoot){
                    monster_shoot = false;
                    var mx = parseInt(monNode.getAttribute("x"));
                    var my = parseInt(monNode.getAttribute("y"));
                    var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
                    svgdoc.getElementById("monster_bullets").appendChild(bullet);
                    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster_bullet");
                var bullet_x = mx + MONSTER_SIZE.w/2.0 - BULLET_SIZE.w/2.0;
                var bullet_y = my + MONSTER_SIZE.h/2.0 - BULLET_SIZE.h/2.0;
                    bullet.setAttribute("x",bullet_x);
                    bullet.setAttribute("y",bullet_y);
                    if (monNode.getAttribute("flip")==0){
                        bullet.setAttribute("speed",-BULLET_SPEED);
                    }else if(monNode.getAttribute("flip")==1){
                        bullet.setAttribute("speed",BULLET_SPEED);
                    }
                    setTimeout("monster_shoot=true", 2500);

            }
        }
    }
}


//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {
//transform the player
    if(flip){
        player.node.setAttribute("transform","translate(" + (player.position.x + PLAYER_SIZE.w)  + "," + player.position.y + ") scale(-1, 1)");
    }
    else
        player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");
    //Display player name
    if (nameTag != null){
        nameTag.setAttribute("x", player.position.x + 15);
        nameTag.setAttribute("y", player.position.y - 5);
    }
    // Calculate the scaling and translation factors
    var scale = new Point(zoom, zoom);
    var translate = new Point();

    
    translate.x = SCREEN_SIZE.w / 2.0 - (player.position.x + PLAYER_SIZE.w / 2) * scale.x;
    if (translate.x > 0) 
        translate.x = 0;
    else if (translate.x < SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x)
        translate.x = SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x;

    translate.y = SCREEN_SIZE.h / 2.0 - (player.position.y + PLAYER_SIZE.h / 2) * scale.y;
    if (translate.y > 0) 
        translate.y = 0;
    else if (translate.y < SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y)
        translate.y = SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y;

            
    // Transform the game area
    svgdoc.getElementById("gamearea").setAttribute("transform", "translate(" + translate.x + "," + translate.y + ") scale(" + scale.x + "," + scale.y + ")");	
}


//
// This function sets the zoom level to 2
//
function setZoom() {
    startGame();
    zoomMode = true;
    zoom = 2.0;
    bonus = 2;
    insertName();
}
function defaultZoom(){
    startGame();
    zoomMode = false;
    zoom = 1.0;
    bonus = 1;
    insertName();
}

function replay(){
    bgm.pause();
    bgm.currentTime = 0;
    cleanUpGroup("player_name", false);
    cleanUpGroup("monsters", false);
    cleanUpGroup("bullets", false);
    cleanUpGroup("highscoretext", false);
    cleanUpGroup("goodThings", false);

    svgdoc.getElementById("highscoretable").style.setProperty("visibility", "hidden", null);
    score=0;
    cheatMode = false;
    svgdoc.getElementById("score").firstChild.data = score;
    numberOfBullets=8;

    svgdoc.getElementById('start').style.setProperty("visibility", "visible", null);

    // startGame();
    // insertName();
    //

}
