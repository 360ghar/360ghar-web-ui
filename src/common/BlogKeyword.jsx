import { Link } from 'react-router-dom';

const BlogKeyword = () => {
    return (
        <>
            <div className="blog-keyword flx-between gap-2">
                <div className="blog-keyword__content">
                    <span className="blog-keyword__text t text-heading fw-bold">Keyword: </span>
                    <Link to="#" className="blog-keyword__link">Gurugram Real Estate</Link>
                    <Link to="#" className="blog-keyword__link">PG in Gurugram</Link>
                    <Link to="#" className="blog-keyword__link">360° Tours</Link>
                </div>
                <ul className="social-list style-two mt-0">
                    <li className="social-list__item">
                        <Link to="https://www.facebook.com/people/360Ghar" className="social-list__link flx-center text-facebook"><i className="fab fa-facebook"></i>
                        </Link>
                    </li>
                    <li className="social-list__item">
                        <Link to="https://x.com/360Ghar" className="social-list__link flx-center text-twitter"><i className="fab fa-twitter"></i>
                        </Link>
                    </li>
                    <li className="social-list__item">
                        <Link to="https://in.linkedin.com/company/360ghar" className="social-list__link flx-center text-linkedin"> <i className="fab fa-linkedin"></i>
                        </Link>
                    </li>
                </ul>
            </div>   
        </>
    );
};

export default BlogKeyword;