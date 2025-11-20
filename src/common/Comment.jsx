import React from 'react';

import CommentThumb1 from '/assets/images/thumbs/comment1.png';
import CommentThumb2 from '/assets/images/thumbs/comment2.png';
import { Link } from 'react-router-dom';

import LazyImage from './LazyImage';
const Comment = () => {
    return (
        <>
            <div className="col-lg-12 pt-5">
                <h5 className="comment-title mb-4 mb-lg-5">2 Comment</h5>
                <ul className="comment-list">
                    <li className="comment-list__item d-flex">
                        <div className="comment-list__thumb">
                            <LazyImage src={CommentThumb1} className="cover-img" alt=""/>
                        </div>
                        <div className="comment-list__content">
                            <div className="flx-align gap-2 gap-sm-4">
                                <h6 className="comment-list__name font-16">Amit Sharma</h6>
                                <span className="comment-list__date">December 16, 2023</span>
                                <ul className="social-list mt-0 p-0 border-0 gap-3">
                                    <li className="social-list__item">
                                        <Link to="https://www.facebook.com/people/360Ghar" className="social-list__link text-gradient font-12 flx-center"><i className="fab fa-facebook-f"></i>
                                        </Link>
                                    </li>
                                    <li className="social-list__item">
                                        <Link to="https://x.com/360Ghar" className="social-list__link text-gradient font-12 flx-center"> <i className="fab fa-twitter"></i>
                                        </Link>
                                    </li>
                                    <li className="social-list__item">
                                        <Link to="https://www.instagram.com/360ghar/" className="social-list__link text-gradient font-12 flx-center"> <i className="fab fa-instagram"></i>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <p className="comment-list__desc">Ished fact that a reader will be distrol acted bioii the.ished fact that a reader will be distrol acted laoreet Aliquam fact that a reader will be distrol acted Aliquam eros justo.</p>
                            <a className="comment-list__reply" href="#comment-box"> Reply </a>
                        </div>
                    </li>
                    <li className="comment-list__item d-flex">
                        <div className="comment-list__thumb">
                            <LazyImage src={CommentThumb2} className="cover-img" alt=""/>
                        </div>
                        <div className="comment-list__content">
                            <div className="flx-align gap-2 gap-sm-4">
                                <h6 className="comment-list__name font-16">Neha Kapoor</h6>
                                <span className="comment-list__date">December 16, 2023</span>
                                <ul className="social-list mt-0 p-0 border-0 gap-3">
                                    <li className="social-list__item">
                                        <Link to="https://www.facebook.com/people/360Ghar" className="social-list__link text-gradient font-12 flx-center"><i className="fab fa-facebook-f"></i>
                                        </Link>
                                    </li>
                                    <li className="social-list__item">
                                        <Link to="https://x.com/360Ghar" className="social-list__link text-gradient font-12 flx-center"> <i className="fab fa-twitter"></i>
                                        </Link>
                                    </li>
                                    <li className="social-list__item">
                                        <Link to="https://www.instagram.com/360ghar/" className="social-list__link text-gradient font-12 flx-center"> <i className="fab fa-instagram"></i>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <p className="comment-list__desc">Ished fact that a reader will be distrol acted bioii the.ished fact that a reader will be distrol acted laoreet Aliquam fact that a reader will be distrol acted Aliquam eros justo.</p>
                            <a className="comment-list__reply" href="#comment-box"> Reply </a>
                        </div>
                    </li>
                </ul>
            </div>   
        </>
    );
};

export default Comment;