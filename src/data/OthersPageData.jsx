
// ============================== Property Sidebar Page Data Start ==============================
export const propertyTypes = [
    {
        text: 'House',
        value: 'Houses',
    },
    {
        text: 'Apartment',
        value: 'Apartments',
    },
    {
        text: 'Office',
        value: 'Office',
    },
    {
        text: 'Villa',
        value: 'Villa',
    },
    {
        text: 'Single Family',
        value: 'Single Family',
    },
    {
        text: 'Luxury Home',
        value: 'Luxury Home',
    },
]

export const reasons = [
    {
        text: 'Buying',
        value: 'Buy',
    },
    {
        text: 'Renting',
        value: 'Rent',
    },
    {
        text: 'Selling',
        value: 'Sell',
    },
]

export const searchAmenities = [
    {
        text: 'Dishwasher'
    },
    {
        text: 'Floor Coverings'
    },
    {
        text: 'Internet'
    },
    {
        text: 'Build Wardrobes'
    },
    {
        text: 'Supermarket'
    },
    {
        text: 'Kids Zone'
    },
]
export const priceRanges = [
    {
        text: 'Low Budget',
        value: 'Low Price'
    },
    {
        text: 'Medium',
        value: 'Medium Price'
    },
    {
        text: 'High Budget',
        value: 'High Price'
    }
]
export const bedBaths = [
    {
        text: '1 Bedroom'
    },
    {
        text: '2 Bedrooms'
    },
    {
        text: '3 Bedrooms'
    },
    {
        text: '4 Bedrooms'
    },
    {
        text: '5+ Bedrooms'
    },
]

// ============================== Property Sidebar Page Data End ==============================


// ============================== Property Details Page Data Start ==============================
import propertyDetailsThumb1 from '/assets/images/thumbs/property-details-1.png';
import propertyDetailsThumb2 from '/assets/images/thumbs/property-details-2.png';
import propertyDetailsThumb3 from '/assets/images/thumbs/property-details-3.png';
import propertyDetailsThumb4 from '/assets/images/thumbs/property-details-4.png';
export const propertyDetailsThumbs = [
    {
        thumb: propertyDetailsThumb1
    },
    {
        thumb: propertyDetailsThumb2
    },
    {
        thumb: propertyDetailsThumb3
    },
    {
        thumb: propertyDetailsThumb4
    },
]

import amenitiesIcon1 from '/assets/images/icons/amenities1.svg';
import amenitiesIcon2 from '/assets/images/icons/amenities2.svg';
import amenitiesIcon3 from '/assets/images/icons/amenities3.svg';
import amenitiesIcon4 from '/assets/images/icons/amenities4.svg';
import amenitiesIcon5 from '/assets/images/icons/amenities5.svg';
import amenitiesIcon6 from '/assets/images/icons/amenities6.svg';
export const propertyDetailsAmenities = [ 
    {
        icon: amenitiesIcon1,
        text: "Room", 
        title: "4 Room"  
    },
    {
        icon: amenitiesIcon2,
        text: "Bed", 
        title: "3 Beds"  
    },
    {
        icon: amenitiesIcon3,
        text: "Bath", 
        title: "2 Baths"  
    },
    {
        icon: amenitiesIcon4,
        text: "Space", 
        title: "3 Space"  
    },
    {
        icon: amenitiesIcon5,
        text: "Size", 
        title: "1020 sqft"  
    },
    {
        icon: amenitiesIcon6,
        text: " Property Type ", 
        title: "Apartment"  
    },
]

export const featureLists = [
    {
        icon: <i className="fas fa-check"></i>,
        text: 'Dream Property Solutions'
    },
    {
        icon: <i className="fas fa-check"></i>,
        text: 'Prestige Property Management'
    },
    {
        icon: <i className="fas fa-check"></i>,
        text: 'Secure Property Partners'
    },
    {
        icon: <i className="fas fa-check"></i>,
        text: 'Global Real Estate Investments'
    },
    {
        icon: <i className="fas fa-check"></i>,
        text: 'Doors to Your Future'
    },
    {
        icon: <i className="fas fa-check"></i>,
        text: 'You Home with Experience'
    },
]

