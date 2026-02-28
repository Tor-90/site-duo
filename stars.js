// Shared starry background animation
function initStarryBackground() {
  const canvas = document.getElementById('starry-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  // Stars
  const starCount = 250;
  const stars = [];
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 0.05,
      vy: (Math.random() - 0.5) * 0.05,
    });
  }

  // Shooting stars
  const shootingStars = [];

  function spawnShootingStar() {
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;
    shootingStars.push({
      x: Math.random() * width * 0.8 + width * 0.1,
      y: Math.random() * height * 0.3,
      length: 60 + Math.random() * 80,
      speed: 6 + Math.random() * 6,
      angle: angle,
      opacity: 1,
      life: 0,
      maxLife: 60 + Math.random() * 40,
    });
  }

  let frame = 0;

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Gradient background
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.max(width, height) * 0.7
    );
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#050510');
    gradient.addColorStop(1, '#000005');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw stars
    for (const star of stars) {
      const twinkle = Math.sin(frame * star.twinkleSpeed + star.twinkleOffset);
      const currentOpacity = star.opacity * (0.5 + twinkle * 0.5);

      star.x += star.vx;
      star.y += star.vy;
      if (star.x < 0) star.x = width;
      if (star.x > width) star.x = 0;
      if (star.y < 0) star.y = height;
      if (star.y > height) star.y = 0;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
      ctx.fill();

      if (star.radius > 1) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${currentOpacity * 0.15})`;
        ctx.fill();
      }
    }

    // Draw shooting stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      ss.life++;
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;

      const fadeIn = Math.min(ss.life / 10, 1);
      const fadeOut = Math.max(1 - ss.life / ss.maxLife, 0);
      ss.opacity = fadeIn * fadeOut;

      const tailX = ss.x - Math.cos(ss.angle) * ss.length;
      const tailY = ss.y - Math.sin(ss.angle) * ss.length;

      const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
      grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${ss.opacity})`);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(ss.x, ss.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${ss.opacity})`;
      ctx.fill();

      if (ss.life >= ss.maxLife) {
        shootingStars.splice(i, 1);
      }
    }

    // Random shooting star spawn
    if (Math.random() < 0.008) {
      spawnShootingStar();
    }

    frame++;
    requestAnimationFrame(draw);
  }

  draw();

  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  });
}

document.addEventListener('DOMContentLoaded', initStarryBackground);
