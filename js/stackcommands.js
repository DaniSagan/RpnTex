'use strict';

/**
 * Base class for commands.
 */
class CmdBase {
    constructor() {
        if(new.target === CmdBase) {
            throw new TypeError("Cannot create an instance of an abstract class");
        }
    }

    /**
     * Execute the command.
     * @param {Calc} calc 
     */
    execute(calc) {

    }

    /**
     * Undo the command.
     * @param {Calc} calc 
     */
    undo(calc) {

    }
}

class CmdEval extends CmdBase {

    constructor() {
        super();
        /** @type {StackItem} */
        this.item = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.item = calc.stack.pop(); 
        let evaluatedItem = this.eval(this.item);
        calc.stack.push(evaluatedItem);
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.item);
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
     * @param {Sqrt} item
     * @returns {StackItem} 
     */
    evalSqrt(item) {
        var evalValue = this.eval(item.value);
        return new Sqrt(evalValue); 
    }
}

class CmdNumericValue extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.item = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.item = calc.stack.pop(); /** @type {StackItem} */
        calc.stack.push(this.item.numericValue);
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.item);
    }
}

class CmdApply extends CmdBase {
    /**
     * 
     * @param {function(StackItem) => StackItem} fn 
     */
    constructor(fn) {
        super();
        this.fn = fn;
        /** @type {StackItem} */
        this.item = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.item = calc.stack.pop();
        calc.stack.push(this.fn(this.item));
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.item);
    }
}

class CmdAbs extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.item = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.item = calc.stack.pop();
        calc.stack.push(new Abs(this.item));
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.item);
    }
}

class CmdNorm extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.item = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.item = calc.stack.pop();
        calc.stack.push(new Norm(this.item));
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.item);
    }
}

class CmdSum extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.item1 = null;
        /** @type {StackItem} */
        this.item2 = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.item2 = calc.stack.pop();
        this.item1 = calc.stack.pop();
        calc.stack.push(new Sum(this.item1, this.item2));
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.item1);
        calc.stack.push(this.item2);
    }
}

class CmdSubtraction extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.item1 = null;
        /** @type {StackItem} */
        this.item2 = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.item2 = calc.stack.pop();
        this.item1 = calc.stack.pop();
        calc.stack.push(new Subtraction(this.item1, this.item2));
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.item1);
        calc.stack.push(this.item2);
    }
}

class CmdMultiplication extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.item1 = null;
        /** @type {StackItem} */
        this.item2 = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.item2 = calc.stack.pop();
        this.item1 = calc.stack.pop();
        calc.stack.push(new Multiplication(this.item1, this.item2));
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.item1);
        calc.stack.push(this.item2);
    }
}

class CmdFraction extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.item1 = null;
        /** @type {StackItem} */
        this.item2 = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.item2 = calc.stack.pop();
        this.item1 = calc.stack.pop();
        calc.stack.push(new Fraction(this.item1, this.item2));
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.item1);
        calc.stack.push(this.item2);
    }
}

class CmdPower extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.item1 = null;
        /** @type {StackItem} */
        this.item2 = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.item2 = calc.stack.pop();
        this.item1 = calc.stack.pop();
        calc.stack.push(new Power(this.item1, this.item2));
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.item1);
        calc.stack.push(this.item2);
    }
}

class CmdInv extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.item = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.item = calc.stack.pop();
        calc.stack.push(new Fraction(new Integer(1), this.item));
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.item);
    }
}

class CmdSqrt extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.item = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.item = calc.stack.pop();
        calc.stack.push(new Sqrt(this.item));
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.item);
    }
}

class CmdNeg extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.item = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.item = calc.stack.pop();
        calc.stack.push(new Neg(this.item));
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.item);
    }
}

class CmdSin extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.item = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.item = calc.stack.pop();
        calc.stack.push(new Sin(this.item));
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.item);
    }
}

class CmdCos extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.item = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.item = calc.stack.pop();
        calc.stack.push(new Cos(this.item));
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.item);
    }
}

class CmdTan extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.item = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.item = calc.stack.pop();
        calc.stack.push(new Tan(this.item));
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.item);
    }
}

class CmdLog extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.itemValue = null;
        /** @type {StackItem} */
        this.itemBase = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.itemValue = calc.stack.pop();
        this.itemBase = calc.stack.pop();
        calc.stack.push(new Log(this.itemBase, this.itemValue));
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.itemBase);
        calc.stack.push(this.itemValue);
    }
}

