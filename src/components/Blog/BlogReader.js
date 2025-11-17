
import React, { useState, useEffect } from 'react';
import { database } from '../../firebase/init-firebase';
import { ref as dbref, get, child } from 'firebase/database';
import { FaCalendar, FaUser, FaTag, FaClock, FaSearch, FaEye } from 'react-icons/fa';
import '../../styles/BlogReader.css';

const BlogReader = ({ userRole }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    fetchPublishedBlogs();
  }, []);

  const fetchPublishedBlogs = async () => {
    try {
      setLoading(true);
      const db = dbref(database);
      const snapshot = await get(child(db, '/blogs/'));
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Only show published blogs to students and teachers
        const publishedBlogs = Object.keys(data)
          .map(key => ({
            id: key,
            ...data[key]
          }))
          .filter(blog => blog.status === 'Published')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setBlogs(publishedBlogs);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'All' || blog.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const categories = ['All', 'Technology', 'Education', 'Research', 'Innovation', 'Industry', 'Career', 'News', 'Events'];

  if (loading) {
    return (
      <div className="blog-reader-loading">
        <div className="loading-spinner"></div>
        <p>Loading blogs...</p>
      </div>
    );
  }

  if (selectedBlog) {
    return (
      <div className="blog-detail">
        <div className="blog-detail-header">
          <button onClick={() => setSelectedBlog(null)} className="back-btn">
            ← Back to Blogs
          </button>
        </div>
        
        <article className="blog-article">
          {selectedBlog.featuredImage && (
            <img 
              src={selectedBlog.featuredImage} 
              alt={selectedBlog.title}
              className="featured-image"
            />
          )}
          
          <header className="article-header">
            <h1>{selectedBlog.title}</h1>
            <div className="article-meta">
              <span><FaUser /> {selectedBlog.author}</span>
              <span><FaCalendar /> {formatDate(selectedBlog.createdAt)}</span>
              <span><FaTag /> {selectedBlog.category}</span>
              <span><FaClock /> {selectedBlog.readTime || 5} min read</span>
            </div>
          </header>
          
          <div className="article-content">
            {selectedBlog.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          
          {selectedBlog.tags && (
            <div className="article-tags">
              <strong>Tags: </strong>
              {selectedBlog.tags.split(',').map((tag, index) => (
                <span key={index} className="tag">{tag.trim()}</span>
              ))}
            </div>
          )}
        </article>
      </div>
    );
  }

  return (
    <div className="blog-reader">
      <div className="blog-reader-header">
        <h1>Blog Posts</h1>
        <p>Stay updated with the latest insights and news</p>
      </div>

      <div className="blog-filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="category-filter"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {filteredBlogs.length === 0 ? (
        <div className="no-blogs">
          <h3>No blogs available</h3>
          <p>Check back later for new content!</p>
        </div>
      ) : (
        <div className="blog-grid">
          {filteredBlogs.map(blog => (
            <div key={blog.id} className="blog-card">
              {blog.featuredImage && (
                <img 
                  src={blog.featuredImage} 
                  alt={blog.title}
                  className="blog-card-image"
                />
              )}
              
              <div className="blog-card-content">
                <h2 className="blog-card-title">{blog.title}</h2>
                <p className="blog-card-excerpt">
                  {blog.content.substring(0, 150)}...
                </p>
                <div className="blog-card-meta">
                  <span><FaUser /> {blog.author}</span>
                  <span><FaCalendar /> {formatDate(blog.createdAt)}</span>
                  <span><FaTag /> {blog.category}</span>
                  <span><FaClock /> {blog.readTime || 5} min read</span>
                </div>
                <button 
                  onClick={() => setSelectedBlog(blog)}
                  className="read-more-btn"
                >
                  <FaEye /> Read More
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogReader;
