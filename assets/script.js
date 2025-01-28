// Formatting message text
function formatMessage(text) {
    if (!text) return '';
    
    // Handling headers and line breaks
    let lines = text.split('\n');
    let formattedLines = lines.map(line => {
        // Processing title (**text**)
        line = line.replace(/\*\*(.*?)\*\*/g, '<span class="bold-text">$1</span>');
        return line;
    });
    
    // Replace ### with line breaks and make sure each section is a paragraph
    let processedText = formattedLines.join('\n');
    let sections = processedText
        .split('###')
        .filter(section => section.trim())
        .map(section => {
            // Remove extra line breaks and spaces
            let lines = section.split('\n').filter(line => line.trim());
            
            if (lines.length === 0) return '';
            
            // Process each part
            let result = '';
            let currentIndex = 0;
            
            while (currentIndex < lines.length) {
                let line = lines[currentIndex].trim();
                
                // If it starts with a number (such as "1.")
                if (/^\d+\./.test(line)) {
                    result += `<p class="section-title">${line}</p>`;
                }
                // If it is a subheading (starting with a dash)
                else if (line.startsWith('-')) {
                    result += `<p class="subsection"><span class="bold-text">${line.replace(/^-/, '').trim()}</span></p>`;
                }
                // If it is body text (line containing colon)
                else if (line.includes(':')) {
                    let [subtitle, content] = line.split(':').map(part => part.trim());
                    result += `<p><span class="subtitle">${subtitle}</span>: ${content}</p>`;
                }
                // Normal text
                else {
                    result += `<p>${line}</p>`;
                }
                currentIndex++;
            }
            return result;
        });
    
    return sections.join('');
}

// Display Message
function displayMessage(role, message) {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${role}`;
    
    const avatar = document.createElement('img');
    avatar.src = role === 'user' ? 'user-avatar.png' : 'bot-avatar.png';
    avatar.alt = role === 'user' ? 'User' : 'Bot';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // User messages are displayed directly, robot messages need to be formatted
    messageContent.innerHTML = role === 'user' ? message : formatMessage(message);

    messageElement.appendChild(avatar);
    messageElement.appendChild(messageContent);
    messagesContainer.appendChild(messageElement);
    
    // Smooth scroll to bottom
    messageElement.scrollIntoView({ behavior: 'smooth' });
}

function sendMessage() {
    const inputElement = document.getElementById('chat-input');
    const message = inputElement.value;
    if (!message.trim()) return;

    displayMessage('user', message);
    inputElement.value = '';

    // Show loading animation
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'block';
    }

    const apiKey = 'sk-9fd0f598a8b14fb6b935c2267e5f11ba';
    const endpoint = 'https://api.deepseek.com/chat/completions';

    // --------------PRESET----------------------
    const presetInfo = `
    You are an assistant representing Tom Choi, he's called Cai Tongbo under the law. Always respond using these key details:
    - Name: Tom Choi (Name Cai Tongbo under the law)
    - Profession: Assistant psychologist
    - Areas: [Clinical Psychology], [Developmental Psychology], [Health Psychology], [Cognitive Neuroscience], [I/O Psychology]
    - Approaches: [Biological], [Behavioural], [Cognitive], [Humanistic]
    - Education: [Bachelor of Arts (Hons) in Psychology, UCSI University,2022 - 2025]
    - Location: [Malaysia, KL]
    - Key Projects: [Masking behavior in adult autism], [Camouflaging behavior in adult autism review]
    - Experience: Assistant Psychologist in a Education Consulting in China, also doing some project: Vaccination Promotion, Psychological Disease Popularization, Autism Masking behavior research
    Respond to questions using this information. For example:
    - If asked "Who are you?", mention your name and profession
    - If asked about skills, list relevant ones from above
    - Keep responses concise but informative

    `.replace(/\n\s+/g, '\n'); // Clean up indentation

    // Modified payload with preset information
    const payload = {
        model: "deepseek-chat",
        messages: [
            { 
                role: "system", 
                content: presetInfo + "\nAlso be helpful for general questions." 
            },
            { role: "user", content: message }
        ],
        stream: false
    };
    // --------------PRESET end----------------------


    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        // Hide loading animation
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }

        if (data.choices && data.choices.length > 0) {
            displayMessage('bot', data.choices[0].message.content);
        } else {
            displayMessage('bot', 'Service is under maintenance.');
        }
    })
    .catch(error => {
        // Hide loading animation
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }

        displayMessage('bot', 'Service is under maintenance.');
        console.error('Error:', error);
    });
}


// Added carriage return function
document.getElementById('chat-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});