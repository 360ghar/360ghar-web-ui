import { footerServiceLinks } from '../../../data/CommonData';
import { Link } from 'react-router-dom';

const FooterServiceItem = () => {
    return (
        <>
            <div className="footer-item">
                <h6 className="footer-item__title">Services</h6>
                <ul className="footer-menu">
                    {
                        footerServiceLinks.map((footerServiceLink, index) => {
                            return (
                                <li className="footer-menu__item" key={index}>
                                    <Link to={footerServiceLink.link} className="footer-menu__link">{footerServiceLink.text} </Link>
                                </li>
                            )
                        })
                    }
                </ul>
            </div>   
        </>
    );
};

export default FooterServiceItem;