import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { filterTabs } from '../../data/HomeOneData';
import SimplifiedFilter from './SimplifiedFilter';
import { usePropertyStore } from '../../store/propertyStore';

const TabFilter = () => {
    const { updateFilter } = usePropertyStore();

    const handleTabSelect = (index) => {
        const purposeMapping = {
            0: 'rent',    // Rent
            1: 'buy',     // Buy  
            2: 'sell'     // Sell (though sell might not be used for property search)
        };
        
        const purpose = purposeMapping[index];
        if (purpose && purpose !== 'sell') { // Don\Don'tapos;t set purpose for sell tab
            updateFilter('purpose', purpose);
        } else if (purpose === 'sell') {
            // Clear purpose for sell tab or set it to buy (since sell is more for listing)
            updateFilter('purpose', '');
        }
    };

    return (
        <>
             <Tabs onSelect={handleTabSelect}>
                <TabList className={'common-tab nav nav-pills'}>
                    {
                        filterTabs.map((filterTab, index) => (
                            <Tab key={index} className={'nav-link'}>{filterTab.text}</Tab>
                        ))
                    }
                </TabList>
                {
                    filterTabs.map((filterTab, index) => (
                        <TabPanel key={index}>
                            <SimplifiedFilter 
                                buttonText={`Search ${filterTab.text === 'Rent' ? 'Rentals' : filterTab.text === 'Buy' ? 'Properties' : 'Properties'}`}
                            />
                        </TabPanel>
                    ))
                }
            </Tabs>   
        </>
    );
};

export default TabFilter;