import React from 'react';
import { starRatings } from '../data/CommonData/CommonData';

const StarRating = () => {
    return (
        <ul className="star-rating flx-align justify-content-end">
            {
                starRatings.map((star, index) => {
                    return (
                        <li className="star-rating__item" key={index}>
                            {star.icon}
                        </li>
                    )
                })
            }

        </ul>
    );
};

export default StarRating;

    