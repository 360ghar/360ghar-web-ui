import React from 'react';
import { Link } from 'react-router-dom';
import BreadcrumbImage from '/assets/images/thumbs/breadcrumb-img.png';

import LazyImage from './LazyImage';
const Breadcrumb = (props) => {
    return (
        <>
            {/* =============================== Breadcrumb Start ===========================    */}
            <section className="breadcrumb padding-y-120">
                <LazyImage src={BreadcrumbImage} alt="Breadcrumb Image" className="breadcrumb__img" priority />
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="breadcrumb__wrapper">
                                <h2 className="breadcrumb__title"> {props.pageTitle}</h2>
                                <ul className="breadcrumb__list">
                                    <li className="breadcrumb__item">
                                        <Link to="/" className="breadcrumb__link"> <i className="las la-home"></i> Home</Link> 
                                    </li>
                                    <li className="breadcrumb__item"><i className="fas fa-angle-right"></i></li>
                                    <li className="breadcrumb__item"> <span className="breadcrumb__item-text"> {props.pageName}  </span> </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* =============================== Breadcrumb End ===========================    */}
        </>
    );
};

export default Breadcrumb;
