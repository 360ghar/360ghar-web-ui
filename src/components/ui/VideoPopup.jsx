import React from 'react';
import { Link } from 'react-router-dom';

import LazyImage from '../../common/LazyImage';
const VideoPopup = () => {
    return (
        <>
            <div className="video-popup ">
                <div className="container container-two">
                    <div className="video-popup__thumb">
                        <LazyImage src="assets/images/thumbs/video-popup.png" alt="" className="cover-img"/>
                        <Link to="https://www.youtube.com/watch?v=pPl3ZZdTP3g" className="popup-video-link video-popup__button">
                            <i className="fas fa-play"></i>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VideoPopup;