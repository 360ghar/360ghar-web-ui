import NewsletterThumb from '/assets/images/thumbs/newsletter-bg.png';
import NewsletterForm from '../../common/forms/NewsletterForm';

const Newsletter = () => {
    return (
        <>
            <section className="newsletter bg-white">
                <div className="container container-two">
                    <div className="newsletter-content text-center background-img" style={{ backgroundImage: `url(${NewsletterThumb})` }}>
                        <h2 className="newsletter-content__title text-white">Subscribe To Our Newsletter</h2>
                        <p className="newsletter-content__desc font-18 text-white fw-light">Get the latest property listings, exclusive offers, and real estate insights delivered straight to your inbox. Let us help you find your dream home in Gurugram&apos;s finest locations.</p>

                        <NewsletterForm formClass="" inputClass="white-bordered-input" iconClass="text-gradient" />

                    </div>
                </div>
            </section>
        </>
    );
};

export default Newsletter;