/**
 * 
 * @param {String} str
 * @returns {boolean} 
 */
function isInteger(value) {
    if(parseInt(value, 10).toString() === value) {
        return true
    }
    return false;
}

function greatestCommonDivisor(n1, n2) {
    if (n2 === 0) {  
        return n1 
    } 
    return greatestCommonDivisor(n2, n1 % n2);
}

/**
 * 
 * @param {String} str
 * @returns {boolean} 
 */
function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

/**
 * 
 * @param {String} value 
 * @param {Function} needsParenthesesFunction 
 * @returns {String}
 */
function addParentheses(value, needsParenthesesFunction) {
    return needsParenthesesFunction() ? `\\left(${value}\\right)` : value;
}

class StackItem {
    /**
     * @return {String}
     */
    toString() {
        return "";
    }

    /**
     * @return {String}
     */
    formatLatex() {
        return "";
    }
}

class Integer extends StackItem {
    /**
     * @param {number} value
     */
    constructor(value) {
        super();
        this.value = value;
    }

    /**
     * @return {String}
     */
    toString() {
        return this.value.toString();
    }

    /**
     * @return {String}
     */
    formatLatex() {
        return this.value.toString();
    }
}

class Real extends StackItem {
    /**
     * @param {number} value
     */
    constructor(value) {
        super();
        this.value = value;
    }

    /**
     * @return {String}
     */
    toString() {
        return this.value.toString();
    }

    /**
     * @return {String}
     */
    formatLatex() {
        return this.value.toString();
    }
}

class Variable extends StackItem {
    /**
     * @param {String} value
     */
    constructor(name) {
        super();
        this.name = name;
    }

    /**
     * @return {String}
     */
    toString() {
        return this.name;
    }

    /**
     * @return {String}
     */
    formatLatex() {
        // return `{\\color{red}{${this.name}}}`;
        return `${this.name}`;
    }
}

class Sqrt extends StackItem {
    /**
     * @param {StackItem} value
     */
    constructor(value) {
        super();
        this.value = value;
    }

    /**
     * @return {String}
     */
    toString() {
        return `sqrt(${this.value.toString()})`;
    }

    /**
     * @return {String}
     */
    formatLatex() {
        return `\\sqrt{${this.value.formatLatex()}}`;
    }
}

class Abs extends StackItem {
    /**
     * @param {StackItem} value
     */
    constructor(value) {
        super();
        this.value = value;
    }

    /**
     * @return {String}
     */
    toString() {
        return `|${this.value.toString()}|`;
    }

    /**
     * @return {String}
     */
    formatLatex() {
        return `\\left\\|${this.value.formatLatex()}\\right\\|`;
    }
}

class Neg extends StackItem {
    /**
     * @param {StackItem} value
     */
    constructor(value) {
        super();
        this.value = value;
    }

    /**
     * @returns {boolean}
     */
    needs_parentheses() {
        if(this.value instanceof Integer ||
           this.value instanceof Real ||
           this.value instanceof Variable ||
           this.value instanceof Fraction ||
           this.value instanceof Power)
        {
            return false;            
        }
        return true;
    }

    /**
     * @return {String}
     */
    toString() {
        return this.needs_parentheses() ? `-(${this.value.toString()})` : `-${this.value.toString()}`;
    }

    /**
     * @return {String}
     */
    formatLatex() {
        return this.needs_parentheses() ? `-\\left(${this.value.toString()}\\right)` : `-${this.value.toString()}`;
    }
}

class BinaryOperation extends StackItem {
    /**
     * @param {StackItem} lhs
     * @param {StackItem} rhs
     * @param {String} operator
     */
    constructor(lhs, rhs, operator) {
        super();
        this.lhs = lhs;
        this.rhs = rhs;
        this.operator = operator;
    }

    /**
     * @returns {boolean}
     */
    lhs_needs_parentheses() {
        return false;
    }

    /**
     * @returns {boolean}
     */
    rhs_needs_parentheses() {
        return false;
    }

    /**
     * @return {String}
     */
    toString() {
        var res = "";
        res += this.lhs_needs_parentheses() ? "(" + this.lhs.toString() + ")" : this.lhs.toString();
        res += this.operator;
        res += this.rhs_needs_parentheses() ? "(" + this.rhs.toString() + ")" : this.rhs.toString();
        return res;
    }

    /**
     * @return {String}
     */
    formatLatex() {
        var res = "";
        res += this.lhs_needs_parentheses() ? "\\left(" + this.lhs.formatLatex() + "\\right)" : this.lhs.formatLatex();
        res += this.operator;
        res += this.rhs_needs_parentheses() ? "\\left(" + this.rhs.formatLatex() + "\\right)" : this.rhs.formatLatex();
        return res;
    }
}

