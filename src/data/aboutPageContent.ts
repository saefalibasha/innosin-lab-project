
// About Page Content Data
// This file contains all the text content for the About Us page
// To modify the text content, simply edit the values below

export const aboutPageContent = {
  // Hero Section
  hero: {
    title: "About",
    titleHighlight: "Innosin Lab",
    description: "We are passionate about creating innovative laboratory environments that enable groundbreaking research and scientific discovery."
  },

  // Mission & Vision
  mission: {
    title: "Our Mission",
    description: "To provide world-class laboratory solutions that empower researchers and scientists to achieve their goals through innovative design, quality equipment, and exceptional service."
  },

  vision: {
    title: "Our Vision", 
    description: "To be the leading provider of laboratory solutions in Southeast Asia, known for our commitment to excellence, innovation, and customer satisfaction."
  },

  // Company Timeline
  timeline: {
    title: "Our",
    titleHighlight: "Journey",
    description: "From humble beginnings to becoming a trusted partner in laboratory solutions",
    
    // Timeline Events
    events: [
      {
        year: "2024",
        title: "Expansion & Innovation",
        description: "Expanded our product range and introduced cutting-edge laboratory technologies",
        achievements: [
          "Launched advanced equipment line",
          "Implemented new lab technologies", 
          "Enhanced research capabilities",
          "Improved laboratory designs"
        ]
      },
      {
        year: "2018", 
        title: "Regional Growth",
        description: "Expanded operations across Southeast Asia and established key partnerships",
        achievements: [
          "Completed major pharmaceutical lab project",
          "Expanded research facility operations"
        ]
      },
      {
        year: "2012",
        title: "Technology Integration", 
        description: "Integrated advanced automation and safety systems into our solutions",
        achievements: [
          "Implemented laboratory automation systems",
          "Enhanced safety protocol standards"
        ]
      },
      {
        year: "2009",
        title: "Foundation",
        description: "Innosin Lab was founded with a vision to transform laboratory environments",
        achievements: [
          "Company establishment and founding",
          "Started early laboratory design work"
        ]
      }
    ]
  },

  // Company Values/Stats (if needed)
  values: {
    title: "Why Choose Us",
    items: [
      {
        title: "Experience",
        description: "Over 15 years of expertise in laboratory solutions"
      },
      {
        title: "Quality", 
        description: "Premium equipment and materials from trusted manufacturers"
      },
      {
        title: "Innovation",
        description: "Cutting-edge designs and latest laboratory technologies"
      },
      {
        title: "Support",
        description: "Comprehensive support from design to maintenance"
      }
    ]
  }
};

/*
HOW TO EDIT ABOUT PAGE CONTENT:
1. To change hero section: Edit the "hero" section
2. To change mission/vision: Edit the "mission" and "vision" sections
3. To change timeline events: Edit the "timeline.events" array
4. To change company values: Edit the "values.items" array

Example:
To change the mission statement:
- Change mission.description: "Your new mission statement here"

To add a new timeline event:
- Add new object to timeline.events array with year, title, description, and achievements

To modify timeline achievements:
- Edit the achievements array for any timeline event
*/
