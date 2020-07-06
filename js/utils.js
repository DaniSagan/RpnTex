'use strict';

/**
 * @returns {String}
 */
var nextId = (function () {
    var counter = 0;
    return function () {
        counter += 1; 
        return `rpntex-id${counter}`
    }
})();

/**
 * 
 * @param {String} str
 * @returns {boolean} 
 */
function isInteger(value) {
    if(parseInt(value, 10).toString() === value) {
        return true
    }
    return false;
}

function greatestCommonDivisor(n1, n2) {
    if (n2 === 0) {  
        return n1 
    } 
    return greatestCommonDivisor(n2, n1 % n2);
}

/**
 * 
 * @param {String} str
 * @returns {boolean} 
 */
function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

/**
 * 
 * @param {String} value 
 * @param {Function} needsParenthesesFunction 
 * @returns {String}
 */
function addParentheses(value, needsParenthesesFunction) {
    return needsParenthesesFunction() ? `\\left(${value}\\right)` : value;
}