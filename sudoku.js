var cells = []; // array with all cells 0-80
var markingMode = 'normal'; // Mode for pencil markings

function import_puzzle() {
    return [
        [0,0,0,2,6,0,7,0,1],
        [6,8,0,0,7,0,0,9,0],
        [1,9,0,0,0,4,5,0,0],
        [8,2,0,1,0,0,0,4,0],
        [0,0,4,6,0,2,9,0,0],
        [0,5,0,0,0,3,0,2,8],
        [0,0,9,3,0,0,0,7,4],
        [0,4,0,0,5,0,0,3,6],
        [7,0,3,0,1,8,0,0,0]
    ];
}

function sudoku_GUI() {
    var table = document.getElementById("gui"); // table from html

    // creates all the cells, assigns row, column and square
    for (var r = 0; r < 9; r++) {
        var row = document.createElement("tr"); // row element 

        for (var c = 0; c < 9; c++) {
            var input = document.createElement("input"); // cell input field 
            // sets all of the cell attributes
            input.type = "text"; 
            input.maxLength = 1; 
            input.setAttribute("data-row", r);
            input.setAttribute("data-column", c);
            input.setAttribute("data-square", square_number(r, c));
            input.oninput = handleInput; // Handle input changes
            input.onkeypress = validate; // validates that a number is entered

            // creates and places input field in cell-element
            var cell = document.createElement("td");
            cell.appendChild(input); 
            
            row.appendChild(cell); // puts cell into row 
            cells.push(input); // puts cell into array with all cells
        }
        table.appendChild(row); // places row into the table
    }
}

function validate(evt) {
    // this stops all non-numeric input
    evt = (evt) ? evt : window.event;
    var key = evt.keyCode || evt.which;
    key = String.fromCharCode(key);

    var regex = /^[1-9]$/;
    if (!regex.test(key)) {
        evt.returnValue = false;
        if (evt.preventDefault) { evt.preventDefault(); }
    }
}

function handleInput(event) {
    var cell = event.target;
    var value = cell.value;

    // Clear any previous styles
    cell.style.color = "black";

    if (value && !validateNumber(value)) {
        cell.style.color = "red";
        return;
    }

    // Check for identical numbers in the same row and column
    if (!valid_check(cell, value)) {
        cell.style.color = "red";
    } else {
        cell.style.color = "black";
    }
}

function validateNumber(value) {
    var regex = /^[1-9]$/;
    return regex.test(value);
}

function setMarkingMode(mode) {
    markingMode = mode;
}

function square_number(row, column) {
    return Math.floor(row / 3) * 3 + Math.floor(column / 3);
}

function valid_check(cell, value) { 
    /* this function checks if value is valid. it follows the standard
       sudoku rules in this check */
    var row = parseInt(cell.getAttribute("data-row"));
    var column = parseInt(cell.getAttribute("data-column"));
    var square = parseInt(cell.getAttribute("data-square"));

    for (var i = 0; i < cells.length; i++) {
        if (cells[i] !== cell) {
            if (parseInt(cells[i].getAttribute("data-row")) === row && cells[i].value == value) {
                return false;
            } else if (parseInt(cells[i].getAttribute("data-column")) === column && cells[i].value == value){
                return false;
            } else if (parseInt(cells[i].getAttribute("data-square")) === square && cells[i].value == value) {
                return false;
            }
        }
    }
    return true;
}

function solve_sudoku(random_row) {
    var numbers = [1,2,3,4,5,6,7,8,9];
    var i = 0; // cell index
    var n = 0; // numbers-array index
    var m = 1; // direction of backtracking (1 = forward) 

    var nums = [1,2,3,4,5,6,7,8,9]; // used if generating sudoku (g=1) 

    while (true) {
        if (i < 9 && random_row) { // creates a random first row if generating
            var random_value = nums[Math.floor(Math.random() * nums.length)];
            nums.splice(nums.indexOf(random_value), 1); // removes used value
            cells[i].value = random_value; // assigns value
            i++; // heads to next cell
        } else if (cells[i].dataset.a == 1) { // tries solving cell
            if (valid_check(cells[i], numbers[n])) {
                // this is run if valid number is found
                cells[i].value = numbers[n]; // assigns value
                i++;    // next cell 
                n = 0;  // resets numbers array index
                m = 1;  // direction = forwards
            } else {
                if (n == 8) {
                    // this is run if we are at the end of numbers array (no more possible values)
                    cells[i].value = ""; // removes value
                    i--;    // steps to previous cell
                    m = 0;  // direction: backwards
                    if (cells[i].value == 9) { i--; }
                    n = cells[i].value;
                } else {
                    // this is run if we have not found valid value and we are not at the end of possible values
                    n++; // goes to next number in numbers array
                }
            }
        } else {
            // this is run if we hit a cell with static value,
            // moves backwards/forwards based on m variable
            if (m) { i++; }
            else { i--; }
        }
        if (i == 81) { break; } // stops the loop when we are done with last cell
    }
}

function reset_cells() {
    for (var cell of cells) {
        cell.value = ""; // Clear cell value
        cell.dataset.a = 1; // Set all cells to editable by default
        cell.style.color = "black"; // Reset color to black
    }
}

function generate_sudoku() {
    /* this function is used in the generation of the sudoku */

    reset_cells(); // Reset cells before generating a new puzzle

    solve_sudoku(true); // The sudoku is solved with a random first row -> sudoku is created

    for (var cell of cells) { // Turns random cells blank
        if (Math.floor((Math.random() * 3)) == 0) { cell.value = ""; }
    }

    for (var cell of cells) { // Locks all cells with values
        if (cell.value > 0) { cell.dataset.a = 0; }
    }
}

function load_sudoku() {
    var i = 0;
    var sudoku = import_puzzle();
    for (var r = 0; r < 9; r++) {
        for (var c = 0; c < 9; c++) {
            if (sudoku[r][c] != 0) {
                cells[i].value = sudoku[r][c];
                cells[i].dataset.a = 0; // lock the cell
            } else {
                cells[i].dataset.a = 1; // unlocks cells without values
            }
            i++;
        }
    }
}

function clear_gui() {
    for (cell of cells) {
        cell.value = "";    // removes value
        cell.dataset.a = 0; // locks all cells (default)
        cell.style.color = "black"; // Reset color to black
    }
}

document.addEventListener('DOMContentLoaded', sudoku_GUI);