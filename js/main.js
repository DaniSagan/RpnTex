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
calc.registerWord("diff", StackCmdDifferential);
calc.registerWord("integral", StackCmdIndefiniteIntegral);
calc.registerWord("defintegral", StackCmdDefiniteIntegral);
calc.registerWord("=", StackCmdEquality);
calc.registerWord(".", StackCmdDup);
calc.registerWord("..", StackCmdDrop);
calc.registerWord("swap", StackCmdSwap);
calc.registerEvaluator("integer-sum", IntegerSumEvaluator);
calc.registerEvaluator("suminteger-sum", SumIntegerSumEvaluator);

function updateStackTextArea() {
    let text = "";            
    for(let k = calc.stack.count() - 1; k >= 0; k--) {
        text = text.concat("[" + k.toString() + "]    " + calc.stack.get(k).toString() + "\n");
    }
    document.getElementById("stackArea").value = text;
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
        calc.process(word) /** @type {boolean} */
    }
    updateStackTextArea();
    updateEquationText();
    updateMenu();
    MathJax.typeset();
    document.getElementById("commandArea").value = "";
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