import React, { useState } from 'react';
import CardTotalCard from '../../common/CardTotalCard';
import { cartItems } from '../../data/OthersPageData/OthersPageData';
import { Link } from 'react-router-dom';

import LazyImage from '../../common/LazyImage';
const CartSection = () => {

    // Initialize state to store quantities for each cart item
    const [quantities, setQuantities] = useState(cartItems.map(() => 1));

    const handleIncrement = (index) => {
        const newQuantities = [...quantities]
        newQuantities[index] += 1;
        setQuantities(newQuantities);
    }

    const handleDecrement = (index) => {
        if (quantities[index] > 1) {
            const newQuantities = [...quantities]
            newQuantities[index] -= 1; 
            setQuantities(newQuantities); 
        }
    }
    
    const [myCartItems, setMyCartItems] = useState([...cartItems]);

    // Remove Cart Item
    const handleRemoveItem = (index) => {
        const newCartItems = [...myCartItems]; 
        newCartItems.splice(index, 1); 
        setMyCartItems(newCartItems); 
    }

    
    return (
        <>
            <section className="cart padding-y-120">
                <div className="container container-two">
                    <div className="row gy-4 justify-content-end">
                        <div className="col-lg-12">
                            <div className="overflow-auto">
                                <div className="card common-card min-w-maxContent">
                                    <div className="card-body">
                                        <table className="table style-two">
                                            <thead>
                                            <tr>
                                                <th>Product Details</th>
                                                <th>Quantity</th>
                                                <th>Total Price</th>
                                                <th>Delete</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    myCartItems.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="4" className="text-center">
                                                                <div className="d-flex flex-column justify-content-center gap-2">
                                                                    <i className="far fa-frown font-40 text-body"></i>
                                                                    <span className="font-18">Your cart is empty</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        myCartItems.map((cartItem, cartItemIndex) => {
                                                            return (
                                                                <tr key={cartItemIndex}>
                                                                    <td>
                                                                        <div className="d-flex align-items-center gap-3">
                                                                            <div className="cart-item__thumb">
                                                                                <LazyImage src={cartItem.thumb} alt=""/>
                                                                            </div>
                                                                            <div className="cart-item__content">
                                                                                <h6 className="cart-item__title fw-500 font-18"> 
                                                                                    <Link to="/properties" className="link">{cartItem.title}</Link>
                                                                                </h6>
                                                                                <p className="property-item__location d-flex gap-2 font-14"> 
                                                                                    <span className="icon text-gradient"> {cartItem.locationIcon}</span>
                                                                                    {cartItem.location}
                                                                                </p>
                                                                                <span className="cart-item__price">Price: <span className="fw-500 text-heading">${cartItem.price}</span></span>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="cart-item__count">
                                                                            <button className='decrement-btn' onClick={()=> handleDecrement(cartItemIndex)}> <i className="fas fa-minus"></i></button>
                                                                            <input type="number" value={quantities[cartItemIndex]} readOnly/>
                                                                            <button className='increment-btn' onClick={()=>handleIncrement(cartItemIndex)}><i className="fas fa-plus"></i></button>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <h6 className="cart-item__totalPrice font-16 fw-500 mb-0">${(quantities[cartItemIndex] * parseFloat(cartItem.price)).toFixed(2)}</h6>
                                                                    </td>
                                                                    <td>
                                                                        <button type="button" onClick={()=> handleRemoveItem(cartItemIndex)} className="rounded-btn delete-btn text-danger bg-danger bg-opacity-10 flex-shrink-0">
                                                                            <i className="fas fa-trash-alt"></i>
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })
                                                    )
                                                }
                                            </tbody>
                                        </table>
                                        <div className="mt-5 d-flex align-items-center gap-4 justify-content-between">
                                            <div className="d-flex align-items-center gap-3">
                                                <input type="text" className="common-input flex-grow-1" placeholder="Coupon Code"/>
                                                <button type="button" className="btn btn-main flex-shrink-0"> Apply Coupon </button>
                                            </div>
                                            <button type="button" className="btn btn-outline-main bg-white flex-shrink-0"> Update Cart </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <CardTotalCard btnText="Proceed To Checkout" quantities={quantities}/>
                        </div>
                    </div>
                </div>
            </section>   
        </>
    );
};

export default CartSection;