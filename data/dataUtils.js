function getCategoryId(kitkats, categories) {
  const category = categories.find((poo) => kitkats.category === poo.name);
  const categoryId = category.id;

  return categoryId;
}

module.exports = {
  getCategoryId,
};
