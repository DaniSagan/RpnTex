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

class Namespace {
    constructor(parent, name) {
        /** @type {Namespace} */
        this.parent = parent;
        /** @type {String} */
        this.name = name;
        /** @type {Object.<String, any>} */
        this.wordDict = {}
        /** @type {Object} */
        this.childNamespaceDict = {}
    }

    /**
     * 
     * @param {string} key 
     * @param {class} command 
     */
    registerWord(key, command) {
        if(word in this.childNamespaceDict) {
            throw new Error("Cannot register word. Value is a namespace.");
        }
        this.wordDict[key] = command;
    }

    addNamespace(name) {
        if(name in this.wordDict) {
            throw new Error("Cannot add namespace. Value is a word.");
        }
        console.log(`Added namespace ${name}`);
        this.childNamespaceDict[name] = new Namespace(this, name);
    }

    /**
     * 
     * @param {String} key
     * @returns {StackItem} 
     */
    getValue(key) {
        /** @type {String[]} */
        let tokens = key.split(".");
        if(tokens.length === 1) {
            if(key in this.wordDict) {
                return this.wordDict[key];
            } else {
                throw new Error(`Key ${key} not found in word dictionary`);
            }
        } else {
            let namespaceKey = tokens[0];
            let path = tokens.slice(1).join(".");
            if(namespaceKey in this.childNamespaceDict) {
                return this.childNamespaceDict[namespaceKey].getValue(path);
            }
        }
    }

    /**
     * 
     * @param {String} key
     * @returns {boolean} 
     */
    containsValue(key) {
        /** @type {String[]} */
        let tokens = key.split(".");
        if(tokens.length === 1) {
            return key in this.wordDict;
        } else {
            let namespaceKey = tokens[0];
            let path = tokens.slice(1).join(".");
            if(namespaceKey in this.childNamespaceDict) {
                return this.childNamespaceDict[namespaceKey].containsValue(path);
            } else {
                return false;
            }
        }
    }

    /**
     * 
     * @param {String} key 
     * @param {StackItem} value 
     */
    addValue(key, value) {
        let namespaceName = Namespace.getNamespaceName(key);
        let valueName = Namespace.getValueName(key);
        if(valueName in this.childNamespaceDict) {
            throw new Error(`Namespace ${valueName} already exists in ${this.name}`);
        }
        if(namespaceName === null) {
            console.log(`Saving variable ${key} with value ${value}`);
            this.wordDict[key] = value;
        } else {
            /** @type {String[]} */
            let childNamespaceTokens = namespaceName.split(".");
            console.log(childNamespaceTokens);
            if(!(childNamespaceTokens[0] in this.childNamespaceDict)) {
                this.addNamespace(childNamespaceTokens[0]);
            }
            if(childNamespaceTokens.length > 1) {
                let childNamespaceName = childNamespaceTokens.slice(1).join(".");
                this.childNamespaceDict[childNamespaceTokens[0]].addValue(`${childNamespaceName}.${valueName}`, value);
            } else {
                this.childNamespaceDict[childNamespaceTokens[0]].addValue(valueName, value);
            }
        }
    }

    /**
     * 
     * @param {String} identificator 
     * @returns {String}
     */
    static getNamespaceName(identificator) {
        let tokens = identificator.split(".");
        if(tokens.length === 1) {
            return null;
        } else {
            let namespaceTokens = tokens.slice(0, -1);
            return namespaceTokens.join(".");
        }
    }

    /**
     * 
     * @param {String} identificator 
     * @returns {String}
     */
    static getValueName(identificator) {
        let tokens = identificator.split(".");
        return tokens[tokens.length-1];
    }

    get fullName() {
        if(parent != null) {
            if(parent.name !== "") {
                return `${this.parent.fullName}.${this.name}`;
            } else {
                return this.name;
            }
        } else {
            return this.name;
        }
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
        /** @type {Namespace} */
        this.rootNamespace = new Namespace(null, "");
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
            } else if(isFloat(word)) {
                this.stack.push(new Real(parseFloat(word)));
            }
        } else if(word.startsWith("@")) {
            let variableName = word.substring(1);
            if(Calc.isValidNamespaceName(variableName)) {
                this.rootNamespace.addValue(variableName, this.stack.pop());
            } else {
                throw new Error(`${variableName} is an invalid variable name`);
            }
        } else if(this.rootNamespace.containsValue(word)) {
            if(Calc.isValidNamespaceName(word))
            this.stack.push(this.rootNamespace.getValue(word));
        } else if(word in this.wordDict) {
            let cmd = new this.wordDict[word]();
            cmd.execute(this.stack);
        } else if (isLetter(word)) {
            this.stack.push(new Variable(word));
        } else {
            return false;
        }
        return true;
    }

    static isValidVariableName(variableName) {
        return /^[a-zA-Z_][a-zA-Z_0-9]*$/.test(variableName);
    }

    /**
     * 
     * @param {String} namespaceName 
     * @returns {boolean}
     */
    static isValidNamespaceName(namespaceName) {
        /** @type {String[]} */
        let tokens = namespaceName.split(".");
        return tokens.every(Calc.isValidVariableName);
    }
}