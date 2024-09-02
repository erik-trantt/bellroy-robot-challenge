const NUMBER_OF_ROWS = 5;
const NUMBER_OF_COLUMNS = 5;
const DIRECTION_SEQUENCE = ["Right", "Down", "Left", "Up"];

/**
 * @typedef {Object} Dimension
 * @property {number} width - Object's width
 * @property {number} height - Object's height
 */

/**
 * @typedef {Object} CreateBoardReturn
 * @property {Element | null} instance - Then board instance
 * @property {function():void} init - Creating board and grid
 * @property {function():Dimension} getGridSize - Get the dimension of the board
 */

/**
 * Create a new board.
 *
 * @param {Object} options
 * @param {string} options.selector
 * @returns {CreateBoardReturn}
 */
const createBoard = ({ selector }) => {
  const board = document.querySelector(selector);

  const numberOfGrids = NUMBER_OF_ROWS * NUMBER_OF_COLUMNS;

  const init = () => {
    if (!board) {
      console.warn("Board is not found");
      return;
    }

    for (let i = 0; i < numberOfGrids; i++) {
      const gridElement = document.createElement("div");
      gridElement.id = `br-board-tile-${i + 1}`;
      gridElement.classList.add("br-board-tile");

      board.appendChild(gridElement);
    }
  };

  const getGridSize = () => {
    if (!board) {
      console.warn("Board is not found");
      return {
        width: 0,
        height: 0,
      };
    }

    return {
      width: board.clientWidth / NUMBER_OF_ROWS,
      height: board.clientHeight / NUMBER_OF_COLUMNS,
    };
  };

  return {
    instance: board,
    init,
    getGridSize,
  };
};

/**
 * @typedef {Object} RobotPosition
 * @property {number} column - The robot's current column
 * @property {number} row - The robot's current row
 */

/**
 * @typedef {Object} CreateRobotReturn
 * @property {Element | null} instance - Then robot instance
 * @property {function(number=):void} move - Move the robot forwards
 * @property {function():void} rotate - Change the direction of the robot clockwise
 * @property {function():Dimension} getDirection - Get the cardinal direction the robot is facing
 * @property {function():void} updateRobotPositions - Get the cardinal direction the robot is facing
 */

/**
 * Create a new robot.
 *
 * @param {Object} options
 * @param {string} options.robotSelector - The CSS selector string for the robot.
 * @returns {CreateRobotReturn}
 */
const createRobot = ({ robotSelector }) => {
  const robot = document.querySelector(robotSelector);

  let currentDirection = DIRECTION_SEQUENCE[0];

  // Robot starts at the top left corner of the board.
  // This translates into a position of [0, 0] with a zero-based index.
  let currentRow = 0;
  let currentColumn = 0;

  /**
   * Check if the robot can move to the next grid within the board.
   *
   * @param {Object} options
   * @param {number} options.nextColumn
   * @param {number} options.nextRow
   * @returns boolean
   */
  const canMove = ({ nextColumn, nextRow }) => {
    return (
      0 <= nextColumn &&
      nextColumn < NUMBER_OF_COLUMNS &&
      0 <= nextRow &&
      nextRow < NUMBER_OF_ROWS
    );
  };

  /**
   * Move the robot.
   *
   * @param {number} [distance=0] - How far the robot should move.
   */
  const move = (distance = 0) => {
    if (!distance) {
      console.warn("Unknown distance: " + distance);
      return;
    }

    if (!robot) {
      console.warn("Robot is not found");
      return;
    }

    switch (currentDirection) {
      case "Right": {
        if (
          canMove({
            nextColumn: currentColumn + 1,
            nextRow: currentRow,
          })
        ) {
          currentColumn += 1;
        }

        break;
      }
      case "Down": {
        if (
          canMove({
            nextColumn: currentColumn,
            nextRow: currentRow + 1,
          })
        ) {
          currentRow += 1;
        }

        break;
      }
      case "Left": {
        if (
          canMove({
            nextColumn: currentColumn - 1,
            nextRow: currentRow,
          })
        ) {
          currentColumn -= 1;
        }

        break;
      }
      case "Up": {
        if (
          canMove({
            nextColumn: currentColumn,
            nextRow: currentRow - 1,
          })
        ) {
          currentRow -= 1;
        }
        break;
      }
      default: {
        // do nothing
      }
    }

    updateRobotPositions(distance);
  };

  /**
   * Rotate the robot clockwise.
   */
  const rotate = () => {
    const CSS_VAR_ROBOT_ROTATE_ANGLE = "--br-robot-rotate-angle";

    const currentDirectionIndex = DIRECTION_SEQUENCE.findIndex(
      (direction) => direction === currentDirection
    );

    if (currentDirectionIndex >= 0) {
      const nextDirectionIndex = (currentDirectionIndex + 1) % 4;
      currentDirection = DIRECTION_SEQUENCE[nextDirectionIndex];
    } else {
      currentDirection = DIRECTION_SEQUENCE[0];
    }

    const rotateAngleString = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(CSS_VAR_ROBOT_ROTATE_ANGLE);

    const rotateAngle = !isNaN(parseInt(rotateAngleString))
      ? (parseInt(rotateAngleString) + 90) % 360
      : 90;

    document.documentElement.style.setProperty(
      CSS_VAR_ROBOT_ROTATE_ANGLE,
      `${rotateAngle}deg`
    );
  };

  /**
   * The current direction the robot is facing.
   * @returns {string} One of the cardinal direction: `Right`, `Down`, `Left`, `Up`.
   */
  const getDirection = () => {
    return currentDirection;
  };

  /**
   * Update the current position (top and left) of the robot.
   *
   * @param {number} distance
   */
  const updateRobotPositions = (distance = 0) => {
    robot.style.left = `${currentColumn * distance}px`;
    robot.style.top = `${currentRow * distance}px`;
  };

  return {
    instance: robot,
    move,
    rotate,
    getDirection,
    updateRobotPositions,
  };
};

document.addEventListener("DOMContentLoaded", () => {
  const board = createBoard({ selector: ".br-board-container > div.br-board" });

  if (!board.instance) {
    console.warn("Board is not found");
    return;
  }

  board.init();

  const robot = createRobot({
    robotSelector: ".br-board-container > .br-robot",
  });

  // add actions to the keyup event for the following keys:
  // - the "M" key to "move forwards", and
  // - the "R" key to "rotate"
  window.addEventListener("keyup", (kbEvent) => {
    if (
      kbEvent.target instanceof HTMLButtonElement &&
      kbEvent.target.classList.contains("br-control")
    ) {
      // do nothing
      return;
    }

    switch (kbEvent.key) {
      case "m": {
        const { width: moveDistance } = board.getGridSize();
        robot?.move(moveDistance);

        break;
      }
      case "r": {
        robot?.rotate();

        break;
      }
      default: {
        // do nothing
      }
    }
  });

  // initialise "move forward" control button & add click action
  const moveButton = document.querySelector("button.br-control-move");
  moveButton?.addEventListener("click", () => {
    const { width: moveDistance } = board.getGridSize();
    robot.move(moveDistance);
  });

  // initialise "rotate" control button & add click action
  const rotateButton = document.querySelector("button.br-control-rotate");
  rotateButton?.addEventListener("click", () => {
    robot.rotate();
  });

  // Update the robot position on the board.
  // NOTE: This is required for the robot is Absolute-positioned on top of the board.
  window.addEventListener("resize", () => {
    const { width: moveDistance } = board.getGridSize();

    robot.updateRobotPositions(moveDistance);
  });
});
