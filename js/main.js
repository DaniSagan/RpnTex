'use strict';

var calc = new Calc();
calc.registerWord("eval", StackCmdEval);
calc.registerWord("+", StackCmdSum);
calc.registerWord("-", StackCmdSubtraction);
calc.registerWord("*", StackCmdMultiplication);
calc.registerWord("/", StackCmdFraction);
calc.registerWord("abs", StackCmdAbs);
calc.registerWord("^", StackCmdPower);
calc.registerWord("pow", StackCmdPower);
calc.registerWord("inv", StackCmdInv);
calc.registerWord("sqrt", StackCmdSqrt);
calc.registerWord("neg", StackCmdNeg);
calc.registerWord("sin", StackCmdSin);
calc.registerWord("cos", StackCmdCos);
calc.registerWord("tan", StackCmdTan);
calc.registerWord("diff", StackCmdDifferential);
calc.registerWord("integral", StackCmdIndefiniteIntegral);
calc.registerWord("defintegral", StackCmdDefiniteIntegral);
calc.registerWord("=", StackCmdEquality);
calc.registerWord(".", StackCmdDup);
calc.registerWord("..", StackCmdDrop);
calc.registerWord("swap", StackCmdSwap);
calc.registerEvaluator("integer-sum", IntegerSumEvaluator);
calc.registerEvaluator("suminteger-sum", SumIntegerSumEvaluator);

class KeyboardButton {
    constructor(textToShow, fnToExecute, className) {
        this.textToShow = textToShow;
        this.fnToExecute = fnToExecute;
        this.className = className;
    }
}

function init() {
    updateKeyboard();
    MathJax.typeset();
}

function updateStackTextArea() {
    let text = "";            
    for(let k = calc.stack.count() - 1; k >= 0; k--) {
        text = text.concat("[" + k.toString() + "]    " + calc.stack.get(k).toString() + "\n");
    }
    let stackArea = document.getElementById("stackArea");
    stackArea.value = text;
    stackArea.scrollTop = stackArea.scrollHeight;;
}

function updateEquationText() {
    if(calc.stack.count() > 0) {
        document.getElementById("equationText").innerHTML = "\\[ " + calc.stack.get(0).formatLatex() + " \\]";
    } else {
        document.getElementById("equationText").innerHTML = "";
    }
}

function onTestChange() {
    var key = window.event.keyCode;
    if (key === 13) {
        process();
        return false;
    }
    else {
        return true;
    }
}

function process() {
    let words = document.getElementById("commandArea").value;
    for(let word of words.split(" ")) {
        if(word != "") {
            calc.process(word) /** @type {boolean} */
        }
    }
    updateStackTextArea();
    updateEquationText();
    // updateMenu();
    document.getElementById("commandArea").value = "";
    MathJax.typeset();
    return false;
}

/**
 * 
 * @param {String} word 
 */
function processWord(word) {
    let commandArea = document.getElementById("commandArea");
    if(commandArea.value != "") {
        process();
    }
    calc.process(word)
    updateStackTextArea();
    updateEquationText();
    //document.getElementById("commandArea").value = "";
    MathJax.typeset();
    return false;
}

function executeButtonOnClick() {
    process();
    document.getElementById("commandArea").focus();
    return false;
}

/**
 * 
 * @param {String} itemId 
 * @param {String} evaluatorKey 
 */
function processAction(itemId, evaluatorKey) {
    /** @type {StackItem} */
    let rootItem = calc.stack.items[0];
    /** @type {StackItem} */
    let selectedItem = rootItem.findById(itemId);
    let evaluator = new calc.evaluatorDict[evaluatorKey]();
    if(evaluator.canApply(selectedItem)) {
        /** @type {StackItem} */
        let evaluatedItem = evaluator.eval(selectedItem);
        if(rootItem.id === selectedItem.id) {
            calc.stack.pop();
            calc.stack.push(evaluatedItem);
        } else {
            let replaceVisitor = new ReplaceVisitor(selectedItem.id, evaluatedItem);
            rootItem.accept(replaceVisitor);
        }
    }
    calc.selectedItem = null;

    updateStackTextArea();
    updateEquationText();
    updateMenu();
    MathJax.typeset();
}

function updateMenu() {
    let menuDiv = document.getElementById("menu");
    while (menuDiv.firstChild) {
        menuDiv.removeChild(menuDiv.firstChild);
    }
    if(calc.selectedItem != null) {
        for(let evaluatorKey in calc.evaluatorDict) {
            /** @type {Evaluator} */
            let evaluator = new calc.evaluatorDict[evaluatorKey]();
            if(evaluator.canApply(calc.selectedItem)) {
                /** @type {StackItem} */
                let evaluatedItem = evaluator.eval(calc.selectedItem);
                let button = document.createElement('button');  
                button.innerText = evaluator.getDescription(calc.selectedItem);
                button.onclick = function() {
                    processAction(calc.selectedItem.id, evaluatorKey);
                };
                menuDiv.appendChild(button);
            }              
        }
    } 
}

