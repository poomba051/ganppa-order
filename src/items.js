// 간빠맥주 전체 발주 품목
export const CATEGORIES = [
  {
    id: 'beer',
    name: '맥주/주류',
    color: '#d4a843',
    items: [
      { id: 'sapporo20', name: '삿포로 20L', unit: '통' },
      { id: 'yebisu20', name: '에비스 20L', unit: '통', store: '1호점' },
      { id: 'yebisu10', name: '에비스 10L', unit: '통', store: '2호점' },
      { id: 'asahi_can', name: '아사히 캔', unit: '박스' },
      { id: 'kirin_can', name: '기린 캔', unit: '박스' },
      { id: 'sapporo_can', name: '삿포로 캔', unit: '박스' },
      { id: 'heineken', name: '하이네켄 캔', unit: '박스' },
      { id: 'soju', name: '소주', unit: '박스' },
      { id: 'maesil', name: '매실주', unit: '병' },
    ]
  },
  {
    id: 'frozen',
    name: '냉동류',
    color: '#5b8cee',
    items: [
      { id: 'chicken_skin', name: '닭껍질', unit: '박스' },
      { id: 'chicken_leg', name: '닭다리', unit: '박스' },
      { id: 'chicken_wing', name: '닭날개', unit: '박스' },
      { id: 'chicken_bone', name: '닭뼈', unit: '개' },
      { id: 'mince', name: '민찌', unit: '박스' },
      { id: 'gyoza', name: '교자', unit: '박스' },
      { id: 'karaage', name: '가라아게', unit: '박스' },
      { id: 'takoyaki', name: '타코야끼', unit: '박스' },
      { id: 'okonomiyaki', name: '오코노미야끼', unit: '박스' },
      { id: 'icecream_vanilla', name: '아이스크림 바닐라', unit: '박스' },
      { id: 'icecream_cookie', name: '아이스크림 쿠키앤크림', unit: '박스' },
    ]
  },
  {
    id: 'fresh',
    name: '냉장류',
    color: '#4caf7d',
    items: [
      { id: 'cabbage', name: '양배추', unit: 'EA' },
      { id: 'garlic', name: '깐마늘', unit: 'KG' },
      { id: 'ramen_fresh', name: '생라멘', unit: '개' },
      { id: 'tofu', name: '두부', unit: '모' },
      { id: 'egg', name: '계란', unit: '판' },
      { id: 'butter', name: '버터', unit: '개' },
      { id: 'milk', name: '우유', unit: 'L' },
    ]
  },
  {
    id: 'dry',
    name: '드라이',
    color: '#c47a3a',
    items: [
      { id: 'yakisoba', name: '야끼소바면', unit: '박스' },
      { id: 'udon', name: '우동면', unit: '박스' },
      { id: 'rice', name: '쌀', unit: 'KG' },
      { id: 'katsuobushi', name: '가쓰오부시', unit: '박스' },
      { id: 'kombu', name: '다시마', unit: '봉' },
      { id: 'nori', name: '노리', unit: '봉' },
      { id: 'salt', name: '소금', unit: 'KG' },
      { id: 'sugar', name: '설탕', unit: 'KG' },
    ]
  },
  {
    id: 'sauce',
    name: '소스류',
    color: '#e07755',
    items: [
      { id: 'soy', name: '간장', unit: 'L' },
      { id: 'mirin', name: '미림', unit: 'L' },
      { id: 'tsuyu', name: '쯔유', unit: 'L' },
      { id: 'gyoza_sauce', name: '교자소스', unit: 'EA' },
      { id: 'tare', name: '타레', unit: 'L' },
      { id: 'mayo', name: '마요네즈', unit: '개' },
      { id: 'ketchup', name: '케찹', unit: '개' },
      { id: 'ponzu', name: '폰즈', unit: 'L' },
    ]
  },
  {
    id: 'veggie',
    name: '야채류',
    color: '#7bc47a',
    items: [
      { id: 'onion', name: '양파', unit: 'KG' },
      { id: 'green_onion', name: '대파', unit: '단' },
      { id: 'sprout', name: '숙주', unit: 'KG' },
      { id: 'carrot', name: '당근', unit: 'KG' },
      { id: 'bok_choy', name: '청경채', unit: 'KG' },
      { id: 'mushroom', name: '버섯', unit: 'KG' },
    ]
  },
  {
    id: 'supply',
    name: '비품',
    color: '#9b7de8',
    items: [
      { id: 'gloves', name: '위생장갑', unit: '박스' },
      { id: 'bag', name: '위생백', unit: '박스' },
      { id: 'wrap', name: '랩', unit: '개' },
      { id: 'foil', name: '호일', unit: '개' },
      { id: 'cup', name: '일회용컵', unit: '박스' },
      { id: 'straw', name: '빨대', unit: '박스' },
      { id: 'napkin', name: '냅킨', unit: '박스' },
      { id: 'dish_soap', name: '주방세제', unit: '개' },
      { id: 'sponge', name: '수세미', unit: '개' },
      { id: 'tissue', name: '화장지', unit: '롤' },
      { id: 'trash_bag', name: '쓰레기봉투', unit: '박스' },
    ]
  }
]

// 발주경로별 예상 입고일 계산
export function calcExpectedDate(route, orderDate) {
  const d = orderDate ? new Date(orderDate) : new Date()
  const day = d.getDay() // 0=일, 1=월, 2=화, 3=수, 4=목, 5=금, 6=토

  if (route === '카톡' || route === '쿠팡') {
    d.setDate(d.getDate() + 1)
    return d
  }

  if (route === '포스') {
    // 월(1)/화(2) → 목(4)
    if (day === 1 || day === 2) { d.setDate(d.getDate() + (4 - day)); return d }
    // 수(3)/목(4) → 토(6)
    if (day === 3 || day === 4) { d.setDate(d.getDate() + (6 - day)); return d }
    // 금(5) → 월
    if (day === 5) { d.setDate(d.getDate() + 3); return d }
    // 토(6)/일(0) → 화(2)
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
