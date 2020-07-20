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
        this.wordDict = {};
        /** @type {Object} */
        this.childNamespaceDict = {};
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
     */
    removeValue(key) {
        /** @type {String[]} */
        let tokens = key.split(".");
        if(tokens.length === 1) {
            if(key in this.wordDict) {
                delete this.wordDict[key];
            } else {
                throw new Error(`Key ${key} not found in word dictionary`);
            }
        } else {
            let namespaceKey = tokens[0];
            let path = tokens.slice(1).join(".");
            if(namespaceKey in this.childNamespaceDict) {
                return this.childNamespaceDict[namespaceKey].removeValue(path);
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
        /** @type {Array.<CmdBase>} */
        this.cmdStack = [];
    }

    /**
     * 
     * @param {string} key 
     * @param {class} command 
     */
    registerWord(key, command) {
        this.wordDict[key] = command;
        //this.rootNamespace.registerWord(key, command);
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
            /** @type {function} */
            let cmdClass = null;
            if(isInteger(word)) {
                cmdClass = TCmdPushValue(new Integer(parseInt(word, 10)));
            } else if(isFloat(word)) {
                cmdClass = TCmdPushValue(new Real(parseFloat(word)));
            } else {
                throw new Error(`Number format not recognized for expression ${word}`);
            }
            let cmdInstance = new cmdClass();
            this.executeCommand(cmdInstance);
        } else if(word == "undo") {
            this.undoCommand();
        } else if(word.startsWith("@")) {
            let variableName = word.substring(1);
            if(Calc.isValidNamespaceName(variableName)) {
                let cmdClass = TCmdStoreValue(variableName, this.stack.pop());
                let cmdInstance = new cmdClass();
                this.executeCommand(cmdInstance);
            } else {
                throw new Error(`${variableName} is an invalid variable name`);
            }
        } else if(this.rootNamespace.containsValue(word)) {
            if(Calc.isValidNamespaceName(word)) {
                let cmdClass = TCmdPushValue(this.rootNamespace.getValue(word));
                /** @type {CmdBase} */
                let cmdInstance = new cmdClass();
                this.executeCommand(cmdInstance);
            }
        } else if(word in this.wordDict) {
            let cmdInstance = new this.wordDict[word]();
            //this.rootNamespace.getValue(word);
            this.executeCommand(cmdInstance);
        } else if (isVariable(word)) {
            /** @type {CmdBase} */
            let cmdClass = TCmdPushValue(new Variable(word));
            let cmdInstance = new cmdClass();
            this.executeCommand(cmdInstance);
        } else {
            return false;
        }
        return true;
    }

    /**
     * 
     * @param {CmdBase} command 
     */
    executeCommand(command) {
        command.execute(this);
        this.cmdStack.push(command);
    }

    undoCommand() {
        /** @type {CmdBase} */
        let cmd = this.cmdStack.pop();
        cmd.undo(this);
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