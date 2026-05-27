import React, { useState, useEffect } from 'react'
import { db } from './firebase'
import {
  collection, addDoc, onSnapshot, updateDoc, doc,
  query, orderBy, Timestamp
} from 'firebase/firestore'
import { CATEGORIES, getMin, calcExpectedDate, formatDate } from './items'

const STORES = ['1호점', '2호점']
const ROUTES = ['포스', '카톡', '쿠팡']
const ORDERERS = ['신', '직원A', '직원B', '직원C']
const ROUTE_COLOR = { '포스': '#f0f0f0', '카톡': '#4caf7d', '쿠팡': '#e05555' }
const STATUS_CONFIG = {
  '대기중':  { color: '#d4a843', bg: 'rgba(212,168,67,0.15)' },
  '입고완료': { color: '#4caf7d', bg: 'rgba(76,175,125,0.15)' },
  '미입고':  { color: '#e05555', bg: 'rgba(224,85,85,0.15)' },
}

export default function App() {
  const [tab, setTab] = useState('order')
  const [store, setStore] = useState('1호점')
  const [orderer, setOrderer] = useState('신')
  const [current, setCurrent] = useState({})   // 현재고량
  const [orderQty, setOrderQty] = useState({})  // 발주량 (수동 오버라이드)
  const [routes, setRoutes] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [orders, setOrders] = useState([])
  const [filterStore, setFilterStore] = useState('전체')
  const [filterStatus, setFilterStatus] = useState('전체')
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [])

  // 매장 변경시 입력값 리셋
  useEffect(() => {
    setCurrent({}); setOrderQty({}); setRoutes({})
  }, [store])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  // 발주량 계산: 수동입력 우선, 없으면 max(0, 최소-현재)
  const getOrderQty = (item) => {
    if (orderQty[item.id] !== undefined) return orderQty[item.id]
    const min = getMin(item, store)
    if (min === null) return ''
    const cur = current[item.id]
    if (cur === undefined || cur === '') return ''
    return Math.max(0, min - Number(cur))
  }

  const handleCurrentChange = (itemId, val) => {
    setCurrent(p => ({ ...p, [itemId]: val }))
    // 현재고량 바뀌면 수동오버라이드 초기화
    setOrderQty(p => { const n = { ...p }; delete n[itemId]; return n })
  }

  const handleOrderQtyChange = (itemId, val) => {
    setOrderQty(p => ({ ...p, [itemId]: val === '' ? undefined : val }))
  }

  const setRoute = (itemId, route) => {
    setRoutes(p => ({ ...p, [itemId]: p[itemId] === route ? '' : route }))
  }

  // 발주 대상 품목 (발주량 > 0)
  const toOrder = CATEGORIES.flatMap(cat => cat.items).filter(item => {
    const qty = getOrderQty(item)
    return qty !== '' && Number(qty) > 0
  })

  const handleSubmit = async () => {
    if (toOrder.length === 0) { showToast('발주할 품목이 없어요'); return }
    const missing = toOrder.filter(item => !routes[item.id])
    if (missing.length > 0) { showToast(`발주경로를 선택하세요 (${missing[0].name} 외 ${missing.length - 1}개)`); return }

    setSubmitting(true)
    try {
      const now = new Date()
      const items = toOrder.map(item => {
        const route = routes[item.id]
        const qty = Number(getOrderQty(item))
        const expected = calcExpectedDate(route, now)
        const cat = CATEGORIES.find(c => c.items.some(i => i.id === item.id))
        return {
          itemId: item.id, itemName: item.name, unit: item.unit,
          categoryName: cat?.name || '',
          minQty: getMin(item, store),
          currentQty: current[item.id] !== undefined ? Number(current[item.id]) : null,
          qty, route,
          expectedDate: Timestamp.fromDate(expected),
          status: '대기중'
        }
      })
      await addDoc(collection(db, 'orders'), {
        store, orderer, items, createdAt: Timestamp.fromDate(now)
      })
      setCurrent({}); setOrderQty({}); setRoutes({})
      showToast(`발주 등록 완료 (${items.length}개 품목)`)
      setTab('history')
    } catch (e) {
      showToast('오류가 발생했어요'); console.error(e)
    }
    setSubmitting(false)
  }

  const updateItemStatus = async (orderId, itemIdx, newStatus) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return
    const newItems = order.items.map((item, i) => i === itemIdx ? { ...item, status: newStatus } : item)
    await updateDoc(doc(db, 'orders', orderId), { items: newItems })
    showToast('상태 변경')
  }

  const filtered = orders.filter(o => {
    if (filterStore !== '전체' && o.store !== filterStore) return false
    if (filterStatus !== '전체' && !o.items.some(i => i.status === filterStatus)) return false
    return true
  })

  const pendingCount = orders.reduce((n, o) => n + o.items.filter(i => i.status === '대기중').length, 0)

  return (
    <div style={S.root}>
      {/* 헤더 */}
      <div style={S.header}>
        <div style={S.logo}>🍺 간빠맥주 발주관리</div>
      </div>

      {/* 탭 */}
      <div style={S.tabs}>
        {[['order','발주 입력'], ['history','발주 내역']].map(([key, label]) => (
          <button key={key} style={{ ...S.tab, ...(tab === key ? S.tabOn : {}) }} onClick={() => setTab(key)}>
            {label}
            {key === 'history' && pendingCount > 0 && <span style={S.badge}>{pendingCount}</span>}
          </button>
        ))}
      </div>

      {/* ── 발주 입력 ── */}
      {tab === 'order' && (
        <div style={S.content}>
          {/* 매장 + 발주자 */}
          <div style={S.topRow}>
            <div style={S.fieldBox}>
              <div style={S.label}>매장</div>
              <div style={S.pillRow}>
                {STORES.map(s => (
                  <button key={s} style={{ ...S.pill, ...(store === s ? S.pillOn : {}) }} onClick={() => setStore(s)}>{s}</button>
                ))}
              </div>
            </div>
            <div style={S.fieldBox}>
              <div style={S.label}>발주자</div>
              <select value={orderer} onChange={e => setOrderer(e.target.value)} style={S.select}>
                {ORDERERS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* 컬럼 헤더 */}
          <div style={S.colHeader}>
            <span style={{ flex: 1 }}>품목</span>
            <span style={S.col}>최소</span>
            <span style={S.col}>현재고</span>
            <span style={S.col}>발주량</span>
            <span style={{ width: 90 }}>경로</span>
          </div>

          {/* 카테고리별 품목 */}
          {CATEGORIES.map(cat => (
            <div key={cat.id} style={S.catBlock}>
              <div style={{ ...S.catHeader, borderLeftColor: cat.color }}>{cat.name}</div>
              {cat.items.map(item => {
                const min = getMin(item, store)
                if (min === null) return null  // 해당 매장 미취급 품목 숨김
                const oqty = getOrderQty(item)
                const needOrder = oqty !== '' && Number(oqty) > 0
                return (
                  <div key={item.id} style={{ ...S.itemRow, ...(needOrder ? S.itemRowActive : {}) }}>
                    {/* 품목명 */}
                    <div style={{ ...S.itemName, ...(needOrder ? { color: '#f0f0f0' } : {}) }}>
                      {item.name}
                      <span style={S.unit}>{item.unit}</span>
                    </div>
                    {/* 최소필요량 */}
                    <div style={S.minQty}>{min}</div>
                    {/* 현재고량 */}
                    <input
                      type="number" min="0" placeholder="—"
                      value={current[item.id] ?? ''}
                      onChange={e => handleCurrentChange(item.id, e.target.value)}
                      style={S.numInput}
                    />
                    {/* 발주량 */}
                    <input
                      type="number" min="0" placeholder="—"
                      value={oqty === '' ? '' : oqty}
                      onChange={e => handleOrderQtyChange(item.id, e.target.value)}
                      style={{
                        ...S.numInput,
                        ...(needOrder ? { color: '#d4a843', fontWeight: 700, borderColor: '#d4a843' } : {})
                      }}
                    />
                    {/* 경로 선택 */}
                    <div style={S.routeBtns}>
                      {ROUTES.map(r => (
                        <button key={r} onClick={() => setRoute(item.id, r)}
                          style={{
                            ...S.routeBtn,
                            ...(routes[item.id] === r ? { background: ROUTE_COLOR[r], color: '#0f0f0f', fontWeight: 700, borderColor: ROUTE_COLOR[r] } : {})
                          }}
                        >{r}</button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}

          {/* 제출 */}
          {toOrder.length > 0 && (
            <div style={S.submitArea}>
              <div style={S.summaryList}>
                {ROUTES.map(r => {
                  const items = toOrder.filter(i => routes[i.id] === r)
                  if (!items.length) return null
                  return (
                    <div key={r} style={S.summaryRow}>
                      <span style={{ color: ROUTE_COLOR[r], fontWeight: 700, minWidth: 28 }}>{r}</span>
                      <span style={{ color: '#888', fontSize: 12 }}>
                        {items.length}개 품목 → {formatDate(calcExpectedDate(r))} 입고예정
                      </span>
                    </div>
                  )
                })}
                {toOrder.filter(i => !routes[i.id]).length > 0 && (
                  <div style={{ fontSize: 11, color: '#e05555', marginTop: 4 }}>
                    ⚠ 경로 미선택 {toOrder.filter(i => !routes[i.id]).length}개
                  </div>
                )}
              </div>
              <button onClick={handleSubmit} disabled={submitting} style={S.submitBtn}>
                {submitting ? '등록 중...' : `발주 등록 (${toOrder.length}개 품목)`}
              </button>
            </div>
          )}
          <div style={{ height: 80 }} />
        </div>
      )}

      {/* ── 발주 내역 ── */}
      {tab === 'history' && (
        <div style={S.content}>
          <div style={S.filterRow}>
            {['전체', ...STORES].map(s => (
              <button key={s} onClick={() => setFilterStore(s)}
                style={{ ...S.filterBtn, ...(filterStore === s ? S.filterBtnOn : {}) }}>{s}</button>
            ))}
            <div style={{ flex: 1 }} />
            {['전체', '대기중', '입고완료', '미입고'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                style={{ ...S.filterBtn, ...(filterStatus === s ? S.filterBtnOn : {}), fontSize: 11 }}>{s}</button>
            ))}
          </div>

          {filtered.length === 0 && <div style={S.empty}>발주 내역이 없어요</div>}

          {filtered.map(order => (
            <div key={order.id} style={S.orderCard}>
              <div style={S.orderHead} onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#d4a843', fontWeight: 700, fontSize: 13 }}>{order.store}</span>
                  <span style={{ color: '#888', fontSize: 12 }}>{order.createdAt ? formatDate(order.createdAt.toDate()) : '-'}</span>
                  <span style={{ color: '#555', fontSize: 11 }}>{order.orderer}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {['대기중','미입고'].map(s => {
                    const cnt = order.items.filter(i => i.status === s).length
                    return cnt > 0 ? (
                      <span key={s} style={{ ...S.dot, background: STATUS_CONFIG[s].color }}>{cnt}</span>
                    ) : null
                  })}
                  <span style={{ fontSize: 10, color: '#444' }}>{expandedOrder === order.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expandedOrder === order.id && (
                <div>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={S.histItem}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, flexWrap: 'wrap' }}>
                        <span style={{ ...S.routeTag, color: ROUTE_COLOR[item.route], borderColor: ROUTE_COLOR[item.route] }}>{item.route}</span>
                        <span style={{ fontSize: 13, color: '#e0e0e0' }}>{item.itemName}</span>
                        <span style={{ fontSize: 12, color: '#888' }}>{item.qty}{item.unit}</span>
                        <span style={{ fontSize: 11, color: '#555' }}>→ {item.expectedDate ? formatDate(item.expectedDate) : '-'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                          <button key={key} onClick={() => updateItemStatus(order.id, idx, key)}
                            style={{
                              padding: '3px 7px', borderRadius: 4, border: '1px solid',
                              fontSize: 10, fontWeight: item.status === key ? 700 : 400,
                              background: item.status === key ? cfg.bg : 'transparent',
                              color: item.status === key ? cfg.color : '#555',
                              borderColor: item.status === key ? cfg.color : '#333',
                            }}
                          >{key}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div style={{ height: 80 }} />
        </div>
      )}

      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  )
}

const S = {
  root: { minHeight: '100vh', background: '#0f0f0f', display: 'flex', flexDirection: 'column' },
  header: { padding: '16px 16px 10px', borderBottom: '1px solid #1e1e1e' },
  logo: { fontSize: 17, fontWeight: 700, color: '#d4a843' },
  tabs: { display: 'flex', borderBottom: '1px solid #1e1e1e' },
  tab: { flex: 1, padding: '12px 0', background: 'transparent', color: '#555', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
  tabOn: { color: '#d4a843', borderBottom: '2px solid #d4a843' },
  badge: { background: '#e05555', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700 },
  content: { flex: 1, overflowY: 'auto', padding: '10px 12px' },
  topRow: { display: 'flex', gap: 12, marginBottom: 12 },
  fieldBox: { flex: 1 },
  label: { fontSize: 10, color: '#555', marginBottom: 5, letterSpacing: 0.5 },
  pillRow: { display: 'flex', gap: 6 },
  pill: { padding: '6px 14px', borderRadius: 20, background: '#1a1a1a', border: '1px solid #2e2e2e', color: '#888', fontSize: 13 },
  pillOn: { background: 'rgba(212,168,67,0.15)', border: '1px solid #d4a843', color: '#d4a843' },
  select: { width: '100%', padding: '7px 8px', borderRadius: 8, background: '#1a1a1a', border: '1px solid #2e2e2e', color: '#f0f0f0', fontSize: 13 },
  colHeader: { display: 'flex', alignItems: 'center', padding: '4px 10px 4px 10px', fontSize: 10, color: '#444', gap: 4, borderBottom: '1px solid #1e1e1e', marginBottom: 4 },
  col: { width: 46, textAlign: 'center' },
  catBlock: { marginBottom: 6, borderRadius: 8, overflow: 'hidden', border: '1px solid #1e1e1e' },
  catHeader: { padding: '6px 10px', fontSize: 10, fontWeight: 700, color: '#666', background: '#161616', borderLeft: '3px solid', letterSpacing: 0.8 },
  itemRow: { display: 'flex', alignItems: 'center', padding: '7px 10px', borderTop: '1px solid #1a1a1a', background: '#0f0f0f', gap: 4 },
  itemRowActive: { background: '#131310' },
  itemName: { flex: 1, fontSize: 12, color: '#aaa', display: 'flex', alignItems: 'baseline', gap: 4 },
  unit: { fontSize: 10, color: '#444' },
  minQty: { width: 46, textAlign: 'center', fontSize: 12, color: '#555' },
  numInput: { width: 46, padding: '4px 4px', borderRadius: 5, background: '#1a1a1a', border: '1px solid #252525', color: '#ccc', fontSize: 12, textAlign: 'center' },
  routeBtns: { width: 90, display: 'flex', gap: 2 },
  routeBtn: { flex: 1, padding: '3px 0', borderRadius: 3, background: '#151515', border: '1px solid #252525', color: '#444', fontSize: 10 },
  submitArea: { marginTop: 12, padding: 14, background: '#141414', borderRadius: 10, border: '1px solid #2e2e2e' },
  summaryList: { marginBottom: 10 },
  summaryRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
  submitBtn: { width: '100%', padding: '13px', borderRadius: 10, background: '#d4a843', color: '#0f0f0f', fontSize: 14, fontWeight: 700 },
  filterRow: { display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' },
  filterBtn: { padding: '4px 9px', borderRadius: 5, background: '#1a1a1a', border: '1px solid #2e2e2e', color: '#666', fontSize: 12 },
  filterBtnOn: { background: 'rgba(212,168,67,0.15)', border: '1px solid #d4a843', color: '#d4a843' },
  empty: { textAlign: 'center', color: '#444', padding: '60px 0', fontSize: 13 },
  orderCard: { marginBottom: 7, borderRadius: 9, border: '1px solid #1e1e1e', overflow: 'hidden' },
  orderHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#141414', cursor: 'pointer' },
  dot: { borderRadius: 10, padding: '2px 6px', fontSize: 10, fontWeight: 700, color: '#0f0f0f' },
  histItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderTop: '1px solid #1a1a1a', background: '#0d0d0d', gap: 6 },
  routeTag: { fontSize: 10, fontWeight: 700, border: '1px solid', borderRadius: 3, padding: '1px 4px' },
  toast: { position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: '#1e1e1e', border: '1px solid #333', color: '#f0f0f0', padding: '9px 18px', borderRadius: 18, fontSize: 13, fontWeight: 500, zIndex: 100, whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }
}
