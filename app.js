document.addEventListener("DOMContentLoaded", () => {
  // Run each initializer in isolation so a failure in one (e.g. a component
  // that doesn't exist on the current page) never blocks the rest.
  [
    initNavigation,
    initRevealMotion,
    initTabs,
    initHoverLens,
    initHomeHeroCarousel,
    initWorkflowCarousel,
    initPlatformDemoVideo,
    initPlatformRdLoopPreview,
    initPlatformPeelArchitecture,
    initCooperationMatrix,
    initHomeUpdatesTicker,
    initIndustryInteraction,
    initRingPlatform,
    initRadarCompare,
    initScaleTabs,
  ].forEach((init) => {
    try {
      init();
    } catch (error) {
      console.error(error);
    }
  });
});

function initNavigation() {
  const navToggle = document.querySelector("[data-nav-toggle]");

  if (!navToggle) return;

  navToggle.addEventListener("click", () => {
    document.body.classList.toggle("nav-open");
  });
}

function initRevealMotion() {
  const revealItems = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function initTabs() {
  document.querySelectorAll("[data-tabs]").forEach((tabGroup) => {
    const tabs = [...tabGroup.querySelectorAll("[data-tab]")];
    const panels = [...tabGroup.querySelectorAll(".task-panels article")];

    const activate = (index) => {
      tabs.forEach((item) => item.classList.remove("active"));
      panels.forEach((panel) => panel.classList.remove("active"));

      tabs[index]?.classList.add("active");
      panels[index]?.classList.add("active");
    };

    tabs.forEach((tab) => {
      const index = Number(tab.dataset.tab);
      // Hover to reveal (desktop / pointer devices)
      tab.addEventListener("mouseenter", () => activate(index));
      tab.addEventListener("focus", () => activate(index));
      // Keep click/tap for touch devices and accessibility
      tab.addEventListener("click", () => activate(index));
    });
  });
}

function initHoverLens() {
  const lensSelector = [
    ".material-grid article",
    ".principle-grid article",
    ".model-grid article",
    ".scale-grid article",
    ".output-grid article",
    ".people-grid article",
    ".loop-card",
    ".support-grid article",
    ".architecture-stack article",
    ".deploy-map article",
    ".industry-columns article",
    ".founder-card",
    ".contact-card",
    ".metrics-board",
    ".fusion-engine",
    ".video-placeholder",
    ".timeline-list",
    ".logo-wall span",
    ".learn-more",
    ".home-update-item",
    ".home-updates-link",
    ".metric-pairs p",
    ".faq-list details"
  ].join(", ");

  const lensCards = document.querySelectorAll(lensSelector);

  lensCards.forEach((card) => {
    if (!card.querySelector(":scope > .hover-lens")) {
      const lens = document.createElement("span");
      lens.className = "hover-lens";
      lens.setAttribute("aria-hidden", "true");
      card.prepend(lens);
    }

    const lens = card.querySelector(":scope > .hover-lens");
    let pointerX = 0;
    let pointerY = 0;
    let frameId = null;
    let rect = null;

    const scheduleLensMove = () => {
      if (frameId) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        if (!rect) rect = card.getBoundingClientRect();

        const x = pointerX - rect.left;
        const y = pointerY - rect.top;

        lens.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      });
    };

    card.addEventListener(
      "pointerenter",
      (event) => {
        rect = card.getBoundingClientRect();
        pointerX = event.clientX;
        pointerY = event.clientY;
        card.classList.add("is-lens-active");
        scheduleLensMove();
      },
      { passive: true }
    );

    card.addEventListener(
      "pointermove",
      (event) => {
        pointerX = event.clientX;
        pointerY = event.clientY;
        scheduleLensMove();
      },
      { passive: true }
    );

    card.addEventListener(
      "pointerleave",
      () => {
        card.classList.remove("is-lens-active");
        rect = null;
        if (frameId) {
          window.cancelAnimationFrame(frameId);
          frameId = null;
        }
      },
      { passive: true }
    );
  });
}

function initHomeHeroCarousel() {
  const carousel = document.querySelector("[data-home-carousel]");
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll(".home-hero-slide")];
  if (slides.length <= 1) return;

  const interval = 5600;
  const fadeTime = 1050;
  let currentIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
  if (currentIndex < 0) currentIndex = 0;

  slides.forEach((slide) => {
    const match = slide.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
    if (!match || !match[1]) return;

    const image = new Image();
    image.decoding = "async";
    image.src = match[1];
  });

  const showNextSlide = () => {
    const current = slides[currentIndex];
    const nextIndex = (currentIndex + 1) % slides.length;
    const next = slides[nextIndex];

    current.classList.add("is-exiting");
    next.classList.add("is-active");

    window.setTimeout(() => {
      current.classList.remove("is-active", "is-exiting");
      void current.offsetWidth;
      currentIndex = nextIndex;
    }, fadeTime + 80);
  };

  window.setInterval(showNextSlide, interval);
}

