import React from 'react';
import { paymentMethods } from '../data/OthersPageData/OthersPageData';

import LazyImage from './LazyImage';
const CheckoutPaymentCard = () => {
    return (
        <>
            <div className="card common-card mb-4"> 
                <div className="card-body">
                    <h6 className="title mb-4">Payment Method</h6>
                    <div className="d-flex flex-column gap-3">
                        {
                            paymentMethods.map((paymentMethod, paymentMethodsIndex) => {
                                return (
                                    <div className="payment-method" key={paymentMethodsIndex}>
                                        <div className="common-radio">
                                            <input className="form-check-input" type="radio" name="payment" id={paymentMethod.text}/>
                                            <label className="form-check-label" htmlFor={paymentMethod.text}>
                                                {paymentMethod.text}
                                                <LazyImage src={paymentMethod.img} alt=""/>
                                            </label>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>   
        </>
    );
};

export default CheckoutPaymentCard;