import { socialLists } from '../../data/CommonData';

const SocialList = () => {
    return (
        <ul className="social-list">
            {
                socialLists.map((socialList, index) => {
                    return (
                        <li className="social-list__item" key={index}>
                            <a href={socialList.link} className="social-list__link flx-center" target="_blank" rel="noopener noreferrer" aria-label={socialList.label}>{socialList.icon}</a>
                        </li>
                    )
                })
            }
        </ul>
    );
};

export default SocialList;