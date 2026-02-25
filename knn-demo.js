(() => {
  const canvas = document.getElementById("knnCanvas");
  if (!canvas) return; // 다른 페이지에서 로드될 수 있으니 안전장치
  const ctx = canvas.getContext("2d");

  const nSlider = document.getElementById("nSlider");
  const kSlider = document.getElementById("kSlider");
  const nVal = document.getElementById("nVal");
  const kVal = document.getElementById("kVal");
  const randomizeBtn = document.getElementById("randomizeBtn");
  const directedChk = document.getElementById("directedChk");

  // Canvas 내부 좌표계(픽셀) 기준
  const W = canvas.width;
  const H = canvas.height;

  // 스타일/파라미터
  const NODE_R = 6;
  const HIT_R = 10;      // 드래그 히트박스 반경
  const EDGE_ALPHA = 0.25;

  let nodes = [];  // {x,y}
  let edges = [];  // [ [i,j], ... ]  (i -> j)
  let dragging = { idx: -1, dx: 0, dy: 0 };

  function rand(min, max) { return min + Math.random() * (max - min); }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function makeNodes(n) {
    nodes = Array.from({ length: n }, () => ({
      x: rand(20, W - 20),
      y: rand(20, H - 20),
    }));
  }

  // k-NN 계산: 각 i에 대해 거리 기준 상위 k개 이웃 선택
  // O(n^2 log n) (n<=200이면 충분)
  function rebuildEdges() {
    const n = nodes.length;
    let k = parseInt(kSlider.value, 10);
    k = clamp(k, 1, Math.max(1, n - 1));

    edges = [];
    const directed = !!directedChk?.checked;

    // 거리^2로 비교 (sqrt 불필요)
    for (let i = 0; i < n; i++) {
      const xi = nodes[i].x, yi = nodes[i].y;
      const dists = [];
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        const dx = nodes[j].x - xi;
        const dy = nodes[j].y - yi;
        dists.push({ j, d2: dx * dx + dy * dy });
      }
      dists.sort((a, b) => a.d2 - b.d2);
      for (let t = 0; t < k; t++) {
        const j = dists[t].j;
        edges.push([i, j]);
      }
    }

    if (!directed) {
      // 무방향으로 “합치기”: (i,j)와 (j,i) 중복 제거
      const seen = new Set();
      const undirected = [];
      for (const [i, j] of edges) {
        const a = Math.min(i, j);
        const b = Math.max(i, j);
        const key = `${a}-${b}`;
        if (!seen.has(key)) {
          seen.add(key);
          undirected.push([a, b]);
        }
      }
      edges = undirected;
    }
  }

  function clear() {
    ctx.clearRect(0, 0, W, H);
  }

  function drawEdges() {
    ctx.save();
    ctx.globalAlpha = EDGE_ALPHA;
    ctx.lineWidth = 1;

    for (const [i, j] of edges) {
      const a = nodes[i];
      const b = nodes[j];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawNodes() {
    ctx.save();
    for (let i = 0; i < nodes.length; i++) {
      const { x, y } = nodes[i];
      ctx.beginPath();
      ctx.arc(x, y, NODE_R, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function render() {
    clear();
    drawEdges();
    drawNodes();
  }

  // 마우스 좌표를 canvas 좌표로 변환(레티나/리사이즈 대비)
  function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    return {
      x: (evt.clientX - rect.left) * sx,
      y: (evt.clientY - rect.top) * sy,
    };
  }

  function pickNode(x, y) {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const dx = nodes[i].x - x;
      const dy = nodes[i].y - y;
      if (dx * dx + dy * dy <= HIT_R * HIT_R) return i;
    }
    return -1;
  }

  canvas.addEventListener("mousedown", (e) => {
    const p = getMousePos(e);
    const idx = pickNode(p.x, p.y);
    if (idx >= 0) {
      dragging.idx = idx;
      dragging.dx = nodes[idx].x - p.x;
      dragging.dy = nodes[idx].y - p.y;
    }
  });

  window.addEventListener("mousemove", (e) => {
    if (dragging.idx < 0) return;
    const p = getMousePos(e);
    const i = dragging.idx;
    nodes[i].x = clamp(p.x + dragging.dx, 10, W - 10);
    nodes[i].y = clamp(p.y + dragging.dy, 10, H - 10);
    rebuildEdges();
    render();
  });

  window.addEventListener("mouseup", () => {
    dragging.idx = -1;
  });

  function updateLabels() {
    nVal.textContent = String(nSlider.value);
    kVal.textContent = String(kSlider.value);
  }

  function onNChange() {
    const n = parseInt(nSlider.value, 10);
    makeNodes(n);

    // k의 max를 n-1에 맞춰주기
    kSlider.max = String(Math.max(1, n - 1));
    if (parseInt(kSlider.value, 10) > n - 1) {
      kSlider.value = String(Math.max(1, n - 1));
    }

    updateLabels();
    rebuildEdges();
    render();
  }

  function onKChange() {
    const n = nodes.length;
    const k = clamp(parseInt(kSlider.value, 10), 1, Math.max(1, n - 1));
    kSlider.value = String(k);
    updateLabels();
    rebuildEdges();
    render();
  }

  nSlider.addEventListener("input", onNChange);
  kSlider.addEventListener("input", onKChange);
  directedChk?.addEventListener("change", () => {
    rebuildEdges();
    render();
  });

  randomizeBtn.addEventListener("click", () => {
    makeNodes(parseInt(nSlider.value, 10));
    rebuildEdges();
    render();
  });

  // 초기화
  updateLabels();
  makeNodes(parseInt(nSlider.value, 10));
  kSlider.max = String(Math.max(1, nodes.length - 1));
  rebuildEdges();
  render();
})();