/**
 * 
 * @param {String} command 
 */
function writeCommand(command) {
    let commandArea = document.getElementById("commandArea");
    commandArea.value += command;
}

function updateKeyboard() {
    let keyboardDiv = document.getElementById("keyboard");
    while(keyboardDiv.firstChild) {
        keyboardDiv.removeChild(keyboardDiv.firstChild);
    }
    let keyboardButtons = [
        new KeyboardButton("0", () => writeCommand("0"), "button-w1"),
        new KeyboardButton("1", () => writeCommand("1"), "button-w1"),
        new KeyboardButton("2", () => writeCommand("2"), "button-w1"),
        new KeyboardButton("3", () => writeCommand("3"), "button-w1"),
        new KeyboardButton("4", () => writeCommand("4"), "button-w1"),
        new KeyboardButton("5", () => writeCommand("5"), "button-w1"),
        new KeyboardButton("6", () => writeCommand("6"), "button-w1"),
        new KeyboardButton("7", () => writeCommand("7"), "button-w1"),
        new KeyboardButton("8", () => writeCommand("8"), "button-w1"), 
        new KeyboardButton("9", () => writeCommand("9"), "button-w1"),

        new KeyboardButton(".", () => writeCommand("."), "button-w1"),
        new KeyboardButton("E", () => writeCommand("E"), "button-w1"),
        new KeyboardButton("␣", () => writeCommand(" "), "button-w2"),
        new KeyboardButton("+", () => processWord("+"), "button-w1"),
        new KeyboardButton("-", () => processWord("-"), "button-w1"),
        new KeyboardButton("*", () => processWord("*"), "button-w1"),
        new KeyboardButton("/", () => processWord("/"), "button-w1"),
        new KeyboardButton("exe", () => process(), "button-w2"),

        new KeyboardButton("drop", () => processWord(".."), "button-w2"),
        new KeyboardButton("dup", () => processWord("."), "button-w2"),
        new KeyboardButton("x", () => processWord("x"), "button-w1"),
        new KeyboardButton("y", () => processWord("y"), "button-w1"),
        new KeyboardButton("z", () => processWord("z"), "button-w1"),
        new KeyboardButton("d", () => processWord("diff"), "button-w1"),
        new KeyboardButton("∫", () => processWord("integral"), "button-w1"),
        new KeyboardButton("√", () => processWord("sqrt"), "button-w1"),

        new KeyboardButton("^", () => processWord("pow"), "button-w1"),
        new KeyboardButton("=", () => processWord("="), "button-w1"),
        new KeyboardButton("sin", () => processWord("sin"), "button-w2"),
        new KeyboardButton("cos", () => processWord("cos"), "button-w2"),
        new KeyboardButton("tan", () => processWord("tan"), "button-w2"),
        new KeyboardButton("inv", () => processWord("inv"), "button-w2"),
        
        new KeyboardButton("neg", () => processWord("neg"), "button-w2")
    ];
    for(let keyboardButton of keyboardButtons) {
        let button = document.createElement('button');
        button.innerText = `${keyboardButton.textToShow}`;
        button.onclick = keyboardButton.fnToExecute;
        button.className = keyboardButton.className;
        keyboardDiv.appendChild(button);
    }
}

document.getElementById("equationArea").onmouseover = function(e) {
    let hoveredItem = e.target.closest(".rpntex-item");
    this.style.cursor = 'default';
    if(hoveredItem != null && hoveredItem.id != "") {
        /** @type {StackItem} */
        let rootItem = calc.stack.items[0];
        /** @type {StackItem} */
        let selectedItem = rootItem.findById(hoveredItem.id);
        if(selectedItem != null) {
            for(let evaluatorKey in calc.evaluatorDict) {
                /** @type {Evaluator} */
                let evaluator = new calc.evaluatorDict[evaluatorKey]();
                if(evaluator.canApply(selectedItem)) {
                    this.style.cursor = 'pointer';
                }              
            }
        }
    }     
}

document.getElementById("equationArea").onclick = function(e) {
    let selectedItem = e.target.closest(".rpntex-item");
    if(selectedItem.id != "") {
        /** @type {StackItem} */
        let rootItem = calc.stack.items[0];
        /** @type {StackItem} */
        let selectedStackItem = rootItem.findById(selectedItem.id);
        if(selectedStackItem != null) {
            calc.selectedItem = selectedStackItem;
            updateMenu();
        }
    } 
}

window.MathJax = {
    loader: {load: ['[tex]/color', '[tex]/html']},
    tex: {packages: {'[+]': ['color', 'html']}}
};