function initWorkflowCarousel() {
  const carousel = document.querySelector("[data-workflow-carousel]");
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll(".workflow-slide"));
  const dots = Array.from(carousel.querySelectorAll(".workflow-dot"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!slides.length || !dots.length) return;

  let currentIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
  if (currentIndex < 0) currentIndex = 0;

  let timer = null;
  let paused = false;

  const setSlide = (index) => {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === currentIndex;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === currentIndex);
    });
  };

  const startTimer = () => {
    if (reduceMotion) return;

    window.clearInterval(timer);
    timer = window.setInterval(() => {
      if (!paused) setSlide(currentIndex + 1);
    }, 5200);
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      setSlide(Number(dot.dataset.index));
      startTimer();
    });
  });

  carousel.addEventListener("mouseenter", () => {
    paused = true;
  });

  carousel.addEventListener("mouseleave", () => {
    paused = false;
  });

  setSlide(currentIndex);
  startTimer();
}




function initPlatformDemoVideo() {
  const demo = document.querySelector("[data-platform-demo]");
  if (!demo) return;

  const screen = demo.querySelector(".platform-video__screen");
  const media = demo.querySelector("[data-platform-video]");
  const embed = demo.querySelector("[data-platform-video-embed]");
  const playButton = demo.querySelector("[data-video-play]");
  const pathProgress = demo.querySelector("[data-video-path-progress]");
  const timelineItems = Array.from(demo.querySelectorAll("[data-video-timeline] .timeline-item"));
  if (!screen || !embed || !timelineItems.length) return;

  const driveFileId = embed.dataset.driveFileId || "1A0F1sWVEYANpMoR69BOcn-dsx12zNiwB";
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const rangeOf = (item) => ({ start: Number(item.dataset.start) || 0, end: Number(item.dataset.end) || 0 });
  const totalDuration = Math.max(...timelineItems.map((item) => rangeOf(item).end), 1);
  let simulatedTime = 0;
  let timerStart = 0;
  let timerBase = 0;
  let timerId = 0;
  let usingNativeVideo = false;
  let nativeAttempted = false;

  const previewSrc = (start = 0, autoplay = false) => {
    const cleanStart = Math.floor(clamp(start, 0, totalDuration));
    const params = new URLSearchParams();
    if (autoplay) params.set("autoplay", "1");

    // Google Drive preview does not expose a reliable seek API, but keeping
    // both start formats makes the fallback URL harmless if Drive ever honors it.
    if (cleanStart > 0) params.set("start", String(cleanStart));

    const query = params.toString();
    return `https://drive.google.com/file/d/${driveFileId}/preview${query ? `?${query}` : ""}${cleanStart > 0 ? `#t=${cleanStart}` : ""}`;
  };

  const setItemState = (item, state, progress = 0) => {
    item.style.setProperty("--timeline-progress", `${clamp(progress, 0, 100).toFixed(2)}%`);
    item.classList.toggle("is-active", state === "active");
    item.classList.toggle("is-complete", state === "complete");
    if (state === "active") item.setAttribute("aria-current", "true");
    else item.removeAttribute("aria-current");
  };

  const updateTimeline = (time = simulatedTime) => {
    const overallProgress = clamp((time / totalDuration) * 100, 0, 100);
    if (pathProgress) {
      const progressValue = `${overallProgress.toFixed(2)}%`;
      pathProgress.style.height = progressValue;
      pathProgress.style.width = "100%";
      pathProgress.style.setProperty("--progress-value", progressValue);
    }

    timelineItems.forEach((item, index) => {
      const { start, end } = rangeOf(item);
      const duration = Math.max(end - start, 1);
      if (time >= end) return setItemState(item, "complete", 100);
      if (time >= start && time < end) return setItemState(item, "active", ((time - start) / duration) * 100);
      if (index === 0 && time < start) return setItemState(item, "active", 0);
      setItemState(item, "idle", 0);
    });
  };

  const hidePlayButton = () => {
    if (!playButton) return;
    playButton.classList.add("is-hidden");
    playButton.setAttribute("hidden", "");
    playButton.setAttribute("aria-hidden", "true");
    playButton.style.display = "none";
  };

  const stopTimer = () => {
    if (timerId) window.clearTimeout(timerId);
    timerId = 0;
  };

  const tick = () => {
    const now = performance.now();

    if (usingNativeVideo && media && Number.isFinite(media.currentTime)) {
      simulatedTime = media.currentTime;
    } else {
      simulatedTime = timerBase + (now - timerStart) / 1000;
    }

    updateTimeline(simulatedTime);

    const isPlayingNative = usingNativeVideo && media && !media.paused && !media.ended;
    if (simulatedTime < totalDuration && (isPlayingNative || !usingNativeVideo)) {
      timerId = window.setTimeout(tick, usingNativeVideo ? 80 : 120);
    } else {
      screen.classList.remove("is-video-playing");
      timerId = 0;
    }
  };

  const startTimer = (start = simulatedTime) => {
    stopTimer();
    timerBase = start;
    simulatedTime = start;
    timerStart = performance.now();
    screen.classList.add("is-video-playing");
    updateTimeline(start);
    timerId = window.setTimeout(tick, 80);
  };

  const showIframePreview = (start = simulatedTime, autoplay = true) => {
    usingNativeVideo = false;
    screen.classList.remove("is-native-video-mode");
    screen.classList.add("is-drive-iframe-mode", "is-video-playing");
    hidePlayButton();
    embed.src = previewSrc(start, autoplay);
    startTimer(start);
  };

  const canUseNativeVideo = () => Boolean(media && media.querySelector("source"));

  const waitForNativeMetadata = () => new Promise((resolve, reject) => {
    if (!media) return reject(new Error("No native video element"));
    if (media.readyState >= 1) return resolve();

    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Native video metadata timeout"));
    }, 1800);

    const cleanup = () => {
      window.clearTimeout(timeout);
      media.removeEventListener("loadedmetadata", onReady);
      media.removeEventListener("canplay", onReady);
      media.removeEventListener("error", onError);
    };

    const onReady = () => {
      cleanup();
      resolve();
    };

    const onError = () => {
      cleanup();
      reject(new Error("Native video error"));
    };

    media.addEventListener("loadedmetadata", onReady, { once: true });
    media.addEventListener("canplay", onReady, { once: true });
    media.addEventListener("error", onError, { once: true });
    media.load();
  });

  const playNativeFrom = async (start = simulatedTime) => {
    if (!canUseNativeVideo()) throw new Error("Native video unavailable");

    const cleanStart = clamp(start, 0, totalDuration);
    nativeAttempted = true;
    stopTimer();

    screen.classList.remove("is-drive-iframe-mode", "is-iframe-fallback");
    screen.classList.add("is-native-video-mode", "is-video-playing");
    hidePlayButton();

    await waitForNativeMetadata();

    try {
      media.currentTime = cleanStart;
    } catch (_) {
      // Some Drive responses do not support range seeking; fall back below.
    }

    const playResult = media.play();
    if (playResult && typeof playResult.then === "function") await playResult;

    usingNativeVideo = true;
    simulatedTime = cleanStart;
    startTimer(cleanStart);
  };

  const playFrom = async (start = simulatedTime) => {
    const cleanStart = clamp(start, 0, totalDuration);
    updateTimeline(cleanStart);

    // Native <video> is the only mode that can be controlled by currentTime.
    // Try it when the user jumps to a segment; fall back to Drive preview if
    // Drive blocks the direct stream in this browser.
    if (!nativeAttempted || cleanStart > 0) {
      try {
        await playNativeFrom(cleanStart);
        return;
      } catch (_) {
        screen.classList.remove("is-native-video-mode");
      }
    }

    showIframePreview(cleanStart, true);
  };

  media?.addEventListener("timeupdate", () => {
    if (!usingNativeVideo) return;
    updateTimeline(media.currentTime || 0);
  });

  media?.addEventListener("ended", () => {
    screen.classList.remove("is-video-playing");
    stopTimer();
    updateTimeline(totalDuration);
  });

  media?.addEventListener("pause", () => {
    if (!usingNativeVideo) return;
    screen.classList.remove("is-video-playing");
    stopTimer();
  });

  playButton?.addEventListener("click", () => playFrom(simulatedTime));

  timelineItems.forEach((item) => {
    item.addEventListener("click", () => playFrom(rangeOf(item).start));
  });

  // Keep Google Drive preview visible on first load, matching the previous
  // working playback appearance. Timeline jumps try the controllable native
  // video first so currentTime can move to the selected segment.
  screen.classList.add("is-drive-iframe-mode");
  embed.src = previewSrc(0, false);
  updateTimeline(0);
}


