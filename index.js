document.addEventListener("DOMContentLoaded", (ev) => {
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
});
