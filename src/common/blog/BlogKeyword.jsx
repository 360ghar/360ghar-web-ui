import { I18nLink } from '../../i18n/I18nLink';

const BlogKeyword = () => {
    return (
        <>
            <div className="blog-keyword flx-between gap-2">
                <div className="blog-keyword__content">
                    <span className="blog-keyword__text t text-heading fw-bold">Keyword: </span>
                    <I18nLink to="#" className="blog-keyword__link">Gurugram Real Estate</I18nLink>
                    <I18nLink to="#" className="blog-keyword__link">PG in Gurugram</I18nLink>
                    <I18nLink to="#" className="blog-keyword__link">360° Tours</I18nLink>
                </div>
                <ul className="social-list style-two mt-0">
                    <li className="social-list__item">
                        <I18nLink to="https://www.facebook.com/people/360Ghar" className="social-list__link flx-center text-facebook" aria-label="Facebook"><i className="fab fa-facebook"></i>
                        </I18nLink>
                    </li>
                    <li className="social-list__item">
                        <I18nLink to="https://x.com/360Ghar" className="social-list__link flx-center text-twitter" aria-label="X (Twitter)"><i className="fab fa-twitter"></i>
                        </I18nLink>
                    </li>
                    <li className="social-list__item">
                        <I18nLink to="https://in.linkedin.com/company/360ghar" className="social-list__link flx-center text-linkedin" aria-label="LinkedIn"> <i className="fab fa-linkedin"></i>
                        </I18nLink>
                    </li>
                </ul>
            </div>   
        </>
    );
};

export default BlogKeyword;