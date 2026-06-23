const catalogueService = require('../src/services/catalogueService');

const tests = [
  { name: 'All (default)', query: {} },
  { name: 'Skill=vocabulary', query: { skill: 'vocabulary' } },
  { name: 'minPrice=100000', query: { minPrice: 100000 } },
  { name: 'maxPrice=100000', query: { maxPrice: 100000 } },
  { name: 'minRating=4.8', query: { minRating: 4.8 } },
  { name: 'rating=5', query: { rating: 5 } },
  { name: 'year=2026', query: { year: 2026 } },
  { name: 'sort=price-asc', query: { sort: 'price-asc' } },
];

(async () => {
  for (const t of tests) {
    try {
      const res = await catalogueService.listProducts(t.query);
      console.log('---', t.name, '---');
      console.log('Total:', res.pagination.total);
      console.log('Items:', res.items.map(i => ({ id: i.id, title: i.title, skill: i.skill, year: i.year, price: i.price, rating: i.rating })).slice(0, 10));
      console.log('\n');
    } catch (err) {
      console.error('Error for', t.name, err);
    }
  }
})();
