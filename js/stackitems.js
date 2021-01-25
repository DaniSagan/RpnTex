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

    /**
     * @returns {StackItem}
     */
    get numericValue() {
        return this;
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

class GreekVariable extends Variable {
    /**
     * @param {String} value
     */
    constructor(name, latexCommand) {
        super(name);
        /** @type {String} */
        this.latexCommand = latexCommand; 
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
        return `\\${this.latexCommand}`;
    }
}

class Constant extends StackItem {
    /**
     * 
     * @param {Variable} variable 
     * @param {StackItem} value 
     */
    constructor(variable, value) {
        super();
        /** @type {Variable} */
        this.variable = variable;
        /** @type {StackItem} */
        this.value = value;
    }

    /**
     * @returns {String}
     */
    toString() {
        return this.variable.toString();
    }

    /**
     * @returns {String}
     */
    formatInnerLatex() {
        return this.variable.formatInnerLatex();
    }

    /**
     * @returns {StackItem}
     */
    get numericValue() {
        return this.value.numericValue;
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

    /**
     * @returns {StackItem}
     */
    get numericValue() {
        let innerValue = this.value.numericValue;
        if(innerValue instanceof Integer) {
            let res = Math.sqrt(innerValue.value);
            if(res * res === innerValue.value) {
                return new Integer(res);
            } else {
                return new Real(res);
            }
        } else if(innerValue instanceof Real) {
            return new Real(Math.sqrt(innerValue.value));
        } else {
            return new Sqrt(innerValue);
        }
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

    /**
     * @returns {StackItem}
     */
    get numericValue() {
        let innerValue = this.value.numericValue;
        if(innerValue instanceof Integer) {
            return new Integer(Math.abs(innerValue.value));
        } else if(innerValue instanceof Real) {
            return new Real(Math.abs(innerValue.value));
        } else {
            return new Abs(innerValue.value);
        }
    }
}

class Norm extends UnaryOperation {
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
        return `‖${this.value.toString()}‖`;
    }

    /**
     * @return {String}
     */
    formatInnerLatex() {
        return `\\left\\|${this.value.formatLatex()}\\right\\|`;
    }

    /**
     * @returns {StackItem}
     */
    get numericValue() {
        let innerValue = this.value.numericValue;
        if(innerValue instanceof Vector2) {
            let res = new Sqrt(new Sum(new Power(innerValue.x, new Integer(2)), new Power(innerValue.y, new Integer(2))));
            return res.numericValue;
        } else {
            return new Norm(innerValue.value);
        }
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

    /**
     * @returns {StackItem}
     */
    get numericValue() {
        let innerValue = this.value.numericValue;
        if(innerValue instanceof Integer) {
            return new Integer(-innerValue.value);
        } else if(innerValue instanceof Real) {
            return new Real(-innerValue.value);
        } else {
            return new Neg(innerValue);
        }
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

class UnaryFunction extends UnaryOperation {
    /**
     * 
     * @param {StackItem} value 
     * @param {String} functionName 
     */
    constructor(value, functionName) {
        super(value);
        this.functionName = functionName;
    }

    /**
     * @return {String}
     */
    toString() {
        return `${this.functionName}(${this.value.toString()})`;
    }

    /**
     * @return {String}
     */
    formatInnerLatex() {
        return `\\${this.functionName}\\left(${this.value.formatLatex()}\\right)`
    }
}

class Sin extends UnaryFunction {
    /**
     * 
     * @param {StackItem} value 
     */
    constructor(value) {
        super(value, "sin");
    }

    /**
     * @returns {StackItem}
     */
    get numericValue() {
        let innerValue = this.value.numericValue;
        if(innerValue instanceof Integer ||
           innerValue instanceof Real) {
            return new Real(Math.sin(innerValue.value));
        } else {
            return new Sin(innerValue);
        }
    }
}

class Cos extends UnaryFunction {
    constructor(value) {
        super(value, "cos");
    }

    /**
     * @returns {StackItem}
     */
    get numericValue() {
        let innerValue = this.value.numericValue;
        if(innerValue instanceof Integer ||
           innerValue instanceof Real) {
            return new Real(Math.cos(innerValue.value));
        } else {
            return new Cos(innerValue);
        }
    }
}

class Tan extends UnaryFunction {
    constructor(value) {
        super(value, "tan");
    }

    /**
     * @returns {StackItem}
     */
    get numericValue() {
        let innerValue = this.value.numericValue;
        if(innerValue instanceof Integer ||
           innerValue instanceof Real) {
            return new Real(Math.tan(innerValue.value));
        } else {
            return Tan(innerValue);
        }
    }
}

class Log extends UnaryFunction {
    constructor(base, value) {
        super(value, "log");
        /** @type {StackItem} */
        this.base = base;
    }

    /**
     * @returns {StackItem}
     */
    get numericValue() {
        let innerValue = this.value.numericValue;
        let baseValue = this.base.numericValue;
        if(innerValue instanceof Integer && baseValue instanceof Integer) {
            return new Real(Math.log(innerValue.value)/Math.log(baseValue.value));
        } else if(innerValue instanceof Integer && baseValue instanceof Real) {
            return new Real(Math.log(innerValue.value)/Math.log(baseValue.value));
        } else if(innerValue instanceof Real && baseValue instanceof Integer) {
            return new Real(Math.log(innerValue.value)/Math.log(baseValue.value));
        }else if(innerValue instanceof Real && baseValue instanceof Real) {
            return new Real(Math.log(innerValue.value)/Math.log(baseValue.value));   
        } else {
            return new Log(baseValue, innerValue);
        }
    }

    /**
     * @return {String}
     */
    toString() {
        return `${this.functionName}_${this.base.toString()}(${this.value.toString()})`;
    }

    /**
     * @return {String}
     */
    formatInnerLatex() {
        return `\\${this.functionName}_{${this.base.formatLatex()}}\\left(${this.value.formatLatex()}\\right)`
    }
}

class Ln extends Log {
    constructor(value) {
        super(new Constant(new Variable("e"), new Real(Math.E)), value);
    }

    /**
     * @returns {StackItem}
     */
    get numericValue() {
        let innerValue = this.value.numericValue;
        if(innerValue instanceof Integer || innerValue instanceof Real) {
            return new Real(Math.log(innerValue.value));
        } else {
            return Log(baseValue, innerValue);
        }
    }

    /**
     * @return {String}
     */
    toString() {
        return `ln(${this.value.toString()})`;
    }

    /**
     * @return {String}
     */
    formatInnerLatex() {
        return `\\ln\\left(${this.value.formatLatex()}\\right)`
    }
}

class Factorial extends UnaryOperation {
    constructor(value) {
        super(value);
    }

    /**
     * @returns {StackItem}
     */
    get numericValue() {
        let innerValue = this.value.numericValue;
        if(innerValue instanceof Integer) {
            /** @type {number} */
            let value = innerValue.value;
            /** @type {number} */
            let res = 1;
            for(let n = 1; n <= value; n++) {
                res *= n;
            }
            return new Integer(res);
        } else {
            return new Factorial(innerValue);
        }
    }

    /**
     * @private
     * @param {StackItem} value 
     */
    needsParentheses(value) {
        if(value instanceof Integer ||
           value instanceof Real ||
           value instanceof Variable || 
           value instanceof Constant) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * @return {String}
     */
    toString() {
        if(this.needsParentheses(this.value)) {
            return `(${this.value.toString()})!`;
        } else {
            return `${this.value.toString()}!`;
        }
    }

    /**
     * @return {String}
     */
    formatInnerLatex() {
        if(this.needsParentheses(this.value)) {
            return `\\left(${this.value.formatLatex()}\\right)!`;
        } else {
            return `${this.value.formatLatex()}!`;
        }
    }
}

// ----------------------------------------------------------------
// Binary operations
// ----------------------------------------------------------------

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

    matchType(TClass) {
        return this.lhs instanceof TClass && this.rhs instanceof TClass;
    }

    matchTypes(TLhsClass, TRhsClass) {
        return this.lhs instanceof TLhsClass && this.rhs instanceof TRhsClass;
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
        // if(this.lhs instanceof Integer || 
        //    this.lhs instanceof Real || 
        //    this.lhs instanceof Sqrt || 
        //    this.lhs instanceof Sum || 
        //    this.lhs instanceof Subtraction || 
        //    this.lhs instanceof Variable || 
        //    this.lhs instanceof Multiplication ||
        //    this.lhs instanceof Fraction ||
        //    this.lhs instanceof Power ||
        //    this.lhs instanceof Abs) {
        //     return false;
        // }
        // return true;
        return false;
    }

    /**
     * @returns {boolean}
     */
    rhs_needs_parentheses() {
        // if(this.rhs instanceof Integer || 
        //    this.rhs instanceof Real ||
        //    this.rhs instanceof Sqrt ||  
        //    this.rhs instanceof Sum || 
        //    this.rhs instanceof Variable ||
        //    this.rhs instanceof Multiplication ||
        //    this.rhs instanceof Fraction ||
        //    this.rhs instanceof Power ||
        //    this.rhs instanceof Abs) {
        //     return false;
        // }
        // return true;
        if(this.rhs instanceof Neg) {
            return true;
        }
        if(this.rhs instanceof Integer && this.rhs.value < 0) {
            return true;
        }
        if(this.rhs instanceof Real && this.rhs.value < 0) {
            return true;
        }
        return false;
    }

    /**
     * @returns {StackItem}
     */
    get numericValue() {
        let lhsInnerValue = this.lhs.numericValue;
        let rhsInnerValue = this.rhs.numericValue;
        if(lhsInnerValue instanceof Integer &&
           rhsInnerValue instanceof Integer) {
            return new Integer(lhsInnerValue.value + rhsInnerValue.value);
        } else if(lhsInnerValue instanceof Integer &&
                  rhsInnerValue instanceof Real) {
            return new Real(lhsInnerValue.value + rhsInnerValue.value);
        } else if(lhsInnerValue instanceof Real &&
                  rhsInnerValue instanceof Integer) {
            return new Real(lhsInnerValue.value + rhsInnerValue.value);
        } else if(lhsInnerValue instanceof Real &&
                  rhsInnerValue instanceof Real) {
            return new Real(lhsInnerValue.value + rhsInnerValue.value);
        } else if(lhsInnerValue instanceof Vector2 &&
                  rhsInnerValue instanceof Vector2) {
            let xSum = new Sum(lhsInnerValue.x, rhsInnerValue.x); 
            let ySum = new Sum(lhsInnerValue.y, rhsInnerValue.y);
            return new Vector2(xSum.numericValue, ySum.numericValue);
        } else {
            return new Sum(lhsInnerValue, rhsInnerValue);
        }
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
           this.lhs instanceof Abs ||
           this.lhs instanceof Vector2) {
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
           this.rhs instanceof Abs ||
           this.rhs instanceof Vector2) {
            return false;
        }
        return true;
    }

    /**
     * @returns {StackItem}
     */
    get numericValue() {
        let lhsInnerValue = this.lhs.numericValue;
        let rhsInnerValue = this.rhs.numericValue;
        if(lhsInnerValue instanceof Integer &&
           rhsInnerValue instanceof Integer) {
            return new Integer(lhsInnerValue.value - rhsInnerValue.value);
        } else if(lhsInnerValue instanceof Integer &&
                  rhsInnerValue instanceof Real) {
            return new Real(lhsInnerValue.value - rhsInnerValue.value);
        } else if(lhsInnerValue instanceof Real &&
                  rhsInnerValue instanceof Integer) {
            return new Real(lhsInnerValue.value - rhsInnerValue.value);
        } else if(lhsInnerValue instanceof Real &&
                  rhsInnerValue instanceof Real) {
            return new Real(lhsInnerValue.value - rhsInnerValue.value);
        } else if(lhsInnerValue instanceof Vector2 &&
                  rhsInnerValue instanceof Vector2) {
            let xValue = new Subtraction(lhsInnerValue.x, rhsInnerValue.x); 
            let yValue = new Subtraction(lhsInnerValue.y, rhsInnerValue.y);
            return new Vector2(xValue.numericValue, yValue.numericValue);
        } else {
            return new Subtraction(lhsInnerValue, rhsInnerValue);
        }
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
           this.lhs instanceof Integral ||
           this.lhs instanceof Vector2 || 
           this.lhs instanceof Constant) {
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
           this.rhs instanceof Integral ||
           this.rhs instanceof Vector2 || 
           this.rhs instanceof Constant) {
            return false;
        }
        return true;
    }

    /**
     * @returns {StackItem}
     */
    get numericValue() {
        let lhsInnerValue = this.lhs.numericValue;
        let rhsInnerValue = this.rhs.numericValue;
        if(lhsInnerValue instanceof Integer &&
           rhsInnerValue instanceof Integer) {
            return new Integer(lhsInnerValue.value * rhsInnerValue.value);
        } else if(lhsInnerValue instanceof Integer &&
                  rhsInnerValue instanceof Real) {
            return new Real(lhsInnerValue.value * rhsInnerValue.value);
        } else if(lhsInnerValue instanceof Real &&
                  rhsInnerValue instanceof Integer) {
            return new Real(lhsInnerValue.value * rhsInnerValue.value);
        } else if(lhsInnerValue instanceof Real &&
                  rhsInnerValue instanceof Real) {
            return new Real(lhsInnerValue.value * rhsInnerValue.value);
        } else if(lhsInnerValue instanceof Integer &&
                  rhsInnerValue instanceof Vector2) {
            let x = new Multiplication(lhsInnerValue, rhsInnerValue.x);
            let y = new Multiplication(lhsInnerValue, rhsInnerValue.y);
            return new Vector2(x.numericValue, y.numericValue);
        } else if(lhsInnerValue instanceof Vector2 &&
                  rhsInnerValue instanceof Integer) {
            let x = new Multiplication(lhsInnerValue.x, rhsInnerValue);
            let y = new Multiplication(lhsInnerValue.y, rhsInnerValue);
            return new Vector2(x.numericValue, y.numericValue);
        } else if(lhsInnerValue instanceof Real &&
                  rhsInnerValue instanceof Vector2) {
            let x = new Multiplication(lhsInnerValue, rhsInnerValue.x);
            let y = new Multiplication(lhsInnerValue, rhsInnerValue.y);
            return new Vector2(x.numericValue, y.numericValue);
        } else if(lhsInnerValue instanceof Vector2 &&
                  rhsInnerValue instanceof Real) {
            let x = new Multiplication(lhsInnerValue.x, rhsInnerValue);
            let y = new Multiplication(lhsInnerValue.y, rhsInnerValue);
            return new Vector2(x.numericValue, y.numericValue);
        } else {
            return new Multiplication(lhsInnerValue, rhsInnerValue);
        }
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

    /**
     * @returns {StackItem}
     */
    get numericValue() {
        let lhsInnerValue = this.lhs.numericValue;
        let rhsInnerValue = this.rhs.numericValue;
        if(lhsInnerValue instanceof Integer &&
           rhsInnerValue instanceof Integer) {
            let gcd = greatestCommonDivisor(lhsInnerValue.value, rhsInnerValue.value);
            let numerator = parseInt(lhsInnerValue.value/gcd);
            let denominator = parseInt(rhsInnerValue.value/gcd);
            if(denominator === 1) {
                return new Integer(numerator);
            } else {
                return new Real((1.0*numerator) / denominator);              
            }
        } else if(lhsInnerValue instanceof Integer &&
                  rhsInnerValue instanceof Real) {
            return new Real((1.0*lhsInnerValue.value) / rhsInnerValue.value);
        } else if(lhsInnerValue instanceof Real &&
                  rhsInnerValue instanceof Integer) {
            return new Real((1.0*lhsInnerValue.value) / rhsInnerValue.value);
        } else if(lhsInnerValue instanceof Real &&
                  rhsInnerValue instanceof Real) {
            return new Real((1.0*lhsInnerValue.value) / rhsInnerValue.value);
        } else {
            return new Fraction(lhsInnerValue, rhsInnerValue);;
        }
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
        if(this.lhs instanceof Integer || this.lhs instanceof Real || this.lhs instanceof Variable || this.lhs instanceof Constant) {
            return false;
        }
        return true;
    }

    /**
     * @returns {boolean}
     */
    rhs_needs_parentheses() {
        if(this.rhs instanceof Integer || this.rhs instanceof Real  || this.rhs instanceof Variable || this.rhs instanceof Constant) {
            return false;
        }
        return true;
    }

    /**
     * @returns {boolean}
     */
    latex_lhs_needs_parentheses() {
        if(this.lhs instanceof Integer || this.lhs instanceof Real || this.lhs instanceof Variable || this.lhs instanceof Constant) {
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
        if(this.lhs instanceof UnaryFunction) {
            return `\\${this.lhs.functionName}^{${this.rhs.formatLatex()}}\\left(${this.lhs.value.formatLatex()}\\right)`;
        } else {
            return "{" + addParentheses(this.lhs.formatLatex(), () => this.latex_lhs_needs_parentheses())  + "}^{" + addParentheses(this.rhs.formatLatex(), () => this.latex_rhs_needs_parentheses()) + "}";
        }
    }

    /**
     * @returns {StackItem}
     */
    get numericValue() {
        let lhsInnerValue = this.lhs.numericValue;
        let rhsInnerValue = this.rhs.numericValue;
        if(lhsInnerValue instanceof Integer &&
           rhsInnerValue instanceof Integer) {
            return new Integer(parseInt(Math.pow(lhsInnerValue.value, rhsInnerValue.value)));
        } else if(lhsInnerValue instanceof Integer &&
                  rhsInnerValue instanceof Real) {
            return new Real(Math.pow(lhsInnerValue.value, rhsInnerValue.value));
        } else if(lhsInnerValue instanceof Real &&
                  rhsInnerValue instanceof Integer) {
            return new Real(Math.pow(lhsInnerValue.value, rhsInnerValue.value));
        } else if(lhsInnerValue instanceof Real &&
                  rhsInnerValue instanceof Real) {
            return new Real(Math.pow(lhsInnerValue.value, rhsInnerValue.value));
        } else {
            return new Power(lhsInnerValue, rhsInnerValue);
        }
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

    /**
     * @returns {StackItem}
     */
    get numericValue() {
        let lhsInnerValue = this.lhs.numericValue;
        let rhsInnerValue = this.rhs.numericValue;
        return new Equality(lhsInnerValue, rhsInnerValue);
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
            res += `^{${this.superscript}}`;
        }
        res += ` ${this.value.formatLatex()} \\mathrm{d}${this.differential.formatLatex()}`;
        return res;
    }

    /**
     * @returns {StackItem}
     */
    get numericValue() {
        let innerValue = this.value.numericValue;
        let subscriptInnerValue = this.subscript.numericValue;
        let superscriptInnerValue = this.superscript.numericValue;
        return new Integral(innerValue, this.differential, subscriptInnerValue, superscriptInnerValue);
    }
}

class Vector2 extends StackItem {
    constructor(x, y) {
        super();
        /** @type {StackItem} */
        this.x = x;
        /** @type {StackItem} */
        this.y = y;
    }

    /**
     * @returns {String}
     */
    toString() {
        return `(${this.x.toString()}, ${this.y.toString()})`;
    }

    /**
     * @return {String}
     */
    formatInnerLatex() {
        return `\\begin{bmatrix}${this.x.formatLatex()}\\\\${this.y.formatLatex()}\\end{bmatrix}`;
    }

    /**
     * @returns {StackItem}
     */
    get numericValue() {
        let xInnerValue = this.x.numericValue;
        let yInnerValue = this.y.numericValue;
        return new Vector2(xInnerValue, yInnerValue);
    }
}
