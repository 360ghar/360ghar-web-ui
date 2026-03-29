import { Link } from 'react-router-dom';
import { topHeaderInfos } from '../../data/CommonData';

const TopHeader = () => {
    return (
        <>
            {/* ==================== Header Top Start Here ==================== */}
            <div className="header-top">
                <div className="container container-two">

                    <div className="header-info-wrapper flx-between">
                        {
                            topHeaderInfos.map((item, index) => (
                                <div key={index} className={`header-info flx-align ${index === 2 ? 'd-sm-block d-none ms-auto' : ''}`}>
                                    <div className="header-info__item flx-align">
                                        <span className="header-info__icon">{item.icon}</span>
                                        {
                                            item.link ? (
                                                <Link to={`${item.link}${item.text}`} className="header-info__text">{item.text}</Link>
                                            ) : (
                                                <p className="header-info__text">{item.text}</p>
                                            )
                                        }
                                    </div>
                                </div>
                            ))
                        }
                    </div>

                </div>
            </div>
            {/* ==================== Header Top End Here ==================== */}   
        </>
    );
};

export default TopHeader;