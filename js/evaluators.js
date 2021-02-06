'use strict';

class Simplifier {
    /**
     * 
     * @param {StackItem} item 
     */
    static simplify(item) {
        if(item instanceof Sum) {
            let s = SumSimplifier.process(item);
            let lhs = this.simplify(item.lhs);
            let rhs = this.simplify(item.rhs);
            if(lhs instanceof Integer && rhs instanceof Integer) {
                return new Integer(lhs.value + rhs.value);
            }
            if(lhs instanceof Integer && lhs.value == 0) {
                return this.simplify(rhs);
            }
            if(rhs instanceof Integer && rhs.value == 0) {
                return this.simplify(lhs);
            }
            if(lhs instanceof Variable && rhs instanceof Variable) {
                if(lhs.name == rhs.name) {
                    return new Multiplication(new Integer(2), lhs);
                }
            }
            return new Sum(lhs, rhs);
        }
        if(item instanceof Subtraction) {
            let lhs = this.simplify(item.lhs);
            let rhs = this.simplify(item.rhs);
            if(lhs instanceof Integer && rhs instanceof Integer) {
                return new Integer(lhs.value - rhs.value);
            }
            if(lhs instanceof Integer && lhs.value == 0) {
                return this.simplify(rhs);
            }
            if(rhs instanceof Integer && rhs.value == 0) {
                return this.simplify(lhs);
            }
            if(lhs instanceof Variable && rhs instanceof Variable) {
                if(lhs.name == rhs.name) {
                    return new Integer(0);
                }
            }
            return new Subtraction(lhs, rhs);
        }
        if(item instanceof Multiplication) {
            let lhs = this.simplify(item.lhs);
            let rhs = this.simplify(item.rhs);
            if(lhs instanceof Integer && rhs instanceof Integer) {
                return new Integer(lhs.value * rhs.value);
            }
            if(lhs instanceof Integer) {
                if(lhs.value == 1) {
                    return this.simplify(rhs);
                } else if(lhs.value == 0) {
                    return new Integer(0);
                }
            }
            if(rhs instanceof Integer) {
                if(rhs.value == 1) {
                    return this.simplify(lhs);
                } else if(lhs.value == 0) {
                    return new Integer(0);
                }
            }
            return new Multiplication(lhs, rhs);
        }
        if(item instanceof Fraction) {
            let numerator = this.simplify(item.lhs);
            let denominator = this.simplify(item.rhs);
            if(denominator instanceof Integer) {
                if(denominator.value == 1) {
                    return numerator;
                }
            }
            return new Fraction(numerator, denominator);
        }
        if(item instanceof Power) {
            let base = this.simplify(item.lhs);
            let exponent = this.simplify(item.rhs);
            if(base instanceof Integer && exponent instanceof Integer) {
                return item.numericValue();
            }
            if(base instanceof Integer) {
                if(base.value == 1) {
                    return base;
                } else if(base.value == 0) {
                    return new Integer(0);
                }
            }
            if(exponent instanceof Integer) {
                if(exponent.value == 1) {
                    return base;
                } else if(exponent.value == 0 && !(base instanceof Integer && base.value == 0)) {
                    return new Integer(0);
                }
            }
            return new Power(base, exponent);
        }
        return item;
    }
}

class SumSimplifier {
    constructor() {
        this.sumList = [];
        this.subList = [];
    }

    /**
     * 
     * @param {SumSimplifier} other 
     */
    combine(otherSumList, otherSubList) {
        for(let p of otherSumList) {
            this.sumList.push(p);
        }
        for(let n of otherSubList) {
            this.subList.push(n);
        }
    }

