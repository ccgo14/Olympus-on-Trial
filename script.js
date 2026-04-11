// 1. SELECT: We grab the button and the body from the "temple" (DOM)
const themeBtn = document.querySelector('#theme-btn');
const body = document.body;


themeBtn.addEventListener('click', () => {
    
    
    body.classList.toggle('dark-theme');

    
    if (body.classList.contains('dark-theme')) {
        themeBtn.textContent = 'Switch to Light';
    } else {
        themeBtn.textContent = 'Switch to Dark';
    }
});