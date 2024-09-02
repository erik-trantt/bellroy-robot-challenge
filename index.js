const NUMBER_OF_ROWS = 5;
const NUMBER_OF_COLUMNS = 5;
const DIRECTION_SEQUENCE = ["Right", "Down", "Left", "Up"];

/**
 * @typedef {Object} Dimension
 * @property {number} width - Object's width
 * @property {height} height - Object's height
 */

/**
 * @typedef {Object} CreateBoardReturn
 * @property {Element | null} instance - Then board instance
 * @property {function():void} init - Creating board and grid
 * @property {function():Dimension} getBoardSize - Get the dimension of the board
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

  const getBoardSize = () => {
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
    getBoardSize,
  };
};

/**
 * @typedef {Object} CreateRobotReturn
 * @property {Element | null} instance - Then robot instance
 * @property {function(number):void} move - Move the robot forwards
 * @property {function():void} rotate - Change the direction of the robot clockwise
 * @property {function():Dimension} getDirection - Get the cardinal direction the robot is facing
 */

/**
 * Create a new robot.
 *
 * @param {Object} options
 * @param {Element} options.board - The game board
 * @param {string} options.robotSelector - The CSS selector string for the robot.
 * @returns {CreateRobotReturn}
 */
const createRobot = ({ board, robotSelector }) => {
  const robot = document.querySelector(robotSelector);

  let currentDirection = DIRECTION_SEQUENCE[0];

  /**
   * Check if the robot can move in current direction.
   *
   * @param {Object} options
   * @param {number} options.currentPos
   * @param {number} options.distance
   * @param {number} options.limit
   * @returns boolean
   */
  const canMove = ({ currentPos, distance, limit }) => {
    return (
      0 <= Math.round(currentPos + distance) &&
      Math.round(currentPos + distance) < Math.round(limit)
    );
  };

  /**
   *
   * @param {number} [distance=0] - How far to move a robot
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

    // find relative postions
    const {
      height: maxBoardHeight,
      width: maxBoardWidth,
      top: boardTopPos,
      left: boardLeftPos,
    } = board.getBoundingClientRect();

    const { top: robotTopPos, left: robotLeftPos } =
      robot.getBoundingClientRect();

    const relativeTopPos = robotTopPos - boardTopPos;
    const relativeLeftPos = robotLeftPos - boardLeftPos;

    switch (currentDirection) {
      case "Right": {
        if (
          canMove({
            currentPos: relativeLeftPos,
            distance: distance,
            limit: maxBoardWidth,
          })
        ) {
          robot.style.left = `${relativeLeftPos + distance}px`;
        }

        break;
      }
      case "Down": {
        if (
          canMove({
            currentPos: relativeTopPos,
            distance: distance * 1,
            limit: maxBoardHeight,
          })
        ) {
          robot.style.top = `${relativeTopPos + distance}px`;
        }

        break;
      }
      case "Left": {
        if (
          canMove({
            currentPos: relativeLeftPos,
            distance: distance * -1,
            limit: maxBoardWidth,
          })
        ) {
          robot.style.left = `${relativeLeftPos - distance}px`;
        }

        break;
      }
      case "Up": {
        if (
          canMove({
            currentPos: relativeTopPos,
            distance: distance * -1,
            limit: maxBoardHeight,
          })
        ) {
          robot.style.top = `${relativeTopPos - distance}px`;
        }
        break;
      }
      default: {
        // do nothing
      }
    }
  };

  function rotate() {
    const CSS_VAR_ROBOT_ROTATE_ANGLE = "--br-robot-rotate-angle";

    const currentDirectionIndex = DIRECTION_SEQUENCE.findIndex(
      (direction) => direction === currentDirection
    );

    if (currentDirectionIndex >= 0) {
      const nextDirectionIndex = (currentDirectionIndex + 1) % 4;
      currentDirection = DIRECTION_SEQUENCE[nextDirectionIndex];
      // return DIRECTION_SEQUENCE[nextDirectionIndex];
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
  }

  function getDirection() {
    return currentDirection;
  }

  return {
    instance: robot,
    move,
    getDirection,
    rotate,
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
    board: board.instance,
    robotSelector: ".br-board-container > .br-robot",
  });

  // add actions to the keyup event for the following keys:
  // - the Up arrow key to "move forwards", and
  // - the Spacebar key to "rotate"
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
        // Key "M"
        const { width: moveDistance } = board.getBoardSize();
        robot?.move(moveDistance);

        break;
      }
      case "r": {
        // Key "R"
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
    const { width: moveDistance } = board.getBoardSize();
    robot.move(moveDistance);
  });

  // initialise "rotate" control button & add click action
  const rotateButton = document.querySelector("button.br-control-rotate");
  rotateButton?.addEventListener("click", () => {
    robot.rotate();
  });
});
