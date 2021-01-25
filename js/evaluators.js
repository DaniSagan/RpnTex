'use strict';

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

class IntegerRealSumEvaluator {
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

    /**
     * 
     * @param {StackItem} item 
     * @return {String}
     */
    getDescription(item) {
        return "Sum integers";
    }
}

class IntegerMultiplicationEvaluator {
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

class DistributeMultiplicationEvaluator {
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

class CommuteSumEvaluator {
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
            var lhs = item.lhs; 
            /** @type {StackItem} */
            var rhs = item.rhs; 
            return new Sum(rhs, lhs);           
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