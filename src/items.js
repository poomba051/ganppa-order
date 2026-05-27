export const CATEGORIES = [
  {
    id: 'drink', name: '음료류', color: '#d4a843',
    items: [
      { id: 'sapporo', name: '삿포로 생맥주', unit: '통', min1: 20, min2: 36 },
      { id: 'yebisu20', name: '에비스 생맥주 (20L)', unit: '통', min1: 10, min2: null },
      { id: 'yebisu10', name: '에비스 생맥주 (10L)', unit: '통', min1: null, min2: 16 },
      { id: 'nonalcohol', name: '논알콜 맥주 (클라우드)', unit: '박스', min1: 0.5, min2: 0.5 },
      { id: 'ramune', name: '논알콜 소다 (라무네)', unit: '박스', min1: 0.5, min2: 0.5 },
      { id: 'daiyame', name: '다이야메', unit: '병', min1: 3, min2: 3 },
    ]
  },
  {
    id: 'sauce', name: '소스류', color: '#e07755',
    items: [
      { id: 'sauce_gyoza', name: '교자 소스 (간빠)', unit: 'EA', min1: 2, min2: 3 },
      { id: 'sauce_napo', name: '나폴리탄 소스 (간빠)', unit: 'EA', min1: 2, min2: 3 },
      { id: 'sauce_ramen', name: '라멘 타래 소스 (간빠)', unit: 'EA', min1: 2, min2: 3 },
      { id: 'sauce_ooi', name: '오이 소스 (간빠)', unit: 'EA', min1: 2, min2: 3 },
      { id: 'sauce_sesame', name: '참깨 소스 (간빠)', unit: 'EA', min1: 2, min2: 3 },
      { id: 'sauce_chicken', name: '치킨 타래 소스 (간빠)', unit: 'EA', min1: 2, min2: 4 },
      { id: 'sauce_yakisoba', name: '야끼소바 소스 (오타후쿠)', unit: 'EA', min1: 3, min2: 4 },
      { id: 'sauce_ponzu', name: '폰즈 유즈 소스 (오타후쿠)', unit: '개', min1: 0.5, min2: 0.5 },
      { id: 'mayo', name: '큐피 마요네즈', unit: '박스', min1: 0.5, min2: 0.5 },
    ]
  },
  {
    id: 'noodle', name: '면류', color: '#c47a3a',
    items: [
      { id: 'spaghetti', name: '스파게티면 (디벨라)', unit: 'EA', min1: 6, min2: 8 },
      { id: 'fresh_ramen', name: '생라멘', unit: '개', min1: 0.5, min2: 0.5 },
      { id: 'yakisoba', name: '야끼소바면', unit: '팩', min1: 8, min2: 12 },
      { id: 'ikaso', name: '이까소면', unit: '팩', min1: 2, min2: 3 },
    ]
  },
  {
    id: 'veggie', name: '채소류', color: '#7bc47a',
    items: [
      { id: 'green_onion', name: '대파', unit: '단', min1: 2, min2: 2 },
      { id: 'tomato', name: '대추 방울토마토', unit: '팩', min1: 2, min2: 3 },
      { id: 'cabbage', name: '양배추', unit: '통', min1: 2, min2: 3 },
      { id: 'carrot', name: '당근 (세척)', unit: 'KG', min1: 3, min2: 3 },
      { id: 'garlic', name: '깐마늘 (홀)', unit: 'KG', min1: 1, min2: 1 },
      { id: 'cucumber', name: '백오이', unit: 'KG', min1: 5, min2: 5 },
      { id: 'onion', name: '양파', unit: '망', min1: 0.5, min2: 0.5 },
    ]
  },
  {
    id: 'frozen', name: '냉동류', color: '#5b8cee',
    items: [
      { id: 'gyoza', name: '왕교자 만두 (비비고)', unit: '팩', min1: 6, min2: 6 },
      { id: 'ojok', name: '동전 오족', unit: '팩', min1: 2, min2: 3 },
      { id: 'frank', name: '알뜰 후랑크 (롯데)', unit: 'EA', min1: 2, min2: 2 },
      { id: 'fishcake', name: '어묵채 (대양)', unit: '팩', min1: 2, min2: 2 },
      { id: 'ice_stra', name: '아이스크림 딸기', unit: '개', min1: 0.5, min2: 0.5 },
      { id: 'ice_blue', name: '아이스크림 블루베리', unit: '개', min1: 0.5, min2: 0.5 },
      { id: 'ice_cookie', name: '아이스크림 쿠키앤크림', unit: '개', min1: 0.5, min2: 0.5 },
      { id: 'chicken_skin', name: '닭껍질', unit: '박스', min1: 2, min2: 3 },
      { id: 'chicken_leg', name: '닭다리', unit: '박스', min1: 1, min2: 1.5 },
      { id: 'chicken_wing', name: '닭날개', unit: '박스', min1: 2, min2: 3 },
      { id: 'chicken_bone', name: '닭뼈', unit: '개', min1: 4, min2: 6 },
      { id: 'mince', name: '민찌', unit: '박스', min1: 1, min2: 1.5 },
    ]
  },
  {
    id: 'seasoning', name: '조미료·양념류', color: '#b07de8',
    items: [
      { id: 'wasabi', name: '생와사비', unit: '팩', min1: 0.5, min2: 0.5 },
      { id: 'ginger', name: '초생강', unit: '팩', min1: 2, min2: 2 },
      { id: 'sugar', name: '흰설탕', unit: '팩', min1: 2, min2: 2 },
      { id: 'salt', name: '맛소금', unit: '팩', min1: 0.5, min2: 0.5 },
      { id: 'miwon', name: '미원', unit: '팩', min1: 0.5, min2: 0.5 },
      { id: 'pepper', name: '굵은 흑후추', unit: '통', min1: 2, min2: 2 },
      { id: 'redpepper', name: '건고추 (통)', unit: '팩', min1: 0.5, min2: 0.5 },
      { id: 'shichimi', name: '시치미', unit: '팩', min1: 2, min2: 3 },
      { id: 'katsuobushi', name: '가쓰오부시', unit: '박스', min1: 1, min2: 1 },
      { id: 'aonori', name: '파래가루', unit: '팩', min1: 0.5, min2: 0.5 },
      { id: 'mushroom', name: '표고버섯 슬라이스', unit: '팩', min1: 0.5, min2: 0.5 },
      { id: 'peanut', name: '볶은 땅콩', unit: '팩', min1: 0.5, min2: 0.5 },
      { id: 'oil', name: '식용유', unit: '통', min1: 3, min2: 3 },
      { id: 'chili_oil', name: '고추맛 기름', unit: '통', min1: 2, min2: 2 },
      { id: 'starch', name: '감자전분', unit: 'EA', min1: 2, min2: 1 },
      { id: 'ramen_spice', name: '라면 스프', unit: '개', min1: 0.5, min2: 0.5 },
    ]
  },
  {
    id: 'dairy', name: '유제품·기타', color: '#4caf7d',
    items: [
      { id: 'butter', name: '앵커 버터', unit: 'EA', min1: 4, min2: 4 },
      { id: 'cheese', name: '체다 슬라이스 치즈', unit: '팩', min1: 0.5, min2: 0.5 },
      { id: 'yogurt', name: '플레인 요거트', unit: '통', min1: 2, min2: 2 },
      { id: 'condensed', name: '연유', unit: '통', min1: 2, min2: 2 },
      { id: 'honey', name: '사양 벌꿀', unit: '개', min1: 0.5, min2: 0.5 },
    ]
  },
  {
    id: 'supply', name: '비품', color: '#9b7de8',
    items: [
      { id: 'cup14', name: '14온즈', unit: '박스', min1: 0.5, min2: 0.5 },
      { id: 'trash30', name: '쓰레기봉투 30L', unit: '박스', min1: 0.5, min2: 0.5 },
      { id: 'trash60', name: '쓰레기봉투 60L', unit: '박스', min1: 0.5, min2: 0.5 },
      { id: 'trash75', name: '쓰레기봉투 75L', unit: '개', min1: 5, min2: 5 },
      { id: 'bag_s', name: '각대봉투 (특소)', unit: '묶음', min1: 1, min2: 1 },
      { id: 'napkin', name: '냅킨', unit: '박스', min1: 0.5, min2: 0.5 },
      { id: 'glove_l', name: '니트릴장갑 L', unit: '통', min1: 1, min2: 1 },
      { id: 'glove_m', name: '니트릴장갑 M', unit: '통', min1: 1, min2: 1 },
      { id: 'wet_wipe', name: '물티슈', unit: '박스', min1: 0.5, min2: 0.5 },
      { id: 'detergent', name: '분말세제', unit: '통', min1: 0.5, min2: 0.5 },
      { id: 'bilji', name: '빌지', unit: '박스', min1: 0.5, min2: 0.5 },
      { id: 'ppopgi', name: '뽑기판', unit: '개', min1: 2, min2: 2 },
      { id: 'chlorine', name: '락스', unit: '통', min1: 2, min2: 2 },
      { id: 'wrap', name: '랩', unit: '개', min1: 1, min2: 1 },
      { id: 'sanitizer', name: '살균소독제', unit: '통', min1: 0.5, min2: 0.5 },
      { id: 'rollbag_s', name: '위생롤백 소', unit: '개', min1: 1, min2: 1 },
      { id: 'rollbag_m', name: '위생롤백 중', unit: '개', min1: 1, min2: 1 },
      { id: 'dish_soap', name: '주방세제', unit: '개', min1: 2, min2: 2 },
      { id: 'scrubber', name: '철수세미', unit: '개', min1: 4, min2: 4 },
      { id: 'kitchen_towel', name: '키친타월', unit: '박스', min1: 0.5, min2: 0.5 },
      { id: 'toilet_chlorine', name: '화장실 락스', unit: '통', min1: 2, min2: 2 },
      { id: 'toilet_paper', name: '화장지', unit: '박스', min1: 1, min2: 1 },
      { id: 'mop', name: '회전걸레', unit: '개', min1: 1, min2: 1 },
      { id: 'chopsticks', name: '젓가락', unit: '박스', min1: 0.5, min2: 0.5 },
      { id: 'haedong', name: '해동지', unit: '박스', min1: 0.5, min2: 0.5 },
    ]
  }
]

export function getMin(item, store) {
  return store === '1호점' ? item.min1 : item.min2
}

export function calcExpectedDate(route, orderDate) {
  const d = orderDate ? new Date(orderDate) : new Date()
  const day = d.getDay()
  if (route === '카톡' || route === '쿠팡') {
    d.setDate(d.getDate() + 1); return d
  }
  if (route === '포스') {
    if (day === 1 || day === 2) { d.setDate(d.getDate() + (4 - day)); return d }
    if (day === 3 || day === 4) { d.setDate(d.getDate() + (6 - day)); return d }
    if (day === 5) { d.setDate(d.getDate() + 3); return d }
    if (day === 6) { d.setDate(d.getDate() + 3); return d }
    if (day === 0) { d.setDate(d.getDate() + 2); return d }
  }
  return d
}

export function formatDate(date) {
  if (!date) return '-'
  const d = date.toDate ? date.toDate() : new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()}(${['일','월','화','수','목','금','토'][d.getDay()]})`
}