function initPlatformRdLoopPreview() {
  const preview = document.querySelector("[data-rd-loop-preview]");
  if (!preview) return;

  const previewData = {
    define: {
      group: "magnetic",
      title: "明确真实磁性材料问题",
      desc: "在需求定义阶段，磁性体系建模将成分目标、性能要求、工艺条件与组织结构共同纳入问题边界，避免只围绕“成分 + 理想晶体”定义任务，而是面向真实磁性材料研发中的晶界、缺陷、磁矩状态与多尺度组织演化建立清晰起点。",
      bullets: [
        "目标成分体系，例如 NdFeB、NiO、FeRh、CrI3、无稀土永磁等；",
        "关键磁性能指标，例如饱和磁化强度、磁晶各向异性、居里温度、矫顽力、磁熵等；",
        "真实工艺条件，例如温度、压力、磁场、时间；",
        "关键组织结构，例如晶界、缺陷、晶粒尺寸、析出相、界面；",
        "磁性状态，例如共线、非共线、磁矩大小和方向变化。"
      ]
    },
    model: {
      group: "magnetic",
      title: "把磁性体系表达进模型",
      desc: "在联合建模阶段，磁性体系建模将原子构型、非共线磁矩、晶格结构、缺陷晶界与材料语义统一到同一表达框架中，使模型不只理解理想晶体结构，也能描述真实磁性体系中的原子—磁矩耦合与多尺度组织状态。",
      bullets: [
        "把原子构型和磁矩构型一起建模；",
        "把结构状态、磁序、磁矩方向、磁矩大小统一表达；",
        "覆盖 1 nm 到 1 μm 的关键尺度；",
        "支持缺陷、晶界、界面等真实组织结构；",
        "从单一晶体结构预测，走向工艺组织相关的材料理解。"
      ]
    },
    generate: {
      group: "physics",
      title: "用物理 + 数据筛选候选路径",
      desc: "在方案生成阶段，物理 + 数据驱动通过稳定性、磁序能量、交换强度、磁各向异性、居里温度等物理指标约束候选空间，再利用大规模磁性材料数据与模型推理快速完成趋势筛选、性能预测和路径排序，帮助研发从盲目试错转向优先级明确的候选设计。",
      bullets: [
        "原子大模型先给出磁序候选与能量排序；",
        "快速筛选磁各向异性可能较高的区域；",
        "结合稳定性、交换强度、居里温度、磁性参数进行候选判断；",
        "对无稀土永磁材料，可以生成 Heusler、L10 有序相、MnBi 类、Fe-N 基等候选路径，再用模型筛选稳定性、K 趋势、交换强度和 Tc。"
      ]
    },
    iterate: {
      group: "physics",
      title: "用计算与实验反馈持续修正",
      desc: "在验证迭代阶段，物理 + 数据驱动将模型预测与 DFT 计算、分子动力学模拟及实验结果对齐，通过能量守恒、温压稳定性、磁性力、磁扭矩和性能误差等指标持续校验模型，并把验证反馈重新纳入数据闭环，推动模型与研发流程共同迭代。",
      bullets: [
        "用 DFT、分子动力学、实验结果验证模型输出；",
        "用能量守恒、温压稳定性、磁性力、磁扭矩等物理指标检查模型合理性；",
        "将实验噪声、形貌、工艺元数据一起入库；",
        "通过主动学习和持续训练，让模型不断接近真实材料分布。"
      ]
    }
  };

  const previewItems = Array.from(preview.querySelectorAll("[data-loop-preview]"));
  const previewGroups = Array.from(preview.querySelectorAll("[data-loop-group]"));
  const previewTitle = preview.querySelector("#rdLoopPreviewTitle");
  const previewDesc = preview.querySelector("#rdLoopPreviewDesc");
  const previewBullets = preview.querySelector("#rdLoopPreviewBullets");

  if (!previewItems.length || !previewTitle || !previewDesc || !previewBullets) return;

  const activatePreview = (key) => {
    const data = previewData[key];
    if (!data) return;

    const activeItem = preview.querySelector(`[data-loop-preview="${key}"]`);
    previewTitle.textContent = data.title;
    previewDesc.textContent = data.desc;

    previewBullets.innerHTML = "";
    if (Array.isArray(data.bullets) && data.bullets.length) {
      previewBullets.hidden = false;
      data.bullets.forEach((bullet) => {
        const item = document.createElement("li");
        item.textContent = bullet;
        previewBullets.appendChild(item);
      });
    } else {
      previewBullets.hidden = true;
    }

    previewItems.forEach((item) => {
      const isActive = item.dataset.loopPreview === key;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    previewGroups.forEach((group) => {
      const isActiveGroup = group.dataset.loopGroup === data.group;
      group.classList.toggle("is-active", isActiveGroup);

      if (!isActiveGroup || !activeItem || !group.contains(activeItem)) {
        group.style.setProperty("--loop-label-y", "22px");
        return;
      }

      const groupItems = Array.from(group.querySelectorAll("[data-loop-preview]"));
      const itemIndex = Math.max(0, groupItems.indexOf(activeItem));
      const label = group.querySelector(".rd-loop-preview__group-label");
      const baseY = 22;
      const stepY = 54;
      const labelHeight = label ? label.offsetHeight : 126;
      const maxY = Math.max(baseY, group.offsetHeight - labelHeight - 20);
      const nextY = Math.min(baseY + itemIndex * stepY, maxY);
      group.style.setProperty("--loop-label-y", `${nextY}px`);
    });
  };

  previewItems.forEach((item) => {
    const key = item.dataset.loopPreview;
    item.addEventListener("mouseenter", () => activatePreview(key));
    item.addEventListener("focus", () => activatePreview(key));
    item.addEventListener("click", () => activatePreview(key));
  });

  activatePreview("define");
}



function initCooperationMatrix() {
  const root = document.querySelector("[data-cooperation-matrix]");
  if (!root) return;

  const matrixData = {
    project: {
      title: "快速闭环验证",
      subtitle: "面向研发任务的阶段性交付方案",
      desc: "以评估、优化或专题研发形式，帮助客户快速验证方向并形成可落地结果",
      rows: [
        ["适用场景", "明确问题、需要快速验证"],
        ["交付形式", "评估包 / 优化包 / 新材料研发包"],
        ["周期参考", "6–10 周 / 3–6 个月"]
      ]
    },
    platform: {
      title: "持续调用能力底座",
      subtitle: "平台能力接入研发的标准化方案",
      desc: "支持平台订阅或私有化部署，使模型能力能够被持续调用、复用与扩展",
      rows: [
        ["适用场景", "希望持续使用平台能力"],
        ["部署方式", "平台订阅 / 私有化部署"],
        ["计费方式", "按模块 / 按算力 / 按使用规模"]
      ]
    },
    custom: {
      title: "专属场景化研发能力",
      subtitle: "特定研发场景的长期共建方案",
      desc: "结合模型、算力、数据与底层环境开展联合优化，形成更贴合业务需求的专属能力",
      rows: [
        ["适用场景", "高价值场景、深度嵌入研发流程"],
        ["合作方式", "联合优化 / 私有化 / 长期合作"],
        ["交付结果", "专属方案 / 场景适配 / 持续迭代"]
      ]
    }
  };

  const points = Array.from(root.querySelectorAll(".cooperation-matrix-point"));
  const labels = Array.from(root.querySelectorAll(".cooperation-matrix-label"));
  const info = root.querySelector("#cooperationMatrixInfo");
  if (!points.length || !info) return;

  const renderInfo = (data) => {
    const rows = data.rows
      .map(([label, value]) => `<div class="cooperation-info-row"><dt>${label}</dt><dd>${value}</dd></div>`)
      .join("");

    return `
      <h3 class="cooperation-info-title">${data.title}</h3>
      <p class="cooperation-info-subtitle">${data.subtitle}</p>
      <p class="cooperation-info-desc">${data.desc}</p>
      <dl class="cooperation-info-list">${rows}</dl>
    `;
  };

  const activatePlan = (plan, animate = true) => {
    const next = matrixData[plan];
    if (!next) return;

    if (animate) {
      info.classList.add("is-changing");
      window.setTimeout(() => {
        info.innerHTML = renderInfo(next);
        info.classList.remove("is-changing");
      }, 120);
    } else {
      info.innerHTML = renderInfo(next);
    }

    points.forEach((point) => {
      const active = point.dataset.plan === plan;
      point.classList.toggle("is-active", active);
      point.setAttribute("aria-pressed", String(active));
    });

    labels.forEach((label) => {
      label.classList.toggle("is-active", label.classList.contains(plan));
    });
  };

  points.forEach((point) => {
    point.addEventListener("mouseenter", () => activatePlan(point.dataset.plan));
    point.addEventListener("focus", () => activatePlan(point.dataset.plan));
    point.addEventListener("click", () => activatePlan(point.dataset.plan));
  });

  activatePlan("project", false);
}


function initPlatformPeelArchitecture() {
  const root = document.querySelector("[data-platform-peel]");
  if (!root) return;

  const stage = root.querySelector("[data-platform-peel-stage]");
  const buttons = Array.from(root.querySelectorAll("[data-platform-layer]"));
  if (!stage || !buttons.length) return;

  buttons.forEach((button) => {
    button.setAttribute("aria-pressed", button.classList.contains("is-active") ? "true" : "false");

    button.addEventListener("click", () => {
      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", active ? "true" : "false");
      });

      stage.dataset.active = button.dataset.platformLayer;
    });
  });
}


