import { useEffect, useRef, useState } from "react";
import "./App.css";
import studentChaos from "./assets/student-chaos.png";

/* ---- Intro: safety-net timer (must stay >= intro CSS timeline:
   introExit starts at 5.8s + 0.8s fade ≈ 6.6s). Guarantees the story
   exits even if animationend never fires (reduced motion, throttled
   tabs, embedded webviews). All exit paths set the same boolean, so
   extra late events after an early skip are harmless no-ops. ---- */

const INTRO_FALLBACK_MS = 7500;

/* ---- kyaScenehai! AI: prototype demo data (no backend — preset answers) ---- */

const AI_SUGGESTIONS = [
  "When is the hackathon registration due?",
  "Am I missing any forms today?",
  "Any AI/ML events this week?",
  "How do I join the ACM student chapter?",
];

const KYA_AI_ANSWERS = {
  "when is the hackathon registration due?":
    "Hackathon registration closes TOMORROW at 11:59 PM. Only 42 team slots remain — want me to add a reminder for tonight?",
  "am i missing any forms today?":
    "Yes — your Academic Form is still pending and closes today at 11:59 PM. Everything else is submitted or in progress.",
  "any ai/ml events this week?":
    "This week: AI/ML Study Sprint (16 Sep, 5 PM, ACM Lab) and a Cybersecurity Workshop tomorrow (15 Sep, 2 PM, IGDTUW). Both match your interests. 🤖",
  "how do i join the acm student chapter?":
    "ACM orientation is happening 14 Sep at 4 PM — just show up. Chapter sign-ups stay open all week on the club desk.",
};

const KYA_AI_FALLBACK =
  "Good question! In the full version, kyaScenehai! AI answers from live campus data — events, deadlines, forms and club notices. For this demo, tap one of the suggested questions above. ✨";

const URGENT_ITEM_COUNT = 2;

/* ---- Profile: notification preferences shown on the profile screen ---- */

const PREF_ROWS = [
  {
    key: "deadlineAlerts",
    label: "Deadline alerts",
    description: "Push + email when a form or registration is due soon.",
  },
  {
    key: "eventReminders",
    label: "Event reminders",
    description: "A heads-up one hour before events you saved.",
  },
  {
    key: "clubUpdates",
    label: "Club & society updates",
    description: "Announcements from the clubs you follow.",
  },
  {
    key: "weeklyDigest",
    label: "Weekly campus digest",
    description: "A Sunday recap of everything worth knowing.",
  },
];

/* ---- Calendar: demo schedule data (reuses existing Home/Explore items) ---- */

const CALENDAR_TODAY = 14; // demo "today" = Mon, 14 Sep 2026 (matches Home's Today/Tomorrow labels)
const CALENDAR_FIRST_WEEKDAY = 1; // Sep 1, 2026 is a Tuesday (MON-first grid)
const CALENDAR_MONTH_DAYS = 30;
const CALENDAR_WEEKDAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const CALENDAR_EVENTS = [
  { day: 14, kind: "event", tag: "CLUB", title: "ACM Orientation", when: "Today · 4:00 PM · IGDTUW" },
  { day: 14, kind: "deadline", tag: "ACADEMICS", title: "Academic Form Submission", when: "Today · 11:59 PM" },
  { day: 15, kind: "event", tag: "WORKSHOP", title: "Cybersecurity Workshop", when: "Tomorrow · 2:00 PM · IGDTUW" },
  { day: 15, kind: "deadline", tag: "HACKATHON", title: "Hackathon Registration", when: "Tomorrow · 11:59 PM" },
  { day: 16, kind: "event", tag: "AI / ML", title: "AI/ML Study Sprint", when: "Wed · 5:00 PM · ACM Lab" },
  { day: 18, kind: "event", tag: "EVENT", title: "Freshers' Sports Meet", when: "18 Sep · 10:00 AM · IGDTUW" },
];

const makeCalendarDayRange = (start, count) =>
  Array.from({ length: count }, (_, index) => start + index);

const CALENDAR_RANGES = [
  {
    key: "week",
    label: "This Week",
    icon: "🗓️",
    days: makeCalendarDayRange(CALENDAR_TODAY, 7),
  },
  {
    key: "days15",
    label: "15 Days",
    icon: "⏳",
    days: makeCalendarDayRange(CALENDAR_TODAY, 15),
  },
  {
    key: "month",
    label: "This Month",
    icon: "📅",
    days: makeCalendarDayRange(1, CALENDAR_MONTH_DAYS),
  },
];

const calendarEventsOn = (day) =>
  CALENDAR_EVENTS.filter((event) => event.day === day);

const calendarWeekdayOf = (day) =>
  CALENDAR_WEEKDAY_NAMES[(CALENDAR_FIRST_WEEKDAY + day - 1) % 7];

/* ---- Your Year: captured once during onboarding (interests step);
   single source of truth for Career Radar visibility. ---- */

const YEAR_OPTIONS = [
  { value: 1, label: "1st Year" },
  { value: 2, label: "2nd Year" },
  { value: 3, label: "3rd Year" },
  { value: 4, label: "4th Year" },
];

const CAREER_UNLOCK_YEAR = 2;
const YEAR_ORDINALS = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th" };

const yearLabelOf = (year) =>
  (YEAR_OPTIONS.find((option) => option.value === year) ?? YEAR_OPTIONS[0])
    .label;

const yearRangeLabel = (opportunity) =>
  `${YEAR_ORDINALS[opportunity.minYear]}–${YEAR_ORDINALS[opportunity.maxYear]} Year`;

/* ---- Career Radar: prototype demo listings (placeholder content only) ---- */

const CAREER_FILTERS = [
  { key: "all", label: "All" },
  { key: "internships", label: "Internships" },
  { key: "placements", label: "Placements" },
  { key: "sessions", label: "Sessions" },
];

const CAREER_OPPORTUNITIES = [
  {
    id: "zentech-sde",
    org: "ZenTech Solutions",
    title: "SDE Summer Internship · 2027 Batch",
    type: "Internship",
    category: "internships",
    minYear: 2,
    maxYear: 4,
    dueDay: 19,
    location: "Online application · Pune (hybrid, paid)",
    description:
      "8-week paid summer internship across the platform teams. One application per student; shortlisting happens from your kyaScenehai! profile.",
    action: "Apply",
  },
  {
    id: "pixelworks-ux",
    org: "PixelWorks Studio",
    title: "UI/UX Intern · Off-Campus Drive",
    type: "Off-campus Opportunity",
    category: "internships",
    minYear: 2,
    maxYear: 4,
    dueDay: 42,
    location: "Remote · Bengaluru optional",
    description:
      "Portfolio-first hiring for product design interns. Bring any two college event designs — you get direct feedback from the design lead either way.",
    action: "Apply",
  },
  {
    id: "cloudwave-drive",
    org: "CloudWave Systems",
    title: "Campus Placement Drive + Pre-Placement Talk",
    type: "Placement Drive",
    category: "placements",
    minYear: 3,
    maxYear: 4,
    dueDay: 16,
    location: "IGDTUW · Auditorium",
    description:
      "Full-stack and QA fresher roles for the 2026-27 batch. PPT at 10 AM, test and interviews the same day. Carry one printed resume.",
    action: "View details",
  },
  {
    id: "byteforge-hirewheel",
    org: "ByteForge",
    title: "Frontend Hire-Wheel · Direct Hiring",
    type: "Technical Hiring",
    category: "placements",
    minYear: 3,
    maxYear: 4,
    dueDay: 15,
    location: "Online assessment · 90 min",
    description:
      "Three-round loop in one evening: a React build task, a lightweight design chat, then the manager round. Offers released within 48 hours.",
    action: "Apply",
  },
  {
    id: "interview-panel",
    org: "kyaScenehai! Career Lab",
    title: "Cracking Product Interviews · Alumni Panel",
    type: "Career Session",
    category: "sessions",
    minYear: 2,
    maxYear: 4,
    dueDay: null,
    location: "ACM Seminar Hall · 20 Sep, 5 PM",
    description:
      "Four alumni from product companies reverse-interview a volunteer on stage, then open a resume feedback corner. Bring one printed CV.",
    action: "View details",
  },
  {
    id: "ey-campus-ama",
    org: "EY · Campus Recruiter",
    title: "Consulting Careers · Ask Me Anything",
    type: "Career Session",
    category: "sessions",
    minYear: 3,
    maxYear: 4,
    dueDay: 26,
    location: "Seminar Hall 2 + live stream",
    description:
      "Recruiter-led AMA on consulting and GDS tracks for pre-final and final year students. The recording is shared only with RSVP attendees.",
    action: "View details",
  },
];

const careerEligibleFor = (opportunity, year) =>
  year >= opportunity.minYear && year <= opportunity.maxYear;

/* ---- Timeline priority: computed off dueDay vs. the demo "today"
   (CALENDAR_TODAY = 14 Sep) so ordering/groups stay automatic. ---- */

const CAREER_PRIORITY_GROUPS = [
  {
    key: "closing",
    emoji: "🔴",
    label: "Closing Soon",
    note: "deadlines in the next 3 days",
  },
  {
    key: "week",
    emoji: "🟠",
    label: "This Week",
    note: "due within 7 days",
  },
  {
    key: "later",
    emoji: "🟣",
    label: "Coming Up",
    note: "room to prepare",
  },
];

const careerDaysOut = (opportunity) =>
  opportunity.dueDay === null ? null : opportunity.dueDay - CALENDAR_TODAY;

const careerDeadlineLabel = (opportunity) => {
  const daysOut = careerDaysOut(opportunity);

  if (daysOut === null) {
    return "No deadline";
  }

  if (daysOut <= 0) {
    return "Deadline today";
  }

  if (daysOut === 1) {
    return "Deadline tomorrow";
  }

  return `Closes in ${daysOut} days`;
};

const careerDateLabel = (opportunity) => {
  if (opportunity.dueDay === null) {
    return "No deadline · seats first-come";
  }

  return opportunity.dueDay <= 30
    ? `⏳ ${opportunity.dueDay} Sep`
    : `⏳ ${opportunity.dueDay - 30} Oct`;
};

const careerPriorityBucketOf = (opportunity) => {
  const daysOut = careerDaysOut(opportunity);

  if (daysOut !== null && daysOut <= 3) {
    return 0;
  }

  if (daysOut !== null && daysOut <= 7) {
    return 1;
  }

  return 2;
};

/* ---- My Tasks: prototype demo task board ---- */

