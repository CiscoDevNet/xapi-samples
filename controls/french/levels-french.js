//
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License
//

function debug(entry) {
    console.log(entry)
}

function fine(entry) {
    console.debug(entry)
}

function Maze(structure, walls, phrases, scores, treasure) {
    this.structure = structure
    this.walls = walls
    this.phrases = phrases
    this.scores = scores
    this.treasure = treasure

    this.score = 0
    this.position = [1, 1]
}

Maze.prototype.updateScore = function (points) {
    this.score += points
}

Maze.prototype.isOver = function () {
    return (this.score < 0)
}

Maze.prototype.isWon = function () {
    return (this.score >= this.scores[this.treasure])
}

Maze.prototype.tryMove = function (direction) {
    debug(`trying ${direction}`)
    var result
    switch (direction) {
        case 'up':
            result = this._move(this.position, -1, 0);
            break
        case 'down':
            result = this._move(this.position, 1, 0)
            break
        case 'left':
            result = this._move(this.position, 0, -1)
            break
        case 'right':
            result = this._move(this.position, 0, 1)
            break
        default:
            throw new Error("unknown direction");
    }

    // update position
    this.position = result.pos

    // update score
    this.updateScore(result.points)
    fine(`score updated to ${this.score}`)

    // return move outcome
    result.direction = direction
    result.score = this.score

    return result
}

Maze.prototype.up = function () {
    return this.tryMove('up');
}

Maze.prototype.down = function () {
    return this.tryMove('down');
}

Maze.prototype.left = function () {
    return this.tryMove('left');
}

Maze.prototype.right = function () {
    return this.tryMove('right');
}

Maze.prototype._getPointsFor = function (character) {
    if (!this.scores) {
        fine('no scoring for this game')
        return 0
    }

    let points = this.scores[character]
    if (!points) {
        return 0
    }

    return points
}

// Returns the outcome of the specified move, but does not actually perform it
Maze.prototype._move = function (pos, x, y) {
    let newX = pos[0] + x
    let newY = pos[1] + y

    // Check what's laying at new positiob
    let thingCharacter = this.structure[newX][newY]

    // What did we meed
    var story = this.phrases[thingCharacter]
    debug('> ' + story)

    // If this is a wall, stay at current position
    if (this.walls.includes(thingCharacter)) {

        fine(`staying at: ${pos}`)
        return {
            'success': false,
            'outcome': story,
            'thing': this.look(pos),
            'pos': pos,
            'points': this._getPointsFor(thingCharacter)
        }
    }

    // Move to new position
    var newPos = [newX, newY]
    fine(`now at: ${newPos}`)
    return {
        'success': true,
        'outcome': 'move successful',
        'thing': this.look(newPos),
        'pos': newPos,
        'points': this._getPointsFor(thingCharacter)
    }
}

// Returns what is laying at specified location
Maze.prototype.look = function (pos) {
    var x = pos[0]
    var y = pos[1]
    var thing = this.structure[x][y]
    return this.phrases[thing];
}

// Use this function if the output supports Newlines
Maze.prototype.buildMap = function () {
    var pos = this.position
    var poster = ""
    for (var y = 0; y < this.structure.length; y++) {
        var line = ""
        for (var x = 0; x < this.structure[0].length; x++) {
            var char = this.structure[y][x]
            if ((y == pos[0]) && x == pos[1]) {
                char = 'o'
            }
            line += char
        }
        poster += line + "\n"
    }
    debug("poster:\n" + poster)
    return poster
}

// Use this function if the output does NOT supports newlines
Maze.prototype.buildMapAsWrapped = function (linewidth, skipBorders) {

    var map = ""
    var pos = this.position
    for (var y = 0; y < this.structure.length; y++) {
        if (!(skipBorders && ((y == 0) || (y == this.structure.length - 1)))) {
            var line = ""
            for (var x = 0; x < this.structure[0].length; x++) {
                var char = this.structure[y][x]
                if ((y == pos[0]) && x == pos[1]) {
                    char = 'o'
                }
                line += char
            }
            var left = Math.round((linewidth - line.length) / 2)
            var mazeline = line.padStart(left + line.length, "-")
            map += mazeline.padEnd(linewidth, "-")
            map += " "
        }
    }
    debug("maze map:" + map)
    return map
}

// Used to initialize the maze
Maze.prototype.pickInitialPosition = function (emptyChar) {
    if (!emptyChar) emptyChar = ' '

    // Ping a random number, on an empty spot
    while (true) {
        var y = Math.round(Math.random() * (this.structure.length - 2) + 1)
        var x = Math.round(Math.random() * (this.structure[0].length - 2) + 1)
        fine(`picked x: ${x}, y: ${y}`)

        if (this.structure[y][x] == emptyChar) {
            fine(`position is clear, storing...`)
            return this._setPosition(x, y)
        }
    }
}

