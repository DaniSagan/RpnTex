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

calc.registerWord("gr.alpha", TStackCmdGreekVariable("α", "alpha"));
calc.registerWord("gr.beta", TStackCmdGreekVariable("β", "beta"));
calc.registerWord("gr.gamma", TStackCmdGreekVariable("γ", "gamma")); 
calc.registerWord("gr.delta", TStackCmdGreekVariable("δ", "delta")); 
calc.registerWord("gr.epsilon", TStackCmdGreekVariable("ε", "epsilon")); 
calc.registerWord("gr.zeta", TStackCmdGreekVariable("ζ", "zeta")); 
calc.registerWord("gr.eta", TStackCmdGreekVariable("η", "eta")); 
calc.registerWord("gr.theta", TStackCmdGreekVariable("θ", "theta")); 
calc.registerWord("gr.iota", TStackCmdGreekVariable("ι", "iota")); 
calc.registerWord("gr.kappa", TStackCmdGreekVariable("κ", "kappa")); 
calc.registerWord("gr.lambda", TStackCmdGreekVariable("λ", "lambda")); 
calc.registerWord("gr.mu", TStackCmdGreekVariable("μ", "mu")); 
calc.registerWord("gr.nu", TStackCmdGreekVariable("ν", "nu")); 
calc.registerWord("gr.xi", TStackCmdGreekVariable("ξ", "xi")); 
calc.registerWord("gr.omicron", TStackCmdGreekVariable("ο", "omicron")); 
calc.registerWord("gr.pi", TStackCmdGreekVariable("π", "pi")); 
calc.registerWord("gr.rho", TStackCmdGreekVariable("ρ", "rho")); 
calc.registerWord("gr.sigma", TStackCmdGreekVariable("σ", "sigma"));
calc.registerWord("gr.varsigma", TStackCmdGreekVariable("ς", "varsigma"));
calc.registerWord("gr.tau", TStackCmdGreekVariable("τ", "tau")); 
calc.registerWord("gr.upsilon", TStackCmdGreekVariable("υ", "upsilon")); 
calc.registerWord("gr.phi", TStackCmdGreekVariable("φ", "phi")); 
calc.registerWord("gr.chi", TStackCmdGreekVariable("χ", "chi")); 
calc.registerWord("gr.psi", TStackCmdGreekVariable("ψ", "psi")); 
calc.registerWord("gr.omega", TStackCmdGreekVariable("ω", "omega")); 

calc.registerWord("α", TStackCmdGreekVariable("α", "alpha"));
calc.registerWord("β", TStackCmdGreekVariable("β", "beta"));
calc.registerWord("γ", TStackCmdGreekVariable("γ", "gamma")); 
calc.registerWord("δ", TStackCmdGreekVariable("δ", "delta")); 
calc.registerWord("ε", TStackCmdGreekVariable("ε", "epsilon")); 
calc.registerWord("ζ", TStackCmdGreekVariable("ζ", "zeta")); 
calc.registerWord("η", TStackCmdGreekVariable("η", "eta")); 
calc.registerWord("θ", TStackCmdGreekVariable("θ", "theta")); 
calc.registerWord("ι", TStackCmdGreekVariable("ι", "iota")); 
calc.registerWord("κ", TStackCmdGreekVariable("κ", "kappa")); 
calc.registerWord("λ", TStackCmdGreekVariable("λ", "lambda")); 
calc.registerWord("μ", TStackCmdGreekVariable("μ", "mu")); 
calc.registerWord("ν", TStackCmdGreekVariable("ν", "nu")); 
calc.registerWord("ξ", TStackCmdGreekVariable("ξ", "xi")); 
calc.registerWord("ο", TStackCmdGreekVariable("ο", "omicron")); 
calc.registerWord("π", TStackCmdGreekVariable("π", "pi")); 
calc.registerWord("ρ", TStackCmdGreekVariable("ρ", "rho")); 
calc.registerWord("σ", TStackCmdGreekVariable("σ", "sigma"));
calc.registerWord("ς", TStackCmdGreekVariable("ς", "varsigma"));
calc.registerWord("τ", TStackCmdGreekVariable("τ", "tau")); 
calc.registerWord("υ", TStackCmdGreekVariable("υ", "upsilon")); 
calc.registerWord("φ", TStackCmdGreekVariable("φ", "phi")); 
calc.registerWord("χ", TStackCmdGreekVariable("χ", "chi")); 
calc.registerWord("ψ", TStackCmdGreekVariable("ψ", "psi")); 
calc.registerWord("ω", TStackCmdGreekVariable("ω", "omega")); 

calc.registerEvaluator("integer-sum", IntegerSumEvaluator);
calc.registerEvaluator("suminteger-sum", SumIntegerSumEvaluator);

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

