import React from 'react';
import { FaUser, FaCalendarAlt, FaEye, FaTag } from 'react-icons/fa';

const BlogCard = ({ blog, onClick }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    const textContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    return textContent.length > maxLength
      ? textContent.substring(0, maxLength) + '...'
      : textContent;
  };

  return (
    <div className="blog-card" onClick={onClick}>
      {/* Blog Image - Instagram Style */}
      {blog.imageUrl ? (
        <div className="blog-card-image">
          <img src={blog.imageUrl} alt={blog.title} />
        </div>
      ) : (
        <div className="blog-card-image" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaTag size={60} color="white" />
        </div>
      )}

      <div className="blog-card-content">
        <div className="blog-card-header">
          <h3 className="blog-card-title">{blog.title}</h3>
          {blog.category && (
            <span className="blog-card-category">
              <FaTag className="category-icon" />
              {blog.category}
            </span>
          )}
        </div>

        <div className="blog-card-excerpt">
          <p>{truncateContent(blog.content)}</p>
        </div>

        <div className="blog-card-meta">
          <div className="blog-meta-item">
            <FaUser className="meta-icon" />
            <span>{blog.author}</span>
          </div>
          <div className="blog-meta-item">
            <FaCalendarAlt className="meta-icon" />
            <span>{formatDate(blog.createdAt)}</span>
          </div>
          <div className="blog-meta-item">
            <FaEye className="meta-icon" />
            <span>{blog.views || 0}</span>
          </div>
        </div>

        {blog.tags && (
          <div className="blog-card-tags">
            {blog.tags.split(',').slice(0, 3).map((tag, index) => (
              <span key={index} className="blog-tag">
                {tag.trim()}
              </span>
            ))}
            {blog.tags.split(',').length > 3 && (
              <span className="blog-tag-more">
                +{blog.tags.split(',').length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogCard;
