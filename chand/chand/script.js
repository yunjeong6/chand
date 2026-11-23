/* =========================================================
   C:hand 쇼핑몰 기능 스크립트
   ---------------------------------------------------------
   [1] 데이터 (다음 주 데이터베이스 테이블로 옮길 부분)
   ========================================================= */

// 분류 테이블
const CATEGORIES = [
  { id: 1, name: "수분 보습", desc: "매일 바르는 가벼운 보습" },
  { id: 2, name: "향기", desc: "은은하게 남는 향기" },
  { id: 3, name: "집중 케어", desc: "거칠고 건조한 손에" },
  { id: 4, name: "선물 세트", desc: "마음을 전하는 선물" }
];

// 상품 테이블
const PRODUCTS = [
  { id: 1, name: "시어 밀크 핸드크림", category: "수분 보습", price: 12000, stock: 30, volume: "50ml", scent: "포근한 밀크향", image: "img/product-1.jpg", desc: "시어버터를 담아 바르는 순간 부드럽게 스며드는 데일리 핸드크림이에요. 끈적임 없이 촉촉함만 남겨요." },
  { id: 2, name: "알로에 워터 핸드젤", category: "수분 보습", price: 11000, stock: 25, volume: "50ml", scent: "산뜻한 그린향", image: "img/product-2.jpg", desc: "알로에 성분의 젤 타입이라 바르자마자 산뜻하게 흡수돼요. 키보드와 휴대폰을 자주 쓰는 날에 좋아요." },
  { id: 3, name: "로즈 페탈 퍼퓸 핸드크림", category: "향기", price: 15000, stock: 20, volume: "50ml", scent: "장미 꽃잎향", image: "img/product-3.jpg", desc: "갓 핀 장미 꽃잎을 닮은 향이 손끝에 오래 머무는 향기 핸드크림이에요." },
  { id: 4, name: "라벤더 코튼 퍼퓸 핸드크림", category: "향기", price: 15000, stock: 18, volume: "50ml", scent: "라벤더 코튼향", image: "img/product-4.jpg", desc: "갓 세탁한 코튼에 라벤더를 더한 차분한 향이에요. 잠들기 전 기분 전환용으로도 좋아요." },
  { id: 5, name: "세라마이드 인텐시브 크림", category: "집중 케어", price: 19000, stock: 15, volume: "75ml", scent: "무향", image: "img/product-5.jpg", desc: "세라마이드와 판테놀이 거칠어진 손을 감싸주는 진한 제형의 집중 케어 크림이에요." },
  { id: 6, name: "나이트 리페어 슬리핑 핸드마스크", category: "집중 케어", price: 21000, stock: 12, volume: "75ml", scent: "은은한 바닐라향", image: "img/product-6.jpg", desc: "자기 전 듬뿍 바르고 자면 다음 날 아침 손이 말랑해지는 슬리핑 마스크예요." },
  { id: 7, name: "듀오 미니 선물 세트", category: "선물 세트", price: 22000, stock: 10, volume: "30ml x 2", scent: "로즈 · 알로에", image: "img/product-7.jpg", desc: "인기 향 두 가지를 미니 사이즈로 담았어요. 리본 포장 상자에 담겨 배송돼요." },
  { id: 8, name: "트리오 시그니처 선물 세트", category: "선물 세트", price: 32000, stock: 8, volume: "30ml x 3", scent: "로즈 · 알로에 · 라벤더", image: "img/product-8.jpg", desc: "C:hand 대표 향 세 가지를 모은 시그니처 선물 세트예요. 생일과 기념일 선물로 좋아요." }
];

// 회원 등급 테이블 (minAmount: 누적 구매 상품금액 기준)
const GRADES = [
  { level: 1, name: "크림", minAmount: 0, rate: 0.01 },
  { level: 2, name: "아이보리", minAmount: 50000, rate: 0.03 },
  { level: 3, name: "실크", minAmount: 150000, rate: 0.05 },
  { level: 4, name: "펄", minAmount: 300000, rate: 0.07 }
];

// 운영 설정
const SETTINGS = {
  signupPoint: 3000,        // 가입 축하 포인트
  shippingFee: 3000,        // 기본 배송비
  freeShippingOver: 30000,  // 이 금액 이상이면 무료배송
  minPointUse: 100,         // 포인트 사용 단위
  lowStockAlert: 10         // 재고 적음 표시 기준
};

