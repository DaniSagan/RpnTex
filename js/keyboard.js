'use strict';

class KeyboardButton {
    constructor(textToShow, fnToExecute, className) {
        this.textToShow = textToShow;
        this.fnToExecute = fnToExecute;
        this.className = className;
    }
}

class KeyboardGroup {
    /**
     * 
     * @param {String} name 
     * @param {Array.<KeyboardButton>} buttons
     */
    constructor(name, buttons) {
        /** @type {String} */
        this.name = name;
        /** @type {boolean} */
        this.visible = true;
        /** @type {Array.<KeyboardButton>} */
        this.buttons = buttons;    
    }
}