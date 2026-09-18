import { useEffect, useRef } from "react";
import { motion } from "motion/react";

interface Asteroid {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  size: number;
  color: string;
  opacity: number;
}

export function LiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Particle pool — increased density
    const colors = ["#A855F7", "#EC4899", "#3B82F6", "#06B6D4", "#F97316", "#F59E0B", "#8B5CF6"];
    const particles = Array.from({ length: 110 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      radius: Math.random() * 2.8 + 0.8,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.25,
      pulseSpeed: Math.random() * 0.025 + 0.008,
      pulseOffset: Math.random() * Math.PI * 2,
    }));

    // Falling Meteors — increased count
    const meteorColors = ["#A855F7", "#EC4899", "#3B82F6", "#06B6D4", "#F97316", "#FFFFFF", "#F59E0B"];
    const createAsteroid = (): Asteroid => ({
      x: Math.random() * (width + 400) - 200,
      y: -100,
      length: Math.random() * 130 + 70,
      speed: Math.random() * 9 + 5,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.25,
      size: Math.random() * 2.5 + 1.2,
      color: meteorColors[Math.floor(Math.random() * meteorColors.length)],
      opacity: Math.random() * 0.65 + 0.25,
    });

    const asteroids: Asteroid[] = Array.from({ length: 8 }, createAsteroid);

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Expanded cursor spotlight glow
      if (mx > 0 && my > 0) {
        const spotlight = ctx.createRadialGradient(mx, my, 0, mx, my, 320);
        spotlight.addColorStop(0, "rgba(168, 85, 247, 0.18)");
        spotlight.addColorStop(0.4, "rgba(236, 72, 153, 0.08)");
        spotlight.addColorStop(0.7, "rgba(6, 182, 212, 0.04)");
        spotlight.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = spotlight;
        ctx.fillRect(0, 0, width, height);
      }

      // Render floating constellation particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 180;

        if (dist < maxDist && dist > 0) {
          const force = (1 - dist / maxDist) * 2.8;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        const currentAlpha = p.alpha + Math.sin(frame * p.pulseSpeed + p.pulseOffset) * 0.18;
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(0.9, currentAlpha));
        ctx.shadowBlur = 14;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      }

      // Draw connections between nearby particles
      ctx.lineWidth = 0.7;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.16;
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Render falling meteors
      for (let i = 0; i < asteroids.length; i++) {
        const a = asteroids[i];
        a.x += Math.cos(a.angle) * a.speed;
        a.y += Math.sin(a.angle) * a.speed;

        const tailX = a.x - Math.cos(a.angle) * a.length;
        const tailY = a.y - Math.sin(a.angle) * a.length;

        const gradient = ctx.createLinearGradient(a.x, a.y, tailX, tailY);
        gradient.addColorStop(0, a.color);
        gradient.addColorStop(0.25, "rgba(236, 72, 153, 0.5)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = a.size;
        ctx.globalAlpha = a.opacity;
        ctx.shadowBlur = 18;
        ctx.shadowColor = a.color;
        ctx.stroke();

        // Glowing head
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.size * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowBlur = 24;
        ctx.shadowColor = a.color;
        ctx.fill();
        ctx.restore();

        if (a.y > height + 100 || a.x > width + 200 || a.x < -300) {
          asteroids[i] = createAsteroid();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* Canvas — particles & meteors */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Mesh Orb 1 — purple top-left */}
      <motion.div
        animate={{
          x: [0, 110, -70, 0],
          y: [0, -90, 80, 0],
          scale: [1, 1.3, 0.88, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 -left-40 w-[650px] h-[650px] rounded-full opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #A855F7 0%, #8B5CF6 40%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />

      {/* Mesh Orb 2 — pink right */}
      <motion.div
        animate={{
          x: [0, -100, 90, 0],
          y: [0, 100, -60, 0],
          scale: [1, 1.25, 0.92, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 -right-40 w-[700px] h-[700px] rounded-full opacity-25 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #EC4899 0%, #F472B6 40%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      {/* Mesh Orb 3 — cyan/blue bottom-left */}
      <motion.div
        animate={{
          x: [0, 70, -80, 0],
          y: [0, -60, 90, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-40 left-1/4 w-[750px] h-[750px] rounded-full opacity-22 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #3B82F6 0%, #06B6D4 40%, transparent 70%)",
          filter: "blur(110px)",
        }}
      />

      {/* Mesh Orb 4 — amber/orange bottom-right (new) */}
      <motion.div
        animate={{
          x: [0, -80, 60, 0],
          y: [0, -70, 50, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute -bottom-60 -right-20 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #F97316 0%, #F59E0B 35%, transparent 70%)",
          filter: "blur(95px)",
        }}
      />

      {/* Subtle noise texture for depth */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px",
        }}
      />
    </div>
  );
}
