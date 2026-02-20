import { useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { propertyTwoTabs } from '../../data/HomeThreeData/HomeThreeData';
import SectionHeading from '../../common/SectionHeading';
import PropertyItem from './PropertyItem';
import usePropertyStore from '../../store/propertyStore';

const PropertyTwo = ({
    sectionClass = 'property-two bg-gray-100 padding-t-60 padding-b-120',
    containerClass = 'container container-two',
    headingSubtitle = 'Latest Properties',
    headingTitle = 'Real estate Investing in made it lot easy',
    renderHeading = true,
    showTabs = true,
    maxItems = 6,
    gridItemClass = 'col-lg-4 col-sm-6',
    propertyItemClass = 'style-two style-shaped',
    showFeatureBadges = true
}) => {
    const {
        recommendations,
        isLoading,
        error,
        fetchRecommendations 
    } = usePropertyStore();

    useEffect(() => {
        fetchRecommendations(12); // Fetch more properties for tabs
    }, [fetchRecommendations]);

    const displayProperties = recommendations || [];

    const renderPropertyGrid = () => {
        if (isLoading) {
            return Array.from({ length: 6 }).map((_, index) => (
                <div className={gridItemClass} key={index}>
                    <div className="property-item loading">
                        <div className="property-item__thumb loading-placeholder"></div>
                        <div className="property-item__content">
                            <div className="loading-placeholder-text"></div>
                            <div className="loading-placeholder-text short"></div>
                        </div>
                    </div>
                </div>
            ));
        }

        if (error) {
            return (
                <div className="col-12">
                    <div className="text-center py-4">
                        <p className="text-danger">Error loading properties: {error}</p>
                    </div>
                </div>
            );
        }

        return displayProperties.slice(0, maxItems).map((property, index) => (
            <div className={gridItemClass} key={property.id || index}>
                <PropertyItem
                    itemClass={propertyItemClass}
                    btnClass="text-gradient fw-semibold"
                    property={property}
                    badgeText={property.status || "For Sale"}
                    badgeClass="property-item__badge"
                    iconsClass="text-gradient"
                    btnRenderBottom={true}
                    btnRenderRight={false}
                    showFeatureBadges={showFeatureBadges}
                />
            </div>
        ));
    };

    return (
        <>
            <section className={sectionClass}>
                <div className={containerClass}>
                    {renderHeading && (
                        <SectionHeading
                            headingClass="style-center"
                            subtitle={headingSubtitle}
                            subtitleClass="bg-white"
                            title={headingTitle}
                            renderDesc={false}
                            desc="Real estate is a lucrative industry that involves the buying selling and renting of properties. It encompasses residential commercial and industrial properties Real estate agents play a crucial role in facilitating real estate"
                            renderButton={false}
                            buttonClass="btn-main"
                            buttonText="View More"
                        />
                    )}

                    {showTabs ? (
                        <Tabs>
                            <TabList className={'common-tab nav nav-pills justify-content-center mb-40'}>
                                {propertyTwoTabs.map((propertyTwoTab, propertyTwoTabIndex) => (
                                    <Tab className={'nav-link bg-transparent'} key={propertyTwoTabIndex}>
                                        {propertyTwoTab.text}
                                    </Tab>
                                ))}
                            </TabList>

                            {propertyTwoTabs.map((_, tabIndex) => (
                                <TabPanel key={tabIndex}>
                                    <div className="row gy-4 property-item-wrapper">
                                        {renderPropertyGrid()}
                                    </div>
                                </TabPanel>
                            ))}
                        </Tabs>
                    ) : (
                        <div className="row gy-4 property-item-wrapper">
                            {renderPropertyGrid()}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default PropertyTwo;
