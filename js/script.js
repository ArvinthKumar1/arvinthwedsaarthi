(function ($) {
    "use strict";
    $('.sakura-falling').sakura();
})(jQuery);


const countDownDate = () => {
    const until = document.getElementById("count-down")?.getAttribute("data-time")?.replace(" ", "T");
    if (!until) {
        return;
    }
    const count = new Date(until).getTime();
    setInterval(() => {
        const distance = Math.abs(count - Date.now());
        document.getElementById("day").innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
        document.getElementById("hour").innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        document.getElementById("minute").innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        document.getElementById("second").innerText = Math.floor((distance % (1000 * 60)) / 1000);
    }, 1000);
};

document.addEventListener("DOMContentLoaded", countDownDate);



/*===== SCROLL REVEAL ANIMATION =====*/
const sr = ScrollReveal({
    origin: 'top',
    distance: '1.5rem',
    duration: 2000,
    delay: 200,
    // reset: true
});

const modal = (img) => {
    document.getElementById("show-modal-image").src = img.src;
    bootstrap.Modal.getOrCreateInstance("#modal-image").show();
};


sr.reveal(`.rahul`,{ delay: 300, origin: 'top' })
sr.reveal(`.rahul`, { origin: 'left', delay: 700 })
sr.reveal(`.pranjal`, { origin: 'right', delay: 700 })
sr.reveal(`.gif,.home_txt`, { delay: 400, origin: 'top' })
sr.reveal(`.top-right-decoration,.top-left-decoration`, { origin: 'left', delay: 2200 })
sr.reveal(`.responsive-table__row`, { interval: 200 })
sr.reveal(`.table_container`, { delay: 100, origin: 'top' })
sr.reveal(`.happiness,.hindi_text`, { delay: 400, origin: 'bottom' })
sr.reveal(`.social__links`, { delay: 1000, origin: 'bottom', interval: 200 })
sr.reveal(`.newsletter__description,.home__bottom`, { origin: 'left', delay: 400 })
sr.reveal(`.newsletter__form,.CTA,.home__left`, { origin: 'right', delay: 400 })