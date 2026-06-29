import { useEffect, useRef, useState } from 'react';
import { socialLists } from '../../data/CommonData';
import { I18nLink } from '../../i18n/I18nLink';

import LazyImage from '../../common/ui/LazyImage';
const TeamItem = ({ team }) => {
    
    const {thumb, name, designation, shareIcon} = team; 

    const [showIcon, setShowIcon] = useState(false);
    const shareRef = useRef(null);

    // Handle Show Icon 
    const handleShowIcon = () => {
        setShowIcon((currentValue) => !currentValue); 
    };

    useEffect(() => {
        const handleDocumentClick = (event) => {
            if (shareRef.current && !shareRef.current.contains(event.target)) {
                setShowIcon(false);
            }
        };

        document.addEventListener('click', handleDocumentClick);
        return () => document.removeEventListener('click', handleDocumentClick);
    }, []);

    return (
        <div className="team-item">
            <div className="team-item__thumb">
                <LazyImage src={thumb} alt={name} className="cover-img"/>
            </div>
            <div className="team-item__content flx-between flex-nowrap">
                <div>
                    <h6 className="team-item__name mb-1 text-white">{name}</h6>
                    <span className="team-item__designation font-12 text-white fw-light">{designation}</span>
                </div>
                <div className={`social-share ${showIcon ? 'active' : ''}`} ref={shareRef}>
                    <button type="button" className={`social-share__button`} onClick={handleShowIcon}>
                        {shareIcon}
                    </button>
                    <ul className={`social-share-list`}>
                        {
                            socialLists.map((iconList, iconListIndex) => {
                                return (
                                    <li className="social-share-list__item" key={iconListIndex}>
                                        <I18nLink to={iconList.link} className="social-share-list__link">
                                            {iconList.icon}
                                        </I18nLink>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
            </div>
        </div>   
    );
};

export default TeamItem;