/* =========================================================
   [2] 저장소 (지금은 브라우저 localStorage, 다음 주에 DB로 교체)
   ========================================================= */
const KEY = {
  members: "chand_members",   // 회원 테이블
  session: "chand_session",   // 로그인한 회원 아이디
  cart: "chand_cart",         // 장바구니
  orders: "chand_orders",     // 주문 테이블
  points: "chand_points",     // 포인트 내역 테이블
  stock: "chand_stock"        // 주문 후 바뀐 재고
};

const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 저장 불가 환경 */ }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* 무시 */ }
  }
};

/* =========================================================
   [3] 공통 도구
   ========================================================= */
const $ = (sel) => document.querySelector(sel);
const won = (n) => n.toLocaleString("ko-KR") + "원";
const pt = (n) => n.toLocaleString("ko-KR") + "P";
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const nowText = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("show"), 2200);
}

// 사진(.jpg)이 아직 없으면 같은 이름의 그림(.svg)을 대신 보여줌
const IMG_FALLBACK = `onerror="this.onerror=null;this.src=this.src.replace(/\\.jpg$/,'.svg')"`;

function findProduct(id) { return PRODUCTS.find((p) => p.id === Number(id)); }

// 현재 재고 = 기본 재고 - 주문으로 줄어든 수량
function getStock(id) {
  const changed = store.get(KEY.stock, {});
  return changed[id] !== undefined ? changed[id] : findProduct(id).stock;
}
function setStock(id, value) {
  const changed = store.get(KEY.stock, {});
  changed[id] = value;
  store.set(KEY.stock, changed);
}

function gradeOf(totalAmount) {
  let g = GRADES[0];
  GRADES.forEach((x) => { if (totalAmount >= x.minAmount) g = x; });
  return g;
}
function nextGrade(grade) { return GRADES.find((x) => x.level === grade.level + 1) || null; }

/* =========================================================
   [4] 회원 (가입 · 로그인 · 로그아웃)
   ========================================================= */
function getMembers() { return store.get(KEY.members, []); }
function saveMembers(list) { store.set(KEY.members, list); }
function currentUser() {
  const id = store.get(KEY.session, null);
  return id ? getMembers().find((m) => m.id === id) || null : null;
}
function updateMember(user) {
  const list = getMembers().map((m) => (m.id === user.id ? user : m));
  saveMembers(list);
}
function addPointLog(memberId, type, amount, memo) {
  const logs = store.get(KEY.points, []);
  logs.push({ memberId, date: nowText(), type, amount, memo });
  store.set(KEY.points, logs);
}

function signup(e) {
  e.preventDefault();
  const msg = $("#signupMsg");
  const id = $("#suId").value.trim();
  const pw = $("#suPw").value;
  const pw2 = $("#suPw2").value;
  const name = $("#suName").value.trim();
  const email = $("#suEmail").value.trim();
  const phone = $("#suPhone").value.trim();

  if (!/^[A-Za-z0-9]{4,12}$/.test(id)) { msg.textContent = "아이디는 영문·숫자 4~12자로 입력해주세요."; return; }
  if (pw.length < 6) { msg.textContent = "비밀번호는 6자 이상이어야 해요."; return; }
  if (pw !== pw2) { msg.textContent = "비밀번호가 서로 달라요."; return; }
  if (getMembers().some((m) => m.id.toLowerCase() === id.toLowerCase())) { msg.textContent = "이미 사용 중인 아이디예요."; return; }

  const member = {
    id, password: pw, name, email, phone,
    joinDate: nowText(),
    point: SETTINGS.signupPoint,
    totalAmount: 0
  };
  const list = getMembers();
  list.push(member);
  saveMembers(list);
  addPointLog(id, "적립", SETTINGS.signupPoint, "회원가입 축하");

  store.set(KEY.session, id);
  e.target.reset();
  msg.textContent = "";
  refreshHeader();
  toast(`${name}님, 가입을 축하해요! ${pt(SETTINGS.signupPoint)}가 적립됐어요.`);
  location.hash = "#mypage";
}

