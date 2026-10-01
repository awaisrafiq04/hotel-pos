import { Order } from '../types';

export const generateReceiptHtml = (order: Order, restaurantName: string, restaurantLogo: string | null, restaurantAddress: string, formatPrice: (n: number) => string) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Receipt #${order.orderNumber}</title>
    <style>
        @page {
            margin: 0;
            size: auto;
        }
        body {
            background: #eee;
            font-family: 'Courier New', Courier, monospace;
            margin: 0;
            padding: 20px 0;
            display: flex;
            justify-content: center;
        }
        .receipt {
            width: 56mm; /* Safe width for 58mm printers, also works on 80mm */
            background: #fff;
            padding: 8px;
            box-sizing: border-box;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            color: #000;
        }
        .center {
            text-align: center;
        }
        .logo-container {
            margin-bottom: 8px;
        }
        .logo-img {
            max-width: 120px;
            width: auto;
            height: auto;
            max-height: 60px;
            border-radius: 4px;
            object-fit: contain;
            filter: grayscale(1); /* Thermal printers only print black/white */
        }
        .restaurant-name {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .small {
            font-size: 11px;
            line-height: 1.2;
        }
        .divider {
            border-top: 1px dashed #000;
            margin: 8px 0;
        }
        .item-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            margin: 4px 0;
        }
        .item-notes {
            font-size: 10px;
            padding-left: 8px;
            font-style: italic;
        }
        .total-section {
            margin-top: 8px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            margin: 2px 0;
        }
        .grand-total {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            font-weight: bold;
            margin-top: 4px;
            padding-top: 4px;
            border-top: 1px double #000;
        }
        .barcode-container {
            margin: 12px 0 8px;
            text-align: center;
        }
        .barcode {
            height: 25px;
            width: 100%;
            background: repeating-linear-gradient(
                90deg,
                #000,
                #000 1px,
                #fff 1px,
                #fff 2px
            );
            display: inline-block;
        }
        .footer {
            font-size: 10px;
            text-align: center;
            margin-top: 10px;
        }
        .order-meta {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            margin-bottom: 1px;
        }
        @media print {
            body { background: none; padding: 0; }
            .receipt { 
                box-shadow: none; 
                width: 56mm;
                padding: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="center">
            <div class="logo-container">
                <img src="${restaurantLogo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop'}" class="logo-img" alt="Logo">
            </div>
            <div class="restaurant-name">${restaurantName}</div>
            <div class="small" style="margin-top: 2px; opacity: 0.8;">${restaurantAddress}</div>
        </div>

        <div class="divider"></div>

        <div class="order-meta">
            <span>ID: #${order.orderNumber}</span>
            <span>Type: ${order.orderType.toUpperCase()}</span>
        </div>
        <div class="order-meta">
            <span>Date: ${new Date(order.createdAt).toLocaleDateString()}</span>
            <span>Time: ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="order-meta">
            <span>Waiter: ${order.waiterName}</span>
            ${order.tableName ? `<span>Table: ${order.tableName}</span>` : ''}
        </div>

        <div class="divider"></div>

        <div class="items-section">
            ${order.items.map(item => `
                <div class="item-row">
                    <span>${item.quantity} ${item.name}</span>
                    <span>${formatPrice(item.price * item.quantity)}</span>
                </div>
                ${item.notes ? `<div class="item-notes">* ${item.notes}</div>` : ''}
            `).join('')}
        </div>

        <div class="divider"></div>

        ${(order.customerName || order.customerPhone || order.customerAddress) ? `
        <div class="small" style="margin-bottom: 5px;">
            ${order.customerName ? `<div><b>Name:</b> ${order.customerName}</div>` : ''}
            ${order.customerPhone ? `<div><b>Phone:</b> ${order.customerPhone}</div>` : ''}
            ${order.customerAddress ? `<div style="margin-top: 2px;"><b>Address:</b><br>${order.customerAddress}</div>` : ''}
        </div>
        <div class="divider"></div>
        ` : ''}

        <div class="total-section">
            <div class="total-row">
                <span>Subtotal</span>
                <span>${formatPrice(order.subtotal)}</span>
            </div>
            ${order.tax > 0 ? `
            <div class="total-row">
                <span>Tax</span>
                <span>${formatPrice(order.tax)}</span>
            </div>
            ` : ''}
            ${order.discount > 0 ? `
            <div class="total-row">
                <span>Discount</span>
                <span>-${formatPrice(order.discount)}</span>
            </div>
            ` : ''}
            <div class="grand-total">
                <span>TOTAL</span>
                <span>${formatPrice(order.total)}</span>
            </div>
        </div>

        <div class="barcode-container">
            <div class="barcode"></div>
            <div class="small">${order.orderNumber}</div>
        </div>

        <div class="footer">
            THANK YOU FOR COMING!<br>
            Please Visit Again<br>
            <span style="font-size: 8px; opacity: 0.7;">POS BY ${restaurantName}</span>
        </div>
    </div>
</body>
</html>
  `;
};

export const printOrder = (order: Order, restaurantName: string, restaurantLogo: string | null, restaurantAddress: string, formatPrice: (n: number) => string) => {
    const html = generateReceiptHtml(order, restaurantName, restaurantLogo, restaurantAddress, formatPrice);
    const win = window.open('', '_blank', 'width=400,height=600');
    if (win) {
        win.document.write(html);
        win.document.close();
        // In some browsers we need to wait for content to be parsed
        win.onload = () => {
            win.print();
            setTimeout(() => win.close(), 500);
        };
    }
};

export const downloadReceipt = (order: Order, restaurantName: string, restaurantLogo: string | null, restaurantAddress: string, formatPrice: (n: number) => string) => {
    const html = generateReceiptHtml(order, restaurantName, restaurantLogo, restaurantAddress, formatPrice);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${order.orderNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
