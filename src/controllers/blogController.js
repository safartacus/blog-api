const Blog = require('../models/blog');
const cloudinary = require('cloudinary').v2; 
const amqp = require('amqplib');

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
// exports.toggleLike = async (req, res) => {
//   try {
//     const blogId = req.params.blogId;
//     const userId = req.user.id; // Giriş yapmış kullanıcının ID'si

//     // Blog'u bul ve likes/dislikes bilgilerini getir
//     const blog = await Blog.findById(blogId);
    
//     if (!blog) {
//       return res.status(404).json({ message: 'Blog bulunamadı' });
//     }

//     // Kullanıcının like durumunu kontrol et
//     const likeIndex = blog.likes.indexOf(userId);
//     const dislikeIndex = blog.dislikes.indexOf(userId);

//     // Like durumuna göre işlem yap
//     if (likeIndex === -1) {
//       // Like ekle
//       blog.likes.push(userId);
//       // Varsa dislike'ı kaldır
//       if (dislikeIndex !== -1) {
//         blog.dislikes.splice(dislikeIndex, 1);
//       }
//     } else {
//       // Like'ı kaldır
//       blog.likes.splice(likeIndex, 1);
//     }

//     // Blog'u kaydet ve populate et
//     await blog.save();
    
//     // Güncel blog bilgisini getir
//     const updatedBlog = await Blog.findById(blogId)
//       .populate('likes', 'firstName lastName email profileImage')
//       .populate('dislikes', 'firstName lastName email profileImage')
//       .populate('author', 'firstName lastName email profileImage');

//     res.json(updatedBlog);
//   } catch (error) {
//     console.error('Like toggle hatası:', error);
//     res.status(500).json({ message: 'Bir hata oluştu' });
//   }
// };

// exports.toggleDislike = async (req, res) => {
//   try {
//     const blogId = req.params.blogId;
//     const userId = req.user.id;

//     // Blog'u bul ve likes/dislikes bilgilerini getir
//     const blog = await Blog.findById(blogId);
    
//     if (!blog) {
//       return res.status(404).json({ message: 'Blog bulunamadı' });
//     }

//     // Kullanıcının dislike durumunu kontrol et
//     const dislikeIndex = blog.dislikes.indexOf(userId);
//     const likeIndex = blog.likes.indexOf(userId);

//     // Dislike durumuna göre işlem yap
//     if (dislikeIndex === -1) {
//       // Dislike ekle
//       blog.dislikes.push(userId);
//       // Varsa like'ı kaldır
//       if (likeIndex !== -1) {
//         blog.likes.splice(likeIndex, 1);
//       }
//     } else {
//       // Dislike'ı kaldır
//       blog.dislikes.splice(dislikeIndex, 1);
//     }

//     // Blog'u kaydet ve populate et
//     await blog.save();
    
//     // Güncel blog bilgisini getir
//     const updatedBlog = await Blog.findById(blogId)
//       .populate('likes', 'firstName lastName email profileImage')
//       .populate('dislikes', 'firstName lastName email profileImage')
//       .populate('author', 'firstName lastName email profileImage');

//     res.json(updatedBlog);
//   } catch (error) {
//     console.error('Dislike toggle hatası:', error);
//     res.status(500).json({ message: 'Bir hata oluştu' });
//   }
// };

exports.toggleLike = async (req, res) => {
  try {
    const blogId = req.params.blogId;
    const userId = req.user.id;

    let blog = await Blog.findById(blogId)
      .populate('author', 'email firstName lastName');
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog bulunamadı' });
    }
    const User = require('../models/User');
    const user = await User.findById(userId)
      .select('firstName lastName email profileImage');

    const hasLiked = blog.likes.includes(userId);

    if (hasLiked) {
      // Like'ı kaldır
      blog.likes.pull(userId);
    } else {
      // Like ekle ve dislike'ı kaldır
      blog.likes.push(userId);
      blog.dislikes.pull(userId);

      // RabbitMQ'ya bildirim gönder
      try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        const notificationData = {
          recipientId: blog.author._id,
          recipientEmail: blog.author.email,
          recipientFirstName: blog.author.firstName,
          recipientLastName: blog.author.lastName,
          recipientProfileImage: user.profileImage.url,
          senderId: userId,
          senderFirstName: user.firstName,
          senderLastName: user.lastName,
          type: 'BLOG_LIKE',
          blogId: blogId,
          url: `${process.env.FRONTEND_URL}/blogs/${blogId}`
        };
        
        await channel.assertQueue('like_notification', { durable: true });
        channel.sendToQueue(
          'like_notification',
          Buffer.from(JSON.stringify(notificationData))
        );

        await channel.close();
        await connection.close();
      } catch (mqError) {
        console.error('RabbitMQ hatası:', mqError);
      }
    }

    await blog.save();
    
    // Güncel blog bilgisini getir
    blog = await Blog.findById(blogId)
      .populate('likes', 'firstName lastName email profileImage')
      .populate('dislikes', 'firstName lastName email profileImage')
      .populate('author', 'firstName lastName email profileImage');

    res.json(blog);
  } catch (error) {
    console.error('Like toggle hatası:', error);
    res.status(500).json({ message: 'Bir hata oluştu' });
  }
};

exports.toggleDislike = async (req, res) => {
  try {
    const blogId = req.params.blogId;
    const userId = req.user.id;

    let blog = await Blog.findById(blogId);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog bulunamadı' });
    }

    const hasDisliked = blog.dislikes.includes(userId);

    if (hasDisliked) {
      // Dislike'ı kaldır
      blog.dislikes.pull(userId);
    } else {
      // Dislike ekle ve like'ı kaldır
      blog.dislikes.push(userId);
      blog.likes.pull(userId);
    }

    await blog.save();
    
    // Güncel blog bilgisini getir
    blog = await Blog.findById(blogId)
      .populate('likes', 'firstName lastName email profileImage')
      .populate('dislikes', 'firstName lastName email profileImage')
      .populate('author', 'firstName lastName email profileImage');

    res.json(blog);
  } catch (error) {
    console.error('Dislike toggle hatası:', error);
    res.status(500).json({ message: 'Bir hata oluştu' });
  }
};