class CmdLn extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.itemValue = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.itemValue = calc.stack.pop();
        calc.stack.push(new Ln(this.itemValue));
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.itemValue);
    }
}

class CmdFactorial extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.item = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.item = calc.stack.pop();
        calc.stack.push(new Factorial(this.item));
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.item);
    }
}

class CmdEquality extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.item1 = null;
        /** @type {StackItem} */
        this.item2 = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.item2 = calc.stack.pop();
        this.item1 = calc.stack.pop();
        calc.stack.push(new Equality(this.item1, this.item2));
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.item1);
        calc.stack.push(this.item2);
    }
}

class CmdDifferential extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.item = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.item = calc.stack.pop();
        calc.stack.push(new Differential(this.item));
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.item);
    }
}

class CmdIndefiniteIntegral extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.itemDifferential = null;
        /** @type {StackItem} */
        this.itemValue = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.itemDifferential = calc.stack.pop();
        this.itemValue = calc.stack.pop();
        calc.stack.push(new Integral(itemValue, itemDifferential, null, null));
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.itemValue);
        calc.stack.push(this.itemDifferential);
    }
}

class CmdDefiniteIntegral extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.itemDifferential = null;
        /** @type {StackItem} */
        this.itemValue = null;
        /** @type {StackItem} */
        this.itemSuperScript = null;
        /** @type {StackItem} */
        this.itemSubscript = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.itemDifferential = calc.stack.pop();
        this.itemValue = calc.stack.pop();
        this.itemSuperScript = calc.stack.pop();
        this.itemSubscript = calc.stack.pop();
        calc.stack.push(new Integral(itemValue, itemDifferential, itemSubscript, itemSuperScript));
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.itemSubscript);
        calc.stack.push(this.itemSuperScript);
        calc.stack.push(this.itemValue);
        calc.stack.push(this.itemDifferential);
    }
}

class CmdVector2 extends CmdBase {
    constructor() {
        super();
        this.itemX = null;
        this.itemY = null;
    }

    /**
     * 
     * @param {Calc} calc 
     */
    execute(calc) {
        this.itemY = calc.stack.pop();
        this.itemX = calc.stack.pop();
        calc.stack.push(new Vector2(this.itemX, this.itemY));
    }

    /**
     * 
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.itemX);
        calc.stack.push(this.itemY);
    }
}

class CmdDup extends CmdBase {
    constructor() {
        super();
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        var item = calc.stack.get(0);
        calc.stack.push(item);
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
    }
}

class CmdDrop extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.item = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.item = calc.stack.pop();
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.push(this.item);
    }
}

class CmdSwap extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.item1 = null;
        /** @type {StackItem} */
        this.item2 = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.item2 = calc.stack.pop();
        this.item1 = calc.stack.pop();
        calc.stack.push(this.item2);
        calc.stack.push(this.item1);
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.pop();
        calc.stack.push(this.item1);
        calc.stack.push(this.item2);
    }
}

