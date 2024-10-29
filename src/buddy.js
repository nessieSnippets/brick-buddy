const { confirm } = require("@inquirer/prompts");
const { calculatesGridSize } = require('./helpers/helper');
const { createEmptyGrid, printGrid } = require('./grid');
const { layABrick, findNextBuildCoords, isWallComplete } = require('./builder');

const { height, width } = calculatesGridSize();
const DEFAULT_EMPTY_GRID = createEmptyGrid(width, height)

const calculateStartingCoords = (wall) => {
    // Find the lowest x point to start on
    let startCoords = { x: null, y: null };

    for (let y = 0; y < wall.length; y++) {
        const row = wall[y];
        if (startCoords.x === null && startCoords.y === null) {
            for (let x = 0; x < row.length; x++) {
                const cell = row[x];
                if (cell.state === 0) {
                    startCoords.x = x,
                        startCoords.y = y
                    break;
                }
            }
        }
    }
    return startCoords;
}

/**
 * Lays a stride brick by brick
 * Optionally recursive with user input
 */
const layAStride = async (startCoords, wall, strideNumber) => {
    const wallComplete = isWallComplete(wall);
    if(wallComplete) {
        return {
            wall: wall,
            strideEnded: true,
            wallComplete,
            strideNumber,
        }
    }
    const buildEnvelope = { strideBuiltX: 0, strideBuiltY: 0, startPoint: startCoords, bottomLeft: startCoords, topRight: startCoords, };

    // Iterates brick by brick over this stride
    const { coords: newCoords, wall: updatedWall } = await promptLayBrick(startCoords, wall, buildEnvelope, strideNumber)
    console.log(`Stride ${strideNumber} ends at X: ${newCoords.x}, Y: ${newCoords.y}`);

    // Calculate the next coords
    const nextCoords = calculateStartingCoords(updatedWall);

    // Lets go again
    const nextStride = await confirm({ message: "Move Buddy to the next stride?" });
    if (nextStride) {
        return layAStride(nextCoords, updatedWall, strideNumber += 1);
    } else {
        return {
            wall: updatedWall,
            strideEnded: true,
            strideNumber,
        }
    }
}

/**
 * Recursive laying bricks for each "stride"
 * @param {2D array} wall 2D array with a visualised build plan in progress
 * @param {{x: number, y number}} coords The coordinates at which to lay this brick
 * @param {{ strideX: number, strideY: number, startPoint: { x: 0, y: 0 }}} buildEnvelope
 */
const promptLayBrick = async (coords, wall, buildEnvelope, strideNumber) => {
    const { coords: newCoords, wall: updatedWall, envelopeState: updatedEnvelope } = layABrick(coords, wall, buildEnvelope, strideNumber);

    // Get next coordinates
    const nextCoords = findNextBuildCoords(newCoords, updatedWall, updatedEnvelope);
    if (nextCoords) {
        printGrid(updatedWall);
        const next = await confirm({ message: "Next brick?" });
        if (next) {
            return promptLayBrick(nextCoords, updatedWall, updatedEnvelope, strideNumber);
        }
    } else {
        // Stop stride
        printGrid(updatedWall);
        return { coords: newCoords, wall: updatedWall };
    }
}

module.exports = {
    layAStride,
    DEFAULT_EMPTY_GRID,
}
