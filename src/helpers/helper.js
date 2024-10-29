const { BRICK, BUILD_ENVELOPE, WALL } = require('./constants');

const { FULL_BRICK_LENGTH, HEAD_JOINT_LENGTH, COURSE_HEIGHT } = BRICK;
const { WIDTH: WALL_WIDTH, HEIGHT: WALL_HEIGHT } = WALL;

/**
 * Calculates the width and height of the grid required to visualise the default WALL.
 * Cells ~= half brick.
 * @link {WALL}
 */
const calculatesGridSize = () => {
    const height = WALL_HEIGHT / COURSE_HEIGHT;
    const widthFullBricks = ((WALL_WIDTH - FULL_BRICK_LENGTH) / (FULL_BRICK_LENGTH + HEAD_JOINT_LENGTH)) + 1;
    const width = 21; // TODO: Stop hardcoding this

    return {
        width,
        height,
    }
}

module.exports = {
    calculatesGridSize,
}