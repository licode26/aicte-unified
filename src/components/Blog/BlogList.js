
import React, { useState, useEffect } from 'react';
import { ref as dbref, child, get, update } from 'firebase/database';
import { database } from '../../firebase/init-firebase';
import { FaSearch, FaFilter, FaBlog } from 'react-icons/fa';
import { HashLoader } from 'react-spinners';
import BlogCard from './BlogCard';
import BlogModal from './BlogModal';
import '../../styles/BlogList.css';

const BlogList = ({ userRole }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedBlog, setSelectedBlog] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const db = dbref(database);
      const snapshot = await get(child(db, '/blogs/'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const blogsArray = Object.keys(data)
          .map(key => ({
            id: key,
            ...data[key]
          }))
          .filter(blog => blog.status?.toLowerCase() === 'published')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBlogs(blogsArray);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlogClick = async (blog) => {
    setSelectedBlog(blog);
    
    // Increment view count
    try {
      const newViews = (blog.views || 0) + 1;
      await update(dbref(database, `/blogs/${blog.id}`), {
        views: newViews
      });
      blog.views = newViews; // Update local state
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tags?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !categoryFilter || blog.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(blogs.map(blog => blog.category))].filter(Boolean);

  if (loading) {
    return (
      <div className="blog-loading">
        <HashLoader size={40} color="#3B82F6" />
        <p>Loading blogs...</p>
      </div>
    );
  }

  return (
    <div className="blog-list-container">
      {/* Search and Filter Controls */}
      <div className="blog-controls">
        <div className="blog-search">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="blog-search-input"
          />
        </div>
        
        <div className="blog-filter">
          <FaFilter className="filter-icon" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="blog-category-filter"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Blog Results Count */}
      <div className="blog-results-info">
        <p>Showing {filteredBlogs.length} of {blogs.length} blogs</p>
      </div>

      {/* Blog Grid */}
      {filteredBlogs.length > 0 ? (
        <div className="blog-grid">
          {filteredBlogs.map(blog => (
            <BlogCard
              key={blog.id}
              blog={blog}
              onClick={() => handleBlogClick(blog)}
            />
          ))}
        </div>
      ) : (
        <div className="no-blogs">
          <FaBlog size={48} className="no-blogs-icon" />
          <h3>No Blogs Found</h3>
          <p>
            {searchTerm || categoryFilter
              ? 'Try adjusting your search or filter criteria'
              : 'No blogs are available at the moment'
            }
          </p>
        </div>
      )}

      {/* Blog Modal */}
      {selectedBlog && (
        <BlogModal
          blog={selectedBlog}
          onClose={() => setSelectedBlog(null)}
        />
      )}
    </div>
  );
};

export default BlogList;
