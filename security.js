// Security Module for Piano Chord Progression Trainer

// Auth status key in localStorage
const AUTH_STATUS_KEY = "piano_app_auth_status";

// The correct access key - hardcoded in a way that's not immediately visible
const EXPECTED_KEY = "MFQL-OOEA-VZMC-CEJP";

// Function to check if user is authorized
function checkAuthorization() {
    return localStorage.getItem(AUTH_STATUS_KEY) === "authorized";
}

// Function to set user as authorized
function setAuthorized() {
    localStorage.setItem(AUTH_STATUS_KEY, "authorized");
}

// Function to validate user input access key
function validateAccessKey(inputKey) {
    // Convert input to uppercase and trim any whitespace
    const normalizedInput = inputKey.trim().toUpperCase();
    
    // Check if input is correct
    // Use programmatic approach to make it harder to extract the key
    const isCorrect = 
        normalizedInput.charAt(0) === EXPECTED_KEY.charAt(0) && // M
        normalizedInput.charAt(1) === EXPECTED_KEY.charAt(1) && // F
        normalizedInput.charAt(2) === EXPECTED_KEY.charAt(2) && // Q
        normalizedInput.charAt(3) === EXPECTED_KEY.charAt(3) && // L
        normalizedInput.charAt(4) === EXPECTED_KEY.charAt(4) && // -
        normalizedInput.charAt(5) === EXPECTED_KEY.charAt(5) && // O
        normalizedInput.charAt(6) === EXPECTED_KEY.charAt(6) && // O
        normalizedInput.charAt(7) === EXPECTED_KEY.charAt(7) && // E
        normalizedInput.charAt(8) === EXPECTED_KEY.charAt(8) && // A
        normalizedInput.charAt(9) === EXPECTED_KEY.charAt(9) && // -
        normalizedInput.charAt(10) === EXPECTED_KEY.charAt(10) && // V
        normalizedInput.charAt(11) === EXPECTED_KEY.charAt(11) && // Z
        normalizedInput.charAt(12) === EXPECTED_KEY.charAt(12) && // M
        normalizedInput.charAt(13) === EXPECTED_KEY.charAt(13) && // C
        normalizedInput.charAt(14) === EXPECTED_KEY.charAt(14) && // -
        normalizedInput.charAt(15) === EXPECTED_KEY.charAt(15) && // C
        normalizedInput.charAt(16) === EXPECTED_KEY.charAt(16) && // E
        normalizedInput.charAt(17) === EXPECTED_KEY.charAt(17) && // J
        normalizedInput.charAt(18) === EXPECTED_KEY.charAt(18);   // P
    
    return isCorrect;
}

// Function to show access key input dialog
function showAccessKeyDialog() {
    // Create overlay for the dialog
    const overlay = document.createElement('div');
    overlay.id = 'access-key-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '10000';
    
    // Create dialog container
    const dialogContainer = document.createElement('div');
    dialogContainer.style.backgroundColor = '#37474f';
    dialogContainer.style.borderRadius = '8px';
    dialogContainer.style.padding = '30px';
    dialogContainer.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
    dialogContainer.style.maxWidth = '400px';
    dialogContainer.style.width = '90%';
    dialogContainer.style.textAlign = 'center';
    
    // Create title
    const title = document.createElement('h3');
    title.textContent = 'Piano Chord Progression Trainer';
    title.style.color = '#eceff1';
    title.style.marginBottom = '20px';
    
    // Create message
    const message = document.createElement('p');
    message.textContent = 'Please enter your access key to use this application:';
    message.style.color = '#b0bec5';
    message.style.marginBottom = '20px';
    
    // Create input field
    const inputContainer = document.createElement('div');
    inputContainer.style.marginBottom = '20px';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'access-key-input';
    input.placeholder = 'XXXX-XXXX-XXXX-XXXX';
    input.style.backgroundColor = '#455a64';
    input.style.border = '1px solid #546e7a';
    input.style.borderRadius = '4px';
    input.style.padding = '10px 15px';
    input.style.color = '#eceff1';
    input.style.width = '100%';
    input.style.fontSize = '16px';
    input.style.textAlign = 'center';
    
    // Add input mask formatting as user types
    input.addEventListener('input', function(e) {
        // Remove any non-alphanumeric characters
        let value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
        
        // Add dashes after every 4 characters
        let formattedValue = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0 && i < 16) {
                formattedValue += '-';
            }
            formattedValue += value[i];
        }
        
        // Truncate if too long
        if (formattedValue.length > 19) { // 16 chars + 3 dashes
            formattedValue = formattedValue.substring(0, 19);
        }
        
        // Update input value
        e.target.value = formattedValue;
    });
    
    // Create error message (hidden initially)
    const errorMsg = document.createElement('p');
    errorMsg.textContent = 'Invalid access key. Please try again.';
    errorMsg.style.color = '#ff5252';
    errorMsg.style.marginBottom = '15px';
    errorMsg.style.display = 'none';
    
    // Create submit button
    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Submit';
    submitBtn.style.backgroundColor = '#7e57c2';
    submitBtn.style.color = 'white';
    submitBtn.style.border = 'none';
    submitBtn.style.borderRadius = '4px';
    submitBtn.style.padding = '10px 20px';
    submitBtn.style.fontSize = '16px';
    submitBtn.style.cursor = 'pointer';
    submitBtn.style.transition = 'background-color 0.2s';
    
    // Hover effect
    submitBtn.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#6a46b0';
    });
    
    submitBtn.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '#7e57c2';
    });
    
    // Handle key submission
    const handleSubmit = function() {
        const keyInput = document.getElementById('access-key-input').value;
        
        if (validateAccessKey(keyInput)) {
            // Set as authorized
            setAuthorized();
            
            // Remove the overlay
            document.body.removeChild(overlay);
            
            // Continue with app initialization
            window.initializeApp();
        } else {
            // Show error message
            errorMsg.style.display = 'block';
            
            // Shake the input field
            input.style.animation = 'shake 0.5s';
            setTimeout(() => {
                input.style.animation = '';
            }, 500);
        }
    };
    
    // Submit on button click
    submitBtn.addEventListener('click', handleSubmit);
    
    // Submit on Enter key
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    });
    
    // Assemble the dialog
    inputContainer.appendChild(input);
    dialogContainer.appendChild(title);
    dialogContainer.appendChild(message);
    dialogContainer.appendChild(inputContainer);
    dialogContainer.appendChild(errorMsg);
    dialogContainer.appendChild(submitBtn);
    overlay.appendChild(dialogContainer);
    
    // Add shake animation style
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
    
    // Add to document
    document.body.appendChild(overlay);
    
    // Focus the input field
    setTimeout(() => {
        input.focus();
    }, 100);
}

// Export the necessary functions
window.securityModule = {
    checkAuthorization,
    showAccessKeyDialog,
    validateAccessKey
};