function initHomeUpdatesTicker() {
  const tracks = document.querySelectorAll("[data-updates-track]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) return;

  tracks.forEach((track) => {
    if (track.dataset.cloned === "true") return;
    track.innerHTML += track.innerHTML;
    track.dataset.cloned = "true";
  });
}


function initIndustryInteraction() {
  const cards = Array.from(document.querySelectorAll(".industry-card"));
  const panel = document.getElementById("industry-detail-panel");

  if (!cards.length || !panel) return;

  const detailTitle = document.getElementById("industryDetailTitle");
  const detailCopy = document.getElementById("industryDetailCopy");
  const detailKeywords = document.getElementById("industryDetailKeywords");
  const detailExtras = document.getElementById("industryDetailExtras");

  const industryData = {
    cycle: {
      tabId: "industry-tab-cycle",
      title: "研发周期长",
      copy: "磁性材料研发从研究到验证链路较长，需经历多轮实验与工艺迭代。关键决策高度依赖人工经验和反复确认，反馈速度慢、项目推进效率低，导致创新窗口被拉长、持续抬高机会成本。",
      keywords: ["多轮实验", "反馈速度慢", "创新窗口拉长"],
      extras: [
        ["智能化切入点", "用模型先做候选筛选与优先级排序，减少盲目试错。"]
      ]
    },
    cost: {
      tabId: "industry-tab-cost",
      title: "成本持续放大",
      copy: "高价值材料研发伴随高试错成本、重资源投入和长回报周期，越到后期，单次失误带来的代价越高，项目资源更容易被低效循环持续消耗，最终使投入产出比失衡，难以支撑持续而快速的研发迭代。",
      keywords: ["试错成本高", "资源投入重", "回报周期长"],
      extras: [
        ["智能化切入点", "通过早期评估和候选排序，把资源集中到更高概率方向。"]
      ]
    },
    data: {
      tabId: "industry-tab-data",
      title: "建模及数据沉淀难",
      copy: "多尺度耦合、缺陷、无序和工艺变量叠加，传统方法难兼顾效率与精度，经验模型难迁移到新体系和新工况；同时，实验、仿真与项目数据分散、口径不一，难以沉淀和复用，进一步制约研发优化效率。",
      keywords: ["多尺度耦合", "数据口径分散", "模型迁移困难"],
      extras: [
        ["智能化切入点", "统一结构、磁性构型、物理约束与研发目标，形成闭环数据资产。"]
      ]
    }
  };

  function renderDetail(key, shouldFocus = false) {
    const data = industryData[key];
    if (!data) return;

    cards.forEach((card) => {
      const active = card.dataset.card === key;
      card.setAttribute("aria-selected", String(active));
      card.setAttribute("tabindex", active ? "0" : "-1");
    });

    panel.setAttribute("aria-labelledby", data.tabId);
    panel.dataset.industryDetail = key;
    panel.classList.remove("fade-swap");
    void panel.offsetWidth;
    panel.classList.add("fade-swap");

    detailTitle.textContent = data.title;
    detailCopy.textContent = data.copy;

    detailKeywords.innerHTML = data.keywords
      .map((keyword) => `<span>${keyword}</span>`)
      .join("");

    detailExtras.innerHTML = (data.extras || [])
      .map(([title, desc]) => `
        <div class="industry-detail-extra-item">
          <strong>${title}</strong>
          <span>${desc}</span>
        </div>`)
      .join("");

    if (shouldFocus) {
      panel.focus({ preventScroll: true });
    }
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => renderDetail(card.dataset.card));

    card.addEventListener("keydown", (event) => {
      const currentIndex = cards.indexOf(card);
      let nextIndex = currentIndex;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (currentIndex + 1) % cards.length;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (currentIndex - 1 + cards.length) % cards.length;
      }

      if (event.key === "Home") {
        nextIndex = 0;
      }

      if (event.key === "End") {
        nextIndex = cards.length - 1;
      }

      if (nextIndex !== currentIndex) {
        event.preventDefault();
        cards[nextIndex].focus();
        renderDetail(cards[nextIndex].dataset.card);
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        renderDetail(card.dataset.card, true);
      }
    });

    card.addEventListener(
      "mousemove",
      (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--mx", `${x}%`);
        card.style.setProperty("--my", `${y}%`);
      },
      { passive: true }
    );
  });

  renderDetail("cycle");
}


