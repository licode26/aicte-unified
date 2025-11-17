
import React from 'react';
import { FaTimes, FaUser, FaCalendarAlt, FaEye, FaTag } from 'react-icons/fa';

const BlogModal = ({ blog, onClose }) => {
  if (!blog) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="blog-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="blog-modal-header">
          <h1 className="blog-modal-title">{blog.title}</h1>
          <button onClick={onClose} className="blog-modal-close">
            <FaTimes />
          </button>
        </div>

        <div className="blog-modal-meta">
          <div className="blog-meta-item">
            <FaUser className="meta-icon" />
            <span>By {blog.author}</span>
          </div>
          <div className="blog-meta-item">
            <FaCalendarAlt className="meta-icon" />
            <span>{formatDate(blog.createdAt)}</span>
          </div>
          <div className="blog-meta-item">
            <FaEye className="meta-icon" />
            <span>{blog.views || 0} views</span>
          </div>
          {blog.category && (
            <div className="blog-meta-item">
              <FaTag className="meta-icon" />
              <span className="blog-category">{blog.category}</span>
            </div>
          )}
        </div>

        {/* Blog Image - Instagram Style */}
        {blog.imageUrl ? (
          <div className="blog-modal-image">
            <img src={blog.imageUrl} alt={blog.title} />
          </div>
        ) : (
          <div className="blog-modal-image" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
            <FaTag size={80} color="white" />
          </div>
        )}

        <div className="blog-modal-content-body">
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>

        {blog.tags && (
          <div className="blog-modal-tags">
            <h4>Tags:</h4>
            <div className="tags-container">
              {blog.tags.split(',').map((tag, index) => (
                <span key={index} className="blog-tag">
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogModal;
