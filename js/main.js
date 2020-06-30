var calc = new Calc();
calc.registerWord("eval", StackCmdEval);
calc.registerWord("+", StackCmdSum);
calc.registerWord("-", StackCmdSubtraction);

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
    for(word of words.split(" ")) {
        calc.process(word)
    }
    updateStackTextArea();
    updateEquationText();
    MathJax.typeset();
    document.getElementById("commandArea").value = "";
    return false;
}

window.MathJax = {
    loader: {load: ['[tex]/color']},
    tex: {packages: {'[+]': ['color']}}
};