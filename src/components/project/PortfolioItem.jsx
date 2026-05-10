import { I18nLink } from '../../i18n/I18nLink';

import LazyImage from '../../common/ui/LazyImage';
const PortfolioItem = ({ portfolio }) => {
    const {thumb, title, desc, btnIcon} = portfolio; 

    return (
        <div className="portfolio-item">
            <div className="portfolio-item__thumb">
                <LazyImage src={thumb} alt={title || 'Portfolio item'} className="cover-img" width={400} height={300}/>
            </div>
            <div className="portfolio-item__content">
                <I18nLink to="/portfolio-details" className="btn btn-icon"> 
                    <span className="text-gradient line-height-0">
                        {btnIcon}
                    </span> 
                </I18nLink>
                <div className="portfolio-item__inner">
                    <h6 className="portfolio-item__title">
                        <I18nLink to="/portfolio-details" className="link">{title}</I18nLink>
                    </h6>
                    <p className="portfolio-item__desc">{desc}</p>
                </div>
            </div>
        </div>    
    );
};

export default PortfolioItem;