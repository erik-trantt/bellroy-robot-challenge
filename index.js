const initRobot = ({ board, instance }) => {
  let robotInstance;
  let boardInstance;

  let currentDirection = "ArrowRight";
  const DIRECTION_SEQUENCE = [
    "ArrowRight",
    "ArrowDown",
    "ArrowLeft",
    "ArrowUp",
  ];

  if (instance && instance instanceof HTMLElement) {
    robotInstance = instance;
  }

  if (board && board instanceof HTMLElement) {
    boardInstance = board;
  }

  console.log(boardInstance.getBoundingClientRect());
  console.log(robotInstance.getBoundingClientRect());

  const { height: maxBoardHeight, width: maxBoardWidth } =
    boardInstance.getBoundingClientRect();

  /**
   *
   * @param { currentPos, distance, limit } param0
   * @returns boolean
   */
  const canMove = ({ currentPos, distance, limit }) => {
    console.debug(
      currentPos + distance,
      limit,
      0 <= currentPos + distance,
      currentPos + distance <= limit
    );

    return (
      0 <= Math.round(currentPos + distance) &&
      Math.round(currentPos + distance) < Math.round(limit)
    );
  };

  /**
   *
   * @param {*} direction
   * @param {*} distance
   */
  const move = (distance) => {
    // if (!direction) {
    //   console.warn("Unknown direction: " + direction);
    // }

    if (!distance) {
      console.warn("Unknown distance: " + distance);
    }

    // find relative postions
    const { top: boardTopPos, left: boardLeftPos } =
      boardInstance.getBoundingClientRect();
    const { top: robotTopPos, left: robotLeftPos } =
      robotInstance.getBoundingClientRect();

    const relativeTopPos = robotTopPos - boardTopPos;
    const relativeLeftPos = robotLeftPos - boardLeftPos;

    switch (currentDirection) {
      case "ArrowRight": {
        if (
          canMove({
            currentPos: relativeLeftPos,
            distance: distance,
            limit: maxBoardWidth,
          })
        ) {
          robotInstance.style.left = relativeLeftPos + distance;
        }

        break;
      }
      case "ArrowDown": {
        if (
          canMove({
            currentPos: relativeTopPos,
            distance: distance * 1,
            limit: maxBoardHeight,
          })
        ) {
          robotInstance.style.top = relativeTopPos + distance;
        }

        break;
      }
      case "ArrowLeft": {
        if (
          canMove({
            currentPos: relativeLeftPos,
            distance: distance * -1,
            limit: maxBoardWidth,
          })
        ) {
          robotInstance.style.left = relativeLeftPos - distance;
        }

        break;
      }
      case "ArrowUp": {
        if (
          canMove({
            currentPos: relativeTopPos,
            distance: distance * -1,
            limit: maxBoardHeight,
          })
        ) {
          robotInstance.style.top = relativeTopPos - distance;
        }
        break;
      }
      default: {
        // do nothing
      }
    }
  };

  function rotateDirection() {
    const currentDirectionIndex = DIRECTION_SEQUENCE.findIndex(
      (direction) => direction === currentDirection
    );

    if (currentDirectionIndex >= 0) {
      const nextDirectionIndex = (currentDirectionIndex + 1) % 4;
      currentDirection = DIRECTION_SEQUENCE[nextDirectionIndex];
      return DIRECTION_SEQUENCE[nextDirectionIndex];
    }

    currentDirection = DIRECTION_SEQUENCE[0];
    return DIRECTION_SEQUENCE[0];
  }

  /**
   *
   * @returns
   */
  function getDirection() {
    return currentDirection;
  }

  return {
    robotInstance,
    move,
    getDirection,
    rotateDirection,
  };
};

document.addEventListener("DOMContentLoaded", (ev) => {
  const CSS_VAR_ROBOT_ROTATE_ANGLE = "--br-robot-rotate-angle";

  const board = document.querySelector(".br-container > .br-board");
  const robot = document.querySelector(".br-container > .br-robot");

  if (!board) {
    console.warn("Board is not found");
    return;
  }

  const NUMBER_OF_ROWS = 5;
  const NUMBER_OF_COLUMNS = 5;

  const NUMBER_OF_TILES = NUMBER_OF_ROWS * NUMBER_OF_COLUMNS;

  for (let i = 0; i < NUMBER_OF_TILES; i++) {
    const tileEl = document.createElement("div");
    tileEl.id = `br-board-tile-${i + 1}`;
    tileEl.classList.add("br-board-tile");

    board.appendChild(tileEl);
  }

  console.debug(board);
  console.debug(robot);

  if (!robot) {
    console.warn("Robot is not found");
    return;
  }

  const robotInstance = initRobot({
    board: board,
    instance: robot,
  });

  const boardTileWidth = board.clientWidth / NUMBER_OF_ROWS;
  // const boardTileHeight = board.clientHeight / NUMBER_OF_COLUMNS;

  window.addEventListener("keyup", (kbEvent) => {
    if (kbEvent.defaultPrevented) {
      return;
    }

    // console.log(kbEvent.key);

    switch (kbEvent.key) {
      case "ArrowUp": {
        robotInstance?.move(boardTileWidth);
        break;
      }
      // case "ArrowRight": {
      //   robotInstance?.move("ArrowRight", boardTileWidth);
      //   break;
      // }
      // case "ArrowDown": {
      //   robotInstance?.move("ArrowDown", boardTileHeight);
      //   break;
      // }
      // case "ArrowLeft": {
      //   robotInstance?.move("ArrowLeft", boardTileWidth);
      //   break;
      // }
      case " ": {
        const rotateAngleString = window
          .getComputedStyle(robot)
          .getPropertyValue(CSS_VAR_ROBOT_ROTATE_ANGLE);

        const rotateAngle = !isNaN(parseInt(rotateAngleString))
          ? (parseInt(rotateAngleString) + 90) % 360
          : 90;

        robot.style.setProperty(
          CSS_VAR_ROBOT_ROTATE_ANGLE,
          `${rotateAngle}deg`
        );

        robotInstance?.rotateDirection();
        robot.dataset.brDirection = robotInstance?.getDirection();

        break;
      }
      default: {
        // do nothing
      }
    }
  });
});