function login(e) {
  e.preventDefault();
  const id = $("#loginId").value.trim();
  const pw = $("#loginPw").value;
  const user = getMembers().find((m) => m.id.toLowerCase() === id.toLowerCase() && m.password === pw);
  if (!user) { $("#loginMsg").textContent = "아이디 또는 비밀번호가 맞지 않아요."; return; }

  store.set(KEY.session, user.id);
  e.target.reset();
  $("#loginMsg").textContent = "";
  refreshHeader();
  toast(`${user.name}님, 반가워요!`);
  const next = route().params.next;
  location.hash = next ? "#" + next : "#home";
}

function logout() {
  store.remove(KEY.session);
  refreshHeader();
  toast("로그아웃했어요.");
  location.hash = "#home";
}

function refreshHeader() {
  const user = currentUser();
  $("#loginLink").hidden = !!user;
  $("#signupLink").hidden = !!user;
  $("#mypageLink").hidden = !user;
  $("#logoutBtn").hidden = !user;
  $("#userGreeting").textContent = user ? `${user.name}님` : "";
  $("#cartCount").textContent = getCart().reduce((s, c) => s + c.qty, 0);
}

/* =========================================================
   [5] 장바구니
   ========================================================= */
function getCart() { return store.get(KEY.cart, []); }
function saveCart(cart) { store.set(KEY.cart, cart); refreshHeader(); }

function addToCart(productId, qty) {
  qty = Math.max(1, Number(qty) || 1);
  const stock = getStock(productId);
  const cart = getCart();
  const item = cart.find((c) => c.productId === productId);
  const already = item ? item.qty : 0;
  if (stock <= 0) { toast("품절된 상품이에요."); return false; }
  if (already + qty > stock) { toast(`재고가 ${stock}개 남아 있어요.`); return false; }
  if (item) item.qty += qty; else cart.push({ productId, qty });
  saveCart(cart);
  toast("장바구니에 담았어요.");
  return true;
}

function changeQty(productId, qty) {
  const stock = getStock(productId);
  qty = Math.min(Math.max(1, Number(qty) || 1), stock);
  const cart = getCart();
  const item = cart.find((c) => c.productId === productId);
  if (item) item.qty = qty;
  saveCart(cart);
  renderCart();
}

function removeFromCart(productId) {
  saveCart(getCart().filter((c) => c.productId !== productId));
  renderCart();
  toast("상품을 삭제했어요.");
}

function cartTotals(usedPoint = 0) {
  const cart = getCart();
  const subtotal = cart.reduce((s, c) => s + findProduct(c.productId).price * c.qty, 0);
  const shipping = subtotal === 0 || subtotal >= SETTINGS.freeShippingOver ? 0 : SETTINGS.shippingFee;
  const total = subtotal + shipping - usedPoint;
  return { subtotal, shipping, usedPoint, total };
}

/* =========================================================
   [6] 화면 그리기
   ========================================================= */
function productCard(p) {
  const stock = getStock(p.id);
  const stockText = stock <= 0 ? '<span class="stock-low">품절</span>'
    : stock <= SETTINGS.lowStockAlert ? `<span class="stock-low">${stock}개 남음</span>` : "";
  return `
    <article class="product-card">
      <a href="#product/${p.id}" class="thumb"><img src="${p.image}" alt="${esc(p.name)}" loading="lazy" ${IMG_FALLBACK}></a>
      <div class="info">
        <span class="cat">${esc(p.category)}</span>
        <a href="#product/${p.id}" class="name">${esc(p.name)}</a>
        ${stockText}
        <span class="price">${won(p.price)}</span>
        <button type="button" class="btn btn-line add" data-add="${p.id}" ${stock <= 0 ? "disabled" : ""}>장바구니 담기</button>
      </div>
    </article>`;
}

function renderHome() {
  $("#catCards").innerHTML = CATEGORIES.map((c) => `
    <button type="button" class="cat-card" data-cat="${esc(c.name)}">
      <strong>${esc(c.name)}</strong><span>${esc(c.desc)}</span>
    </button>`).join("");
  // 분류마다 한 개씩 추천
  const picks = CATEGORIES.map((c) => PRODUCTS.find((p) => p.category === c.name)).filter(Boolean);
  $("#bestGrid").innerHTML = picks.map(productCard).join("");
  $("#gradeList").innerHTML = GRADES.map((g) => `
    <li>
      <p class="g-name">${esc(g.name)}</p>
      <p class="g-rate">${Math.round(g.rate * 100)}%</p>
      <p class="g-cond">${g.minAmount === 0 ? "가입 즉시" : "누적 " + won(g.minAmount) + " 이상"}</p>
    </li>`).join("");
}

