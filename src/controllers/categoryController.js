const Category = require('../models/Category');

// Tüm kategorileri getir
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort('name');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Yeni kategori oluştur
exports.createCategory = async (req, res) => {
  try {
    const category = new Category({
      name: req.body.name,
      slug: req.body.name.toLowerCase().replace(/\s+/g, '-'),
      description: req.body.description
    });

    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};