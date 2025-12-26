// // // const jwt = require('jsonwebtoken');
// // // const User = require('../models/User');

// // // // Protect routes - Verify Token
// // // exports.protect = async (req, res, next) => {
// // //     let token;

// // //     // Check header or cookie for token
// // //     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
// // //         token = req.headers.authorization.split(' ')[1];
// // //     } else if (req.cookies.token) {
// // //         token = req.cookies.token;
// // //     }

// // //     // Make sure token exists
// // //     if (!token) {
// // //         return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
// // //     }

// // //     try {
// // //         // Verify token
// // //         const decoded = jwt.verify(token, process.env.JWT_SECRET);

// // //         // Add user to request object
// // //         req.user = await User.findById(decoded.id);

// // //         next();
// // //     } catch (err) {
// // //         return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
// // //     }
// // // };

// // // // Grant access to specific roles
// // // exports.authorize = (...roles) => {
// // //     return (req, res, next) => {
// // //         if (!roles.includes(req.user.role)) {
// // //             return res.status(403).json({ 
// // //                 success: false, 
// // //                 message: `User role ${req.user.role} is not authorized to access this route`
// // //             });
// // //         }
// // //         next();
// // //     };
// // // };

// // const jwt = require('jsonwebtoken');
// // const User = require('../models/User');

// // exports.protect = async (req, res, next) => {
// //     let token;
// //     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
// //         token = req.headers.authorization.split(' ')[1];
// //     } else if (req.cookies.token) {
// //         token = req.cookies.token;
// //     }

// //     if (!token) {
// //         return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
// //     }

// //     try {
// //         const decoded = jwt.verify(token, process.env.JWT_SECRET);
// //         req.user = await User.findById(decoded.id);
// //         next();
// //     } catch (err) {
// //         return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
// //     }
// // };

// // // Grant access to specific roles
// // // Example: authorize('consultancy_admin') -> Only Admin
// // // Example: authorize('consultancy_admin', 'document_officer') -> Admin OR Officer
// // exports.authorize = (...roles) => {
// //     return (req, res, next) => {
// //         // Check Main Role
// //         if (roles.includes(req.user.role)) {
// //             return next();
// //         }

// //         // Check Sub-Role (If the user is staff, check their specific job title)
// //         if (req.user.role === 'consultancy_staff' && roles.includes(req.user.subRole)) {
// //             return next();
// //         }

// //         return res.status(403).json({ 
// //             success: false, 
// //             message: `User role ${req.user.role} (${req.user.subRole}) is not authorized to access this route`
// //         });
// //     };
// // };


// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// exports.protect = async (req, res, next) => {
//     let token;
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//         token = req.headers.authorization.split(' ')[1];
//     } else if (req.cookies.token) {
//         token = req.cookies.token;
//     }

//     if (!token) {
//         return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = await User.findById(decoded.id);
//         next();
//     } catch (err) {
//         return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
//     }
// };

// // Robust Role Check
// exports.authorize = (...allowedRoles) => {
//     return (req, res, next) => {
//         const userRole = req.user.role;
//         const userSubRole = req.user.subRole;

//         // 1. Check if the main role is allowed (e.g. 'consultancy_admin')
//         if (allowedRoles.includes(userRole)) {
//             return next();
//         }

//         // 2. Check if the sub-role is allowed (e.g. 'receptionist')
//         // Only applies if they are staff
//         if (userRole === 'consultancy_staff' && allowedRoles.includes(userSubRole)) {
//             return next();
//         }

//         return res.status(403).json({ 
//             success: false, 
//             message: `User role ${userRole} (${userSubRole || 'no subrole'}) is not authorized to access this route`
//         });
//     };
// };


const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    // 1. Check for token in Cookies (Preferred) or Headers
    // UPDATED: Changed from 'token' to 'accessToken' (Phase 2)
    if (req.cookies.accessToken) {
        token = req.cookies.accessToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // 2. Handle missing token
    if (!token || token === 'none') {
        return res.status(401).json({
            success: false,
            message: 'Not authorized (No Token)',
            code: 'NO_TOKEN'
        });
    }

    try {
        // 3. Verify Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Verify token type (Phase 2: should be access token)
        if (decoded.type && decoded.type !== 'access') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token type',
                code: 'INVALID_TOKEN_TYPE'
            });
        }

        // 5. Get User from DB
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized (User Not Found)',
                code: 'USER_NOT_FOUND'
            });
        }

        next();
    } catch (err) {
        console.error("[AUTH] Token verification error:", err.message);

        // Specific error messages help frontend auto-refresh
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Access token expired',
                code: 'TOKEN_EXPIRED', // Frontend should refresh
                tokenExpired: true
            });
        }

        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Not authorized',
            code: 'AUTH_ERROR'
        });
    }
};

// Role Authorization
exports.authorize = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        const userSubRole = req.user.subRole;

        // 1. Check Main Role
        if (allowedRoles.includes(userRole)) {
            return next();
        }

        // 2. Check Sub-Role (For Staff)
        if (userRole === 'consultancy_staff' && allowedRoles.includes(userSubRole)) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: `User role ${userRole} (${userSubRole}) is not authorized to access this route`
        });
    };
};