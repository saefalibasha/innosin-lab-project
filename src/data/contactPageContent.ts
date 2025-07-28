
// Contact Page Content Data
// This file contains all the text content for the contact page
// To modify the text content, simply edit the values below

export const contactPageContent = {
  // Header Section
  header: {
    title: "Contact Us",
    description: "Have questions about our products or need support? We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
    // Hero/header image
    heroImage: "/page-images/contact/contact-hero.jpg", // Replace with your image
    heroImageAlt: "Contact us - laboratory consultation and support"
  },

  // Contact Form
  form: {
    title: "Send us a message",
    nameLabel: "Full Name",
    namePlaceholder: "John Doe",
    emailLabel: "Email Address", 
    emailPlaceholder: "john@example.com",
    companyLabel: "Company",
    companyPlaceholder: "Your Company Name",
    jobTitleLabel: "Job Title",
    jobTitlePlaceholder: "Your Position",
    subjectLabel: "Subject",
    subjectPlaceholder: "How can we help you?",
    messageLabel: "Message",
    messagePlaceholder: "Tell us more about your inquiry...",
    submitButton: "Send Message",
    successMessage: "Message sent successfully! We'll get back to you soon."
  },

  // Quick Contact Info
  quickContact: {
    title: "Get in Touch",
    // Optional background image for contact section
    backgroundImage: "/page-images/contact/office-location.jpg", // Replace with your image
    backgroundImageAlt: "Our office location and facility",
    sections: [
      {
        title: "Laboratory Consultation",
        description: "Schedule a consultation with our experts to discuss your laboratory design and equipment needs.",
        icon: "calendar", // Icon identifier
        image: "/page-images/contact/consultation.jpg" // Optional image
      },
      {
        title: "Emergency Support", 
        description: "Send an enquiry on our chat bot and we will get back to them within 24 hours for urgent equipment issues or safety concerns.",
        icon: "message-circle",
        image: "/page-images/contact/emergency-support.jpg" // Optional image
      },
      {
        title: "Project Inquiries",
        description: "Ready to start your laboratory project? Let's discuss your requirements and timeline.",
        icon: "briefcase",
        image: "/page-images/contact/project-inquiry.jpg" // Optional image
      }
    ]
  },


/*
HOW TO EDIT CONTACT PAGE CONTENT VIA GITHUB:
1. Navigate to this file: src/data/contactPageContent.ts
2. Edit any text values in the contactPageContent object above
3. Add your images to public/page-images/contact/ folder
4. Update the image paths above to reference your new images
5. Commit your changes to GitHub

IMAGE CUSTOMIZATION:
1. Upload images to public/page-images/contact/ folder
2. Update heroImage, backgroundImage, and office images paths above
3. Update the alt text for accessibility
4. Recommended sizes:
   - Hero image: 1200x800px
   - Office images: 600x400px
   - Background images: 1920x1080px

SECTIONS INCLUDED:
1. Header - Page title, description, and hero image
2. Contact Form - Form labels, placeholders, and messages (now includes Company and Job Title)
3. Quick Contact - Contact options with optional images
4. Location - Office information and gallery images

EXAMPLES:
To change the page title:
- Change header.title: "Get In Touch"

To add a hero image:
- Upload image to /public/page-images/contact/your-hero.jpg
- Change header.heroImage: "/page-images/contact/your-hero.jpg"
- Update header.heroImageAlt: "Description of your image"

To add office images:
- Upload images to /public/page-images/contact/
- Update the officeImages array with your image paths
- Update alt text and captions for each image

To add a new quick contact section:
- Add new object to quickContact.sections array with title, description, and optional image
*/
