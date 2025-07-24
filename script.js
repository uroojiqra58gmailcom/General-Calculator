// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');

    // Get DOM elements
    const display = document.getElementById('current-input');
    const historyDisplay = document.getElementById('history');
    const buttons = document.querySelectorAll('button');
    const clickSound = document.getElementById('click-sound');
    const operatorSound = document.getElementById('operator-sound');
    const equalsSound = document.getElementById('equals-sound');
    const soundEnabler = document.getElementById('sound-enabler');

    console.log('Display element:', display);
    console.log('Audio elements:', clickSound, operatorSound, equalsSound);

    // Sound initialization
    let soundEnabled = false;

    // Preload sounds
    function preloadSounds() {
        const sounds = [clickSound, operatorSound, equalsSound];
        sounds.forEach(sound => {
            sound.load();
            // Create a clone to ensure the browser loads the audio
            const clone = sound.cloneNode(true);
            clone.volume = 0;
            document.body.appendChild(clone);
            setTimeout(() => {
                document.body.removeChild(clone);
            }, 1000);
        });
    }

    // Try to preload sounds
    preloadSounds();

    // Show sound enabler after a short delay
    setTimeout(() => {
        soundEnabler.style.display = 'block';
    }, 1000);

    // Enable sound when user clicks anywhere
    document.addEventListener('click', function initSound() {
        // Try to play a silent sound to enable audio
        const silentSound = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADQgD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAQAAAAAAAAAAABSAJAJAQgAAgAAAA0JkhZcAAAAAAAAAAAAAAAAAAAAA//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZB4P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZDwP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
        silentSound.play().then(() => {
            console.log('Audio enabled successfully');
            soundEnabled = true;
            soundEnabler.style.display = 'none';
        }).catch(e => {
            console.log('Failed to enable audio automatically:', e);
        });

        // Remove this listener after first click
        document.removeEventListener('click', initSound);
    });

    // Enable sound when clicking on the enabler specifically
    soundEnabler.addEventListener('click', function() {
        // Try to play all sounds at zero volume to enable them
        clickSound.volume = 0;
        operatorSound.volume = 0;
        equalsSound.volume = 0;

        clickSound.play().then(() => {
            clickSound.pause();
            clickSound.currentTime = 0;
            clickSound.volume = 1;

            operatorSound.play().then(() => {
                operatorSound.pause();
                operatorSound.currentTime = 0;
                operatorSound.volume = 1;

                equalsSound.play().then(() => {
                    equalsSound.pause();
                    equalsSound.currentTime = 0;
                    equalsSound.volume = 1;

                    console.log('All sounds enabled');
                    soundEnabled = true;
                    soundEnabler.style.display = 'none';
                });
            });
        }).catch(e => {
            console.error('Failed to enable sounds:', e);
        });
    });

    // Function to play sound with error handling
    function playAudio(audioElement) {
        if (!audioElement) {
            console.error('Audio element not found');
            return;
        }

        // Skip if sound is not enabled yet
        if (!soundEnabled) {
            console.log('Sound not enabled yet, skipping playback');
            return;
        }

        // Reset audio to beginning
        audioElement.currentTime = 0;

        // Make sure volume is set correctly
        audioElement.volume = 1.0;
        audioElement.muted = false;

        // Play with error handling
        const playPromise = audioElement.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Playback started successfully
                console.log('Sound played successfully');
            }).catch(error => {
                // Auto-play was prevented
                console.error('Audio playback failed:', error);

                // Show sound enabler again if there's an error
                soundEnabler.style.display = 'block';
                soundEnabled = false;
            });
        }
    }

    // Calculator state
    let currentInput = '0';
    let previousInput = '';
    let operation = null;
    let shouldResetDisplay = false;

    // Initialize display
    updateDisplay();

    // Add event listeners to all buttons
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Add animation
            this.classList.add('button-animation');
            setTimeout(() => {
                this.classList.remove('button-animation');
            }, 300);

            // Handle different button types
            if (this.classList.contains('number')) {
                // Play sound
                playAudio(clickSound);

                // Get the number from button text
                const num = this.textContent;

                // Handle number input
                if (shouldResetDisplay) {
                    currentInput = '0';
                    shouldResetDisplay = false;
                }

                if (num === '.' && currentInput.includes('.')) return;

                if (currentInput === '0' && num !== '.') {
                    currentInput = num;
                } else {
                    currentInput += num;
                }

                console.log('Current input:', currentInput);
                updateDisplay();

            } else if (this.classList.contains('operator')) {
                // Play sound
                playAudio(operatorSound);

                // Handle operator
                const op = this.dataset.action;

                if (operation !== null) calculate();

                previousInput = currentInput;
                operation = op;
                shouldResetDisplay = true;

                // Update history display
                let operatorSymbol = '';
                switch (op) {
                    case 'add': operatorSymbol = '+'; break;
                    case 'subtract': operatorSymbol = '-'; break;
                    case 'multiply': operatorSymbol = '×'; break;
                    case 'divide': operatorSymbol = '÷'; break;
                }

                historyDisplay.textContent = `${previousInput} ${operatorSymbol}`;

            } else if (this.classList.contains('equals')) {
                // Play sound
                playAudio(equalsSound);

                // Calculate result
                calculate();

            } else if (this.classList.contains('function-btn')) {
                // Play sound
                playAudio(clickSound);

                // Handle function buttons
                const action = this.dataset.action;

                switch (action) {
                    case 'clear':
                        currentInput = '0';
                        previousInput = '';
                        operation = null;
                        historyDisplay.textContent = '';
                        break;

                    case 'backspace':
                        if (currentInput.length === 1 || currentInput === 'Error') {
                            currentInput = '0';
                        } else {
                            currentInput = currentInput.slice(0, -1);
                        }
                        break;

                    case 'percent':
                        currentInput = (parseFloat(currentInput) / 100).toString();
                        break;
                }

                updateDisplay();
            }
        });
    });

    // Add keyboard support
    document.addEventListener('keydown', function(e) {
        if (e.key >= '0' && e.key <= '9') {
            playAudio(clickSound);

            if (shouldResetDisplay) {
                currentInput = '0';
                shouldResetDisplay = false;
            }

            if (currentInput === '0') {
                currentInput = e.key;
            } else {
                currentInput += e.key;
            }

            updateDisplay();

        } else if (e.key === '.') {
            if (!currentInput.includes('.')) {
                playAudio(clickSound);
                currentInput += '.';
                updateDisplay();
            }

        } else if (e.key === '+') {
            playAudio(operatorSound);
            handleOperator('add');

        } else if (e.key === '-') {
            playAudio(operatorSound);
            handleOperator('subtract');

        } else if (e.key === '*') {
            playAudio(operatorSound);
            handleOperator('multiply');

        } else if (e.key === '/') {
            playAudio(operatorSound);
            handleOperator('divide');

        } else if (e.key === 'Enter' || e.key === '=') {
            playAudio(equalsSound);
            calculate();

        } else if (e.key === 'Escape') {
            playAudio(clickSound);
            currentInput = '0';
            previousInput = '';
            operation = null;
            historyDisplay.textContent = '';
            updateDisplay();

        } else if (e.key === 'Backspace') {
            playAudio(clickSound);

            if (currentInput.length === 1 || currentInput === 'Error') {
                currentInput = '0';
            } else {
                currentInput = currentInput.slice(0, -1);
            }

            updateDisplay();
        }
    });

    // Helper function to handle operators
    function handleOperator(op) {
        if (operation !== null) calculate();

        previousInput = currentInput;
        operation = op;
        shouldResetDisplay = true;

        // Update history display
        let operatorSymbol = '';
        switch (op) {
            case 'add': operatorSymbol = '+'; break;
            case 'subtract': operatorSymbol = '-'; break;
            case 'multiply': operatorSymbol = '×'; break;
            case 'divide': operatorSymbol = '÷'; break;
        }

        historyDisplay.textContent = `${previousInput} ${operatorSymbol}`;
    }

    // Calculate function
    function calculate() {
        if (operation === null || shouldResetDisplay) return;

        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);
        let result = 0;

        switch (operation) {
            case 'add':
                result = prev + current;
                break;
            case 'subtract':
                result = prev - current;
                break;
            case 'multiply':
                result = prev * current;
                break;
            case 'divide':
                if (current === 0) {
                    currentInput = 'Error';
                    updateDisplay();
                    return;
                }
                result = prev / current;
                break;
        }

        // Add to history
        let operatorSymbol = '';
        switch (operation) {
            case 'add': operatorSymbol = '+'; break;
            case 'subtract': operatorSymbol = '-'; break;
            case 'multiply': operatorSymbol = '×'; break;
            case 'divide': operatorSymbol = '÷'; break;
        }

        const historyItem = `${prev} ${operatorSymbol} ${current} = ${result}`;

        // Update display
        currentInput = result.toString();
        historyDisplay.textContent = historyItem;
        operation = null;
        shouldResetDisplay = true;

        updateDisplay();
    }

    // Update display function
    function updateDisplay() {
        console.log('Updating display with:', currentInput);

        if (currentInput === 'Error') {
            display.textContent = 'Error';
        } else {
            // Format large numbers with commas
            const parts = currentInput.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            display.textContent = parts.join('.');
        }
    }
});
