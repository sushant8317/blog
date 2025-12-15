# PropScholar Event-Based Blog Contest v2.0

🎯 **A production-ready event management system for blog writing contests** with automatic deadline enforcement, unlimited events, and an admin dashboard.

---

## ✨ Features

✅ **Event Management System**
- Create unlimited events with custom slugs
- Auto-close submissions after event deadline
- Event-specific word count requirements
- Clean SEO-friendly URLs (`propscholar.space/events/:slug`)

✅ **Dynamic Event Pages**
- Automatic deadline detection
- Real-time word counter
- Copy-paste protection (disabled Ctrl+C/V)
- Right-click menu disabled

✅ **Admin Dashboard**
- Create events with title, slug, dates, word requirements
- View all events with their deadlines
- See submissions per event
- Manually close events if needed
- Logout functionality

✅ **User Experience**
- Responsive PropScholar dark blue theme (#0b1020, #3b82f6)
- Submission success screen with confirmation
- Mobile-friendly forms and layouts

✅ **Security**
- Server-side deadline enforcement (non-bypassable)
- Word count validation on both client and server
- Environment variable support for credentials
- Admin login protection

---

## 📊 Architecture

### Database (MongoDB)

**Events Collection:**
```javascript
{
  title: "PropScholar Trading Psychology Contest",
  slug: "trading-psychology-2025",
  description: "Share your trading insights",
  startDate: "2025-09-01T00:00:00Z",
  endDate: "2025-09-30T23:59:59Z",
  minWords: 250,
  status: "active",
  createdAt: "2025-12-15T20:30:00Z"
}
```

**Submissions Collection:**
```javascript
{
  eventId: "ObjectId",
  name: "Sushant Kumar",
  email: "example@gmail.com",
  phone: "9876543210",
  blog: "Full blog text...",
  wordCount: 612,
  submittedAt: "2025-09-10T12:40:00Z"
}
```

### Backend API Endpoints

**Public Routes:**
- `GET /` - Home page
- `GET /events/:slug` - Event submission page
- `GET /api/events/:slug` - Fetch event details (check deadline)
- `POST /api/events/:slug/submit` - Submit blog entry

**Admin Routes:**
- `POST /api/admin/login` - Admin authentication
- `POST /api/admin/events` - Create event
- `GET /api/admin/events` - List all events
- `GET /api/admin/events/:slug/submissions` - View event submissions
- `POST /api/admin/events/:slug/close` - Manually close event

---

## 🚀 Quick Start

### 1. Setup Local Development

```bash
# Clone and install
git clone https://github.com/sushant8317/blog.git
cd blog
npm install

# Copy environment file
cp .env.example .env
```

### 2. Configure .env

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/propscholar-blog
ADMIN_EMAIL=propscholars@gmail.com
ADMIN_PASSWORD=your_strong_password
```

### 3. Install MongoDB Locally

```bash
# On Windows/macOS/Linux, download from mongodb.com
# Or use MongoDB Atlas for free cloud hosting
```

### 4. Start Server

```bash
node server.js
```

Server runs at: **http://localhost:3000**

---

## 📝 Usage Guide

### For Users

1. **Visit Event Page:**
   - Navigate to `http://localhost:3000/events/:slug`
   - Event details load automatically

2. **Submit Blog:**
   - Fill name, email, phone
   - Write blog (min 250 words)
   - Word counter shows real-time count
   - Submit button disabled until 250+ words

3. **If Event Closed:**
   - "Event Closed" message appears
   - Submit button disabled
   - No submissions accepted

### For Admins

1. **Login to Dashboard:**
   - Visit `http://localhost:3000/admin-login.html`
   - Default: `propscholars@gmail.com` / `Hindi@1234`
   - Redirects to admin-dashboard.html

2. **Create Event:**
   - Click "Create Event" tab
   - Fill title, slug, dates, word requirement
   - Click "Create Event"
   - Get shareable URL: `propscholar.space/events/your-slug`

3. **View Submissions:**
   - Click "View Submissions" tab
   - Select event from dropdown
   - See all submissions with word count
   - Download blog text if needed

4. **Manage Events:**
   - See all active events
   - Check remaining time until deadline
   - Manually close event if needed

---

## 🌐 Deploy to Render

### 1. Push to GitHub

```bash
git add .
git commit -m "Final v2.0 release"
git push origin main
```

### 2. Connect Render

- Go to https://render.com
- Click "New" → "Web Service"
- Connect GitHub: `sushant8317/blog`
- Build Command: `npm install`
- Start Command: `node server.js`

### 3. Set Environment Variables in Render

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/propscholar-blog
ADMIN_EMAIL=propscholars@gmail.com
ADMIN_PASSWORD=your_strong_password
NODE_ENV=production
```

### 4. Connect propscholar.space Domain

- In Render Settings → "Custom Domains"
- Add `propscholar.space`
- Update DNS at your registrar with Render's CNAME
- Wait 15 min for SSL certificate

---

## 🔒 Security Checklist

- [ ] Change admin password before deployment
- [ ] Use strong, unique password in production
- [ ] Set `NODE_ENV=production` on Render
- [ ] Use MongoDB Atlas with IP whitelist
- [ ] Enable HTTPS (automatic on Render)
- [ ] Backup MongoDB regularly

---

## 📱 File Structure

```
blog/
├── server.js              # Main backend (294 lines)
├── package.json          # Dependencies
├── .env.example          # Environment template
├── .gitignore           # Git ignore rules
└── public/
    ├── index.html            # Old homepage
    ├── event.html            # Dynamic event page (MAIN)
    ├── admin-login.html      # Admin login
    ├── admin-dashboard.html  # Admin panel (MAIN)
    ├── admin.html           # Old admin page
    ├── success.html         # Submission success page
    ├── style.css            # PropScholar theme
    ├── script.js            # Word count + copy protection
```

---

## 🎨 Customization

### Change Theme Colors

Edit `/public/style.css`:
- Dark bg: `#0b1020` → `#your-color`
- Blue accent: `#3b82f6` → `#your-color`

### Change Word Limit

When creating event in admin dashboard, set "Minimum Words" value.

### Add Event Logo

Update HTML files with your logo URL.

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Check MONGODB_URI, ensure cluster is accessible |
| Admin login shows 404 | Verify admin credentials in .env |
| Event page blank | Check browser console for API errors |
| Word count not updating | Clear browser cache, refresh page |
| Submissions not saving | Check MongoDB connection, verify network |

---

## 📞 Support

- Issues: GitHub Issues
- Questions: propscholars@gmail.com
- Docs: This README

---

**Made with ❤️ for PropScholar**

Version: 2.0 | MongoDB | Node.js + Express | Production-Ready
