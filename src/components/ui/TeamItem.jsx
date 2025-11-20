import React, { useState } from 'react';
import { socialLists } from '../../data/CommonData/CommonData';
import { Link } from 'react-router-dom';

import LazyImage from '../../common/LazyImage';
const TeamItem = ({ team }) => {
    
    const {thumb, name, designation, shareIcon} = team; 

    const [showIcon, setShowIcon] = useState();

    // Handle Show Icon 
    const handleShowIcon = () => {
        const shareButtons = document.querySelectorAll('.social-share'); 
        shareButtons.forEach(button => {
            button.classList.remove('active')
        });

        setShowIcon(!showIcon); 
    }

    // Handle Body Click
    document.addEventListener('click', (event) => {
        if(
            event.target.closest('.social-share') === null
        ) {
            setShowIcon(false);    
        }
    })

    return (
        <div className="team-item">
            <div className="team-item__thumb">
                <LazyImage src={thumb} alt="Team Image" className="cover-img"/>
            </div>
            <div className="team-item__content flx-between flex-nowrap">
                <div>
                    <h6 className="team-item__name mb-1 text-white">{name}</h6>
                    <span className="team-item__designation font-12 text-white fw-light">{designation}</span>
                </div>
                <div className={`social-share ${showIcon ? 'active' : ''}`}>
                    <button type="button" className={`social-share__button`} onClick={handleShowIcon}>
                        {shareIcon}
                    </button>
                    <ul className={`social-share-list`}>
                        {
                            socialLists.map((iconList, iconListIndex) => {
                                return (
                                    <li className="social-share-list__item" key={iconListIndex}>
                                        <Link to={iconList.link} className="social-share-list__link">
                                            {iconList.icon}
                                        </Link>
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



