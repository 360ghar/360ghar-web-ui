import { footerUsefulLinks } from '../../../data/CommonData';
import { Link } from 'react-router-dom';

const FooterUsefulItem = () => {
    return (
        <>
             <div className="footer-item ms-xl-5">
                <h6 className="footer-item__title">Useful Links</h6>
                <ul className="footer-menu">
                    {
                        footerUsefulLinks.map((footerUsefulLink, footerUsefulLinkIndex) => {
                            return (
                                <li className="footer-menu__item" key={footerUsefulLinkIndex}>
                                    <Link to={footerUsefulLink.link} className="footer-menu__link">{footerUsefulLink.text}</Link>
                                </li>
                            )
                        })
                    }
                </ul>
            </div>   
        </>
    );
};

export default FooterUsefulItem;