class Sum extends BinaryOperation {
    /**
     * @param {StackItem} lhs
     * @param {StackItem} rhs
     */
    constructor(lhs, rhs) {
        super(lhs, rhs, " + ");
    }

    /**
     * @returns {boolean}
     */
    lhs_needs_parentheses() {
        if(this.lhs instanceof Integer || 
           this.lhs instanceof Real || 
           this.lhs instanceof Sqrt || 
           this.lhs instanceof Sum || 
           this.lhs instanceof Subtraction || 
           this.lhs instanceof Variable || 
           this.lhs instanceof Multiplication ||
           this.lhs instanceof Fraction ||
           this.lhs instanceof Power) {
            return false;
        }
        return true;
    }

    /**
     * @returns {boolean}
     */
    rhs_needs_parentheses() {
        if(this.rhs instanceof Integer || 
           this.rhs instanceof Real ||
           this.rhs instanceof Sqrt ||  
           this.rhs instanceof Sum || 
           this.rhs instanceof Variable ||
           this.rhs instanceof Multiplication ||
           this.rhs instanceof Fraction ||
           this.rhs instanceof Power) {
            return false;
        }
        return true;
    }
}

class Subtraction extends BinaryOperation {
    /**
     * @param {StackItem} lhs
     * @param {StackItem} rhs
     */
    constructor(lhs, rhs) {
        super(lhs, rhs, " - ");
    }

    /**
     * @returns {boolean}
     */
    lhs_needs_parentheses() {
        if(this.lhs instanceof Integer || 
           this.lhs instanceof Real || 
           this.lhs instanceof Sum || 
           this.lhs instanceof Subtraction || 
           this.lhs instanceof Variable) {
            return false;
        }
        return true;
    }

    /**
     * @returns {boolean}
     */
    rhs_needs_parentheses() {
        if(this.rhs instanceof Integer || 
           this.rhs instanceof Real  || 
           this.rhs instanceof Variable) {
            return false;
        }
        return true;
    }
}

class Multiplication extends BinaryOperation {
    /**
     * @param {StackItem} lhs
     * @param {StackItem} rhs
     */
    constructor(lhs, rhs) {
        super(lhs, rhs, "·");
    }

    /**
     * @returns {boolean}
     */
    lhs_needs_parentheses() {
        if(this.lhs instanceof Integer || 
           this.lhs instanceof Real || 
           this.lhs instanceof Variable || 
           this.lhs instanceof Multiplication ||
           this.lhs instanceof Power || 
           this.lhs instanceof Sqrt ||
           this.lhs instanceof Fraction) {
            return false;
        }
        return true;
    }

    /**
     * @returns {boolean}
     */
    rhs_needs_parentheses() {
        if(this.rhs instanceof Integer || 
           this.rhs instanceof Real  || 
           this.rhs instanceof Variable || 
           this.rhs instanceof Multiplication || 
           this.rhs instanceof Power || 
           this.rhs instanceof Sqrt || 
           this.rhs instanceof Fraction) {
            return false;
        }
        return true;
    }
}

class Fraction extends BinaryOperation {
    /**
     * @param {StackItem} lhs
     * @param {StackItem} rhs
     */
    constructor(lhs, rhs) {
        super(lhs, rhs, "/");
    }

    /**
     * @returns {boolean}
     */
    lhs_needs_parentheses() {
        if(this.lhs instanceof Integer || this.lhs instanceof Real || this.lhs instanceof Variable || this.lhs instanceof Multiplication) {
            return false;
        }
        return true;
    }

    /**
     * @returns {boolean}
     */
    rhs_needs_parentheses() {
        if(this.rhs instanceof Integer || this.rhs instanceof Real  || this.rhs instanceof Variable) {
            return false;
        }
        return true;
    }

    /**
     * @return {String}
     */
    formatLatex() {
        return "\\frac{" + this.lhs.formatLatex()  + "}{" + this.rhs.formatLatex() + "}";
    }
}

class Power extends BinaryOperation {
    /**
     * @param {StackItem} lhs
     * @param {StackItem} rhs
     */
    constructor(lhs, rhs) {
        super(lhs, rhs, "^");
    }

    /**
     * @returns {boolean}
     */
    lhs_needs_parentheses() {
        if(this.lhs instanceof Integer || this.lhs instanceof Real || this.lhs instanceof Variable) {
            return false;
        }
        return true;
    }

    /**
     * @returns {boolean}
     */
    rhs_needs_parentheses() {
        if(this.rhs instanceof Integer || this.rhs instanceof Real  || this.rhs instanceof Variable) {
            return false;
        }
        return true;
    }

