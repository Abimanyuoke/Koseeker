interface ReceiptData {
    uuid: string
    status: 'pending' | 'accept' | 'reject'
    userName: string
    kosName: string
    kosAddress: string
    kampus?: string
    kota?: string
    startDate: string
    endDate: string
    durationMonths: number
    pricePerMonth: number
    discountPercent?: number
    savings?: number
    totalPrice: number
    payment: 'cash' | 'transfer'
    createdAt: string
}

export const generateReceiptHTML = (data: ReceiptData): string => {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID').format(price)
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'accept': return 'Diterima'
            case 'reject': return 'Ditolak'
            case 'pending': return 'Menunggu'
            default: return status
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accept': return { bg: '#D1FAE5', color: '#065F46' }
            case 'reject': return { bg: '#FEE2E2', color: '#991B1B' }
            default: return { bg: '#FEF3C7', color: '#92400E' }
        }
    }

    const statusColor = getStatusColor(data.status)

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Struk Booking - ${data.uuid}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Courier New', monospace; 
                    padding: 20mm;
                    background: white;
                }
                .receipt { 
                    max-width: 80mm; 
                    margin: 0 auto; 
                    border: 2px dashed #333;
                    padding: 20px;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 20px;
                    border-bottom: 2px solid #333;
                    padding-bottom: 10px;
                }
                .header h1 { 
                    font-size: 24px; 
                    margin-bottom: 5px;
                }
                .header p { 
                    font-size: 12px; 
                    color: #666;
                }
                .section { 
                    margin: 15px 0; 
                    padding: 10px 0;
                    border-bottom: 1px dashed #ccc;
                }
                .section:last-child { border-bottom: none; }
                .row { 
                    display: flex; 
                    justify-content: space-between; 
                    margin: 8px 0;
                    font-size: 13px;
                }
                .row.bold { 
                    font-weight: bold; 
                    font-size: 14px;
                }
                .label { 
                    color: #666; 
                }
                .value { 
                    font-weight: 600; 
                    text-align: right;
                }
                .total { 
                    font-size: 16px; 
                    font-weight: bold; 
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 2px solid #333;
                }
                .footer { 
                    text-align: center; 
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 2px solid #333;
                    font-size: 11px;
                    color: #666;
                }
                .status-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    background: ${statusColor.bg};
                    color: ${statusColor.color};
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: bold;
                    margin-top: 5px;
                }
                .discount-row {
                    color: #DC2626;
                }
                @media print {
                    body { padding: 0; }
                }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="header">
                    <h1>🏠 KOSEEKER</h1>
                    <p>Struk Booking Kos</p>
                    <p style="margin-top: 5px; font-size: 10px;">
                        Dicetak: ${new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}
                    </p>
                </div>

                <div class="section">
                    <div class="row bold">
                        <span>Booking ID:</span>
                        <span>${data.uuid}</span>
                    </div>
                    <div class="row">
                        <span class="label">Status:</span>
                        <span class="value">
                            <span class="status-badge">${getStatusText(data.status).toUpperCase()}</span>
                        </span>
                    </div>
                </div>

                <div class="section">
                    <div class="row bold">
                        <span>PENYEWA</span>
                    </div>
                    <div class="row">
                        <span class="label">Nama:</span>
                        <span class="value">${data.userName}</span>
                    </div>
                </div>

                <div class="section">
                    <div class="row bold">
                        <span>DETAIL KOS</span>
                    </div>
                    <div class="row">
                        <span class="label">Nama Kos:</span>
                        <span class="value">${data.kosName}</span>
                    </div>
                    <div class="row">
                        <span class="label">Alamat:</span>
                    </div>
                    <div class="row">
                        <span class="value" style="margin-left: 0; text-align: left; font-size: 11px;">
                            ${data.kosAddress}
                        </span>
                    </div>
                    ${data.kampus ? `
                    <div class="row">
                        <span class="label">Kampus:</span>
                        <span class="value">${data.kampus}</span>
                    </div>
                    ` : ''}
                    ${data.kota ? `
                    <div class="row">
                        <span class="label">Kota:</span>
                        <span class="value">${data.kota}</span>
                    </div>
                    ` : ''}
                </div>

                <div class="section">
                    <div class="row bold">
                        <span>PERIODE SEWA</span>
                    </div>
                    <div class="row">
                        <span class="label">Check-in:</span>
                        <span class="value">
                            ${new Date(data.startDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })}
                        </span>
                    </div>
                    <div class="row">
                        <span class="label">Check-out:</span>
                        <span class="value">
                            ${new Date(data.endDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })}
                        </span>
                    </div>
                    <div class="row">
                        <span class="label">Durasi:</span>
                        <span class="value">${data.durationMonths} Bulan</span>
                    </div>
                </div>

                <div class="section">
                    <div class="row bold">
                        <span>RINCIAN BIAYA</span>
                    </div>
                    <div class="row">
                        <span class="label">Harga per Bulan:</span>
                        <span class="value">Rp ${formatPrice(data.pricePerMonth)}</span>
                    </div>
                    ${data.discountPercent && data.discountPercent > 0 && data.savings ? `
                    <div class="row discount-row">
                        <span class="label">Diskon (${data.discountPercent}%):</span>
                        <span class="value">- Rp ${formatPrice(data.savings)}</span>
                    </div>
                    ` : ''}
                    <div class="row">
                        <span class="label">Durasi:</span>
                        <span class="value">x ${data.durationMonths}</span>
                    </div>
                    <div class="row total">
                        <span>TOTAL PEMBAYARAN:</span>
                        <span>Rp ${formatPrice(data.totalPrice)}</span>
                    </div>
                </div>

                <div class="section">
                    <div class="row">
                        <span class="label">Metode Pembayaran:</span>
                        <span class="value">${data.payment === 'cash' ? 'TUNAI' : 'TRANSFER BANK'}</span>
                    </div>
                </div>

                <div class="section">
                    <div class="row">
                        <span class="label">Tanggal Booking:</span>
                        <span class="value">
                            ${new Date(data.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })}
                        </span>
                    </div>
                </div>

                <div class="footer">
                    <p>Terima kasih telah menggunakan Koseeker!</p>
                    <p style="margin-top: 5px;">Simpan struk ini sebagai bukti booking</p>
                    <p style="margin-top: 10px; font-size: 9px;">
                        Untuk informasi lebih lanjut, hubungi pemilik kos<br/>
                        atau kunjungi www.koseeker.com
                    </p>
                </div>
            </div>
        </body>
        </html>
    `
}
