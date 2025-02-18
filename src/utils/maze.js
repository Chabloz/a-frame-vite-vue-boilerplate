export function generate(nRow = 100, nCol = 100) {
  const maze = [];

  // Add outer walls
  // to the left and right of the maze
  for (let i = 0; i < nRow; i++) {
    maze[i] = []
    maze[i][-1] = 1;
    maze[i][nCol] = 1;
  }
  // to the top and bottom of the maze
  maze[-1] = [];
  maze[nRow] = [];
  for (let i = 0; i < nCol; i++) {
    maze[-1][i] = 1;
    maze[nRow][i] = 1;
  }

  // build the maze
  const backtrack = [];
  let row = 0;
  let col = 0;
  while (true) {
    const directions = [];
    // 0 for noth, 1 for east, 2 for south and 3 for west.
    if (!maze?.[row - 1]?.[col]) directions.push(0);
    if (!maze?.[row]?.[col + 1]) directions.push(1);
    if (!maze?.[row + 1]?.[col]) directions.push(2);
    if (!maze?.[row]?.[col - 1]) directions.push(3);
    if (directions.length == 0) {
      // If nothing to backtrack, the maze is complete
      if (backtrack.length == 0) break;
      // Otherwise we backtrack
      [row, col] = backtrack.pop();
      continue;
    }
    // Save the current pos for backtracking
    backtrack.push([row, col]);
    // build the door array if needed
    if (!maze[row]?.[col]) maze[row][col] = {};
    // randomly choose a direction
    const direction = directions[Math.floor(Math.random() * directions.length)];
    // Mark the door in this direction as open
    maze[row][col][direction] = 1;
    // go through the door and open the door from the other side ^_^
    row += (direction - 1) % 2;
    col -= (direction - 2) % 2;
    // build the door array if needed
    if (!maze[row]?.[col]) maze[row][col] = {};
    // Mark the door in the oposite direction as open (one door has two sides ^_^)
    maze[row][col][(direction + 2) % 4] = 1;
  }

  // remove outer walls
  for (let i=0; i < nRow; i++) {
    delete maze[i][-1];
    delete maze[i][nCol];
    maze[i].length = maze[i].length - 1;
  }
  delete maze[-1];
  delete maze[nRow];
  maze.length = maze.length - 1;

  return maze;
}