class CmdDerivativeX extends CmdBase {
    constructor() {
        super();
        /** @type {StackItem} */
        this.item = null;
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    execute(calc) {
        this.item = calc.stack.pop();
        calc.stack.push(new Derivative(new Variable("x"), this.item));
    }

    /**
     * @inheritdoc
     * @param {Calc} calc 
     */
    undo(calc) {
        calc.stack.pop();
        calc.stack.push(this.item);
    }
}

/**
 * 
 * @param {number} value
 */
var TCmdInteger = function(value){

    class CmdItem extends CmdBase {
        constructor() {
            super();
        }

        /**
         * @inheritdoc
         * @param {Calc} calc 
         */
        execute(calc) {
            calc.stack.push(new Integer(value));
        }

        /**
         * @inheritdoc
         * @param {Calc} calc 
         */
        undo(calc) {
            calc.stack.pop();
        }
    }

    return CmdItem;
};

/**
 * 
 * @param {String} variableName 
 */
var TCmdVariable = function(variableName){

    class CmdVariable extends CmdBase {
        constructor() {
            super();
        }

        /**
         * @inheritdoc
         * @param {Calc} calc 
         */
        execute(calc) {
            calc.stack.push(new Variable(variableName));
        }

        /**
         * @inheritdoc
         * @param {Calc} calc 
         */
        undo(calc) {
            calc.stack.pop();
        }
    }

    return CmdVariable;
};

/**
 * 
 * @param {String} variableName 
 * @param {String} latexCommand
 */
var TCmdGreekVariable = function(variableName, latexCommand){

    class CmdItem extends CmdBase {
        constructor() {
            super();
        }
        
        /**
         * @inheritdoc
         * @param {Calc} calc 
         */
        execute(calc) {
            calc.stack.push(new GreekVariable(variableName, latexCommand));
        }

        /**
         * @inheritdoc
         * @param {Calc} calc 
         */
        undo(calc) {
            calc.stack.pop();
        }
    }

    return CmdItem;
};

/**
 * 
 * @param {Variable} variable
 * @param {StackItem} value
 */
var TCmdConstant = function(variable, value){

    class CmdItem extends CmdBase {
        constructor() {
            super();
        }

        /**
         * @inheritdoc
         * @param {Calc} calc 
         */
        execute(calc) {
            calc.stack.push(new Constant(variable, value));
        }

        /**
         * @inheritdoc
         * @param {Calc} calc 
         */
        undo(calc) {
            calc.stack.pop();
        }
    }

    return CmdItem;
};

/**
 * 
 * @param {function} unaryFunctionClass 
 */
var TCmdUnaryFunction = function(unaryFunctionClass) {

    class CmdItem extends CmdBase {
        constructor() {
            super();
            /** @type {StackItem} */
            this.item = null;
        }

        /**
         * @inheritdoc
         * @param {Calc} calc 
         */
        execute(calc) {
            this.item = calc.stack.pop();
            calc.stack.push(new unaryFunctionClass(this.item));
        }

        /**
         * @inheritdoc
         * @param {Calc} calc 
         */
        undo(calc) {
            calc.stack.pop();
            calc.stack.push(this.item);
        }
    }

    return CmdItem;
}

var TCmdBinaryFunction = function(binaryFunctionClass) {

    class CmdItem {
        constructor() {
        }

        execute(calc) {
            let item2 = calc.stack.pop();
            let item1 = calc.stack.pop();
            calc.stack.push(new binaryFunctionClass(item1, item2));
        }
    }

    return CmdItem;
}

/**
 * 
 * @param {Array.<CmdBase>} commands 
 */
var TCmdChain = function(commands){

    class CmdItem extends CmdBase{
        constructor() {
            super();
            /** @type {Array.<CmdBase>} */
            this.commands = commands;
        }

        /**
         * @inheritdoc
         * @param {Calc} calc 
         */
        execute(calc) {
            for(let command of this.commands) {
                let cmdInstance = new command();
                calc.executeCommand(cmdInstance);
            }
        }

        /**
         * @inheritdoc
         * @param {Calc} calc 
         */
        undo(calc) {
            for(let command of this.commands) {
                calc.undoCommand();
            }
        }
    }

    return CmdItem;
};

/**
 * 
 * @param {StackItem} value 
 */
var TCmdPushValue = function(value){

    class CmdItem extends CmdBase {
        constructor() {
            super();
            /** @type {StackItem} */
            this.value = value;
        }
        /**
         * @inheritdoc
         * @param {Calc} calc 
         */
        execute(calc) {
            calc.stack.push(value);
        }
        /**
         * @inheritdoc
         * @param {Calc} calc 
         */
        undo(calc) {
            calc.stack.pop();
        }
    }

    return CmdItem;
};

/**
 * 
 * @param {String} name
 * @param {StackItem} value 
 */
var TCmdStoreValue = function(name, value){

    class CmdItem extends CmdBase {
        constructor() {
            super();
            /** @type {String} */
            this.name = name;
            /** @type {StackItem} */
            this.value = value;
            /** @type {StackItem} */
            this.previousValue = null;
        }
        /**
         * @inheritdoc
         * @param {Calc} calc 
         */
        execute(calc) {
            if(calc.rootNamespace.containsValue(this.name)) {
                this.previousValue = calc.rootNamespace.getValue(this.name);
            }
            calc.rootNamespace.addValue(this.name, this.value);
        }
        /**
         * @inheritdoc
         * @param {Calc} calc 
         */
        undo(calc) {
            if(this.previousValue === null) {
                calc.rootNamespace.removeValue(this.name);
            } else {
                calc.rootNamespace.addValue(this.name, this.previousValue);
            }
            calc.stack.push(this.value);
        }
    }

    return CmdItem;
};