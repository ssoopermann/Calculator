class Calculator {
    constructor(previousOperandElement, currentOperandElement, historyList) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.historyList = historyList;
        this.history = JSON.parse(localStorage.getItem('calculatorHistory') || '[]');
        this.clear();
        this.updateHistory();
    }

    // Sanitize input to prevent XSS
    sanitizeInput(input) {
        return input.toString().replace(/[<>]/g, '');
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
    }

    delete() {
        this.currentOperand = this.sanitizeInput(this.currentOperand).slice(0, -1);
        if (this.currentOperand === '') {
            this.currentOperand = '0';
        }
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = this.sanitizeInput(number);
        } else {
            this.currentOperand = this.sanitizeInput(this.currentOperand) + this.sanitizeInput(number);
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = this.sanitizeInput(operation);
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        // Validate operation to prevent code injection
        const validOperations = ['+', '-', '×', '÷'];
        if (!validOperations.includes(this.operation)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    alert("Cannot divide by zero!");
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        // Add to history with sanitized values
        const historyEntry = `${this.getDisplayNumber(prev)} ${this.operation} ${this.getDisplayNumber(current)} = ${this.getDisplayNumber(computation)}`;
        this.history.unshift(this.sanitizeInput(historyEntry));
        
        // Limit history size to prevent memory issues
        if (this.history.length > 100) {
            this.history.pop();
        }
        
        // Save to localStorage with error handling
        try {
            localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            this.history = [];
        }
        
        this.updateHistory();

        this.currentOperand = computation;
        this.operation = undefined;
        this.previousOperand = '';
    }

    updateHistory() {
        this.historyList.innerHTML = '';
        this.history.forEach(entry => {
            const historyItem = document.createElement('div');
            historyItem.classList.add('history-item');
            historyItem.textContent = this.sanitizeInput(entry);
            this.historyList.appendChild(historyItem);
        });
    }

    clearHistory() {
        this.history = [];
        try {
            localStorage.removeItem('calculatorHistory');
        } catch (e) {
            console.error('Error clearing localStorage:', e);
        }
        this.updateHistory();
    }

    getDisplayNumber(number) {
        const stringNumber = this.sanitizeInput(number);
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', {
                maximumFractionDigits: 0
            });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandElement.textContent = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandElement.textContent = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.textContent = '';
        }
    }
}

// Initialize calculator with error handling
try {
    const numberButtons = document.querySelectorAll('.number');
    const operationButtons = document.querySelectorAll('.operator');
    const equalsButton = document.querySelector('.equals');
    const deleteButton = document.querySelector('.delete');
    const clearButton = document.querySelector('.clear');
    const clearHistoryButton = document.querySelector('.clear-history');
    const previousOperandElement = document.querySelector('.previous-operand');
    const currentOperandElement = document.querySelector('.current-operand');
    const historyList = document.querySelector('.history-list');

    const calculator = new Calculator(previousOperandElement, currentOperandElement, historyList);

    // Add event listeners with error handling
    const addEventListenerWithErrorHandling = (element, event, handler) => {
        try {
            element.addEventListener(event, handler);
        } catch (e) {
            console.error(`Error adding event listener to ${event}:`, e);
        }
    };

    numberButtons.forEach(button => {
        addEventListenerWithErrorHandling(button, 'click', () => {
            calculator.appendNumber(button.textContent);
            calculator.updateDisplay();
        });
    });

    operationButtons.forEach(button => {
        addEventListenerWithErrorHandling(button, 'click', () => {
            calculator.chooseOperation(button.textContent);
            calculator.updateDisplay();
        });
    });

    addEventListenerWithErrorHandling(equalsButton, 'click', () => {
        calculator.compute();
        calculator.updateDisplay();
    });

    addEventListenerWithErrorHandling(clearButton, 'click', () => {
        calculator.clear();
        calculator.updateDisplay();
    });

    addEventListenerWithErrorHandling(deleteButton, 'click', () => {
        calculator.delete();
        calculator.updateDisplay();
    });

    addEventListenerWithErrorHandling(clearHistoryButton, 'click', () => {
        calculator.clearHistory();
    });
} catch (e) {
    console.error('Error initializing calculator:', e);
} 