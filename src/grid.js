const clc = require('cli-color');
/**
 * Creates a row of given width, populated with empty cells.
 */
const createRow = (width) => {
    const row = [];
    for (let i = 0; i < width; i++) {
        row.push({ type: null, state: null });
    }
    return row;
}

/**
 * Creats an empty grid of Cells, fitting the wall dimensions.
 * We can place bricks in these cells; one cell is the size for a 
 * half brick. Full bricks lay across 2 cells.
 */
const createEmptyGrid = (width, height) => {
    const grid = [];

    for (let i = 0; i < height; i++) {
        const row = createRow(width);
        grid.push(row);
    }
    return grid;
}

/**
 * Returns a grid showing design for a Stretcher Bond. 
 * Drawn left to right, starting from bottom left corner.
 * 
 * Stretcher Bond Rules:
 * - Half brick cannot sit on top of a half brick
 * - Rows must alternate beginning with half or full brick
 * 
 * @param grid 2D array
 */
const visualiseStretcherBond = (grid) => {
    const newGrid = [];
    for (let y = 0; y < grid.length; y++) {
        const newRow = [];
        const rowLength = grid[y].length;

        const rowBeginsWithHalf = y % 2 === 0;
        let startingPoint = 0;
        if (rowBeginsWithHalf) {
            newRow.push({ state: 0, type: "H" });
            startingPoint = 1;
        }
        for (let x = startingPoint; x < rowLength; x += 2) {
            if (rowLength - x === 1) {
                newRow.push({ state: 0, type: "H" });
            } else {
                newRow.push({ state: 0, type: "L" });
                newRow.push({ state: 0, type: "R" });
            }
        }
        newGrid.push(newRow);
    }
    return newGrid;
}

/**
 * Stack Bond Rules:
 * - Stacked full bricks on top of each other 
 * @param {*} grid 
 */
const visualiseStackBond = (grid) => {
    const newGrid = [];
    for (let y = 0; y < grid.length; y++) {
        const newRow = [];
        const rowLength = grid[y].length;

        for (let x = 0; x < rowLength; x += 2) {
            // If there's less than a brick space left, we add a half brick
            if(x === rowLength -1) {
                newRow.push({ state: 0, type: "H" });
            } else {
                newRow.push({ state: 0, type: "L" });
                newRow.push({ state: 0, type: "R" });
            }
        }
        newGrid.push(newRow);
    }
    return newGrid;
}

/**
 * WIP - Incomplete, not yet visualised correctly on grid
 * 
 * French Bond Rules:
 * - Every course alternately consists of a stretcher and two headers
 * @param {*} grid 
 */
const visualiseFrenchBond = (grid) => {
    const newGrid = [];

    for (let y = 0; y < grid.length; y++) {
        const newRow = [];
        const rowLength = grid[y].length;

        const rowBeginsWithHalf = y % 2 === 0;
        let startingPoint = 0;
        if (rowBeginsWithHalf) {
            newRow.push({ state: 0, type: "H" });
            startingPoint = 1;
        }
        for (let x = startingPoint; x < rowLength; x += 4) {
            newRow.push({ state: 0, type: "L" });
            newRow.push({ state: 0, type: "R" });
            newRow.push({ state: 0, type: "H" });
            newRow.push({ state: 0, type: "H" });
        }
        newGrid.push(newRow);
    }
    return newGrid;
}

/**
 * Prints the given grid to the console, using different colors depending on
 * if the cell(s) are representing a design or built brick and when the brick
 * was laid.
 * @param {*} grid 
 */
const printGrid = (grid) => {
    const mapper = {
        "H": '|_|',
        "L": '|__',
        "R": '_|',
    }

    const builtMapper = {
        "H": '|#|',
        "L": '|##',
        "R": '#|',
    }

    // Otherwise it prints top to bottom
    const flipped = Array.from(grid);

    // Printy print
    flipped.reverse().forEach((row) => {
        row.forEach(({ state, type, buildGroup }, index) => {
            // Format if last in the row
            let cellString = state === 0 ? mapper[type] : builtMapper[type]
            cellString = row.length === index + 1 ? cellString + "\n" : cellString;
            // Print
            print(cellString, state, buildGroup);
        })
    })
}

const designBrickColor = 231; // White
const print = (cellString, state, colorKey) => {
    // Design bricks should always be printed in the same color
    if (state === 0) {
        const msg = clc.xterm(designBrickColor);
        process.stdout.write(msg(cellString));
    // Use different color for each build grouping (i.e. stride)
    } else {
        const _colorKey = colorKey < 15 ? colorKey : getRandomColorCode(colorKey);
        const msg = clc.xterm(_colorKey);
        process.stdout.write(msg(cellString));
    }
}

const getRandomColorCode = (colorKey) => {
    let _code = colorKey * (colorKey % 15);
    if(_code === 15) {
        _code = 127;
    } else if (_code === 0 || _code === 16) {
        _code === 37;
    }
    return _code;
}

module.exports = {
    createEmptyGrid,
    visualiseStretcherBond,
    visualiseStackBond,
    visualiseFrenchBond,
    printGrid,
}
