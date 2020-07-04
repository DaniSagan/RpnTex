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
calc.registerWord("=", StackCmdEquality);
calc.registerWord(".", StackCmdDup);
calc.registerWord("..", StackCmdDrop);
calc.registerWord("swap", StackCmdSwap);
calc.registerEvaluator("integer-sum", IntegerSumEvaluator);
calc.registerEvaluator("suminteger-sum", SumIntegerSumEvaluator);

function updateStackTextArea() {
    var text = "";            
    for(var k = calc.stack.count() - 1; k >= 0; k--) {
        text = text.concat("[" + k.toString() + "]    " + calc.stack.get(k).toString() + "\n");
    }
    console.log("text to add: " + text);
    document.getElementById("stackArea").value = text;
}

function updateEquationText() {
    if(calc.stack.count() > 0) {
        console.log("latex code: " + calc.stack.get(0).formatLatex());
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
    var words = document.getElementById("commandArea").value;
    for(var word of words.split(" ")) {
        calc.process(word) /** @type {boolean} */
    }
    updateStackTextArea();
    updateEquationText();
    MathJax.typeset();
    document.getElementById("commandArea").value = "";
    document.getElementById("commandArea").focus();
    return false;
}

// document.getElementById("equationArea").onmouseover = function(e) {
//     var parent = e.target.parentElement;
//     console.log(parent);
//     /** @type {String} */
//     var id = parent.id;
//     if(id != "") {
//         /** @type {StackItem} */
//         var item = calc.stack.items[0].findById(id);
//         if(item != null) {
//             console.log(`${id} -> ${item.id}`);
//         }
//     }    
// }

document.getElementById("equationArea").onclick = function(e) {
    var selectedItem = e.target.closest(".rpntex-item");
    if(selectedItem.id != "") {
        /** @type {StackItem} */
        var rootItem = calc.stack.items[0];
        /** @type {StackItem} */
        var selectedItem = rootItem.findById(selectedItem.id);
        if(selectedItem != null) {
            for(var evaluatorKey in calc.evaluatorDict) {
                /** @type {Evaluator} */
                var evaluator = new calc.evaluatorDict[evaluatorKey]();
                if(evaluator.canApply(selectedItem)) {
                    /** @type {StackItem} */
                    var evaluatedItem = evaluator.eval(selectedItem);
                    if(rootItem.id === selectedItem.id) {
                        calc.stack.pop();
                        calc.stack.push(evaluatedItem);
                    } else {
                        var replaceVisitor = new ReplaceVisitor(selectedItem.id, evaluatedItem);
                        rootItem.accept(replaceVisitor);
                    }
                }              
            }
            updateStackTextArea();
            updateEquationText();
            MathJax.typeset(); 
        }
    } 
}

window.MathJax = {
    loader: {load: ['[tex]/color', '[tex]/html']},
    tex: {packages: {'[+]': ['color', 'html']}}
};