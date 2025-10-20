(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * burgerMenu
   */
  const burgerMenu = select('.burger')
  on('click', '.burger', function(e) {
    burgerMenu.classList.toggle('active');
  })

  /**
   * Porfolio isotope and filter
   */
  window.addEventListener('load', () => {
    let portfolioContainer = select('#portfolio-grid');
    if (portfolioContainer) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: '.item',
      });

      let portfolioFilters = select('#filters a', true);

      on('click', '#filters a', function(e) {
        e.preventDefault();
        portfolioFilters.forEach(function(el) {
          el.classList.remove('active');
        });
        this.classList.add('active');

        portfolioIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        portfolioIsotope.on('arrangeComplete', function() {
          AOS.refresh()
        });
      }, true);
    }

  });

  /**
   * Testimonials slider
   */
  new Swiper('.testimonials-slider', {
    speed: 600,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    slidesPerView: 'auto',
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  });

  /**
   * Animation on scroll
   */
  window.addEventListener('load', () => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  });

    /**
   * Hero section, on mouse move animation
   */

// Get all images
        const images = document.querySelectorAll('.floating-img');
        const imgSize = 50; // Image width/height
        const minDistance = imgSize + 10; // Minimum distance between images (image size + 10px buffer)

        // Check if two images collide
        function checkCollision(img1, img2, newX, newY) {
            const rect1 = {
                x: newX || parseFloat(img1.style.left) || 0,
                y: newY || parseFloat(img1.style.top) || 0,
                width: imgSize,
                height: imgSize
            };
            const rect2 = {
                x: parseFloat(img2.style.left) || 0,
                y: parseFloat(img2.style.top) || 0,
                width: imgSize,
                height: imgSize
            };

            // Check if bounding boxes are closer than minDistance
            const dx = rect1.x + rect1.width / 2 - (rect2.x + rect2.width / 2);
            const dy = rect1.y + rect1.height / 2 - (rect2.y + rect2.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < minDistance;
        }

        // Set random position within 2-20% from edges, avoiding collisions
        function placeImage(img, maxAttempts = 50) {
            const maxX = window.innerWidth - imgSize;
            const maxY = window.innerHeight - imgSize;
            const minX = window.innerWidth * 0.02; // 2% from left
            const maxXBound = window.innerWidth * 0.2; // 20% from left
            const minY = window.innerHeight * 0.02; // 2% from top
            const maxYBound = window.innerHeight * 0.2; // 20% from top

            let attempts = 0;
            let randomX, randomY;

            do {
                randomX = Math.random() < 0.5
                    ? minX + Math.random() * (maxXBound - minX) // Left side
                    : maxX - (minX + Math.random() * (maxXBound - minX)); // Right side
                randomY = Math.random() < 0.5
                    ? minY + Math.random() * (maxYBound - minY) // Top side
                    : maxY - (minY + Math.random() * (maxYBound - minY)); // Bottom side

                attempts++;
                let collision = false;
                for (let otherImg of images) {
                    if (otherImg !== img && (otherImg.style.left || otherImg.style.top)) {
                        if (checkCollision(img, otherImg, randomX, randomY)) {
                            collision = true;
                            break;
                        }
                    }
                }
                if (!collision) {
                    img.style.left = randomX + 'px';
                    img.style.top = randomY + 'px';
                    return true;
                }
            } while (attempts < maxAttempts);

            // Fallback: Place in a safe spot if max attempts reached
            img.style.left = minX + 'px';
            img.style.top = minY + attempts * imgSize + 'px';
            return false;
        }

        // Initial placement
        images.forEach(img => placeImage(img));

        // Mouse move event
        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            images.forEach((img, index) => {
                const rect = img.getBoundingClientRect();
                const imgX = rect.left + rect.width / 2;
                const imgY = rect.top + rect.height / 2;

                // Calculate desired movement
                const sensitivity = 0.02 * (index + 1);
                const dx = (mouseX - imgX) * sensitivity;
                const dy = (mouseY - imgY) * sensitivity;

                // Check for collisions with other images
                let newX = parseFloat(img.style.left || 0) + dx * 0.1; // Smooth movement
                let newY = parseFloat(img.style.top || 0) + dy * 0.1;
                let canMove = true;

                for (let otherImg of images) {
                    if (otherImg !== img && (otherImg.style.left || otherImg.style.top)) {
                        if (checkCollision(img, otherImg, newX, newY)) {
                            canMove = false;
                            break;
                        }
                    }
                }

                // Apply movement if no collision
                if (canMove) {
                    img.style.transform = `translate(${dx}px, ${dy}px)`;
                }
            });
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            images.forEach(img => {
                const maxX = window.innerWidth - imgSize;
                const maxY = window.innerHeight - imgSize;
                const minX = window.innerWidth * 0.1;
                const minY = window.innerHeight * 0.1;

                // Recompute position within bounds
                let currentX = parseFloat(img.style.left) || 0;
                let currentY = parseFloat(img.style.top) || 0;

                currentX = Math.min(Math.max(currentX, minX), maxX - minX);
                currentY = Math.min(Math.max(currentY, minY), maxY - minY);

                img.style.left = currentX + 'px';
                img.style.top = currentY + 'px';

                // Re-check collisions after resize
                placeImage(img);
            });
        });

  /**
   * Get Current Year
   */
  const n = new Date();
  const y = n.getFullYear();
  document.getElementById("year").innerHTML = y;

  /*
  * Get Age
  */

const getAge = (birthDateString) => {
    const today = new Date();
    const birthDate = new Date(birthDateString);

    const yearsDifference = today.getFullYear() - birthDate.getFullYear();

    const isBeforeBirthday =
        today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
            today.getDate() < birthDate.getDate());

    return isBeforeBirthday ? yearsDifference - 1 : yearsDifference;
};

document.getElementById("ageDisplay").innerHTML = `${getAge("1998-07-11")}`;

})()