// Full brands data for Hub-Admin
// Contains 18 brands with associated products

export const brandsData = [
  {
    id: 1,
    name: 'Cardinal',
    logo: '/assets/imgs/brands/brand-1.jpg',
    managerName: 'Rajesh Kumar',
    email: 'rajesh.kumar@cardinal.com',
    phone: '+254 98765 43210',
    tag: 'Official Brand Partner',
    products: [
      { id: 101, productName: 'Cardinal Sport Shoes', category: 'Fashion', price: 1299, stock: 45, status: 'Active' },
      { id: 102, productName: 'Cardinal Leather Belt', category: 'Fashion', price: 349, stock: 120, status: 'Active' },
      { id: 103, productName: 'Cardinal Gym Bag', category: 'Travel', price: 899, stock: 15, status: 'Active' },
      { id: 104, productName: 'Cardinal Performance Tee', category: 'Fashion', price: 549, stock: 0, status: 'Inactive' },
      { id: 105, productName: 'Cardinal Elite Shorts', category: 'Fashion', price: 449, stock: 68, status: 'Active' }
    ]
  },
  {
    id: 2,
    name: 'BirdFly',
    logo: '/assets/imgs/brands/brand-2.jpg',
    managerName: 'Priya Sharma',
    email: 'p.sharma@birdfly.com',
    phone: '+254 98223 11004',
    tag: 'Verified Seller',
    products: [
      { id: 201, productName: 'BirdFly Running Pro', category: 'Fashion', price: 999, stock: 32, status: 'Active' },
      { id: 202, productName: 'BirdFly TrailBlazer', category: 'Fashion', price: 1599, stock: 12, status: 'Active' },
      { id: 203, productName: 'BirdFly AirFlow Kit', category: 'Sports', price: 299, stock: 200, status: 'Active' },
      { id: 204, productName: 'BirdFly WindCheater', category: 'Fashion', price: 1899, stock: 5, status: 'Active' },
      { id: 205, productName: 'BirdFly Socks Pack', category: 'Fashion', price: 149, stock: 500, status: 'Inactive' }
    ]
  },
  {
    id: 3,
    name: 'Cocorico',
    logo: '/assets/imgs/brands/brand-3.jpg',
    managerName: 'Sanjay Gupta',
    email: 's.gupta@cocorico.com',
    phone: '+254 91234 56789',
    tag: 'Top Rated',
    products: [
      { id: 301, productName: 'Cocorico Morning Brew', category: 'Food', price: 299, stock: 85, status: 'Active' },
      { id: 302, productName: 'Cocorico Dark Roast', category: 'Food', price: 349, stock: 42, status: 'Active' },
      { id: 303, productName: 'Cocorico Ceramic Mug', category: 'Home Decor', price: 199, stock: 150, status: 'Active' },
      { id: 304, productName: 'Cocorico Coffee Filter', category: 'Home Decor', price: 99, stock: 300, status: 'Inactive' }
    ]
  },
  {
    id: 4,
    name: 'Yogilist',
    logo: '/assets/imgs/brands/brand-4.jpg',
    managerName: 'Anita Desai',
    email: 'a.desai@yogilist.com',
    phone: '+254 88776 55443',
    tag: 'Official Brand Partner',
    products: [
      { id: 401, productName: 'Yogilist Premium Mat', category: 'Healthy', price: 1499, stock: 25, status: 'Active' },
      { id: 402, productName: 'Yogilist Foam Block', category: 'Healthy', price: 399, stock: 88, status: 'Active' },
      { id: 403, productName: 'Yogilist Cotton Strap', category: 'Healthy', price: 249, stock: 120, status: 'Active' },
      { id: 404, productName: 'Yogilist Mat Bag', category: 'Healthy', price: 599, stock: 10, status: 'Inactive' },
      { id: 405, productName: 'Yogilist Cooling Towel', category: 'Healthy', price: 199, stock: 200, status: 'Active' }
    ]
  },
  {
    id: 5,
    name: 'Acerie',
    logo: '/assets/imgs/brands/brand-5.jpg',
    managerName: 'Vikram Singh',
    email: 'v.singh@acerie.com',
    phone: '+254 77665 54433',
    tag: 'Verified Seller',
    products: [
      { id: 501, productName: 'Acerie Office Laptop', category: 'Technology', price: 45999, stock: 8, status: 'Active' },
      { id: 502, productName: 'Acerie Mechanical Key', category: 'Technology', price: 2999, stock: 24, status: 'Active' },
      { id: 503, productName: 'Acerie Mouse Pad Pro', category: 'Technology', price: 499, stock: 150, status: 'Active' },
      { id: 504, productName: 'Acerie USB Hub', category: 'Technology', price: 1299, stock: 35, status: 'Active' },
      { id: 505, productName: 'Acerie Laptop Stand', category: 'Technology', price: 1899, stock: 12, status: 'Inactive' }
    ]
  },
  {
    id: 6,
    name: 'Shivakin',
    logo: '/assets/imgs/brands/brand-6.jpg',
    managerName: 'Karan Mehra',
    email: 'k.mehra@shivakin.com',
    phone: '+254 99887 66554',
    tag: 'Premium Partner',
    products: [
      { id: 601, productName: 'Shivakin Gold Watch', category: 'Technology', price: 12499, stock: 15, status: 'Active' },
      { id: 602, productName: 'Shivakin Smart Ring', category: 'Technology', price: 8999, stock: 42, status: 'Inactive' },
      { id: 603, productName: 'Shivakin Digital Pen', category: 'Technology', price: 1499, stock: 100, status: 'Active' }
    ]
  },
  {
    id: 7,
    name: 'Acera',
    logo: '/assets/imgs/brands/brand-7.jpg',
    managerName: 'Mehul Jha',
    email: 'm.jha@acera.com',
    phone: '+254 88990 11223',
    tag: 'Verified Seller',
    products: [
      { id: 701, productName: 'Acera Ceramic Cup', category: 'Home Decor', price: 349, stock: 120, status: 'Active' },
      { id: 702, productName: 'Acera Vase Set', category: 'Home Decor', price: 1299, stock: 15, status: 'Active' },
      { id: 703, productName: 'Acera Wall Plate', category: 'Home Decor', price: 599, stock: 45, status: 'Inactive' }
    ]
  },
  {
    id: 8,
    name: 'Lion electronics',
    logo: '/assets/imgs/brands/brand-8.jpg',
    managerName: 'Arjun Kapoor',
    email: 'a.kapoor@lion-elec.com',
    phone: '+254 77889 00112',
    tag: 'Official Mall',
    products: [
      { id: 801, productName: 'Lion Wireless Earbuds', category: 'Technology', price: 2999, stock: 85, status: 'Active' },
      { id: 802, productName: 'Lion Bluetooth Spk', category: 'Technology', price: 4499, stock: 22, status: 'Active' },
      { id: 803, productName: 'Lion Power Bank', category: 'Technology', price: 1499, stock: 110, status: 'Active' }
    ]
  },
  {
    id: 9,
    name: 'TwoHand',
    logo: '/assets/imgs/brands/brand-9.jpg',
    managerName: 'Sunita Rao',
    email: 's.rao@twohand.com',
    phone: '+254 66778 99001',
    tag: 'Community Pick',
    products: [
      { id: 901, productName: 'TwoHand Craft Kit', category: 'Healthy', price: 899, stock: 50, status: 'Active' },
      { id: 902, productName: 'TwoHand Knitting Needles', category: 'Healthy', price: 199, stock: 150, status: 'Active' },
      { id: 903, productName: 'TwoHand Wool Soft', category: 'Healthy', price: 149, stock: 300, status: 'Active' }
    ]
  },
  {
    id: 10,
    name: 'Kiaomin',
    logo: '/assets/imgs/brands/brand-10.jpg',
    managerName: 'David Lee',
    email: 'd.lee@kiaomin.com',
    phone: '+254 55667 88990',
    tag: 'Top Performer',
    products: [
      { id: 1001, productName: 'Kiaomin Max Tablet', category: 'Technology', price: 22999, stock: 12, status: 'Active' },
      { id: 1002, productName: 'Kiaomin Stylus Pen', category: 'Technology', price: 1999, stock: 45, status: 'Active' },
      { id: 1003, productName: 'Kiaomin Screen Guard', category: 'Technology', price: 499, stock: 200, status: 'Active' }
    ]
  },
  {
    id: 11,
    name: 'Nokine',
    logo: '/assets/imgs/brands/brand-11.jpg',
    managerName: 'Rahul Verma',
    email: 'r.verma@nokine.com',
    phone: '+254 44556 77889',
    tag: 'Verified Seller',
    products: [
      { id: 1101, productName: 'Nokine Durable Case', category: 'Technology', price: 699, stock: 150, status: 'Active' },
      { id: 1102, productName: 'Nokine Shock Armor', category: 'Technology', price: 899, stock: 85, status: 'Active' },
      { id: 1103, productName: 'Nokine Screen Protect', category: 'Technology', price: 299, stock: 500, status: 'Active' }
    ]
  },
  {
    id: 12,
    name: 'EcoHome',
    logo: '/assets/imgs/brands/brand-12.jpg',
    managerName: 'Sarah Miller',
    email: 's.miller@ecohome.com',
    phone: '+254 33445 66778',
    tag: 'Green Label',
    products: [
      { id: 1201, productName: 'EcoHome Bamboo Tray', category: 'Home Decor', price: 1299, stock: 35, status: 'Active' },
      { id: 1202, productName: 'EcoHome Hemp Rug', category: 'Home Decor', price: 3499, stock: 10, status: 'Active' },
      { id: 1203, productName: 'EcoHome Cork Coast', category: 'Home Decor', price: 249, stock: 400, status: 'Active' }
    ]
  },
  {
    id: 13,
    name: 'UrbanTrek',
    logo: '/assets/imgs/brands/brand-13.jpg',
    managerName: 'James Wilson',
    email: 'j.wilson@urbantrek.com',
    phone: '+254 22334 55667',
    tag: 'Adventure Partner',
    products: [
      { id: 1301, productName: 'UrbanTrek Hike Boots', category: 'Travel', price: 4599, stock: 24, status: 'Active' },
      { id: 1302, productName: 'UrbanTrek Water Res Bag', category: 'Travel', price: 1899, stock: 68, status: 'Active' },
      { id: 1303, productName: 'UrbanTrek Flashlight', category: 'Travel', price: 799, stock: 120, status: 'Active' }
    ]
  },
  {
    id: 14,
    name: 'ClassicThreads',
    logo: '/assets/imgs/brands/brand-14.jpg',
    managerName: 'Maya Khan',
    email: 'm.khan@classicthreads.com',
    phone: '+254 11223 33445',
    tag: 'Heritage Brand',
    products: [
      { id: 1401, productName: 'Classic Oxford Shirt', category: 'Fashion', price: 1599, stock: 55, status: 'Active' },
      { id: 1402, productName: 'Classic Khaki Trousers', category: 'Fashion', price: 2199, stock: 82, status: 'Active' },
      { id: 1403, productName: 'Classic Silk Tie', category: 'Fashion', price: 799, stock: 40, status: 'Active' }
    ]
  },
  {
    id: 15,
    name: 'AquaRun',
    logo: '/assets/imgs/brands/brand-15.jpg',
    managerName: 'Robert Brown',
    email: 'r.brown@aquarun.com',
    phone: '+254 00112 22334',
    tag: 'Performance Hub',
    products: [
      { id: 1501, productName: 'AquaRun Hydrate Bot', category: 'Travel', price: 449, stock: 300, status: 'Active' },
      { id: 1502, productName: 'AquaRun Filter Straw', category: 'Travel', price: 899, stock: 150, status: 'Active' },
      { id: 1503, productName: 'AquaRun Dry Sack', category: 'Travel', price: 349, stock: 200, status: 'Active' }
    ]
  },
  {
    id: 16,
    name: 'SportFlex',
    logo: '/assets/imgs/brands/brand-16.jpg',
    managerName: 'Linda Gao',
    email: 'l.gao@sportflex.com',
    phone: '+254 99001 11223',
    tag: 'Official Partner',
    products: [
      { id: 1601, productName: 'SportFlex Band Lite', category: 'Healthy', price: 299, stock: 1000, status: 'Active' },
      { id: 1602, productName: 'SportFlex Pull Up Bar', category: 'Healthy', price: 1499, stock: 45, status: 'Active' },
      { id: 1603, productName: 'SportFlex Whey Iso', category: 'Food', price: 3499, stock: 120, status: 'Active' }
    ]
  },
  {
    id: 17,
    name: 'DryFit',
    logo: '/assets/imgs/brands/brand-17.jpg',
    managerName: 'Chris Evans',
    email: 'c.evans@dryfit.com',
    phone: '+254 88776 66554',
    tag: 'Official Seller',
    products: [
      { id: 1701, productName: 'DryFit V-Neck Tee', category: 'Fashion', price: 649, stock: 500, status: 'Active' },
      { id: 1702, productName: 'DryFit Liner Shorts', category: 'Fashion', price: 799, stock: 300, status: 'Active' },
      { id: 1703, productName: 'DryFit Cooling Head', category: 'Fashion', price: 249, stock: 800, status: 'Active' }
    ]
  },
  {
    id: 18,
    name: 'ComfortStep',
    logo: '/assets/imgs/brands/brand-18.jpg',
    managerName: 'Emma Watson',
    email: 'e.watson@comfortstep.com',
    phone: '+254 77665 55443',
    tag: 'Global Partner',
    products: [
      { id: 1801, productName: 'ComfortStep Insoles', category: 'Fashion', price: 199, stock: 1000, status: 'Active' },
      { id: 1802, productName: 'ComfortStep Heel Cups', category: 'Fashion', price: 349, stock: 500, status: 'Active' },
      { id: 1803, productName: 'ComfortStep Slipper', category: 'Fashion', price: 899, stock: 150, status: 'Active' }
    ]
  }
];
