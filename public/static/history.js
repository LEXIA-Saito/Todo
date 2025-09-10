// Document History JavaScript
document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;
    const itemsPerPage = 10;

    // Check if we're on the history page
    if (window.location.pathname === '/history') {
        loadDocuments();
        setupEventListeners();
    }

    // Check if we're on a document detail page
    if (window.location.pathname.startsWith('/document/')) {
        loadDocumentDetail();
    }

    function setupEventListeners() {
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        const typeFilter = document.getElementById('typeFilter');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                currentPage = 1;
                loadDocuments();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    currentPage = 1;
                    loadDocuments();
                }
            });
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', () => {
                currentPage = 1;
                loadDocuments();
            });
        }
    }

    async function loadDocuments() {
        try {
            const searchTerm = document.getElementById('searchInput')?.value || '';
            const typeFilter = document.getElementById('typeFilter')?.value || '';
            
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString()
            });

            if (searchTerm) params.append('search', searchTerm);
            if (typeFilter) params.append('type', typeFilter);

            const response = await fetch(`/api/documents?${params}`);
            const result = await response.json();

            if (result.success) {
                displayDocuments(result.data.documents);
                displayPagination(result.data.pagination);
            } else {
                showError('書類の読み込みに失敗しました。');
            }
        } catch (error) {
            console.error('Error loading documents:', error);
            showError('ネットワークエラーが発生しました。');
        }
    }

    function displayDocuments(documents) {
        const container = document.getElementById('documentsContainer');
        
        if (documents.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center text-gray-500">
                    <i class="fas fa-inbox text-4xl mb-4"></i>
                    <p class="text-lg">書類がありません</p>
                    <p class="text-sm">新しい書類を作成してください。</p>
                </div>
            `;
            return;
        }

        const documentsHTML = documents.map(doc => {
            const typeNames = {
                invoice: '請求書',
                receipt: '領収書',
                quote: '見積書'
            };
            const typeColors = {
                invoice: 'bg-red-100 text-red-800',
                receipt: 'bg-green-100 text-green-800',
                quote: 'bg-blue-100 text-blue-800'
            };

            const date = new Date(doc.created_at).toLocaleDateString('ja-JP');
            const issueDate = new Date(doc.issue_date).toLocaleDateString('ja-JP');

            return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[doc.document_type]}">
                                ${typeNames[doc.document_type]}
                            </span>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${doc.document_number || '-'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${doc.customer_name}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${issueDate}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">¥${Number(doc.total_amount).toLocaleString('ja-JP')}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-500">${date}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="/document/${doc.id}" class="text-gray-900 hover:text-gray-700 mr-4">
                            <i class="fas fa-eye"></i> 詳細
                        </a>
                        <a href="/form?type=${doc.document_type}&edit=${doc.id}" class="text-blue-600 hover:text-blue-800">
                            <i class="fas fa-edit"></i> 編集
                        </a>
                    </td>
                </tr>
            `;
        }).join('');

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">種類</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">書類番号</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">顧客名</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">発行日</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作成日</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${documentsHTML}
                    </tbody>
                </table>
            </div>
        `;
    }

    function displayPagination(pagination) {
        const container = document.getElementById('paginationContainer');
        
        if (pagination.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="flex items-center justify-between">';
        
        // Info
        paginationHTML += `
            <div class="text-sm text-gray-700">
                <span class="font-medium">${((pagination.page - 1) * pagination.limit) + 1}</span>
                -
                <span class="font-medium">${Math.min(pagination.page * pagination.limit, pagination.total)}</span>
                / 
                <span class="font-medium">${pagination.total}</span>
                件
            </div>
        `;

        // Pagination buttons
        paginationHTML += '<div class="flex space-x-2">';
        
        // Previous button
        if (pagination.page > 1) {
            paginationHTML += `<button class="pagination-btn px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50" data-page="${pagination.page - 1}">前へ</button>`;
        }

        // Page numbers
        for (let i = Math.max(1, pagination.page - 2); i <= Math.min(pagination.totalPages, pagination.page + 2); i++) {
            const isActive = i === pagination.page;
            paginationHTML += `
                <button class="pagination-btn px-3 py-2 text-sm font-medium ${isActive ? 'text-white bg-gray-900 border-gray-900' : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'} border rounded-md" data-page="${i}">
                    ${i}
                </button>
            `;
        }

        // Next button
        if (pagination.page < pagination.totalPages) {
            paginationHTML += `<button class="pagination-btn px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50" data-page="${pagination.page + 1}">次へ</button>`;
        }

        paginationHTML += '</div></div>';
        container.innerHTML = paginationHTML;

        // Add event listeners to pagination buttons
        container.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentPage = parseInt(btn.dataset.page);
                loadDocuments();
            });
        });
    }

    async function loadDocumentDetail() {
        try {
            const documentIdElement = document.getElementById('documentId');
            const documentId = documentIdElement?.value;
            
            console.log('Document ID element:', documentIdElement);
            console.log('Document ID:', documentId);
            
            if (!documentId) {
                console.error('Document ID not found');
                showError('ドキュメントIDが見つかりません。');
                return;
            }

            console.log(`Fetching: /api/documents/${documentId}`);
            const response = await fetch(`/api/documents/${documentId}`);
            console.log('Response status:', response.status);
            
            const result = await response.json();
            console.log('API Result:', result);

            if (result.success) {
                displayDocumentDetail(result.data);
            } else {
                showError('書類の読み込みに失敗しました: ' + (result.message || ''));
            }
        } catch (error) {
            console.error('Error loading document:', error);
            showError('ネットワークエラーが発生しました: ' + error.message);
        }
    }

    function displayDocumentDetail(data) {
        const { document, items } = data;
        
        const typeNames = {
            invoice: '請求書',
            receipt: '領収書',
            quote: '見積書'
        };

        const issueDate = new Date(document.issue_date).toLocaleDateString('ja-JP');
        const dueDate = document.due_date ? new Date(document.due_date).toLocaleDateString('ja-JP') : '';
        
        // Generate items HTML
        const itemsHTML = items.map((item, index) => `
            <tr class="border-b border-gray-200">
                <td class="py-2 text-center">${index + 1}</td>
                <td class="py-2">${item.item_name}</td>
                <td class="py-2 text-right">${item.quantity}</td>
                <td class="py-2 text-right">¥${Number(item.unit_price).toLocaleString('ja-JP')}</td>
                <td class="py-2 text-right">¥${Number(item.amount).toLocaleString('ja-JP')}</td>
            </tr>
        `).join('');

        const container = document.getElementById('documentContainer');
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-8">
                <!-- Document Header -->
                <div class="text-center mb-8">
                    <h2 class="text-2xl font-bold text-gray-900">${typeNames[document.document_type]}</h2>
                </div>
                
                <!-- Document Info -->
                <div class="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 class="text-lg font-semibold mb-4">宛先</h3>
                        <div class="space-y-2">
                            <p class="font-medium">${document.customer_name} 様</p>
                            ${document.customer_zip ? `<p class="text-sm text-gray-600">${document.customer_zip}</p>` : ''}
                            ${document.customer_address ? `<p class="text-sm text-gray-600">${document.customer_address}</p>` : ''}
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="space-y-2">
                            ${document.document_number ? `<p><strong>書類番号:</strong> ${document.document_number}</p>` : ''}
                            <p><strong>発行日:</strong> ${issueDate}</p>
                            ${dueDate ? `<p><strong>支払期限:</strong> ${dueDate}</p>` : ''}
                            ${document.receipt_item ? `<p><strong>領収項目:</strong> ${document.receipt_item}</p>` : ''}
                        </div>
                    </div>
                </div>

                <!-- Items Table -->
                <div class="mb-8">
                    <table class="w-full border-collapse">
                        <thead>
                            <tr class="bg-gray-50 border-b border-gray-200">
                                <th class="py-2 text-center w-12">No.</th>
                                <th class="py-2 text-left">項目</th>
                                <th class="py-2 text-right w-20">数量</th>
                                <th class="py-2 text-right w-32">単価</th>
                                <th class="py-2 text-right w-32">金額</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHTML}
                        </tbody>
                    </table>
                </div>

                <!-- Totals -->
                <div class="flex justify-end mb-8">
                    <div class="w-64 space-y-2">
                        <div class="flex justify-between">
                            <span>小計:</span>
                            <span>¥${Number(document.subtotal).toLocaleString('ja-JP')}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>消費税(10%):</span>
                            <span>¥${Number(document.tax_amount).toLocaleString('ja-JP')}</span>
                        </div>
                        <div class="flex justify-between border-t border-gray-300 pt-2 font-bold">
                            <span>合計:</span>
                            <span>¥${Number(document.total_amount).toLocaleString('ja-JP')}</span>
                        </div>
                    </div>
                </div>

                ${document.notes ? `
                    <div class="mb-8">
                        <h4 class="font-semibold mb-2">備考</h4>
                        <p class="text-gray-700">${document.notes}</p>
                    </div>
                ` : ''}

                <!-- Company Info -->
                <div class="border-t border-gray-200 pt-6 text-sm text-gray-600">
                    <div class="grid grid-cols-2 gap-8">
                        <div>
                            <p class="font-semibold">LEXIA</p>
                            <p>〒447-0817 愛知県碧南市川端町1-45</p>
                            <p>TEL: 090-1742-3456</p>
                            <p>Email: lexia0web@gmail.com</p>
                        </div>
                        <div>
                            <p class="font-semibold">お振込先</p>
                            <p>愛知県中央信用組合 みなみ支店</p>
                            <p>普通 (口座名義：齋藤雅人)</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Setup PDF regeneration button
        const regenerateBtn = document.getElementById('regeneratePdfBtn');
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', async () => {
                try {
                    // Create formData compatible with existing PDF generation
                    const formData = {
                        type: document.document_type,
                        customer: {
                            name: document.customer_name,
                            zip: document.customer_zip,
                            address: document.customer_address
                        },
                        document: {
                            number: document.document_number,
                            issueDate: document.issue_date,
                            dueDate: document.due_date,
                            receiptItem: document.receipt_item
                        },
                        items: items.map(item => ({
                            name: item.item_name,
                            quantity: item.quantity,
                            unitPrice: item.unit_price,
                            amount: item.amount
                        })),
                        notes: document.notes,
                        totals: {
                            subtotal: parseFloat(document.subtotal),
                            tax: parseFloat(document.tax_amount),
                            total: parseFloat(document.total_amount)
                        }
                    };
                    
                    // Check if generatePDF function exists (from app.js)
                    if (typeof generatePDF !== 'undefined') {
                        await generatePDF(formData);
                    } else {
                        alert('PDF生成機能が利用できません。app.jsが読み込まれていることを確認してください。');
                    }
                } catch (error) {
                    alert('PDF生成中にエラーが発生しました: ' + error.message);
                    console.error('Error:', error);
                }
            });
        }
    }

    function showError(message) {
        const container = document.getElementById('documentsContainer') || document.getElementById('documentContainer');
        if (container) {
            container.innerHTML = `
                <div class="p-8 text-center text-red-600">
                    <i class="fas fa-exclamation-triangle text-2xl mb-4"></i>
                    <p>${message}</p>
                </div>
            `;
        }
    }
});