    /**
     * @returns {boolean}
     */
    latex_lhs_needs_parentheses() {
        if(this.lhs instanceof Integer || this.lhs instanceof Real || this.lhs instanceof Variable) {
            return false;
        }
        return true;
    }

    /**
     * @returns {boolean}
     */
    latex_rhs_needs_parentheses() {
        return false;
    }

    /**
     * @return {String}
     */
    formatLatex() {
        return "{" + addParentheses(this.lhs.formatLatex(), () => this.latex_lhs_needs_parentheses())  + "}^{" + addParentheses(this.rhs.formatLatex(), () => this.latex_rhs_needs_parentheses()) + "}";
    }
}

class Equality extends BinaryOperation {
    /**
     * @param {StackItem} lhs
     * @param {StackItem} rhs
     */
    constructor(lhs, rhs) {
        super(lhs, rhs, " = ");
    }

    /**
     * @returns {boolean}
     */
    lhs_needs_parentheses() {
        return false;
    }

    /**
     * @returns {boolean}
     */
    rhs_needs_parentheses() {
        return false;
    }
}

class Stack {
    constructor() {
        this.items = [];
    }

    /**
     * @param {StackItem} item
     */
    push(item) {
        console.log("Pushing item " + item.toString() + " to stack");
        this.items.unshift(item);
    }

    /**
     * @param {number} index
     * @returns {StackItem}
     */
    get(index) {
        return this.items[index];
    }

    /**
     * @returns {StackItem}
     */
    pop() {
        return this.items.shift();
    }

    /**
     * @returns {number}
     */
    count() {
        return this.items.length;
    }
}

class StackCmdBase {
    constructor() {
        if(new.target === StackCmdBase) {
            throw new TypeError("Cannot create an instance of an abstract class");
        }
    }

    /**
     * 
     * @param {Stack} stack 
     */
    execute(stack) {

    }
}

class StackCmdEval extends StackCmdBase {
    constructor() {
        super();
    }

    /**
     * @param {Stack} stack 
     */
    execute(stack) {
        var item = stack.pop(); /** @type {StackItem} */
        var evaluatedItem = this.eval(item);
        stack.push(evaluatedItem);
    }

    /**
     * 
     * @param {StackItem} item
     * @returns {StackItem} 
     */
    eval(item) {
        if(item instanceof Neg) {
            return this.evalNeg(item);
        } else if(item instanceof Sum) {
            return this.evalSum(item);
        } else if(item instanceof Subtraction) {
            return this.evalSubtraction(item);               
        } else if(item instanceof Multiplication) {
            return this.evalMultiplication(item);               
        } else if(item instanceof Fraction) {
            return this.evalFraction(item);                
        } else if(item instanceof Power) {
            return this.evalPower(item);               
        } else {
            return item;
        }
    }

    /**
     * @param {Neg} item 
     * @returns {StackItem}
     */
    evalNeg(item) {
        var evalValue = this.eval(item.value);
        if(evalValue instanceof Integer) {
            return new Integer(-evalValue);
        } else {
            return new Neg(evalValue);
        }
    }

    /**
     * 
     * @param {Sum} item 
     * @returns {StackItem}
     */
    evalSum(item) {
        var evalLhs = this.eval(item.lhs);
        var evalRhs = this.eval(item.rhs);
        if(evalLhs instanceof Integer && evalRhs instanceof Integer) {
            return new Integer(evalLhs.value + evalRhs.value);
        } else {
            return new Sum(evalLhs, evalRhs);
        }
    }

    /**
     * 
     * @param {Subtraction} item 
     * @returns {StackItem}
     */
    evalSubtraction(item) {
        var evalLhs = this.eval(item.lhs);
        var evalRhs = this.eval(item.rhs);
        if(evalLhs instanceof Integer && evalRhs instanceof Integer) {
            return new Integer(evalLhs.value - evalRhs.value);
        } else {
            return new Subtraction(evalLhs, evalRhs);
        } 
    }

    /**
     * 
     * @param {Multiplication} item 
     * @returns {StackItem}
     */
    evalMultiplication(item) {
        var evalLhs = this.eval(item.lhs);
        var evalRhs = this.eval(item.rhs);
        if(evalLhs instanceof Integer && evalRhs instanceof Integer) {
            return new Integer(evalLhs.value * evalRhs.value);
        } else if(evalLhs instanceof Integer) {
            if(evalLhs.value === 1) {
                return evalRhs;
            } else {
                return new Multiplication(evalLhs, evalRhs);
            }
        } else if(evalRhs instanceof Integer) {
            if(evalRhs.value === 1) {
                return evalLhs;
            } else {
                return new Multiplication(evalLhs, evalRhs);
            }
        } else {
            return new Multiplication(evalLhs, evalRhs);
        }
    }

