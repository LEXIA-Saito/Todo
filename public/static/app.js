// Invoice Generation App JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    const issueDateInput = document.getElementById('issueDate');
    if (issueDateInput) {
        issueDateInput.value = today;
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

    // PDF generation
    document.getElementById('generatePDF')?.addEventListener('click', async function() {
        const formData = collectFormData();
        
        // Validate required fields
        if (!formData.customer.name || !formData.document.issueDate || formData.items.length === 0) {
            alert('必須項目を入力してください。');
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
                dueDate: document.getElementById('dueDate')?.value || ''
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
            <div class="max-w-4xl mx-auto bg-white" style="font-family: 'Helvetica', 'Arial', sans-serif;">
                <!-- Header -->
                <div class="text-center border-b-2 border-black pb-4 mb-6">
                    <h1 class="text-3xl font-bold mb-2">${typeName}</h1>
                    ${data.document.number ? `<p class="text-lg">No. ${data.document.number}</p>` : ''}
                </div>

                <!-- Company and Customer Info -->
                <div class="grid grid-cols-2 gap-8 mb-8">
                    <!-- Customer Info -->
                    <div>
                        <h3 class="font-bold mb-2 border-b border-black pb-1">宛先</h3>
                        <div class="space-y-1">
                            ${data.customer.zip ? `<p>${data.customer.zip}</p>` : ''}
                            ${data.customer.address ? `<p>${data.customer.address}</p>` : ''}
                            <p class="text-lg font-bold">${data.customer.name} 様</p>
                        </div>
                    </div>

                    <!-- Company Info -->
                    <div class="text-right">
                        <h3 class="font-bold mb-2 border-b border-black pb-1">発行者</h3>
                        <div class="space-y-1">
                            <p class="text-lg font-bold">${companyInfo.name}</p>
                            <p>${companyInfo.zip}</p>
                            <p>${companyInfo.address}</p>
                            <p>${companyInfo.tel}</p>
                            <p>${companyInfo.email}</p>
                        </div>
                    </div>
                </div>

                <!-- Document Details -->
                <div class="grid grid-cols-2 gap-8 mb-6">
                    <div>
                        <p><span class="font-bold">発行日:</span> ${data.document.issueDate}</p>
                        ${data.document.dueDate && data.type === 'invoice' ? 
                            `<p><span class="font-bold">支払期限:</span> ${data.document.dueDate}</p>` : ''}
                    </div>
                    <div class="text-right">
                        <div class="bg-gray-100 p-4 rounded">
                            <p class="text-2xl font-bold">合計金額: ¥${data.totals.total.toLocaleString('ja-JP')}</p>
                        </div>
                    </div>
                </div>

                <!-- Items Table -->
                <div class="mb-8">
                    <table class="w-full border border-black">
                        <thead>
                            <tr class="bg-gray-200">
                                <th class="border border-black px-4 py-2 text-left">項目</th>
                                <th class="border border-black px-4 py-2 text-center">数量</th>
                                <th class="border border-black px-4 py-2 text-right">単価</th>
                                <th class="border border-black px-4 py-2 text-right">金額</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.items.map(item => `
                                <tr>
                                    <td class="border border-black px-4 py-2">${item.name}</td>
                                    <td class="border border-black px-4 py-2 text-center">${item.quantity}</td>
                                    <td class="border border-black px-4 py-2 text-right">¥${item.unitPrice.toLocaleString('ja-JP')}</td>
                                    <td class="border border-black px-4 py-2 text-right">¥${item.amount.toLocaleString('ja-JP')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="border border-black px-4 py-2 text-right font-bold">小計</td>
                                <td class="border border-black px-4 py-2 text-right font-bold">¥${data.totals.subtotal.toLocaleString('ja-JP')}</td>
                            </tr>
                            <tr>
                                <td colspan="3" class="border border-black px-4 py-2 text-right">消費税(10%)</td>
                                <td class="border border-black px-4 py-2 text-right">¥${data.totals.tax.toLocaleString('ja-JP')}</td>
                            </tr>
                            <tr class="bg-gray-200">
                                <td colspan="3" class="border border-black px-4 py-2 text-right font-bold text-lg">合計</td>
                                <td class="border border-black px-4 py-2 text-right font-bold text-lg">¥${data.totals.total.toLocaleString('ja-JP')}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <!-- Notes -->
                ${data.notes ? `
                    <div class="mb-8">
                        <h3 class="font-bold mb-2 border-b border-black pb-1">備考</h3>
                        <p class="whitespace-pre-line">${data.notes}</p>
                    </div>
                ` : ''}

                <!-- Bank Info (for invoices) -->
                ${data.type === 'invoice' ? `
                    <div class="border-t border-black pt-4">
                        <h3 class="font-bold mb-2">振込先</h3>
                        <p>${companyInfo.bank}</p>
                        <p>${companyInfo.accountName}</p>
                        <p class="text-sm text-gray-600 mt-2">口座番号は別途ご連絡いたします。</p>
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
            <div style="font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; line-height: 1.4; color: #000;">
                <!-- Header -->
                <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px;">
                    <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 10px 0;">${typeName}</h1>
                    ${data.document.number ? `<p style="font-size: 16px; margin: 0;">No. ${data.document.number}</p>` : ''}
                </div>

                <!-- Company and Customer Info -->
                <table style="width: 100%; margin-bottom: 25px;">
                    <tr>
                        <td style="width: 50%; vertical-align: top;">
                            <div style="border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px;">
                                <strong>宛先</strong>
                            </div>
                            ${data.customer.zip ? `<p style="margin: 3px 0;">${data.customer.zip}</p>` : ''}
                            ${data.customer.address ? `<p style="margin: 3px 0;">${data.customer.address}</p>` : ''}
                            <p style="font-size: 16px; font-weight: bold; margin: 8px 0;">${data.customer.name} 様</p>
                        </td>
                        <td style="width: 50%; text-align: right; vertical-align: top;">
                            <div style="border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px;">
                                <strong>発行者</strong>
                            </div>
                            <p style="font-size: 16px; font-weight: bold; margin: 3px 0;">${companyInfo.name}</p>
                            <p style="margin: 3px 0;">${companyInfo.zip}</p>
                            <p style="margin: 3px 0;">${companyInfo.address}</p>
                            <p style="margin: 3px 0;">${companyInfo.tel}</p>
                            <p style="margin: 3px 0;">${companyInfo.email}</p>
                        </td>
                    </tr>
                </table>

                <!-- Document Details and Total -->
                <table style="width: 100%; margin-bottom: 20px;">
                    <tr>
                        <td style="width: 50%; vertical-align: top;">
                            <p style="margin: 5px 0;"><strong>発行日:</strong> ${data.document.issueDate}</p>
                            ${data.document.dueDate && data.type === 'invoice' ? 
                                `<p style="margin: 5px 0;"><strong>支払期限:</strong> ${data.document.dueDate}</p>` : ''}
                        </td>
                        <td style="width: 50%; text-align: right; vertical-align: top;">
                            <div style="background-color: #f0f0f0; padding: 15px; border: 1px solid #000;">
                                <p style="font-size: 20px; font-weight: bold; margin: 0;">合計金額: ¥${data.totals.total.toLocaleString('ja-JP')}</p>
                            </div>
                        </td>
                    </tr>
                </table>

                <!-- Items Table -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 1px solid #000;">
                    <thead>
                        <tr style="background-color: #e5e5e5;">
                            <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">項目</th>
                            <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; width: 15%;">数量</th>
                            <th style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold; width: 20%;">単価</th>
                            <th style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold; width: 20%;">金額</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.items.map(item => `
                            <tr>
                                <td style="border: 1px solid #000; padding: 8px;">${item.name}</td>
                                <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.quantity}</td>
                                <td style="border: 1px solid #000; padding: 8px; text-align: right;">¥${item.unitPrice.toLocaleString('ja-JP')}</td>
                                <td style="border: 1px solid #000; padding: 8px; text-align: right;">¥${item.amount.toLocaleString('ja-JP')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">小計</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">¥${data.totals.subtotal.toLocaleString('ja-JP')}</td>
                        </tr>
                        <tr>
                            <td colspan="3" style="border: 1px solid #000; padding: 8px; text-align: right;">消費税(10%)</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right;">¥${data.totals.tax.toLocaleString('ja-JP')}</td>
                        </tr>
                        <tr style="background-color: #e5e5e5;">
                            <td colspan="3" style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold; font-size: 14px;">合計</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold; font-size: 14px;">¥${data.totals.total.toLocaleString('ja-JP')}</td>
                        </tr>
                    </tfoot>
                </table>

                <!-- Notes -->
                ${data.notes ? `
                    <div style="margin-bottom: 25px;">
                        <div style="border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px;">
                            <strong>備考</strong>
                        </div>
                        <p style="white-space: pre-line; margin: 0; line-height: 1.5;">${data.notes}</p>
                    </div>
                ` : ''}

                <!-- Bank Info (for invoices) -->
                ${data.type === 'invoice' ? `
                    <div style="border-top: 1px solid #000; padding-top: 15px;">
                        <div style="margin-bottom: 10px;">
                            <strong>振込先</strong>
                        </div>
                        <p style="margin: 3px 0;">${companyInfo.bank}</p>
                        <p style="margin: 3px 0;">${companyInfo.accountName}</p>
                        <p style="font-size: 10px; color: #666; margin-top: 8px;">口座番号は別途ご連絡いたします。</p>
                    </div>
                ` : ''}
            </div>
        `;
    }
});