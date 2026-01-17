const audioButton = document.getElementById('button-music');
const audioUrl = audioButton.getAttribute('data-url');
const audio = new Audio(audioUrl);

let isPlaying = false;

audio.play().catch((error) => {
    console.error("Error playing audio:", error);
});

audio.addEventListener('error', function () {
    console.error("Error loading audio: " + audioUrl);
});

audioButton.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
        audioButton.querySelector('i').classList.remove('fa-volume-up');
        audioButton.querySelector('i').classList.add('fa-volume-off');
    } else {
        audio.play().catch((error) => {
            console.error("Error playing audio:", error);
        });
        audioButton.querySelector('i').classList.remove('fa-volume-off');
        audioButton.querySelector('i').classList.add('fa-volume-up');
    }
    isPlaying = !isPlaying;
});