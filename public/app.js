/* app.js
 - Animación de nieve en canvas
 - (Sólo UI/animación, la lógica en index.html maneja firestore)
*/

(function() {
  const canvas = document.getElementById('snowCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  let flakes = [];
  const FLAKE_COUNT = Math.max(60, Math.floor((w * h) / 9000)); // escala con pantalla

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function init() {
    flakes = [];
    for (let i = 0; i < FLAKE_COUNT; i++) {
      flakes.push({
        x: rand(0, w),
        y: rand(0, h),
        r: rand(0.8, 3.8),
        d: rand(0.5, 1.8),
        vx: rand(-0.4, 0.6),
        sway: rand(0, Math.PI * 2)
      });
    }
  }

  function resize() {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    init();
  }

  function draw() {
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    for (let i = 0; i < flakes.length; i++) {
      const f = flakes[i];
      ctx.moveTo(f.x, f.y);
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    }
    ctx.fill();
    update();
    requestAnimationFrame(draw);
  }

  function update() {
    const t = Date.now() / 1000;
    for (let i = 0; i < flakes.length; i++) {
      const f = flakes[i];
      f.y += f.d + f.r * 0.12;
      f.sway += 0.01;
      f.x += Math.sin(f.sway + t * 0.5) * 0.6 + f.vx;
      if (f.y > h + 10) {
        f.y = -10;
        f.x = rand(0, w);
      }
      if (f.x > w + 10) f.x = -10;
      if (f.x < -10) f.x = w + 10;
    }
  }

  addEventListener('resize', resize);
  resize();
  draw();
})();
