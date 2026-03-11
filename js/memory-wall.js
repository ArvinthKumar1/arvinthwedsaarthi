(function() {
    // 1. Configuration - Automatically switches URL based on where the site is running
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    console.log(isLocal);
    const API_URL = "https://api-arvinthaarthi.azurewebsites.net/api/memorywall";

    console.log(`API URL set to: ${API_URL}`);

    // 2. Load Approved Wishes
    async function loadWishes() {
        const wrapper = document.getElementById('messagesWrapper');
        if (!wrapper) return;

        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error("Network error");
            const wishes = await response.json();
            
            wrapper.innerHTML = wishes.length > 0 
                ? wishes.map(msg => `
                    <div class="message-card ${msg.side}-card">
                        <fieldset class="message-fieldset">
                            <legend class="message-legend"><i class="fa-solid fa-heart"></i> ${msg.name}</legend>
                            <p>${msg.message}</p>
                        </fieldset>
                    </div>`).join('')
                : '<p class="text-white text-center">No messages yet. Be the first to wish!</p>';
        } catch (err) {
            wrapper.innerHTML = '<p class="text-white text-center">Unable to load messages at this time.</p>';
        }
    }

    // 3. Handle Form Submission
    const form = document.getElementById('memoryForm');
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerHTML;
            
            btn.disabled = true;
            btn.innerHTML = "Sending...";

            const payload = {
                name: document.getElementById('userName').value,
                side: document.querySelector('input[name="side"]:checked').value,
                message: document.getElementById('userMessage').value
            };

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert("Wishes sent! It will appear once approved by the couple.");
                    form.reset();
                } else {
                    alert("Submission failed. Please try again later.");
                }
            } catch (err) {
                alert("Connection error. Check your internet.");
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        };
    }

    // Initial load
    window.addEventListener('DOMContentLoaded', loadWishes);
})();