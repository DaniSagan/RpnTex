'use strict';

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

class StackCmdSin extends StackCmdBase {
    constructor() {
        super();
    }

    /**
     * @param {Stack} stack 
     */
    execute(stack) {
        var item = stack.pop();
        stack.push(new Sin(item));
    }
}

class StackCmdCos extends StackCmdBase {
    constructor() {
        super();
    }

    /**
     * @param {Stack} stack 
     */
    execute(stack) {
        var item = stack.pop();
        stack.push(new Cos(item));
    }
}

class StackCmdTan extends StackCmdBase {
    constructor() {
        super();
    }

    /**
     * @param {Stack} stack 
     */
    execute(stack) {
        var item = stack.pop();
        stack.push(new Tan(item));
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

class StackCmdDifferential extends StackCmdBase {
    constructor() {
        super();
    }

    /**
     * @param {Stack} stack 
     */
    execute(stack) {
        var item = stack.pop();
        stack.push(new Differential(item));
    }
}

class StackCmdIndefiniteIntegral extends StackCmdBase {
    constructor() {
        super();
    }

    /**
     * @param {Stack} stack 
     */
    execute(stack) {
        var itemDifferential = stack.pop();
        var itemValue = stack.pop();
        stack.push(new Integral(itemValue, itemDifferential, null, null));
    }
}

class StackCmdDefiniteIntegral extends StackCmdBase {
    constructor() {
        super();
    }

    /**
     * @param {Stack} stack 
     */
    execute(stack) {
        var itemDifferential = stack.pop();
        var itemValue = stack.pop();
        var itemSuperScript = stack.pop();
        var itemSubscript = stack.pop();
        stack.push(new Integral(itemValue, itemDifferential, itemSubscript, itemSuperScript));
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
        stack.push(item2);
        stack.push(item1);
    }
}