function initRingPlatform() {
  const ringData = {
    scale: {
      desc: "把 1 nm 到 1 μm 的关键结构尺度接进模型，连接原子构型、晶界缺陷与组织演化问题。"
    },
    joint: {
      desc: "把物理规律、数据学习与研发任务放进同一个建模框架，让模型既能预测关键物理量，也更接近真实材料问题。"
    },
    real: {
      desc: "不只停留在“成分 + 理想晶体”，而是走向“工艺 → 组织 → 性能”，更贴近材料研发中的真实约束。"
    }
  };

  const stage = document.querySelector("[data-ring-stage]");
  if (!stage) return;

  const ringNodes = Array.from(stage.querySelectorAll("[data-ring-node]"));
  const centerDome = stage.querySelector("[data-center-dome]");
  const ringDesc = stage.querySelector("[data-ring-desc]");
  const orbit = stage.querySelector("[data-ring-orbit]");
  const orbitPath = stage.querySelector(".ring-orbit-path");
  const orbitBall = stage.querySelector("[data-ring-ball]");

  if (!ringNodes.length || !centerDome || !ringDesc || !orbit || !orbitPath || !orbitBall) return;

  let pathLength = 0;
  let currentLength = 0;
  let lockedKey = null;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const pathPointToStagePoint = (pathPoint) => {
    const stageRect = stage.getBoundingClientRect();
    const orbitRect = orbit.getBoundingClientRect();

    return {
      x: orbitRect.left - stageRect.left + (pathPoint.x / 1000) * orbitRect.width,
      y: orbitRect.top - stageRect.top + (pathPoint.y / 420) * orbitRect.height
    };
  };

  const setBallPosition = (point, locked = false) => {
    if (!point) return;
    orbitBall.classList.toggle("is-locked", locked);
    orbitBall.style.transform = `translate3d(${point.x.toFixed(1)}px, ${point.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
  };

  const setBallOnPath = (length, locked = false) => {
    if (!pathLength) return;
    currentLength = clamp(length, 0, pathLength);
    const pathPoint = orbitPath.getPointAtLength(currentLength);
    setBallPosition(pathPointToStagePoint(pathPoint), locked);
  };

  const setBallOnCard = (key) => {
    const node = ringNodes.find((item) => item.dataset.ringNode === key);
    if (!node) return;

    const stageRect = stage.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const point = {
      x: nodeRect.left + nodeRect.width / 2 - stageRect.left,
      y: nodeRect.top - stageRect.top
    };

    setBallPosition(point, true);
  };

  const updatePath = () => {
    pathLength = orbitPath.getTotalLength();
  };

  const moveBallByPointer = (event) => {
    if (lockedKey || !pathLength) return;

    const orbitRect = orbit.getBoundingClientRect();
    const ratio = clamp((event.clientX - orbitRect.left) / orbitRect.width, 0, 1);
    setBallOnPath(ratio * pathLength, false);
  };

  const setRingActive = (key) => {
    const data = ringData[key];
    if (!data) return;

    stage.classList.add("has-active");

    ringNodes.forEach((node) => {
      const active = node.dataset.ringNode === key;
      node.classList.toggle("is-active", active);
      node.setAttribute("aria-pressed", String(active));
    });

    centerDome.classList.remove("is-switching");
    void centerDome.offsetWidth;
    centerDome.classList.add("is-switching");

    ringDesc.textContent = data.desc;
    setBallOnCard(key);
  };

  stage.addEventListener(
    "pointermove",
    (event) => {
      moveBallByPointer(event);
    },
    { passive: true }
  );

  stage.addEventListener(
    "pointerleave",
    () => {
      lockedKey = null;
    },
    { passive: true }
  );

  ringNodes.forEach((node) => {
    node.addEventListener("pointerenter", () => {
      lockedKey = node.dataset.ringNode;
      setRingActive(lockedKey);
    });

    node.addEventListener("pointerleave", (event) => {
      if (lockedKey === node.dataset.ringNode) lockedKey = null;
      moveBallByPointer(event);
    });

    node.addEventListener("focus", () => {
      lockedKey = node.dataset.ringNode;
      setRingActive(lockedKey);
    });

    node.addEventListener("blur", () => {
      if (lockedKey === node.dataset.ringNode) lockedKey = null;
    });

    node.addEventListener("click", () => {
      lockedKey = node.dataset.ringNode;
      setRingActive(lockedKey);
    });

    node.addEventListener("keydown", (event) => {
      const index = ringNodes.indexOf(node);
      let nextIndex = index;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (index + 1) % ringNodes.length;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (index - 1 + ringNodes.length) % ringNodes.length;
      }

      if (nextIndex === index) return;

      event.preventDefault();
      ringNodes[nextIndex].focus();
      setRingActive(ringNodes[nextIndex].dataset.ringNode);
    });
  });

  const refreshOrbit = () => {
    updatePath();
    const activeNode = stage.querySelector("[data-ring-node].is-active") || ringNodes[0];
    if (activeNode) setBallOnCard(activeNode.dataset.ringNode);
  };

  refreshOrbit();
  window.addEventListener("resize", refreshOrbit, { passive: true });
  window.setTimeout(refreshOrbit, 60);
  setRingActive("joint");
}

function initRadarCompare() {
  const layout = document.querySelector(".compare-radar-layout");
  if (!layout) return;

  // 1) Comparison bars: fill from data-animate-from to data-animate-to.
  const cards = [...document.querySelectorAll(".business-compare-card")];

  const playFill = (fill) => {
    if (!fill) return;
    const from = Number(fill.dataset.animateFrom || 0);
    const to = Number(fill.dataset.animateTo || 0);
    fill.style.transition = "none";
    fill.style.width = `${from}%`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fill.style.transition = "width 1.16s cubic-bezier(.22,.8,.2,1)";
        fill.style.width = `${to}%`;
      });
    });
  };

  cards.forEach((card) => {
    const fill = card.querySelector(".business-compare-card__track span");
    // Show the bar at its target width immediately so it's always visible,
    // even if the scroll-reveal animation never triggers.
    if (fill) fill.style.width = `${Number(fill.dataset.animateTo || 0)}%`;
    card.dataset.trackPlayed = "false";
    card.playTrack = () => {
      if (card.dataset.trackPlayed === "true") return;
      card.dataset.trackPlayed = "true";
      playFill(fill);
    };
    card.addEventListener("mouseenter", () => playFill(fill));
    card.addEventListener("focusin", () => playFill(fill));
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.playTrack?.();
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    cards.forEach((card) => observer.observe(card));
  } else {
    cards.forEach((card) => card.playTrack?.());
  }

  // 2) Radar interactions: legend series focus + summary axis highlight.
  const chart = layout.querySelector(".compare-radar-chart");
  const axisCards = [...layout.querySelectorAll(".compare-radar-summary__item[data-axis]")];
  const legendItems = [...layout.querySelectorAll(".compare-radar-legend__item[data-series]")];
  const axisPoints = chart ? [...chart.querySelectorAll(".compare-radar-chart__point[data-axis]")] : [];
  const axisLabels = chart ? [...chart.querySelectorAll(".compare-radar-chart__labels [data-axis]")] : [];
  const seriesAreas = chart ? [...chart.querySelectorAll(".compare-radar-chart__area[data-series]")] : [];

  const clearAxis = () => {
    axisCards.forEach((c) => c.classList.remove("is-active"));
    axisPoints.forEach((p) => {
      p.classList.remove("is-active");
      p.setAttribute("r", p.dataset.baseR || "6");
    });
    axisLabels.forEach((l) => l.classList.remove("is-active"));
  };

  const focusAxis = (axis) => {
    clearAxis();
    axisCards.forEach((c) => c.classList.toggle("is-active", c.dataset.axis === axis));
    axisPoints.forEach((p) => {
      if (p.dataset.axis !== axis) return;
      p.classList.add("is-active");
      p.setAttribute("r", String(Number(p.dataset.baseR || 6) + 3));
    });
    axisLabels.forEach((l) => l.classList.toggle("is-active", l.dataset.axis === axis));
  };

  axisCards.forEach((card) => {
    card.addEventListener("mouseenter", () => focusAxis(card.dataset.axis));
    card.addEventListener("focusin", () => focusAxis(card.dataset.axis));
    card.addEventListener("mouseleave", clearAxis);
    card.addEventListener("focusout", () => {
      requestAnimationFrame(() => {
        if (!card.contains(document.activeElement)) clearAxis();
      });
    });
  });

  let lockedSeries = null;
  const applySeries = (series) => {
    if (!series) {
      layout.classList.remove("has-series-focus");
      legendItems.forEach((i) => i.classList.remove("is-series-active"));
      seriesAreas.forEach((a) => a.classList.remove("is-series-active"));
      return;
    }
    layout.classList.add("has-series-focus");
    legendItems.forEach((i) => i.classList.toggle("is-series-active", i.dataset.series === series));
    seriesAreas.forEach((a) => a.classList.toggle("is-series-active", a.dataset.series === series));
  };

  legendItems.forEach((item) => {
    const series = item.dataset.series;
    const preview = () => { if (!lockedSeries) applySeries(series); };
    const reset = () => applySeries(lockedSeries);
    const toggleLock = (event) => {
      event.preventDefault();
      lockedSeries = lockedSeries === series ? null : series;
      legendItems.forEach((l) => l.setAttribute("aria-pressed", lockedSeries === l.dataset.series ? "true" : "false"));
      applySeries(lockedSeries);
    };
    item.setAttribute("aria-pressed", "false");
    item.addEventListener("mouseenter", preview);
    item.addEventListener("focusin", preview);
    item.addEventListener("mouseleave", reset);
    item.addEventListener("click", toggleLock);
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") toggleLock(event);
    });
  });
}

function initScaleTabs() {
  const root = document.querySelector("[data-scale-tabs]");
  if (!root) return;

  const tabs = [...root.querySelectorAll(".scale-tab")];
  const indicator = root.querySelector(".scale-tab-indicator");
  const tagEl = root.querySelector("[data-scale-tag]");
  const titleEl = root.querySelector("[data-scale-title]");
  const descEl = root.querySelector("[data-scale-desc]");
  const figures = [...root.querySelectorAll(".scale-figure")];

  const moveIndicator = (btn) => {
    if (!indicator || !btn) return;
    indicator.style.left = `${btn.offsetLeft}px`;
    indicator.style.width = `${btn.offsetWidth}px`;
  };

  const activate = (btn) => {
    tabs.forEach((tab) => {
      const on = tab === btn;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (tagEl) tagEl.textContent = btn.dataset.tag || "";
    if (titleEl) titleEl.textContent = btn.dataset.title || btn.textContent.trim();
    if (descEl) descEl.textContent = btn.dataset.desc || "";
    if (figures.length) {
      const idx = btn.dataset.tab;
      figures.forEach((fig) =>
        fig.classList.toggle("is-active", fig.dataset.scaleFigure === idx)
      );
    }
    moveIndicator(btn);
  };

  tabs.forEach((tab) => {
    // Hover to switch (desktop / pointer); keep click & focus for touch and keyboard.
    tab.addEventListener("mouseenter", () => activate(tab));
    tab.addEventListener("focus", () => activate(tab));
    tab.addEventListener("click", () => activate(tab));
  });

  const activeTab = root.querySelector(".scale-tab.is-active") || tabs[0];
  // Position the indicator over the active tab once layout is ready.
  requestAnimationFrame(() => moveIndicator(activeTab));

  window.addEventListener("resize", () => {
    moveIndicator(root.querySelector(".scale-tab.is-active") || tabs[0]);
  }, { passive: true });
}
