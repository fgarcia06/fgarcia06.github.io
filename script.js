(() => {
  const menuButton = document.querySelector('[data-menu-button]');
  const navList = document.querySelector('[data-nav-list]');

  if (menuButton && navList) {
    menuButton.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  const yearElement = document.querySelector('[data-year]');
  if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
  }

  if (window.AOS) {
    window.AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 70
    });
  }

  document.querySelectorAll('[data-stagger]').forEach((group) => {
    const children = Array.from(group.children);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          children.forEach((child, index) => {
            setTimeout(() => child.classList.add('in-view'), index * 90);
          });
          observer.disconnect();
        });
      },
      { threshold: 0.18 }
    );
    observer.observe(group);
  });

  document.querySelectorAll('[data-tilt]').forEach((el) => {
    el.addEventListener('mousemove', (event) => {
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 6;
      const rotateX = (0.5 - py) * 6;
      el.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
})();
