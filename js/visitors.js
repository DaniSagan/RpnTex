'use strict';

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