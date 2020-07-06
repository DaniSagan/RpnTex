'use strict';

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