    /**
     * 
     * @param {Fraction} item
     * @returns {StackItem} 
     */
    evalFraction(item) {
        var evalLhs = this.eval(item.lhs);
        var evalRhs = this.eval(item.rhs);
        if(evalLhs instanceof Integer && evalRhs instanceof Integer) {
            if(evalRhs.value === 1) {
                return new Integer(evalLhs.value);
            } else {
                var gcd = greatestCommonDivisor(evalLhs.value, evalRhs.value);
                return new Fraction(new Integer(parseInt(evalLhs.value/gcd)), new Integer(parseInt(evalRhs.value/gcd)));
            }                
        } else if(evalLhs instanceof Integer && evalRhs instanceof Fraction) {
            var newLhs = this.eval(new Multiplication(evalLhs, evalRhs.rhs));
            var newRhs = this.eval(evalRhs.lhs);
            return new Fraction(newLhs, newRhs);
        } else {
            return new Fraction(evalLhs, evalRhs);
        }
    }

    /**
     * 
     * @param {Power} item
     * @returns {StackItem} 
     */
    evalPower(item) {
        var evalLhs = this.eval(item.lhs);
        var evalRhs = this.eval(item.rhs);
        return new Power(evalLhs, evalRhs); 
    }
}

class StackCmdSum extends StackCmdBase {
    constructor() {
        super();
    }

    /**
     * @param {Stack} stack 
     */
    execute(stack) {
        var item2 = stack.pop(); /** @type {StackItem} */
        var item1 = stack.pop(); /** @type {StackItem} */
        stack.push(new Sum(item1, item2));
    }
}

class StackCmdAbs extends StackCmdBase {
    constructor() {
        super();
    }

    /**
     * @param {Stack} stack 
     */
    execute(stack) {
        var item = stack.pop(); /** @type {StackItem} */
        stack.push(new Abs(item));
    }
}

class StackCmdSubtraction extends StackCmdBase {
    constructor() {
        super();
    }

    /**
     * @param {Stack} stack 
     */
    execute(stack) {
        var item2 = stack.pop(); /** @type {StackItem} */
        var item1 = stack.pop(); /** @type {StackItem} */
        stack.push(new Subtraction(item1, item2));
    }
}

class Calc {
    constructor() {
        this.stack = new Stack();
        this.wordDict = {}; /** @type {Object} */
    }

    /**
     * 
     * @param {string} key 
     * @param {class} command 
     */
    registerWord(key, command) {
        this.wordDict[key] = command;
    }

    /**
     * @param {string} word 
     * @returns {boolean}
     */
    process(word) {
        if(!isNaN(word)) {
            if(isInteger(word)) {
                this.stack.push(new Integer(parseInt(word, 10)));
            } else {
                this.stack.push(new Integer(parseFloat(word)));
            }
        } else if(word in this.wordDict) {
            var cmd = new this.wordDict[word]();
            cmd.execute(this.stack);
        } else if (word === "+") {
            // var item2 = this.stack.pop();
            // var item1 = this.stack.pop();
            // this.stack.push(new Sum(item1, item2));
        } else if (word === "-") {
            // var item2 = this.stack.pop();
            // var item1 = this.stack.pop();
            // this.stack.push(new Subtraction(item1, item2));
        } else if (word === "*") {
            var item2 = this.stack.pop();
            var item1 = this.stack.pop();
            this.stack.push(new Multiplication(item1, item2));
        } else if (word === "/") {
            var item2 = this.stack.pop();
            var item1 = this.stack.pop();
            this.stack.push(new Fraction(item1, item2));
        } else if (word === "^" || word === "pow") {
            var item2 = this.stack.pop();
            var item1 = this.stack.pop();
            this.stack.push(new Power(item1, item2));
        } else if (word === "inv") {
            var item = this.stack.pop();
            this.stack.push(new Fraction(new Integer(1), item));
        } else if (word === "sqrt") {
            var item = this.stack.pop();
            this.stack.push(new Sqrt(item));
        } else if (word === "neg") {
            var item = this.stack.pop();
            this.stack.push(new Neg(item));
        } else if (word === "=") {
            var item2 = this.stack.pop();
            var item1 = this.stack.pop();
            this.stack.push(new Equality(item1, item2));
        } else if (word === ".") {
            var item = this.stack.get(0);
            this.stack.push(item);
        } else if (word === "..") {
            var item = this.stack.pop();
        } else if (isLetter(word)) {
            this.stack.push(new Variable(word));
        } else {
            return false;
        }
        return true;
    }
}