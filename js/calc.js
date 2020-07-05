'use strict';

/**
 * @returns {String}
 */
var nextId = (function () {
    var counter = 0;
    return function () {
        counter += 1; 
        return `rpntex-id${counter}`
    }
})();

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

class StackItemVisitor {
    constructor() {

    }
    /**
     * 
     * @param {StackItem} item 
     */
    visit(item) {
        throw new Error("Wrong visitor");
    }
}

class StackItem {
    /**
     * @param {StackItem} parent 
     */
    constructor() {
        /** @type {String} */
        this.id = nextId(); 
        /** @type {String} */
        this.className = "rpntex-item";
        /** @type {StackItem} */ 
        this.parent = parent;
    }

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

    /**
     * @return {String}
     */
    formatLatex() {
        return `\\class{${this.className}}{\\cssId{${this.id}}{${this.formatInnerLatex()}}}`;
    }

    /**
     * 
     * @param {String} id 
     * @returns {StackItem}
     */
    findById(id) {
        if(this.id === id) {
            return this;
        }
        for(var child of this.children) {
            var item = child.findById(id);
            if(item != null) {
                return item;
            }
        }
        return null;
    }

    /**
     * 
     * @param {function(StackItem) => StackItem} fn 
     */
    apply(fn) {
        return this;
    }

    /**
     * 
     * @param {StackItemVisitor} visitor 
     */
    accept(visitor) {
        visitor.visit(this);
    }

    /**
     * @returns {Array<StackItem>}
     */
    get children() {
        return [];
    }
}

