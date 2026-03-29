import { socialLists } from '../../data/CommonData';
import { Link } from 'react-router-dom';

const SocialList = () => {
    return (
        <ul className="social-list">
            {
                socialLists.map((socialList, index) => {
                    return (
                        <li className="social-list__item" key={index}>
                            <Link to={socialList.link} className="social-list__link flx-center">{socialList.icon}</Link>
                        </li>
                    )
                })
            }
        </ul>
    );
};

export default SocialList;