const DEMO_TASKS = [
  {
    id: "hackathon-registration",
    title: "ACM Hackathon — Registration",
    related: "ACM Hackathon · 20 Sep · Seminar Hall",
    dueDay: 15,
    dueAt: "11:59 PM",
    status: "deadline-soon",
    baseStatus: "deadline-soon",
    progress: 40,
    baseProgress: 40,
    done: false,
  },
  {
    id: "microsoft-register",
    title: "Microsoft Session — Register",
    related: "Microsoft Careers Session · 19 Sep",
    dueDay: 18,
    dueAt: "6:00 PM",
    status: "to-do",
    baseStatus: "to-do",
    progress: 10,
    baseProgress: 10,
    done: false,
  },
  {
    id: "scholarship-form",
    title: "Scholarship Form — Complete",
    related: "State Merit Scholarship 2026",
    dueDay: 24,
    dueAt: null,
    status: "in-progress",
    baseStatus: "in-progress",
    progress: 60,
    baseProgress: 60,
    done: false,
  },
  {
    id: "club-application",
    title: "Club application",
    related: "ACM Student Chapter",
    dueDay: 13,
    dueAt: null,
    doneText: "Submitted · 12 Sep",
    status: "completed",
    baseStatus: "to-do",
    progress: 100,
    baseProgress: 0,
    done: true,
  },
  {
    id: "event-registration",
    title: "Event registration",
    related: "Cybersecurity Workshop · 15 Sep",
    dueDay: 13,
    dueAt: null,
    doneText: "Done · seat confirmed",
    status: "completed",
    baseStatus: "to-do",
    progress: 100,
    baseProgress: 0,
    done: true,
  },
];

const TASK_STATUS_LABELS = {
  "to-do": "To Do",
  "in-progress": "In Progress",
  "deadline-soon": "Deadline Soon",
  completed: "Completed",
};

const taskDaysOut = (task) => task.dueDay - CALENDAR_TODAY;

const taskDeadlineLabel = (task) => {
  const daysOut = taskDaysOut(task);
  const at = task.dueAt ? ` · ${task.dueAt}` : "";

  if (daysOut <= 0) {
    return `Due today${at}`;
  }

  if (daysOut === 1) {
    return `Due tomorrow${at}`;
  }

  return `Due in ${daysOut} days${at}`;
};

/* ---- Ambient "information flow" background: decorative canvas layer.
   Five cooperating layers, all motion on the same slow tempo:
   1. glowing ambient nodes drifting gently (thin links between them)
   2. small data motes flowing across the field
   3. bright packets travelling along active links
   4. notification pulses rippling around nodes
   5. periodic convergence: a share of the field drifts into one quiet
      signal point, scatters, and the flow resumes
   Rendered only on the signed-in pages, pointer-events: none, painted
   behind content (z-index:-1 in the .app stacking context). Vanilla 2D
   canvas, sprite-cached glow, rAF paused on hidden tab, static frame
   under prefers-reduced-motion, reduced density on touch devices. ---- */

const AMBIENT_PAGES = [
  "student-home",
  "explore",
  "ai",
  "calendar",
  "profile",
  "career-radar",
  "my-tasks",
];

const AMBIENT_LINK_DIST = 172;
const AMBIENT_CYCLE = 14;