class Integer extends StackItem {
    /**
     * @param {number} value
     */
    constructor(value) {
        super();
        this.value = value; /** @type {number} */
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
    formatInnerLatex() {
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
    formatInnerLatex() {
        return this.value.toString();
    }
}

class Variable extends StackItem {
    /**
     * @param {String} value
     */
    constructor(name) {
        super();
        /** @type {String} */
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
    formatInnerLatex() {
        // return `{\\color{red}{${this.name}}}`;
        return `${this.name}`;
    }
}

class UnaryOperation extends StackItem {
    /**
     * @param {StackItem} value
     */
    constructor(value) {
        super();
        /** @type {StackItem} */
        this.value = value;
    }

    /**
     * 
     * @param {function(StackItem) => StackItem} fn 
     */
    apply(fn) {
        this.value = fn(value);
    }

    /**
     * @returns {Array.<StackItem>}
     */
    get children() {
        return [this.value];
    }
}

class Sqrt extends UnaryOperation {
    /**
     * @param {StackItem} value
     */
    constructor(value) {
        super(value);
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
    formatInnerLatex() {
        return `\\sqrt{${this.value.formatLatex()}}`;
    }
}

class Abs extends UnaryOperation {
    /**
     * @param {StackItem} value
     */
    constructor(value) {
        super(value);
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
    formatInnerLatex() {
        return `\\left|${this.value.formatLatex()}\\right|`;
    }
}

class Neg extends UnaryOperation {
    /**
     * @param {StackItem} value
     */
    constructor(value) {
        super(value);
    }

    /**
     * @returns {boolean}
     */
    needs_parentheses() {
        if(this.value instanceof Integer ||
           this.value instanceof Real ||
           this.value instanceof Variable ||
           this.value instanceof Fraction ||
           this.value instanceof Power || 
           this.value instanceof Abs)
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
    formatInnerLatex() {
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
     * 
     * @param {function(StackItem) => StackItem} fn 
     */
    apply(fn) {
        this.lhs = fn(this.lhs);
        this.rhs = fn(this.rhs);
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
    formatInnerLatex() {
        var res = "";
        res += this.lhs_needs_parentheses() ? "\\left(" + this.lhs.formatLatex() + "\\right)" : this.lhs.formatLatex();
        res += this.operator;
        res += this.rhs_needs_parentheses() ? "\\left(" + this.rhs.formatLatex() + "\\right)" : this.rhs.formatLatex();
        return res;
    }

    /**
     * @returns {Array.<StackItem>}
     */
    get children() {
        return [this.lhs, this.rhs];
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
           this.lhs instanceof Power ||
           this.lhs instanceof Abs) {
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
           this.rhs instanceof Power ||
           this.rhs instanceof Abs) {
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
           this.lhs instanceof Fraction || 
           this.lhs instanceof Variable ||
           this.lhs instanceof Abs) {
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
           this.lhs instanceof Fraction || 
           this.rhs instanceof Variable||
           this.rhs instanceof Abs) {
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
           this.lhs instanceof Fraction ||
           this.lhs instanceof Abs) {
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
           this.rhs instanceof Fraction ||
           this.rhs instanceof Abs) {
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
     * @returns {StackItem}
     */
    get numerator() {
        return this.lhs;
    }

    /**
     * @returns {StackItem} 
     */
    get denominator() {
        return this.rhs;
    }

    /**
     * @returns {boolean}
     */
    lhs_needs_parentheses() {
        if(this.lhs instanceof Integer || 
           this.lhs instanceof Real || 
           this.lhs instanceof Variable || 
           this.lhs instanceof Multiplication) {
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

    /**
     * @return {String}
     */
    formatInnerLatex() {
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
    formatInnerLatex() {
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
        /** @type {Array.<StackItem>} */
        this.items = [];
    }

    /**
     * @param {StackItem} item
     */
    push(item) {
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
        if(this.items.length > 0) {
            return this.items.shift();
        } else {
            throw new Error("Stack is empty");
        }
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
        } else if(item instanceof Sqrt) {
            return this.evalSqrt(item);             
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
        } else if(evalLhs instanceof Integer && evalRhs instanceof Fraction) {
            var numerator = new Sum(new Multiplication(evalLhs, evalRhs.denominator), evalRhs.numerator);
            var denominator = evalRhs.denominator;
            return this.evalFraction(new Fraction(numerator, denominator));
        } else if(evalLhs instanceof Fraction && evalRhs instanceof Integer) {
            var numerator = new Sum(evalLhs.numerator, new Multiplication(evalRhs, evalLhs.denominator));
            var denominator = evalLhs.denominator;
            return this.evalFraction(new Fraction(numerator, denominator));
        } else if(evalLhs instanceof Fraction && evalRhs instanceof Fraction) {
            var numerator = new Sum(new Multiplication(evalLhs.numerator, evalRhs.denominator), new Multiplication(evalRhs.numerator, evalLhs.denominator));
            var denominator = new Multiplication(evalLhs.denominator, evalRhs.denominator);
            return this.evalFraction(new Fraction(numerator, denominator));
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
        if(evalRhs instanceof Integer && evalRhs.value === 1) {
            return evalLhs;
        }
        if(evalLhs instanceof Integer && evalRhs instanceof Integer) {
            var gcd = greatestCommonDivisor(evalLhs.value, evalRhs.value);
            var numerator = parseInt(evalLhs.value/gcd);
            var denominator = parseInt(evalRhs.value/gcd);
            if(denominator === 1) {
                return new Integer(numerator);
            } else {
                return new Fraction(new Integer(numerator), new Integer(denominator));              
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

    /**
     * 
     * @param {Sqrt} item
     * @returns {StackItem} 
     */
    evalSqrt(item) {
        var evalValue = this.eval(item.value);
        return new Sqrt(evalValue); 
    }
}

class StackCmdApply extends StackCmdBase {
    /**
     * 
     * @param {function(StackItem) => StackItem} fn 
     */
    constructor(fn) {
        super();
        this.fn = fn;
    }

    /**
     * 
     * @param {Stack} stack 
     */
    execute(stack) {
        var item = stack.pop();
        stack.push(item);
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

class StackCmdMultiplication extends StackCmdBase {
    constructor() {
        super();
    }

    /**
     * @param {Stack} stack 
     */
    execute(stack) {
        var item2 = stack.pop(); /** @type {StackItem} */
        var item1 = stack.pop(); /** @type {StackItem} */
        stack.push(new Multiplication(item1, item2));
    }
}

class StackCmdFraction extends StackCmdBase {
    constructor() {
        super();
    }

    /**
     * @param {Stack} stack 
     */
    execute(stack) {
        var item2 = stack.pop(); /** @type {StackItem} */
        var item1 = stack.pop(); /** @type {StackItem} */
        stack.push(new Fraction(item1, item2));
    }
}

class StackCmdPower extends StackCmdBase {
    constructor() {
        super();
    }

    /**
     * @param {Stack} stack 
     */
    execute(stack) {
        var item2 = stack.pop(); /** @type {StackItem} */
        var item1 = stack.pop(); /** @type {StackItem} */
        stack.push(new Power(item1, item2));
    }
}

class StackCmdInv extends StackCmdBase {
    constructor() {
        super();
    }

    /**
     * @param {Stack} stack 
     */
    execute(stack) {
        var item = stack.pop();
        stack.push(new Fraction(new Integer(1), item));
    }
}

class StackCmdSqrt extends StackCmdBase {
    constructor() {
        super();
    }

    /**
     * @param {Stack} stack 
     */
    execute(stack) {
        var item = stack.pop();
        stack.push(new Sqrt(item));
    }
}

class StackCmdNeg extends StackCmdBase {
    constructor() {
        super();
    }

    /**
     * @param {Stack} stack 
     */
    execute(stack) {
        var item = stack.pop();
        stack.push(new Neg(item));
    }
}

class StackCmdEquality extends StackCmdBase {
    constructor() {
        super();
    }

    /**
     * @param {Stack} stack 
     */
    execute(stack) {
        var item2 = stack.pop();
        var item1 = stack.pop();
        stack.push(new Equality(item1, item2));
    }
}

class StackCmdDup extends StackCmdBase {
    constructor() {
        super();
    }

    /**
     * @param {Stack} stack 
     */
    execute(stack) {
        var item = stack.get(0);
        stack.push(item);
    }
}

class StackCmdDrop extends StackCmdBase {
    constructor() {
        super();
    }

    /**
     * @param {Stack} stack 
     */
    execute(stack) {
        var item = stack.pop();
    }
}

class StackCmdSwap extends StackCmdBase {
    constructor() {
        super();
    }

    /**
     * @param {Stack} stack 
     */
    execute(stack) {
        var item2 = stack.pop();
        var item1 = stack.pop();
        stack.push(item1);
        stack.push(item2);
    }
}

// --------------------------------------------------------------------------------------------------
// Evaluators

class Evaluator {
    /**
     * 
     * @param {StackItem} item 
     * @returns {boolean}
     */
    canApply(item) {
        return false;    
    }

    /**
     * 
     * @param {StackItem} item
     * @returns {StackItem} 
     */
    eval(item) {
        return null;
    }

    /**
     * 
     * @param {StackItem} item 
     * @return {String}
     */
    getDescription(item) {
        return "Base evaluator";
    }
}

class IntegerSumEvaluator {
    /**
     * 
     * @param {StackItem} item 
     * @returns {boolean}
     */
    canApply(item) {
        if(item instanceof Sum) {
            if(item.lhs instanceof Integer && item.rhs instanceof Integer) {
                return true;
            }
        }    
        return false;
    }

    /**
     * 
     * @param {StackItem} item
     * @returns {StackItem} 
     */
    eval(item) {
        if(this.canApply(item)) {
            /** @type {Integer} */
            var lhs = item.lhs; 
            /** @type {Integer} */
            var rhs = item.rhs; 
            return new Integer(lhs.value + rhs.value);
        } else {
            return item;
        }
    }

    /**
     * 
     * @param {StackItem} item 
     * @return {String}
     */
    getDescription(item) {
        return "Sum integers";
    }
}

class SumIntegerSumEvaluator {
    /**
     * 
     * @param {StackItem} item 
     * @returns {boolean}
     */
    canApply(item) {
        if(item instanceof Sum) {
            if(item.lhs instanceof Sum && item.lhs.lhs instanceof Integer && item.lhs.rhs instanceof Integer && item.rhs instanceof Integer) {
                return true;
            }
        }    
        return false;
    }

    /**
     * 
     * @param {StackItem} item
     * @returns {StackItem} 
     */
    eval(item) {
        if(this.canApply(item)) {
            /** @type {Sum} */
            var sum = item.lhs; 
            /** @type {Integer} */
            var rhs = item.rhs; 
            return new Sum(new Integer(sum.lhs.value), new Integer(sum.rhs.value + rhs.value));
        } else {
            return item;
        }
    }
}

// --------------------------------------------------------------------------------------------------

class ReplaceVisitor extends StackItemVisitor {
    /**
     * 
     * @param {String} itemId 
     * @param {StackItem} replaceWith 
     */
    constructor(itemId, replaceWith) {
        super();
        /** @type {String} */
        this.itemId = itemId;
        /** @type {StackItem} */
        this.replaceWith = replaceWith;
    }
    
    /**
     * 
     * @param {StackItem} item 
     */
    visit(item) {
        if(item instanceof UnaryOperation) {
            this.visitUnary(item);
        } else if (item instanceof BinaryOperation) {
            this.visitBinary(item);
        }
    }

    /**
     * 
     * @param {UnaryOperation} item 
     */
    visitUnary(item) {
        if(item.value.id === this.itemId) {
            item.value = this.replaceWith;
        } else {
            this.visit(item.value);
        }
    }

    /**
     * 
     * @param {BinaryOperation} item 
     */
    visitBinary(item) {
        if(item.lhs.id === this.itemId) {
            item.lhs = this.replaceWith;
        } else {
            this.visit(item.lhs);
        }
        if(item.rhs.id === this.itemId) {
            item.rhs = this.replaceWith;
        } else {
            this.visit(item.rhs);
        }
    }
}

// --------------------------------------------------------------------------------------------------

class Calc {
    constructor() {
        /** @type {Stack} */
        this.stack = new Stack();
        /** @type {Object} */
        this.wordDict = {};
        /** @type {Object} */ 
        this.evaluatorDict = {};
        /** @type {StackItem} */
        this.selectedItem = null;
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
     * 
     * @param {string} key 
     * @param {class} command 
     */
    registerEvaluator(key, evaluator) {
        this.evaluatorDict[key] = evaluator;
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
                this.stack.push(new Real(parseFloat(word)));
            }
        } else if(word in this.wordDict) {
            var cmd = new this.wordDict[word]();
            cmd.execute(this.stack);
        } else if (isLetter(word)) {
            this.stack.push(new Variable(word));
        } else {
            return false;
        }
        return true;
    }
}