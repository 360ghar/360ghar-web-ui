import Button from './Button';

const SectionHeading = (props) => {
    return (

        <>
            <div className={`section-heading ${props.headingClass}`}>
                <div className="section-heading__inner">
                    <span className={`section-heading__subtitle ${props.subtitleClass}`}>
                        <span className="text-gradient fw-semibold"> {props.subtitle} </span> 
                    </span>
                    <h2 className="section-heading__title"> {props.title} </h2>
                    {
                        props.renderDesc && (
                            <p className="section-heading__desc">{props.desc}</p>
                        )
                    }
                </div>

                {
                    props.renderButton && (
                        <Button
                            btnLink={props.buttonLink}
                            btnClass={props.buttonClass}
                            btnText={props.buttonText}
                            spanClass="icon-right"
                            iconClass="fas fa-arrow-right"
                        />
                    )
                }
                {
                    props.renderBesideDesc && (
                        <p className="section-heading__desc">{props.desc}</p>
                    )
                }
            </div>
        </>
    );
};

export default SectionHeading;  


