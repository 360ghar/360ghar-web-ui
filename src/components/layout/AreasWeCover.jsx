import SectionHeading from '../../common/ui/SectionHeading';

const AREAS = [
  'DLF Phase 1',
  'DLF Phase 2',
  'DLF Phase 3',
  'DLF Phase 4',
  'DLF Phase 5',
  'Golf Course Road',
  'Golf Course Extension',
  'MG Road',
  'Sohna Road',
  'Cyber City',
  'Udyog Vihar',
  'Sushant Lok 1/2/3',
  'South City 1/2',
  'Palam Vihar',
  'Sector 28 / 29',
  'Sector 45 / 46 / 47',
  'Sector 57 / 58',
  'Sector 62 / 63 / 65 / 67',
  'Sector 70–79',
];

const AreasWeCover = () => {
  return (
    <section className="padding-y-120 bg-white">
      <div className="container container-two">
        <SectionHeading
          headingClass="section-heading style-left"
          subtitle="Service areas"
          subtitleClass=""
          title="Areas we cover in Gurugram"
          renderDesc={false}
          desc=""
          renderButton={false}
          renderBesideDesc={false}
        />

        <div className="row gy-3 mt-2">
          {AREAS.map((area, idx) => (
            <div className="col-md-4 col-sm-6" key={idx}>
              <ul className="check-list style-two">
                <li className="check-list__item d-flex align-items-center">
                  <span className="icon"><i className="fas fa-check"></i></span>
                  <span className="text fw-semibold">{area}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AreasWeCover;