    simplify() {
        /** @type {Array.<StackItem>} */
        let valueList = [];
        for(let s of this.sumList) {
            if(s instanceof Integer) {
                let found = false;
                for(let v of valueList) {
                    if(v.value instanceof Integer) {
                        v.value.value += s.value;
                        found = true;
                    }
                }
                if(!found) {
                    valueList.push({value: s, count: 1});
                }
            } else {
                let found = false;
                for(let v of valueList) {
                    if(v.value.equals(s)) {
                        v.count++;
                        found = true;
                    }
                }
                if(!found) {
                    valueList.push({value: s, count: 1});
                }
            }
        }
        for(let n of this.subList) {
            if(n instanceof Integer) {
                let found = false;
                for(let v of valueList) {
                    if(v.value instanceof Integer) {
                        v.value.value -= n.value;
                        found = true;
                    }
                }
                if(!found) {
                    valueList.push({value: new Integer(-n.value), count: 1});
                }
            } else {
                let found = false;
                for(let v of valueList) {
                    if(v.value.equals(n)) {
                        v.count--;
                        found = true;
                    }
                }
                if(!found) {
                    valueList.push({value: n, count: -1});
                }
            }
        }
        this.sumList = [];
        this.subList = [];
        for(let v of valueList) {
            if(v.value instanceof Integer) {
                if(v.count > 0) {
                    this.sumList.push(new Integer(v.value.value * v.count));
                } else if(v.count < 0) {
                    this.subList.push(new Integer(v.value.value * Math.abs(v.count)));
                }
            } else {
                if(v.count === 1) {
                    this.sumList.push(v.value)
                } else if(v.count > 1) {
                    this.sumList.push(new Multiplication(new Integer(v.count), v.value));
                } else if(v.count === -1) {
                    this.subList.push(v.value);
                } else if(v.count < -1) {
                    this.subList.push(new Multiplication(new Integer(Math.abs(v.count)), v.value));
                }
            }
        }
    }

    /**
     * 
     * @param {StackItem} item
     * @returns {SumSimplifier} 
     */
    static process(item) {
        let res = new SumSimplifier();
        if(item instanceof Sum) {
            let lhsS = SumSimplifier.process(item.lhs);
            res.combine(lhsS.sumList, lhsS.subList);
            let rhsS = SumSimplifier.process(item.rhs); 
            res.combine(rhsS.sumList, rhsS.subList);         
        } else if (item instanceof Subtraction) {
            let lhsS = SumSimplifier.process(item.lhs);
            res.combine(lhsS.sumList, lhsS.subList);
            let rhsS = SumSimplifier.process(item.rhs); 
            res.combine(rhsS.subList, rhsS.sumList);
        } else {
            res.sumList.push(item);
        }
        res.simplify();
        return res;
    }

    /**
     * @todo
     * @returns {StackItem}
     */
    result() {
        if(this.sumList.length == 0 && this.subList.length === 0){
            return new Integer(0);
        } else if(this.sumList.length > 0) {
            for(let s of this.sumList) {
                
            }
        }
    }
}

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

