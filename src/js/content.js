import * as THREE from 'three';
import { gsap } from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Content loader functions
function loadAboutContent() {
  const aboutSection = document.querySelector('#about .about-text');

  aboutSection.innerHTML = `
    <p>I'm Arne Reabel, a robotics welding specialist and programmer with extensive expertise in industrial automation systems. My work combines precision engineering with advanced programming to create efficient robotic solutions.</p>
    <p>My specialized focus areas include:</p>
    <ul>
      <li>Industrial robotics programming across multiple platforms (CLOOS, Yaskawa, ABB)</li>
      <li>Drone collision detection systems and autonomous navigation</li>
      <li>Computer vision integration for quality control in welding applications</li>
      <li>Python-based automation solutions for manufacturing environments</li>
    </ul>
    <p>With a background spanning both hardware and software development, I develop robust systems that enhance production efficiency while maintaining strict safety standards. I'm particularly interested in applying machine learning techniques to optimize welding parameters and improve joint quality prediction.</p>
    <p>Currently seeking collaborative opportunities on projects that push the boundaries of what's possible in industrial robotics and automation. Connect with me to discuss how we might work together on your next innovative solution.</p>
  `;
}

async function loadProjectsContent() {
  const projectsGrid = document.querySelector('#projects .projects-grid');
  projectsGrid.innerHTML = '<p>Loading GitHub projects...</p>'; // Placeholder

  try {
    const response = await fetch('./data/github_data.md');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const markdown = await response.text();
    const projects = parseGitHubMarkdown(markdown);

    projectsGrid.innerHTML = ''; // Clear placeholder

    if (projects.length === 0) {
      projectsGrid.innerHTML = '<p>Could not find project data.</p>';
      return;
    }

    projects.forEach(project => {
      const projectLink = document.createElement('a');
      projectLink.href = `https://github.com/arnereabel/${project.title}`;
      projectLink.target = '_blank';
      projectLink.rel = 'noopener noreferrer';
      projectLink.className = 'project-card-link';

      const projectCard = document.createElement('div');
      projectCard.className = 'project-card';

      const techTags = project.language ? `<span class="tech-tag">${project.language}</span>` : '';

      projectCard.innerHTML = `
        <div class="project-content">
          <h3 class="project-title">${project.title.replace(/_/g, ' ')}</h3>
          <p class="project-description">${project.description || 'No description provided.'}</p>
          <div class="project-tech">
          ${techTags}
          </div>
        </div>
      `;

      projectLink.appendChild(projectCard);
      projectsGrid.appendChild(projectLink);
    });

    if (typeof createInteractiveProjectCards === 'function') {
        createInteractiveProjectCards();
    }

  } catch (error) {
    console.error('Error loading or parsing GitHub projects:', error);
    projectsGrid.innerHTML = '<p>Error loading projects. Please check the console.</p>';
  }
}

function parseGitHubMarkdown(markdown) {
  const projects = [];
  const lines = markdown.split('\n');
  let inPinnedSection = false;
  let currentProject = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('## Pinned Repositories')) {
      inPinnedSection = true;
      continue;
    }

    if (trimmedLine.startsWith('##') && inPinnedSection) {
      break;
    }

    if (inPinnedSection) {
      const titleMatch = trimmedLine.match(/^\d+\.\s+\*\*(.*?)\*\*/);
      if (titleMatch) {
        if (currentProject) {
          projects.push(currentProject);
        }
        currentProject = { title: titleMatch[1].trim(), description: '', language: '' };
        continue;
      }

      if (currentProject) {
        const descMatch = trimmedLine.match(/^- Description:\s*(.*)/);
        if (descMatch) {
          currentProject.description = descMatch[1].trim();
          continue;
        }

        const langMatch = trimmedLine.match(/^- Language:\s*(.*)/);
        if (langMatch) {
          currentProject.language = langMatch[1].trim();
          continue;
        }
      }
    }
  }

  if (currentProject) {
    projects.push(currentProject);
  }

  return projects;
}


