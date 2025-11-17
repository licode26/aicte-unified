
import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaImage, FaLink } from 'react-icons/fa';
import '../../styles/BlogEditor.css';

const BlogEditor = ({ blog, onSave, onCancel, saving }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: 'Admin',
    category: 'Technology',
    tags: '',
    status: 'Draft',
    excerpt: '',
    featuredImage: '',
    readTime: '5'
  });

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        author: blog.author || 'Admin',
        category: blog.category || 'Technology',
        tags: blog.tags || '',
        status: blog.status || 'Draft',
        excerpt: blog.excerpt || '',
        featuredImage: blog.featuredImage || '',
        readTime: blog.readTime || '5'
      });
    }
  }, [blog]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Title and content are required');
      return;
    }

    // Auto-generate excerpt if not provided
    const excerpt = formData.excerpt || formData.content.substring(0, 150) + '...';
    
    onSave({
      ...formData,
      excerpt,
      wordCount: formData.content.split(' ').length,
      readTime: Math.ceil(formData.content.split(' ').length / 200) // Average reading speed
    });
  };

  const categories = [
    'Technology', 'Education', 'Research', 'Innovation', 
    'Industry', 'Career', 'News', 'Events', 'Academic'
  ];

  return (
    <div className="blog-editor-overlay">
      <div className="blog-editor">
        <div className="editor-header">
          <h2>{blog ? 'Edit Blog' : 'Create New Blog'}</h2>
          <button onClick={onCancel} className="close-btn">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="editor-form">
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter blog title..."
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Author</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="Author name"
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Featured Image URL</label>
            <input
              type="url"
              name="featuredImage"
              value={formData.featuredImage}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-group">
            <label>Excerpt (Optional)</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              placeholder="Brief description of the blog post..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Content *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Write your blog content here..."
              rows={15}
              required
            />
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="technology, education, innovation"
            />
          </div>

          <div className="editor-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              <FaTimes /> Cancel
            </button>
            <button type="submit" className="save-btn" disabled={saving}>
              <FaSave /> {saving ? 'Saving...' : 'Save Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogEditor;
