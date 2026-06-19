import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';
import PageLoader from '../../common/PageLoader';

const TruthPage = lazy(() => import('./TruthPage'));

const ZoloTruth = () => {
  const [tSeo] = useTranslation('seo');
  const competitor = competitors.zolo;
  
  const keyIssues = [
    {
      title: 'Low Trustpilot Rating: 1.7/5',
      description: 'Zolo Stays has a Trustpilot rating of 1.7 out of 5, indicating widespread user dissatisfaction. The "premium co-living" positioning does not always match reported user experiences.',
      source: 'Trustpilot reviews'
    },
    {
      title: 'Additional Charges and Fee Adjustments',
      description: 'Users report unexpected fee increases after signing agreements. Items that appeared included in the rent sometimes become additional charges.',
      source: 'User testimonials, reviews'
    },
    {
      title: 'Security Deposit Refund Delays',
      description: 'Multiple complaints note that security deposit refunds can take considerable time after move-out. The refund process is described as lengthy by several users.',
      source: 'Trustpilot, Google Play reviews'
    },
    {
      title: 'Maintenance Request Delays',
      description: 'Maintenance requests are reportedly sometimes delayed. Users paying premium prices note slower-than-expected responses to certain issues.',
      source: 'User reviews'
    },
    {
      title: 'Gap Between Marketing and Experience',
      description: 'Marketing materials describe amenities and services that, according to some users, do not fully materialize. The actual experience can fall short of advertised claims.',
      source: 'User testimonials'
    }
  ];
  
  return (
    <Suspense fallback={<PageLoader />}>
      <TruthPage
        competitor={competitor}
        pageTitle={tSeo('truth.zolo.title')}
        pageDescription={tSeo('truth.zolo.description')}
        canonicalPath="/truth/zolo-issues"
        truthTitle="What to Know About Zolo Stays Service"
        introText="With a Trustpilot rating of 1.7/5, Zolo Stays\' premium positioning contrasts with service issues reported by a number of users. Here is a balanced overview."
        keyIssues={keyIssues}
      />
    </Suspense>
  );
};

export default ZoloTruth;
