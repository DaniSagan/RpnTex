'use strict';

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

class Differential extends UnaryOperation {
    constructor(value) {
        super(value);
    }

    /**
     * @return {String}
     */
    toString() {
        return `d${this.value.toString()}`;
    }

    /**
     * @return {String}
     */
    formatInnerLatex() {
        return `\\mathrm{d}${this.value.formatLatex()}`
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
           this.lhs instanceof Abs ||
           this.lhs instanceof Differential ||
           this.lhs instanceof Integral) {
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
           this.rhs instanceof Abs ||
           this.rhs instanceof Differential ||
           this.rhs instanceof Integral) {
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

class SuperSubScriptOperation extends StackItem {
    /**
     * @param {StackItem} value
     * @param {StackItem} subscript
     * @param {StackItem} superscript
     */
    constructor(value, subscript, superscript) {
        super();
        /** @type {StackItem} */
        this.value = value;
        /** @type {StackItem} */
        this.subscript = subscript;
        /** @type {StackItem} */
        this.superscript = superscript;
    }
}

class Integral extends SuperSubScriptOperation {
    constructor(value, differential, subscript, superscript) {
        super(value, subscript, superscript);
        /** @type {StackItem} */
        this.differential = differential;
    }

    /**
     * @return {String}
     */
    toString() {
        let res = "integral";
        res += ` ${this.value.toString()}`
        return res;
    }

    /**
     * @return {String}
     */
    formatInnerLatex() {
        let res = "\\int";
        if(this.subscript != null) {
            res += `_{${this.subscript}}`;
        }
        if(this.superscript != null) {
            res += `_{${this.superscript}}`;
        }
        res += ` ${this.value.formatLatex()} \\mathrm{d}${this.differential.formatLatex()}`;
        return res;
    }
}