function AmbientFlow() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || typeof canvas.getContext !== "function") {
      return undefined;
    }

    let ctx = null;

    try {
      ctx = canvas.getContext("2d");
    } catch {
      ctx = null;
    }

    if (!ctx) {
      return undefined;
    }

    const still =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const finePointer =
      window.matchMedia?.("(pointer: fine)").matches ?? false;
    const glyphs = ["✦", "◷", "✓", "▸", "○", "·", "✉", "◈"];

    let width = 0;
    let height = 0;
    let nodes = [];
    let motes = [];
    let packets = [];
    let glow = null;
    let raf = 0;
    let last = 0;
    let clock = 0;
    let nextPacket = 0;
    const mouse = { x: 0, y: 0, on: false };

    const makeGlowSprite = () => {
      const size = 64;
      const sprite = document.createElement("canvas");
      sprite.width = size;
      sprite.height = size;
      const sctx = sprite.getContext("2d");

      if (!sctx) {
        return null;
      }

      const grad = sctx.createRadialGradient(size / 2, size / 2, 1, size / 2, size / 2, size / 2);
      grad.addColorStop(0, "rgba(139, 92, 246, 0.55)");
      grad.addColorStop(0.35, "rgba(124, 92, 222, 0.22)");
      grad.addColorStop(1, "rgba(139, 92, 246, 0)");
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, size, size);

      return sprite;
    };

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      glow = makeGlowSprite();

      const compact = width < 768 || !finePointer;
      const area = width * height;
      const nodeCount = Math.round(
        Math.max(9, Math.min(16, area / 118000)) * (compact ? 0.6 : 1)
      );
      const moteCount = Math.round(
        Math.max(26, Math.min(52, area / 26000)) * (compact ? 0.6 : 1)
      );

      nodes = Array.from({ length: nodeCount }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.016,
        vy: (Math.random() - 0.5) * 0.016,
        r: 5.5 + Math.random() * 4.5,
        core: 1.7 + Math.random() * 1.1,
        bob: Math.random() * Math.PI * 2,
        pulsePhase: (index / nodeCount) * 5 + Math.random() * 1.5,
        converging: index % 2 === 0,
        glyph: index % 4 === 3 ? glyphs[index % glyphs.length] : null,
      }));

      motes = Array.from({ length: moteCount }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.03,
        vy: (Math.random() - 0.5) * 0.03,
        r: 0.8 + Math.random() * 1.1,
        alpha: 0.26 + Math.random() * 0.2,
        twinkle: Math.random() * Math.PI * 2,
        converging: index % 3 === 0,
        glyph: index % 9 === 4 ? glyphs[(index * 3) % glyphs.length] : null,
      }));

      packets = [];
      nextPacket = 0;
    };

    const pullStrength = () => {
      const cycle = clock % AMBIENT_CYCLE;

      if (cycle > 6.2 && cycle < 12.4) {
        return Math.sin(((cycle - 6.2) / 6.2) * Math.PI);
      }

      return 0;
    };

    const signalPoint = () => ({
      x: width * 0.5,
      y: height * (height > 700 ? 0.34 : 0.3),
    });

    const nudge = (p, dt, converging) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.x < -18) {
        p.x = width + 18;
      } else if (p.x > width + 18) {
        p.x = -18;
      }

      if (p.y < -18) {
        p.y = height + 18;
      } else if (p.y > height + 18) {
        p.y = -18;
      }

      if (mouse.on) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 170 && dist > 0.001) {
          const lean = (1 - dist / 170) * 0.011 * (dt / 16);
          p.x += dx * lean;
          p.y += dy * lean;
        }
      }

      const pulling = pullStrength();

      if (pulling > 0 && converging) {
        const signal = signalPoint();
        const t = pulling * 0.0045 * (dt / 16);
        p.x += (signal.x - p.x) * t;
        p.y += (signal.y - p.y) * t;
      }
    };

    const spawnPacket = () => {
      if (nodes.length < 2) {
        return;
      }

      for (let attempt = 0; attempt < 8; attempt += 1) {
        const a = nodes[Math.floor(Math.random() * nodes.length)];
        const b = nodes[Math.floor(Math.random() * nodes.length)];

        if (a === b) {
          continue;
        }

        const dist = Math.hypot(a.x - b.x, a.y - b.y);

        if (dist > 40 && dist < AMBIENT_LINK_DIST + 30) {
          packets.push({ a, b, t: 0, speed: 0.00035 + Math.random() * 0.0003 });

          return;
        }
      }
    };

    const paint = () => {
      ctx.clearRect(0, 0, width, height);
      const pulling = pullStrength();
      const signal = signalPoint();

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);

          if (dist < AMBIENT_LINK_DIST) {
            const near =
              mouse.on &&
              Math.hypot((a.x + b.x) / 2 - mouse.x, (a.y + b.y) / 2 - mouse.y) < 220;
            const alpha =
              (1 - dist / AMBIENT_LINK_DIST) * (near ? 0.16 : 0.1) +
              pulling * 0.05;

            ctx.strokeStyle = `rgba(118, 88, 220, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const p of packets) {
        const t = p.t;
        const x = p.a.x + (p.b.x - p.a.x) * t;
        const y = p.a.y + (p.b.y - p.a.y) * t;
        const fade = Math.sin(Math.PI * Math.min(Math.max(t, 0), 1));

        const tailT = Math.max(t - 0.06, 0);
        const tx = p.a.x + (p.b.x - p.a.x) * tailT;
        const ty = p.a.y + (p.b.y - p.a.y) * tailT;
        ctx.strokeStyle = `rgba(139, 92, 246, ${(0.18 * fade).toFixed(3)})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.fillStyle = `rgba(124, 70, 240, ${(0.52 * fade).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const p of motes) {
        const tw = 0.75 + Math.sin(clock * 1.1 + p.twinkle) * 0.25;

        if (p.glyph) {
          ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
          ctx.fillStyle = `rgba(124, 92, 222, ${(0.3 * tw).toFixed(3)})`;
          ctx.fillText(p.glyph, p.x, p.y);
        } else {
          ctx.fillStyle = `rgba(109, 59, 245, ${(p.alpha * tw).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (const n of nodes) {
        const breathe = 0.82 + Math.sin(clock * 0.9 + n.bob) * 0.18;

        if (glow) {
          const size = n.r * 5.4 * breathe;
          ctx.globalAlpha = 0.5 + pulling * 0.25;
          ctx.drawImage(glow, n.x - size / 2, n.y - size / 2, size, size);
          ctx.globalAlpha = 1;
        }

        if (n.glyph) {
          ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
          ctx.fillStyle = `rgba(92, 60, 200, ${(0.5 * breathe).toFixed(3)})`;
          ctx.fillText(n.glyph, n.x - 3, n.y + 3);
        } else {
          ctx.fillStyle = `rgba(96, 60, 205, ${(0.55 + breathe * 0.12).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.core, 0, Math.PI * 2);
          ctx.fill();
        }

        const ripple = (clock / 5 + n.pulsePhase) % 1;

        if (ripple < 0.3) {
          const k = ripple / 0.3;
          ctx.strokeStyle = `rgba(139, 92, 246, ${(0.3 * (1 - k)).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.core + 2 + k * 14, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      if (pulling > 0) {
        const ring = 16 + Math.sin(clock * 1.6) * 4;
        ctx.strokeStyle = `rgba(124, 70, 240, ${(0.4 * pulling).toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(signal.x, signal.y, ring, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(124, 70, 240, ${(0.18 * pulling).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(signal.x, signal.y, ring + 9 + Math.sin(clock * 1.1) * 3, 0, Math.PI * 2);
        ctx.stroke();

        if (glow) {
          ctx.globalAlpha = 0.85 * pulling;
          ctx.drawImage(glow, signal.x - 40, signal.y - 40, 80, 80);
          ctx.globalAlpha = 1;
        }

        ctx.fillStyle = `rgba(109, 59, 245, ${(0.7 * pulling).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(signal.x, signal.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = (now) => {
      const dt = Math.min(now - last, 48);
      last = now;
      clock += dt / 1000;

      for (const n of nodes) {
        nudge(n, dt, n.converging);
      }

      for (const m of motes) {
        nudge(m, dt, m.converging);
      }

      for (let i = packets.length - 1; i >= 0; i -= 1) {
        packets[i].t += packets[i].speed * dt;

        if (packets[i].t >= 1) {
          packets.splice(i, 1);
        }
      }

      if (clock > nextPacket && packets.length < 6) {
        spawnPacket();
        nextPacket = clock + 1.1 + Math.random() * 1.3;
      }

      paint();
      raf = window.requestAnimationFrame(step);
    };

    const startLoop = () => {
      if (typeof window.requestAnimationFrame === "function") {
        last = performance.now();
        raf = window.requestAnimationFrame(step);
      }
    };

    const onResize = () => {
      build();

      if (still) {
        paint();
      }
    };

    const onMouseMove = (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.on = true;
    };

    const onMouseLeave = () => {
      mouse.on = false;
    };

    const onVisibility = () => {
      if (document.hidden) {
        if (raf && typeof window.cancelAnimationFrame === "function") {
          window.cancelAnimationFrame(raf);
        }

        raf = 0;
      } else if (!still && raf === 0) {
        startLoop();
      }
    };

    build();
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    if (finePointer && !still) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseout", onMouseLeave);
    }

    if (still) {
      paint();
    } else {
      startLoop();
    }

    return () => {
      if (raf && typeof window.cancelAnimationFrame === "function") {
        window.cancelAnimationFrame(raf);
      }

      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseout", onMouseLeave);
    };
  }, []);

  return (
    <>
      <div className="ambient-wash ambient-wash-a" aria-hidden="true" />
      <div className="ambient-wash ambient-wash-b" aria-hidden="true" />
      <canvas ref={canvasRef} className="ambient-flow" aria-hidden="true" />
    </>
  );
}

function ProductBrand({ className = "" }) {
  return (
    <span className={`product-brand ${className}`} aria-label="kyaScenehai!">
      <span className="brand-kya">kya</span><span className="brand-scene">Scene</span><span className="brand-hai">hai</span><span className="brand-exclaim">!</span>
    </span>
  );
}
const STUDENT_EXPERIENCE_PAGES = [
  "student-home",
  "career-radar",
  "my-tasks",
  "explore",
  "calendar",
  "ai",
  "profile",
];

function StudentExperienceChrome({ page, setPage, setCalendarIntro }) {
  const items = [
    ["student-home", "🏠", "Home"],
    ["explore", "🔎", "Explore"],
    ["calendar", "📅", "Calendar"],
    ["profile", "👤", "Profile"],
  ];

  return (
    <>
      <aside className="student-side-nav" aria-label="Student navigation">
        <div className="student-side-nav-label">Navigate</div>
        {items.map(([target, icon, label]) => (
          <button
            key={target}
            type="button"
            className={`student-side-nav-item ${page === target ? "active" : ""}`}
            onClick={() => {
              if (target === "calendar") setCalendarIntro(true);
              setPage(target);
            }}
            aria-current={page === target ? "page" : undefined}
          >
            <span aria-hidden="true">{icon}</span>
            <strong>{label}</strong>
          </button>
        ))}
      </aside>
      <button
        type="button"
        className="puchho-button"
        onClick={() => setPage("ai")}
        aria-label="Open Puchho AI assistant"
      >
        <span className="puchho-face" aria-hidden="true">✦</span>
        <strong>Puchho?</strong>
        <span className="puchho-message">Jo bhi samajh aa raha hai, bas puchho. 😌</span>
      </button>
    </>
  );
}

function CareerArrival({ onSkip, onChoose }) {
  const bags = [
    ["🎒", "Internship Drives", "Find your next build-and-learn opportunity.", "internships"],
    ["💼", "Placement Drives", "Track the companies coming to campus.", "placements"],
    ["✨", "Sessions You Could Benefit From", "Talks, panels and career-ready guidance.", "sessions"],
  ];

  return (
    <section className="career-arrival" aria-label="Career opportunities arriving">
      <div className="career-arrival-sky" aria-hidden="true">
        <span className="career-star career-star-one">✦</span>
        <span className="career-star career-star-two">·</span>
        <span className="career-star career-star-three">✧</span>
      </div>
      <div className="career-arrival-copy">
        <span className="career-arrival-eyebrow">CAREER RADAR · LIVE DROP</span>
        <h2>Career opportunities have arrived. 🚚</h2>
        <p>Chal, career ka scene dekhte hain. 🚀</p>
      </div>
      <div className="career-delivery-road" aria-hidden="true">
        <div className="career-truck"><span>🚚</span><b>CAREER</b></div>
        <i className="career-road-line career-road-line-one" />
        <i className="career-road-line career-road-line-two" />
      </div>
      <div className="career-bag-staging">
        {bags.map(([icon, label, description, key], index) => (
          <button
            key={key}
            type="button"
            className={`career-bag career-bag-${index + 1}`}
            onClick={() => onChoose(key)}
          >
            <span className="career-bag-icon" aria-hidden="true">{icon}</span>
            <span className="career-bag-copy"><strong>{label}</strong><small>{description}</small></span>
            <span className="career-bag-arrow" aria-hidden="true">→</span>
          </button>
        ))}
      </div>
      <button type="button" className="career-arrival-skip" onClick={onSkip}>Skip arrival →</button>
    </section>
  );
}

function PlacementJourney({ journeyType = "placements", opportunities, studentYear, appliedOpportunities, onToggle }) {
  const journeyCopy = {
    placements: ["MILESTONE CAREER MAP", "Career ka scene sorted. 😎", "Follow the route from campus prep to the companies on your horizon.", "🚀", "Your career route"],
    internships: ["INTERNSHIP JOURNEY", "Internship ka scene dekhte hain 🚀", "Explore opportunities that can turn your next idea into experience.", "🧭", "Your opportunity route"],
    sessions: ["LEARNING & SESSION JOURNEY", "Kuch naya seekhne ka scene? ✨", "Follow the talks, workshops and career sessions that can move you forward.", "💡", "Your learning route"],
  }[journeyType];

  return (
    <section className={`career-journey career-journey-${journeyType}`} aria-label={`${journeyType} career journey`}>
      <div className="career-journey-intro">
        <span className="career-arrival-eyebrow">{journeyCopy[0]}</span>
        <h2>{journeyCopy[1]}</h2>
        <p>{journeyCopy[2]}</p>
        <span className="career-year-chip">Matched to {yearLabelOf(studentYear)}</span>
      </div>
      <div className="career-route">
        <div className="career-route-start"><span>{journeyCopy[3]}</span><strong>START</strong><small>{journeyCopy[4]}</small></div>
        {opportunities.map((opportunity, index) => {
          const eligible = careerEligibleFor(opportunity, studentYear);
          const applied = appliedOpportunities.includes(opportunity.id);
          return (
            <article key={opportunity.id} className={`career-milestone ${index === 0 ? "is-next" : ""} ${eligible ? "" : "is-out"}`}>
              <div className="career-milestone-node"><span>{journeyType === "sessions" ? "✦" : opportunity.dueDay ? "📍" : "✦"}</span></div>
              <div className="career-milestone-card">
                <div className="career-milestone-date">{careerDateLabel(opportunity).replace("⏳ ", "📅 ")}</div>
                <h3>{opportunity.org}</h3>
                <p className="career-milestone-role">{opportunity.title}</p>
                <p className="career-milestone-desc">{opportunity.description}</p>
                <div className="career-meta"><span>📍 {opportunity.location}</span><span>🎓 {yearRangeLabel(opportunity)}</span></div>
                <div className="career-card-foot">
                  <span className={`career-eligibility ${eligible ? "is-eligible" : "is-ineligible"}`}>{eligible ? "✓ You're eligible" : `For ${yearRangeLabel(opportunity)} only`}</span>
                  {eligible ? (
                    <button type="button" className={`career-action ${applied ? "applied" : ""}`} onClick={() => onToggle(opportunity.id)}>{applied ? "Marked applied ✓" : `${opportunity.action} →`}</button>
                  ) : <span className="career-action-locked">Opens in 3rd Year</span>}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [page, setPage] = useState("landing");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [exploreCategory, setExploreCategory] = useState(null);
  const [selectedDate, setSelectedDate] = useState(15);
  const [calendarRange, setCalendarRange] = useState("month");
  const [calendarIntro, setCalendarIntro] = useState(true);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState(() => {
    try {
      return window.sessionStorage.getItem("kyascene-calendar-note") || "";
    } catch {
      return "";
    }
  });
  const [savedNote, setSavedNote] = useState(() => {
    try {
      return window.sessionStorage.getItem("kyascene-calendar-note") || "";
    } catch {
      return "";
    }
  });

  // "Your Year" from onboarding — Career Radar gates on this single source.
  const [studentYear, setStudentYear] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [studentStep, setStudentStep] = useState(1);
  const [careerFilter, setCareerFilter] = useState("all");
  const [careerView, setCareerView] = useState("arrival");
  const [appliedOpportunities, setAppliedOpportunities] = useState([]);
  const [tasks, setTasks] = useState(DEMO_TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskToast, setTaskToast] = useState("");

  // Intro safety-net: if animationend is ever suppressed, still exit.
  useEffect(() => {
    if (!showIntro) {
      return undefined;
    }

    const introTimer = window.setTimeout(() => {
      setShowIntro(false);
    }, INTRO_FALLBACK_MS);

    return () => window.clearTimeout(introTimer);
  }, [showIntro]);

  const saveCalendarNote = () => {
    const trimmedNote = noteText.trim();
    if (!trimmedNote) return;
    setSavedNote(trimmedNote);
    setNoteText(trimmedNote);
    setNoteOpen(false);
    try {
      window.sessionStorage.setItem("kyascene-calendar-note", trimmedNote);
    } catch {
      // Session storage is best-effort in this static prototype.
    }
  };

  // AI assistant (prototype only — preset answers, no backend)
  const [aiMessages, setAiMessages] = useState([
    {
      from: "ai",
      text:
        "Hi! I'm your kyaScenehai! assistant ✦ Ask me about deadlines, events, forms, clubs or what's trending on campus.",
    },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const aiEndRef = useRef(null);

  // Profile preferences (prototype only — not persisted)
  const [profilePrefs, setProfilePrefs] = useState({
    deadlineAlerts: true,
    eventReminders: true,
    clubUpdates: false,
    weeklyDigest: false,
  });

  const togglePref = (key) => {
    setProfilePrefs((current) => ({ ...current, [key]: !current[key] }));
  };

  const askKya = (question) => {
    const text = question.trim();

    if (!text || aiTyping) {
      return;
    }

    setAiInput("");

    setAiMessages((current) => [...current, { from: "user", text }]);
    setAiTyping(true);

    const answer =
      KYA_AI_ANSWERS[text.toLowerCase()] || KYA_AI_FALLBACK;

    window.setTimeout(() => {
      setAiMessages((current) => [
        ...current,
        { from: "ai", text: answer },
      ]);
      setAiTyping(false);
    }, 900);
  };

  useEffect(() => {
    aiEndRef.current?.scrollIntoView?.({ block: "end" });
  }, [aiMessages, aiTyping]);

  useEffect(() => {
    if (page !== "career-radar") {
      return undefined;
    }

    const resetTimer = window.setTimeout(() => setCareerView("arrival"), 0);
    const arrivalTimer = window.setTimeout(() => setCareerView("bags"), 3400);
    return () => {
      window.clearTimeout(resetTimer);
      window.clearTimeout(arrivalTimer);
    };
  }, [page]);

  useEffect(() => {
    if (page !== "calendar") {
      return undefined;
    }

    const resetTimer = window.setTimeout(() => setCalendarIntro(true), 0);
    const revealTimer = window.setTimeout(() => setCalendarIntro(false), 2700);
    return () => {
      window.clearTimeout(resetTimer);
      window.clearTimeout(revealTimer);
    };
  }, [page]);

  // Calendar — active range + visible list (prototype demo data only)
  const activeCalendarRange =
    CALENDAR_RANGES.find((range) => range.key === calendarRange) ||
    CALENDAR_RANGES[0];

  const visibleCalendarEvents =
    selectedDate === null
      ? CALENDAR_EVENTS.filter((event) =>
          activeCalendarRange.days.includes(event.day)
        )
      : calendarEventsOn(selectedDate);

  const careerVisible = studentYear >= CAREER_UNLOCK_YEAR;

  const visibleOpportunities = CAREER_OPPORTUNITIES.filter(
    (opportunity) =>
      careerFilter === "all" || opportunity.category === careerFilter
  )
    .slice()
    .sort(
      (a, b) =>
        (a.dueDay ?? Number.POSITIVE_INFINITY) -
        (b.dueDay ?? Number.POSITIVE_INFINITY)
    );

  const careerPriorityGroups = CAREER_PRIORITY_GROUPS.map((group, index) => ({
    ...group,
    opportunities: visibleOpportunities.filter(
      (opportunity) => careerPriorityBucketOf(opportunity) === index
    ),
  })).filter((group) => group.opportunities.length > 0);

  const activeTasks = tasks
    .filter((task) => !task.done)
    .sort((a, b) => a.dueDay - b.dueDay);

  const completedTasks = tasks.filter((task) => task.done);
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;

  const openTaskCount = activeTasks.length;

  const toggleTaskDone = (taskId) => {
    const currentTask = tasks.find((task) => task.id === taskId);
    const willComplete = currentTask && !currentTask.done;
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        return task.done
          ? {
              ...task,
              done: false,
              status: task.baseStatus,
              progress: task.baseProgress,
            }
          : { ...task, done: true, status: "completed", progress: 100 };
      })
    );
    setTaskToast(willComplete ? "Done! 🎉 Your task is marked complete." : "Task reopened — you can pick it up again.");
    window.setTimeout(() => setTaskToast(""), 2600);
  };

  const toggleOpportunityApplied = (opportunityId) => {
    setAppliedOpportunities((current) =>
      current.includes(opportunityId)
        ? current.filter((id) => id !== opportunityId)
        : [...current, opportunityId]
    );
  };

  const toggleInterest = (interest) => {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    );
  };

  const handleIntroEnd = (event) => {
    if (
      event.target === event.currentTarget &&
      event.animationName === "introExit"
    ) {
      setShowIntro(false);
    }
  };

  return (
    <div className="app">

      {AMBIENT_PAGES.includes(page) ? <AmbientFlow /> : null}
      {!showIntro && STUDENT_EXPERIENCE_PAGES.includes(page) ? (
        <StudentExperienceChrome page={page} setPage={setPage} setCalendarIntro={setCalendarIntro} />
      ) : null}

      {/* ================= INTRO STORY ================= */}

      {showIntro && (
        <div
          className="intro-screen"
          onAnimationEnd={handleIntroEnd}
        >
          <div className="story-notification notification-1">
            🔔 Hackathon Registration
          </div>

          <div className="story-notification notification-2">
            📢 Club Event
          </div>

          <div className="story-notification notification-3">
            ⏰ Deadline Tomorrow
          </div>

          <div className="story-notification notification-4">
            📚 Academic Notice
          </div>

          <div className="story-notification notification-5">
            💬 Society Update
          </div>

          <img
            src={studentChaos}
            alt="Student overwhelmed by campus notifications"
            className="student-chaos"
          />

          <div className="problem-text">
            <p>Too much information.</p>
            <strong>Too little clarity.</strong>
          </div>

          <div className="brand-reveal">
            <ProductBrand />
          </div>

          <button
            type="button"
            className="skip-intro"
            aria-label="Skip intro"
            onClick={() => setShowIntro(false)}
          >
            Skip intro →
          </button>
        </div>
      )}

      {/* ================= LANDING PAGE ================= */}

      {!showIntro && page === "landing" && (
        <div className="landing-page">
          <div className="campus-network" aria-hidden="true">
            <svg className="campus-network-lines" viewBox="0 0 1200 900" preserveAspectRatio="none">
              <defs>
                <linearGradient id="network-lavender" x1="0" x2="1">
                  <stop offset="0" stopColor="#927cf2" stopOpacity="0" />
                  <stop offset=".5" stopColor="#927cf2" stopOpacity=".48" />
                  <stop offset="1" stopColor="#53cfc0" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="network-teal" x1="0" x2="1">
                  <stop offset="0" stopColor="#53cfc0" stopOpacity="0" />
                  <stop offset=".5" stopColor="#53cfc0" stopOpacity=".38" />
                  <stop offset="1" stopColor="#d873d7" stopOpacity="0" />
                </linearGradient>
              </defs>
              <g className="network-lines">
                <path d="M-50 210 C150 110 210 315 390 220 S630 95 810 185 1020 130 1250 245" />
                <path d="M-30 640 C150 520 265 690 420 575 S700 515 835 630 1040 560 1230 470" />
                <path d="M110 40 C180 225 330 250 470 395 S800 405 930 250 1080 190 1160 60" />
                <path d="M50 830 C170 740 245 760 350 690 S590 665 710 760 960 820 1160 690" />
                <path d="M170 340 C300 380 335 460 460 485 S700 470 850 390 1030 350 1180 410" />
              </g>
              <g className="network-nodes">
                <circle cx="120" cy="170" r="5" /><circle cx="245" cy="286" r="4" />
                <circle cx="390" cy="220" r="6" /><circle cx="560" cy="138" r="4" />
                <circle cx="810" cy="185" r="5" /><circle cx="1015" cy="160" r="4" />
                <circle cx="135" cy="610" r="5" /><circle cx="420" cy="575" r="6" />
                <circle cx="660" cy="545" r="4" /><circle cx="835" cy="630" r="5" />
                <circle cx="1060" cy="540" r="6" /><circle cx="350" cy="690" r="4" />
                <circle cx="710" cy="760" r="5" /><circle cx="1000" cy="790" r="4" />
              </g>
            </svg>
            <span className="network-icon network-icon-calendar">▦</span>
            <span className="network-icon network-icon-bell">♢</span>
            <span className="network-icon network-icon-trophy">♛</span>
            <span className="network-icon network-icon-laptop">⌘</span>
            <span className="network-icon network-icon-people">•••</span>
            <span className="network-icon network-icon-ticket">◇</span>
            <span className="network-icon network-icon-clock">◷</span>
            <span className="network-icon network-icon-code">&lt;/&gt;</span>
            <span className="network-icon network-icon-star">✦</span>
            <span className="network-icon network-icon-pin">⌖</span>
            <span className="network-traveler traveler-one" />
            <span className="network-traveler traveler-two" />
            <span className="network-traveler traveler-three" />
            <div className="network-data-labels">
              <span className="data-label data-event">EVENT</span>
              <span className="data-label data-deadline">DEADLINE</span>
              <span className="data-label data-club">CLUB</span>
              <span className="data-label data-hackathon">HACKATHON</span>
              <span className="data-label data-workshop">WORKSHOP</span>
              <span className="data-label data-notice">NOTICE</span>
              <span className="data-label data-opportunity">OPPORTUNITY</span>
              <span className="data-label data-meetup">MEETUP</span>
              <span className="data-label data-registration">REGISTRATION</span>
              <span className="data-label data-news">CAMPUS NEWS</span>
            </div>
            <div className="network-particles">
              <i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
            </div>
          </div>
          <div className="landing-orbit landing-orbit-one" aria-hidden="true" />
          <div className="landing-orbit landing-orbit-two" aria-hidden="true" />
          <div className="campus-float float-calendar" aria-hidden="true">▦</div>
          <div className="campus-float float-bell" aria-hidden="true">♢</div>
          <div className="campus-float float-ticket" aria-hidden="true">✦</div>
          <div className="campus-float float-people" aria-hidden="true">•••</div>

          <div className="landing-intro">
            <div className="landing-brand-pill"><ProductBrand /> <i>·</i> your campus, decoded</div>
            <h1>Where do you belong <span>on campus?</span></h1>
            <p>Choose your experience and let kyaScenehai! organize the campus chaos for you.</p>
          </div>

          <div className="role-container" aria-label="Choose your kyaScenehai! experience">
            <article className="role-card role-card-student">
              <div className="role-card-topline"><span>01</span><span className="role-arrow">↗</span></div>
              <div className="role-art role-art-student" aria-hidden="true">
                <div className="role-art-glow" />
                <div className="role-figure">🎓</div>
                <span className="art-chip art-chip-one">✦</span>
                <span className="art-chip art-chip-two">▦</span>
              </div>
              <div className="role-card-copy">
                <p className="role-kicker">FOR THE CURIOUS</p>
                <h2>Student</h2>
                <p className="role-description">Discover what matters to you.</p>
                <ul className="role-points">
                  <li>Events &amp; workshops</li>
                  <li>Competitions &amp; hackathons</li>
                  <li>Deadlines &amp; announcements</li>
                  <li>Personalized opportunities</li>
                </ul>
              </div>
              <button onClick={() => setPage("student-login")}>
                Enter my student space <span>→</span>
              </button>
            </article>

            <article className="role-card role-card-organization">
              <div className="role-card-topline"><span>02</span><span className="role-arrow">↗</span></div>
              <div className="role-art role-art-organization" aria-hidden="true">
                <div className="role-art-glow" />
                <div className="role-figure">🏛️</div>
                <span className="art-chip art-chip-one">♧</span>
                <span className="art-chip art-chip-two">✦</span>
              </div>
              <div className="role-card-copy">
                <p className="role-kicker">FOR THE CONNECTORS</p>
                <h2>Organization</h2>
                <p className="role-description">Bring your campus community together.</p>
                <ul className="role-points">
                  <li>Create events</li>
                  <li>Reach students</li>
                  <li>Share announcements</li>
                  <li>Manage registrations</li>
                </ul>
              </div>
              <button onClick={() => { window.location.href = "/organization-setup.html"; }}>
                Enter organization space <span>→</span>
              </button>
            </article>
          </div>

          <p className="bottom-text"><span>✦</span> One campus. Less chaos. <span>✦</span></p>
        </div>
      )}

      {/* ================= STUDENT ONBOARDING ================= */}

      {!showIntro && (page === "student-login" || page === "interests") && (
        <div className="student-onboarding-page">
          <div className="student-onboarding-shell">
            <div className="student-progress" aria-label={`Onboarding step ${page === "interests" ? 2 : studentStep} of 2`}>
              <div className={studentStep === 2 || page === "interests" ? "progress-step complete" : "progress-step active"}>
                <span>{studentStep === 2 || page === "interests" ? "✓" : "01"}</span>
                <strong>Personal Details</strong>
              </div>
              <div className="progress-line" />
              <div className={studentStep === 2 || page === "interests" ? "progress-step active" : "progress-step"}>
                <span>02</span>
                <strong>Your Interests</strong>
              </div>
            </div>

            <div className={`student-onboarding-viewport step-${studentStep === 2 || page === "interests" ? 2 : 1}`}>
              <div className="student-onboarding-track">
                <section className="student-panel student-panel-details" aria-hidden={studentStep !== 1 && page !== "interests"}>
                  <div className="student-panel-orb" aria-hidden="true" />
                  <div className="onboarding-logo"><ProductBrand /></div>
                  <p className="step-text">STEP 1 OF 2</p>
                  <h1>Hey, let’s get you set up 👋</h1>
                  <p className="onboarding-subtitle">Tell us a little about yourself so kyaScenehai! can personalize your campus experience.</p>
                  <form onSubmit={(event) => { event.preventDefault(); setStudentStep(2); }}>
                    <div className="input-group">
                      <label htmlFor="student-name">What should we call you?</label>
                      <input id="student-name" type="text" value={studentName} onChange={(event) => setStudentName(event.target.value)} placeholder="Enter your name" required />
                    </div>
                    <div className="input-group">
                      <label htmlFor="college-id">College ID</label>
                      <input id="college-id" type="text" value={collegeId} onChange={(event) => setCollegeId(event.target.value)} placeholder="Enter your college ID" required />
                      <small>Demo onboarding only ✨ Nothing is checked, saved or sent anywhere.</small>
                    </div>
                    <button className="onboarding-button" type="submit">Continue <span>→</span></button>
                  </form>
                  <button className="back-button" type="button" onClick={() => setPage("landing")}>← Back</button>
                  <div className="panel-done" aria-hidden="true"><span>✓</span> Done</div>
                </section>

                <section className="student-panel student-panel-interests" aria-hidden={studentStep !== 2 && page !== "interests"}>
                  <div className="student-panel-orb" aria-hidden="true" />
                  <div className="onboarding-logo"><ProductBrand /></div>
                  <p className="step-text">STEP 2 OF 2</p>
                  <h1>Now, enhance your experience ✨</h1>
                  <p className="onboarding-subtitle">Tell us what you’re interested in so we can surface the things that matter to you.</p>
                  <div className="year-select">
                    <p className="year-select-label">Your Year</p>
                    <div className="year-options" role="group" aria-label="Your Year">
                      {YEAR_OPTIONS.map((option) => (
                        <button key={option.value} type="button" className={`year-chip ${studentYear === option.value ? "selected" : ""}`} aria-pressed={studentYear === option.value} onClick={() => setStudentYear(option.value)}>{option.label}</button>
                      ))}
                    </div>
                    <p className="year-select-note">{studentYear ? (studentYear === 1 ? "Start exploring your campus experience ✨" : "Start exploring your campus experience + Career Radar ✨") : "Choose your year to personalize your campus experience."}</p>
                  </div>
                  <div className="interest-heading"><p>What are you interested in?</p><span>{selectedInterests.length} selected</span></div>
                  <div className="interest-grid student-interest-grid">
                    {[
                      ["Coding", "💻"], ["AI / ML", "🤖"], ["Web Development", "🌐"], ["Hackathons", "🏆"],
                      ["Design", "🎨"], ["Entrepreneurship", "🚀"], ["Data Science", "📊"], ["Cybersecurity", "🔐"],
                      ["Public Speaking", "🎤"], ["Academics", "📚"], ["Cultural Activities", "🎭"], ["Sports", "🏅"],
                    ].map(([interest, icon]) => (
                      <button key={interest} type="button" className={`interest-chip ${selectedInterests.includes(interest) ? "selected" : ""}`} aria-pressed={selectedInterests.includes(interest)} onClick={() => toggleInterest(interest)}><span>{icon}</span>{interest}<b>✓</b></button>
                    ))}
                  </div>
                  <button className="onboarding-button" type="button" disabled={!studentYear} onClick={() => setPage("student-home")}>Build my scene <span>→</span></button>
                  <button className="back-button" type="button" onClick={() => { setPage("student-login"); setStudentStep(1); }}>← Back to personal details</button>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STUDENT HOME ================= */}

      {!showIntro && page === "student-home" && (
        <div className="student-home">

          <header className="home-header">

            <div>
              <p className="home-greeting">
                Hi, {studentName || "Student"} 👋
              </p>

              <h1>
                Here’s what needs your attention.
              </h1>
            </div>

            <button className="notification-button">
              🔔
            </button>

          </header>

          {/* NEEDS YOUR ATTENTION */}

          <section className="home-section">

            <div className="section-heading">

              <div className="section-title">
                <span className="section-dot"></span>
                <div className="urgent-heading-copy">
                  <h2>Arre bhai, late ho jayega! 😭</h2>
                  <p>Ye kaam pending hai — kar lo jaldi. 👀</p>
                </div>
              </div>

              <span className="section-count"><span className="urgency-pulse" aria-hidden="true" />{URGENT_ITEM_COUNT} things need you</span>

            </div>

            <div className="announcement-card urgent-card">

              <div className="card-top">

                <span className="category-tag">
                  HACKATHON
                </span>

                <span className="deadline-tag">
                  Tomorrow
                </span>

              </div>

              <h3>
                Hackathon Registration
              </h3>

              <p>
                Registration closes tomorrow. Don't miss your chance to participate.
              </p>

              <div className="card-info-row">
                <span>📍 IGDTUW</span>
                <span>⏰ Deadline tomorrow</span>
              </div>

              <button className="card-action">
                Register now <span>→</span>
              </button>

            </div>

            <div className="announcement-card urgent-card">

              <div className="card-top">

                <span className="category-tag academic-tag">
                  ACADEMICS
                </span>

                <span className="deadline-tag today-tag">
                  Today
                </span>

              </div>

              <h3>
                Academic Form Submission
              </h3>

              <p>
                Your form needs to be submitted before the deadline.
              </p>

              <div className="card-info-row">
                <span>📚 Academics</span>
                <span>⏰ 11:59 PM</span>
              </div>

              <button className="card-action">
                Submit form <span>→</span>
              </button>

            </div>

          </section>

          {/* ================= YOUR ACTION HUB (prototype features) ================= */}

          <section className="action-hub-section">

            <div className="section-heading">

              <div className="section-title">
                <span className="calendar-dot">🎯</span>
                <h2>Your Action Hub</h2>
              </div>

              <span className="action-hub-year">
                for {yearLabelOf(studentYear)}
              </span>

            </div>

            <div className="action-hub-grid">

              {careerVisible && (
                <button
                  type="button"
                  className="action-hub-card career-hub-card"
                  onClick={() => setPage("career-radar")}
                >
                  <span className="action-hub-icon">💼</span>
                  <span className="action-hub-copy">
                    <strong>Career Radar</strong>
                    <small>Internships, placements &amp; career opportunities</small>
                  </span>
                  <span className="action-hub-go" aria-hidden="true">→</span>
                </button>
              )}

              <button
                type="button"
                className="action-hub-card tasks-hub-card"
                onClick={() => setPage("my-tasks")}
              >
                <span className="action-hub-icon">✅</span>
                <span className="action-hub-copy">
                  <strong>My Tasks</strong>
                  <small>Track what you need to do</small>
                </span>
                {openTaskCount > 0 && (
                  <span className="action-hub-badge">{openTaskCount} open</span>
                )}
                <span className="action-hub-go" aria-hidden="true">→</span>
              </button>

            </div>

          </section>

          {/* COMING UP */}

          <section className="home-section coming-up-section">

            <div className="section-heading">

              <div className="section-title">
                <span className="calendar-dot">📅</span>
                <h2>Coming Up</h2>
              </div>

              <button className="see-all-button">
                See all →
              </button>

            </div>

            <div className="upcoming-list">

              <div className="upcoming-item">

                <div className="date-box">
                  <strong>14</strong>
                  <span>SEP</span>
                </div>

                <div className="upcoming-info">
                  <h3>ACM Orientation</h3>
                  <p>Today • 4:00 PM</p>
                </div>

                <span className="upcoming-arrow">
                  →
                </span>

              </div>

              <div className="upcoming-item">

                <div className="date-box">
                  <strong>15</strong>
                  <span>SEP</span>
                </div>

                <div className="upcoming-info">
                  <h3>Cybersecurity Workshop</h3>
                  <p>Tomorrow • 2:00 PM</p>
                </div>

                <span className="upcoming-arrow">
                  →
                </span>

              </div>

              <div className="upcoming-item">

                <div className="date-box">
                  <strong>18</strong>
                  <span>SEP</span>
                </div>

                <div className="upcoming-info">
                  <h3>Freshers' Sports Meet</h3>
                  <p>18 Sep • 10:00 AM</p>
                </div>

                <span className="upcoming-arrow">
                  →
                </span>

              </div>

            </div>

          </section>

          {/* BOTTOM NAVIGATION */}

          

        </div>
      )}

      {/* ================= CAREER RADAR ================= */}

      {!showIntro && page === "career-radar" && (
        <div className="career-page">

          <div className="career-hero">

            <button
              type="button"
              className="career-back"
              onClick={() => setPage("student-home")}
            >
              ← Home
            </button>

            <div className="career-hero-copy">
              <h2>💼 Career Radar</h2>
              <p>Internships, placements &amp; career opportunities</p>
            </div>

            {careerVisible && (
              <span className="career-year-chip">
                Matched to {yearLabelOf(studentYear)}
              </span>
            )}

          </div>

          {!careerVisible ? (

            <div className="career-locked">
              <h3>Career Radar unlocks from 2nd Year</h3>
              <p>
                You&rsquo;re in {yearLabelOf(studentYear)} — for now, kyaScenehai!
                keeps you on clubs, workshops and build-ups. Careers content
                opens automatically from your second year.
              </p>
              <button
                type="button"
                className="career-locked-back"
                onClick={() => setPage("student-home")}
              >
                Back to Home
              </button>
            </div>

          ) : careerView === "arrival" ? (
            <CareerArrival
              onSkip={() => setCareerView("bags")}
              onChoose={(key) => {
                setCareerFilter(key);
                setCareerView(key === "placements" ? "placement" : key);
              }}
            />
          ) : (
            <>
              {careerView === "bags" && (
                <section className="career-bag-choice-screen" aria-label="Choose a Career Radar collection">
                  <div className="career-bag-choice-heading">
                    <span className="career-arrival-eyebrow">YOUR CAREER DROP IS READY</span>
                    <h2>Career ka scene sorted. 😎</h2>
                    <p>Pick a route and start exploring what is waiting for you.</p>
                  </div>
                  <div className="career-bag-choice-grid">
                    {[
                        ["🎒", "Internship Drives", "Opportunities worth checking out", "internships"],
                      ["💼", "Placement Drives", "A milestone map of campus hiring", "placements"],
                      ["✨", "Sessions You Could Benefit From", "Talks and guidance matched to you", "sessions"],
                    ].map(([icon, label, note, key]) => (
                      <button key={key} type="button" className="career-bag-choice" onClick={() => { setCareerFilter(key); setCareerView(key === "placements" ? "placement" : key); }}>
                        <span className="career-bag-choice-icon">{icon}</span><strong>{label}</strong><small>{note}</small><span>Explore →</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {["placement", "internships", "sessions"].includes(careerView) ? (
                <>
                  <button type="button" className="career-journey-back" onClick={() => setCareerView("bags")}>← Career collections</button>
                  <PlacementJourney
                    journeyType={careerView === "placement" ? "placements" : careerView}
                    opportunities={CAREER_OPPORTUNITIES.filter((opportunity) => opportunity.category === (careerView === "placement" ? "placements" : careerView)).sort((a, b) => (a.dueDay ?? Infinity) - (b.dueDay ?? Infinity))}
                    studentYear={studentYear}
                    appliedOpportunities={appliedOpportunities}
                    onToggle={toggleOpportunityApplied}
                  />
                </>
              ) : careerView !== "bags" ? (
                <>
                  <div className="career-collection-banner"><span>{careerFilter === "internships" ? "🎒" : "✨"}</span><div><strong>{careerFilter === "internships" ? "Internship Drives" : "Sessions You Could Benefit From"}</strong><small>{careerFilter === "internships" ? "Opportunities worth checking out" : "Career guidance that matches your next move"}</small></div><button type="button" onClick={() => setCareerView("bags")}>All collections →</button></div>
              <div
                className="career-filters"
                role="group"
                aria-label="Filter opportunities"
              >
                {CAREER_FILTERS.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    className={`career-filter-tab ${
                      careerFilter === filter.key ? "active" : ""
                    }`}
                    onClick={() => setCareerFilter(filter.key)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <p className="career-sort-note">
                <span aria-hidden="true">⚡</span>
                Sorted by urgency — nearest deadline first
              </p>

              <div className="career-list">
                {careerPriorityGroups.map((group) => (
                  <section key={group.key} className="career-group">
                    <div className="career-group-heading">
                      <h3>
                        <span aria-hidden="true">{group.emoji}</span>{" "}
                        {group.label}
                      </h3>
                      <span className="career-group-count">
                        {group.opportunities.length}
                      </span>
                      <small>{group.note}</small>
                    </div>

                    {group.opportunities.map((opportunity) => {
                      const eligible = careerEligibleFor(
                        opportunity,
                        studentYear
                      );
                      const applied = appliedOpportunities.includes(
                        opportunity.id
                      );

                      return (
                        <article
                          key={opportunity.id}
                          className={`career-card ${
                            group.key === "closing" && eligible
                              ? "career-card-urgent"
                              : ""
                          } ${eligible ? "" : "career-card-out"}`}
                        >
                          <div className="career-card-top">
                            <span className="career-type-badge">
                              {opportunity.type}
                            </span>
                            <span
                              className={`career-deadline-flag flag-${group.key}`}
                            >
                              {careerDeadlineLabel(opportunity)}
                            </span>
                          </div>

                          <h3 className="career-org">{opportunity.org}</h3>
                          <p className="career-role">{opportunity.title}</p>
                          <p className="career-desc">
                            {opportunity.description}
                          </p>

                          <div className="career-meta">
                            <span>📍 {opportunity.location}</span>
                            <span>{careerDateLabel(opportunity)}</span>
                            <span>🎓 {yearRangeLabel(opportunity)}</span>
                          </div>

                          <div className="career-card-foot">
                            <span
                              className={`career-eligibility ${
                                eligible ? "is-eligible" : "is-ineligible"
                              }`}
                            >
                              {eligible
                                ? "✓ You're eligible"
                                : `For ${yearRangeLabel(opportunity)} only`}
                            </span>
                            {eligible ? (
                              <button
                                type="button"
                                className={`career-action ${
                                  applied ? "applied" : ""
                                }`}
                                onClick={() =>
                                  toggleOpportunityApplied(opportunity.id)
                                }
                              >
                                {applied
                                  ? "Marked applied ✓"
                                  : `${opportunity.action} →`}
                              </button>
                            ) : (
                              <span className="career-action-locked">
                                Opens in{" "}
                                {opportunity.minYear === 3 ? "3rd" : "2nd"} Year
                              </span>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </section>
                ))}
              </div>

              <p className="career-demo-note">
                Prototype demo content — these are placeholder listings for
                the kyaScenehai! UI, not real live openings.
              </p>
                </>
              ) : null}
            </>

          )}

          

        </div>
      )}

      {/* ================= MY TASKS ================= */}

      {!showIntro && page === "my-tasks" && (
        <div className="tasks-page tasks-live-page">
          <div className="tasks-live-hero">
            <button type="button" className="tasks-back" onClick={() => setPage("student-home")}>← Home</button>
            <div className="tasks-live-hero-copy">
              <span className="tasks-live-kicker">YOUR CAMPUS ACTIVITY CENTER</span>
              <h2>☑️ My Tasks</h2>
              <p>Keep track. Stay ahead. See what happens next. ✨</p>
            </div>
            <div className="tasks-live-progress" aria-label={`${completedTasks.length} of ${tasks.length} tasks completed`}>
              <span>{completedTasks.length}/{tasks.length}</span>
              <div><i style={{ width: `${tasks.length ? (completedTasks.length / tasks.length) * 100 : 0}%` }} /></div>
              <small>scene progress</small>
            </div>
          </div>

          {taskToast && <div className="task-toast" role="status">{taskToast}</div>}

          <div className="tasks-live-grid">
            <section className="tasks-live-group tasks-needs-action">
              <div className="tasks-live-group-heading"><div><span>🔥 NEEDS ACTION</span><h3>Bas ye kaam pending hain.</h3></div><b>{activeTasks.filter((task) => task.status === "to-do" || task.status === "deadline-soon").length}</b></div>
              <div className="tasks-live-cards">
                {activeTasks.filter((task) => task.status === "to-do" || task.status === "deadline-soon").map((task) => (
                  <button type="button" key={task.id} className={`task-live-card ${task.status === "deadline-soon" ? "is-urgent" : ""}`} onClick={() => setSelectedTaskId(task.id)}>
                    <span className="task-live-icon">{task.title.toLowerCase().includes("hackathon") ? "🎯" : task.title.toLowerCase().includes("session") ? "🎤" : "📝"}</span>
                    <span className="task-live-card-main"><span className={`task-status task-status-${task.status}`}>{TASK_STATUS_LABELS[task.status]}</span><strong>{task.title}</strong><small>{task.related}</small><span className="task-live-meta">{taskDeadlineLabel(task)} · {task.progress}% ready</span><span className="task-live-bar"><i style={{ width: `${task.progress}%` }} /></span></span>
                    <span className="task-live-arrow">→</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="tasks-live-group tasks-in-progress">
              <div className="tasks-live-group-heading"><div><span>⏳ IN PROGRESS</span><h3>Jo start kiya hai, woh yahan hai.</h3></div><b>{activeTasks.filter((task) => task.status === "in-progress").length}</b></div>
              <div className="tasks-live-cards">
                {activeTasks.filter((task) => task.status === "in-progress").map((task) => (
                  <button type="button" key={task.id} className="task-live-card is-progress" onClick={() => setSelectedTaskId(task.id)}>
                    <span className="task-live-icon">📚</span><span className="task-live-card-main"><span className="task-status task-status-in-progress">In Progress</span><strong>{task.title}</strong><small>{task.related}</small><span className="task-live-meta">{task.progress}% complete · {taskDeadlineLabel(task)}</span><span className="task-live-bar"><i style={{ width: `${task.progress}%` }} /></span></span><span className="task-live-arrow">→</span>
                  </button>
                ))}
                {activeTasks.filter((task) => task.status === "in-progress").length === 0 && <div className="tasks-live-empty">Nothing in progress right now. Nice pace. 😎</div>}
              </div>
            </section>

            <section className="tasks-live-group tasks-updates">
              <div className="tasks-live-group-heading"><div><span>📢 UPDATES & RESULTS</span><h3>What changed lately.</h3></div><b>{completedTasks.length}</b></div>
              <div className="tasks-live-cards">
                {completedTasks.map((task) => (
                  <button type="button" key={task.id} className="task-live-card is-complete" onClick={() => setSelectedTaskId(task.id)}>
                    <span className="task-live-icon">✅</span><span className="task-live-card-main"><span className="task-status task-status-completed">Completed</span><strong>{task.title}</strong><small>{task.related}</small><span className="task-live-outcome">{task.doneText || "Completed"}</span><span className="task-live-next">Open activity →</span></span><span className="task-live-arrow">→</span>
                  </button>
                ))}
                {completedTasks.length === 0 && <div className="tasks-live-empty">No updates yet. Your next milestone will show here.</div>}
              </div>
            </section>
          </div>

          <section className="tasks-completed-strip">
            <div><span>✅ COMPLETED</span><h3>Ye wala ho gaya. Nice. 😎</h3></div>
            <div className="tasks-completed-pills">{completedTasks.map((task) => <button type="button" key={task.id} onClick={() => setSelectedTaskId(task.id)}>✓ {task.title}</button>)}</div>
          </section>

          <p className="tasks-demo-note">Demo board for the prototype — task states reset on reload.</p>

          {selectedTask && (
            <div className="task-modal-backdrop" role="presentation" onClick={() => setSelectedTaskId(null)}>
              <section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title" onClick={(event) => event.stopPropagation()}>
                <button type="button" className="task-modal-close" aria-label="Close task activity" onClick={() => setSelectedTaskId(null)}>×</button>
                <span className="tasks-live-kicker">YOUR ACTIVITY TIMELINE</span>
                <div className="task-modal-heading"><span className="task-modal-icon">{selectedTask.done ? "✅" : "🎯"}</span><div><span className={`task-status task-status-${selectedTask.status}`}>{TASK_STATUS_LABELS[selectedTask.status]}</span><h2 id="task-modal-title">{selectedTask.title}</h2><p>{selectedTask.related}</p></div></div>
                <div className="task-modal-progress"><div><span>Progress</span><b>{selectedTask.progress}%</b></div><div className="task-live-bar"><i style={{ width: `${selectedTask.progress}%` }} /></div></div>
                <div className="task-activity-timeline">
                  <div className="task-activity-step done"><span>✓</span><div><strong>Task added to your campus scene</strong><small>{selectedTask.related}</small></div></div>
                  <div className={`task-activity-step ${selectedTask.done ? "done" : "current"}`}><span>{selectedTask.done ? "✓" : "●"}</span><div><strong>{selectedTask.done ? "Task completed" : "Your next action"}</strong><small>{selectedTask.done ? (selectedTask.doneText || "Completed") : "This task is still waiting for your action."}</small></div></div>
                  <div className="task-activity-step"><span>○</span><div><strong>Next update</strong><small>No result or outcome update is recorded for this task yet.</small></div></div>
                </div>
                <div className="task-modal-footer"><span>{selectedTask.done ? "You're officially done here." : taskDeadlineLabel(selectedTask)}</span><button type="button" className="task-modal-cta" onClick={() => toggleTaskDone(selectedTask.id)}>{selectedTask.done ? "Reopen task" : "Mark as done ✓"}</button></div>
              </section>
            </div>
          )}
        </div>
      )}

      {/* ================= EXPLORE ================= */}

{!showIntro && page === "explore" && (
  <div className="app-page explore-page">

    {/* ================= CATEGORY SCREEN ================= */}

    {exploreCategory !== null ? (
      <>
        <header className="category-page-header">

          <button
            className="back-to-explore"
            onClick={() => setExploreCategory(null)}
          >
            ← Back to Explore
          </button>

          <p className="eyebrow">
            EXPLORE
          </p>

          <h1>
            {exploreCategory}
          </h1>

          <p>
            Discover what's happening in this category.
          </p>

        </header>

        <section className="explore-section category-results-section">

          <div className="explore-cards">

            {/* HACKATHONS */}

            {exploreCategory === "Hackathons" && (
              <div className="explore-card">

                <div className="card-top">
                  <span className="card-category">
                    HACKATHON
                  </span>

                  <span className="card-time">
                    New
                  </span>
                </div>

                <h3>
                  Microsoft Imagine Cup
                </h3>

                <p>
                  Build an innovative technology solution and compete globally.
                </p>

                <div className="card-meta">
                  💻 Hackathon
                </div>

                <div className="card-meta">
                  📅 Registration open
                </div>

              </div>
            )}

            {/* EVENTS */}

            {exploreCategory === "Events" && (
              <div className="explore-card">

                <div className="card-top">
                  <span className="card-category">
                    EVENT
                  </span>

                  <span className="card-time">
                    Tomorrow
                  </span>
                </div>

                <h3>
                  Cybersecurity Workshop
                </h3>

                <p>
                  Learn practical cybersecurity skills with hands-on activities.
                </p>

                <div className="card-meta">
                  📅 15 Sep · 2:00 PM
                </div>

                <div className="card-meta">
                  📍 IGDTUW
                </div>

              </div>
            )}

            {/* CLUBS */}

            {exploreCategory === "Clubs" && (
              <div className="explore-card">

                <div className="card-top">
                  <span className="card-category">
                    CLUB
                  </span>

                  <span className="card-time">
                    Trending
                  </span>
                </div>

                <h3>
                  ACM Orientation
                </h3>

                <p>
                  Meet the team and discover what's happening at ACM IGDTUW.
                </p>

                <div className="card-meta">
                  📅 14 Sep · 4:00 PM
                </div>

                <div className="card-meta">
                  📍 IGDTUW
                </div>

              </div>
            )}

            {/* ACADEMICS */}

            {exploreCategory === "Academics" && (
              <div className="explore-card">

                <div className="card-top">
                  <span className="card-category">
                    ACADEMICS
                  </span>

                  <span className="card-time">
                    Today
                  </span>
                </div>

                <h3>
                  Academic Form Submission
                </h3>

                <p>
                  Submit your academic form before the deadline.
                </p>

                <div className="card-meta">
                  📚 Academic update
                </div>

                <div className="card-meta">
                  ⏰ Today · 11:59 PM
                </div>

              </div>
            )}

            {/* INTERNSHIPS */}

            {exploreCategory === "Internships" && (
              <div className="explore-card">

                <div className="card-top">
                  <span className="card-category">
                    INTERNSHIP
                  </span>

                  <span className="card-time">
                    New
                  </span>
                </div>

                <h3>
                  Summer Internship Opportunity
                </h3>

                <p>
                  Explore a new internship opportunity for students.
                </p>

                <div className="card-meta">
                  💼 Internship
                </div>

                <div className="card-meta">
                  📅 Applications open
                </div>

              </div>
            )}

            {/* COMPETITIONS */}

            {exploreCategory === "Competitions" && (
              <div className="explore-card">

                <div className="card-top">
                  <span className="card-category">
                    COMPETITION
                  </span>

                  <span className="card-time">
                    New
                  </span>
                </div>

                <h3>
                  Campus Design Challenge
                </h3>

                <p>
                  Showcase your creativity in this campus-wide competition.
                </p>

                <div className="card-meta">
                  🏆 Competition
                </div>

                <div className="card-meta">
                  📅 Registration open
                </div>

              </div>
            )}

          </div>

        </section>
      </>

    ) : (

      /* ================= MAIN EXPLORE SCREEN ================= */

      <>

        <header className="explore-header">

          <div>
            <p className="eyebrow">
              DISCOVER
            </p>

            <h1>
              Explore campus.
            </h1>

            <p>
              Find what's happening around you.
            </p>
          </div>

        </header>


        {/* SEARCH */}

        <div className="explore-search">

          <span>🔍</span>

          <input
            type="text"
            placeholder="Search campus updates..."
          />

        </div>


        {/* CATEGORIES */}

        <section className="explore-section">

          <div className="section-heading">
            <h2>
              Browse by category
            </h2>
          </div>

          <div className="category-grid">

            <button
              className="category-card"
              onClick={() => setExploreCategory("Hackathons")}
            >
              <span className="category-icon">
                🎯
              </span>

              <span>
                Hackathons
              </span>
            </button>


            <button
              className="category-card"
              onClick={() => setExploreCategory("Events")}
            >
              <span className="category-icon">
                🎉
              </span>

              <span>
                Events
              </span>
            </button>


            <button
              className="category-card"
              onClick={() => setExploreCategory("Clubs")}
            >
              <span className="category-icon">
                🏫
              </span>

              <span>
                Clubs
              </span>
            </button>


            <button
              className="category-card"
              onClick={() => setExploreCategory("Academics")}
            >
              <span className="category-icon">
                📚
              </span>

              <span>
                Academics
              </span>
            </button>


            <button
              className="category-card"
              onClick={() => setExploreCategory("Internships")}
            >
              <span className="category-icon">
                💼
              </span>

              <span>
                Internships
              </span>
            </button>


            <button
              className="category-card"
              onClick={() => setExploreCategory("Competitions")}
            >
              <span className="category-icon">
                🏆
              </span>

              <span>
                Competitions
              </span>
            </button>

          </div>

        </section>


        {/* FOR YOU */}

        <section className="explore-section">

          <div className="section-heading">

            <h2>
              ⭐ For You
            </h2>

          </div>

          <div className="explore-cards">

            <div className="explore-card">

              <div className="card-top">

                <span className="card-category">
                  EVENT
                </span>

                <span className="card-time">
                  Tomorrow
                </span>

              </div>

              <h3>
                Cybersecurity Workshop
              </h3>

              <p>
                Learn practical cybersecurity skills with hands-on activities.
              </p>

              <div className="card-meta">
                📅 15 Sep · 2:00 PM
              </div>

              <div className="card-meta">
                📍 IGDTUW
              </div>

            </div>


            <div className="explore-card">

              <div className="card-top">

                <span className="card-category">
                  HACKATHON
                </span>

                <span className="card-time">
                  New
                </span>

              </div>

              <h3>
                Microsoft Imagine Cup
              </h3>

              <p>
                Build an innovative technology solution and compete globally.
              </p>

              <div className="card-meta">
                💻 Hackathon
              </div>

              <div className="card-meta">
                📅 Registration open
              </div>

            </div>


            <div className="explore-card">

              <div className="card-top">

                <span className="card-category">
                  CLUB
                </span>

                <span className="card-time">
                  Trending
                </span>

              </div>

              <h3>
                ACM Orientation
              </h3>

              <p>
                Meet the team and discover what's happening at ACM IGDTUW.
              </p>

              <div className="card-meta">
                📅 14 Sep · 4:00 PM
              </div>

              <div className="card-meta">
                📍 IGDTUW
              </div>

            </div>

          </div>

        </section>


        {/* TRENDING */}

        <section className="explore-section">

          <div className="section-heading">

            <h2>
              🔥 Trending on Campus
            </h2>

          </div>

          <div className="explore-cards">

            <div className="explore-card">

              <div className="card-top">

                <span className="card-category">
                  CLUB
                </span>

              </div>

              <h3>
                Design Society
              </h3>

              <p>
                New recruitment and upcoming design activities.
              </p>

            </div>


            <div className="explore-card">

              <div className="card-top">

                <span className="card-category">
                  EVENT
                </span>

              </div>

              <h3>
                Freshers' Sports Meet
              </h3>

              <p>
                Register for the upcoming sports meet.
              </p>

              <div className="card-meta">
                📅 18 Sep · 10:00 AM
              </div>

            </div>

          </div>

        </section>

      </>

    )}


    {/* ================= BOTTOM NAVIGATION ================= */}

    
  </div>
)}

{/* ================= CALENDAR ================= */}

{!showIntro && page === "calendar" && (
  <div className="app-page calendar-page">

 	    {calendarIntro && (
      <div className="calendar-diary-transition" aria-live="polite">
        <div className="calendar-mascot-scene" aria-hidden="true">
          <div className="calendar-mascot">
            <span className="mascot-hair"></span>
            <span className="mascot-eye mascot-eye-left"></span><span className="mascot-eye mascot-eye-right"></span>
            <span className="mascot-smile"></span><span className="mascot-body"></span>
            <span className="mascot-arm mascot-arm-left"></span><span className="mascot-arm mascot-arm-right"></span>
            <span className="mascot-leg mascot-leg-left"></span><span className="mascot-leg mascot-leg-right"></span>
            <span className="mascot-diary">✦</span>
          </div>
        </div>
        <div className="calendar-diary-card">
          <span className="calendar-diary-tab">A NOTE FOR YOUR CAMPUS SCENE</span>
          <div className="calendar-diary-ring ring-one"></div><div className="calendar-diary-ring ring-two"></div>
          <span className="calendar-diary-icon">▤</span>
          <p>Got something important?<br /><strong>Write it down here so you don't miss it. ✨</strong></p>
          <small>Calendar khol, scene sorted. 😎</small>
        </div>
        <button type="button" className="calendar-diary-skip" onClick={() => setCalendarIntro(false)}>Skip →</button>
	      </div>
	    )}

    <button
      type="button"
      className="calendar-note-fab"
      onClick={() => setNoteOpen(true)}
      aria-label="Write a note"
      title="Write a note ✍️"
    >
      <span aria-hidden="true">📖</span>
      <i aria-hidden="true">✦</i>
    </button>

    {noteOpen && (
      <div className="calendar-note-backdrop" role="presentation" onClick={() => setNoteOpen(false)}>
        <section className="calendar-note-popup" role="dialog" aria-modal="true" aria-labelledby="calendar-note-title" onClick={(event) => event.stopPropagation()}>
          <button type="button" className="calendar-note-close" onClick={() => setNoteOpen(false)} aria-label="Close note">×</button>
          <span className="calendar-note-kicker">MY LITTLE CAMPUS DIARY</span>
          <h2 id="calendar-note-title">Write it down ✍️</h2>
          <p>Got something important? Save it here so you don't miss it.</p>
          <textarea
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
            placeholder="Write your note..."
            rows={5}
            autoFocus
          />
          <div className="calendar-note-footer">
            {savedNote && <small>Saved for this session ✓</small>}
            <button type="button" className="calendar-note-save" onClick={saveCalendarNote} disabled={!noteText.trim()}>Save Note</button>
          </div>
        </section>
      </div>
    )}

	    <header className="calendar-header">

      <div>
        <p className="eyebrow">
          YOUR SCHEDULE
        </p>

        <h1>
          Calendar
        </h1>

        <p>
          Keep track of what's coming up.
        </p>
      </div>

    </header>


    {/* RANGE SELECTOR */}

    <div className="range-selector" role="tablist" aria-label="Calendar time range">

      {CALENDAR_RANGES.map((range) => (

        <button
          key={range.key}
          role="tab"
          aria-selected={calendarRange === range.key}
          className={`range-tab ${
            calendarRange === range.key ? "active" : ""
          }`}
          onClick={() => setCalendarRange(range.key)}
        >

          <span className="range-icon">
            {range.icon}
          </span>

          {range.label}

        </button>

      ))}

    </div>


    {calendarRange === "month" ? (

      /* MONTH GRID */

      <section className="calendar-section">

        <div className="calendar-month-header">

          <button className="month-arrow">
            ←
          </button>

          <h2>
            September 2026
          </h2>

          <button className="month-arrow">
            →
          </button>

        </div>


        {/* WEEK DAYS */}

        <div className="calendar-weekdays">

          {CALENDAR_WEEKDAY_NAMES.map((name) => (

            <span key={name}>
              {name}
            </span>

          ))}

        </div>


        {/* DATES */}

        <div className="calendar-grid">

          {Array.from({ length: CALENDAR_FIRST_WEEKDAY }, (_, index) => (

            <span key={`blank-${index}`} className="calendar-empty"></span>

          ))}

          {Array.from(
            { length: CALENDAR_MONTH_DAYS },
            (_, index) => index + 1
          ).map((day) => {

            const hasEvent = calendarEventsOn(day).length > 0;
            const dayEvents = calendarEventsOn(day);

            return hasEvent ? (

              <button
                key={day}
                className={`calendar-date has-event ${
                  selectedDate === day ? "selected" : ""
                }`}
                onClick={() =>
                  setSelectedDate(selectedDate === day ? null : day)
                }
              >
                <strong>{day}</strong>
                <span className="calendar-date-markers" aria-hidden="true">
                  {dayEvents.map((event) => <i key={event.title} className={`calendar-date-marker marker-${event.kind}`}></i>)}
                </span>
              </button>

            ) : (

              <span key={day}>
                {day}
              </span>

            );

          })}

        </div>

      </section>

    ) : (

      /* UPCOMING DAYS RAIL (This Week / 15 Days) */

      <section className="calendar-section">

        <div className="calendar-month-header">

          <h2>
            {activeCalendarRange.label} · Sep {activeCalendarRange.days[0]}–
            {activeCalendarRange.days[activeCalendarRange.days.length - 1]}
          </h2>

        </div>


        <div className="day-rail">

          {activeCalendarRange.days.map((day) => {

            const dayEvents = calendarEventsOn(day);

            return (

              <button
                key={day}
                className={`rail-day ${
                  selectedDate === day ? "selected" : ""
                } ${day === CALENDAR_TODAY ? "is-today" : ""}`}
                onClick={() =>
                  setSelectedDate(selectedDate === day ? null : day)
                }
              >

                <span className="rail-day-name">
                  {calendarWeekdayOf(day)}
                </span>

                <strong>
                  {day}
                </strong>

                <span className="rail-day-dots">

                  {dayEvents.map((event) => (

                    <i
                      key={event.title}
                      className={`rail-dot rail-dot-${event.kind}`}
                    ></i>

                  ))}

                </span>

              </button>

            );

          })}

        </div>

      </section>

    )}


    {/* UPCOMING EVENTS */}

    <section className="calendar-events-section">

      <div className="section-heading">

        <div className="section-title">
          <span className="calendar-dot">
            📅
          </span>

          <h2>
            {selectedDate === null ? "Upcoming" : `Sep ${selectedDate}`}
          </h2>
        </div>

        {selectedDate !== null && (

          <button
            className="see-all-button"
            onClick={() => setSelectedDate(null)}
          >
            Show all {activeCalendarRange.label} →
          </button>

        )}

      </div>


      <div className="calendar-event-list">

        {visibleCalendarEvents.map((event) => (

          <div
            key={`${event.day}-${event.title}`}
            className={`calendar-event-card ${
              event.kind === "deadline" ? "deadline-event-card" : ""
            }`}
          >

            <div className="calendar-event-date">
              <strong>{event.day}</strong>
              <span>SEP</span>
            </div>

            <div className="calendar-event-info">

              <span className="calendar-event-tag">

                <i className={`kind-dot kind-dot-${event.kind}`}></i>

                {event.tag}

              </span>

              <h3>
                {event.title}
              </h3>

              <p>
                {event.when}
              </p>

            </div>

            <span className="calendar-event-arrow">
              →
            </span>

          </div>

        ))}

        {visibleCalendarEvents.length === 0 && (

          <div className="calendar-empty-day">

            <strong>
              Nothing scheduled
            </strong>

            <p>
              No events or deadlines on this day. Enjoy the quiet 🌿
            </p>

          </div>

        )}

      </div>

    </section>


    {/* BOTTOM NAVIGATION */}

    

   </div>
)}

{/* ================= AI ASSISTANT ================= */}

{!showIntro && page === "ai" && (
  <div className="app-page ai-page">

    <header className="ai-header">

      <div>
        <p className="eyebrow">
          ✦ kyaScenehai! AI
        </p>

        <h1>
          Ask anything about campus.
        </h1>

        <p>
          Your assistant for events, deadlines, forms and club updates.
        </p>
      </div>

    </header>


    <section className="ai-chat-card">

      <div className="ai-chat-viewport" aria-live="polite">

        <div className="ai-chat-messages">

          {aiMessages.map((message, index) => (

            <div
              key={index}
              className={`ai-chat-row ${
                message.from === "user" ? "from-user" : "from-ai"
              }`}
            >

              <span className="ai-chat-avatar">
                {message.from === "user" ? "🎓" : "✦"}
              </span>

              <div className="ai-bubble">
                {message.text}
              </div>

            </div>

          ))}

          {aiTyping && (

            <div className="ai-chat-row from-ai">

              <span className="ai-chat-avatar">
                ✦
              </span>

              <div className="ai-bubble ai-typing">
                <i></i>
                <i></i>
                <i></i>
              </div>

            </div>

          )}

          <div ref={aiEndRef}></div>

        </div>

      </div>


      {/* SUGGESTED QUESTIONS */}

      <div className="ai-suggestions">

        {AI_SUGGESTIONS.map((suggestion) => (

          <button
            key={suggestion}
            className="ai-chip"
            onClick={() => askKya(suggestion)}
          >
            {suggestion}
          </button>

        ))}

      </div>


      {/* COMPOSER */}

      <div className="ai-composer">

        <input
          type="text"
          placeholder="Ask kyaScenehai! AI…"
          value={aiInput}
          onChange={(event) => setAiInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              askKya(aiInput);
            }
          }}
        />

        <button
          className="ai-send"
          onClick={() => askKya(aiInput)}
          disabled={!aiInput.trim()}
        >
          Send ✦
        </button>

      </div>

    </section>


    <p className="ai-demo-note">
      Prototype mode — replies are preset for the demo. The full version answers from live campus data.
    </p>


    {/* BOTTOM NAVIGATION */}

    

  </div>
)}

{/* ================= PROFILE ================= */}

{!showIntro && page === "profile" && (
  <div className="app-page profile-page">

    <section className="profile-hero">

      <div className="profile-avatar">
        🎓
      </div>

      <div className="profile-id">

        <h1>
          Student
        </h1>

        <p>
          IGDTUW · B.Tech CSE · 3rd Year
        </p>

        <span className="verified-tag">
          Demo profile
        </span>

      </div>

      <button
        className="sign-out-button"
        onClick={() => setPage("landing")}
      >
        Sign out
      </button>

    </section>


    {/* QUICK STATS */}

    <section className="profile-stats">

      <div className="stat-tile">
        <strong>3</strong>
        <span>Upcoming events</span>
      </div>

      <div className="stat-tile">
        <strong>{selectedInterests.length}</strong>
        <span>Interest picks</span>
      </div>

      <div className="stat-tile">
        <strong>12</strong>
        <span>Saved notices</span>
      </div>

    </section>


    {/* MY INTERESTS */}

    <section className="profile-section">

      <div className="section-heading">

        <div className="section-title">

          <span className="section-dot interest-dot"></span>

          <h2>
            My Interests
          </h2>

        </div>

        <button
          className="see-all-button"
          onClick={() => setPage("interests")}
        >
          Edit →
        </button>

      </div>

      {selectedInterests.length > 0 ? (

        <div className="profile-chips">

          {selectedInterests.map((interest) => (

            <span
              key={interest}
              className="profile-chip"
            >
              {interest}
            </span>

          ))}

        </div>

      ) : (

        <p className="profile-empty">
          No interests picked yet — tap “Edit →” and build your kyaScenehai!. ✨
        </p>

      )}

    </section>


    {/* NOTIFICATIONS */}

    <section className="profile-section">

      <div className="section-heading">

        <div className="section-title">

          <span className="calendar-dot">🔔</span>

          <h2>
            Notifications
          </h2>

        </div>

      </div>

      <div className="prefs-card">

        {PREF_ROWS.map((row) => (

          <div
            key={row.key}
            className="pref-row"
          >

            <div className="pref-text">

              <strong>
                {row.label}
              </strong>

              <p>
                {row.description}
              </p>

            </div>

            <button
              type="button"
              className={`pref-toggle ${
                profilePrefs[row.key] ? "on" : ""
              }`}
              aria-pressed={profilePrefs[row.key]}
              onClick={() => togglePref(row.key)}
            >
              <span></span>
            </button>

          </div>

        ))}

      </div>

    </section>


    {/* ACCOUNT */}

    <section className="profile-section">

      <div className="section-heading">

        <div className="section-title">

          <span className="calendar-dot">👤</span>

          <h2>
            Account
          </h2>

        </div>

      </div>

      <div className="account-card">

        <div className="account-row">

          <div>

            <strong>College account</strong>

            <p>Demo account · student@example.com</p>

          </div>

          <span className="account-row-arrow">→</span>

        </div>

        <div className="account-row">

          <div>

            <strong>Connected apps</strong>

            <p>Calendar · Email</p>

          </div>

          <span className="account-row-arrow">→</span>

        </div>

        <div className="account-row">

          <div>

            <strong>Account security</strong>

            <p>Last reviewed 2 months ago</p>

          </div>

          <span className="account-row-arrow">→</span>

        </div>

      </div>

    </section>


    <p className="profile-foot-note">
      That's everything. See you on campus! 🌿
    </p>


    {/* BOTTOM NAVIGATION */}

    

  </div>
)}

</div>
  );
}

export default App;
