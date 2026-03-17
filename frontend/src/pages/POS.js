import React, { useState, useEffect } from 'react';
import { ProductAPI, SaleAPI, PaymentAPI } from '../services/api';
import { useCart } from '../context/CartContext';

const POS = () => {
    const { cart, addToCart, removeFromCart, clearCart, cartTotal } = useCart();
    const [products, setProducts] = useState([]);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('IDLE'); // IDLE, PROCESSING, COMPLETED, FAILED

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const response = await ProductAPI.getAll();
            setProducts(response.data);
        } catch (error) {
            console.error("Failed to load products", error);
        }
    };

    const handleCheckout = async () => {
        if (cart.length === 0 || !phoneNumber) return;
        setPaymentStatus('PROCESSING');

        try {
            // 1. Construct Sale Payload
            const salePayload = {
                total_amount: cartTotal,
                payment_method: "MPESA",
                items: cart.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    subtotal: item.subtotal
                }))
            };

            // 2. Transmit Sale to Database
            const saleResponse = await SaleAPI.create(salePayload);
            const saleId = saleResponse.data.sale_id;

            // 3. Initiate M-Pesa STK Push
            await PaymentAPI.initiateStkPush({
                sale_id: saleId,
                phone_number: phoneNumber,
                amount: cartTotal
            });

            // 4. Poll Database for Callback Resolution
            const pollInterval = setInterval(async () => {
                const statusCheck = await SaleAPI.getById(saleId);
                if (statusCheck.data.transaction_status === 'COMPLETED') {
                    clearInterval(pollInterval);
                    setPaymentStatus('COMPLETED');
                    clearCart();
                    alert(`Payment Successful! Receipt: ${statusCheck.data.mpesa_receipt_number}`);
                }
            }, 3000); // Poll every 3 seconds

            // Timeout after 60 seconds
            setTimeout(() => {
                clearInterval(pollInterval);
                if (paymentStatus !== 'COMPLETED') setPaymentStatus('FAILED');
            }, 60000);

        } catch (error) {
            console.error("Transaction failed", error);
            setPaymentStatus('FAILED');
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui' }}>
            {/* Product Grid Area */}
            <div style={{ flex: 3, padding: '20px', overflowY: 'auto', backgroundColor: '#f3f4f6' }}>
                <h2>Product Catalog</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
                    {products.map(p => (
                        <div 
                            key={p.product_id} 
                            onClick={() => addToCart(p)}
                            style={{ background: '#fff', padding: '10px', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                        >
                            {p.image_url ? (
                                <img src={`http://localhost:8000${p.image_url}`} alt={p.product_name} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100px', backgroundColor: '#e5e7eb' }} />
                            )}
                            <h4 style={{ margin: '10px 0 5px 0' }}>{p.product_name}</h4>
                            <p style={{ margin: 0, color: '#059669', fontWeight: 'bold' }}>Ksh {p.selling_price}</p>
                            <small style={{ color: '#6b7280' }}>Stock: {p.quantity_in_stock}</small>
                        </div>
                    ))}
                </div>
            </div>

            {/* Checkout Sidebar */}
            <div style={{ flex: 1, padding: '20px', backgroundColor: '#ffffff', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                <h2>Current Cart</h2>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {cart.map(item => (
                        <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #f3f4f6', paddingBottom: '5px' }}>
                            <span>{item.product_name} (x{item.quantity})</span>
                            <span>Ksh {item.subtotal}</span>
                        </div>
                    ))}
                </div>
                
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #e5e7eb' }}>
                    <h3>Total: Ksh {cartTotal}</h3>
                    <input 
                        type="text" 
                        placeholder="2547XXXXXXXX" 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }}
                    />
                    <button 
                        onClick={handleCheckout} 
                        disabled={paymentStatus === 'PROCESSING' || cart.length === 0}
                        style={{ width: '100%', padding: '15px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        {paymentStatus === 'PROCESSING' ? 'Awaiting M-Pesa PIN...' : 'Charge M-Pesa'}
                    </button>
                    {paymentStatus === 'FAILED' && <p style={{ color: 'red', textAlign: 'center' }}>Transaction Timeout or Failed.</p>}
                </div>
            </div>
        </div>
    );
};

export default POS;