class IntegerSumEvaluator extends Evaluator {
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

class IntegerRealSumEvaluator extends Evaluator {
    /**
     * 
     * @param {StackItem} item 
     * @returns {boolean}
     */
    canApply(item) {
        if(item instanceof Sum) {
            if(item.lhs instanceof Integer && item.rhs instanceof Real) {
                return true;
            } else if(item.lhs instanceof Real && item.rhs instanceof Integer) {
                return true;
            } else if(item.lhs instanceof Real && item.rhs instanceof Real) {
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
            if(item.lhs instanceof Integer && item.rhs instanceof Real) {
                /** @type {Integer} */
                var lhs = item.lhs; 
                /** @type {Real} */
                var rhs = item.rhs; 
                return new Real(lhs.value + rhs.value);
            } else if(item.lhs instanceof Real && item.rhs instanceof Integer) {
                /** @type {Real} */
                var lhs = item.lhs; 
                /** @type {Integer} */
                var rhs = item.rhs; 
                return new Real(lhs.value + rhs.value);
            } else if(item.lhs instanceof Real && item.rhs instanceof Real) {
                /** @type {Real} */
                var lhs = item.lhs; 
                /** @type {Real} */
                var rhs = item.rhs; 
                return new Real(lhs.value + rhs.value);
            }
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
        return "Sum reals";
    }
}

class SumIntegerSumEvaluator extends Evaluator {
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

    /**
     * 
     * @param {StackItem} item 
     * @return {String}
     */
    getDescription(item) {
        return "Sum integers";
    }
}

class IntegerMultiplicationEvaluator extends Evaluator {
    /**
     * 
     * @param {StackItem} item 
     * @returns {boolean}
     */
    canApply(item) {
        if(item instanceof Multiplication) {
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
            return new Integer(lhs.value * rhs.value);
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
        return "Multiply integers";
    }
}

class DistributeMultiplicationEvaluator extends Evaluator {
    /**
     * 
     * @param {StackItem} item 
     * @returns {boolean}
     */
    canApply(item) {
        if(item instanceof Multiplication) {
            if(item.lhs instanceof Sum && item.rhs instanceof StackItem) {
                return true;
            } else if (item.lhs instanceof StackItem && item.rhs instanceof Sum) {
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
            if(item.lhs instanceof Sum && item.rhs instanceof StackItem) {
                /** @type {Sum} */
                var lhs = item.lhs; 
                /** @type {StackItem} */
                var rhs = item.rhs; 
                return new Sum(new Multiplication(lhs.lhs, rhs), new Multiplication(lhs.rhs, rhs));
            } else if (item.lhs instanceof StackItem && item.rhs instanceof Sum) {
                /** @type {StackItem} */
                var lhs = item.lhs; 
                /** @type {Sum} */
                var rhs = item.rhs; 
                return new Sum(new Multiplication(lhs, rhs.lhs), new Multiplication(lhs, rhs.rhs));
            }            
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
        return "Distribute multiplication";
    }
}

class CommuteSumEvaluator extends Evaluator {
    /**
     * 
     * @param {StackItem} item 
     * @returns {boolean}
     */
    canApply(item) {
        if(item instanceof Sum) {
            return true;
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
            /** @type {StackItem} */
            let lhs = item.lhs; 
            /** @type {StackItem} */
            let rhs = item.rhs; 
            if(lhs instanceof Sum && rhs instanceof Sum) {
                return new Sum(new Sum(lhs.lhs, rhs.lhs), new Sum(lhs.rhs, rhs.rhs));
            } else if(lhs instanceof Sum) {
                return new Sum(new Sum(lhs.lhs, rhs), lhs.rhs);
            } else if(rhs instanceof Sum) {
                return new Sum(rhs.lhs, new Sum(lhs, rhs.rhs));
            } else {
                return new Sum(rhs, lhs);           
            }
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
        return "Commute sum";
    }
}

class IntegerPowerEvaluator extends Evaluator {
    /**
     * 
     * @param {StackItem} item 
     * @returns {boolean}
     */
    canApply(item) {
        if(item instanceof Power) {
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
            return new Integer(Math.pow(lhs.value, rhs.value));           
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
        return "Compute power";
    }
}

class VariableMultiplicationEvaluator extends Evaluator {
    /**
     * 
     * @param {StackItem} item 
     * @returns {boolean}
     */
    canApply(item) {
        if(item instanceof Multiplication) {
            if(item.lhs instanceof Variable 
                && item.rhs instanceof Variable
                && item.lhs.name == item.rhs.name) {
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
            /** @type {Variable} */
            var lhs = item.lhs; 
            /** @type {Variable} */
            var rhs = item.rhs; 
            return new Power(lhs, new Integer(2));           
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
        return "Compute power";
    }

    _isVariableByVariable(item) {
        if(item instanceof Multiplication) {
            if(item.lhs instanceof Variable 
                && item.rhs instanceof Variable
                && item.lhs.name == item.rhs.name) {
                return true;
            }
        }
        return false;
    }
}

class SumMultiplicationEvaluator extends Evaluator {
    /**
     * 
     * @param {StackItem} item 
     * @returns {boolean}
     */
    canApply(item) {
        if(item instanceof Multiplication) {
            return true;
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
            // var lhs = item.lhs; 
            /** @type {Sum} */
            // var rhs = item.rhs; 
            // let s1 = new Sum(new Multiplication(lhs.lhs, rhs.lhs), new Multiplication(lhs.lhs, rhs.rhs));
            // let s2 = new Sum(new Multiplication(lhs.rhs, rhs.lhs), new Multiplication(lhs.rhs, rhs.rhs));   
            // return new Sum(s1, s2);        
            return this.fn(item);
        } else {
            return item;
        }
    }

    /**
     * 
     * @param {StackItem} item 
     */
    fn(item) {
        if(item instanceof Multiplication) {
            /** @type {StackItem} */
            let lhs = item.lhs; 
            /** @type {StackItem} */
            let rhs = item.rhs; 
            if(lhs instanceof Sum && rhs instanceof Sum) {
                let s1 = new Multiplication(lhs.lhs, rhs.lhs);
                let s2 = new Multiplication(lhs.lhs, rhs.rhs);
                let s3 = new Multiplication(lhs.rhs, rhs.lhs);
                let s4 = new Multiplication(lhs.rhs, rhs.rhs);
                return new Sum(new Sum(this.fn(s1), this.fn(s2)), new Sum(this.fn(s3), this.fn(s4)));
            } else if(lhs instanceof Sum) {
                let s1 = new Multiplication(lhs.lhs, rhs);
                let s2 = new Multiplication(lhs.rhs, rhs);
                return new Sum(this.fn(s1), this.fn(s2));
            } else if(rhs instanceof Sum) {
                let s1 = new Multiplication(lhs, rhs.lhs);
                let s2 = new Multiplication(lhs, rhs.rhs);
                return new Sum(this.fn(s1), this.fn(s2));
            } else {
                return item;
            }
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
        return "Multiply sums";
    }
}

class DerivativeEvaluator extends Evaluator {
    /**
     * 
     * @param {StackItem} item 
     * @returns {boolean}
     */
    canApply(item) {
        if(item instanceof Derivative) {
            return true;
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
            return this.derivative(item.value, item.variable);
        } else {
            return item;
        }
    }

    /**
     * 
     * @param {StackItem} item 
     */
    derivative(item, variable) {
        if(item instanceof Integer || item instanceof Real || item instanceof Constant) {
            return new Integer(0);
        }
        else if(item instanceof Variable) {
            if(item.name == variable.name) {
                return new Integer(1);
            } else {
                return item
            }
        }
        else if(item instanceof Sum) {
            let lhs = this.derivative(item.lhs, variable);
            let rhs = this.derivative(item.rhs, variable);
            return Simplifier.simplify(new Sum(lhs, rhs));
        } else if(item instanceof Subtraction) {
            let lhs = this.derivative(item.lhs, variable);
            let rhs = this.derivative(item.rhs, variable);
            return Simplifier.simplify(new Subtraction(lhs, rhs));
        } else if(item instanceof Multiplication) {
            let d1 = this.derivative(item.lhs, variable);
            let d2 = this.derivative(item.rhs, variable);
            let res1 = new Multiplication(d1, item.rhs);
            let res2 = new Multiplication(item.lhs, d2);
            return Simplifier.simplify(new Sum(res1, res2));
        } else if(item instanceof Fraction) {
            let dg = this.derivative(item.lhs, variable);
            let dh = this.derivative(item.rhs, variable);
            let res1 = new Multiplication(dg, item.rhs);
            let res2 = new Multiplication(item.lhs, dh);
            let numerator = new Subtraction(res1, res2);
            let denominator = new Power(item.rhs, new Integer(2));
            return Simplifier.simplify(new Fraction(numerator, denominator));
        } else if(item instanceof Power) {
            let base = item.lhs;
            let exponent = item.rhs;
            if(exponent instanceof Integer) {
                let dx_base = this.derivative(base, variable);
                let t1 = new Power(base, new Subtraction(exponent, new Integer(1)));
                return Simplifier.simplify(Multiplication.multiMultiplication([exponent, t1, dx_base])); 
            }
        }
        return new Derivative(variable, item);
    }

    // /**
    //  * 
    //  * @param {StackItem} item 
    //  */
    // simplify(item) {
    //     if(item instanceof Sum) {
    //         let lhs = this.simplify(item.lhs);
    //         let rhs = this.simplify(item.rhs);
    //         if(lhs instanceof Integer && rhs instanceof Integer) {
    //             return new Integer(lhs.value + rhs.value);
    //         }
    //         if(lhs instanceof Integer && lhs.value == 0) {
    //             return this.simplify(rhs);
    //         }
    //         if(rhs instanceof Integer && rhs.value == 0) {
    //             return this.simplify(lhs);
    //         }
    //         if(lhs instanceof Variable && rhs instanceof Variable) {
    //             if(lhs.name == rhs.name) {
    //                 return new Multiplication(new Integer(2), lhs);
    //             }
    //         }
    //         return new Sum(lhs, rhs);
    //     }
    //     if(item instanceof Subtraction) {
    //         let lhs = this.simplify(item.lhs);
    //         let rhs = this.simplify(item.rhs);
    //         if(lhs instanceof Integer && rhs instanceof Integer) {
    //             return new Integer(lhs.value - rhs.value);
    //         }
    //         if(lhs instanceof Integer && lhs.value == 0) {
    //             return this.simplify(rhs);
    //         }
    //         if(rhs instanceof Integer && rhs.value == 0) {
    //             return this.simplify(lhs);
    //         }
    //         if(lhs instanceof Variable && rhs instanceof Variable) {
    //             if(lhs.name == rhs.name) {
    //                 return new Integer(0);
    //             }
    //         }
    //         return new Subtraction(lhs, rhs);
    //     }
    //     if(item instanceof Multiplication) {
    //         let lhs = this.simplify(item.lhs);
    //         let rhs = this.simplify(item.rhs);
    //         if(lhs instanceof Integer && rhs instanceof Integer) {
    //             return new Integer(lhs.value * rhs.value);
    //         }
    //         if(lhs instanceof Integer) {
    //             if(lhs.value == 1) {
    //                 return this.simplify(rhs);
    //             } else if(lhs.value == 0) {
    //                 return new Integer(0);
    //             }
    //         }
    //         if(rhs instanceof Integer) {
    //             if(rhs.value == 1) {
    //                 return this.simplify(lhs);
    //             } else if(lhs.value == 0) {
    //                 return new Integer(0);
    //             }
    //         }
    //         return new Multiplication(lhs, rhs);
    //     }
    //     if(item instanceof Fraction) {
    //         let numerator = this.simplify(item.lhs);
    //         let denominator = this.simplify(item.rhs);
    //         if(denominator instanceof Integer) {
    //             if(denominator.value == 1) {
    //                 return numerator;
    //             }
    //         }
    //         return new Fraction(numerator, denominator);
    //     }
    //     if(item instanceof Power) {
    //         let base = this.simplify(item.lhs);
    //         let exponent = this.simplify(item.rhs);
    //         if(base instanceof Integer && exponent instanceof Integer) {
    //             return item.numericValue();
    //         }
    //         if(base instanceof Integer) {
    //             if(base.value == 1) {
    //                 return base;
    //             } else if(base.value == 0) {
    //                 return new Integer(0);
    //             }
    //         }
    //         if(exponent instanceof Integer) {
    //             if(exponent.value == 1) {
    //                 return base;
    //             } else if(exponent.value == 0 && !(base instanceof Integer && base.value == 0)) {
    //                 return new Integer(0);
    //             }
    //         }
    //         return new Power(base, exponent);
    //     }
    //     return item;
    // }

    /**
     * 
     * @param {StackItem} item 
     * @return {String}
     */
    getDescription(item) {
        return "Compute derivative";
    }
}