Maze.prototype._setPosition = function (x, y) {
    this.position = [y, x]
    return this.position
}


//
// Utilities
//

function showProgress(count, delay, cb, final, initial) {
    return new Promise(function (resolve, reject) {
        var counter = 0
        if (!initial) initial = ""
        var progress = ".....".padEnd(count, '.')
        var timer = setInterval(function (event) {
            cb(initial + progress.substring(0, counter + 1))
            counter++;
            if (counter >= count) {
                clearInterval(timer)
                resolve(cb(final))
            }
        }, delay)
    })
}


//
// Room Controls
//

const xapi = require('xapi');


function showScore(message) {
    console.debug('refresh score')

    // Display current score unless a message is specifid    
    if (!message) {
        message = game.score
    }

    xapi.command('UserInterface Extensions Widget SetValue', {
        WidgetId: 'score',
        Value: message
    })
}


function showInstructions(message) {
    //console.debug('updating instructions')
    xapi.command('UserInterface Extensions Widget SetValue', {
        WidgetId: 'instructions',
        Value: message
    })
}


function showDifficulty(level) {
    xapi.command('UserInterface Extensions Widget SetValue', {
        WidgetId: 'difficulty',
        Value: level
    })
}


// Displays the outcome of the latest move
function showOutcome(res, initial) {
    console.log('computing instructions from latest move')

    // Tell the reason if the move was not successful
    let message = res.outcome
    if (res.success) {
        // Tell the thing met at the new location
        message = res.thing
    }

    // update instructions
    showProgress(5, 500, showInstructions, message, initial).then(() => {
        // Check score, if <0 game over
        if (game.isOver()) {
            showScore("Game Over")
        }
        else {
            // refresh score
            showScore()
        }

    })
}


// Displays the Maze's map on an Alert Panel
function showHelp() {
    console.debug("showing map in Alert Panel")

    // Does the user has enough points ?
    if (game.score < 500) {
        console.debug("not enough points to show the map")
        showInstructions("Désolé, vous n'avez pas suffisamment de points.")
        return
    }

    // Remove 500 points
    game.updateScore(-500)

    // The maze needs to be wrapped as In-Room Controls do not support multi-lines
    // Each line's width depends on the device: 51 for Touch10 dispay, 31 for Screen display
    xapi.status.get("SystemUnit ProductPlatform").then((product) => {
        console.debug(`running on a ${product}`)

        let width = 45 // when the Alert is shown on a Touch 10
        if (product == "DX80") {
            console.debug('has no Touch10 attached')
            width = 30 // when the Alert is shown on a screen
        }

        // Show Alert panel 
        // Increase the duration with the difficulty to leave time for the user to memorize the map
        // Note that the panel will stay on if duration is >= 10.
        xapi.command('UserInterface Message Alert Display', {
            Title: "Un peu d'aide de la part ... d'un ami",
            Text: game.buildMapAsWrapped(width, true),
            Duration: 5 * (difficulty + 1)
        }).then(() => {
            showScore()
        })
    })
}


function translate(direction) {
    switch (direction) {
        case 'right': return 'vers la droite'
        case 'left': return 'vers la gauche'
        case 'up': return 'vers le haut'
        case 'down': return 'vers le bas'
        default: 
            console.debug(`unexpected direction: ${direction}`)
            return 'inconnu'
    }
}

function onGui(event) {

    if (event.Type == 'clicked') {

        // Restart button
        if (event.WidgetId == 'restart') {
            restart()
            return
        }

        // Check game is still running
        if (game.isOver()) {
            showInstructions("Désolé, vous n'avez pas réussi cette fois-ci. Appuyez sur 'Redémarrer'")
            return
        }

        // Check treasure has not been found
        if (game.isWon()) {
            showInstructions("Il semble que vous ayez déjà trouvé le trésor! Appuyez sur 'Redémarrer'")
            return
        }

        if (event.WidgetId == 'directions') {
            var direction = event.Value

            // If center was hitted, display help
            if (direction == 'center') {
                showHelp()
                return
            }

            showInstructions(`déplacement ${translate(direction)}`)
            var res = game.tryMove(direction)
            showOutcome(res, `déplacement ${translate(direction)}`)
            return
        }
    }

    if (event.Type == 'pressed') {
        if (event.WidgetId == 'difficulty') {
            difficulty = event.Value
            debug(`set difficulty level to: ${difficulty}`)
        }
    }
}
xapi.event.on('UserInterface Extensions Widget Action', onGui);


