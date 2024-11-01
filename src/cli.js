const { program } = require("commander");
const { confirm, select, input } = require('@inquirer/prompts');
const { layAStride, DEFAULT_EMPTY_GRID } = require('./buddy');
const { visualiseStretcherBond, visualiseStackBond, printGrid } = require('./grid');

// Design walls based on our default wall size
const designStretcherBond = visualiseStretcherBond(DEFAULT_EMPTY_GRID);
const designStackBond = visualiseStackBond(DEFAULT_EMPTY_GRID);

const STRIDE_NUMBER = 1;

program
    .name('brick-buddy')
    .description('Build walls!')
    .version('0.0.1')

program.command('plan')
    .description('Plan a wall')
    .action(async () => {
        const bondType = await select({
            message: "Select a bond type",
            choices: [
                {
                    name: 'Stretcher',
                    value: 'stretcher',
                    description: 'Stretcher bond',
                },
                {
                    name: 'Stacked',
                    value: 'stacked',
                    description: 'Stacked bond; not the strongest, mainly used on outers for the look',
                },
                {
                    name: 'French',
                    value: 'french',
                    description: 'French bond',
                    disabled: true,
                }
            ],
            default: "stretcher"
        });

        if (bondType === "stacked") {
            plan = visualiseStackBond(DEFAULT_EMPTY_GRID);
        } else {
            plan = visualiseStretcherBond(DEFAULT_EMPTY_GRID);
        }

        console.log(`Plan for a ${bondType} Bond...\n`);
        printGrid(plan);
    });

program.command('build')
    .description('Build the wall, defaults to StretcherBond')
    .action(async () => {
        // Select the Bond type
        const bondType = await select({
            message: "Select a bond type",
            choices: [
                {
                    name: 'Stretcher',
                    value: 'stretcher',
                    description: 'Stretcher bond',
                },
                {
                    name: 'Stacked',
                    value: 'stacked',
                    description: 'Stacked bond; not the strongest, mainly used on outers for the look',
                },
                {
                    name: 'French',
                    value: 'french',
                    description: 'French bond',
                    disabled: true,
                }
            ],
            default: "stretcher"
        });
        const startWall = bondType === "stretcher" ? designStretcherBond : designStackBond;

        // Select starting point
        const maxXCoord = startWall[0].length - 1;
        const startPointInput = await input({
            message: "Pick your starting coordinate, defaults to [0,0]",
            default: 0,
            validate: (input) => {
                const _input = parseInt(input);
                return _input >= 0 && _input < maxXCoord;
            },
        });
        const startPointX = parseInt(startPointInput);
        const startingCoords = { x: startPointX, y: 0 };
        console.log(startingCoords)
        // Build
        const proceed = await confirm({ message: "Ready to build a wall?" });
        if (proceed) {
            console.log(`Starting at ${startingCoords.x, startingCoords.y}...`);
            const { strideNumber, wallComplete } = await layAStride(startingCoords, startWall, STRIDE_NUMBER);
            if (wallComplete) {
                printGrid(wall);
                console.log(`Wall completed in ${strideNumber} strides`);
            }
        } else {
            console.log("Maybe next time!")
        }
    });

program.parse();