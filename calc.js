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
    return needsParenthesesFunction() ? `(${value})` : value;
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
        return `{\\color{red}{${this.name}}}`;
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
        res += this.lhs_needs_parentheses() ? "(" + this.lhs.formatLatex() + ")" : this.lhs.formatLatex();
        res += this.operator;
        res += this.rhs_needs_parentheses() ? "(" + this.rhs.formatLatex() + ")" : this.rhs.formatLatex();
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
           this.lhs instanceof Sqrt ||  
           this.rhs instanceof Sum || 
           this.rhs instanceof Variable ||
           this.lhs instanceof Multiplication ||
           this.lhs instanceof Fraction ||
           this.lhs instanceof Power) {
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
        if(this.rhs instanceof Integer || this.rhs instanceof Real  || this.rhs instanceof Variable) {
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
        if(this.lhs instanceof Integer || this.lhs instanceof Real || this.lhs instanceof Variable || this.lhs instanceof Multiplication) {
            return false;
        }
        return true;
    }

    /**
     * @returns {boolean}
     */
    rhs_needs_parentheses() {
        if(this.rhs instanceof Integer || this.rhs instanceof Real  || this.rhs instanceof Variable || this.lhs instanceof Multiplication) {
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

class Calc {
    constructor() {
        this.stack = new Stack()
    }

    /**
     * @param {string} word 
     */
    process(word) {
        if(!isNaN(word)) {
            if(isInteger(word)) {
                this.stack.push(new Integer(parseInt(word, 10)));
            } else {
                this.stack.push(new Integer(parseFloat(word)));
            }
        } else if (word === "+") {
            var item2 = this.stack.pop();
            var item1 = this.stack.pop();
            this.stack.push(new Sum(item1, item2));
        } else if (word === "-") {
            var item2 = this.stack.pop();
            var item1 = this.stack.pop();
            this.stack.push(new Subtraction(item1, item2));
        } else if (word === "*") {
            var item2 = this.stack.pop();
            var item1 = this.stack.pop();
            this.stack.push(new Multiplication(item1, item2));
        } else if (word === "/") {
            var item2 = this.stack.pop();
            var item1 = this.stack.pop();
            this.stack.push(new Fraction(item1, item2));
        } else if (word === "^") {
            var item2 = this.stack.pop();
            var item1 = this.stack.pop();
            this.stack.push(new Power(item1, item2));
        } else if (word === "inv") {
            var item = this.stack.pop();
            this.stack.push(new Fraction(new Integer(1), item));
        } else if (word === "sqrt") {
            var item = this.stack.pop();
            this.stack.push(new Sqrt(item));
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
        }
    }
}