import BottomFooterLinks from './footer/BottomFooterLinks';

const FooterBottom = (props) => {
    return (
        <>
             <div className={`bottom-footer ${props.footerClass}`}>
                <div className="container container-two">
                    <div className="bottom-footer__inner flx-between gap-3">
                        <p className="bottom-footer__text"> &copy; 360Ghar {new Date().getFullYear()} | All Rights Reserved.</p>
                        <BottomFooterLinks/>
                    </div>
                </div>
            </div>   
        </>
    );
};

export default FooterBottom;