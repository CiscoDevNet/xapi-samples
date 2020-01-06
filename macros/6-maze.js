function debug(entry) {
   console.log(entry)
};

function fine(entry) {
   console.log(entry)
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
   debug("map:\n" + poster)
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
            if ((y == pos[1]) && (x == pos[0])) {
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
   debug("maze map"); // newlines not supportes here
   debug(map)
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
   this.position = [x, y]
   return this.position
}

//
// Custom logic
//

var structure = []

structure[0] = ['X', 'X', 'X', 'X', 'X', 'X', 'X']
structure[1] = ['X', ' ', ' ', ' ', ' ', ' ', 'X']
structure[2] = ['X', 'X', ' ', ' ', ' ', 'X', 'X']
structure[3] = ['X', ' ', 'c', 'X', ' ', ' ', 'X']
structure[4] = ['X', 'd', 'X', '?', 'X', ' ', 'X']
structure[5] = ['X', ' ', ' ', ' ', ' ', 'X', 'X']
structure[6] = ['X', 'X', 'X', 'X', 'X', 'X', 'X']

var walls = ['X']

var phrases = {}
phrases['X'] = "ouch, you bumped a wall"
phrases[' '] = "sorry, nothing here"
phrases['c'] = "hello kitty"
phrases['d'] = "wow, an agressive dog is lying here"
phrases['?'] = "congrats you found the treasure"

var game = new Maze(structure, walls, phrases);

var pos = game.pickInitialPosition()
console.log(`starting from: ${pos}`)
game.buildMap()

// Reset to 1,5
var pos = game.setInitialPosition(1, 5)
console.log(`starting from: ${pos}`)
game.buildMap()

// bumping a wall
console.log('moving up')
var res = game.up()
if (res.success) {
   console.log("did went up :-)")
}
else {
   console.log("stuck!")
}

// solution
game.left()
game.left()
game.left()
game.down()
game.down()
game.left()
game.down()
game.down()
game.right()
game.right()
game.up()


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
game.buildMapAsWrapped(124, true)
