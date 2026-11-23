/* =========================================================
   C:hand - Supabase 연결 (db.js)
   ---------------------------------------------------------
   불러오는 순서: supabase-js(CDN) → db.js → script.js
   여기에는 공개 키(Publishable key)만 넣습니다.
   공개 키는 누구나 볼 수 있으므로, 데이터는 Supabase 의
   보안 규칙(RLS)이 지킵니다. Secret key 는 절대 넣지 마세요.
   ========================================================= */

const SUPABASE_URL = "https://odmomtfuavjuqktifcol.supabase.co";
const SUPABASE_KEY = "sb_publishable_5ezrhDfWoMR7bYC5DudUUA_9kVLo-DX";

// 표 이름 (SQL 로 만든 이름과 똑같이)
const TABLE = {
  profiles: "shop_profiles",       // 회원
  products: "shop_products",       // 상품
  orders: "shop_orders",           // 주문
  orderItems: "shop_order_items"   // 주문 상세
};

// 연결 변수: 다른 파일에서는 db 로 씁니다
const db = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

// 연결 확인: 상품 수를 세어 콘솔에 찍기
async function checkConnection() {
  if (!db) {
    console.error("연결 실패: supabase-js 를 불러오지 못했어요. 인터넷 연결이나 index.html 의 CDN 주소를 확인하세요.");
    return;
  }
  try {
    const { count, error } = await db
      .from(TABLE.products)
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("연결 실패:", error.message);
      return;
    }
    console.log(`연결 성공: 상품 ${count}개`);
  } catch (err) {
    console.error("연결 실패:", err.message);
  }
}

checkConnection();
