import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import SectionHeading from '../../common/SectionHeading';
import FloorImage from '/assets/images/thumbs/floor-plan.png';
import { floorTabLists, floorTabPanels } from '../../data/HomeTwoData/HomeTwoData';

import LazyImage from '../../common/LazyImage';
const FloorPlan = () => {
    return (
        <>
        {/* ==================== Floor Plan Section Start =============================== */}
        <section className="floor-plan padding-y-60">
            <div className="container container-two">

                <SectionHeading
                    headingClass=""  
                    subtitle="Floor plan"
                    subtitleClass="" 
                    title="Unlocking the door to your a the new home" 
                    renderDesc={false}
                    desc=""
                    renderButton={false}
                    buttonClass="btn-main"
                    buttonText="View More"
                />

                <div className="row gy-4 align-items-center">
                    <div className="col-lg-6">
                        <div className="floor-plan__thumb">
                            <LazyImage src={FloorImage} alt="Image"/>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="floor-plan__content">
                            <div className="d-block">
                                <Tabs>
                                    <div className="d-flex justify-content-between flex-wrap">
                                        <h6 className="text fw-normal mb-0 floor-plan__title">Select Floor</h6>
                                        <TabList className={'common-tab style-two nav nav-pills mb-0'}>
                                            {
                                                floorTabLists.map((floorTabList, floorTabListIndex) => {
                                                    return (
                                                        <Tab className={'nav-link'} key={floorTabListIndex}>
                                                            <span className="text">{floorTabList.text}</span>
                                                        </Tab>
                                                    )
                                                })
                                            }
                                        </TabList>
                                    </div>

                                    {
                                        floorTabPanels.map((floorTabPanel, FloorTabIndex) => {
                                            return (
                                                <TabPanel key={FloorTabIndex}>
                                                    <ul className="floor-plan-list">
                                                        {
                                                            floorTabPanel.floorPlanLists && floorTabPanel.floorPlanLists.map((floorPlanList, floorPlanListIndex) => {

                                                                const isLastItem = floorPlanListIndex === floorTabPanel.floorPlanLists.length - 1;
                                                                
                                                                return (
                                                                    <li 
                                                                    className={`floor-plan-list__item flx-between ${isLastItem ? 'last-item' : '' }`} 
                                                                    key={floorPlanListIndex}>
                                                                        <h6 className="text fw-normal mb-0">{floorPlanList.text}</h6>
                                                                        <span className="number font-16">{floorPlanList.number}</span>
                                                                    </li>
                                                                )
                                                            })
                                                        }
                                                    </ul>                                               
                                                </TabPanel>
                                            )
                                        })
                                    }
                                </Tabs>   
                            </div>
                            <p className="floor-plan__desc font-18 fw-light">*Real estate is a lucrative industry that involves the buying selling and renting of properties. It encompasses</p>
                            
                        </div>
                    </div>
                </div>
            </div>
        </section>
        {/* ==================== Floor Plan Section End =============================== */}
        </>
    );
};

export default FloorPlan;