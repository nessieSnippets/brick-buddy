const BRICK = {
    BRICK_HEIGHT: 50,
    FULL_BRICK_LENGTH: 210,
    HALF_BRICK_LENGTH: 100,
    HEAD_JOINT_LENGTH:  10,
    BED_JOINT_HEIGHT : 12.5,
}
BRICK["COURSE_HEIGHT"] = BRICK.BED_JOINT_HEIGHT + BRICK.BRICK_HEIGHT;

const BUILD_ENVELOPE = {
    WIDTH: 800,
    HEIGHT: 1300,
}

const WALL = {
    WIDTH: 2300,
    HEIGHT: 2000,
}


// This is realistically limited further by bricks below not being there
const envelopeMaxBricksHeight = Math.floor(BUILD_ENVELOPE.HEIGHT / (BRICK.BED_JOINT_HEIGHT + BRICK.BRICK_HEIGHT)); // 20

// TODO: Make this a bit better
const rawBricksWidth = BUILD_ENVELOPE.WIDTH / (BRICK.FULL_BRICK_LENGTH + BRICK.HEAD_JOINT_LENGTH); // Roughly 3.666
const envelopeMaxBricksWidth = Math.round(rawBricksWidth) === Math.floor(rawBricksWidth) ? Math.floor(rawBricksWidth) : Math.floor(rawBricksWidth) + 0.5;

module.exports = {
    BRICK,
    BUILD_ENVELOPE,
    WALL,
    envelopeMaxBricksWidth,
    envelopeMaxBricksHeight,
}
