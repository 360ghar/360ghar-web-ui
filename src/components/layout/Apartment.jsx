import SectionHeading from '../../common/ui/SectionHeading';
import { apartmentTds, apartmentThs } from '../../data/HomeTwoData';
import { Link } from 'react-router-dom';

const Apartment = () => {
    return (
        <>
            {/* ============================ Apartment Section Start ================================ */}
            <section className="apartment section-bg-dark padding-y-120">
                <div className="container container-two">

                    <SectionHeading
                        headingClass="section-heading style-left style-flex"  
                        subtitle="Available Apartments"
                        subtitleClass="" 
                        title="Unlocking the door to your a the new home" 
                        renderDesc={false}
                        desc="Real estate is a lucrative industry that involves the buying selling and renting of properties. It encompasses residential commercial "
                        renderButton={false}
                        renderBesideDesc={true}
                        buttonClass="btn-main"
                        buttonText="View More"
                    />
                    
                    <div className="table-card table-responsive">
                        <table className="table common-table">
                            <thead>
                            <tr>
                                {
                                    apartmentThs.map((apartmentTh, index) => {
                                        return (
                                            <th className={`${index === apartmentThs.length - 1 ? 'd-none' : ''}`} key={index}>
                                                {apartmentTh.heading}
                                            </th>
                                        )
                                    })
                                }
                            </tr>
                            </thead>
                            <tbody>
                                {
                                    apartmentTds.map((apartmentTd, apartmentTdIndex) => {
                                        return (
                                            <tr key={apartmentTdIndex}>
                                                <td>{apartmentTd.no}</td>
                                                <td>{apartmentTd.bathroom}</td>
                                                <td>{apartmentTd.rooms}</td>
                                                <td>{apartmentTd.area}</td>
                                                <td>{apartmentTd.pricing}</td>
                                                <td>
                                                    <Link to={apartmentTd.actionLink} className="simple-btn text-gradient fw-semibold font-14">
                                                        {apartmentTd.action} 
                                                        <span className="icon-right"> <i className="fas fa-arrow-right"></i> </span> 
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </section> 
            {/* ============================ Apartment Section End ================================ */}
        </>
    );
};

export default Apartment;