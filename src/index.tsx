import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

app.use(renderer)

// Home page with document selection
app.get('/', (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
          <header class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">書類作成システム</h1>
            <p class="text-xl text-gray-600">請求書・領収書・見積書を簡単作成</p>
            <div class="mt-4 text-sm text-gray-500">
              <p>LEXIA - デジタルソリューション</p>
            </div>
          </header>

          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div class="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">請求書</h3>
              <p class="text-gray-600 mb-4">お客様への請求書を作成します</p>
              <a href="/form?type=invoice" class="inline-block bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors">
                作成開始
              </a>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div class="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">領収書</h3>
              <p class="text-gray-600 mb-4">支払い確認の領収書を作成します</p>
              <a href="/form?type=receipt" class="inline-block bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors">
                作成開始
              </a>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div class="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">見積書</h3>
              <p class="text-gray-600 mb-4">お客様への見積書を作成します</p>
              <a href="/form?type=quote" class="inline-block bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors">
                作成開始
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

// Form page for document creation
app.get('/form', (c) => {
  const type = c.req.query('type') || 'invoice'
  const typeNames = {
    invoice: '請求書',
    receipt: '領収書', 
    quote: '見積書'
  }
  const typeName = typeNames[type as keyof typeof typeNames] || '請求書'

  return c.render(
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
          <div class="bg-white rounded-lg shadow-md">
            <div class="border-b border-gray-200 px-6 py-4">
              <div class="flex items-center justify-between">
                <h2 class="text-2xl font-bold text-gray-900">{typeName}作成</h2>
                <a href="/" class="text-gray-600 hover:text-gray-900">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </a>
              </div>
            </div>
            
            <form id="documentForm" class="p-6">
              <input type="hidden" id="documentType" value={type} />
              
              {/* 顧客情報 */}
              <div class="mb-8">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  お客様情報
                </h3>
                
                {/* 顧客選択 */}
                <div class="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1"></i>既存顧客から選択
                  </label>
                  <select id="customerSelect" class="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent">
                    <option value="">-- 既存顧客から選択してください --</option>
                    <option value="mino-kenchiku">みの建築</option>
                    <option value="ja-life">株式会社 JA.life</option>
                    <option value="chubu-kaihatsu">中部開発株式会社</option>
                    <option value="asaoka-pack">有限会社朝岡パック</option>
                    <option value="ryuki-kogyo">琉希工業株式会社</option>
                    <option value="nakamura-kenkouin">中村健康院</option>
                  </select>
                  <p class="text-xs text-gray-500 mt-1">
                    <i class="fas fa-info-circle mr-1"></i>
                    既存顧客を選択するか、下記フィールドに直接入力してください
                  </p>
                </div>

                {/* 手動入力フィールド */}
                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">会社名・お名前 *</label>
                    <input type="text" id="customerName" class="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent" required />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">郵便番号</label>
                    <input type="text" id="customerZip" class="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent" placeholder="〒000-0000" />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">住所</label>
                    <input type="text" id="customerAddress" class="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                  </div>
                </div>
              </div>

              {/* 書類情報 */}
              <div class="mb-8">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  書類情報
                </h3>
                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">書類番号</label>
                    <input type="text" id="documentNumber" class="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">発行日 *</label>
                    <input type="date" id="issueDate" class="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent" required />
                  </div>
                  {type === 'invoice' && (
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">支払期限</label>
                      <input type="date" id="dueDate" class="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                    </div>
                  )}
                </div>
              </div>

              {/* 項目 */}
              <div class="mb-8">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  項目詳細
                </h3>
                <div id="itemList">
                  <div class="item-row grid grid-cols-12 gap-2 mb-2">
                    <div class="col-span-5">
                      <label class="block text-sm font-medium text-gray-700 mb-1">項目名</label>
                      <input type="text" name="itemName" class="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                    </div>
                    <div class="col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-1">数量</label>
                      <input type="number" name="quantity" class="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent" min="1" value="1" />
                    </div>
                    <div class="col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-1">単価</label>
                      <input type="number" name="unitPrice" class="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent" min="0" />
                    </div>
                    <div class="col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-1">金額</label>
                      <input type="text" name="amount" class="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100" readonly />
                    </div>
                    <div class="col-span-1 flex items-end">
                      <button type="button" class="remove-item w-full bg-red-600 text-white px-2 py-2 rounded hover:bg-red-700 transition-colors" disabled>
                        ×
                      </button>
                    </div>
                  </div>
                </div>
                <button type="button" id="addItem" class="mt-2 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors">
                  + 項目を追加
                </button>
              </div>

              {/* 合計・備考 */}
              <div class="mb-8">
                <div class="grid md:grid-cols-2 gap-8">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">備考</label>
                    <textarea id="notes" rows="4" class="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent"></textarea>
                  </div>
                  <div class="bg-gray-50 p-4 rounded">
                    <div class="space-y-2">
                      <div class="flex justify-between">
                        <span class="text-gray-700">小計:</span>
                        <span id="subtotal" class="font-medium">¥0</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-700">消費税(10%):</span>
                        <span id="tax" class="font-medium">¥0</span>
                      </div>
                      <div class="border-t border-gray-300 pt-2">
                        <div class="flex justify-between text-lg font-bold">
                          <span>合計:</span>
                          <span id="total">¥0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ボタン */}
              <div class="flex justify-center space-x-4">
                <button type="button" id="previewBtn" class="bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700 transition-colors">
                  プレビュー
                </button>
                <button type="button" id="generatePDF" class="bg-gray-900 text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors">
                  PDF生成
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <div id="previewModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div class="flex justify-between items-center p-4 border-b">
              <h3 class="text-lg font-bold">プレビュー</h3>
              <button id="closePreview" class="text-gray-600 hover:text-gray-900">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div id="previewContent" class="p-6">
              {/* Preview content will be inserted here */}
            </div>
          </div>
        </div>
      </div>

      {/* Load PDF generation libraries */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    </div>
  )
})

// API endpoint for PDF generation
app.post('/api/generate-pdf', async (c) => {
  try {
    const formData = await c.req.json()
    
    // For now, return the data back - PDF generation will be implemented next
    return c.json({ 
      success: true, 
      message: 'PDF generation endpoint ready',
      data: formData 
    })
  } catch (error) {
    return c.json({ 
      success: false, 
      message: 'エラーが発生しました' 
    }, 500)
  }
})

export default app
