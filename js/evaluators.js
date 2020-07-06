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