export const addressContents = [
    {
        text: 'Address',
        title: 'Gurugram, Haryana, India'
    },
    {
        text: 'Pin Code',
        title: '122001'
    }
]

// Common Sidebar Data
// Blog categories removed. Use blogService.getCategories() in components.

// Sidebar property image imports removed with static data

// Sidebar properties removed. Use propertyAPIService.getRecommendations() in SidebarProperty.

// Sidebar tags removed. Use blogService.getTags() in CommonSidebar.
// ============================== Property Details Page Data End ==============================


// ============================== Listing Page Data Start ==============================
export const addListings = [
    {
        link: '#basicInformation',
        text: 'Basic Information'
    },
    {
        link: '#propertyGallery',
        text: 'Property Gallery'
    },
    {
        link: '#propertyInformation',
        text: 'Property Information'
    },
    {
        link: '#propertyContactDetails',
        text: 'Property Contact Details'
    },
]

export const addAmenities = [
    {
        text: 'Air Condition'
    },
    {
        text: 'Lawn'
    },
    {
        text: 'Swimming Pool'
    },
    {
        text: 'Barbeque'
    },
    {
        text: 'Microwave'
    },
    {
        text: 'TV Cable'
    },
    {
        text: 'Dryer'
    },
    {
        text: 'Outdoor Shower'
    },
    {
        text: 'Washer'
    },
    {
        text: 'Gym'
    },
    {
        text: 'Refrigerator'
    },
    {
        text: 'WiFi'
    },
    {
        text: 'Laundry'
    },
    {
        text: 'Souna'
    },
    {
        text: 'Window Coverings'
    },
]
// ============================== Listing Page Data End ==============================


