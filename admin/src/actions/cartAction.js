import axios from "axios"
import { ADD_TO_CART, EMPTY_CART, REMOVE_FROM_CART, SAVE_SHIPPING_INFO } from "../constants/cartConstants";

// add to cart
export const addItemsToCart = (id, quantity = 1, directProduct = null) => async (dispatch, getState) => {
    let itemData;
    if (directProduct && (directProduct._id || directProduct.product)) {
        itemData = {
            product: directProduct._id || directProduct.product,
            name: directProduct.name,
            seller: directProduct.brand?.name || directProduct.seller || 'Flipkart Assured',
            price: directProduct.price,
            cuttedPrice: directProduct.cuttedPrice || (directProduct.price * 1.25),
            image: directProduct.images?.[0]?.url || directProduct.image || '',
            stock: directProduct.stock || 25,
            quantity,
        };
    } else {
        const { data } = await axios.get(`/api/v1/product/${id}`);
        itemData = {
            product: data.product._id,
            name: data.product.name,
            seller: data.product.brand?.name || 'Flipkart Assured',
            price: data.product.price,
            cuttedPrice: data.product.cuttedPrice,
            image: data.product.images[0].url,
            stock: data.product.stock,
            quantity,
        };
    }

    dispatch({
        type: ADD_TO_CART,
        payload: itemData,
    });

    localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems));
};

// remove cart item
export const removeItemsFromCart = (id) => async (dispatch, getState) => {

    dispatch({
        type: REMOVE_FROM_CART,
        payload: id,
    });

    localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems))
}

// empty cart
export const emptyCart = () => async (dispatch, getState) => {

    dispatch({ type: EMPTY_CART });

    localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems))
}

// save shipping info
export const saveShippingInfo = (data) => async (dispatch) => {

    dispatch({
        type: SAVE_SHIPPING_INFO,
        payload: data,
    });

    localStorage.setItem('shippingInfo', JSON.stringify(data));
}