const Blog = require('../models/Blog');
const cloudinary = require('cloudinary').v2; 

exports.createBlog = async (req, res) => {
  try {

      let imageUrl = '';
      if (req.file) {
          // Buffer'ı base64'e çevir
          const b64 = Buffer.from(req.file.buffer).toString('base64');
          const dataURI = `data:${req.file.mimetype};base64,${b64}`;
          
          try {
              // Cloudinary'ye yükle
              const result = await cloudinary.uploader.upload(dataURI, {
                  resource_type: 'auto',
                  folder: 'blogPhotos'
              });
              imageUrl = result.secure_url;
          } catch (uploadError) {
              console.error('Cloudinary yükleme hatası:', uploadError);
              return res.status(500).json({ message: 'Resim yükleme hatası' });
          }
      }

      const blog = new Blog({
          ...req.body,
          author: req.user.id,
          imageUrl
      });

      await blog.save();
      res.status(201).json(blog);
  } catch (error) {
      console.error('Blog oluşturma hatası:', error);
      res.status(400).json({ message: error.message });
  }
};

exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('category', 'name slug')
      .populate('author', 'firstName lastName profileImage email')
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).
    populate('author', 'firstName lastName profileImage email')
    .populate('category', 'name slug');
    if (!blog) {
      return res.status(404).json({ message: 'Blog bulunamadı' });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchBlogs = async (req, res) => {
  try {
    const { term } = req.query;
    
    if (!term || term.length < 3) {
      // Arama terimi yoksa veya 3 karakterden azsa boş array dön
      return res.json([]);
    }

    console.log('Arama terimi:', term); // Debug için

    // Case-insensitive arama yap ve tüm alanları kontrol et
    const blogs = await Blog.find({
      $or: [
        { title: { $regex: term, $options: 'i' } },
        { excerpt: { $regex: term, $options: 'i' } },
        { content: { $regex: term, $options: 'i' } }
      ]
    })
    .populate('category', 'name slug')
    .select('title excerpt imageUrl category readTime author createdAt') // Sadece gerekli alanları getir
    .sort({ createdAt: -1 }) // En yeni blogları üstte göster
    .limit(5); // Maksimum 5 sonuç göster

    console.log('Bulunan blog sayısı:', blogs.length); // Debug için
    
    res.json(blogs);
  } catch (error) {
    console.error('Blog arama hatası:', error);
    res.status(500).json({ 
      message: 'Blog araması sırasında bir hata oluştu',
      error: error.message 
    });
  }
};
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog bulunamadı' });
    }

    // Sadece blog sahibi güncelleyebilir
    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : blog.imageUrl
      },
      { new: true }
    );

    res.json(updatedBlog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Blog silme
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog bulunamadı' });
    }

    // Sadece blog sahibi silebilir
    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    await blog.remove();
    res.json({ message: 'Blog başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};