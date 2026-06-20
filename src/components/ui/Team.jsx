import SectionHeading from '../../common/ui/SectionHeading';
import { teams } from '../../data/OthersPageData';
import TeamItem from './TeamItem';

const Team = () => {
    return (
        <>
            <section className="team padding-y-60">
                <div className="container container-two">

                <SectionHeading
                        headingClass="section-heading style-left style-flex flx-between align-items-end gap-3"  
                        subtitle="Our Professionals"
                        subtitleClass="" 
                        title="Investment and Growth through Real Estate" 
                        renderDesc={false}
                        desc=""
                        renderButton={true}
                        buttonClass="btn-main"
                        buttonText="Learn More"
                    />
                    
                    <div className="row gy-4">
                        {
                            teams.map((team, teamIndex) => {
                                return (
                                    <div className="col-lg-4 col-sm-6 col-6" key={teamIndex}>
                                        <TeamItem team={team}/>
                                    </div>
                                )
                            })
                        }
                      
                    </div>
                </div>
            </section>   
        </>
    );
};

export default Team;