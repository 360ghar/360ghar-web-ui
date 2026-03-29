import { useNavigate } from 'react-router-dom';

const BlogNextPrev = () => {

    const navigate = useNavigate(); 
    
    return (
        <>
            <div className="blog-nextPrev flx-between gap-3">
                <div className="blog-nextPrev__item flx-align">
                    <button type="button" className="blog-nextPrev__button" onClick={()=>navigate(-1)}> 
                        <i className="fas fa-arrow-left"></i> 
                    </button>
                    <div className="blog-nextPrev__content">
                        <span className="blog-nextPrev__text">Previous post</span>
                        <h6 className="blog-nextPrev__title mb-0">Insure your peace of mind</h6>
                    </div> 
                </div>
                <div className="blog-nextPrev__item flx-align flex-row-reverse ms-auto">
                    <button type="button" className="blog-nextPrev__button" onClick={()=>navigate(1)}> 
                        <i className="fas fa-arrow-right"></i> 
                    </button>
                    <div className="blog-nextPrev__content text-end">
                        <span className="blog-nextPrev__text">Next post</span>
                        <h6 className="blog-nextPrev__title mb-0">Insure your peace of mind</h6>
                    </div> 
                </div>
            </div>   
        </>
    );
};

export default BlogNextPrev;