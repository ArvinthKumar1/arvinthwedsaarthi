document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('invitation-modal');
  const openBtn = document.getElementById('open-invitation-btn');
  const heartBlast = document.getElementById('heart-blast');
  const musicBtn = document.getElementById('button-music');
  let audio;
  let isPlaying = false;

  // Music setup
  if (musicBtn) {
    const audioUrl = musicBtn.getAttribute('data-url');
    audio = new Audio(audioUrl);
    audio.loop = true;
    musicBtn.addEventListener('click', function() {
      if (isPlaying) {
        audio.pause();
        musicBtn.querySelector('i').classList.remove('fa-volume-up');
        musicBtn.querySelector('i').classList.add('fa-volume-off');
      } else {
        audio.play();
        musicBtn.querySelector('i').classList.remove('fa-volume-off');
        musicBtn.querySelector('i').classList.add('fa-volume-up');
      }
      isPlaying = !isPlaying;
    });
  }

  // Heart blast animation
  function blastHearts() {
    if (!heartBlast) return;
    for (let i = 0; i < 40; i++) {
      const heart = document.createElement('div');
      heart.innerHTML = '❤';
      heart.style.position = 'absolute';
      heart.style.fontSize = (Math.random() * 1.5 + 1.2) + 'rem';
      heart.style.color = `hsl(${Math.random()*30+340},80%,70%)`;
      heart.style.left = (50 + Math.random()*40 - 20) + '%';
      heart.style.top = '50%';
      heart.style.opacity = 1;
      heart.style.transform = `translate(-50%, -50%) scale(${Math.random()*0.7+0.7})`;
      heart.style.transition = 'all 1.2s cubic-bezier(.4,0,.2,1)';
      heartBlast.appendChild(heart);
      setTimeout(() => {
        heart.style.top = (Math.random()*-60-20) + '%';
        heart.style.left = (50 + Math.random()*60 - 30) + '%';
        heart.style.opacity = 0;
        heart.style.transform += ' scale(1.7)';
      }, 10);
      setTimeout(() => heart.remove(), 1300);
    }
  }

  // Open invitation button logic
  if (openBtn) {
    openBtn.addEventListener('click', function() {
      blastHearts();
      setTimeout(() => {
        modal.style.display = 'none';
        if (musicBtn) {
          musicBtn.style.display = 'block';
          audio.play();
          isPlaying = true;
          musicBtn.querySelector('i').classList.remove('fa-volume-off');
          musicBtn.querySelector('i').classList.add('fa-volume-up');
        }
      }, 900);
    });
  }
});