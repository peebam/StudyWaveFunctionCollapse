enum TileTypes {
  BLANK = 0,
  RIGHT_DOWN_LEFT = 1,
  DOWN_LEFT_UP = 2,
  LEFT_UP_RIGHT = 3,
  UP_RIGHT_DOWN = 4,
  DOWN_LEFT = 5,
  LEFT_UP = 6,
  UP_RIGHT = 7,
  RIGHT_DOWN = 8,
}

const VECTOR2_UP: Vector2 = { x: 0, y: -1 };
const VECTOR2_DOWN: Vector2 = { x: 0, y: 1 };
const VECTOR2_LEFT: Vector2 = { x: -1, y: 0 };
const VECTOR2_RIGHT: Vector2 = { x: 1, y: 0 };

type Vector2 = {
  x: number;
  y: number;
};

type Connections = {
  [index in TileTypes]: {
    up: boolean;
    left: boolean;
    down: boolean;
    right: boolean;
  };
};

type Cell = {
  coordinates: Vector2;
  collapsed: boolean;
  options: TileTypes[];
};


let tiles: Record<TileTypes, p5.Image>;
const grid: Cell[] = [];

const connections: Connections = {
  [TileTypes.BLANK]: {
    up: false,
    left: false,
    down: false,
    right: false,
  },
  [TileTypes.RIGHT_DOWN_LEFT]: {
    up: false,
    left: true,
    down: true,
    right: true,
  },
  [TileTypes.DOWN_LEFT_UP]: {
    up: true,
    left: true,
    down: true,
    right: false,
  },
  [TileTypes.LEFT_UP_RIGHT]: {
    up: true,
    left: true,
    down: false,
    right: true,
  },
  [TileTypes.UP_RIGHT_DOWN]: {
    up: true,
    left: false,
    down: true,
    right: true,
  },
  [TileTypes.DOWN_LEFT]: {
    up: false,
    left: true,
    down: true,
    right: false,
  },
  [TileTypes.LEFT_UP]: {
    up: true,
    left: true,
    down: false,
    right: false,
  },
  [TileTypes.UP_RIGHT]: {
    up: true,
    left: false,
    down: false,
    right: true,
  },
  [TileTypes.RIGHT_DOWN]: {
    up: false,
    left: false,
    down: true,
    right: true,
  },
};

const DIMENSION = 20;

function preload() {
  tiles = {
    [TileTypes.BLANK] : loadImage("./assets/tile0.png"),
    [TileTypes.RIGHT_DOWN_LEFT] : loadImage("./assets/tile1.png"),
    [TileTypes.DOWN_LEFT_UP] : loadImage("./assets/tile2.png"),
    [TileTypes.LEFT_UP_RIGHT] : loadImage("./assets/tile3.png"),
    [TileTypes.UP_RIGHT_DOWN] : loadImage("./assets/tile4.png"),
    [TileTypes.DOWN_LEFT] : loadImage("./assets/tile5.png"),
    [TileTypes.LEFT_UP] : loadImage("./assets/tile6.png"),
    [TileTypes.UP_RIGHT] : loadImage("./assets/tile7.png"),
    [TileTypes.RIGHT_DOWN] : loadImage("./assets/tile8.png")
  };
}

function computeAgency() {
  
} 

function setup() {
  frameRate(60);
  initGrid();
}

function draw() {
  makeGrid();
}

function mouseClicked() {
  initGrid();
  makeGrid();
}

function initGrid() {
  createCanvas(800, 800);
  for (let i = 0; i < DIMENSION * DIMENSION; i++) {
    grid[i] = {
      coordinates: indexToCoordinates(i),
      collapsed: false,
      options: [
        TileTypes.BLANK,
        TileTypes.RIGHT_DOWN_LEFT,
        TileTypes.DOWN_LEFT_UP,
        TileTypes.LEFT_UP_RIGHT,
        TileTypes.UP_RIGHT_DOWN,
        TileTypes.DOWN_LEFT,
        TileTypes.LEFT_UP,
        TileTypes.UP_RIGHT,
        TileTypes.RIGHT_DOWN,
      ],
    };
  }
}

function makeGrid() {
  const w = width / DIMENSION;
  const h = height / DIMENSION;

  while (true) {
    const sortedGrid = grid
      .slice()
      .filter((c) => !c.collapsed)
      .sort((a, b) => a.options.length - b.options.length);

    if (sortedGrid.length === 0) {
      return;
    }

    const minEntropy = sortedGrid[0].options.length;
    const minEntropyCells = sortedGrid.filter(
      (c) => c.options.length === minEntropy
    );

    const cell = random(minEntropyCells) as Cell;
    const option = random(cell.options) as TileTypes;

    console.log(cell);
    cell.collapsed = true;
    if (cell.options.length === 0) {
      fill("red");
      noStroke();
      rect(cell.coordinates.x * w, cell.coordinates.y * h, w, h);
      continue;
    }

    cell.options = [option];

    const coordCellUp = translateCoordinates(cell.coordinates, VECTOR2_UP);
    if (coordCellUp) {
      const cellUp = grid[coordinatesToIndex(coordCellUp)];
      cellUp.options = cellUp.options.filter(
        (c) => connections[option].up === connections[c].down
      );
    }

    const coordCellDown = translateCoordinates(cell.coordinates, VECTOR2_DOWN);
    if (coordCellDown) {
      const cellDown = grid[coordinatesToIndex(coordCellDown)];
      cellDown.options = cellDown.options.filter(
        (c) => connections[option].down === connections[c].up
      );
    }

    const coordCellLeft = translateCoordinates(cell.coordinates, VECTOR2_LEFT);
    if (coordCellLeft) {
      const cellLeft = grid[coordinatesToIndex(coordCellLeft)];
      cellLeft.options = cellLeft.options.filter(
        (c) => connections[option].left === connections[c].right
      );
    }

    const coordCellRight = translateCoordinates(
      cell.coordinates,
      VECTOR2_RIGHT
    );
    if (coordCellRight) {
      const cellRight = grid[coordinatesToIndex(coordCellRight)];
      cellRight.options = cellRight.options.filter(
        (c) => connections[option].right === connections[c].left
      );
    }

    image(tiles[option], cell.coordinates.x * w, cell.coordinates.y * h, w, h);
  }
}

function translateCoordinates(
  coordinates: Vector2,
  direction: Vector2
): Vector2 | undefined {
  const translated: Vector2 = {
    x: coordinates.x + direction.x,
    y: coordinates.y + direction.y,
  };

  if (translated.x < 0 || translated.x >= DIMENSION) return undefined;
  if (translated.y < 0 || translated.y >= DIMENSION) return undefined;
  return translated;
}

function indexToCoordinates(index: number): Vector2 {
  const y = Math.floor(index / DIMENSION);
  const x = index - y * DIMENSION;

  return { x, y };
}

function coordinatesToIndex(coordinates: Vector2): number {
  return coordinates.x + coordinates.y * DIMENSION;
}
