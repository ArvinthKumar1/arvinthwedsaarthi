(function() {
    const API_URL = "https://api-arvinthaarthi.azurewebsites.net/api/memorywall";
    const formContainer = document.querySelector('.glass-form');

    console.log(`API URL set to: ${API_URL}`);

     const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1482690393169461369/KPKcGx4AK368YpVkiUoQBmHQa2EM_cIeRfcooY3Z75q8ZfpxOSwvrEHoxdefFdQ0cHtp";

    function sendDiscordNotification(entryDetails) {
    fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        content: "🆕 **New Memory Wall Post Submitted!**",
        embeds: [
            {
            title: "New Entry Awaiting Approval",
            color: 0x5865F2, 
            fields: [
                { name: "Submitted By", value: entryDetails.name || "Unknown", inline: true },
                { name: "Team", value: entryDetails.team === "bride" ? "Bride's Side" : "Groom's Side", inline: true },
                { name: "Message", value: entryDetails.message || "N/A", inline: false },
                { name: "Time", value: new Date().toLocaleString(), inline: true }
            ]
            }
        ]
        })
    });
    }

    if (localStorage.getItem('hasSubmittedWishes')) {
        showSuccessState();
    }

    async function showSuccessState() {
        if (formContainer) {
            formContainer.innerHTML = `
                <div class="text-center py-5 animate__animated animate__fadeIn">
                    <i class="fa-solid fa-circle-check mb-3" style="font-size: 3.5rem; color: #f8d477;"></i>
                    <h3 class="cherished-text" style="font-size: 2rem;">Thank You!</h3>
                    <p class="px-3" style="color: white; opacity: 0.9;">
                        Your message has been received. <br> 
                        It will appear on the wall once approved by the couple.
                    </p>
                    <hr style="color: #f8d477; width: 30%; margin: 20px auto;">
                    <p style="font-size: 0.8rem; font-style: italic; color: #f8d477;">
                        "A collection of hearts, a wall of memories."
                    </p>
                </div>
            `;
        }
    }

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
                    localStorage.setItem('hasSubmittedWishes', 'true');

                    sendDiscordNotification({
                        name: document.getElementById('userName').value,
                        team: document.querySelector('input[name="side"]:checked').value,
                        message: document.getElementById('userMessage').value
                    });

                    fireConfetti();
                    
                    showSuccessState();
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

    function fireConfetti() {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#f8d477', '#ffffff', '#ffb6c1'], 
            shapes: ['circle', 'square'],
            ticks: 200,
            gravity: 1.2,
            scalar: 1.2,
            drift: 0,
        });
    }

    window.addEventListener('DOMContentLoaded', loadWishes);
})();