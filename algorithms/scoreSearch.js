function findCheapestProducts(ingredients, products, maxResults) {
  // Compute similarity scores between products and requested ingredients
  const scores = products.map((product) => {
    const similarity = product.ingredients.reduce((acc, ingredient) => {
      return ingredients.includes(ingredient) ? acc + 1 : acc;
    }, 0);
    return { name: product.name, price: product.price, similarity };
  });
  // Sort products by similarity
  scores.sort((a, b) => a.similarity - b.similarity);
  // Find products that contain all requested ingredients
  const matchingProducts = [];
  for (const score of scores) {
    if (score.similarity === ingredients.length) {
      matchingProducts.push(score);
      if (matchingProducts.length >= maxResults) break;
    }
  }
  // Sort matching products by price
  matchingProducts.sort((a, b) => a.price - b.price);
  // Return first few matching products, up to maxResults
  return matchingProducts.slice(0, maxResults);
}
