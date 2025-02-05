// /src/lib/amazonProducts.ts

export interface AmazonProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
  affiliateLink: string;
  dominantColor?: string; // add this property (optional or required as needed)
}

export const amazonProducts: AmazonProduct[] = [
 {
    "id": 1,
    "title": "Amazon Product 1",
    "price": 0.0,
    "description": "MIULEE Mustard Yellow Pillow Covers 18x18 Inch with Splicing Set of 2 Super Soft Boho Striped Corduroy Pillow Covers Broadside Decorative Spring Throw Pillows for Couch Cushion Livingroom",
    "image": "https://m.media-amazon.com/images/I/818ClCd4Z-L._AC_SY355_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0BLSPFRM9?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl",
    "dominantColor": "#c4a355"
  },
  {
    "id": 2,
    "title": "Amazon Product 2",
    "price": 0.0,
    "description": "MIULEE Pack of 2 Mustard Yellow Corduroy Decorative Throw Pillow Covers 20x20 Inch Soft Boho Striped Pillow Covers Spring Modern Farmhouse Home Decor for Sofa Living Room Couch Bed",
    "image": "https://m.media-amazon.com/images/I/81SsLCina1L._AC_SX425_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0BKSJCT8C?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl",
    "dominantColor": "#d4aa4e"
  },
  {
    "id": 3,
    "title": "Amazon Product 3",
    "price": 0.0,
    "description": "MIULEE Pack of 2 Mustard Yellow Corduroy Decorative Throw Pillow Covers 18x18 Inch Soft Boho Striped Pillow Covers Spring Modern Farmhouse Home Decor for Sofa Living Room Couch Bed",
    "image": "https://m.media-amazon.com/images/I/8131MIlMOlL._AC_SX679_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0BKSG34QX?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl",
    "dominantColor": "#c19f4c"
  },
  {
    "id": 4,
    "title": "Amazon Product 4",
    "price": 0.0,
    "description": "MIULEE Pack of 2 Couch Throw Pillow Covers 18x18 Inch Soft Beige Yellow Chenille Pillow Covers for Sofa Living Room Solid Dyed Pillow Cases",
    "image": "https://m.media-amazon.com/images/I/81DS28VSthL._AC_SY450_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0CX5B228W?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl",
    "dominantColor": "#e5c87b"
  },
  {
    "id": 5,
    "title": "Amazon Product 5",
    "price": 0.0,
    "description": "ZWJD Mustard Yellow Throw Pillow Covers 18x18 Set of 2 Chenille Pillow Covers with Elegant Design Soft and Luxurious Decorative Throw Pillows for Couch, Bed, and Home Decor",
    "image": "https://m.media-amazon.com/images/I/91PaDWUENmL._AC_SX466_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0C784ZWCT?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl",
    "dominantColor": "#dbb251"
  },
  {
    "id": 6,
    "title": "Amazon Product 6",
    "price": 0.0,
    "description": "decorUhome Decorative Throw Pillow Covers 18x18, Soft Plush Faux Wool Couch Pillow Covers for Home, Set of 2, Mustard Yellow",
    "image": "https://m.media-amazon.com/images/I/8163YirTEBL._AC_SY355_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B09J23JKNM?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl",
    "dominantColor": "#d6b156"
  },
  {
    "id": 7,
    "title": "Amazon Product 7",
    "price": 0.0,
    "description": "Topfinel Set of 2 Decorative Yellow Throw Pillow Covers 18x18 Inch for Couch Sofa Bed, Farmhouse Boho Rustic Home Decor, Soft Corduroy Windmill Textured Striped Patchwork Cushion Cases",
    "image": "https://m.media-amazon.com/images/I/81DsoITAH-L._AC_SX466_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0D1VJ8M4J?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl",
    "dominantColor": "#d1a84d"
  },
  {
    "id": 8,
    "title": "Amazon Product 8",
    "price": 0.0,
    "description": "Siluvia 18\"x18\" Pillow Inserts Set of 2 Decorative 18\" Pillow Inserts with 100% Cotton Cover Square Interior Sofa Throw Pillow Inserts Decorative White Pillow Insert Pair Couch Pillow",
    "image": "https://m.media-amazon.com/images/I/61khI6aybxS._AC_SX569_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B095PR8MM4?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl",
    "dominantColor": "#f7f7f7"
  },
  {
    "id": 9,
    "title": "Amazon Product 9",
    "price": 0.0,
    "description": "Topfinel Fall Burnt Orange Decorative Throw Pillows Covers 18x18 Inch Set of 4, Yellow Green Gradient Series Corduroy Striped Square Pillow Case, Western Modern Cushion Cover for Couch Sofa Bedroom",
    "image": "https://m.media-amazon.com/images/I/81c6jaLNTmL._AC_SX425_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0C6DXL51S?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl",
    "dominantColor": "#cf9849"
  },
  {
    "id": 10,
    "title": "Amazon Product 10",
    "price": 0.0,
    "description": "DEZENE Couch Pillow Covers 18x18 Yellow: 2 Pack Cozy Soft Velvet Square Throw Pillow Cases for Farmhouse Home Decor",
    "image": "https://m.media-amazon.com/images/I/51ySK6mX3WL._AC_SY450_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B07SFSR86C?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl",
    "dominantColor": "#deb74a"
  },
  {
    "id": 11,
    "title": "Amazon Product 11",
    "price": 0.0,
    "description": "MIULEE Pack of 2, Velvet Soft Solid Decorative Square Throw Pillow Covers Set Cushion Case for Spring Sofa Bedroom Car 18x18 Inch 45x45 Cm",
    "image": "https://m.media-amazon.com/images/I/71KYRt2hHcL._AC_SY355_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B076LWHV2Z?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl",
    "dominantColor": "#d4b052"
  },
  {
    "id": 12,
    "title": "Amazon Product 12",
    "price": 0.0,
    "description": "MIULEE Pack of 2 Mustard Yellow Pillow Covers 18x18 Inch Decorative Velvet Throw Pillow Covers Modern Soft Couch Throw Pillows Farmhouse Home Decor for Fall Sofa Bedroom Living Room",
    "image": "https://m.media-amazon.com/images/I/61UmBxuCqfL._AC_SX569_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0CKSBZ8VX?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl",
    "dominantColor": "#d6b54e"
  },
  {
    "id": 13,
    "title": "Amazon Product 13",
    "price": 0.0,
    "description": "decorUhome Chenille Soft Throw Pillow Covers 18x18 Set of 2, Farmhouse Velvet Decorative Pillow Covers with Stitched Edge for Couch Sofa Bed, Mineral Yellow",
    "image": "https://m.media-amazon.com/images/I/81+3Bl3M9CL._AC_SX569_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0892YCTWT?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl",
    "dominantColor": "#dcb953"
  },
  {
    "id": 14,
    "title": "Amazon Product 14",
    "price": 0.0,
    "description": "NiNi ALL Decorative Throw Pillow Covers Velvet Soft for Couch Sofa Bedroom Living Room Outdoor Pack of 2 18x18 Inch Yellow",
    "image": "https://m.media-amazon.com/images/I/81b0dJ5xeBL._AC_SX466_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B094N8XKKY?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl",
    "dominantColor": "#d5b155"
  },
  {
    "id": 15,
    "title": "Amazon Product 15",
    "price": 0.0,
    "description": "MIULEE Throw Pillow Covers Soft Corduroy Decorative Set of 2 Boho Striped Spring Pillow Covers Pillowcases Farmhouse Home Decor for Couch Bed Sofa Living Room 18x18 Inch Mustard Yellow",
    "image": "https://m.media-amazon.com/images/I/81oQPrcu6XL._AC_SX569_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0CKRXSCVV?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl",
    "dominantColor": "#d3ac4f"
  },
  {
    "id": 16,
    "title": "Amazon Product 16",
    "price": 0.0,
    "description": "JOJUSIS Pack of 2 Faux Fur Plush Decorative Throw Pillow Covers Couch Cushion Case Soft Pillowcases (Mustard Yellow, 18 x 18-Inch)",
    "image": "https://m.media-amazon.com/images/I/81RlYqg5s2L._AC_SY355_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0C6172GDV?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 17,
    "title": "Amazon Product 17",
    "price": 0.0,
    "description": "4-Pack 100% Cotton Comfortable Solid Decorative Throw Pillow Case, Thmyo Square Cushion Cover Pillowcase Sublimation Blank Pillow Covers DIY Throw Pillowcase for Couch Sofa(18x18 inch/ 45x45cm, Yellow)",
    "image": "https://m.media-amazon.com/images/I/61m7ao+YXOL._AC_SX425_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B072R6DRHJ?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 18,
    "title": "Amazon Product 18",
    "price": 0.0,
    "description": "MIULEE Mustard Yellow Corduroy Pillow Covers Pack of 2 Boho Decorative Spliced Throw Pillow Covers Soft Solid Couch Pillowcases Cross Patchwork Textured Covers for Living Room Bed Sofa 18x18 inch",
    "image": "https://m.media-amazon.com/images/I/71CklwuD+2L._AC_SX569_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0CL6B5W36?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 19,
    "title": "Amazon Product 19",
    "price": 0.0,
    "description": "MIULEE Pack of 4 Couch Throw Pillow Covers 18x18 Inch Neutral Orange/Yellow Soft Decorative Chenille Pillow Covers Farmhouse Accent Cushion Covers for Boho Home Decor Spring Sofa Bedroom Living Room",
    "image": "https://m.media-amazon.com/images/I/816LH6iUYIL._AC_SY355_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0D796J15L?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 20,
    "title": "Amazon Product 20",
    "price": 0.0,
    "description": "YCOLL Pillow Covers 18x18 Set of 4, Modern Sofa Throw Pillow Cover, Decorative Home Outdoor Linen Fabric Geometric Pillow Case for Couch Bed Car, Yellow",
    "image": "https://m.media-amazon.com/images/I/81acbcI0WvL._AC_SX355_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B083WMW24N?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 21,
    "title": "Amazon Product 21",
    "price": 0.0,
    "description": "MIULEE Pack of 2 Dusty Blue Decorative Pillow Covers 18x18 Inch Soft Chenille Couch Throw Pillows Farmhouse Cushion Covers with Elegant Design for Sofa Bedroom Living Room Home Decor",
    "image": "https://m.media-amazon.com/images/I/81TMnPUUK+L._AC_SX425_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0CTJMP3PM?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 22,
    "title": "Amazon Product 22",
    "price": 0.0,
    "description": "JUSPURBET Mustard Yellow Velvet Throw Pillow Covers 18x18 inch Set of 2 for Living Room Couch Sofa Bedroom Decorative Square Solid Soft Cushion Cases with Invisible Zipper",
    "image": "https://m.media-amazon.com/images/I/71CKoN0E6SL._AC_SX466_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B083RN117D?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 23,
    "title": "Amazon Product 23",
    "price": 0.0,
    "description": "MIULEE Set of 2 Decorative Couch Pillow Covers 20x20 Inch Natural Beige Neutral Throw Pillows Textured Boucle Accent Solid Cushion Pillowcase Spring Cozy Soft Chair Sofa Bedroom Livingroom Home Decor",
    "image": "https://m.media-amazon.com/images/I/81wxsdLN6iL._AC_SX569_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0CQC7YZXD?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 24,
    "title": "Amazon Product 24",
    "price": 0.0,
    "description": "MIULEE Pack of 2 Mustard Yellow Decorative Velvet Throw Pillow Covers Soft Pillowcases Spring Solid Square Cushion Case for Sofa Bedroom Car 18x18 Inch",
    "image": "https://m.media-amazon.com/images/I/61EGGWCvuNL._AC_SX466_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0DGKZNYM7?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 25,
    "title": "Amazon Product 25",
    "price": 0.0,
    "description": "Simmore Decorative Throw Pillow Covers 18x18 Set of 2, Soft Plush Flannel Double-Sided Fluffy Couch Pillow Covers for Sofa Living Room Home Decor, Mustard Yellow",
    "image": "https://m.media-amazon.com/images/I/71C8xfBSTSL._AC_SX466_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0C8626H9Y?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 26,
    "title": "Amazon Product 26",
    "price": 0.0,
    "description": "Pallene Faux Fur Plush Throw Pillow Covers 18x18 Set of 2, Luxury Soft Fluffy Striped Decorative Pillow Covers for Sofa, Couch, Living Room, Mustard Yellow",
    "image": "https://m.media-amazon.com/images/I/810X+jEUBsL._AC_SX425_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0BJ977VHN?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 27,
    "title": "Amazon Product 27",
    "price": 0.0,
    "description": "decorUhome Faux Fur Throw Pillow Covers 18x18 Set of 2, Decorative Soft Plush Striped Couch Pillow Covers with Velvet Back for Sofa, Bed, Living Room, Mustard Yellow",
    "image": "https://m.media-amazon.com/images/I/81kt-5YRQRL._AC_SX425_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0D1Y94P7N?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 28,
    "title": "Amazon Product 28",
    "price": 0.0,
    "description": "Home Brilliant Yellow Throw Pillow Covers 18x18 Set of 2 Super Soft Couch Pillow Covers Decorative Striped Corduroy Mustard Throw Pillows for Couch Bed Winter, 18 x 18 inch, Sunflower Yellow",
    "image": "https://m.media-amazon.com/images/I/91jBJbbmmAL._AC_SX569_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B07PF35K8Q?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 29,
    "title": "Amazon Product 29",
    "price": 0.0,
    "description": "MIULEE Mustard Yellow Throw Pillow Covers 18x18 Inch, Soft Spring Plush Faux Wool Couch Pillow Covers Set of 2 Decorative Farmhouse Boho Throw Pillows for Sofa Living Room Bed",
    "image": "https://m.media-amazon.com/images/I/71ZC7gvxq1L._AC_SY450_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0CP338N74?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 30,
    "title": "Amazon Product 30",
    "price": 0.0,
    "description": "MIULEE Mustard Yellow Throw Pillow Covers 18x18 Inch, Soft Spring Plush Faux Wool Couch Pillow Covers Set of 2 Decorative Farmhouse Boho Throw Pillows for Sofa Living Room Bed",
    "image": "https://m.media-amazon.com/images/I/71ZC7gvxq1L._AC_SY450_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0CP338N74?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 31,
    "title": "Amazon Product 31",
    "price": 0.0,
    "description": "MIULEE Mustard Yellow Throw Pillow Covers 18x18 Inch, Soft Spring Plush Faux Wool Couch Pillow Covers Set of 2 Decorative Farmhouse Boho Throw Pillows for Sofa Living Room Bed",
    "image": "https://m.media-amazon.com/images/I/71ZC7gvxq1L._AC_SY450_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0CP338N74?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 32,
    "title": "Amazon Product 32",
    "price": 0.0,
    "description": "MIULEE Mustard Yellow Throw Pillow Covers 18x18 Inch, Soft Spring Plush Faux Wool Couch Pillow Covers Set of 2 Decorative Farmhouse Boho Throw Pillows for Sofa Living Room Bed",
    "image": "https://m.media-amazon.com/images/I/71ZC7gvxq1L._AC_SY450_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0CP338N74?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 33,
    "title": "Amazon Product 33",
    "price": 0.0,
    "description": "MIULEE Mustard Yellow Throw Pillow Covers 18x18 Inch, Soft Spring Plush Faux Wool Couch Pillow Covers Set of 2 Decorative Farmhouse Boho Throw Pillows for Sofa Living Room Bed",
    "image": "https://m.media-amazon.com/images/I/71ZC7gvxq1L._AC_SY450_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0CP338N74?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 34,
    "title": "Amazon Product 34",
    "price": 0.0,
    "description": "Volcanics Pack of 2 Faux Wool Throw Pillow Covers 20x20 Inches Decorative Farmhouse Velvet Couch Pillow Case Soft Plush Square Boho Cushion Pillowcase, Yellow",
    "image": "https://m.media-amazon.com/images/I/81rUXYatloL._AC_SX569_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B09BVDQC8Y?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 35,
    "title": "Amazon Product 35",
    "price": 0.0,
    "description": "Boho Throw Pillow Covers 18x18 Set of 2 Farmhouse Decorative Cushion Case Striped Square Pillows Cover Chenille Pillow Cases Accent Neutral Pillowcase for Sofa Couch Bed, Yellow",
    "image": "https://m.media-amazon.com/images/I/71eIAHG7w6L._AC_SY355_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0CR1KFLPB?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 36,
    "title": "Amazon Product 36",
    "price": 0.0,
    "description": "MIULEE Pack of 2 Textured Throw Pillow Covers Decorative Soft Accent Square Chenille Pillowcases Neutral Farmhouse Cushions Modern Home Decor for Couch Sofa Bedroom Living Room 18x18 Inch, Brown",
    "image": "https://m.media-amazon.com/images/I/81p-nXu1nsL._AC_SX425_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0D8FP6S3Q?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 37,
    "title": "Amazon Product 37",
    "price": 0.0,
    "description": "MIULEE Pack of 2 Mustard Yellow Pillow Covers 18x18 Inch Soft Decorative Throw Pillow Covers Corduroy Pillowcases for Spring Sofa Bedroom Couch",
    "image": "https://m.media-amazon.com/images/I/814vKUkdFqL._AC_SY450_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B09VGLWLNN?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 38,
    "title": "Amazon Product 38",
    "price": 0.0,
    "description": "MIULEE Pack of 2 Golden Yellow Pillow Covers 12x12 Inch Soft Decorative Throw Pillow Covers Corduroy Pillowcases for Spring Sofa Bedroom Couch",
    "image": "https://m.media-amazon.com/images/I/81Gigb-9KUL._AC_SX679_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0BNG3MHP9?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 39,
    "title": "Amazon Product 39",
    "price": 0.0,
    "description": "DISSA Fleece Blanket Throw Size – 51x63, Yellow Soft, Plush, Fluffy, Fuzzy, Warm, Cozy Perfect for Couch, Bed, Sofa - with Pompom Fringe Flannel",
    "image": "https://m.media-amazon.com/images/I/81IKim5nZiL._AC_SY450_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B08R5JRXBW?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 40,
    "title": "Amazon Product 40",
    "price": 0.0,
    "description": "MONDAY MOOSE Decorative Throw Pillow Covers Cushion Cases, Set of 4 Soft Velvet Modern Double-Sided Designs, Mix and Match for Home Decor, Pillow Inserts Not Included (18x18 inch, Orange/Teal)",
    "image": "https://m.media-amazon.com/images/I/81sziUdT+OL._AC_SX466_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B08H4KJPV7?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 41,
    "title": "Amazon Product 41",
    "price": 0.0,
    "description": "Yellow Mustard Decorative Throw Pillow Cover 20x20 Square Boho Accent Pillowcase Tassels Farmhouse Cushion for Couch Sofa Bedroom Living Room Home Décor Cover ONLY",
    "image": "https://m.media-amazon.com/images/I/914-s++FSkL._AC_SX679_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0BK83C59B?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 42,
    "title": "Amazon Product 42",
    "price": 0.0,
    "description": "decorUhome Couch Throw Pillow Covers 18x18 Set of 2, Decorative Soft Chenille Solid Dyed Pillow Covers for Sofa Bed Living Room, Mineral Yellow",
    "image": "https://m.media-amazon.com/images/I/91GPjKV-DTL._AC_SY450_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0D46T5G6R?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 43,
    "title": "Amazon Product 43",
    "price": 0.0,
    "description": "Boho Chenille Tufted Pillow Cover 12x20 Inch, Rectangle Decorative Lumbar Throw Pillow Cover Neutral Pillowcase for Couch Bedroom Living Room, Yellow White",
    "image": "https://m.media-amazon.com/images/I/818qmfoJbNL._AC_SX569_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0D785V8X9?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 44,
    "title": "Amazon Product 44",
    "price": 0.0,
    "description": "Flower Throw Pillow, Soft Yellow 14.9\" Flower Pillow for Home Decor, Cute Flower Shaped Floor Pillow Aesthetic Flower Plush Decorative Pillows for Bed Sofa Couch",
    "image": "https://m.media-amazon.com/images/I/81IFbcpQD2L._AC_SX679_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0D4VXRD1T?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 45,
    "title": "Amazon Product 45",
    "price": 0.0,
    "description": "Folkulture Throw Pillow Covers 18x18, Set of 2 Cotton Pillow Cover, Decorative Pillows, Cute Outdoor Pillows, Decorative Throw Pillows for Couch, Yellow Pillow Cases, Couch Pillows for Living Room",
    "image": "https://m.media-amazon.com/images/I/91waTBXK2mL._AC_SX522_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0C33HNTC1?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 46,
    "title": "Amazon Product 46",
    "price": 0.0,
    "description": "MIULEE Set of 2 Decorative Throw Pillow Covers Rhombic Jacquard Pillowcase Soft Square Cushion Case for Summer Spring Couch Sofa Bed Bedroom Car Living Room 18x18 Inch Yellow",
    "image": "https://m.media-amazon.com/images/I/81cjFS2GH3L._AC_SY450_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B08H4GVN9C?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 47,
    "title": "Amazon Product 47",
    "price": 0.0,
    "description": "Velvet Throw Pillow Cover Soft Decorative Luxurious Solid Square Cushion Case for Sofa Couch Bedroom Farmhouse, Pack of 2, 18 x 18 Inches, Butter Yellow",
    "image": "https://m.media-amazon.com/images/I/91U2g-yPGdL._AC_SX679_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B091BKY17T?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 48,
    "title": "Amazon Product 48",
    "price": 0.0,
    "description": "Decorative Throw Pillow Covers Set of 2 Blue Yellow Pillow Covers 18x18 Inch Couch Pillow Covers for Sofa Living Room Outdoor Throw Pillow Cover Linen Floral Flower Farmhouse Pillowcase",
    "image": "https://m.media-amazon.com/images/I/81gGW+gY1BL._AC_SX466_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B0C89ZR164?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  },
  {
    "id": 49,
    "title": "Amazon Product 49",
    "price": 0.0,
    "description": "Britimes Throw Pillow Covers Modern Home Art Decor, 18 x 18 Inches Set of 2 Pillow Cases Decorative, Abstract Oil Painting Pillowcases for Bedroom, Living Room, Cushion Couch Sofa, Yellow Grey",
    "image": "https://m.media-amazon.com/images/I/81xD7Sp72CL._AC_SY450_.jpg",
    "category": "home decor",
    "affiliateLink": "https://www.amazon.com/dp/B08XYZZ5K4?psc=1&linkCode=ll2&tag=paintchipshop-20&linkId=27b5a5cccd9d372eb4bac29a248e4b0e&language=en_US&ref_=as_li_ss_tl"
  }
];
