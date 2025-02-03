export interface AmazonProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
  affiliateLink: string;
}

export const amazonProducts: AmazonProduct[] = [
  {
    id: 1,
    title: 'Amazon Product 1',
    price: 49.99,
    description: 'Description for Amazon Product 1',
    image: 'https://images-na.ssl-images-amazon.com/images/I/619bdI4v0FL._AC_UL232_SR232,232_.jpg', // Replace with actual image URL
    category: 'home decor',
    affiliateLink: 'https://amzn.to/40LyjiG'  // Your provided affiliate link
  },
  {
    id: 2,
    title: 'Amazon Product 2',
    price: 59.99,
    description: 'Description for Amazon Product 2',
    image: 'https://images-na.ssl-images-amazon.com/images/I/51ySK6mX3WL._AC_UL232_SR232,232_.jpg', // Replace with actual image URL
    category: 'home decor',
    affiliateLink: 'https://amzn.to/3WNWdt0'  // Use your short or long affiliate link here
  },
  {
    id: 3,
    title: 'Amazon Product 3',
    price: 69.99,
    description: 'Description for Amazon Product 3',
    image: 'https://images-na.ssl-images-amazon.com/images/I/51ySK6mX3WL._AC_UL232_SR232,232_.jpg', // Replace with actual image URL
    category: 'home decor',
    affiliateLink: 'https://amzn.to/3WNWdt0'  // Use your affiliate link here
  },
  {
    id: 4,
    title: 'Amazon Product 3',
    price: 69.99,
    description: 'Description for Amazon Product 3',
    image: 'https://images-na.ssl-images-amazon.com/images/I/614BWnY8puL._AC_UL232_SR232,232_.jpg', // Replace with actual image URL
    category: 'home decor',
    affiliateLink: 'https://amzn.to/4hihVxi'  // Use your affiliate link here
  },
  {
    id: 5,
    title: 'Amazon Product 3',
    price: 69.99,
    description: 'Description for Amazon Product 3',
    image: 'https://images-na.ssl-images-amazon.com/images/I/81MBARx2ULL._AC_UL232_SR232,232_.jpg', // Replace with actual image URL
    category: 'home decor',
    affiliateLink: 'https://amzn.to/3CK5fjF'  // Use your affiliate link here
  }
];
