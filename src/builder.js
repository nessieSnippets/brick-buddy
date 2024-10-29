const { envelopeMaxBricksWidth, envelopeMaxBricksHeight } = require('./helpers/constants');

/**
 * Returns true if every cell in the given wall is built (i.e. state = 1)
 * @returns boolean
 */
const isWallComplete = (wall) => {
    let designBrickFound = false;
    for(let y = 0; y < wall.length; y++) {
        const row = wall[y];
        if(designBrickFound) break;
        for(let x = 0; x < row; x++) {
            const cell = row[x];
            if(cell.state === 0) {
                designBrickFound = true;
                break;
            }
        }
    }

    return designBrickFound;
}

/**
 * Returns boolean if the given brick is in a layable state and position
 * Checks if this brick:
 * - is already built
 * - would fit in buddy's envelope X/Y
 * - would fit in the stride already built (i.e. where buddy's envelope currently sits)
 * - would be 'hanging' (bricks can only lie fully on top of bed or other bricks)
 * @param {*} brickCoords { x: number, y: number}[]
 * @param {*} wall
 * @param {*} envelopeState
 * @returns boolean
 */
const canLayBrick = (brickCoords, wall, envelopeState) => {
    const { bottomLeft, topRight } = envelopeState;

    // Array of the brick cells, { type: string, state: number}[]
    const cells = brickCoords.map(({ x, y }) => wall[y][x]);

    // Already built?
    const isAlreadyBuilt = cells.find((cell) => cell.state === 1);
    if (isAlreadyBuilt) {
        return false;
    }

    // Imagine laying this brick. Do we go outside Buddy's envelope?
    const [rightMostCell] = brickCoords.slice(-1);
    const newBottomLeft = {
        ...bottomLeft,
        x: bottomLeft.x < brickCoords[0].x ? bottomLeft.x : brickCoords[0].x,
    }
    const newTopRight = {
        ...topRight,
        x: topRight.x > rightMostCell.x ? topRight.x : rightMostCell.x,
        y: topRight.y > rightMostCell.y ? topRight.y : rightMostCell.y,
    }
    // Check if outside possible envelope
    const xDiff = newTopRight.x - newBottomLeft.x;
    const yDiff = newTopRight.y - newBottomLeft.y;
    if(xDiff > envelopeMaxBricksWidth * 2 ) {
        return false;
    } if (yDiff > envelopeMaxBricksHeight) {
        return false;
    }

    // Bricks can be laid on top of the bed (i.e. y[0]) or fully on other bricks
    // (i.e. no 'hanging' bricks)
    const isFirstRow = brickCoords[0].y === 0;
    if (isFirstRow) {
        return true;
    } else {
        // Check below coords if there is something there
        let isBuildable = true;
        for (let x = 0; x < brickCoords.length; x++) {
            const coord = brickCoords[x];
            const cellBelow = wall[coord.y - 1][coord.x];
            isBuildable = isBuildable && cellBelow.state === 1
        }
        return isBuildable;
    }
}

/**
 * Lays brick at the given coordinates and returns the updated information about wall state
 * @param {*} coords Current pointer coordiates.
 * @param {*} wall The current state of the wall
 * @param {*} envelopeState Contains what's in stride so far and original coordinates
 * StrideBuiltX is 0-3.5, StrideBuiltY is 0-20
 * Needs furthest X-X, Y-Y
 */
const layABrick = (coords, wall, envelopeState, strideNumber) => {
    const { x, y } = coords;
    const { strideBuiltX, strideBuiltY, startPoint, bottomLeft, topRight } = envelopeState;
    
    const currentBrickCoords = getBrickCoords(coords, wall);
    const isLayable = canLayBrick(currentBrickCoords, wall, envelopeState);
    if (isLayable) {
        // Lay the brick
        currentBrickCoords.forEach(({ x, y }) => {
            const brickCell = wall[y][x];
            wall[y][x] = { ...brickCell, state: 1, buildGroup: strideNumber };
        });

        // Update the envelope info
        const changeInY = y - startPoint.y;

        const [rightMostCell] = currentBrickCoords.slice(-1);

        const newBottomLeft = {
            ...bottomLeft,
            x: bottomLeft.x < currentBrickCoords[0].x ? bottomLeft.x : currentBrickCoords[0].x,
        }
        const newTopRight = {
            ...topRight,
            x: topRight.x > rightMostCell.x ? topRight.x : rightMostCell.x,
            y: topRight.y > rightMostCell.y ? topRight.y : rightMostCell.y,
        }
        
        const updatedEnvelope = {
            ...envelopeState,
            strideBuiltX: strideBuiltX + currentBrickCoords.length / 2,
            strideBuiltY: changeInY,
            bottomLeft: newBottomLeft,
            topRight: newTopRight,
        }

        // New pointer is the cell we're at after finishing laying this brick.
        const newPointer = { x: x + (currentBrickCoords.length-1), y: y };
        return {
            coords: newPointer,
            wall,
            envelopeState: updatedEnvelope,
            strideNumber,
        }
    } else {
        console.error(`Brick at starting point (${x}, ${y}) was not layable`);
    }
}

/**
 * RECURSIVE: Method to lay Bricks until limit reached
 * @param {*} coords Current pointer coordiates.
 * @param {*} wall The current state of the wall
 * @param {*} envelopeState Contains information about original starting point, as well
 * as the bounds of the envelope (bottomrLeft, topRight)
 * @returns |
 *  If the brick is laid, returns new pointer coords, updated wall and envelopeState
 *  If the brick is not laid, finds the next pointer coordinates. If unsucessful, will return false.
 */
