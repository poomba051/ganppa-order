import React, { useState, useEffect } from 'react'
import { db } from './firebase'
import {
  collection, addDoc, onSnapshot, updateDoc, doc,
  query, orderBy, Timestamp
} from 'firebase/firestore'
import { CATEGORIES, calcExpectedDate, formatDate } from './items'

const STORES = ['1호점', '2호점']
const ROUTES = ['포스', '카톡', '쿠팡']
const ORDERERS = ['신', '직원A', '직원B', '직원C']
const STATUS_CONFIG = {
  '대기중': { color: '#d4a843', bg: 'rgba(212,168,67,0.15)', label: '⏳ 대기중' },
  '입고완료': { color: '#4caf7d', bg: 'rgba(76,175,125,0.15)', label: '✅ 입고완료' },
  '미입고': { color: '#e05555', bg: 'rgba(224,85,85,0.15)', label: '❌ 미입고' },
}
const ROUTE_COLOR = { '포스': '#f0f0f0', '카톡': '#4caf7d', '쿠팡': '#e05555' }

export default function App() {
  const [tab, setTab] = useState('order')
  const [store, setStore] = useState('1호점')
  const [orderer, setOrderer] = useState('신')
  const [quantities, setQuantities] = useState({})
  const [routes, setRoutes] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [orders, setOrders] = useState([])
  const [filterStore, setFilterStore] = useState('전체')
  const [filterStatus, setFilterStatus] = useState('전체')
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [toast, setToast] = useState('')

  // 발주내역 실시간 구독
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const setQty = (itemId, val) => {
    setQuantities(prev => ({ ...prev, [itemId]: val }))
  }

  const setRoute = (itemId, route) => {
    setRoutes(prev => ({
      ...prev,
      [itemId]: prev[itemId] === route ? '' : route
    }))
  }

  // 입력된 품목들
  const filledItems = Object.entries(quantities)
    .filter(([, v]) => v && Number(v) > 0)

  // 발주 제출
  const handleSubmit = async () => {
    if (filledItems.length === 0) {
      showToast('수량을 입력하세요')
      return
    }
    const missing = filledItems.filter(([id]) => !routes[id])
    if (missing.length > 0) {
      showToast('발주경로를 선택하세요')
      return
    }

    setSubmitting(true)
    try {
      const now = new Date()
      const items = filledItems.map(([id, qty]) => {
        const route = routes[id]
        const expected = calcExpectedDate(route, now)
        let itemName = '', unit = '', categoryName = ''
        for (const cat of CATEGORIES) {
          const found = cat.items.find(i => i.id === id)
          if (found) { itemName = found.name; unit = found.unit; categoryName = cat.name; break }
        }
        return {
          itemId: id, itemName, unit, categoryName,
          qty: Number(qty), route,
          expectedDate: Timestamp.fromDate(expected),
          status: '대기중'
        }
      })

      await addDoc(collection(db, 'orders'), {
        store,
        orderer,
        items,
        createdAt: Timestamp.fromDate(now),
        note: ''
      })

      setQuantities({})
      setRoutes({})
      showToast(`발주 등록 완료 (${items.length}개 품목)`)
      setTab('history')
    } catch (e) {
      showToast('오류가 발생했어요')
      console.error(e)
    }
    setSubmitting(false)
  }

  // 개별 품목 상태 변경
  const updateItemStatus = async (orderId, itemIdx, newStatus) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return
    const newItems = order.items.map((item, i) =>
      i === itemIdx ? { ...item, status: newStatus } : item
    )
    await updateDoc(doc(db, 'orders', orderId), { items: newItems })
    showToast('상태 변경 완료')
  }

  // 필터된 주문
  const filtered = orders.filter(o => {
    if (filterStore !== '전체' && o.store !== filterStore) return false
    if (filterStatus !== '전체') {
      const hasStatus = o.items.some(i => i.status === filterStatus)
      if (!hasStatus) return false
    }
    return true
  })

  return (
    <div style={styles.root}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div style={styles.logo}>🍺 간빠맥주</div>
        <div style={styles.subtitle}>발주관리 시스템</div>
      </div>

      {/* 탭 */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(tab === 'order' ? styles.tabActive : {}) }}
          onClick={() => setTab('order')}
        >
          발주 입력
        </button>
        <button
          style={{ ...styles.tab, ...(tab === 'history' ? styles.tabActive : {}) }}
          onClick={() => setTab('history')}
        >
          발주 내역
          {orders.filter(o => o.items.some(i => i.status === '대기중')).length > 0 && (
            <span style={styles.badge}>
              {orders.reduce((n, o) => n + o.items.filter(i => i.status === '대기중').length, 0)}
            </span>
          )}
        </button>
      </div>

      {/* 발주 입력 탭 */}
      {tab === 'order' && (
        <div style={styles.content}>
          {/* 매장 + 발주자 선택 */}
          <div style={styles.row}>
            <div style={styles.field}>
              <div style={styles.label}>매장</div>
              <div style={styles.btnGroup}>
                {STORES.map(s => (
                  <button
                    key={s}
                    style={{ ...styles.pill, ...(store === s ? styles.pillActive : {}) }}
                    onClick={() => setStore(s)}
                  >{s}</button>
                ))}
              </div>
            </div>
            <div style={styles.field}>
              <div style={styles.label}>발주자</div>
              <select
                value={orderer}
                onChange={e => setOrderer(e.target.value)}
                style={styles.select}
              >
                {ORDERERS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* 품목별 입력 */}
          {CATEGORIES.map(cat => (
            <div key={cat.id} style={styles.catBlock}>
              <div style={{ ...styles.catHeader, borderLeftColor: cat.color }}>
                {cat.name}
              </div>
              {cat.items.map(item => (
                <div key={item.id} style={styles.itemRow}>
                  <div style={styles.itemLeft}>
                    <div style={styles.itemName}>{item.name}</div>
                    {item.store && (
                      <div style={styles.storeTag}>{item.store}</div>
                    )}
                  </div>
                  <div style={styles.itemRight}>
                    <div style={styles.qtyWrap}>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={quantities[item.id] || ''}
                        onChange={e => setQty(item.id, e.target.value)}
                        style={{
                          ...styles.qtyInput,
                          ...(quantities[item.id] && !routes[item.id]
                            ? { borderColor: '#d4a843' } : {})
                        }}
                      />
                      <span style={styles.unit}>{item.unit}</span>
                    </div>
                    {quantities[item.id] > 0 && (
                      <div style={styles.routeBtns}>
                        {ROUTES.map(r => (
                          <button
                            key={r}
                            onClick={() => setRoute(item.id, r)}
                            style={{
                              ...styles.routeBtn,
                              ...(routes[item.id] === r
                                ? { background: ROUTE_COLOR[r], color: '#0f0f0f', fontWeight: 700 }
                                : {})
                            }}
                          >{r}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* 제출 요약 + 버튼 */}
          {filledItems.length > 0 && (
            <div style={styles.submitArea}>
              <div style={styles.summary}>
                {['포스', '카톡', '쿠팡'].map(r => {
                  const cnt = filledItems.filter(([id]) => routes[id] === r).length
                  if (!cnt) return null
                  const exp = calcExpectedDate(r)
                  return (
                    <div key={r} style={styles.summaryRow}>
                      <span style={{ color: ROUTE_COLOR[r], fontWeight: 600 }}>{r}</span>
                      <span style={styles.summaryText}>
                        {cnt}개 품목 → {formatDate(exp)} 입고 예정
                      </span>
                    </div>
                  )
                })}
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={styles.submitBtn}
              >
                {submitting ? '등록 중...' : `발주 등록 (${filledItems.length}개 품목)`}
              </button>
            </div>
          )}
          <div style={{ height: 80 }} />
        </div>
      )}

      {/* 발주 내역 탭 */}
      {tab === 'history' && (
        <div style={styles.content}>
          {/* 필터 */}
          <div style={styles.filterRow}>
            {['전체', ...STORES].map(s => (
              <button
                key={s}
                onClick={() => setFilterStore(s)}
                style={{ ...styles.filterBtn, ...(filterStore === s ? styles.filterBtnActive : {}) }}
              >{s}</button>
            ))}
            <div style={{ flex: 1 }} />
            {['전체', '대기중', '입고완료', '미입고'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  ...styles.filterBtn,
                  ...(filterStatus === s ? styles.filterBtnActive : {}),
                  fontSize: 11
                }}
              >{s}</button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={styles.empty}>발주 내역이 없어요</div>
          )}

          {filtered.map(order => (
            <div key={order.id} style={styles.orderCard}>
              {/* 주문 헤더 */}
              <div
                style={styles.orderHeader}
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div style={styles.orderMeta}>
                  <span style={styles.orderStore}>{order.store}</span>
                  <span style={styles.orderDate}>
                    {order.createdAt ? formatDate(order.createdAt.toDate()) : '-'}
                  </span>
                  <span style={styles.orderBy}>{order.orderer}</span>
                </div>
                <div style={styles.orderRight}>
                  <div style={styles.statusDots}>
                    {['대기중', '미입고'].map(s => {
                      const cnt = order.items.filter(i => i.status === s).length
                      if (!cnt) return null
                      return (
                        <span
                          key={s}
                          style={{
                            ...styles.dot,
                            background: STATUS_CONFIG[s].color
                          }}
                        >{cnt}</span>
                      )
                    })}
                  </div>
                  <span style={styles.chevron}>
                    {expandedOrder === order.id ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* 품목 상세 */}
              {expandedOrder === order.id && (
                <div style={styles.itemList}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={styles.historyItem}>
                      <div style={styles.historyLeft}>
                        <span
                          style={{
                            ...styles.routeTag,
                            color: ROUTE_COLOR[item.route],
                            borderColor: ROUTE_COLOR[item.route]
                          }}
                        >{item.route}</span>
                        <span style={styles.historyName}>{item.itemName}</span>
                        <span style={styles.historyQty}>{item.qty}{item.unit}</span>
                      </div>
                      <div style={styles.historyRight}>
                        <div style={styles.expectedDate}>
                          {item.expectedDate ? formatDate(item.expectedDate) : '-'}
                        </div>
                        <div style={styles.statusBtns}>
                          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <button
                              key={key}
                              onClick={() => updateItemStatus(order.id, idx, key)}
                              style={{
                                ...styles.statusBtn,
                                background: item.status === key ? cfg.bg : 'transparent',
                                color: item.status === key ? cfg.color : '#555',
                                borderColor: item.status === key ? cfg.color : '#333',
                                fontWeight: item.status === key ? 700 : 400,
                              }}
                            >{key}</button>
                          ))}
                        </div>
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

      {/* Toast */}
      {toast && (
        <div style={styles.toast}>{toast}</div>
      )}
    </div>
  )
}

const styles = {
  root: {
    minHeight: '100vh',
    background: '#0f0f0f',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '20px 20px 12px',
    borderBottom: '1px solid #1e1e1e',
  },
  logo: {
    fontSize: 20,
    fontWeight: 700,
    color: '#d4a843',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: 11,
    color: '#555',
    marginTop: 2,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #1e1e1e',
  },
  tab: {
    flex: 1,
    padding: '14px 0',
    background: 'transparent',
    color: '#555',
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: '-0.3px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabActive: {
    color: '#d4a843',
    borderBottom: '2px solid #d4a843',
  },
  badge: {
    background: '#e05555',
    color: '#fff',
    borderRadius: 10,
    padding: '1px 6px',
    fontSize: 10,
    fontWeight: 700,
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 16px',
  },
  row: {
    display: 'flex',
    gap: 12,
    marginBottom: 16,
  },
  field: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: '#555',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  btnGroup: {
    display: 'flex',
    gap: 6,
  },
  pill: {
    padding: '7px 14px',
    borderRadius: 20,
    background: '#1a1a1a',
    border: '1px solid #2e2e2e',
    color: '#888',
    fontSize: 13,
    fontWeight: 500,
  },
  pillActive: {
    background: 'rgba(212,168,67,0.15)',
    border: '1px solid #d4a843',
    color: '#d4a843',
  },
  select: {
    width: '100%',
    padding: '7px 10px',
    borderRadius: 8,
    background: '#1a1a1a',
    border: '1px solid #2e2e2e',
    color: '#f0f0f0',
    fontSize: 13,
  },
  catBlock: {
    marginBottom: 8,
    borderRadius: 10,
    overflow: 'hidden',
    border: '1px solid #1e1e1e',
  },
  catHeader: {
    padding: '8px 12px',
    fontSize: 11,
    fontWeight: 700,
    color: '#888',
    letterSpacing: 1,
    background: '#161616',
    borderLeft: '3px solid',
    textTransform: 'uppercase',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '10px 12px',
    borderTop: '1px solid #1a1a1a',
    background: '#0f0f0f',
    gap: 8,
  },
  itemLeft: {
    flex: 1,
    paddingTop: 4,
  },
  itemName: {
    fontSize: 13,
    color: '#e0e0e0',
    fontWeight: 500,
  },
  storeTag: {
    fontSize: 10,
    color: '#555',
    marginTop: 2,
  },
  itemRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 6,
  },
  qtyWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  qtyInput: {
    width: 64,
    padding: '6px 8px',
    borderRadius: 6,
    background: '#1a1a1a',
    border: '1px solid #2e2e2e',
    color: '#f0f0f0',
    fontSize: 14,
    textAlign: 'center',
  },
  unit: {
    fontSize: 11,
    color: '#555',
    width: 28,
  },
  routeBtns: {
    display: 'flex',
    gap: 4,
  },
  routeBtn: {
    padding: '4px 10px',
    borderRadius: 4,
    background: '#1a1a1a',
    border: '1px solid #2e2e2e',
    color: '#555',
    fontSize: 11,
    fontWeight: 500,
  },
  submitArea: {
    marginTop: 16,
    padding: 16,
    background: '#141414',
    borderRadius: 12,
    border: '1px solid #2e2e2e',
  },
  summary: {
    marginBottom: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  summaryRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    fontSize: 12,
    color: '#888',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: 10,
    background: '#d4a843',
    color: '#0f0f0f',
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '-0.3px',
  },
  filterRow: {
    display: 'flex',
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '5px 10px',
    borderRadius: 6,
    background: '#1a1a1a',
    border: '1px solid #2e2e2e',
    color: '#666',
    fontSize: 12,
  },
  filterBtnActive: {
    background: 'rgba(212,168,67,0.15)',
    border: '1px solid #d4a843',
    color: '#d4a843',
  },
  empty: {
    textAlign: 'center',
    color: '#444',
    padding: '60px 0',
    fontSize: 13,
  },
  orderCard: {
    marginBottom: 8,
    borderRadius: 10,
    border: '1px solid #1e1e1e',
    overflow: 'hidden',
  },
  orderHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    background: '#141414',
    cursor: 'pointer',
  },
  orderMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  orderStore: {
    fontSize: 13,
    fontWeight: 700,
    color: '#d4a843',
  },
  orderDate: {
    fontSize: 12,
    color: '#888',
  },
  orderBy: {
    fontSize: 11,
    color: '#555',
  },
  orderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  statusDots: {
    display: 'flex',
    gap: 4,
  },
  dot: {
    borderRadius: 10,
    padding: '2px 7px',
    fontSize: 11,
    fontWeight: 700,
    color: '#0f0f0f',
  },
  chevron: {
    fontSize: 10,
    color: '#444',
  },
  itemList: {
    background: '#0d0d0d',
  },
  historyItem: {
    padding: '10px 14px',
    borderTop: '1px solid #1a1a1a',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  historyLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
  },
  routeTag: {
    fontSize: 10,
    fontWeight: 700,
    border: '1px solid',
    borderRadius: 4,
    padding: '1px 5px',
  },
  historyName: {
    fontSize: 13,
    color: '#e0e0e0',
  },
  historyQty: {
    fontSize: 12,
    color: '#888',
  },
  historyRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 5,
  },
  expectedDate: {
    fontSize: 11,
    color: '#555',
  },
  statusBtns: {
    display: 'flex',
    gap: 3,
  },
  statusBtn: {
    padding: '3px 7px',
    borderRadius: 4,
    border: '1px solid',
    fontSize: 10,
    fontWeight: 500,
  },
  toast: {
    position: 'fixed',
    bottom: 30,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#1e1e1e',
    border: '1px solid #333',
    color: '#f0f0f0',
    padding: '10px 20px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500,
    zIndex: 100,
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
  }
}
