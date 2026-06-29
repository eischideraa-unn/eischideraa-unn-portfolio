// role rotator
const roles = ["Fullstack Developer", "Content Writer", "Social Media Manager", "Web3 Builder"];
let ri = 0;
const roleEl = document.getElementById('role-text');
setInterval(() => {
    ri = (ri + 1) % roles.length;
    roleEl.style.opacity = 0;
    setTimeout(() => {
        roleEl.textContent = '"' + roles[ri] + '"';
        roleEl.style.opacity = 1;
    }, 200);
}, 2600);
roleEl.style.transition = 'opacity .2s ease';

// scroll reveal
const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal, .reveal-x-l, .reveal-x-r').forEach(el => obs.observe(el));

document.getElementById('year').textContent = new Date().getFullYear();

// magnetic 3D portrait tilt
const portrait = document.getElementById('magnet-portrait');
const header = document.querySelector('header');
if (portrait && header) {
    header.addEventListener('mousemove', (e) => {
        const rect = header.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        portrait.style.transform = `translateY(-50%) translate3d(${x * -20}px, ${y * -20}px, 0) rotateY(${x * 8}deg) rotateX(${y * -8}deg)`;
    });
    header.addEventListener('mouseleave', () => {
        portrait.style.transform = 'translateY(-50%) translate3d(0,0,0) rotateY(0) rotateX(0)';
    });
}

// theme toggle
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');
const body = document.body;

// Check for saved user preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    body.classList.add('light-theme');
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    const isLight = body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');

    // Toggle icons
    if (isLight) {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    } else {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }
});

// contact form submission with basic validation
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        // Basic validation check
        const name = contactForm.querySelector('[name="name"]').value;
        const email = contactForm.querySelector('[name="email"]').value;
        const message = contactForm.querySelector('[name="message"]').value;

        if (!name || !email || !message) {
            e.preventDefault();
            formStatus.textContent = 'Please fill in all required fields.';
            formStatus.style.color = 'var(--pink)';
            return;
        }

        formStatus.textContent = 'Sending… you may be redirected for a moment.';
        formStatus.style.color = 'var(--muted)';
    });
}

// ===== PROOF OF WORK: owner-only add system =====
const POW_PASSCODE = 'chidera2026'; // change this to your own passcode
const powList = document.getElementById('pow-list');
const powAddBtn = document.getElementById('pow-add-btn');
const powForm = document.getElementById('pow-form');
const powCancel = document.getElementById('pow-cancel');
let isOwner = false;

function renderPowItem(item) {
    const wrap = document.createElement('div');
    wrap.className = 'reveal is-visible grid sm:grid-cols-[auto_1fr] gap-6 sm:gap-10 items-start py-8 sm:py-10 border-t';
    wrap.style.borderColor = 'rgba(236,234,230,0.12)';
    wrap.innerHTML = `
      <span class="mono text-xs sm:text-sm px-3 py-1 rounded-full border" style="border-color:rgba(230,0,122,0.4);color:var(--pink);width:fit-content">${item.category}</span>
      <div>
        <h3 class="font-medium uppercase mb-2" style="font-size:clamp(1.1rem,2.2vw,1.8rem)">${item.title}</h3>
        <p class="leading-relaxed mb-4" style="color:var(--muted);font-size:clamp(0.9rem,1.6vw,1.1rem)">${item.desc}</p>
        <a href="${item.link}" target="_blank" rel="noopener" class="btn-ghost inline-block rounded-full text-xs uppercase tracking-widest font-medium px-6 py-2.5 transition-colors duration-200">View ↗</a>
      </div>`;
    powList.appendChild(wrap);
}

async function loadPowItems() {
    if (typeof window.storage === 'undefined') return;
    try {
        const res = await window.storage.get('proof-of-work-items', true);
        const items = res && res.value ? JSON.parse(res.value) : [];
        items.forEach(renderPowItem);
    } catch (e) {
        // no stored items yet
    }
}
loadPowItems();

powAddBtn.addEventListener('click', () => {
    const code = prompt('Enter owner passcode to add a new entry:');
    if (code === null) return;
    if (code !== POW_PASSCODE) {
        alert('Incorrect passcode — only Chidera can add proof of work.');
        return;
    }
    isOwner = true;
    powForm.style.display = 'flex';
    powAddBtn.style.display = 'none';
});

powCancel.addEventListener('click', () => {
    powForm.style.display = 'none';
    powAddBtn.style.display = 'inline-block';
    powForm.reset();
});

powForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!isOwner || typeof window.storage === 'undefined') return;
    const item = {
        category: document.getElementById('pow-category').value,
        title: document.getElementById('pow-title').value,
        desc: document.getElementById('pow-desc').value,
        link: document.getElementById('pow-link').value
    };
    try {
        const res = await window.storage.get('proof-of-work-items', true);
        const items = res && res.value ? JSON.parse(res.value) : [];
        items.push(item);
        await window.storage.set('proof-of-work-items', JSON.stringify(items), true);
        renderPowItem(item);
        powForm.reset();
        powForm.style.display = 'none';
        powAddBtn.style.display = 'inline-block';
    } catch (err) {
        alert('Could not save entry. Try again.');
    }
});