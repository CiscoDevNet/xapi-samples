//
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License
//

function debug(entry) {
    console.log(entry)
};

function fine(entry) {
    console.debug(entry)
};

function Maze(structure, walls, phrases) {
    this.structure = structure;
    this.walls = walls;
    this.phrases = phrases;
};


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

    this.position = result.pos
    result.direction = direction
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

Maze.prototype._move = function (pos, x, y) {
    let newX = pos[0] + x
    let newY = pos[1] + y

    let thing = this.structure[newX][newY]

    // What did we meed
    var story = this.phrases[thing]
    debug('> ' + story)

    // If this is a wall, stay at current position
    if (this.walls.includes(thing)) {
        fine(`still at: ${pos}`)
        this.position = pos
        return {
            'success': false,
            'outcome': story,
            'thing': this.look(pos),
            'pos': pos
        }
    }

    var newPos = [newX, newY]
    fine(`now at: ${newPos}`)
    this.position = pos
    return {
        'success': true,
        'thing': this.look(newPos),
        'pos': newPos
    }
}


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

Maze.prototype.pickInitialPosition = function (emptyChar) {
    if (!emptyChar) emptyChar = ' '

    // Ping a random number, on an empty spot
    while (true) {
        var y = Math.round(Math.random() * (this.structure.length - 2) + 1)
        var x = Math.round(Math.random() * (this.structure[0].length - 2) + 1)
        fine(`picked x: ${x}, y: ${y}`)

        if (this.structure[y][x] == emptyChar) {
            fine(`position is clear, storing...`)
            return this.setInitialPosition(x, y)
        }
    }
}

Maze.prototype.setInitialPosition = function (x, y) {
    this.position = [y, x]
    return this.position
}


//
// Utilities
//

function showProgress(count, delay, cb, final, initial) {
    var counter = 0
    if (!initial) initial = ""
    var progress = ".....".padEnd(count, '.')
    var timer = setInterval(function (event) {
        cb(initial + progress.substring(0, counter + 1))
        counter++;
        if (counter >= count) {
            clearInterval(timer)
            cb(final)
        }
    }, delay)
}


//
// Room Controls
//
const xapi = require('xapi');


function showInstructions(message) {
    console.debug('updating instructions')

    xapi.command('UserInterface Extensions Widget SetValue', {
        WidgetId: 'instructions',
        Value: message
    })
}


// Displays the outcome of the latest move
function showOutcome(res, initial) {
    console.debug('computing instructions from latest move')

    if (res.success) {
        // Tell the thing met at the new location
        showProgress(5, 500, showInstructions, res.thing, initial)
        return
    }

    // Tell the reason why the move was not successful
    showProgress(5, 500, showInstructions, res.outcome, initial)
}



// Displays help on the Touch10 or send the configuration to Cisco Spark
function showHelp() {
    console.log("showing map in Alert Panel")

    // Width depends on device
    // [TODO] check device
    xapi.status.get("SystemUnit ProductPlatform").then((product) => {
        let width = 31 // when the Alert is shown on the device output screen
        if (product == "Touch10") {
            console.debug('running on a Touch10')
            width = 51 // when the Alter is shown on a Touch10
        }

        // show Alter panel 
        xapi.command('UserInterface Message Alert Display', {
            Title: 'With a little help from ... the bot',
            Text: game.buildMapAsWrapped(width, true),
            Duration: 5
        })
    })
}


function onGui(event) {
    if (event.Type == 'clicked') {
        if (event.WidgetId == 'directions') {
            var direction = event.Value
            if (direction == 'center') {
                showHelp()
                return
            }

            showInstructions(`moving ${direction}`)
            var res = game.tryMove(direction)
            showOutcome(res, `moving ${direction}`)
            return
        }

        if (event.WidgetId == 'restart') {
            restart()
            return
        }

        // No more event listener
        return
    }
}
xapi.event.on('UserInterface Extensions Widget Action', onGui);


function restart() {
    console.log('resetting the maze')

    var structure = []
    structure[0] = ['|', '-', '-', '-', '-', '-', '|']
    structure[1] = ['|', '_', 'C', '_', '_', '_', '|']
    structure[2] = ['|', '_', '_', 'X', '_', '_', '|']
    structure[3] = ['|', '_', 'X', '?', 'X', '_', '|']
    structure[4] = ['|', '_', '_', '_', '_', 'X', '|']
    structure[5] = ['|', '-', '-', '-', '-', '-', '|']

    var walls = ['|', '-', 'X']

    var phrases = {}
    phrases['|'] = "cannot get there, this a maze border you just hitted"
    phrases['-'] = "cannot get there, this a maze border you just hitted"
    phrases['|'] = "cannot get there, this a maze border you just hitted"
    phrases['X'] = "ouch, you bumped a wall"
    phrases['_'] = "nothing here, let's continue exploring."
    phrases['C'] = "hello kitty, you look hungry. Are you lost too? Jump in."
    phrases['D'] = "WOW, an agressive dog is lying here. Better run away!"
    phrases['?'] = "CONGRATS, you found the treasure!!!"

    game = new Maze(structure, walls, phrases)
    game.pickInitialPosition('_')

    showProgress(10, 200, showInstructions, 'Then here you are: lost in an hostile maze, looking for a treasure. Pick a direction...', 'initializing the Maze')
}

var game;
if (!game) {
    // First run: 
    // - initialize maze
    restart()
}
