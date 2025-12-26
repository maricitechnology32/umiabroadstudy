const express = require('express');
const {
    getBlogs,
    getBlogBySlug,
    getBlogsAdmin,
    createBlog,
    updateBlog,
    deleteBlog,
    incrementViewCount
} = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);
router.put('/:slug/view', incrementViewCount);

// Admin routes
router.get('/admin/all', protect, authorize('super_admin', 'consultancy_admin'), getBlogsAdmin);
router.post('/', protect, authorize('super_admin', 'consultancy_admin'), createBlog);
router.put('/:id', protect, authorize('super_admin', 'consultancy_admin'), updateBlog);
router.delete('/:id', protect, authorize('super_admin', 'consultancy_admin'), deleteBlog);

module.exports = router;