function loadExperienceContent() {
  const experienceTimeline = document.querySelector('#experience .experience-timeline');

  experienceTimeline.innerHTML = '';

  const experiences = [
    {
      date: "Jun 2020 - Present",
      title: "Robotics Programmer / developer",
      company: "Smulders · Full-time",
      description: "Arendonk, Flemish Region, Belgium",
      skills: "Computer Vision · Project Management · Teamwork · Machine Learning · Analytical Skills · Communication · Robotic Welding · Delfoi Robotics · Yaskawa · cloos · Software Development"
    },
    {
      date: "Sep 2018 - Jun 2020",
      title: "Professional development",
      company: "Career Break",
      description: ""
    },
    {
      date: "Jan 2012 - Sep 2018",
      title: "aerial platform",
      company: "Maes Hoogwerkers en Montaco · Full-time",
      description: "Aerial Platforms: construction, reparation and inspection of wind turbines, electric pylons, radar installations and cellphone antennas"
    }
  ];

  experiences.forEach(exp => {
    const item = document.createElement('div');
    item.className = 'experience-item';
    item.innerHTML = `
      <div class="experience-content">
        <div class="experience-date">${exp.date}</div>
        <h3 class="experience-title">${exp.title}</h3>
        <p class="experience-company">${exp.company}</p>
        <p>${exp.description}</p>
        ${exp.skills ? `<p class="experience-skills"><strong>Skills:</strong> ${exp.skills}</p>` : ''}
      </div>
    `;
    experienceTimeline.appendChild(item);
  });
}

async function loadTravelContent() {
  const travelContent = document.querySelector('#travel .travel-content');
  travelContent.innerHTML = `
    <div class="travel-trips">
      <p>Loading travel data...</p>
    </div>
  `;

  try {
    const response = await fetch('./data/polarsteps_data.md');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const markdown = await response.text();
    const tripData = parsePolarstepsMarkdown(markdown);

    const travelTripsContainer = travelContent.querySelector('.travel-trips');
    travelTripsContainer.innerHTML = '';

    if (!tripData) {
      travelTripsContainer.innerHTML = '<p>Could not parse travel data.</p>';
    } else {
      const tripCard = document.createElement('div');
      tripCard.className = 'trip-card';

      const startDate = new Date(tripData.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (tripData.duration || 0));
      const formattedStartDate = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const formattedEndDate = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const dateString = `${formattedStartDate} - ${formattedEndDate} (${tripData.duration || '?'} days)`;

      tripCard.innerHTML = `
        <a href="https://polarsteps.com/ArneReabel" target="_blank" rel="noopener noreferrer" class="trip-image-link">
          <img src="./src/assets/polarsteps.jpg" alt="${tripData.name || 'Trip'}" class="trip-image">
        </a>
        <div class="trip-content">
          <h3 class="trip-title">${tripData.name || 'Unnamed Trip'}</h3>
          <p class="trip-date">${dateString}</p>
          <div class="trip-stats">
            <div class="trip-stat">
              <div class="trip-stat-value">8640</div> 
              <div class="trip-stat-label">km</div> 
            </div>
            <div class="trip-stat">
              <div class="trip-stat-value">${tripData.locations || 'N/A'}</div>
              <div class="trip-stat-label">Locations</div>
            </div>
            <div class="trip-stat">
              <div class="trip-stat-value">${tripData.countries ? tripData.countries.length : 'N/A'}</div>
              <div class="trip-stat-label">Countries</div>
            </div>
          </div>
          
        </div>
      `;
      travelTripsContainer.appendChild(tripCard);
    }

  } catch (error) {
    console.error('Error loading or parsing travel data:', error);
    const travelTripsContainer = travelContent.querySelector('.travel-trips');
    travelTripsContainer.innerHTML = '<p>Error loading travel data. Please check the console.</p>';
  }
}

function parsePolarstepsMarkdown(markdown) {
  const data = { countries: [], summary: '' }; 
  const lines = markdown.split('\n');
  let currentSection = '';

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('## ')) {
      currentSection = trimmedLine.substring(3).trim();
      continue;
    }

    if (trimmedLine.startsWith('### ')) {
       continue;
    }

    if (currentSection === 'Roadtrip 2018') {
        if (trimmedLine.startsWith('- Trip name:')) data.name = trimmedLine.split(':')[1].trim();
        else if (trimmedLine.startsWith('- Duration:')) data.duration = parseInt(trimmedLine.split(':')[1].trim(), 10);
        else if (trimmedLine.startsWith('- Steps/Locations:')) data.locations = parseInt(trimmedLine.split(':')[1].trim(), 10);
        else if (trimmedLine.startsWith('- Distance traveled:')) data.distance = trimmedLine.split(':')[1].trim().split(' ')[0].replace(',', '');
        else if (trimmedLine.startsWith('- Trip started:')) data.startDate = trimmedLine.split(':')[1].trim();
        else if (trimmedLine.startsWith('-') && (trimmedLine.includes('Belgium') || trimmedLine.includes('France') || trimmedLine.includes('Italy') || trimmedLine.includes('Germany'))) {
             if (!data.countries.includes(trimmedLine.substring(2).trim())) {
                 data.countries.push(trimmedLine.substring(2).trim());
             }
        } else if (trimmedLine.startsWith('The trip appears to include')) {
             data.summary = trimmedLine; 
        }
    }
  }

  if (!data.name || !data.startDate) return null;

  return data;
}


