import React from 'react';
import { ToastContainer, toast } from 'react-toastify';

import messageThumb from '/assets/images/thumbs/message-img.png';
import ValidationForm from './ValidationForm';

import LazyImage from '../../common/LazyImage';
const Message = () => {
    return (
        <>
         <ToastContainer />
            {/* ========================= Message Section Start ======================== */}
            <section className="message">
                <div className="container container-two">
                    <div className="row">
                        <div className="col-lg-5">
                            <div className="message-thumb">
                                <LazyImage src={messageThumb} alt="" className="cover-img"/>
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="form-box">
                                <h2 className="form-box__title">Get A Quote </h2>
                                
                                <ValidationForm 
                                    colClass="col-sm-6 col-xs-6" 
                                    inputClass="common-input common-input--withIcon"
                                    iconSpanClass=""
                                    renderLabel={false}
                                    labelClass="text-black fw-normal"
                                />
                                
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* ========================= Message Section End ======================== */}   
        </>
    );
};

export default Message;