// 목록 상태 (분류, 검색어, 정렬)
const listState = { cat: "전체", q: "", sort: "basic" };

function renderList() {
  const chips = ["전체", ...CATEGORIES.map((c) => c.name)];
  $("#filterBar").innerHTML = chips.map((name) =>
    `<button type="button" class="chip ${listState.cat === name ? "is-active" : ""}" data-filter="${esc(name)}" aria-pressed="${listState.cat === name}">${esc(name)}</button>`
  ).join("");

  const q = listState.q.toLowerCase();
  let list = PRODUCTS.filter((p) =>
    (listState.cat === "전체" || p.category === listState.cat) &&
    (!q || (p.name + " " + p.category + " " + p.scent + " " + p.desc).toLowerCase().includes(q))
  );
  if (listState.sort === "low") list = [...list].sort((a, b) => a.price - b.price);
  if (listState.sort === "high") list = [...list].sort((a, b) => b.price - a.price);
  if (listState.sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "ko"));

  $("#listTitle").textContent = listState.q ? `'${listState.q}' 검색 결과` : (listState.cat === "전체" ? "전체 상품" : listState.cat);
  $("#listInfo").textContent = `상품 ${list.length}개`;
  $("#productGrid").innerHTML = list.map(productCard).join("");
  $("#emptyList").hidden = list.length > 0;
  $("#sortSelect").value = listState.sort;
}

function renderDetail(id) {
  const p = findProduct(id);
  const box = $("#detailBox");
  if (!p) {
    box.innerHTML = `<p class="empty">상품을 찾을 수 없어요. <a href="#products">상품 목록으로</a></p>`;
    return;
  }
  const stock = getStock(p.id);
  const user = currentUser();
  const rate = user ? gradeOf(user.totalAmount).rate : GRADES[0].rate;
  box.innerHTML = `
    <div class="detail-img"><img src="${p.image}" alt="${esc(p.name)}" ${IMG_FALLBACK}></div>
    <div class="detail-info">
      <a href="#products" class="back-link">← 상품 목록</a>
      <p class="cat">${esc(p.category)}</p>
      <h2>${esc(p.name)}</h2>
      <p class="price">${won(p.price)}</p>
      <p class="desc">${esc(p.desc)}</p>
      <dl class="spec">
        <div><dt>용량</dt><dd>${esc(p.volume)}</dd></div>
        <div><dt>향</dt><dd>${esc(p.scent)}</dd></div>
        <div><dt>재고</dt><dd>${stock > 0 ? stock + "개" : "품절"}</dd></div>
        <div><dt>적립</dt><dd>${pt(Math.floor(p.price * rate))} (${user ? gradeOf(user.totalAmount).name + " 등급 " : "기본 "}${Math.round(rate * 100)}%)</dd></div>
        <div><dt>배송</dt><dd>${won(SETTINGS.freeShippingOver)} 이상 무료배송</dd></div>
      </dl>
      <div class="qty" aria-label="수량">
        <button type="button" data-step="-1" aria-label="수량 줄이기">−</button>
        <input type="number" id="detailQty" value="1" min="1" max="${Math.max(stock, 1)}" aria-label="수량">
        <button type="button" data-step="1" aria-label="수량 늘리기">+</button>
      </div>
      <div class="detail-actions">
        <button type="button" class="btn btn-line" id="detailAdd" ${stock <= 0 ? "disabled" : ""}>장바구니 담기</button>
        <button type="button" class="btn" id="detailBuy" ${stock <= 0 ? "disabled" : ""}>바로 구매</button>
      </div>
    </div>`;

  const qtyInput = $("#detailQty");
  box.querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => {
    const v = Math.min(Math.max(1, Number(qtyInput.value) + Number(b.dataset.step)), Math.max(stock, 1));
    qtyInput.value = v;
  }));
  qtyInput.addEventListener("change", () => {
    qtyInput.value = Math.min(Math.max(1, Math.floor(Number(qtyInput.value) || 1)), Math.max(stock, 1));
  });
  $("#detailAdd").addEventListener("click", () => addToCart(p.id, qtyInput.value));
  $("#detailBuy").addEventListener("click", () => {
    if (addToCart(p.id, qtyInput.value)) location.hash = "#cart";
  });
}

