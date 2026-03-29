
const CommentForm = () => {
    return (
        <>
            <div className="comment-form" id="comment-box">
                <h5 className="comment-form__title"> Leave a Comment </h5>
                <p className="comment-form__desc"> By using form u agree with the message sorage, you can contact us directly now By using form agree with the message sorage, you can contact us directly now </p>
                <form action="#" autoComplete="off">
                    <div className="row gy-4">
                        <div className="col-sm-6">
                            <input type="text" className="common-input common-input--grayBg" placeholder="User Name"/>
                        </div>
                        <div className="col-sm-6">
                            <input type="email" className="common-input common-input--grayBg" placeholder="Email Address"/>
                        </div>
                        <div className="col-sm-12">
                            <textarea className="common-input common-input--grayBg" placeholder="Your Message"></textarea>
                        </div>
                        <div className="col-sm-12">
                            <button className="btn btn-main w-100"> Send Message </button>
                        </div>
                    </div>
                </form>
            </div>   
        </>
    );
};

export default CommentForm;