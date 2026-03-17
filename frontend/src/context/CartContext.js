import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const addToCart = (product) => {
        setCart(prevCart => {
            const existing = prevCart.find(item => item.product_id === product.product_id);
            if (existing) {
                return prevCart.map(item => 
                    item.product_id === product.product_id 
                        ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unit_price }
                        : item
                );
            }
            return [...prevCart, { 
                product_id: product.product_id, 
                product_name: product.product_name,
                unit_price: product.selling_price, 
                quantity: 1, 
                subtotal: product.selling_price 
            }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.product_id !== productId));
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
};