function renderCart() {
  const cart = getCart();
  const list = $("#cartList");
  const summary = $("#cartSummary");
  if (cart.length === 0) {
    list.innerHTML = `<div class="cart-empty"><p>장바구니가 비어 있어요.</p><a href="#products" class="btn">상품 보러 가기</a></div>`;
    summary.hidden = true;
    return;
  }
  summary.hidden = false;
  list.innerHTML = cart.map((c) => {
    const p = findProduct(c.productId);
    const stock = getStock(p.id);
    return `
      <div class="cart-item">
        <img src="${p.image}" alt="${esc(p.name)}" ${IMG_FALLBACK}>
        <div>
          <p class="ci-name">${esc(p.name)}</p>
          <p class="ci-unit">${won(p.price)} · 재고 ${stock}개</p>
        </div>
        <div class="ci-right">
          <div class="qty">
            <button type="button" data-cq="${p.id}" data-d="-1" aria-label="수량 줄이기">−</button>
            <input type="number" value="${c.qty}" min="1" max="${stock}" data-ci="${p.id}" aria-label="${esc(p.name)} 수량">
            <button type="button" data-cq="${p.id}" data-d="1" aria-label="수량 늘리기">+</button>
          </div>
          <span class="ci-sum">${won(p.price * c.qty)}</span>
          <button type="button" class="del-btn" data-del="${p.id}">삭제</button>
        </div>
      </div>`;
  }).join("");

  const t = cartTotals();
  const left = SETTINGS.freeShippingOver - t.subtotal;
  summary.innerHTML = `
    <h3>결제 예정 금액</h3>
    <div class="sum-row"><span>상품 금액</span><span>${won(t.subtotal)}</span></div>
    <div class="sum-row"><span>배송비</span><span>${t.shipping ? won(t.shipping) : "무료"}</span></div>
    <div class="sum-row total"><span>합계</span><span>${won(t.total)}</span></div>
    <p class="sum-note">${left > 0 ? `${won(left)} 더 담으면 무료배송이에요.` : "무료배송 조건을 채웠어요."}</p>
    <a href="#checkout" class="btn btn-block">주문하기</a>`;
}

function renderCheckout() {
  const user = currentUser();
  if (!user) { toast("주문하려면 로그인해 주세요."); location.hash = "#login?next=checkout"; return; }
  if (getCart().length === 0) { location.hash = "#cart"; return; }

  // 처음 들어올 때 회원 정보로 채우기
  if (!$("#coName").value) $("#coName").value = user.name;
  if (!$("#coPhone").value) $("#coPhone").value = user.phone || "";
  $("#coPoint").value = 0;
  updateCheckoutSummary();
}

function getUsablePoint() {
  const user = currentUser();
  const { subtotal } = cartTotals();
  const raw = Math.floor((Number($("#coPoint").value) || 0) / SETTINGS.minPointUse) * SETTINGS.minPointUse;
  const maxUse = Math.min(user.point, subtotal);
  return Math.max(0, Math.min(raw, Math.floor(maxUse / SETTINGS.minPointUse) * SETTINGS.minPointUse));
}

function updateCheckoutSummary() {
  const user = currentUser();
  if (!user) return;
  const used = getUsablePoint();
  const t = cartTotals(used);
  const grade = gradeOf(user.totalAmount);
  const earn = Math.floor((t.subtotal - used) * grade.rate);
  const cart = getCart();

  $("#coPointInfo").textContent = `보유 ${pt(user.point)} · ${SETTINGS.minPointUse}P 단위로 상품 금액까지 사용할 수 있어요.`;
  $("#checkoutSummary").innerHTML = `
    <h3>주문 상품 ${cart.reduce((s, c) => s + c.qty, 0)}개</h3>
    ${cart.map((c) => { const p = findProduct(c.productId); return `<div class="sum-row"><span>${esc(p.name)} × ${c.qty}</span><span>${won(p.price * c.qty)}</span></div>`; }).join("")}
    <div class="sum-row total" style="font-size:1rem;font-weight:600"><span>상품 금액</span><span>${won(t.subtotal)}</span></div>
    <div class="sum-row"><span>배송비</span><span>${t.shipping ? won(t.shipping) : "무료"}</span></div>
    <div class="sum-row"><span>포인트 사용</span><span>-${pt(used)}</span></div>
    <div class="sum-row total"><span>최종 결제 금액</span><span>${won(t.total)}</span></div>
    <p class="sum-note">${esc(grade.name)} 등급 ${Math.round(grade.rate * 100)}% 적립 예정: <strong>${pt(earn)}</strong></p>
    <button type="submit" class="btn btn-block">체험 결제하기</button>`;
}