function restart() {
    console.log('resetting the maze')

    // Show current level while game initializes
    showScore(levels[difficulty])

    // Create the maze 
    game = new Maze(structures[difficulty], walls, phrases, scores, '?')
    game.pickInitialPosition('_')
    game.updateScore(1000)

    // Update UI
    showProgress(10, 200, showInstructions, 'Bienvenue dans le labyrinthe: partez à la recherche du trésor. Choisissez une direction...', 'Chargement')
        .then(() => {
            showScore()
            showDifficulty(difficulty)
        })
}


//
// Maze artefacts
//

// Build structures
var structures = []

var structure = []
structure[0] = ['|', '-', '-', '-', '-', '-', '|']
structure[1] = ['|', 'M', 'C', '_', '_', '_', '|']
structure[2] = ['|', '_', '_', 'X', 'D', '_', '|']
structure[3] = ['|', '_', 'X', '?', 'X', '_', '|']
structure[4] = ['|', '_', '_', '_', '_', 'X', '|']
structure[5] = ['|', '-', '-', '-', '-', '-', '|']
structures[0] = structure

structure = []
structure[0] = ['|', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '|']
structure[1] = ['|', '_', '_', '_', 'D', 'X', '_', '_', '_', 'M', '_', 'X', '_', '_', 'X', '_', '|']
structure[2] = ['|', 'C', 'X', '_', '_', 'X', '_', 'X', '_', '_', '_', '_', '_', 'X', 'X', 'C', '|']
structure[3] = ['|', '_', '_', 'X', '_', '_', '_', 'D', 'X', 'C', '_', 'X', '_', '_', '_', '_', '|']
structure[4] = ['|', 'D', '_', '?', 'X', '_', '_', '_', '_', 'X', '_', 'X', '_', '_', 'X', '_', '|']
structure[5] = ['|', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '|']
structures[1] = structure

structure = []
structure[0] = ['|', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '|']
structure[1] = ['|', 'C', '_', '_', 'D', '_', 'M', '_', 'X', '_', '_', '_', 'C', 'D', '_', 'C', '_', '_', '_', 'X', '_', '_', '_', '_', '_', '_', 'X', 'C', '_', 'D', '_', '_', 'X', '|']
structure[2] = ['|', '_', '_', 'X', 'X', '_', '_', '_', 'X', 'C', 'M', '_', 'X', '_', '_', '_', 'M', 'D', '_', '_', 'X', '_', '_', 'X', 'D', '_', '_', 'X', '_', '_', '_', 'X', 'C', '|']
structure[3] = ['|', '_', 'X', 'C', '_', 'X', 'X', '_', '_', '_', 'X', 'X', '_', '_', 'D', 'X', 'X', '_', '_', 'X', '_', 'M', 'X', 'C', '_', '_', 'M', '_', '_', 'X', '_', '_', '_', '|']
structure[4] = ['|', '_', '_', 'D', '_', '_', '?', 'X', '_', 'X', 'C', '_', '_', 'X', 'X', 'X', 'D', '_', '_', '_', 'C', '_', '_', '_', 'X', '_', '_', '_', 'C', 'X', '_', 'D', 'M', '|']
structure[5] = ['|', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '|']
structures[2] = structure

var walls = ['|', '-', 'X']

var phrases = {}
phrases['|'] = "Déplacement impossible, vous venez de heurtez une bordure."
phrases['-'] = "Déplacement impossible, vous venez de heurtez une bordure."
phrases['|'] = "Déplacement impossible, vous venez de heurtez une bordure."
phrases['X'] = "Ouille, vous venez de vous cogner dans un mur!"
phrases['_'] = "Il n'y a rien ici. Continuez à explorer."
phrases['C'] = "Bonjour petit chat. Tu as l'air affamé. Es-tu perdu ?"
phrases['D'] = "AHHH, un chien aggressif est allongé ici. Il vient de vous mordre !"
phrases['M'] = "Trop tard, le monstre hideux vous a repéré. COURREZ !!!"
phrases['?'] = "Félicitations, vous avez trouvé le trésor !"

var scores = {}
scores['|'] = -200
scores['-'] = -200
scores['|'] = -200
scores['X'] = -100
scores['_'] = 50
scores['C'] = 200
scores['D'] = -200
scores['M'] = -500
scores['?'] = 5000

var levels = []
levels[0] = 'Débutant'
levels[1] = 'Avancé'
levels[2] = 'Expert'
var difficulty = 0

//
// Start game
//

console.info("Starting Maze game, v1.0.0")
var game
restart()
