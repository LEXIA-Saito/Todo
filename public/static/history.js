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
            const documentId = document.getElementById('documentId')?.value;
            if (!documentId) return;

            const response = await fetch(`/api/documents/${documentId}`);
            const result = await response.json();

            if (result.success) {
                displayDocumentDetail(result.data);
            } else {
                showError('書類の読み込みに失敗しました。');
            }
        } catch (error) {
            console.error('Error loading document:', error);
            showError('ネットワークエラーが発生しました。');
        }
    }

    function displayDocumentDetail(data) {
        const { document, items } = data;
        
        const typeNames = {
            invoice: '請求書',
            receipt: '領収書',
            quote: '見積書'
        };

        // Convert document data to format expected by existing functions
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

        // Use existing preview function
        const container = document.getElementById('documentContainer');
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-6">
                ${generateDocumentHTML(formData, typeNames[document.document_type])}
            </div>
        `;

        // Setup PDF regeneration
        const regenerateBtn = document.getElementById('regeneratePdfBtn');
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', async () => {
                try {
                    await generatePDF(formData);
                } catch (error) {
                    alert('PDF生成中にエラーが発生しました。');
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