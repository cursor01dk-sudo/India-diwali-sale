import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { socket } from '../utils/socket';
import { getProducts } from '../actions/productAction';
import axios from 'axios';

/**
 * Custom Hook: Real-Time Synchronization Listener & 30s Fallback Poller
 * Connects the customer storefront to live administrative updates via Socket.IO
 */
export const useRealTimeSync = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Refresh product catalog from authoritative backend API
        const refreshProducts = () => {
            console.log('[Real-Time Sync]: Refreshing product catalog from authoritative server...');
            dispatch(getProducts());
        };

        // 1. Socket.IO Event Listeners for Instant Synchronization
        const handleProductUpdated = (payload) => {
            console.log('[Real-Time Event]: Product updated by Admin', payload);
            refreshProducts();
        };

        const handlePriceUpdated = (payload) => {
            console.log('[Real-Time Event]: Price updated by Admin', payload);
            refreshProducts();
        };

        const handleStockUpdated = (payload) => {
            console.log('[Real-Time Event]: Inventory/Stock updated by Admin', payload);
            refreshProducts();
        };

        const handleBannerUpdated = (payload) => {
            console.log('[Real-Time Event]: Homepage Banner updated by Admin', payload);
            window.dispatchEvent(new CustomEvent('sync:banner_updated', { detail: payload }));
        };

        const handleUpiUpdated = (payload) => {
            console.log('[Real-Time Event]: Store Receiver UPI ID updated by Admin', payload);
            if (payload && payload.data && payload.data.upiId) {
                localStorage.setItem('merchantUpiId', payload.data.upiId);
                window.dispatchEvent(new CustomEvent('sync:upi_settings_updated', { detail: payload.data }));
            }
        };

        const handleContentUpdated = (payload) => {
            console.log('[Real-Time Event]: Website Content / CMS updated by Admin', payload);
            window.dispatchEvent(new CustomEvent('sync:content_updated', { detail: payload }));
        };

        socket.on('sync:product_created', handleProductUpdated);
        socket.on('sync:product_updated', handleProductUpdated);
        socket.on('sync:product_deleted', handleProductUpdated);
        socket.on('sync:price_updated', handlePriceUpdated);
        socket.on('sync:stock_updated', handleStockUpdated);
        socket.on('sync:banner_updated', handleBannerUpdated);
        socket.on('sync:upi_settings_updated', handleUpiUpdated);
        socket.on('sync:content_updated', handleContentUpdated);

        // 2. Fallback Synchronization: Polling every 30 seconds
        const fallbackInterval = setInterval(() => {
            refreshProducts();

            // Also check latest UPI settings in fallback
            axios.get('/api/v1/payment/upi-settings')
                .then(({ data }) => {
                    if (data && data.success && data.upiId) {
                        localStorage.setItem('merchantUpiId', data.upiId);
                    }
                })
                .catch(() => {});
        }, 30000);

        return () => {
            socket.off('sync:product_created', handleProductUpdated);
            socket.off('sync:product_updated', handleProductUpdated);
            socket.off('sync:product_deleted', handleProductUpdated);
            socket.off('sync:price_updated', handlePriceUpdated);
            socket.off('sync:stock_updated', handleStockUpdated);
            socket.off('sync:banner_updated', handleBannerUpdated);
            socket.off('sync:upi_settings_updated', handleUpiUpdated);
            socket.off('sync:content_updated', handleContentUpdated);
            clearInterval(fallbackInterval);
        };
    }, [dispatch]);
};

export default useRealTimeSync;

