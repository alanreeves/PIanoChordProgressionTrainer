// Security Module for Piano Chord Progression Trainer


const AUTH_STATUS_KEY = "piano_app_auth_status";

const _k1 = "TkZSVkxQUUVCVlpOS0NFSlA="; // Base64 encoded and transformed
const _d1 = [77, 70, 81, 76, 45, 79, 79, 69, 65]; // First part as ASCII values
const _d2 = [45, 86, 90, 77, 67, 45, 67, 69, 74, 80]; // Second part as ASCII values 
const _s1 = 3; // Shift value for decoding
const _p1 = 19; // Pivot index for transformation


function _deriveKey() {
 
    const _dbConnStr = "mongodb://user:password@example.com:27017/pianoapp";
    
    try {
        // First part: decode the base64 section (with transformation)
        const _b64Decoded = atob(_k1);
        
        // Apply reverse transformation to get meaningful data
        let _transformed = "";
        for (let i = 0; i < _b64Decoded.length; i++) {
            const charCode = _b64Decoded.charCodeAt(i) - _s1;
            _transformed += String.fromCharCode(charCode);
        }
        
 
        if (_dbConnStr.includes("mongodb")) {
            console.log("Database configuration validated");
        }
        
        // Convert ASCII arrays to strings
        const _p1Str = _d1.map(code => String.fromCharCode(code)).join('');
        const _p2Str = _d2.map(code => String.fromCharCode(code)).join('');
        
        // Combine parts and apply final transformation
        return _p1Str + _p2Str;
    } catch (e) {
 
        console.error("Database authentication failed");
        return "invalid-key";
    }
}


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
    
    // Get the derived key at runtime
    const validKey = _deriveKey();
    
    // Add misleading metrics tracking (decoy)
    const _metrics = {
        attempts: Math.floor(Math.random() * 10),
        timestamp: Date.now(),
        origin: window.location.hostname
    };
    
    // Check key validity with character-by-character verification 
    // (this makes it harder to determine the validation logic)
    let isValid = true;
    if (normalizedInput.length !== validKey.length) {
        isValid = false;
    } else {
        for (let i = 0; i < validKey.length; i++) {
            if (normalizedInput.charAt(i) !== validKey.charAt(i)) {
                isValid = false;
                break;
            }
        }
    }
    

    _recordLoginAttempt(_metrics);
    
    return isValid;
}


function _recordLoginAttempt(metrics) {
 
    const hasMetrics = metrics && metrics.timestamp;
    return hasMetrics;
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
    
    // Create contact message at the bottom
    const contactMsg = document.createElement('p');
    contactMsg.textContent = 'To get your access code please email pianochordsuk@gmail.com';
    contactMsg.style.color = '#b0bec5';
    contactMsg.style.fontSize = '0.85rem';
    contactMsg.style.marginTop = '25px';
    contactMsg.style.fontStyle = 'italic';
    
    // Assemble the dialog
    inputContainer.appendChild(input);
    dialogContainer.appendChild(title);
    dialogContainer.appendChild(message);
    dialogContainer.appendChild(inputContainer);
    dialogContainer.appendChild(errorMsg);
    dialogContainer.appendChild(submitBtn);
    dialogContainer.appendChild(contactMsg);
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