import { Link } from 'react-router-dom';

import LazyImage from '../../common/ui/LazyImage';
const VideoPopup = () => {
    return (
        <>
            <div className="video-popup ">
                <div className="container container-two">
                    <div className="video-popup__thumb">
                        <LazyImage src="assets/images/thumbs/video-popup.png" alt="Watch 360Ghar platform walkthrough video" className="cover-img" width={1200} height={600}/>
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