# 🔐 Student & Teacher Authentication Guide

## 📱 How to Access Student/Teacher Portals

### 🚀 **Quick Start**

1. **Open the Application**: Navigate to `http://localhost:3000`
2. **Landing Page**: You'll see the beautiful sliding cards with "AICTE UNIFIED"
3. **Get Started**: Click the "Get Started" button
4. **Choose Role**: Select either "Student" or "Teacher" (Admin goes directly to login)
5. **Authentication**: Complete the sign-up or sign-in process

---

## 👨‍🎓 **Student Registration & Login**

### **New Student Registration**

1. **Select Student Role** from the role selection page
2. **Registration Form** will appear with the following fields:
   - **Full Name*** (Required)
   - **Email Address*** (Required)
   - **Password*** (Required - minimum 6 characters)
   - **Confirm Password*** (Required)
   - **Institution*** (Required - your college/university)
   - **Department** (Optional - your department)
   - **Student ID*** (Required - your student identification number)
   - **Phone Number** (Optional)

3. **Submit Registration** - Your account will be created automatically
4. **Access Portal** - You'll be redirected to the Student Portal

### **Existing Student Login**

1. **Select Student Role** from the role selection page
2. **Switch to Login** by clicking "Sign In" at the bottom
3. **Enter Credentials**:
   - Email address
   - Password
4. **Sign In** - You'll be redirected to the Student Portal

### **Student Portal Features**

Once logged in, students can access:
- 🏛️ **Universities**: Browse AICTE approved institutions
- 📚 **Curriculum**: View curriculum materials and documents
- 👨‍💼 **Experts**: Directory of domain experts with contact information
- 🎥 **Seminars**: Upcoming seminars with registration capability
- 🎓 **Courses**: Course information (coming soon)

---

## 👨‍🏫 **Teacher Registration & Login**

### **New Teacher Registration**

1. **Select Teacher Role** from the role selection page
2. **Registration Form** will appear with the following fields:
   - **Full Name*** (Required)
   - **Email Address*** (Required)
   - **Password*** (Required - minimum 6 characters)
   - **Confirm Password*** (Required)
   - **Institution*** (Required - your college/university)
   - **Department** (Optional - your department)
   - **Employee ID*** (Required - your employee identification number)
   - **Phone Number** (Optional)

3. **Submit Registration** - Your account will be created automatically
4. **Access Portal** - You'll be redirected to the Teacher Portal

### **Existing Teacher Login**

1. **Select Teacher Role** from the role selection page
2. **Switch to Login** by clicking "Sign In" at the bottom
3. **Enter Credentials**:
   - Email address
   - Password
4. **Sign In** - You'll be redirected to the Teacher Portal

### **Teacher Portal Features**

Once logged in, teachers can access:
- 👤 **Profile**: Complete profile management with professional details
- 📖 **Resources**: Access to curriculum materials and teaching resources
- 🎥 **Seminars**: Create and manage seminars with Google Meet integration
- 💬 **Feedback**: Provide feedback on curriculum materials
- ⚙️ **Settings**: Notification and privacy preferences

---

## 🔑 **Authentication Features**

### **Security Features**
- ✅ **Email Validation**: Proper email format checking
- ✅ **Password Strength**: Minimum 6 characters required
- ✅ **Secure Storage**: Firebase Authentication backend
- ✅ **Role-Based Access**: Separate portals for different user types
- ✅ **Profile Integration**: User data stored in Firebase database

### **User Experience**
- 🎨 **Beautiful UI**: Modern, responsive authentication forms
- 👁️ **Password Visibility**: Toggle to show/hide passwords
- 🔄 **Easy Switching**: Toggle between login and registration
- 📱 **Mobile Friendly**: Works perfectly on all devices
- ⚡ **Real-time Validation**: Instant feedback on form errors

### **Error Handling**
- 📧 **Email Already Exists**: Clear message for duplicate emails
- 🔒 **Wrong Password**: Secure error messages
- 📝 **Form Validation**: Real-time field validation
- 🚫 **Account Not Found**: Helpful error messages

---

## 🔄 **User Flow Examples**

### **Student Journey**
```
Landing Page → Get Started → Select "Student" → 
Registration Form → Fill Details → Submit → 
Student Portal (Universities, Curriculum, Experts, Seminars)
```

### **Teacher Journey**
```
Landing Page → Get Started → Select "Teacher" → 
Registration Form → Fill Details → Submit → 
Teacher Portal (Profile, Resources, Seminars, Feedback)
```

### **Admin Journey** (Existing)
```
Landing Page → Get Started → Select "Admin" → 
Admin Login → Enter Credentials → 
Admin Portal (Streams, Experts, Universities, etc.)
```

---

## 💾 **Data Storage**

### **User Profiles Stored in Firebase**
```json
{
  "users": {
    "userUID": {
      "uid": "firebase-user-id",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "student" | "teacher",
      "institution": "ABC University",
      "department": "Computer Science",
      "studentId": "CS2021001", // for students
      "employeeId": "EMP001", // for teachers
      "phone": "+91 9876543210",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "status": "active"
    }
  }
}
```

---

## 🚪 **Logout Process**

### **How to Logout**
1. **Student Portal**: Click the "Logout" button in the top-right header
2. **Teacher Portal**: Click the "Logout" button in the top-right header
3. **Automatic Redirect**: You'll be taken back to the landing page
4. **Session Cleared**: All authentication data is cleared

---

## 🔧 **Troubleshooting**

### **Common Issues & Solutions**

#### **"Email already in use" Error**
- **Solution**: Use the "Sign In" option instead of registration
- **Alternative**: Use a different email address

#### **"Password too weak" Error**
- **Solution**: Use at least 6 characters with a mix of letters and numbers

#### **"Invalid email" Error**
- **Solution**: Check email format (must include @ and domain)

#### **Can't access portal after login**
- **Solution**: Refresh the page or clear browser cache

#### **Forgot Password**
- **Current**: Use the admin forgot password feature
- **Future**: Student/Teacher password reset will be added

---

## 🎯 **Next Steps for Users**

### **For Students**
1. ✅ Complete registration
2. 🏛️ Explore universities and institutions
3. 👨‍💼 Browse expert directory
4. 🎥 Register for upcoming seminars
5. 📚 Access curriculum materials

### **For Teachers**
1. ✅ Complete registration
2. 👤 Set up complete profile
3. 🎥 Create your first seminar
4. 📖 Access teaching resources
5. 💬 Provide curriculum feedback

---

## 🔮 **Future Enhancements**

- 🔄 **Password Reset**: Email-based password recovery
- 📧 **Email Verification**: Account verification via email
- 🔗 **Social Login**: Google/Microsoft authentication
- 👥 **Bulk Registration**: Institution-based bulk user creation
- 📊 **Usage Analytics**: Track user engagement
- 🔔 **Push Notifications**: Real-time updates

---

## 📞 **Support**

For any authentication issues:
1. Check this guide first
2. Verify your internet connection
3. Try refreshing the page
4. Clear browser cache if needed
5. Contact system administrator for persistent issues

The authentication system is now fully functional and ready for production use! 🚀