function backspace() {
    let commandArea = document.getElementById("commandArea");
    commandArea.value = commandArea.value.substring(0, commandArea.value.length - 1);;
}

function openKeyboard(evt, keyboardName) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="keyboard-tab-content" and hide them
    tabcontent = document.getElementsByClassName("keyboard-tab-content");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="keyboard-tab-button" and remove the class "active"
    tablinks = document.getElementsByClassName("keyboard-tab-button");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(keyboardName).style.display = "block";
    evt.currentTarget.className += " active";
} 

function updateKeyboard() {
    let keyboardDiv = document.getElementById("keyboard");
    while(keyboardDiv.firstChild) {
        keyboardDiv.removeChild(keyboardDiv.firstChild);
    }

    let keyboarGroupNumeric = new KeyboardGroup("numeric", [
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
    ]);

    let keyboarGroupAlphabetic = new KeyboardGroup("alphabetic", [
        new KeyboardButton("q", () => writeCommand("q"), "button-w1"),
        new KeyboardButton("w", () => writeCommand("w"), "button-w1"),
        new KeyboardButton("e", () => writeCommand("e"), "button-w1"),
        new KeyboardButton("r", () => writeCommand("r"), "button-w1"),
        new KeyboardButton("t", () => writeCommand("t"), "button-w1"),
        new KeyboardButton("y", () => writeCommand("y"), "button-w1"),
        new KeyboardButton("u", () => writeCommand("u"), "button-w1"),
        new KeyboardButton("i", () => writeCommand("i"), "button-w1"),
        new KeyboardButton("o", () => writeCommand("o"), "button-w1"), 
        new KeyboardButton("p", () => writeCommand("p"), "button-w1"),

        new KeyboardButton("a", () => writeCommand("a"), "button-w1"),
        new KeyboardButton("s", () => writeCommand("s"), "button-w1"),
        new KeyboardButton("d", () => writeCommand("d"), "button-w1"),
        new KeyboardButton("f", () => writeCommand("f"), "button-w1"),
        new KeyboardButton("g", () => writeCommand("g"), "button-w1"),
        new KeyboardButton("h", () => writeCommand("h"), "button-w1"),
        new KeyboardButton("j", () => writeCommand("j"), "button-w1"),
        new KeyboardButton("k", () => writeCommand("k"), "button-w1"),
        new KeyboardButton("l", () => writeCommand("l"), "button-w1"), 
        new KeyboardButton("ñ", () => writeCommand("ñ"), "button-w1"),

        new KeyboardButton("z", () => writeCommand("z"), "button-w1"),
        new KeyboardButton("x", () => writeCommand("x"), "button-w1"),
        new KeyboardButton("c", () => writeCommand("c"), "button-w1"),
        new KeyboardButton("v", () => writeCommand("v"), "button-w1"),
        new KeyboardButton("b", () => writeCommand("b"), "button-w1"),
        new KeyboardButton("n", () => writeCommand("n"), "button-w1"),
        new KeyboardButton("m", () => writeCommand("m"), "button-w1"),
        new KeyboardButton("⌫", () => backspace(), "button-w2")
    ]);

    /*θωερτψυιοπ
    ασδφγηςκλ
    ζχξωβνμ*/

    let keyboardGroupGreek = new KeyboardGroup("greek", [
        new KeyboardButton("θ", () => writeCommand("θ"), "button-w1"),
        new KeyboardButton("ω", () => writeCommand("ω"), "button-w1"),
        new KeyboardButton("ε", () => writeCommand("ε"), "button-w1"),
        new KeyboardButton("ρ", () => writeCommand("ρ"), "button-w1"),
        new KeyboardButton("τ", () => writeCommand("τ"), "button-w1"),
        new KeyboardButton("ψ", () => writeCommand("ψ"), "button-w1"),
        new KeyboardButton("υ", () => writeCommand("υ"), "button-w1"),
        new KeyboardButton("ι", () => writeCommand("ι"), "button-w1"),
        new KeyboardButton("ο", () => writeCommand("ο"), "button-w1"), 
        new KeyboardButton("π", () => writeCommand("π"), "button-w1"),

        new KeyboardButton("α", () => writeCommand("α"), "button-w1"),
        new KeyboardButton("σ", () => writeCommand("σ"), "button-w1"),
        new KeyboardButton("δ", () => writeCommand("δ"), "button-w1"),
        new KeyboardButton("φ", () => writeCommand("φ"), "button-w1"),
        new KeyboardButton("γ", () => writeCommand("γ"), "button-w1"),
        new KeyboardButton("η", () => writeCommand("η"), "button-w1"),
        new KeyboardButton("ς", () => writeCommand("ς"), "button-w1"),
        new KeyboardButton("κ", () => writeCommand("κ"), "button-w1"),
        new KeyboardButton("λ", () => writeCommand("λ"), "button-w1"), 
        new KeyboardButton("ñ", () => writeCommand("ñ"), "button-w1"),

        new KeyboardButton("ζ", () => writeCommand("ζ"), "button-w1"),
        new KeyboardButton("χ", () => writeCommand("χ"), "button-w1"),
        new KeyboardButton("ξ", () => writeCommand("ξ"), "button-w1"),
        new KeyboardButton("ω", () => writeCommand("ω"), "button-w1"),
        new KeyboardButton("β", () => writeCommand("β"), "button-w1"),
        new KeyboardButton("ν", () => writeCommand("ν"), "button-w1"),
        new KeyboardButton("μ", () => writeCommand("μ"), "button-w1"),
        new KeyboardButton("⌫", () => backspace(), "button-w2")
    ]);

    let keyboardGroupDiv = document.createElement('div');
    for(let keyboardButton of keyboarGroupNumeric.buttons) {
        let button = document.createElement('button');
        button.innerText = `${keyboardButton.textToShow}`;
        button.onclick = keyboardButton.fnToExecute;
        button.className = keyboardButton.className;
        keyboardGroupDiv.appendChild(button);
    }
    keyboardDiv.appendChild(keyboardGroupDiv);

    let keyboardTabDiv = document.createElement("div");
    keyboardTabDiv.className = "keyboard-tab-container";
    keyboardDiv.appendChild(keyboardTabDiv);

    // -----------------------------------------------------

    let keyboardButtonTabAlphabetic = document.createElement("button");
    keyboardButtonTabAlphabetic.className = "keyboard-tab-button";
    keyboardButtonTabAlphabetic.onclick = function(event) {
        openKeyboard(event, "alphabetic");
    };
    keyboardButtonTabAlphabetic.innerText = "Aa";
    keyboardTabDiv.appendChild(keyboardButtonTabAlphabetic);

    let keyboardButtonTabGreek = document.createElement("button");
    keyboardButtonTabGreek.className = "keyboard-tab-button";
    keyboardButtonTabGreek.onclick = function(event) {
        openKeyboard(event, "greek");
    };
    keyboardButtonTabGreek.innerText = "Aα";
    keyboardTabDiv.appendChild(keyboardButtonTabGreek);

    // ----------------------------------------------------

    let keyboartTabContentAlphabetic = document.createElement("div");
    keyboartTabContentAlphabetic.className = "keyboard-tab-content";
    keyboartTabContentAlphabetic.id = "alphabetic";
    for(let keyboardButton of keyboarGroupAlphabetic.buttons) {
        let button = document.createElement('button');
        button.innerText = `${keyboardButton.textToShow}`;
        button.onclick = keyboardButton.fnToExecute;
        button.className = keyboardButton.className;
        keyboartTabContentAlphabetic.appendChild(button);
    }
    keyboardDiv.appendChild(keyboartTabContentAlphabetic);

    let keyboartTabContentGreek = document.createElement("div");
    keyboartTabContentGreek.className = "keyboard-tab-content";
    keyboartTabContentGreek.id = "greek";
    for(let keyboardButton of keyboardGroupGreek.buttons) {
        let button = document.createElement('button');
        button.innerText = `${keyboardButton.textToShow}`;
        button.onclick = keyboardButton.fnToExecute;
        button.className = keyboardButton.className;
        keyboartTabContentGreek.appendChild(button);
    }
    keyboardDiv.appendChild(keyboartTabContentGreek);



    // let keyboardGroups = [
    //     new KeyboardGroup("numeric", [
    //         new KeyboardButton("0", () => writeCommand("0"), "button-w1"),
    //         new KeyboardButton("1", () => writeCommand("1"), "button-w1"),
    //         new KeyboardButton("2", () => writeCommand("2"), "button-w1"),
    //         new KeyboardButton("3", () => writeCommand("3"), "button-w1"),
    //         new KeyboardButton("4", () => writeCommand("4"), "button-w1"),
    //         new KeyboardButton("5", () => writeCommand("5"), "button-w1"),
    //         new KeyboardButton("6", () => writeCommand("6"), "button-w1"),
    //         new KeyboardButton("7", () => writeCommand("7"), "button-w1"),
    //         new KeyboardButton("8", () => writeCommand("8"), "button-w1"), 
    //         new KeyboardButton("9", () => writeCommand("9"), "button-w1"),

    //         new KeyboardButton(".", () => writeCommand("."), "button-w1"),
    //         new KeyboardButton("E", () => writeCommand("E"), "button-w1"),
    //         new KeyboardButton("␣", () => writeCommand(" "), "button-w2"),
    //         new KeyboardButton("+", () => processWord("+"), "button-w1"),
    //         new KeyboardButton("-", () => processWord("-"), "button-w1"),
    //         new KeyboardButton("*", () => processWord("*"), "button-w1"),
    //         new KeyboardButton("/", () => processWord("/"), "button-w1"),
    //         new KeyboardButton("exe", () => process(), "button-w2"),

    //         new KeyboardButton("drop", () => processWord(".."), "button-w2"),
    //         new KeyboardButton("dup", () => processWord("."), "button-w2"),
    //         new KeyboardButton("x", () => processWord("x"), "button-w1"),
    //         new KeyboardButton("y", () => processWord("y"), "button-w1"),
    //         new KeyboardButton("z", () => processWord("z"), "button-w1"),
    //         new KeyboardButton("d", () => processWord("diff"), "button-w1"),
    //         new KeyboardButton("∫", () => processWord("integral"), "button-w1"),
    //         new KeyboardButton("√", () => processWord("sqrt"), "button-w1"),

    //         new KeyboardButton("^", () => processWord("pow"), "button-w1"),
    //         new KeyboardButton("=", () => processWord("="), "button-w1"),
    //         new KeyboardButton("sin", () => processWord("sin"), "button-w2"),
    //         new KeyboardButton("cos", () => processWord("cos"), "button-w2"),
    //         new KeyboardButton("tan", () => processWord("tan"), "button-w2"),
    //         new KeyboardButton("inv", () => processWord("inv"), "button-w2"),

    //         new KeyboardButton("neg", () => processWord("neg"), "button-w2")
    //     ]),
    //     new KeyboardGroup("alphabetic", [
    //         new KeyboardButton("q", () => writeCommand("q"), "button-w1"),
    //         new KeyboardButton("w", () => writeCommand("w"), "button-w1"),
    //         new KeyboardButton("e", () => writeCommand("e"), "button-w1"),
    //         new KeyboardButton("r", () => writeCommand("r"), "button-w1"),
    //         new KeyboardButton("t", () => writeCommand("t"), "button-w1"),
    //         new KeyboardButton("y", () => writeCommand("y"), "button-w1"),
    //         new KeyboardButton("u", () => writeCommand("u"), "button-w1"),
    //         new KeyboardButton("i", () => writeCommand("i"), "button-w1"),
    //         new KeyboardButton("o", () => writeCommand("o"), "button-w1"), 
    //         new KeyboardButton("p", () => writeCommand("p"), "button-w1"),

    //         new KeyboardButton("a", () => writeCommand("a"), "button-w1"),
    //         new KeyboardButton("s", () => writeCommand("s"), "button-w1"),
    //         new KeyboardButton("d", () => writeCommand("d"), "button-w1"),
    //         new KeyboardButton("f", () => writeCommand("f"), "button-w1"),
    //         new KeyboardButton("g", () => writeCommand("g"), "button-w1"),
    //         new KeyboardButton("h", () => writeCommand("h"), "button-w1"),
    //         new KeyboardButton("j", () => writeCommand("j"), "button-w1"),
    //         new KeyboardButton("k", () => writeCommand("k"), "button-w1"),
    //         new KeyboardButton("l", () => writeCommand("l"), "button-w1"), 
    //         new KeyboardButton("ñ", () => writeCommand("ñ"), "button-w1"),

    //         new KeyboardButton("z", () => writeCommand("z"), "button-w1"),
    //         new KeyboardButton("x", () => writeCommand("x"), "button-w1"),
    //         new KeyboardButton("c", () => writeCommand("c"), "button-w1"),
    //         new KeyboardButton("v", () => writeCommand("v"), "button-w1"),
    //         new KeyboardButton("b", () => writeCommand("b"), "button-w1"),
    //         new KeyboardButton("n", () => writeCommand("n"), "button-w1"),
    //         new KeyboardButton("m", () => writeCommand("m"), "button-w1"),
    //         new KeyboardButton("⌫", () => backspace(), "button-w2")
    //     ]),
    // ];
    // for(let keyboardGroup of keyboardGroups)
    // {
    //     let keyboardGroupDiv = document.createElement('div');
    //     for(let keyboardButton of keyboardGroup.buttons) {
    //         let button = document.createElement('button');
    //         button.innerText = `${keyboardButton.textToShow}`;
    //         button.onclick = keyboardButton.fnToExecute;
    //         button.className = keyboardButton.className;
    //         keyboardGroupDiv.appendChild(button);
    //     }
    //     keyboardDiv.appendChild(keyboardGroupDiv);
    // }
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