async function loadCertificationsContent() {
  const certificationsList = document.querySelector('#certifications .certifications-list');
  certificationsList.innerHTML = '<p>Loading certifications...</p>'; // Placeholder

  try {
    const response = await fetch('./data/linkedin_data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const certifications = data.certifications || [];

    certificationsList.innerHTML = ''; // Clear placeholder

    if (certifications.length === 0) {
      certificationsList.innerHTML = '<p>No certifications found.</p>';
      return;
    }
    
    // Create an unordered list
    const ul = document.createElement('ul');
    ul.className = 'certification-items'; // Add class for styling

    certifications.forEach(cert => {
      const li = document.createElement('li');
      li.className = 'certification-item'; // Add class for styling
      
      const certName = cert.name || 'Unnamed Certification';
      const certAuthority = cert.authority || 'Unknown Authority';
      const edxCertUrl = "https://courses.edx.org/certificates/a3f145f6d4b6426d90d24f717ebb11e8"; 
      // Removed duplicate edxCertUrl declaration
      const constructCertUrl = "https://app.theconstruct.ai/accomplishments/verify/RIAA2BACFEECAD5/";
      const yaskawaCertUrl = "https://yaskawaacademy.myabsorb.com/#/online-courses/4519c40e-a3ad-4a44-a53a-cff977a772df";
      const ciscoCertUrl = "https://www.credly.com/badges/f9df42b8-960f-4c2b-a905-d2c003f10e5b?source=linked_in_profile";
      const codecademyLACertUrl = "https://www.codecademy.com/profiles/arne_reabel/certificates/34c14a8d82ce7e5eb8077bd356946169"; 
      const codecademyPy3CertUrl = "https://www.codecademy.com/profiles/arne_reabel/certificates/6c152bd262967f8c941c9707ed636bda"; // Codecademy Python 3 URL
      
      // Check if this is one of the certificates to link
      if (certName === "edX Verified Certificate for Python Basics for Data Science" && certAuthority === "edX") {
        const shortCertName = "Python basics for Data Science"; // Use the shorter name for display
        li.innerHTML = `
          <a href="${edxCertUrl}" target="_blank" rel="noopener noreferrer" class="certification-link">
            <span class="certification-name">${shortCertName}</span> - 
            <span class="certification-authority">${certAuthority}</span>
          </a>
        `; 
      } else if (certName === "Code Foundation for ROS" && certAuthority === "The Construct") {
         li.innerHTML = `
          <a href="${constructCertUrl}" target="_blank" rel="noopener noreferrer" class="certification-link">
            <span class="certification-name">${certName}</span> - 
            <span class="certification-authority">${certAuthority}</span>
          </a>
        `; 
      } else if (certName === "Gp series w /YRC1000micro Controller w / Smart Pendant" && certAuthority === "YASKAWA Europe") {
         li.innerHTML = `
          <a href="${yaskawaCertUrl}" target="_blank" rel="noopener noreferrer" class="certification-link">
            <span class="certification-name">${certName}</span> -
            <span class="certification-authority">${certAuthority}</span>
          </a>
        `;
      } else if (certName === "Introduction to Packet Tracer" && certAuthority === "Cisco") {
         li.innerHTML = `
          <a href="${ciscoCertUrl}" target="_blank" rel="noopener noreferrer" class="certification-link">
            <span class="certification-name">${certName}</span> -
            <span class="certification-authority">${certAuthority}</span>
          </a>
        `;
      } else if (certName === "Linear Algebra Course" && certAuthority === "Codecademy") {
         li.innerHTML = `
          <a href="${codecademyLACertUrl}" target="_blank" rel="noopener noreferrer" class="certification-link">
            <span class="certification-name">${certName}</span> -
            <span class="certification-authority">${certAuthority}</span>
          </a>
        `;
      } else if (certName === "Learn Python 3 Course" && certAuthority === "Codecademy") {
         li.innerHTML = `
          <a href="${codecademyPy3CertUrl}" target="_blank" rel="noopener noreferrer" class="certification-link">
            <span class="certification-name">${certName}</span> -
            <span class="certification-authority">${certAuthority}</span>
          </a>
        `;
      } else {
         // Display other certificates without a link
         if (certName === " Yaskawa Motosim Robot Programming and Simulation") { 
            // Shorten the authority text specifically for this certificate
            const shortenedAuthority = certAuthority.replace(" & training", ""); 
            li.innerHTML = `
              <span class="certification-name">${certName}</span> - <span class="certification-authority">${shortenedAuthority}</span>
            `; 
         } else if (certName === "International Diploma in Robot Welding") {
             const modifiedCertName = certName.replace("Welding", "Welding NL IRW-C 015");
             li.innerHTML = `
              <span class="certification-name">${modifiedCertName}</span> - 
              <span class="certification-authority">${certAuthority}</span>
            `; 
         } else {
            li.innerHTML = `
              <span class="certification-name">${certName}</span> - 
              <span class="certification-authority">${certAuthority}</span>
            `; 
         }
      }
      // Move appendChild outside the innerHTML assignment
      ul.appendChild(li);
    }); // End forEach loop
    
    // Manually add the UT Austin certificate
    const utAustinCertName = "UTAustinX UT.5.05x Linear Algebra - Foundations to Frontiers";
    const utAustinCertUrl = "https://learning.edx.org/course/course-v1:UTAustinX+UT.5.05x+1T2022/home";
    const utAustinLi = document.createElement('li');
    utAustinLi.className = 'certification-item';
    utAustinLi.innerHTML = `
      <a href="${utAustinCertUrl}" target="_blank" rel="noopener noreferrer" class="certification-link">
        <span class="certification-name">${utAustinCertName}</span> - <span class="certification-authority">edX</span>
      </a>
    `;
    ul.appendChild(utAustinLi); 

    // Manually add the Circuits and Electronics certificate
    const circuitsCertName = "Circuits and Electronics 1: Basic Circuit Analysis";
    const circuitsCertUrl = "https://courses.edx.org/dashboard/programs/927093e3-46ba-4f44-a861-0f8c7aec4f74/"; // Added trailing slash for consistency
    const circuitsLi = document.createElement('li');
    circuitsLi.className = 'certification-item';
    circuitsLi.innerHTML = `
      <a href="${circuitsCertUrl}" target="_blank" rel="noopener noreferrer" class="certification-link">
        <span class="certification-name">${circuitsCertName}</span> - <span class="certification-authority">edX</span>
      </a>
    `;
    ul.appendChild(circuitsLi); 

    // Manually add the CS50 AI certificate
    const cs50aiCertName = "CS50's Introduction to Artificial Intelligence with Python";
    const cs50aiCertUrl = "https://learning.edx.org/course/course-v1:HarvardX+CS50AI+1T2020/home";
    const cs50aiLi = document.createElement('li');
    cs50aiLi.className = 'certification-item';
    cs50aiLi.innerHTML = `
      <a href="${cs50aiCertUrl}" target="_blank" rel="noopener noreferrer" class="certification-link">
        <span class="certification-name">${cs50aiCertName}</span> - <span class="certification-authority">edX</span>
      </a>
    `;
    ul.appendChild(cs50aiLi); 

    // Manually add the Computer Vision certificate
    const cvCertName = "Computer Vision and Image Processing Fundamentals";
    const cvCertUrl = "https://learning.edx.org/course/course-v1:IBM+CV0101EN+1T2021/home";
    const cvLi = document.createElement('li');
    cvLi.className = 'certification-item';
    cvLi.innerHTML = `
      <a href="${cvCertUrl}" target="_blank" rel="noopener noreferrer" class="certification-link">
        <span class="certification-name">${cvCertName}</span> - <span class="certification-authority">edX</span>
      </a>
    `;
    ul.appendChild(cvLi); 

    // Manually add the Mechatronics certificate
    const mechaCertName = "GTx: The Mechatronics Revolution: Fundamentals and Core Concepts";
    const mechaCertUrl = "https://www.edx.org/learn/engineering/the-georgia-institute-of-technology-the-mechatronics-revolution-fundamentals-and-core-concepts?index=product&queryId=72b39cf2cf6897345f9b7b2fda1a772f&position=1";
    const mechaLi = document.createElement('li');
    mechaLi.className = 'certification-item';
    mechaLi.innerHTML = `
      <a href="${mechaCertUrl}" target="_blank" rel="noopener noreferrer" class="certification-link">
        <span class="certification-name">${mechaCertName}</span> - <span class="certification-authority">edX</span>
      </a>
    `;
    ul.appendChild(mechaLi); 

    // Manually add the Tenaris certificate
    const tenarisCertName = "TenarisUniversity: Introduction to Steel";
    const tenarisCertUrl = "https://www.edx.org/learn/steel/tenarisuniversity-introduction-to-steel?index=product&queryId=ace39eafe280d0d83e8f6844a6b98386&position=1";
    const tenarisLi = document.createElement('li');
    tenarisLi.className = 'certification-item';
    tenarisLi.innerHTML = `
      <a href="${tenarisCertUrl}" target="_blank" rel="noopener noreferrer" class="certification-link">
        <span class="certification-name">${tenarisCertName}</span> - <span class="certification-authority">edX</span>
      </a>
    `;
    ul.appendChild(tenarisLi); 

    // Manually add the RWTHx certificate
    const rwthxCertName = "RWTHx: Introduction to Robotic Programming";
    const rwthxCertUrl = "https://www.edx.org/learn/robotics/rwth-aachen-university-introduction-to-robotic-programming?index=product&queryId=3942ed5e20a5f7f5d5befef8e7ed4cf1&position=1";
    const rwthxLi = document.createElement('li');
    rwthxLi.className = 'certification-item';
    rwthxLi.innerHTML = `
      <a href="${rwthxCertUrl}" target="_blank" rel="noopener noreferrer" class="certification-link">
        <span class="certification-name">${rwthxCertName}</span> - <span class="certification-authority">edX</span>
      </a>
    `;
    ul.appendChild(rwthxLi); 

    // Manually add the Probability certificate
    const probCertName = "Probability: Basic Concepts & Discrete Random Variables";
    const probCertUrl = "https://learning.edx.org/course/course-v1:PurdueX+416.1x+3T2018/home";
    const probLi = document.createElement('li');
    probLi.className = 'certification-item';
    probLi.innerHTML = `
      <a href="${probCertUrl}" target="_blank" rel="noopener noreferrer" class="certification-link">
        <span class="certification-name">${probCertName}</span> - <span class="certification-authority">edX</span>
      </a>
    `;
    ul.appendChild(probLi); 

    // Manually add the Linux/Python/ROS2 certificate
    const ros2CertName = "linux fundamentals , python 3 and navigition stack for roboticss development ROS2";
    const ros2CertUrl = "https://app.theconstruct.ai/courses";
    const ros2Li = document.createElement('li');
    ros2Li.className = 'certification-item';
    ros2Li.innerHTML = `
      <a href="${ros2CertUrl}" target="_blank" rel="noopener noreferrer" class="certification-link">
        <span class="certification-name">${ros2CertName}</span> - <span class="certification-authority">The Construct</span>
      </a>
    `;
    ul.appendChild(ros2Li); // Add it to the list
    
    certificationsList.appendChild(ul);

  } catch (error) {
    console.error('Error loading or parsing certifications data:', error);
    certificationsList.innerHTML = '<p>Error loading certifications. Please check the console.</p>';
  }
}


function loadContactContent() {
  const socialLinks = document.querySelector('#contact .social-links');
  
  socialLinks.innerHTML = `
    <a href="https://www.linkedin.com/in/arne-reabel-72067414a/" target="_blank" class="social-link">
      <i class="fab fa-linkedin-in"></i>
    </a>
    <a href="https://github.com/arnereabel" target="_blank" class="social-link">
      <i class="fab fa-github"></i>
    </a>
    <a href="https://substack.com/@arnereabel" target="_blank" class="social-link">
      <i class="fas fa-rss"></i> <!-- Substack Icon Placeholder -->
    </a>
    <a href="https://x.com/apeekattheworld" target="_blank" class="social-link">
      <i class="fab fa-twitter"></i>
    </a>
    <a href="mailto:arnereabel@gmail.com" class="social-link">
      <i class="fas fa-envelope"></i>
    </a>
  `;
}

// Export functions for use in main.js - add loadCertificationsContent
export { loadAboutContent, loadProjectsContent, loadExperienceContent, loadTravelContent, loadCertificationsContent, loadContactContent };
