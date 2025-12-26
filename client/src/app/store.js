import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import consultancyReducer from '../features/consultancies/consultancySlice';
import holidayReducer from '../features/holidays/holidaySlice';
import eventReducer from '../features/events/eventSlice';
import staffReducer from '../features/staff/staffSlice'; // Import
import studentReducer from '../features/students/studentSlice';
import universityReducer from '../features/universities/universitySlice';
import aboutUsReducer from '../features/aboutUs/aboutUsSlice';
import blogReducer from '../features/blog/blogSlice';
import contactSettingsReducer from '../features/contactSettings/contactSettingsSlice';
import contactMessageReducer from '../features/contactMessage/contactMessageSlice';
import jobReducer from '../features/jobs/jobSlice';
import jobApplicationReducer from '../features/jobApplications/jobApplicationSlice';
import siteContentReducer from '../features/siteContent/siteContentSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import notificationReducer from '../features/notifications/notificationSlice';
import landingReducer from '../features/landing/landingSlice';
import subscribeReducer from '../features/subscribe/subscribeSlice';
import resourceReducer from '../features/resources/resourceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,             
    consultancies: consultancyReducer,  
    students: studentReducer,       
    staff: staffReducer,
    universities: universityReducer,
    holidays: holidayReducer,
    events: eventReducer,
    aboutUs: aboutUsReducer,
    blog: blogReducer,
    contactSettings: contactSettingsReducer,
    contactMessages: contactMessageReducer,
    jobs: jobReducer,
    jobApplications: jobApplicationReducer,
    siteContent: siteContentReducer,
    dashboard: dashboardReducer,
    notifications: notificationReducer,
    landing: landingReducer,
    subscribe: subscribeReducer,        
    resources: resourceReducer,
  },
});