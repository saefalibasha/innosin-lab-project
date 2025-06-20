
// Contact Page Content Data
// This file contains all the text content for the contact page
// To modify the text content, simply edit the values below

export const contactPageContent = {
  // Header Section
  header: {
    title: "Contact Us",
    description: "Have questions about our products or need support? We'd love to hear from you. Send us a message and we'll respond as soon as possible."
  },

  // Contact Form
  form: {
    title: "Send us a message",
    nameLabel: "Full Name",
    namePlaceholder: "John Doe",
    emailLabel: "Email Address", 
    emailPlaceholder: "john@example.com",
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
    sections: [
      {
        title: "Laboratory Consultation",
        description: "Schedule a consultation with our experts to discuss your laboratory design and equipment needs."
      },
      {
        title: "Emergency Support", 
        description: "For urgent equipment issues or safety concerns, contact our 24/7 emergency support line."
      },
      {
        title: "Project Inquiries",
        description: "Ready to start your laboratory project? Let's discuss your requirements and timeline."
      }
    ]
  }
};

/*
HOW TO EDIT CONTACT PAGE CONTENT:
1. To change header text: Edit the "header" section
2. To change form labels and placeholders: Edit the "form" section
3. To change quick contact sections: Edit the "quickContact.sections" array

Example:
To change the page title from "Contact Us" to "Get In Touch":
- Change header.title: "Get In Touch"

To add a new quick contact section:
- Add new object to quickContact.sections array with title and description
*/
