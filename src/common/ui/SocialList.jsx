import { socialLists } from '../../data/CommonData';
import { I18nLink } from '../../i18n/I18nLink';

const SocialList = () => {
    return (
        <ul className="social-list">
            {
                socialLists.map((socialList, index) => {
                    return (
                        <li className="social-list__item" key={index}>
                            <I18nLink to={socialList.link} className="social-list__link flx-center">{socialList.icon}</I18nLink>
                        </li>
                    )
                })
            }
        </ul>
    );
};

export default SocialList;