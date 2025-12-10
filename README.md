# 🎬 Spotlight - Film Streaming Platform

A modern, Netflix-style film streaming platform built with Next.js, Firebase, and Cloudflare R2. Designed for film societies and organizations to showcase their video content with a professional, user-friendly interface.

## ✨ Features

### 🎥 Video Management

- **Film Streaming**: Custom video player with full controls (play, pause, seek, volume, fullscreen)
- **Status Categories**: Released films, upcoming films, and coming soon releases
- **Featured Films**: Highlight special films on the homepage

### 📊 Admin Dashboard

- **Comprehensive Analytics**: View film statistics, genre distribution, and upload trends
- **Storage Monitoring**: Real-time R2 storage usage with visual indicators and 10GB free tier tracking
- **Film Management**: Add, edit, and delete films with drag-and-drop file uploads
- **Upload Progress**: Real-time progress bars for video, thumbnail, and cover photo uploads
- **Announcement System**: Create time-based announcements with automatic expiration and deletion

### 🔐 Security & Access

- **Admin Authentication**: Firebase Auth with email restrictions for admin access
- **Role-Based Access**: Only specific emails can access admin dashboard
- **Protected Routes**: Authentication checks on admin pages

### ☁️ Cloud Infrastructure

- **Cloudflare R2**: Object storage for videos, thumbnails, and cover photos
- **Presigned URLs**: Direct browser-to-R2 uploads for large files (bypassing server limits)
- **Firebase Firestore**: NoSQL database for film metadata and announcements
- **Auto-Cleanup**: Expired announcements automatically deleted to save storage

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/dlsl-animodev/project-spotlight.git
   cd project-spotlight
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Cloudflare R2 Configuration
   R2_ACCOUNT_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
   R2_ACCESS_KEY_ID=your_access_key
   R2_SECRET_ACCESS_KEY=your_secret_key
   R2_BUCKET=your_bucket_name
   ```

4. **Configure Firestore Security Rules**

   Go to Firebase Console → Firestore Database → Rules:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /films/{filmId} {
         allow read: if true;
         allow write: if request.auth != null &&
                      request.auth.token.email in [
                        "developers.society@dlsl.edu.ph",
                        "filmsociety@dlsl.edu.ph"
                      ];
       }

       match /announcements/{announcementId} {
         allow read: if true;
         allow write: if request.auth != null &&
                      request.auth.token.email in [
                        "developers.society@dlsl.edu.ph",
                        "filmsociety@dlsl.edu.ph"
                      ];
       }

       match /{document=**} {
         allow read: if true;
       }
     }
   }
   ```

5. **Configure R2 CORS**

   In Cloudflare R2 bucket settings, add CORS rules:

   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

6. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment

### Build for production

```bash
npm run build
```

### Start production server

```bash
npm start
```

## 📱 Usage

### Public Features

- Browse released films on the homepage
- View film details and watch videos
- Check upcoming films and release dates
- Read announcements in the navbar

### Admin Features

1. **Login**: Navigate to `/admin/login` and sign in with authorized email
2. **Dashboard**: View analytics, storage usage, and film statistics
3. **Upload Films**:
   - Click "Upload Film" for released content
   - Click "Upload Upcoming" for future releases
   - Fill in details and upload video, thumbnail, and cover photo
   - Track upload progress in real-time
4. **Manage Announcements**:
   - Create announcements with expiration dates
   - Announcements automatically expire and delete from database
5. **Edit/Delete Films**: Modify film details or remove content
6. **Monitor Storage**: Keep track of R2 usage (10GB free tier)

## 🎯 Key Features Explained

### Storage Management

- Automatically calculates total R2 bucket size
- Prevents uploads when exceeding 10GB limit
- Color-coded warnings (green < 80%, yellow 80-90%, red > 90%)
- Real-time storage stats in admin dashboard

### Video Streaming

- Custom player with seeking support
- HTTP Range requests for fast seeking
- Prevents video downloads via browser controls
- Optimized for bandwidth efficiency

### Announcement System

- Time-based announcements with expiration
- Beautiful calendar picker for date selection
- Automatic cleanup of expired announcements
- Optimistic UI updates after adding announcements

### Upload System

- Direct browser-to-R2 uploads (no server bottleneck)
- Presigned URLs for secure, temporary upload access
- Progress tracking for large files
- Support for videos up to 1GB+

## 🔧 Configuration

### Admin Email Access

Update the allowed emails in:

- `app/admin/page.tsx`
- Firestore security rules

### Storage Limit

Modify the 10GB limit in:

- `app/api/bucket-stats/route.ts`
- `components/upload-film.tsx`

## 📄 License

This project is private and proprietary to De La Salle Lipa Animo.dev.

## 👥 Contributors

- **Development Team**: DLSL Developers Society
- **Film Society**: DLSL Film Society

## 🆘 Support

For issues or questions, contact:

- Developers: developers.society@dlsl.edu.ph
- Film Society: filmsociety@dlsl.edu.ph

---