const layBrick = (coords, wall, envelopeState, strideNumber) => {
    const { x, y } = coords;
    const { strideBuiltX, startPoint, bottomLeft, topRight } = envelopeState;

    const currentBrickCoords = getBrickCoords(coords, wall);
    const isLayable = canLayBrick(currentBrickCoords, wall, envelopeState);
    if (isLayable) {
        // Lay the brick
        currentBrickCoords.forEach(({ x, y }) => {
            const brickCell = wall[y][x];
            wall[y][x] = { ...brickCell, state: 1, buildGroup: strideNumber };
        });
        // Update the envelope info
        const changeY = y - startPoint.y;

        const rightMostCell = currentBrickCoords.slice(-1);
        const newBottomLeft = {
            ...bottomLeft,
            x: bottomLeft.x < currentBrickCoords[0].x ? bottomLeft.x : currentBrickCoords[0].x,
        }
        const newTopRight = {
            ...topRight,
            x: topRight.x > rightMostCell.x ? topRight.x : rightMostCell.x,
            y: topRight.y + changeY,
        }
        
        const updatedEnvelope = {
            ...envelopeState,
            strideBuiltX: strideBuiltX + currentBrickCoords.length / 2,
            strideBuiltY: changeY,
            bottomLeft: newBottomLeft,
            topRight: newTopRight,
        }

        // Deciding where to go next...
        let nextCoords = { x: x + currentBrickCoords.length, y: y};
        if(nextCoords.x < wall[0].length) {
            return layBrick(nextCoords, wall, updatedEnvelope, strideNumber);
        }
        else { 
            // We have hit the edge of the wall
            // Move up to the next row
            nextCoords.x = startPoint.x;
            nextCoords.y +=1;
            return layBrick(nextCoords, wall, updatedEnvelope, strideNumber);    
        }
    } else {
        // Find the next coordinates if possible and continue
        const nextCoords = findNextBuildCoords(coords, wall, envelopeState);
        if (nextCoords) {
            return layBrick(nextCoords, wall, envelopeState, strideNumber);
        } else {
            return {
                coords,
                wall,
                envelopeState,
                strideComplete: true,
            };
        }
    }
}

/**
 * Returns an array representing the X,Y coordinates of the brick in the grid
 * Half bricks will be array.length of 1
 * Assumes a valid place on the Grid
 * @param {*} currentCoords 
 * @param {*} wall 
 * @returns Array of {x: number, y: number} coords
 */
const getBrickCoords = (currentCoords, wall) => {
    const { x, y } = currentCoords;
    const currentCell = wall[y][x];

    const brickCoords = [];

    switch (currentCell.type) {
        case "H":
            brickCoords.push(currentCoords);
            break;
        case "L":
            brickCoords.push(currentCoords, { x: x + 1, y: y });
            break;
        case "R":
            brickCoords.push({ x: x - 1, y: y }, currentCoords);
            break;
    }
    return brickCoords;
}

/**
 * Finds the next place to lay a brick
 * If it cannot find a new place, the window is over. Returns falsey in that case.
 * @param {*} currentCoords 
 * @param {*} wall 
 * @param {*} envelopeUsed 
 */
const findNextBuildCoords = (currentCoords, wall, envelopeState) => {
    const { startPoint } = envelopeState;
    const { x, y } = currentCoords; // Refers to the cell reference

    const nextSpaceInRow = findNextStartingPointInRow(currentCoords, wall, envelopeState);
    if(nextSpaceInRow) {
        return nextSpaceInRow;
    } else {
        // Go up to the next row
        const nextRowY = y + 1;
        const nextRowX = startPoint.x;

        const nextSpaceInRowAbove = findNextStartingPointInRow({ x: nextRowX, y: nextRowY}, wall, envelopeState);
        if(nextSpaceInRowAbove) {
            return nextSpaceInRowAbove;
        } else {
            return false;
        }
    }
}


/**
 * RECURSIVE: Returns the next coordinate to start building from in the row
 * Checks L->R along the row, returning either the next building coordinate
 * or false if none available
 * @param {*} startingCoords 
 * @param {*} wall 
 * @param {*} envelopeState 
 */
const findNextStartingPointInRow = (startingCoords, wall, envelopeState) => {
    // Check starting coordinate is not outside wall boundary
    const isWithinGridBounds = withinGridBounds(startingCoords, wall);
    if (!isWithinGridBounds) {
        return false;
    }
    const brickCoords = getBrickCoords(startingCoords, wall);
    const isLayable = canLayBrick(brickCoords, wall, envelopeState);
    if (isLayable) {
        return brickCoords[0]; // Return starting point only
    } else {
        // If this is the last brick in the row, we have exhausted this row & cannot build here
        const lastCell = brickCoords.slice(-1);
        if (wall.length === lastCell.x + 1) {
            return false;
        }
        const {type: cellType} = wall[startingCoords.y][startingCoords.x];
        let nextX;
        if(cellType === "L") {
            nextX = startingCoords.x + 2
        } else {
            // half or R, move one across
            nextX = startingCoords.x + 1
        }
        // Move to the left and try again.
        const nextCoords = {
            ...startingCoords,
            // x: startingCoords.x + brickCoords.length, // Adds 1 or 2 depending on if it's a half brick
            x: nextX,
        }
        return findNextStartingPointInRow(nextCoords, wall, envelopeState);
    }
}

const withinGridBounds = (coord, wall) => {
    const { x, y } = coord;
    return x < wall[0].length && y < wall.length;
}

module.exports = {
    layABrick,
    findNextBuildCoords,
    isWallComplete,
}
