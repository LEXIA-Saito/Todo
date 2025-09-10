// Invoice Generation App JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're in edit mode
    const editModeInput = document.getElementById('editMode');
    const editDocumentIdInput = document.getElementById('editDocumentId');
    const isEditMode = editModeInput && editModeInput.value === 'true';
    const editDocumentId = editDocumentIdInput ? editDocumentIdInput.value : null;
    
    // Set today's date as default (only for new documents)
    if (!isEditMode) {
        const today = new Date().toISOString().split('T')[0];
        const issueDateInput = document.getElementById('issueDate');
        if (issueDateInput) {
            issueDateInput.value = today;
        }
    }
    
    // Update save button text based on mode
    const saveButton = document.getElementById('saveDocument');
    if (saveButton && isEditMode) {
        saveButton.textContent = '更新';
    }
    
    // Load existing document data if in edit mode
    if (isEditMode && editDocumentId) {
        loadDocumentForEdit(editDocumentId);
    }

    // Predefined customer data
    const predefinedCustomers = {
        'mino-kenchiku': {
            name: 'みの建築',
            zip: '〒447-0056',
            address: '愛知県碧南市千福町6-8'
        },
        'ja-life': {
            name: '株式会社 JA.life',
            zip: '〒444-0312',
            address: '愛知県西尾市国森町不動東71-3'
        },
        'chubu-kaihatsu': {
            name: '中部開発株式会社',
            zip: '〒447-0886',
            address: '愛知県碧南市源氏町1-15-4'
        },
        'asaoka-pack': {
            name: '有限会社朝岡パック',
            zip: '〒444-0403',
            address: '愛知県西尾市一色町松木島中切6'
        },
        'ryuki-kogyo': {
            name: '琉希工業株式会社',
            zip: '〒444-0204',
            address: '愛知県岡崎市土井町字辻10'
        },
        'nakamura-kenkouin': {
            name: '中村健康院',
            zip: '〒444-0305',
            address: '愛知県西尾市平坂町帆平山55'
        }
    };

    // Customer search and selection functionality
    const customerSearch = document.getElementById('customerSearch');
    const customerNameInput = document.getElementById('customerName');
    const customerZipInput = document.getElementById('customerZip');
    const customerAddressInput = document.getElementById('customerAddress');

    // Create a reverse lookup for customer names to IDs
    const customerNameToId = {};
    for (const [id, customer] of Object.entries(predefinedCustomers)) {
        customerNameToId[customer.name] = id;
    }

    if (customerSearch && customerNameInput) {
        // Update customer name field when search field changes
        customerSearch.addEventListener('input', function() {
            const searchValue = this.value.trim();
            
            // Always update the customer name field
            customerNameInput.value = searchValue;
            
            // Check if it matches a predefined customer
            const customerId = customerNameToId[searchValue];
            if (customerId && predefinedCustomers[customerId]) {
                const customer = predefinedCustomers[customerId];
                customerZipInput.value = customer.zip;
                customerAddressInput.value = customer.address;
            } else {
                // Clear address fields for new customers (but keep the name)
                if (customerZipInput) customerZipInput.value = '';
                if (customerAddressInput) customerAddressInput.value = '';
            }
        });

        // Also handle selection from datalist
        customerSearch.addEventListener('change', function() {
            const searchValue = this.value.trim();
            customerNameInput.value = searchValue;
            
            const customerId = customerNameToId[searchValue];
            if (customerId && predefinedCustomers[customerId]) {
                const customer = predefinedCustomers[customerId];
                customerZipInput.value = customer.zip;
                customerAddressInput.value = customer.address;
            }
        });
    }

    // Item management
    let itemCounter = 1;

    function addItemRow() {
        itemCounter++;
        const itemList = document.getElementById('itemList');
        const newRow = document.createElement('div');
        newRow.className = 'item-row grid grid-cols-12 gap-2 mb-2';
        newRow.innerHTML = `
            <div class="col-span-5">
                <input type="text" name="itemName" class="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
            </div>
            <div class="col-span-2">
                <input type="number" name="quantity" class="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent" min="1" value="1" />
            </div>
            <div class="col-span-2">
                <input type="number" name="unitPrice" class="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent" min="0" />
            </div>
            <div class="col-span-2">
                <input type="text" name="amount" class="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100" readonly />
            </div>
            <div class="col-span-1 flex items-end">
                <button type="button" class="remove-item w-full bg-red-600 text-white px-2 py-2 rounded hover:bg-red-700 transition-colors">
                    ×
                </button>
            </div>
        `;
        itemList.appendChild(newRow);
        updateRemoveButtons();
        attachItemEventListeners(newRow);
    }

    function removeItemRow(row) {
        row.remove();
        updateRemoveButtons();
        calculateTotals();
    }

    function updateRemoveButtons() {
        const removeButtons = document.querySelectorAll('.remove-item');
        removeButtons.forEach(btn => {
            btn.disabled = removeButtons.length <= 1;
        });
    }

    function attachItemEventListeners(row) {
        const quantityInput = row.querySelector('[name="quantity"]');
        const unitPriceInput = row.querySelector('[name="unitPrice"]');
        const amountInput = row.querySelector('[name="amount"]');
        const removeBtn = row.querySelector('.remove-item');

        function updateAmount() {
            const quantity = parseFloat(quantityInput.value) || 0;
            const unitPrice = parseFloat(unitPriceInput.value) || 0;
            const amount = quantity * unitPrice;
            amountInput.value = amount.toLocaleString('ja-JP');
            calculateTotals();
        }

        quantityInput.addEventListener('input', updateAmount);
        unitPriceInput.addEventListener('input', updateAmount);
        removeBtn.addEventListener('click', () => removeItemRow(row));
    }

    function calculateTotals() {
        let subtotal = 0;
        document.querySelectorAll('[name="amount"]').forEach(input => {
            const value = parseFloat(input.value.replace(/,/g, '')) || 0;
            subtotal += value;
        });

        const tax = Math.floor(subtotal * 0.1);
        const total = subtotal + tax;

        document.getElementById('subtotal').textContent = `¥${subtotal.toLocaleString('ja-JP')}`;
        document.getElementById('tax').textContent = `¥${tax.toLocaleString('ja-JP')}`;
        document.getElementById('total').textContent = `¥${total.toLocaleString('ja-JP')}`;
    }

    // Initialize event listeners
    document.getElementById('addItem')?.addEventListener('click', addItemRow);

    // Attach listeners to initial row
    const initialRow = document.querySelector('.item-row');
    if (initialRow) {
        attachItemEventListeners(initialRow);
    }

    // Preview functionality
    document.getElementById('previewBtn')?.addEventListener('click', function() {
        const formData = collectFormData();
        showPreview(formData);
    });

    document.getElementById('closePreview')?.addEventListener('click', function() {
        document.getElementById('previewModal').classList.add('hidden');
    });

    // Document save/update functionality
    document.getElementById('saveDocument')?.addEventListener('click', async function() {
        const formData = collectFormData();
        
        // Validate required fields
        if (!formData.customer.name || !formData.document.issueDate || formData.items.length === 0) {
            alert('必須項目を入力してください。');
            return;
        }
        
        // Additional validation for receipt
        if (formData.type === 'receipt' && !formData.document.receiptItem) {
            alert('領収書では領収項目の入力が必須です。');
            return;
        }

        try {
            let response;
            if (isEditMode && editDocumentId) {
                // Update existing document
                response = await fetch(`/api/documents/${editDocumentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                // Create new document
                response = await fetch('/api/documents', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
            }

            const result = await response.json();
            
            if (result.success) {
                const message = isEditMode ? '書類が正常に更新されました。' : '書類が正常に保存されました。';
                alert(message + (result.documentNumber ? ` (書類番号: ${result.documentNumber})` : ''));
                
                // Optionally redirect to history page
                if (confirm('履歴ページで確認しますか？')) {
                    window.location.href = '/history';
                }
            } else {
                alert('エラーが発生しました: ' + result.message);
            }
        } catch (error) {
            alert('ネットワークエラーが発生しました。');
            console.error('Error:', error);
        }
    });
    
    // Function to load document data for editing
    async function loadDocumentForEdit(documentId) {
        try {
            console.log('Loading document for edit:', documentId);
            const response = await fetch(`/api/documents/${documentId}`);
            const result = await response.json();
            
            if (result.success) {
                const { document, items } = result.data;
                console.log('Loaded document data:', document, items);
                
                // Fill form with existing data
                fillFormWithData(document, items);
            } else {
                alert('書類の読み込みに失敗しました: ' + result.message);
            }
        } catch (error) {
            alert('書類の読み込み中にエラーが発生しました。');
            console.error('Error loading document:', error);
        }
    }
    
    // Function to fill form with existing document data
    function fillFormWithData(document, items) {
        // Fill customer information
        const customerNameInput = document.getElementById('customerName');
        const customerZipInput = document.getElementById('customerZip');
        const customerAddressInput = document.getElementById('customerAddress');
        
        if (customerNameInput) customerNameInput.value = document.customer_name || '';
        if (customerZipInput) customerZipInput.value = document.customer_zip || '';
        if (customerAddressInput) customerAddressInput.value = document.customer_address || '';
        
        // Fill document information
        const documentNumberInput = document.getElementById('documentNumber');
        const issueDateInput = document.getElementById('issueDate');
        const dueDateInput = document.getElementById('dueDate');
        const receiptItemInput = document.getElementById('receiptItem');
        const notesInput = document.getElementById('notes');
        
        if (documentNumberInput) documentNumberInput.value = document.document_number || '';
        if (issueDateInput) issueDateInput.value = document.issue_date || '';
        if (dueDateInput) dueDateInput.value = document.due_date || '';
        if (receiptItemInput) receiptItemInput.value = document.receipt_item || '';
        if (notesInput) notesInput.value = document.notes || '';
        
        // Clear existing items and add loaded items
        const itemContainer = document.getElementById('itemList');
        if (itemContainer && items.length > 0) {
            itemContainer.innerHTML = '';
            
            items.forEach((item, index) => {
                addItemRow();
                const rows = itemContainer.getElementsByClassName('item-row');
                const currentRow = rows[rows.length - 1];
                
                const itemNameInput = currentRow.querySelector('input[name="itemName"]');
                const quantityInput = currentRow.querySelector('input[name="quantity"]');
                const unitPriceInput = currentRow.querySelector('input[name="unitPrice"]');
                const amountInput = currentRow.querySelector('input[name="amount"]');
                
                if (itemNameInput) itemNameInput.value = item.item_name || '';
                if (quantityInput) quantityInput.value = item.quantity || 1;
                if (unitPriceInput) unitPriceInput.value = item.unit_price || 0;
                if (amountInput) amountInput.value = item.amount || 0;
            });
            
            // Update totals
            updateTotals();
        }
    }

    // PDF generation
    document.getElementById('generatePDF')?.addEventListener('click', async function() {
        const formData = collectFormData();
        
        // Validate required fields
        if (!formData.customer.name || !formData.document.issueDate || formData.items.length === 0) {
            alert('必須項目を入力してください。');
            return;
        }
        
        // Additional validation for receipt
        if (formData.type === 'receipt' && !formData.document.receiptItem) {
            alert('領収書では領収項目の入力が必須です。');
            return;
        }

        try {
            // Generate PDF using jsPDF
            await generatePDF(formData);
        } catch (error) {
            alert('PDF生成中にエラーが発生しました。');
            console.error('Error:', error);
        }
    });

    function collectFormData() {
        const documentType = document.getElementById('documentType')?.value || 'invoice';
        const items = [];
        
        document.querySelectorAll('.item-row').forEach(row => {
            const itemName = row.querySelector('[name="itemName"]').value;
            const quantity = parseFloat(row.querySelector('[name="quantity"]').value) || 0;
            const unitPrice = parseFloat(row.querySelector('[name="unitPrice"]').value) || 0;
            
            if (itemName && quantity > 0 && unitPrice > 0) {
                items.push({
                    name: itemName,
                    quantity: quantity,
                    unitPrice: unitPrice,
                    amount: quantity * unitPrice
                });
            }
        });

        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const tax = Math.floor(subtotal * 0.1);
        const total = subtotal + tax;

        return {
            type: documentType,
            customer: {
                name: document.getElementById('customerName')?.value || '',
                zip: document.getElementById('customerZip')?.value || '',
                address: document.getElementById('customerAddress')?.value || ''
            },
            document: {
                number: document.getElementById('documentNumber')?.value || '',
                issueDate: document.getElementById('issueDate')?.value || '',
                dueDate: document.getElementById('dueDate')?.value || '',
                receiptItem: document.getElementById('receiptItem')?.value || 'お品'
            },
            items: items,
            notes: document.getElementById('notes')?.value || '',
            totals: {
                subtotal: subtotal,
                tax: tax,
                total: total
            }
        };
    }

    function showPreview(data) {
        const typeNames = {
            invoice: '請求書',
            receipt: '領収書',
            quote: '見積書'
        };
        const typeName = typeNames[data.type] || '請求書';

        const previewContent = document.getElementById('previewContent');
        previewContent.innerHTML = generateDocumentHTML(data, typeName);
        document.getElementById('previewModal').classList.remove('hidden');
    }

    function generateDocumentHTML(data, typeName) {
        const companyInfo = {
            name: 'LEXIA',
            zip: '〒447-0817',
            address: '愛知県碧南市川端町1-45',
            tel: 'TEL: 090-1742-3456',
            email: 'lexia0web@gmail.com',
            bank: '愛知県中央信用組合 みなみ支店 普通',
            accountName: '口座名義　齋藤雅人'
        };

        return `
            <div class="max-w-4xl mx-auto bg-white p-10" style="font-family: 'Yu Gothic', 'Helvetica', 'Arial', sans-serif;">
                <!-- Header -->
                <div class="relative mb-16">
                    <h1 class="text-4xl font-black tracking-wider">${typeName}</h1>
                    <div class="absolute top-0 right-0 text-right">
                        ${data.document.number ? `
                            <div class="mb-2">
                                <span class="text-gray-500 text-sm">No.</span>
                                <span class="font-bold ml-5">${data.document.number}</span>
                            </div>
                        ` : ''}
                        <div>
                            <span class="text-gray-500 text-sm">発行日</span>
                            <span class="font-bold ml-5">${data.document.issueDate}</span>
                        </div>
                    </div>
                </div>

                <!-- Customer Name and Address -->
                <div class="mb-10">
                    ${data.customer.zip || data.customer.address ? `
                        <div class="mb-4 text-sm leading-relaxed">
                            ${data.customer.zip ? `<div>${data.customer.zip}</div>` : ''}
                            ${data.customer.address ? `<div>${data.customer.address}</div>` : ''}
                        </div>
                    ` : ''}
                    <div class="border-b-2 border-black pb-3 mb-5">
                        <span class="text-2xl font-bold">${data.customer.name}</span>
                        <span class="text-xl ml-5">御中</span>
                    </div>
                </div>

                <!-- Total Amount -->
                <div class="mb-10">
                    <div class="text-left">
                        <div class="text-lg font-bold mb-2">合計金額</div>
                        <div class="text-3xl font-black">¥${data.totals.total.toLocaleString('ja-JP')}−</div>
                    </div>
                    ${data.type === 'receipt' ? `
                        <div class="mt-4 text-sm text-gray-600">
                            但し
                            <span class="ml-12">${data.document.receiptItem}代</span>
                            <span class="ml-12">として</span>
                        </div>
                        <div class="text-xs text-gray-600 mt-1">上記正に領収いたしました。</div>
                    ` : ''}
                </div>

                <!-- Items Table -->
                <div class="mb-10">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-black text-white">
                                <th class="px-3 py-3 text-left text-sm font-bold">内容</th>
                                <th class="px-3 py-3 text-center text-sm font-bold w-20">数量</th>
                                <th class="px-3 py-3 text-center text-sm font-bold w-24">単価</th>
                                <th class="px-3 py-3 text-center text-sm font-bold w-24">金額</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.items.map((item, index) => `
                                <tr class="border-b border-gray-300">
                                    <td class="px-3 py-3 text-sm">${item.name}</td>
                                    <td class="px-3 py-3 text-center text-sm">${item.quantity}</td>
                                    <td class="px-3 py-3 text-right text-sm">${item.unitPrice.toLocaleString('ja-JP')}</td>
                                    <td class="px-3 py-3 text-right text-sm">${item.amount.toLocaleString('ja-JP')}</td>
                                </tr>
                            `).join('')}
                            ${Array.from({length: Math.max(0, 6 - data.items.length)}, () => `
                                <tr class="border-b border-gray-300">
                                    <td class="px-3 py-3 text-sm">&nbsp;</td>
                                    <td class="px-3 py-3 text-center text-sm">&nbsp;</td>
                                    <td class="px-3 py-3 text-right text-sm">&nbsp;</td>
                                    <td class="px-3 py-3 text-right text-sm">&nbsp;</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Tax Details -->
                <div class="mb-10">
                    <div class="border-t-2 border-black pt-4">
                        <div class="text-xs text-gray-600 mb-4">※軽減税率対象</div>
                        
                        <div class="grid grid-cols-12 gap-2 text-sm">
                            <div class="col-span-6"></div>
                            <div class="col-span-3 text-right">10%対象</div>
                            <div class="col-span-3 text-right">${data.totals.subtotal.toLocaleString('ja-JP')}</div>
                        </div>
                        <div class="grid grid-cols-12 gap-2 text-sm mt-1">
                            <div class="col-span-6 text-xs text-gray-600">
                                ${data.document.dueDate && data.type === 'invoice' ? `注文日：${data.document.issueDate}` : ''}
                            </div>
                            <div class="col-span-3 text-right">消費税</div>
                            <div class="col-span-3 text-right">${data.totals.tax.toLocaleString('ja-JP')}</div>
                        </div>
                        <div class="grid grid-cols-12 gap-2 text-sm mt-1">
                            <div class="col-span-6 text-xs text-gray-600">
                                ${data.document.number ? `注文番号：${data.document.number}` : ''}
                            </div>
                            <div class="col-span-3 text-right">源泉税対象</div>
                            <div class="col-span-3 text-right">0</div>
                        </div>
                        <div class="grid grid-cols-12 gap-2 text-sm mt-1">
                            <div class="col-span-6 text-xs text-gray-600">
                                支払方法：${data.type === 'receipt' ? '現金' : '銀行振込'}
                            </div>
                            <div class="col-span-3 text-right">消費税</div>
                            <div class="col-span-3 text-right">0</div>
                        </div>
                        <div class="grid grid-cols-12 gap-2 text-sm mt-1 bg-black text-white p-2">
                            <div class="col-span-6"></div>
                            <div class="col-span-3 text-right font-bold">合計</div>
                            <div class="col-span-3 text-right font-bold">${data.totals.total.toLocaleString('ja-JP')}</div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="flex justify-between items-start mt-16">
                    <!-- Left side - Notes -->
                    <div class="w-2/5">
                        <div class="text-xs font-bold mb-1">特記事項</div>
                        ${data.notes ? `
                            <div class="text-xs leading-relaxed">${data.notes}</div>
                        ` : `
                            <div class="text-xs leading-relaxed">
                                ${data.type === 'invoice' ? '銀行振込の場合、振込手数料はご負担ください。' : 'ありがとうございました。'}
                            </div>
                        `}
                    </div>

                    <!-- Right side - Company Info -->
                    <div class="w-2/5 text-right">
                        <div class="text-lg font-bold mb-1">${companyInfo.name}</div>
                        <div class="text-xs mb-0.5">${companyInfo.zip}</div>
                        <div class="text-xs mb-0.5">${companyInfo.address}</div>
                        <div class="text-xs mb-0.5">${companyInfo.tel}</div>
                        <div class="text-xs mb-4">${companyInfo.email}</div>
                    </div>
                </div>

                <!-- Bank Info (for invoices only) -->
                ${data.type === 'invoice' ? `
                    <div class="mt-10 pt-5 border-t border-gray-300">
                        <div class="text-xs font-bold mb-1">振込先</div>
                        <div class="text-xs">${companyInfo.bank}</div>
                        <div class="text-xs">${companyInfo.accountName}</div>
                        <div class="text-xs text-gray-600 mt-1">口座番号は別途ご連絡いたします。</div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // PDF generation function using jsPDF
    async function generatePDF(data) {
        const typeNames = {
            invoice: '請求書',
            receipt: '領収書',
            quote: '見積書'
        };
        const typeName = typeNames[data.type] || '請求書';

        // Create a temporary element for PDF generation
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = '210mm'; // A4 width
        tempDiv.style.backgroundColor = 'white';
        tempDiv.style.padding = '20mm';
        tempDiv.innerHTML = generatePDFContent(data, typeName);
        document.body.appendChild(tempDiv);

        try {
            // Import jsPDF and html2canvas
            const { jsPDF } = window.jspdf;
            const html2canvas = window.html2canvas;

            // Generate canvas from HTML
            const canvas = await html2canvas(tempDiv, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            // Create PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/png');
            
            const pdfWidth = 210; // A4 width in mm
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            
            // Generate filename
            const date = new Date().toISOString().split('T')[0];
            const filename = `${typeName}_${data.customer.name}_${date}.pdf`;
            
            // Download PDF
            pdf.save(filename);
            
        } finally {
            // Clean up
            document.body.removeChild(tempDiv);
        }
    }

    function generatePDFContent(data, typeName) {
        const companyInfo = {
            name: 'LEXIA',
            zip: '〒447-0817',
            address: '愛知県碧南市川端町1-45',
            tel: 'TEL: 090-1742-3456',
            email: 'lexia0web@gmail.com',
            bank: '愛知県中央信用組合 みなみ支店 普通',
            accountName: '口座名義　齋藤雅人'
        };

        return `
            <div style="font-family: 'Yu Gothic', 'Helvetica', 'Arial', sans-serif; background: white; padding: 40px; max-width: 800px; margin: 0 auto;">
                <!-- Header -->
                <div style="position: relative; margin-bottom: 60px;">
                    <h1 style="font-size: 36px; font-weight: 900; margin: 0; color: #000; letter-spacing: 2px;">${typeName}</h1>
                    <div style="position: absolute; top: 0; right: 0; text-align: right;">
                        ${data.document.number ? `
                            <div style="margin-bottom: 8px;">
                                <span style="font-size: 14px; color: #666;">No.</span>
                                <span style="font-size: 16px; font-weight: bold; margin-left: 20px;">${data.document.number}</span>
                            </div>
                        ` : ''}
                        <div>
                            <span style="font-size: 14px; color: #666;">発行日</span>
                            <span style="font-size: 16px; font-weight: bold; margin-left: 20px;">${data.document.issueDate}</span>
                        </div>
                    </div>
                </div>

                <!-- Customer Name and Address -->
                <div style="margin-bottom: 40px;">
                    ${data.customer.zip || data.customer.address ? `
                        <div style="margin-bottom: 15px; font-size: 14px; line-height: 1.5;">
                            ${data.customer.zip ? `<div>${data.customer.zip}</div>` : ''}
                            ${data.customer.address ? `<div>${data.customer.address}</div>` : ''}
                        </div>
                    ` : ''}
                    <div style="border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
                        <span style="font-size: 24px; font-weight: bold; color: #000;">${data.customer.name}</span>
                        <span style="font-size: 20px; margin-left: 20px;">御中</span>
                    </div>
                </div>

                <!-- Total Amount -->
                <div style="margin-bottom: 40px;">
                    <div style="text-align: left;">
                        <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">合計金額</div>
                        <div style="font-size: 32px; font-weight: 900; color: #000;">¥${data.totals.total.toLocaleString('ja-JP')}−</div>
                    </div>
                    <div style="margin-top: 15px; font-size: 14px; color: #666;">
                        ${data.customer.zip || data.customer.address ? '但し' : ''}
                        <span style="margin-left: 50px;">お品代</span>
                        <span style="margin-left: 50px;">として</span>
                    </div>
                    <div style="font-size: 12px; color: #666; margin-top: 5px;">上記正に領収いたしました。</div>
                </div>

                <!-- Items Table -->
                <div style="margin-bottom: 40px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #000; color: white;">
                                <th style="padding: 12px 8px; text-align: left; font-size: 14px; font-weight: bold;">内容</th>
                                <th style="padding: 12px 8px; text-align: center; font-size: 14px; font-weight: bold; width: 80px;">数量</th>
                                <th style="padding: 12px 8px; text-align: center; font-size: 14px; font-weight: bold; width: 100px;">単価</th>
                                <th style="padding: 12px 8px; text-align: center; font-size: 14px; font-weight: bold; width: 100px;">金額</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.items.map((item, index) => `
                                <tr style="border-bottom: 1px solid #ddd;">
                                    <td style="padding: 12px 8px; font-size: 14px;">${item.name}</td>
                                    <td style="padding: 12px 8px; text-align: center; font-size: 14px;">${item.quantity}</td>
                                    <td style="padding: 12px 8px; text-align: right; font-size: 14px;">${item.unitPrice.toLocaleString('ja-JP')}</td>
                                    <td style="padding: 12px 8px; text-align: right; font-size: 14px;">${item.amount.toLocaleString('ja-JP')}</td>
                                </tr>
                            `).join('')}
                            <!-- Empty rows for spacing -->
                            ${Array.from({length: Math.max(0, 6 - data.items.length)}, () => `
                                <tr style="border-bottom: 1px solid #ddd;">
                                    <td style="padding: 12px 8px; font-size: 14px;">&nbsp;</td>
                                    <td style="padding: 12px 8px; text-align: center; font-size: 14px;">&nbsp;</td>
                                    <td style="padding: 12px 8px; text-align: right; font-size: 14px;">&nbsp;</td>
                                    <td style="padding: 12px 8px; text-align: right; font-size: 14px;">&nbsp;</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Tax Details -->
                <div style="margin-bottom: 40px;">
                    <div style="border-top: 2px solid #000; padding-top: 15px;">
                        <div style="font-size: 12px; color: #666; margin-bottom: 15px;">※軽減税率対象</div>
                        
                        <table style="width: 100%; font-size: 14px;">
                            <tr>
                                <td style="width: 60%;"></td>
                                <td style="text-align: right; padding: 5px 15px;">10%対象</td>
                                <td style="text-align: right; padding: 5px 0; width: 100px;">${data.totals.subtotal.toLocaleString('ja-JP')}</td>
                            </tr>
                            <tr>
                                <td style="font-size: 12px; color: #666;">
                                    ${data.document.dueDate && data.type === 'invoice' ? `注文日：${data.document.issueDate}` : ''}
                                </td>
                                <td style="text-align: right; padding: 5px 15px;">消費税</td>
                                <td style="text-align: right; padding: 5px 0;">${data.totals.tax.toLocaleString('ja-JP')}</td>
                            </tr>
                            <tr>
                                <td style="font-size: 12px; color: #666;">
                                    ${data.document.number ? `注文番号：${data.document.number}` : ''}
                                </td>
                                <td style="text-align: right; padding: 5px 15px;">源泉税対象</td>
                                <td style="text-align: right; padding: 5px 0;">0</td>
                            </tr>
                            <tr>
                                <td style="font-size: 12px; color: #666;">
                                    支払方法：${data.type === 'receipt' ? '現金' : '銀行振込'}
                                </td>
                                <td style="text-align: right; padding: 5px 15px;">消費税</td>
                                <td style="text-align: right; padding: 5px 0;">0</td>
                            </tr>
                            <tr style="background-color: #000; color: white;">
                                <td style="padding: 8px 0;"></td>
                                <td style="text-align: right; padding: 8px 15px; font-weight: bold;">合計</td>
                                <td style="text-align: right; padding: 8px 0; font-weight: bold;">${data.totals.total.toLocaleString('ja-JP')}</td>
                            </tr>
                        </table>
                    </div>
                </div>

                <!-- Footer -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 60px;">
                    <!-- Left side - Notes -->
                    <div style="width: 45%;">
                        <div style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">特記事項</div>
                        ${data.notes ? `
                            <div style="font-size: 11px; line-height: 1.4;">${data.notes}</div>
                        ` : `
                            <div style="font-size: 11px; line-height: 1.4;">
                                ${data.type === 'invoice' ? '銀行振込の場合、振込手数料はご負担ください。' : 'ありがとうございました。'}
                            </div>
                        `}
                    </div>

                    <!-- Right side - Company Info -->
                    <div style="width: 45%; text-align: right;">
                        <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">${companyInfo.name}</div>
                        <div style="font-size: 10px; margin-bottom: 2px;">${companyInfo.zip}</div>
                        <div style="font-size: 10px; margin-bottom: 2px;">${companyInfo.address}</div>
                        <div style="font-size: 10px; margin-bottom: 2px;">${companyInfo.tel}</div>
                        <div style="font-size: 10px; margin-bottom: 15px;">${companyInfo.email}</div>
                    </div>
                </div>

                <!-- Bank Info (for invoices only) -->
                ${data.type === 'invoice' ? `
                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <div style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">振込先</div>
                        <div style="font-size: 11px;">${companyInfo.bank}</div>
                        <div style="font-size: 11px;">${companyInfo.accountName}</div>
                        <div style="font-size: 10px; color: #666; margin-top: 5px;">口座番号は別途ご連絡いたします。</div>
                    </div>
                ` : ''}
            </div>
        `;
    }
});