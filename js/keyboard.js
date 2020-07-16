'use strict';

class KeyboardButton {
    /**
     * 
     * @param {String} textToShow 
     * @param {function() => void} fnToExecute 
     * @param {String} className 
     */
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
    constructor(name, text, tooltip, buttons) {
        /** @type {String} */
        this.name = name;
        /** @type {String} */
        this.text = text;
        /** @type {String} */
        this.tooltip = tooltip;
        /** @type {boolean} */
        this.visible = true;
        /** @type {Array.<KeyboardButton>} */
        this.buttons = buttons;    
    }
}