// ============================== Map Location Page Data Start ==============================
export const mapLocations = [
    {
        id: 1,
        title: 'Alabama',
        mapLocationsCards: [
            {
                title: 'New York',
                mapLocationsContacts: [
                    {
                        icon: <i className="fas fa-map-marker-alt"></i>,
                        title: 'Address',
                        address: ' 5816 S. Coulter Street Amarillo, TX 79119 '
                    },
                    {
                        icon: <i className="fas fa-phone"></i>,
                        title: 'Phone Number',
                        address: ' 012 345 678 9101 '
                    },
                ],
                mapLocationsButtons: [
                    {
                        link: '/contact',
                        text: 'Appointment',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                    {
                        link: 'https://www.google.com',
                        text: 'Website',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                ]           
            },
            {
                title: 'New York',
                mapLocationsContacts: [
                    {
                        icon: <i className="fas fa-map-marker-alt"></i>,
                        title: 'Address',
                        address: ' 5816 S. Coulter Street Amarillo, TX 79119 '
                    },
                    {
                        icon: <i className="fas fa-phone"></i>,
                        title: 'Phone Number',
                        address: ' 012 345 678 9101 '
                    },
                ],
                mapLocationsButtons: [
                    {
                        link: '/contact',
                        text: 'Appointment',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                    {
                        link: 'https://www.google.com',
                        text: 'Website',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                ]           
            },
            {
                title: 'New York',
                mapLocationsContacts: [
                    {
                        icon: <i className="fas fa-map-marker-alt"></i>,
                        title: 'Address',
                        address: ' 5816 S. Coulter Street Amarillo, TX 79119 '
                    },
                    {
                        icon: <i className="fas fa-phone"></i>,
                        title: 'Phone Number',
                        address: ' 012 345 678 9101 '
                    },
                ],
                mapLocationsButtons: [
                    {
                        link: '/contact',
                        text: 'Appointment',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                    {
                        link: 'https://www.google.com',
                        text: 'Website',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                ]           
            },
            {
                title: 'New York',
                mapLocationsContacts: [
                    {
                        icon: <i className="fas fa-map-marker-alt"></i>,
                        title: 'Address',
                        address: ' 5816 S. Coulter Street Amarillo, TX 79119 '
                    },
                    {
                        icon: <i className="fas fa-phone"></i>,
                        title: 'Phone Number',
                        address: ' 012 345 678 9101 '
                    },
                ],
                mapLocationsButtons: [
                    {
                        link: '/contact',
                        text: 'Appointment',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                    {
                        link: 'https://www.google.com',
                        text: 'Website',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                ]           
            },
        ]
    },
    {
        id: 2,
        title: 'Boston',
        mapLocationsCards: [
            {
                title: 'New York',
                mapLocationsContacts: [
                    {
                        icon: <i className="fas fa-map-marker-alt"></i>,
                        title: 'Address',
                        address: ' 5816 S. Coulter Street Amarillo, TX 79119 '
                    },
                    {
                        icon: <i className="fas fa-phone"></i>,
                        title: 'Phone Number',
                        address: ' 012 345 678 9101 '
                    },
                ],
                mapLocationsButtons: [
                    {
                        link: '/contact',
                        text: 'Appointment',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                    {
                        link: 'https://www.google.com',
                        text: 'Website',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                ]           
            },
            {
                title: 'New York',
                mapLocationsContacts: [
                    {
                        icon: <i className="fas fa-map-marker-alt"></i>,
                        title: 'Address',
                        address: ' 5816 S. Coulter Street Amarillo, TX 79119 '
                    },
                    {
                        icon: <i className="fas fa-phone"></i>,
                        title: 'Phone Number',
                        address: ' 012 345 678 9101 '
                    },
                ],
                mapLocationsButtons: [
                    {
                        link: '/contact',
                        text: 'Appointment',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                    {
                        link: 'https://www.google.com',
                        text: 'Website',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                ]           
            },
            {
                title: 'New York',
                mapLocationsContacts: [
                    {
                        icon: <i className="fas fa-map-marker-alt"></i>,
                        title: 'Address',
                        address: ' 5816 S. Coulter Street Amarillo, TX 79119 '
                    },
                    {
                        icon: <i className="fas fa-phone"></i>,
                        title: 'Phone Number',
                        address: ' 012 345 678 9101 '
                    },
                ],
                mapLocationsButtons: [
                    {
                        link: '/contact',
                        text: 'Appointment',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                    {
                        link: 'https://www.google.com',
                        text: 'Website',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                ]           
            },
            {
                title: 'New York',
                mapLocationsContacts: [
                    {
                        icon: <i className="fas fa-map-marker-alt"></i>,
                        title: 'Address',
                        address: ' 5816 S. Coulter Street Amarillo, TX 79119 '
                    },
                    {
                        icon: <i className="fas fa-phone"></i>,
                        title: 'Phone Number',
                        address: ' 012 345 678 9101 '
                    },
                ],
                mapLocationsButtons: [
                    {
                        link: '/contact',
                        text: 'Appointment',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                    {
                        link: 'https://www.google.com',
                        text: 'Website',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                ]           
            },
        ]
    },
    {
        id: 3,
        title: 'North America',
        mapLocationsCards: [
            {
                title: 'New York',
                mapLocationsContacts: [
                    {
                        icon: <i className="fas fa-map-marker-alt"></i>,
                        title: 'Address',
                        address: ' 5816 S. Coulter Street Amarillo, TX 79119 '
                    },
                    {
                        icon: <i className="fas fa-phone"></i>,
                        title: 'Phone Number',
                        address: ' 012 345 678 9101 '
                    },
                ],
                mapLocationsButtons: [
                    {
                        link: '/contact',
                        text: 'Appointment',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                    {
                        link: 'https://www.google.com',
                        text: 'Website',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                ]           
            },
            {
                title: 'New York',
                mapLocationsContacts: [
                    {
                        icon: <i className="fas fa-map-marker-alt"></i>,
                        title: 'Address',
                        address: ' 5816 S. Coulter Street Amarillo, TX 79119 '
                    },
                    {
                        icon: <i className="fas fa-phone"></i>,
                        title: 'Phone Number',
                        address: ' 012 345 678 9101 '
                    },
                ],
                mapLocationsButtons: [
                    {
                        link: '/contact',
                        text: 'Appointment',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                    {
                        link: 'https://www.google.com',
                        text: 'Website',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                ]           
            },
            {
                title: 'New York',
                mapLocationsContacts: [
                    {
                        icon: <i className="fas fa-map-marker-alt"></i>,
                        title: 'Address',
                        address: ' 5816 S. Coulter Street Amarillo, TX 79119 '
                    },
                    {
                        icon: <i className="fas fa-phone"></i>,
                        title: 'Phone Number',
                        address: ' 012 345 678 9101 '
                    },
                ],
                mapLocationsButtons: [
                    {
                        link: '/contact',
                        text: 'Appointment',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                    {
                        link: 'https://www.google.com',
                        text: 'Website',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                ]           
            },
            {
                title: 'New York',
                mapLocationsContacts: [
                    {
                        icon: <i className="fas fa-map-marker-alt"></i>,
                        title: 'Address',
                        address: ' 5816 S. Coulter Street Amarillo, TX 79119 '
                    },
                    {
                        icon: <i className="fas fa-phone"></i>,
                        title: 'Phone Number',
                        address: ' 012 345 678 9101 '
                    },
                ],
                mapLocationsButtons: [
                    {
                        link: '/contact',
                        text: 'Appointment',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                    {
                        link: 'https://www.google.com',
                        text: 'Website',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                ]           
            },
        ]
    },
    {
        id: 4,
        title: 'Gurugram',
        mapLocationsCards: [
            {
                title: 'Gurugram',
                mapLocationsContacts: [
                    {
                        icon: <i className="fas fa-map-marker-alt"></i>,
                        title: 'Address',
                        address: 'Gurugram, Haryana, India'
                    },
                    {
                        icon: <i className="fas fa-phone"></i>,
                        title: 'Phone Number',
                        address: '9999900876'
                    },
                    {
                        icon: <i className="fas fa-envelope"></i>,
                        title: 'Email',
                        address: 'info@360ghar.com'
                    },
                ],
                mapLocationsButtons: [
                    {
                        link: '/contact',
                        text: 'Appointment',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                    {
                        link: 'https://360ghar.com',
                        text: 'Website',
                        icon: <i className="fas fa-paper-plane"></i>
                    },
                ]           
            },
        ]
    },
]
// ============================== Map Location Page Data End ==============================


// ============================== Team Section Data Start ==============================
import teamImg1 from '/assets/images/thumbs/team1.png';
import teamImg2 from '/assets/images/thumbs/team2.png';
import teamImg3 from '/assets/images/thumbs/team3.png';

export const teams = [
    {
        thumb: teamImg1,
        name: 'Arjun Mehta',
        designation: ' President of Sales ',
        shareIcon: <i className="fas fa-share-alt"></i>
    },  
    {
        thumb: teamImg2,
        name: 'Priya Singh',
        designation: 'Manager of Sales',
        shareIcon: <i className="fas fa-share-alt"></i>
    },  
    {
        thumb: teamImg3,
        name: 'Vikram Malhotra',
        designation: 'Director of Sales',
        shareIcon: <i className="fas fa-share-alt"></i>
    },  
]

// ============================== Team Section Data End ==============================



// ====================== Faq Page Counter Four Data Start ====================
import counterFourIcon1 from '/assets/images/icons/counter-four1.svg';
import counterFourIcon2 from '/assets/images/icons/counter-four2.svg';
import counterFourIcon3 from '/assets/images/icons/counter-four3.svg';
import counterFourIcon4 from '/assets/images/icons/counter-four4.svg';

export const counterFourContents = [
    {
        icon: counterFourIcon1,
        number: '800+',
        text: 'Happy Client'
    },
    {
        icon: counterFourIcon2,
        number: '440+',
        text: ' Project done '
    },
    {
        icon: counterFourIcon3,
        number: '500k',
        text: 'Employees'
    },
    {
        icon: counterFourIcon4,
        number: '80+',
        text: ' Award winning '
    },
]
// ====================== Faq Page Counter Four Data End ====================


// ========================= Checkout Page Data Start =========================
import paymentMethodImg1 from '/assets/images/thumbs/paypal.png';
import paymentMethodImg2 from '/assets/images/thumbs/visa.png';

export const paymentMethods = [
    {
        text: 'Debit card / Credit card',
        img: paymentMethodImg1
    },
    {
        text: 'Paypal',
        img: paymentMethodImg2
    },
]

// Bill Lists
export const billingLists = [
    {
        text: '3BHK Luxury Apartment × 2',
        amount: '₹85,000'
    },
    {
        text: 'Property Documentation × 2',
        amount: ' ₹2,500'
    },
    {
        text: 'Legal Consultation × 2',
        amount: ' ₹3,000'
    },
    {
        text: 'Registration Fees',
        amount: ' ₹5,000'
    },
    {
        text: 'GST (18%)',
        amount: ' ₹15,300'
    }
]
// ========================= Checkout Page Data End =========================


// ========================= Cart Page Data Start =========================
import cartThumb1 from '/assets/images/thumbs/property-1.png';
import cartThumb2 from '/assets/images/thumbs/property-2.png';
import cartThumb3 from '/assets/images/thumbs/property-3.png';
import cartThumb4 from '/assets/images/thumbs/property-4.png';

export const cartItems = [
    {       
        thumb: cartThumb1,
        title: '3BHK Luxury Apartment',
        locationIcon: <i className="fas fa-map-marker-alt"></i>,
        location: 'Sector 56, Gurugram, Haryana',
        price: '85.10'
    },
    {
        thumb: cartThumb2,
        title: '2BHK Modern Flat',
        locationIcon: <i className="fas fa-map-marker-alt"></i>,
        location: 'Sector 56, Gurugram, Haryana',
        price: '45,000'
    },
    {
        thumb: cartThumb3,
        title: '4BHK Penthouse',
        locationIcon: <i className="fas fa-map-marker-alt"></i>,
        location: 'Sector 56, Gurugram, Haryana',
        price: '1,20,000'
    },
    {       
        thumb: cartThumb4,
        title: '3BHK Luxury Apartment',
        locationIcon: <i className="fas fa-map-marker-alt"></i>,
        location: 'Sector 56, Gurugram, Haryana',
        price: '95,000'
    },
]
// ========================= Cart Page Data End =========================


// ========================= Account Page Data Start =========================
export const accountTabs = [
    {
        icon: <i className="fas fa-home"></i>,
        text: 'Home '
    },
    {
        icon: <i className="fas fa-user"></i>,
        text: ' Profile'
    },
    {
        icon: <i className="fas fa-map-marker-alt"></i>,
        text: ' address'
    },
    {
        icon: <i className="fas fa-user"></i>,
        text: ' Account Details'
    },
    {
        icon: <i className="fas fa-list"></i>,
        text: ' My Properties'
    },
    {
        icon: <i className="fas fa-heart"></i>,
        text: ' Favorite Properties'
    },
    // {
    //    icon: <i className="fas fa-map-marked-alt"></i>,
    //    text: ' Add Property'
    // },
    {
        icon: <i className="fas fa-lock"></i>,
        text: ' Change Password'
    },
]

export const accountProfileInfos = [ 
    {
        icon: <i className="fas fa-map-marker-alt"></i>,
        text: 'Gurugram, Haryana, India'
    },
    {
        icon: <i className="fas fa-envelope"></i>,
        text: 'info@360ghar.com'
    }
]

export const accountAddress = [ 
    {
        title: 'Billing Address',
        name: 'Rosalina D. William',
        accountAddressInfos: [
            {
                title: 'location:',
                text: 'Gurugram, Haryana, India'
            },
            {
                title: 'Email:',
                text: ' info@360ghar.com'
            },
        ]
    },
    {
        title: 'Shipping Address',
        name: 'Rosalina D. William',
        accountAddressInfos: [
            {
                title: 'location:',
                text: 'Gurugram, Haryana, India'
            },
            {
                title: 'Email:',
                text: ' info@360ghar.com'
            },
        ]
    },
]

// Property table image imports removed with static data

// propertyTables removed. My Properties uses backend via propertyStore.getUserProperties().
// ========================= Account Page Data End =========================


// ========================= Project Page Data End =========================
import projectItemThumb1 from '/assets/images/thumbs/project-img1.png';
import projectItemThumb2 from '/assets/images/thumbs/project-img2.png';
import projectItemThumb3 from '/assets/images/thumbs/project-img3.png';
import projectItemThumb4 from '/assets/images/thumbs/project-img4.png';
export const projectItems = [
    {
        id: 1,
        slug: 'turning-dreams-into-addresses-home-state',
        thumb: projectItemThumb1,
        title: 'Turning Dreams into Addresses Home State',
        desc: 'Explore premium residential and commercial properties in Gurugram with our comprehensive real estate platform. From luxury apartments to office spaces, we provide detailed information and immersive 360° tours to help you make informed property decisions.',
    },
    {
        id: 2,
        slug: 'your-journey-homeownership-starts-here-too',
        thumb: projectItemThumb2,
        title: 'Your journey homeownership starts here too',
        desc: 'Explore premium residential and commercial properties in Gurugram with our comprehensive real estate platform. From luxury apartments to office spaces, we provide detailed information and immersive 360° tours to help you make informed property decisions.',
    },
    {
        id: 3,
        slug: 'luxury-apartments-in-sector-62',
        thumb: projectItemThumb3,
        title: 'Luxury Apartments in Sector 62',
        desc: 'Discover premium 2BHK and 3BHK apartments in Sector 62, Gurugram with world-class amenities, 24/7 security, and proximity to major business hubs. Our 360° virtual tours let you explore every corner of these modern living spaces from the comfort of your home.',
    },
    {
        id: 4,
        slug: 'commercial-complex-in-sector-18',
        thumb: projectItemThumb4,
        title: 'Commercial Complex in Sector 18',
        desc: 'Explore premium residential and commercial properties in Gurugram with our comprehensive real estate platform. From luxury apartments to office spaces, we provide detailed information and immersive 360° tours to help you make informed property decisions.',
    },
    {
        id: 5,
        slug: 'building-trust-one-home-at-a-time',
        thumb: projectItemThumb1,
        title: 'Building Trust, One Home at a Time',
        desc: 'Explore premium residential and commercial properties in Gurugram with our comprehensive real estate platform. From luxury apartments to office spaces, we provide detailed information and immersive 360° tours to help you make informed property decisions.',
    },
    {
        id: 6,
        slug: 'independent-houses-in-sector-49',
        thumb: projectItemThumb2,
        title: 'Independent Houses in Sector 49',
        desc: 'Explore premium residential and commercial properties in Gurugram with our comprehensive real estate platform. From luxury apartments to office spaces, we provide detailed information and immersive 360° tours to help you make informed property decisions.',
    },
    {
        id: 7,
        slug: 'guiding-you-home-with-experience',
        thumb: projectItemThumb3,
        title: 'Guiding You Home with Experience',
        desc: 'Explore premium residential and commercial properties in Gurugram with our comprehensive real estate platform. From luxury apartments to office spaces, we provide detailed information and immersive 360° tours to help you make informed property decisions.',
    },
    {
        id: 8,
        slug: 'villa-projects-in-dlf-phase-2',
        thumb: projectItemThumb4,
        title: 'Villa Projects in DLF Phase 2',
        desc: 'Explore premium residential and commercial properties in Gurugram with our comprehensive real estate platform. From luxury apartments to office spaces, we provide detailed information and immersive 360° tours to help you make informed property decisions.',
    },
]

export const challengeLists = [
    {
        text: 'Unleash the Potential of your Interiors'
    },
    {
        text: 'Expert property valuation and market analysis'
    },
    {
        text: 'Comprehensive legal documentation support'
    },
    {
        text: 'Professional photography and 360° virtual tours'
    },
    {
        text: 'End-to-end property transaction management'
    },
    {
        text: 'Dedicated customer support and after-sales service'
    },
]

export const projectSidebarLists = [
    {
        text: 'Client',
        title: 'Rajesh Properties Pvt Ltd'
    },
    {
        text: '₹2,50,000',
        title: 'Property Consultation'
    },
    {
        text: 'Category',
        title: 'Residential, Real Estate'
    }
]
// ========================= Project Page Data End =========================



// ========================= Project Page Data End =========================
export const contactTopInfos = [
    {
        icon: <i className="fas fa-paper-plane"></i>,
        title: 'Email',
        textOne: 'info@360ghar.com',
        textTwo: '',
        link: 'mailto:'
    },
    {
        icon: <i className="fas fa-map-marker-alt"></i>,
        title: 'Location',
        text: 'Gurugram, Haryana India, 122001',
    },
]
// ========================= Project Page Data End =========================


// ========================= Project Page Data End =========================
// export const propertyTables = [
//     {

//     },
// ]
// ========================= Project Page Data End =========================


// ========================= Project Page Data End =========================
// export const propertyTables = [
//     {

//     },
// ]
// ========================= Project Page Data End =========================