function placeOrder(e) {
  e.preventDefault();
  const user = currentUser();
  if (!user) { location.hash = "#login?next=checkout"; return; }
  const cart = getCart();
  if (cart.length === 0) { location.hash = "#cart"; return; }

  // 재고 다시 확인
  for (const c of cart) {
    if (c.qty > getStock(c.productId)) { toast(`${findProduct(c.productId).name} 재고가 부족해요.`); location.hash = "#cart"; return; }
  }

  const used = getUsablePoint();
  const t = cartTotals(used);
  const grade = gradeOf(user.totalAmount);
  const earn = Math.floor((t.subtotal - used) * grade.rate);
  const orders = store.get(KEY.orders, []);
  const orderId = "CH" + Date.now().toString().slice(-9);

  const order = {
    orderId,
    memberId: user.id,
    orderDate: nowText(),
    items: cart.map((c) => { const p = findProduct(c.productId); return { productId: p.id, name: p.name, price: p.price, qty: c.qty }; }),
    subtotal: t.subtotal,
    shipping: t.shipping,
    usedPoint: used,
    total: t.total,
    earnedPoint: earn,
    gradeName: grade.name,
    payMethod: document.querySelector('input[name="pay"]:checked').value,
    receiver: $("#coName").value.trim(),
    phone: $("#coPhone").value.trim(),
    address: $("#coAddr").value.trim(),
    memo: $("#coMemo").value.trim(),
    status: "결제완료(체험)"
  };
  orders.push(order);
  store.set(KEY.orders, orders);

  // 재고 줄이기
  cart.forEach((c) => setStock(c.productId, getStock(c.productId) - c.qty));

  // 포인트 · 누적 금액 · 등급
  const before = grade;
  if (used > 0) addPointLog(user.id, "사용", -used, `주문 ${orderId}`);
  if (earn > 0) addPointLog(user.id, "적립", earn, `주문 ${orderId} (${grade.name} ${Math.round(grade.rate * 100)}%)`);
  user.point = user.point - used + earn;
  user.totalAmount += t.subtotal;
  updateMember(user);
  const after = gradeOf(user.totalAmount);

  saveCart([]);
  $("#checkoutForm").reset();
  location.hash = "#complete/" + orderId;
  if (after.level > before.level) toast(`축하해요! ${after.name} 등급이 되었어요.`);
}

function renderComplete(orderId) {
  const order = store.get(KEY.orders, []).find((o) => o.orderId === orderId);
  const box = $("#completeBox");
  if (!order) { box.innerHTML = `<p>주문을 찾을 수 없어요.</p><div class="btns"><a href="#home" class="btn">홈으로</a></div>`; return; }
  box.innerHTML = `
    <div class="check-icon">✓</div>
    <h2>주문이 완료됐어요</h2>
    <p class="muted small">체험 결제라 실제 금액은 나가지 않았어요.</p>
    <div style="margin-top:20px">
      <div class="sum-row"><span>주문번호</span><span>${esc(order.orderId)}</span></div>
      <div class="sum-row"><span>결제 수단</span><span>${esc(order.payMethod)}</span></div>
      <div class="sum-row"><span>포인트 사용</span><span>-${pt(order.usedPoint)}</span></div>
      <div class="sum-row"><span>적립 포인트</span><span>+${pt(order.earnedPoint)}</span></div>
      <div class="sum-row total"><span>결제 금액</span><span>${won(order.total)}</span></div>
    </div>
    <div class="btns"><a href="#mypage" class="btn">주문 내역 보기</a><a href="#products" class="btn btn-line">쇼핑 계속하기</a></div>`;
}

function renderMypage() {
  const user = currentUser();
  if (!user) { location.hash = "#login?next=mypage"; return; }
  const grade = gradeOf(user.totalAmount);
  const next = nextGrade(grade);
  const percent = next ? Math.min(100, Math.round(((user.totalAmount - grade.minAmount) / (next.minAmount - grade.minAmount)) * 100)) : 100;

  $("#myTop").innerHTML = `
    <div class="my-stat">
      <p class="label">회원 정보</p>
      <p class="value">${esc(user.name)}님</p>
      <p class="sub">${esc(user.id)} · ${esc(user.email)}<br>가입일 ${esc(user.joinDate.slice(0, 10))}</p>
    </div>
    <div class="my-stat">
      <p class="label">회원 등급</p>
      <p class="value">${esc(grade.name)} · ${Math.round(grade.rate * 100)}% 적립</p>
      <div class="grade-bar"><span style="width:${percent}%"></span></div>
      <p class="sub">${next ? `${won(next.minAmount - user.totalAmount)} 더 구매하면 ${esc(next.name)} 등급` : "최고 등급이에요."} (누적 ${won(user.totalAmount)})</p>
    </div>
    <div class="my-stat">
      <p class="label">보유 포인트</p>
      <p class="value">${pt(user.point)}</p>
      <p class="sub">주문할 때 ${SETTINGS.minPointUse}P 단위로 사용할 수 있어요.</p>
    </div>`;

  const orders = store.get(KEY.orders, []).filter((o) => o.memberId === user.id).reverse();
  $("#orderList").innerHTML = orders.length === 0
    ? `<div class="cart-empty"><p>아직 주문 내역이 없어요.</p><a href="#products" class="btn">쇼핑하러 가기</a></div>`
    : orders.map((o) => `
      <div class="order-card">
        <div class="order-head"><span>${esc(o.orderDate)} · ${esc(o.orderId)}</span><span class="status">${esc(o.status)}</span></div>
        <p class="order-items">${o.items.map((i) => `${esc(i.name)} × ${i.qty}`).join(", ")}</p>
        <div class="order-foot"><span>받는 분 ${esc(o.receiver)}</span><span>결제 ${won(o.total)} · 적립 +${pt(o.earnedPoint)}</span></div>
      </div>`).join("");

  const logs = store.get(KEY.points, []).filter((l) => l.memberId === user.id).reverse();
  $("#pointList").innerHTML = `
    <div class="table-wrap">
      <table class="point-table">
        <thead><tr><th>날짜</th><th>구분</th><th>포인트</th><th>내용</th></tr></thead>
        <tbody>${logs.map((l) => `
          <tr><td>${esc(l.date)}</td><td>${esc(l.type)}</td>
          <td class="${l.amount >= 0 ? "plus" : "minus"}">${l.amount >= 0 ? "+" : ""}${pt(l.amount)}</td>
          <td>${esc(l.memo)}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

/* =========================================================
   [7] 화면 이동 (주소 # 기준)
   ========================================================= */
function route() {
  const raw = decodeURIComponent(location.hash.slice(1)) || "home";
  const [path, query = ""] = raw.split("?");
  const params = {};
  query.split("&").filter(Boolean).forEach((kv) => { const [k, v = ""] = kv.split("="); params[k] = v; });
  const [name, arg] = path.split("/");
  return { name, arg, params };
}

const VIEWS = ["home", "products", "detail", "cart", "checkout", "complete", "login", "signup", "mypage"];

function show(view) {
  VIEWS.forEach((v) => { $("#view-" + v).hidden = v !== view; });
  window.scrollTo(0, 0);
}

function onRoute() {
  const { name, arg, params } = route();
  switch (name) {
    case "products":
      if (params.cat !== undefined) listState.cat = params.cat || "전체";
      if (params.q !== undefined) listState.q = params.q;
      show("products"); renderList(); break;
    case "product": show("detail"); renderDetail(arg); break;
    case "cart": show("cart"); renderCart(); break;
    case "checkout": show("checkout"); renderCheckout(); break;
    case "complete": show("complete"); renderComplete(arg); break;
    case "login": if (currentUser()) { location.hash = "#mypage"; return; } show("login"); break;
    case "signup": if (currentUser()) { location.hash = "#mypage"; return; } show("signup"); break;
    case "mypage": show("mypage"); renderMypage(); break;
    default: show("home"); renderHome();
  }
  // 메뉴 강조
  document.querySelectorAll("#navList a").forEach((a) => {
    a.classList.toggle("is-current", name === "products" && !listState.q && a.dataset.cat === listState.cat);
  });
}

function goCategory(cat) {
  listState.q = "";
  $("#searchInput").value = "";
  location.hash = "#products?cat=" + encodeURIComponent(cat);
}

/* =========================================================
   [8] 메인 슬라이드 (6초마다 교차)
   ========================================================= */
function initSlider() {
  const slides = document.querySelectorAll("#slider .slide");
  const dots = $("#sliderDots");
  let index = 0;
  let timer = null;

  dots.innerHTML = [...slides].map((_, i) =>
    `<button type="button" role="tab" aria-label="${i + 1}번 슬라이드" class="${i === 0 ? "is-active" : ""}" data-go="${i}"></button>`).join("");

  function go(i) {
    slides[index].classList.remove("is-active");
    dots.children[index].classList.remove("is-active");
    index = (i + slides.length) % slides.length;
    slides[index].classList.add("is-active");
    dots.children[index].classList.add("is-active");
  }
  function start() { clearInterval(timer); timer = setInterval(() => go(index + 1), 6000); }

  dots.addEventListener("click", (e) => {
    const b = e.target.closest("[data-go]");
    if (b) { go(Number(b.dataset.go)); start(); }
  });
  start();
}

/* =========================================================
   [9] 이벤트 연결 · 시작
   ========================================================= */
function init() {
  // 분류 메뉴 만들기
  $("#navList").insertAdjacentHTML("beforeend",
    CATEGORIES.map((c) => `<li><a href="#products" data-cat="${esc(c.name)}">${esc(c.name)}</a></li>`).join(""));

  // 분류 이동 (메뉴, 분류 카드, 슬라이드 버튼)
  document.addEventListener("click", (e) => {
    const catEl = e.target.closest("[data-cat]");
    if (catEl) { e.preventDefault(); goCategory(catEl.dataset.cat); return; }

    const add = e.target.closest("[data-add]");
    if (add) { addToCart(Number(add.dataset.add), 1); onRouteSoft(); return; }

    const filter = e.target.closest("[data-filter]");
    if (filter) { goCategory(filter.dataset.filter); return; }

    const cq = e.target.closest("[data-cq]");
    if (cq) {
      const id = Number(cq.dataset.cq);
      const item = getCart().find((c) => c.productId === id);
      if (item) changeQty(id, item.qty + Number(cq.dataset.d));
      return;
    }
    const del = e.target.closest("[data-del]");
    if (del) { removeFromCart(Number(del.dataset.del)); }
  });

  document.addEventListener("change", (e) => {
    if (e.target.matches("[data-ci]")) changeQty(Number(e.target.dataset.ci), e.target.value);
  });

  // 검색
  $("#searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = $("#searchInput").value.trim();
    listState.q = q;
    listState.cat = "전체";
    location.hash = "#products?q=" + encodeURIComponent(q);
    if (route().name === "products") renderList();
  });

  $("#sortSelect").addEventListener("change", (e) => { listState.sort = e.target.value; renderList(); });

  $("#signupForm").addEventListener("submit", signup);
  $("#loginForm").addEventListener("submit", login);
  $("#logoutBtn").addEventListener("click", logout);

  $("#checkoutForm").addEventListener("submit", placeOrder);
  $("#coPoint").addEventListener("input", updateCheckoutSummary);
  $("#coPoint").addEventListener("change", () => { $("#coPoint").value = getUsablePoint(); updateCheckoutSummary(); });
  $("#usePointAll").addEventListener("click", () => {
    const user = currentUser();
    if (!user) return;
    $("#coPoint").value = user.point;
    $("#coPoint").value = getUsablePoint();
    updateCheckoutSummary();
  });

  window.addEventListener("hashchange", onRoute);
  initSlider();
  refreshHeader();
  onRoute();
}

// 장바구니 담기 후 재고 표시만 새로 그리기
function onRouteSoft() {
  const { name } = route();
  if (name === "products") renderList();
  if (name === "home" || name === "") renderHome();
}

document.addEventListener("DOMContentLoaded", init);
