/* ==========================================================================
   THE BLACKBOARD WEB PORTAL - APPLICATION LOGIC & INTERACTIVITY
   ========================================================================== */

// --- Global Application State & Datasets ---
let currentRole = 'student'; // 'student' or 'teacher'

// Helper to retrieve logged in user from either localStorage or sessionStorage
function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem('blackboard_logged_in_user')) || 
           JSON.parse(sessionStorage.getItem('blackboard_logged_in_user'));
  } catch (e) {
    return null;
  }
}

// Caches for local drag & drop uploaded video URLs
const uploadedVideoUrls = {};
let selectedVideoFile = null;

// Mock Classes Database Default
const DEFAULT_CLASSES = [
  {
    id: 1,
    title: 'Quantum Entanglement & Spin Systems',
    code: 'PHY-402',
    time: '10:00 AM',
    duration: 90,
    location: 'Auditorium B',
    status: 'active', // 'active', 'upcoming', 'ended'
  },
  {
    id: 2,
    title: 'Relativistic Electrodynamics',
    code: 'PHY-315',
    time: '01:00 PM',
    duration: 90,
    location: 'Seminar Hall 3',
    status: 'upcoming',
  },
  {
    id: 3,
    title: 'Thermodynamics Recap & Open Seminars',
    code: 'PHY-204',
    time: '04:00 PM',
    duration: 60,
    location: 'Webex Virtual Platform',
    status: 'upcoming',
  }
];

let classesData = JSON.parse(localStorage.getItem('blackboard_classes')) || DEFAULT_CLASSES;
if (!localStorage.getItem('blackboard_classes')) {
  localStorage.setItem('blackboard_classes', JSON.stringify(classesData));
}

function saveClasses() {
  localStorage.setItem('blackboard_classes', JSON.stringify(classesData));
  renderAllClasses();
  renderStudentSchedule();
}

window.addEventListener('storage', (e) => {
  if (e.key === 'blackboard_classes') {
    classesData = JSON.parse(e.newValue || '[]');
    renderAllClasses();
    renderStudentSchedule();
  } else if (e.key === 'blackboard_students') {
    studentsData = JSON.parse(e.newValue || '[]');
    renderStudentTable();
    renderAdminAllocations();
    renderAdminStudents();
  } else if (e.key === 'blackboard_teachers') {
    teachersData = JSON.parse(e.newValue || '[]');
    renderAdminTeachers();
    renderAdminAllocations();
  } else if (e.key === 'blackboard_recordings') {
    recordingsData = JSON.parse(e.newValue || '[]');
    renderRecordedClasses();
  }
});

// Mock Teachers Database Default
const DEFAULT_TEACHERS = [
  { id: 201, name: 'Prof. Marcus Vance', email: 'vance@theblackboard.edu', department: 'Quantum Physics', password: 'marcusvance' },
  { id: 202, name: 'Dr. Sarah Jenkins', email: 'jenkins@theblackboard.edu', department: 'Astrophysics', password: 'sarahjenkins' },
  { id: 203, name: 'Dr. Alan Turing', email: 'turing@theblackboard.edu', department: 'Computer Science', password: 'alanturing' }
];

let teachersData = JSON.parse(localStorage.getItem('blackboard_teachers')) || DEFAULT_TEACHERS;
if (!localStorage.getItem('blackboard_teachers')) {
  localStorage.setItem('blackboard_teachers', JSON.stringify(teachersData));
}

// Mock Students Database Default (with teacher assignment and batch)
const DEFAULT_STUDENTS = [
  { id: 101, name: 'Alex Mercer', email: 'alex@theblackboard.edu', grade: 'A', teacherId: 201, batch: 'Alpha Cohort', password: 'alexmercer' },
  { id: 102, name: 'Sarah Connor', email: 'sarah@theblackboard.edu', grade: 'B+', teacherId: 201, batch: 'Alpha Cohort', password: 'sarahconnor' },
  { id: 103, name: 'Bruce Wayne', email: 'bruce@theblackboard.edu', grade: 'A+', teacherId: 202, batch: 'Gamma Batch', password: 'brucewayne' },
  { id: 104, name: 'Dev Patel', email: 'dev@theblackboard.edu', grade: 'A-', teacherId: 202, batch: 'JEE Elite', password: 'devpatel' },
  { id: 105, name: 'Ethan Hunt', email: 'ethan@theblackboard.edu', grade: 'B', teacherId: 203, batch: 'NEET Super-30', password: 'ethanhunt' },
  { id: 106, name: 'Peter Parker', email: 'peter@theblackboard.edu', grade: 'B-', teacherId: null, batch: 'Unassigned', password: 'peterparker' }
];

let studentsData = JSON.parse(localStorage.getItem('blackboard_students')) || DEFAULT_STUDENTS;
if (!localStorage.getItem('blackboard_students')) {
  localStorage.setItem('blackboard_students', JSON.stringify(studentsData));
}

function saveStudents() {
  localStorage.setItem('blackboard_students', JSON.stringify(studentsData));
  renderStudentTable();
  renderAdminAllocations();
  renderAdminStudents();
}

function saveTeachers() {
  localStorage.setItem('blackboard_teachers', JSON.stringify(teachersData));
  renderAdminTeachers();
  renderAdminAllocations(); // allocator dropdowns need teacher updates
}

// Mock Reference Books Database (Student Mode)
let booksData = [
  {
    id: 401,
    title: 'University Physics Vol 1',
    category: 'Class 11',
    subject: 'physics',
    info: 'Mechanics, oscillations, waves, and thermodynamics basics.'
  },
  {
    id: 402,
    title: 'Advanced Physical Chemistry',
    category: 'Class 12',
    subject: 'chemistry',
    info: 'Electrochemistry, chemical kinetics, and surface chemistry.'
  },
  {
    id: 403,
    title: 'Concepts of Physics Vol 2',
    category: 'JEE',
    subject: 'physics',
    info: 'Electromagnetism, optics, and modern quantum systems.'
  },
  {
    id: 404,
    title: 'Organic Chemistry Guide',
    category: 'NEET',
    subject: 'chemistry',
    info: 'Reaction mechanisms, biomolecules, and organic synthesis.'
  },
  {
    id: 405,
    title: 'Coordinate Geometry Mastery',
    category: 'JEE',
    subject: 'maths',
    info: 'Lines, circles, conic sections, and vector calculus.'
  },
  {
    id: 406,
    title: 'Mathematical Physics Tools',
    category: 'NEET',
    subject: 'physics',
    info: 'Differential equations, linear algebra, and complex numbers.'
  },
  {
    id: 407,
    title: 'Higher Algebra Principles',
    category: 'Class 11',
    subject: 'maths',
    info: 'Quadratic equations, sequences, probability, and matrices.'
  },
  {
    id: 408,
    title: 'Modern Organic Synthesis',
    category: 'Class 12',
    subject: 'chemistry',
    info: 'Hydrocarbons, haloalkanes, aldehydes, ketones, and polymers.'
  }
];

// Mock Recorded Classes Library (Student Mode)
let recordingsData = JSON.parse(localStorage.getItem('blackboard_recordings')) || [
  {
    id: 301,
    title: 'Introduction to Quantum Wave Mechanics',
    tag: 'Physics',
    code: 'PHY-101',
    instructor: 'Prof. Marcus Vance',
    duration: '48:15',
    completion: 92,
    sourceType: 'youtube',
    sourceUrl: 'https://www.youtube.com/watch?v=DFfC6Adf1lE'
  },
  {
    id: 302,
    title: 'Cosmology, Singularity & Dark Matter',
    tag: 'Astronomy',
    code: 'AST-310',
    instructor: 'Dr. Sarah Jenkins',
    duration: '56:40',
    completion: 35,
    sourceType: 'youtube',
    sourceUrl: 'https://www.youtube.com/watch?v=33LzdfjY47s'
  },
  {
    id: 303,
    title: 'General Thermodynamics & Recap',
    tag: 'Physics',
    code: 'PHY-204',
    instructor: 'Prof. Marcus Vance',
    duration: '38:10',
    completion: 0,
    sourceType: 'youtube',
    sourceUrl: 'https://www.youtube.com/watch?v=8mG53wI5MUM'
  },
  {
    id: 304,
    title: 'Statistical Physics Fundamentals',
    tag: 'Physics',
    code: 'PHY-312',
    instructor: 'Dr. Sarah Jenkins',
    duration: '52:05',
    completion: 100,
    sourceType: 'file',
    sourceUrl: 'video_phy312_core.mp4'
  }
];

if (!localStorage.getItem('blackboard_recordings')) {
  localStorage.setItem('blackboard_recordings', JSON.stringify(recordingsData));
}

function saveRecordings() {
  localStorage.setItem('blackboard_recordings', JSON.stringify(recordingsData));
  renderRecordedClasses();
}

// --- Dynamic Profile & Dashboard Header Loader ---
function updateUserProfileHeaders() {
  const loggedInUser = getLoggedInUser();
  if (!loggedInUser) return;
  
  if (loggedInUser.role === 'student') {
    const student = studentsData.find(s => s.id === loggedInUser.id) || studentsData.find(s => s.email.toLowerCase() === loggedInUser.email.toLowerCase());
    if (student) {
      const studentDash = document.getElementById('student-dashboard');
      if (studentDash) {
        const avatar = studentDash.querySelector('.active-student-avatar');
        if (avatar) avatar.innerText = student.name.split(' ').map(x => x[0]).join('');
        const nameEl = studentDash.querySelector('.profile-name');
        if (nameEl) nameEl.innerText = student.name;
        const roleEl = studentDash.querySelector('.profile-role');
        if (roleEl) roleEl.innerText = student.email;
      }
      const cohortEl = document.getElementById('student-cohort-batch');
      if (cohortEl) cohortEl.innerText = student.batch || 'Unassigned';
    }
  } else if (loggedInUser.role === 'teacher') {
    const teacher = teachersData.find(t => t.id === loggedInUser.id) || teachersData.find(t => t.email.toLowerCase() === loggedInUser.email.toLowerCase());
    if (teacher) {
      const teacherDash = document.getElementById('teacher-dashboard');
      if (teacherDash) {
        const avatar = teacherDash.querySelector('.avatar.text-avatar');
        if (avatar) avatar.innerText = teacher.name.split(' ').map(x => x[0]).join('');
        const nameEl = teacherDash.querySelector('.profile-name');
        if (nameEl) nameEl.innerText = teacher.name;
        const roleEl = teacherDash.querySelector('.profile-role');
        if (roleEl) roleEl.innerText = teacher.department;
      }
      const deptMetric = document.getElementById('teacher-metric-dept');
      if (deptMetric) deptMetric.innerText = teacher.department;
    }
  }
}

function handleRouting() {
  const hash = window.location.hash || '#/';
  const savedSession = getLoggedInUser();

  const landingSection = document.getElementById('landing-section');
  const loginSection = document.getElementById('login-section');
  const programsPage = document.getElementById('programs-page');
  const studentDash = document.getElementById('student-dashboard');
  const teacherDash = document.getElementById('teacher-dashboard');
  const adminDash = document.getElementById('admin-dashboard');

  // Helper to hide all main SPA views
  const hideAllViews = () => {
    if (landingSection) landingSection.classList.add('hidden');
    if (loginSection) loginSection.classList.add('hidden');
    if (programsPage) programsPage.classList.add('hidden');
    if (studentDash) studentDash.classList.add('hidden');
    if (teacherDash) teacherDash.classList.add('hidden');
    if (adminDash) adminDash.classList.add('hidden');
  };

  if (savedSession) {
    // If logged in, block back-navigation to login or landing.
    const targetHash = '#/' + savedSession.role;
    if (hash !== targetHash) {
      window.location.hash = targetHash;
      return;
    }

    hideAllViews();
    updateUserProfileHeaders();

    if (savedSession.role === 'student') {
      if (studentDash) studentDash.classList.remove('hidden');
      renderStudentSchedule();
      renderBooksLibrary();
      renderRecordedClasses();
    } else if (savedSession.role === 'teacher') {
      if (teacherDash) teacherDash.classList.remove('hidden');
      renderAllClasses();
      renderStudentTable();
    } else if (savedSession.role === 'admin') {
      if (adminDash) adminDash.classList.remove('hidden');
      renderAdminAllocations();
      renderAdminTeachers();
      renderAdminStudents();
      renderAdminInbox();
    }
  } else {
    // No session exists
    if (hash === '#/login') {
      hideAllViews();
      if (loginSection) {
        loginSection.classList.remove('hidden');
        const emailInput = document.getElementById('login-email');
        if (emailInput) emailInput.focus();
      }
    } else if (hash === '#/programs') {
      hideAllViews();
      if (programsPage) {
        programsPage.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    } else if (hash === '#/enquire') {
      hideAllViews();
      if (landingSection) {
        landingSection.classList.remove('hidden');
        const targetEl = document.getElementById('enquire');
        if (targetEl) {
          setTimeout(() => {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    } else if (
      hash === '#/' || 
      hash === '' || 
      hash.startsWith('#about-us') || 
      hash.startsWith('#programs') || 
      hash.startsWith('#achievements') || 
      hash.startsWith('#team') || 
      hash.startsWith('#location') || 
      hash.startsWith('#enquire')
    ) {
      hideAllViews();
      if (landingSection) landingSection.classList.remove('hidden');
      
      // Handle smooth scrolling for anchor links within landing section
      if (hash.startsWith('#') && hash !== '#/' && hash !== '#') {
        const targetId = hash.substring(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          setTimeout(() => {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    } else {
      // Unknown or unauthenticated, default to home page
      window.location.hash = '#/';
    }
  }
}

function setupHeroConsole() {
  const togglesContainer = document.getElementById('console-widget-toggles');
  if (!togglesContainer) return;

  const tabs = togglesContainer.querySelectorAll('.console-tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      // Add active class to clicked tab
      tab.classList.add('active');

      // Hide all panels
      const targetPanelId = tab.getAttribute('data-panel');
      const panels = document.querySelectorAll('#console-widget-display .console-panel');
      panels.forEach(panel => {
        panel.classList.add('hidden');
        panel.classList.remove('active');
      });

      // Show target panel
      const activePanel = document.getElementById(targetPanelId);
      if (activePanel) {
        activePanel.classList.remove('hidden');
        activePanel.classList.add('active');
      }
    });
  });
}

function setupThemeToggle() {
  const toggleButtons = document.querySelectorAll('.theme-toggle-btn');
  
  // Recovery of theme state
  const currentTheme = localStorage.getItem('blackboard_theme') || 'dark';
  if (currentTheme === 'light') {
    document.body.classList.add('light-theme');
    updateThemeIcons(true);
  }

  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-theme');
      localStorage.setItem('blackboard_theme', isLight ? 'light' : 'dark');
      updateThemeIcons(isLight);
      showToast(isLight ? 'Sleek light theme activated.' : 'Obsidian dark theme activated.', 'success');
    });
  });

  function updateThemeIcons(isLight) {
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      const sunIcon = btn.querySelector('.theme-icon-sun');
      const moonIcon = btn.querySelector('.theme-icon-moon');
      if (sunIcon && moonIcon) {
        if (isLight) {
          sunIcon.classList.add('hidden');
          moonIcon.classList.remove('hidden');
        } else {
          sunIcon.classList.remove('hidden');
          moonIcon.classList.add('hidden');
        }
      }
    });
  }
}

function setupLandingTransitions() {
  const btnBackHome = document.getElementById('btn-back-home');
  if (btnBackHome) {
    btnBackHome.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = '#/';
    });
  }

  // Logo home click transition
  const brandLogos = document.querySelectorAll('.landing-navbar .nav-brand, .landing-footer .nav-brand');
  brandLogos.forEach(logo => {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = '#/';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function setupEnquiryForm() {
  const form = document.getElementById('enquiry-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('enquiry-name').value.trim();
    const email = document.getElementById('enquiry-email').value.trim();
    const courseSelect = document.getElementById('enquiry-course');
    const course = courseSelect.options[courseSelect.selectedIndex].text;
    const message = document.getElementById('enquiry-message').value.trim();

    if (!name || !email || !courseSelect.value || !message) {
      showToast('Please fulfill all security enquiry fields.', 'warning');
      return;
    }

    // Loader overlay transition
    const loader = document.getElementById('auth-loader');
    const loaderText = document.getElementById('loader-text');
    if (loader) {
      loader.classList.remove('hidden');
      loaderText.innerText = 'Securing client enquiry...';
    }

    setTimeout(() => {
      if (loaderText) loaderText.innerText = 'Broadcasting client telemetry to Admin...';
    }, 800);

    setTimeout(() => {
      if (loader) loader.classList.add('hidden');

      // Create Simulated Admin Message
      const formattedTime = new Date().toLocaleString();
      const rawSubject = `[LEAD] New Academic Enquiry: ${name}`;
      const mailFrom = `THE BLACKBOARD Core Systems <enquiry@theblackboard.edu>`;
      const mailTo = `Roster Command <admin@theblackboard.edu>`;
      
      const mailBody = `
========================================
THE BLACKBOARD SYSTEM ENQUIRY METRICS
NEW ACADEMIC INQUIRY TELEMETRY DETECTED
========================================

TIMESTAMP: ${formattedTime}
REGISTRY NODE: ENQ-${Date.now().toString().slice(-8)}

APPLICANT DETAILS:
----------------------------------------
Full Name     : ${name}
Contact Email : ${email}
Course Stream : ${course.toUpperCase()}

MESSAGE DETAILED CONTENT:
----------------------------------------
"${message}"

ACTION REQUIRED:
This client enquiry lead requires immediate contact review and evaluation override inside the administrative overrides control deck.

LOG DECRYPTION STATUS: SECURED / ONLINE
========================================
      `.trim();

      const newMsg = {
        id: 'msg-' + Date.now(),
        from: mailFrom,
        to: mailTo,
        subject: rawSubject,
        time: formattedTime,
        body: mailBody,
        read: false,
        senderName: name,
        senderEmail: email,
        senderRole: 'applicant'
      };

      adminMessages.unshift(newMsg);
      saveAdminMessages(); // Sync to storage and inbox UI!

      // Clear form
      form.reset();
      showToast('Enquiry transmitted successfully. Admin alerted!', 'success');
    }, 1800);
  });
}

// --- Bulletproof Initialization ---
const init = () => {
  setupLandingTransitions();
  setupHeroConsole();
  setupEnquiryForm();
  setupRoleToggle();
  setupPasswordToggle();
  setupDemoCredentials();
  setupLoginForm();
  setupNavbarLogout();
  setupDashboardTabs(); // Tab switching logic
  setupThemeToggle(); // Initialize premium theme switching

  // Initialize dynamic content elements
  renderAllClasses();
  renderStudentTable();
  renderBooksLibrary();
  renderRecordedClasses();
  renderStudentSchedule();

  // Set default student cohort batch details dynamically
  const cohortEl = document.getElementById('student-cohort-batch');
  if (cohortEl) {
    const loggedInUser = getLoggedInUser();
    const currentStudentId = loggedInUser && loggedInUser.role === 'student' ? loggedInUser.id : 101;
    const currentStudent = studentsData.find(s => s.id === currentStudentId) || studentsData[0];
    if (currentStudent) {
      cohortEl.innerText = currentStudent.batch || 'Unassigned';
    }
  }

  // Set up filter change listeners
  const filterSubject = document.getElementById('filter-recorded-subject');
  const filterTeacher = document.getElementById('filter-recorded-teacher');
  if (filterSubject) {
    filterSubject.addEventListener('change', () => renderRecordedClasses());
  }
  if (filterTeacher) {
    filterTeacher.addEventListener('change', () => renderRecordedClasses());
  }

  setupTeacherForms();
  setupVideoPublisher(); // Initialize Video Publishing Form
  setupStudentSearch();
  setupGradeModal();
  setupClassModal();
  setupChatbot();
  setupPlayerModal();

  // Initialize Master Admin components
  renderAdminAllocations();
  renderAdminTeachers();
  renderAdminStudents();
  setupAdminForms();
  setupAdminAuthModal();

  // Initialize new Roster Signup & System Inbox elements
  setupFormSwaps();
  setupSignupForm();
  renderAdminInbox();

  // Bind mail clearing
  const purgeAllMailBtn = document.getElementById('btn-clear-all-mail');
  if (purgeAllMailBtn) {
    purgeAllMailBtn.addEventListener('click', () => {
      adminMessages = [];
      saveAdminMessages();
      showToast('All administrative notifications purged.', 'success');
    });
  }

  // Register hash routing listener and trigger initial route
  window.addEventListener('hashchange', handleRouting);
  handleRouting();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
// ==========================================================================
// TOAST NOTIFICATION SYSTEM
// ==========================================================================
function showToast(message, type = 'warning') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'success' ? 'toast-success' : ''}`;
  
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="toast-icon-success">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.75 3.75 0 0 1 21 12Z" />
      </svg>`;
  } else {
    iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="toast-icon-warning">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>`;
  }

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-message">${message}</div>
  `;
  
  container.appendChild(toast);
  
  // Fade out and remove toast after 3 seconds
  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 3200);
}

// ==========================================================================
// AUTHENTICATION INTERACTIVE STATES (LOGIN)
// ==========================================================================

// Toggle between Student, Teacher, & Admin portal view styling
function setupRoleToggle() {
  const tabStudent = document.getElementById('tab-student');
  const tabTeacher = document.getElementById('tab-teacher');
  const tabAdmin = document.getElementById('tab-admin');
  const headerTitle = document.getElementById('login-header-title');
  const headerDesc = document.getElementById('login-header-desc');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');

  const selectStudent = () => {
    currentRole = 'student';
    tabStudent.classList.add('active');
    tabTeacher.classList.remove('active');
    
    headerTitle.innerText = 'Welcome Student!';
    if (headerDesc) {
      headerDesc.innerText = 'Enter your credentials to access your class schedule, interactive chatbot, and recorded lectures.';
    }
    
    clearAuthErrors();
    emailInput.value = '';
    passwordInput.value = '';
  };

  const selectTeacher = () => {
    currentRole = 'teacher';
    tabTeacher.classList.add('active');
    tabStudent.classList.remove('active');
    
    headerTitle.innerText = 'Welcome Teacher!';
    if (headerDesc) {
      headerDesc.innerText = 'Verify your academic tenure credentials to publish schedules, manage records, and audit classes.';
    }
    
    clearAuthErrors();
    emailInput.value = '';
    passwordInput.value = '';
  };

  const selectAdmin = () => {
    currentRole = 'admin';
    tabStudent.classList.remove('active');
    tabTeacher.classList.remove('active');
    
    headerTitle.innerText = 'Master Control Hub';
    if (headerDesc) {
      headerDesc.innerText = 'Authorized Administrator entry terminal. Synchronize systems, oversee rosters, and direct curriculum nodes.';
    }
    
    clearAuthErrors();
    emailInput.value = 'admin@theblackboard.edu';
    passwordInput.value = 'adminpassword';
    showToast('Admin credentials preloaded', 'success');
  };

  tabStudent.addEventListener('click', () => {
    if (currentRole === 'student') return;
    selectStudent();
  });

  tabTeacher.addEventListener('click', () => {
    if (currentRole === 'teacher') return;
    selectTeacher();
  });

  if (tabAdmin) {
    tabAdmin.addEventListener('click', () => {
      const authModal = document.getElementById('admin-auth-modal');
      const passcodeField = document.getElementById('admin-auth-passcode');
      if (authModal) {
        authModal.classList.remove('hidden');
        if (passcodeField) {
          passcodeField.value = '';
          passcodeField.focus();
        }
      }
    });
  }
}

// Show/Hide Password Visibility Toggle
function setupPasswordToggle() {
  const toggleBtn = document.getElementById('password-toggle');
  const passwordInput = document.getElementById('login-password');
  const eyeOpen = document.getElementById('eye-open-icon');
  const eyeClosed = document.getElementById('eye-closed-icon');

  toggleBtn.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      eyeOpen.classList.add('hidden');
      eyeClosed.classList.remove('hidden');
    } else {
      passwordInput.type = 'password';
      eyeOpen.classList.remove('hidden');
      eyeClosed.classList.add('hidden');
    }
  });
}

// Demonstration Credential Autofillers
function setupDemoCredentials() {
  const demoStudent = document.getElementById('demo-student-btn');
  const demoTeacher = document.getElementById('demo-teacher-btn');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');

  demoStudent.addEventListener('click', () => {
    if (currentRole !== 'student') {
      document.getElementById('tab-student').click();
    }
    emailInput.value = 'alex@theblackboard.edu';
    passwordInput.value = 'alexmercer';
    clearAuthErrors();
    showToast('Student credentials preloaded', 'success');
  });

  demoTeacher.addEventListener('click', () => {
    if (currentRole !== 'teacher') {
      document.getElementById('tab-teacher').click();
    }
    emailInput.value = 'vance@theblackboard.edu';
    passwordInput.value = 'marcusvance';
    clearAuthErrors();
    showToast('Faculty credentials preloaded', 'success');
  });
}

// Clear error outlines and messages
function clearAuthErrors() {
  document.getElementById('login-email').parentElement.classList.remove('error-state');
  document.getElementById('login-password').parentElement.classList.remove('error-state');
  document.getElementById('email-error').style.display = 'none';
  document.getElementById('password-error').style.display = 'none';
}

// Custom client-side validation and authentication simulation
function setupLoginForm() {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAuthErrors();
    
    let hasError = false;
    
    // Simple Email verification
    const emailVal = emailInput.value.trim();
    if (!emailVal || !emailVal.includes('@') || emailVal.length < 5) {
      emailInput.parentElement.classList.add('error-state');
      document.getElementById('email-error').innerText = 'Please enter a valid academic email address.';
      document.getElementById('email-error').style.display = 'block';
      hasError = true;
    }
    
    // Simple Password check (min 6 chars)
    if (passwordInput.value.length < 6) {
      passwordInput.parentElement.classList.add('error-state');
      document.getElementById('password-error').innerText = 'Password must contain at least 6 characters.';
      document.getElementById('password-error').style.display = 'block';
      hasError = true;
    }

    // Authenticate existence and security password in local storage database
    if (!hasError) {
      const emailLower = emailVal.toLowerCase();
      const enteredPassword = passwordInput.value;
      if (currentRole === 'student') {
        const student = studentsData.find(s => s.email.toLowerCase() === emailLower);
        if (!student) {
          emailInput.parentElement.classList.add('error-state');
          document.getElementById('email-error').innerText = 'Student record not found. Please register to sign up.';
          document.getElementById('email-error').style.display = 'block';
          hasError = true;
        } else if (student.password && student.password !== enteredPassword) {
          passwordInput.parentElement.classList.add('error-state');
          document.getElementById('password-error').innerText = 'Incorrect security password.';
          document.getElementById('password-error').style.display = 'block';
          hasError = true;
        }
      } else if (currentRole === 'teacher') {
        const teacher = teachersData.find(t => t.email.toLowerCase() === emailLower);
        if (!teacher) {
          emailInput.parentElement.classList.add('error-state');
          document.getElementById('email-error').innerText = 'Faculty member record not found. Please verify spelling.';
          document.getElementById('email-error').style.display = 'block';
          hasError = true;
        } else if (teacher.password && teacher.password !== enteredPassword) {
          passwordInput.parentElement.classList.add('error-state');
          document.getElementById('password-error').innerText = 'Incorrect security password.';
          document.getElementById('password-error').style.display = 'block';
          hasError = true;
        }
      }
    }
    
    // Shaker UI Trigger if details are invalid
    if (hasError) {
      const card = document.querySelector('.login-card');
      card.classList.add('shake-effect');
      card.addEventListener('animationend', () => {
        card.classList.remove('shake-effect');
      }, { once: true });
      showToast('Validation failed. Check error alerts.', 'warning');
      return;
    }
    
    // Trigger successful auth loading experience
    const loader = document.getElementById('auth-loader');
    const loaderText = document.getElementById('loader-text');
    loader.classList.remove('hidden');
    loaderText.innerText = 'Securing quantum session...';
    
    setTimeout(() => {
      loaderText.innerText = 'Decrypting database logs...';
    }, 1000);

    setTimeout(() => {
      // Exit Auth and transition in the Dashboards
      loader.classList.add('hidden');
      
      const emailLower = emailInput.value.trim().toLowerCase();
      const rememberMe = document.getElementById('remember-me') ? document.getElementById('remember-me').checked : false;
      
      if (currentRole === 'student') {
        const student = studentsData.find(s => s.email.toLowerCase() === emailLower) || studentsData[0];
        const sessionObj = { id: student.id, name: student.name, email: student.email, role: 'student' };
        if (rememberMe) {
          localStorage.setItem('blackboard_logged_in_user', JSON.stringify(sessionObj));
          sessionStorage.removeItem('blackboard_logged_in_user');
        } else {
          sessionStorage.setItem('blackboard_logged_in_user', JSON.stringify(sessionObj));
          localStorage.removeItem('blackboard_logged_in_user');
        }
        window.location.hash = '#/student';
        showToast('Decryption complete. Student authorization verified.', 'success');
      } else if (currentRole === 'teacher') {
        const teacher = teachersData.find(t => t.email.toLowerCase() === emailLower) || teachersData[0];
        const sessionObj = { id: teacher.id, name: teacher.name, email: teacher.email, role: 'teacher' };
        if (rememberMe) {
          localStorage.setItem('blackboard_logged_in_user', JSON.stringify(sessionObj));
          sessionStorage.removeItem('blackboard_logged_in_user');
        } else {
          sessionStorage.setItem('blackboard_logged_in_user', JSON.stringify(sessionObj));
          localStorage.removeItem('blackboard_logged_in_user');
        }
        window.location.hash = '#/teacher';
        showToast('Decryption complete. Faculty credentials certified.', 'success');
      }
    }, 2000);
  });
}

// Log Out triggers
function setupNavbarLogout() {
  const studentLogout = document.getElementById('student-logout');
  const teacherLogout = document.getElementById('teacher-logout');
  const adminLogout = document.getElementById('admin-logout');
  const loader = document.getElementById('auth-loader');
  const loaderText = document.getElementById('loader-text');

  const performLogout = () => {
    loader.classList.remove('hidden');
    loaderText.innerText = 'Terminating session...';
    
    setTimeout(() => {
      loader.classList.add('hidden');
      localStorage.removeItem('blackboard_logged_in_user');
      sessionStorage.removeItem('blackboard_logged_in_user');
      resetDashboardTabs(); // Reset tabs state upon logout
      window.location.hash = '#/';
      showToast('Terminated. Relogin to reconnect.', 'warning');
    }, 1200);
  };

  if (studentLogout) studentLogout.addEventListener('click', performLogout);
  if (teacherLogout) teacherLogout.addEventListener('click', performLogout);
  if (adminLogout) adminLogout.addEventListener('click', performLogout);
}

// Tab Switching Controller for both Student and Teacher dashboards
function setupDashboardTabs() {
  const tabs = document.querySelectorAll('.dash-tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const role = tab.getAttribute('data-role');
      const targetId = tab.getAttribute('data-target');
      
      // Get all tabs and panels for this dashboard (based on role)
      const dashboard = document.getElementById(`${role}-dashboard`);
      if (!dashboard) return;
      
      const dashTabs = dashboard.querySelectorAll('.dash-tab');
      const dashPanels = dashboard.querySelectorAll('.tab-panel');
      
      // Deactivate all sibling tabs for this role
      dashTabs.forEach(t => t.classList.remove('active'));
      // Activate clicked tab
      tab.classList.add('active');
      
      // Hide all panels for this role
      dashPanels.forEach(p => {
        p.classList.add('hidden');
        p.classList.remove('active');
      });
      // Show targeted panel
      const activePanel = document.getElementById(targetId);
      if (activePanel) {
        activePanel.classList.remove('hidden');
        activePanel.classList.add('active');
      }
    });
  });
}

// Reset Tab States to Defaults (First Tab Active)
function resetDashboardTabs() {
  // Reset teacher dashboard tabs
  const teacherTabs = document.querySelectorAll('#teacher-dashboard .dash-tab');
  const teacherPanels = document.querySelectorAll('#teacher-dashboard .tab-panel');
  teacherTabs.forEach((tab, index) => {
    if (index === 0) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  teacherPanels.forEach((panel, index) => {
    if (index === 0) {
      panel.classList.remove('hidden');
      panel.classList.add('active');
    } else {
      panel.classList.add('hidden');
      panel.classList.remove('active');
    }
  });

  // Reset student dashboard tabs
  const studentTabs = document.querySelectorAll('#student-dashboard .dash-tab');
  const studentPanels = document.querySelectorAll('#student-dashboard .tab-panel');
  studentTabs.forEach((tab, index) => {
    if (index === 0) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  studentPanels.forEach((panel, index) => {
    if (index === 0) {
      panel.classList.remove('hidden');
      panel.classList.add('active');
    } else {
      panel.classList.add('hidden');
      panel.classList.remove('active');
    }
  });

  // Reset admin dashboard tabs
  const adminTabs = document.querySelectorAll('#admin-dashboard .dash-tab');
  const adminPanels = document.querySelectorAll('#admin-dashboard .tab-panel');
  adminTabs.forEach((tab, index) => {
    if (index === 0) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  adminPanels.forEach((panel, index) => {
    if (index === 0) {
      panel.classList.remove('hidden');
      panel.classList.add('active');
    } else {
      panel.classList.add('hidden');
      panel.classList.remove('active');
    }
  });
}


// ==========================================================================
// TEACHER DASHBOARD IMPLEMENTATION (SCHEDULES, CREATION, STUDENT DIRECTORY)
// ==========================================================================

// Render general scheduled lectures
function renderAllClasses() {
  const container = document.getElementById('teacher-class-list');
  if (!container) return;
  container.innerHTML = '';
  
  classesData.forEach(item => {
    const card = document.createElement('div');
    card.className = 'class-card';
    card.setAttribute('data-id', item.id);
    
    let statusClass = 'status-upcoming';
    if (item.status === 'active') statusClass = 'status-active';
    if (item.status === 'ended') statusClass = 'status-ended';
    
    card.innerHTML = `
      <div class="class-details">
        <h4 class="class-card-title">${item.title}</h4>
        <div class="class-card-meta">
          <span class="meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 8.25h15m-15 3h15m-15 3h15m-15 3h15" />
            </svg>
            ${item.code}
          </span>
          <span class="meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0Z" />
            </svg>
            ${item.time} (${item.duration}m)
          </span>
          <span class="meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0Z" />
            </svg>
            ${item.location}
          </span>
        </div>
      </div>
      <div class="class-status-box">
        <span class="status-indicator ${statusClass}">${item.status}</span>
        <div class="card-actions-row" style="margin-top: 8px;">
          <button class="card-dots-btn" title="More Options">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </button>
          <button class="card-remove-btn delete-class-btn" data-id="${item.id}" title="Remove Class">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
  
  // Keep badges synced
  const listCount = document.getElementById('class-list-count');
  if (listCount) listCount.innerText = `${classesData.length} scheduled`;
  const classesToday = document.getElementById('count-classes-today');
  if (classesToday) classesToday.innerText = classesData.filter(x => x.status !== 'ended').length;
  
  // Setup delete buttons
  container.querySelectorAll('.delete-class-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.getAttribute('data-id'));
      deleteClass(id);
    });
  });

  // Setup three dots button triggers for custom context menu
  container.querySelectorAll('.card-dots-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.class-card');
      const id = parseInt(card.getAttribute('data-id'));
      const rect = btn.getBoundingClientRect();
      openContextMenu(id, rect.left, rect.bottom + window.scrollY);
    });
  });

  // Setup right click context menu on card
  container.querySelectorAll('.class-card').forEach(card => {
    card.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = parseInt(card.getAttribute('data-id'));
      openContextMenu(id, e.clientX, e.clientY);
    });
  });
}

// Setup Class Creation Form submission
function setupTeacherForms() {
  const form = document.getElementById('create-class-form');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('class-title').value.trim();
    const subject = document.getElementById('class-subject').value.trim();
    const timeVal = document.getElementById('class-time').value;
    const duration = parseInt(document.getElementById('class-duration').value);
    const location = document.getElementById('class-location').value.trim();
    
    // Format time from 24h input to standard 12h representation
    let [hours, minutes] = timeVal.split(':');
    hours = parseInt(hours);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 hours translates to 12
    const timeString = `${hours}:${minutes} ${ampm}`;

    const newClass = {
      id: classesData.reduce((max, c) => c.id > max ? c.id : max, 0) + 1,
      title: title,
      code: subject.toUpperCase(),
      time: timeString,
      duration: duration,
      location: location,
      status: 'upcoming'
    };
    
    // Add to schedule array and render
    classesData.push(newClass);
    saveClasses();
    
    // Clean inputs
    form.reset();
    showToast(`Successfully scheduled: ${title}`, 'success');
  });
}

// Render dynamic student directory table (Filtered dynamically to logged-in mentor teacher roster)
function renderStudentTable(filteredStudents = null) {
  const tableBody = document.getElementById('student-table-body');
  if (!tableBody) return;
  tableBody.innerHTML = '';
  
  // Dynamically query current logged teacher's ID
  const loggedInUser = getLoggedInUser();
  const activeTeacherId = loggedInUser && loggedInUser.role === 'teacher' ? loggedInUser.id : 201;
  
  const assignedStudents = studentsData.filter(student => student.teacherId === activeTeacherId);
  const displayStudents = filteredStudents !== null ? filteredStudents : assignedStudents;
  
  if (displayStudents.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--color-text-muted); padding: 30px;">No students assigned to your portal.</td></tr>`;
    const countEl = document.getElementById('count-total-students');
    if (countEl) countEl.innerText = '0';
    return;
  }
  
  displayStudents.forEach(student => {
    const row = document.createElement('tr');
    
    // Custom grade badges
    let gradeClass = 'grade-good';
    if (student.grade.includes('A')) gradeClass = 'grade-excellent';
    if (student.grade.includes('F') || student.grade.includes('D')) gradeClass = 'grade-poor';
    
    row.innerHTML = `
      <td>
        <div class="table-user">
          <div class="avatar text-avatar active-student-avatar" style="width: 32px; height: 32px; font-size: 0.8rem;">
            ${student.name.split(' ').map(x => x[0]).join('')}
          </div>
          <div class="table-user-info">
            <span class="table-user-name">${student.name}</span>
            <span class="table-user-email">${student.email}</span>
          </div>
        </div>
      </td>
      <td>
        <span class="grade-badge ${gradeClass}">${student.grade}</span>
      </td>
      <td>
        <button class="action-icon-btn edit-student-btn" data-id="${student.id}" title="Audit Grade Record">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.013a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
  
  // Keep metrics count updated
  const countEl = document.getElementById('count-total-students');
  if (countEl) countEl.innerText = assignedStudents.length;
}

// Live student searches
function setupStudentSearch() {
  const searchInput = document.getElementById('student-search-input');
  if (!searchInput) return;
  
  searchInput.addEventListener('keyup', (e) => {
    const query = e.target.value.toLowerCase().trim();
    // Dynamically query current logged teacher's ID
    const loggedInUser = getLoggedInUser();
    const activeTeacherId = loggedInUser && loggedInUser.role === 'teacher' ? loggedInUser.id : 201;
    
    const assignedStudents = studentsData.filter(student => student.teacherId === activeTeacherId);
    const filtered = assignedStudents.filter(student => 
      student.name.toLowerCase().includes(query) || 
      student.email.toLowerCase().includes(query) || 
      student.grade.toLowerCase() === query
    );
    renderStudentTable(filtered);
  });
}

// Student record editor (Grade updates, attendance removed)
function setupGradeModal() {
  const modal = document.getElementById('grade-modal');
  const closeBtn = document.getElementById('close-grade-modal');
  const cancelBtn = document.getElementById('cancel-grade-modal');
  const form = document.getElementById('grade-update-form');
  
  if (!modal || !closeBtn || !cancelBtn || !form) return;

  // Open modal triggers dynamically from student table
  document.getElementById('student-table-body').addEventListener('click', (e) => {
    const btn = e.target.closest('.edit-student-btn');
    if (!btn) return;
    
    const studentId = parseInt(btn.getAttribute('data-id'));
    const student = studentsData.find(x => x.id === studentId);
    
    if (student) {
      document.getElementById('modal-student-id').value = student.id;
      document.getElementById('modal-student-name').value = student.name;
      document.getElementById('modal-student-grade').value = student.grade;
      
      modal.classList.remove('hidden');
    }
  });

  const closeModal = () => modal.classList.add('hidden');
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  
  // Handle submission update
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById('modal-student-id').value);
    const grade = document.getElementById('modal-student-grade').value;
    
    const student = studentsData.find(x => x.id === id);
    if (student) {
      student.grade = grade;
      
      renderStudentTable();
      closeModal();
      showToast(`Updated profile record of: ${student.name}`, 'success');
    }
  });
}


// ==========================================================================
// STUDENT DASHBOARD IMPLEMENTATION (SCHEDULES, BOOKINGS, AI CO-PILOT, MEDIA)
// ==========================================================================

// Render student's active schedules
function renderStudentSchedule() {
  const container = document.getElementById('student-schedule-list');
  container.innerHTML = '';
  
  // Filter active and upcoming classes to display on active student schedule
  const activeClasses = classesData.filter(x => x.status !== 'ended');
  
  if (activeClasses.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--color-text-muted); padding: 30px;">Your schedule is free for today!</div>`;
    return;
  }

  activeClasses.forEach(item => {
    const card = document.createElement('div');
    card.className = 'class-card';
    
    let statusClass = item.status === 'active' ? 'status-active' : 'status-upcoming';
    
    card.innerHTML = `
      <div class="class-details">
        <h4 class="class-card-title">${item.title}</h4>
        <div class="class-card-meta">
          <span class="meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 8.25h15m-15 3h15m-15 3h15m-15 3h15" />
            </svg>
            ${item.code}
          </span>
          <span class="meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0Z" />
            </svg>
            ${item.time}
          </span>
          <span class="meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0Z" />
            </svg>
            ${item.location}
          </span>
        </div>
      </div>
      <div class="class-status-box">
        <span class="status-indicator ${statusClass}">${item.status}</span>
        ${item.status === 'active' ? `<a href="#" class="join-link">Enter Lecture Node <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg></a>` : ''}
      </div>
    `;
    container.appendChild(card);
  });
}

// Render dynamic reference books library grouped by categories inside an accordion container
function renderBooksLibrary() {
  const container = document.getElementById('student-books-list');
  if (!container) return;
  container.innerHTML = '';
  
  // Set main container class to books-accordion
  container.className = 'books-accordion';

  // Group books by category
  const categories = ['Class 11', 'Class 12', 'NEET', 'JEE'];
  
  categories.forEach(cat => {
    const catBooks = booksData.filter(b => b.category === cat);
    if (catBooks.length === 0) return;

    const accordionItem = document.createElement('div');
    accordionItem.className = 'accordion-item';
    // Class 12 is expanded by default
    if (cat === 'Class 12') {
      accordionItem.classList.add('active');
    }

    // SVG Chevron Icon
    const chevronSvg = `
      <svg class="accordion-chevron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    `;

    const header = document.createElement('div');
    header.className = 'accordion-header';
    header.innerHTML = `
      <h3>${cat} <span class="category-badge">${catBooks.length} books</span></h3>
      ${chevronSvg}
    `;

    const content = document.createElement('div');
    content.className = 'accordion-content';

    const booksGrid = document.createElement('div');
    booksGrid.className = 'accordion-books-grid';

    catBooks.forEach(item => {
      const card = document.createElement('div');
      card.className = 'book-card';
      
      let coverClass = 'cover-physics';
      if (item.subject === 'chemistry') coverClass = 'cover-chemistry';
      if (item.subject === 'maths') coverClass = 'cover-maths';
      
      card.innerHTML = `
        <div class="book-cover-container">
          <div class="book-cover ${coverClass}">
            <span class="cover-badge">${item.category}</span>
            <h5 class="cover-title">${item.title}</h5>
          </div>
        </div>
        <div class="book-details">
          <div class="book-header-group">
            <span class="book-category">${item.category} &bull; ${item.subject.toUpperCase()}</span>
            <h4 class="book-title">${item.title}</h4>
            <p class="book-info-text">${item.info}</p>
          </div>
          <button class="read-btn" data-id="${item.id}" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            <span>Read Digital Book</span>
          </button>
        </div>
      `;
      booksGrid.appendChild(card);
    });

    content.appendChild(booksGrid);
    accordionItem.appendChild(header);
    accordionItem.appendChild(content);
    container.appendChild(accordionItem);

    // Toggle active status on header click
    header.addEventListener('click', () => {
      accordionItem.classList.toggle('active');
    });
  });

  // Setup read action triggers
  container.querySelectorAll('.read-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(btn.getAttribute('data-id'));
      const book = booksData.find(x => x.id === id);
      if (book) {
        // Increment student library access metric count
        const booksMetric = document.getElementById('count-student-books');
        if (booksMetric) {
          booksMetric.innerText = parseInt(booksMetric.innerText) + 1;
        }
        showToast(`Opening digital reader node: ${book.title}...`, 'success');
      }
    });
  });
}

// Delete Class function
function deleteClass(classId) {
  const classItem = classesData.find(x => x.id === classId);
  if (!classItem) return;
  
  classesData = classesData.filter(x => x.id !== classId);
  
  saveClasses();
  
  showToast(`Removed lecture: ${classItem.title}`, 'success');
}

// Open context menu function
function openContextMenu(classId, x, y) {
  // Remove existing context menu if any
  closeContextMenu();
  
  const classItem = classesData.find(x => x.id === classId);
  if (!classItem) return;
  
  const menu = document.createElement('div');
  menu.className = 'custom-context-menu';
  menu.id = 'active-context-menu';
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  
  menu.innerHTML = `
    <div class="context-menu-item edit-item">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.013a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
      </svg>
      <span>Edit Details</span>
    </div>
    <div class="context-menu-item delete-item">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
      </svg>
      <span>Remove Schedule</span>
    </div>
  `;
  
  document.body.appendChild(menu);
  
  // Bind actions
  menu.querySelector('.edit-item').addEventListener('click', () => {
    closeContextMenu();
    openClassEditModal(classId);
  });
  
  menu.querySelector('.delete-item').addEventListener('click', () => {
    closeContextMenu();
    deleteClass(classId);
  });
}

// Close context menu function
function closeContextMenu() {
  const menu = document.getElementById('active-context-menu');
  if (menu) menu.remove();
}

// Click anywhere else to close context menu
document.addEventListener('click', () => {
  closeContextMenu();
});

// Setup Class Modal editing overlays
function setupClassModal() {
  const modal = document.getElementById('class-modal');
  const closeBtn = document.getElementById('close-class-modal');
  const cancelBtn = document.getElementById('cancel-class-modal');
  const form = document.getElementById('class-update-form');
  
  if (!modal || !closeBtn || !cancelBtn || !form) return;
  
  const closeModal = () => modal.classList.add('hidden');
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('modal-class-id').value);
    const title = document.getElementById('modal-class-title').value.trim();
    const subject = document.getElementById('modal-class-subject').value.trim();
    const time = document.getElementById('modal-class-time').value.trim();
    const duration = parseInt(document.getElementById('modal-class-duration').value);
    const location = document.getElementById('modal-class-location').value.trim();
    
    const item = classesData.find(x => x.id === id);
    if (item) {
      item.title = title;
      item.code = subject.toUpperCase();
      item.time = time;
      item.duration = duration;
      item.location = location;
      
      saveClasses();
      closeModal();
      showToast(`Updated scheduled lecture: ${title}`, 'success');
    }
  });
}

// Open class editing modal with prepopulated values
function openClassEditModal(classId) {
  const modal = document.getElementById('class-modal');
  const item = classesData.find(x => x.id === classId);
  if (!item || !modal) return;
  
  document.getElementById('modal-class-id').value = item.id;
  document.getElementById('modal-class-title').value = item.title;
  document.getElementById('modal-class-subject').value = item.code;
  document.getElementById('modal-class-time').value = item.time;
  document.getElementById('modal-class-duration').value = item.duration;
  document.getElementById('modal-class-location').value = item.location;
  
  modal.classList.remove('hidden');
}

// ==================== AI CO-PILOT CHATBOT SYSTEM ====================

function setupChatbot() {
  const chatBox = document.getElementById('chatbot-chat-box');
  const form = document.getElementById('chatbot-input-form');
  const input = document.getElementById('chatbot-user-input');
  
  // Custom academic simulated triggers
  const chatbotReplies = {
    'next physics class': 'Hi Alex! Your next class on *PHY-402: Quantum Entanglement* with Prof. Marcus Vance is scheduled for **10:00 AM today** in Auditorium B.',
    'how to book a class': 'We have replaced the elective bookings tab with a comprehensive **Academic Reference Books Library**! You can access dynamic textbook resources for Class 11, Class 12, NEET, and JEE directly from the library tab on your dashboard. Simply click \'Read Digital Book\' to open a textbook.',
    'phy-402 teacher': 'The lecture on *PHY-402* is taught by Prof. Marcus Vance. Tomorrow\'s session will focus on *Quantum Superposition and Circuits* at 10:00 AM.'
  };

  const addMessage = (text, sender = 'user') => {
    const bubble = document.createElement('div');
    bubble.className = `chat-message ${sender}`;
    bubble.innerHTML = `<div class="message-content">${text}</div>`;
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
  };

  const handleBotResponse = (userQuery) => {
    // Render loading indicator bubble
    const loadingBubble = document.createElement('div');
    loadingBubble.className = 'chat-message bot';
    loadingBubble.id = 'chatbot-loading-bubble';
    loadingBubble.innerHTML = `
      <div class="typing-bubble">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    `;
    chatBox.appendChild(loadingBubble);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Simulate thinking time
    setTimeout(() => {
      loadingBubble.remove();
      
      const queryLower = userQuery.toLowerCase();
      let response = "Interesting query, Alex! I've logged this academic request. If you need details on your grades, schedule, or class resources, let me know! THE BLACKBOARD is here to help.";
      
      // Check query matchings
      if (queryLower.includes('physics') || queryLower.includes('phy-402') || queryLower.includes('next class')) {
        response = chatbotReplies['next physics class'];
      } else if (queryLower.includes('book') || queryLower.includes('library') || queryLower.includes('textbook') || queryLower.includes('read')) {
        response = chatbotReplies['how to book a class'];
      } else if (queryLower.includes('professor') || queryLower.includes('teacher') || queryLower.includes('marcus')) {
        response = chatbotReplies['phy-402 teacher'];
      }
      
      addMessage(response, 'bot');
    }, 1200);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    
    addMessage(text, 'user');
    input.value = '';
    
    handleBotResponse(text);
  });

  // Suggestion Chips binding
  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const question = chip.getAttribute('data-question');
      addMessage(question, 'user');
      handleBotResponse(question);
    });
  });
}

// Render available recorded lecture video list cards with subject and teacher filters
function renderRecordedClasses() {
  const container = document.getElementById('student-recorded-list');
  if (!container) return;
  container.innerHTML = '';
  
  // Populate teacher dropdown dynamically
  const filterTeacher = document.getElementById('filter-recorded-teacher');
  if (filterTeacher) {
    const currentSelection = filterTeacher.value;
    filterTeacher.innerHTML = '<option value="All">All Instructors</option>';
    
    // Gather unique instructors from BOTH recordingsData and teachersData to ensure all current faculty are listed
    const instructorsSet = new Set();
    recordingsData.forEach(r => {
      if (r.instructor) instructorsSet.add(r.instructor);
    });
    teachersData.forEach(t => {
      if (t.name) instructorsSet.add(t.name);
    });
    
    const uniqueInstructors = Array.from(instructorsSet).sort();
    uniqueInstructors.forEach(inst => {
      const option = document.createElement('option');
      option.value = inst;
      option.innerText = inst;
      filterTeacher.appendChild(option);
    });
    
    // Restore selection if it exists
    if (Array.from(filterTeacher.options).some(opt => opt.value === currentSelection)) {
      filterTeacher.value = currentSelection;
    } else {
      filterTeacher.value = 'All';
    }
  }

  // Get filter values
  const filterSubject = document.getElementById('filter-recorded-subject');
  const subjectVal = filterSubject ? filterSubject.value : 'All';
  const teacherVal = filterTeacher ? filterTeacher.value : 'All';

  // Apply filters
  const filteredRecordings = recordingsData.filter(item => {
    const matchesSubject = (subjectVal === 'All' || item.tag.toLowerCase() === subjectVal.toLowerCase() || (subjectVal === 'Maths' && item.tag.toLowerCase() === 'mathematics'));
    const matchesTeacher = (teacherVal === 'All' || item.instructor === teacherVal);
    return matchesSubject && matchesTeacher;
  });

  if (filteredRecordings.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--color-text-muted); padding: 30px; width: 100%; grid-column: 1 / -1;">No recorded lectures matching selected filters.</div>`;
    return;
  }

  filteredRecordings.forEach(item => {
    const card = document.createElement('div');
    card.className = 'recorded-card';
    
    // Wave visual representation based on video ID for aesthetic variation
    const waveCount = 4;
    let waveHtml = '';
    for (let i = 1; i <= waveCount; i++) {
      waveHtml += `<div class="poster-wave wave-${i}"></div>`;
    }
    
    card.innerHTML = `
      <div class="recorded-poster">
        <div class="poster-canvas">
          ${waveHtml}
        </div>
        <button class="video-play-btn play-video-btn" data-id="${item.id}" title="Launch Stream">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
        <span class="video-duration">${item.duration}</span>
      </div>
      <div class="recorded-content">
        <span class="recorded-tag">${item.tag} &bull; ${item.code}</span>
        <h4 class="recorded-title">${item.title}</h4>
        <span class="recorded-instructor">${item.instructor}</span>
        <div class="progress-track" style="margin-top: 10px;">
          <div class="progress-fill" style="width: ${item.completion}%; background-color: var(--color-yellow-primary);"></div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Setup teacher recorded lecture video publishing form
function setupVideoPublisher() {
  const form = document.getElementById('publish-lecture-form');
  const sourceTypeSelect = document.getElementById('publish-source-type');
  const wrapperYoutube = document.getElementById('publish-wrapper-youtube');
  const wrapperFile = document.getElementById('publish-wrapper-file');
  const inputYoutube = document.getElementById('publish-youtube-url');
  
  const dropzone = document.getElementById('video-dropzone');
  const fileInput = document.getElementById('publish-file-input');

  if (!form || !sourceTypeSelect) return;

  sourceTypeSelect.addEventListener('change', () => {
    const type = sourceTypeSelect.value;
    if (type === 'youtube') {
      wrapperYoutube.classList.remove('hidden');
      wrapperFile.classList.add('hidden');
      inputYoutube.setAttribute('required', 'true');
    } else {
      wrapperYoutube.classList.add('hidden');
      wrapperFile.classList.remove('hidden');
      inputYoutube.removeAttribute('required');
    }
  });

  // Setup drag and drop / browse events
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', (e) => {
      if (e.target.closest('#btn-remove-video')) return;
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleSelectedFile(e.target.files[0]);
      }
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('drag-over');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      if (e.dataTransfer.files.length > 0) {
        handleSelectedFile(e.dataTransfer.files[0]);
      }
    });
  }

  function handleSelectedFile(file) {
    if (!file.type.startsWith('video/')) {
      showToast('Invalid file type. Please upload a video file.', 'warning');
      return;
    }
    selectedVideoFile = file;
    const objectUrl = URL.createObjectURL(file);
    uploadedVideoUrls[file.name] = objectUrl;
    
    document.getElementById('uploaded-filename-display').innerText = file.name;
    document.getElementById('dropzone-default-state').classList.add('hidden');
    document.getElementById('dropzone-success-state').classList.remove('hidden');
  }

  const removeBtn = document.getElementById('btn-remove-video');
  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedVideoFile = null;
      fileInput.value = '';
      document.getElementById('dropzone-default-state').classList.remove('hidden');
      document.getElementById('dropzone-success-state').classList.add('hidden');
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('publish-title').value.trim();
    const code = document.getElementById('publish-code').value.trim().toUpperCase();
    const tag = document.getElementById('publish-subject').value;
    const duration = document.getElementById('publish-duration').value.trim();
    const sourceType = sourceTypeSelect.value;
    let sourceUrl = '';

    if (sourceType === 'youtube') {
      sourceUrl = inputYoutube.value.trim();
    } else {
      if (!selectedVideoFile) {
        showToast('Please upload a video file first via drag-and-drop or browse.', 'warning');
        return;
      }
      sourceUrl = selectedVideoFile.name;
    }

    // Get active logged teacher details to set as instructor
    const loggedInUser = getLoggedInUser();
    const instructorName = loggedInUser && loggedInUser.role === 'teacher' ? loggedInUser.name : 'Prof. Marcus Vance';

    const newId = recordingsData.reduce((max, r) => r.id > max ? r.id : max, 0) + 1;
    const newVideo = {
      id: newId,
      title: title,
      tag: tag === 'Maths' ? 'Mathematics' : tag,
      code: code,
      instructor: instructorName,
      duration: duration,
      completion: 0,
      sourceType: sourceType,
      sourceUrl: sourceUrl
    };

    recordingsData.push(newVideo);
    saveRecordings();

    form.reset();
    selectedVideoFile = null;
    if (fileInput) fileInput.value = '';
    
    // Reset dropzone view
    const defaultState = document.getElementById('dropzone-default-state');
    const successState = document.getElementById('dropzone-success-state');
    if (defaultState) defaultState.classList.remove('hidden');
    if (successState) successState.classList.add('hidden');
    
    // Reset wrapper visibilities & requirements
    wrapperYoutube.classList.remove('hidden');
    wrapperFile.classList.add('hidden');
    inputYoutube.setAttribute('required', 'true');

    showToast(`Published recorded lecture: ${title}`, 'success');
  });
}

// ==================== LECTURE PLAYER OVERLAY SYSTEM ====================

function setupPlayerModal() {
  const modal = document.getElementById('player-modal');
  const closeBtn = document.getElementById('close-player-modal');
  const title = document.getElementById('player-modal-title');
  const duration = document.getElementById('player-modal-duration');
  
  const playToggle = document.getElementById('player-play-toggle');
  const progressFill = modal.querySelector('.progress-bar-fill');
  
  let isPlaying = true;
  let progressInterval = null;
  let currentPercent = 32;

  // Open player overlay dynamically from recorded card click
  document.getElementById('student-recorded-list').addEventListener('click', (e) => {
    const btn = e.target.closest('.play-video-btn');
    if (!btn) return;
    
    const videoId = parseInt(btn.getAttribute('data-id'));
    const video = recordingsData.find(x => x.id === videoId);
    
    if (video) {
      title.innerText = `Lecture playback: ${video.code} - ${video.title}`;
      duration.innerText = video.duration;
      
      // Reset play states
      currentPercent = video.completion;
      progressFill.style.width = `${currentPercent}%`;
      isPlaying = true;
      playToggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      `;
      modal.querySelector('.mock-video-canvas').style.filter = 'none';

      // Clean up previous real video player if any
      const mockCanvas = modal.querySelector('.mock-video-canvas');
      const oldVideo = mockCanvas.querySelector('video.live-video-player');
      if (oldVideo) oldVideo.remove();

      // Get UI visual elements
      const radar = mockCanvas.querySelector('.radar-scan');
      const particles = mockCanvas.querySelector('.particle-waves');
      const overlay = mockCanvas.querySelector('.playback-overlay');
      const controls = modal.querySelector('.player-controls');

      // Make mock layout visible by default
      if (radar) radar.classList.remove('hidden');
      if (particles) particles.classList.remove('hidden');
      if (overlay) overlay.classList.remove('hidden');
      if (controls) controls.classList.remove('hidden');

      // Check if it is a real file uploaded via uploader
      if (video.sourceType === 'file' && uploadedVideoUrls[video.sourceUrl]) {
        // Hide mock visual layers
        if (radar) radar.classList.add('hidden');
        if (particles) particles.classList.add('hidden');
        if (overlay) overlay.classList.add('hidden');
        if (controls) controls.classList.add('hidden');

        // Inject real video element playing object URL
        const videoElement = document.createElement('video');
        videoElement.className = 'live-video-player';
        videoElement.src = uploadedVideoUrls[video.sourceUrl];
        videoElement.controls = true;
        videoElement.autoplay = true;
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';
        videoElement.style.objectFit = 'contain';
        videoElement.style.position = 'absolute';
        videoElement.style.top = '0';
        videoElement.style.left = '0';
        videoElement.style.zIndex = '50';
        videoElement.style.background = '#000';
        videoElement.style.borderRadius = '8px';
        
        mockCanvas.appendChild(videoElement);
      } else {
        const statusText = modal.querySelector('.playback-overlay p');
        if (statusText) {
          if (video.sourceType === 'youtube') {
            statusText.innerHTML = `Streaming YouTube Archive Node:<br><span style="font-size:0.75rem; color:var(--color-yellow-primary); word-break:break-all;">${video.sourceUrl}</span>`;
          } else {
            statusText.innerHTML = `Simulating Local File Playback:<br><span style="font-size:0.75rem; color:var(--color-yellow-primary); word-break:break-all;">${video.sourceUrl}</span>`;
          }
        }
        startSimulation();
      }

      modal.classList.remove('hidden');
      showToast(`Loading lecture stream archive node...`, 'success');
    }
  });

  const closeModal = () => {
    modal.classList.add('hidden');
    clearInterval(progressInterval);
    // Pause and remove real video element to release system memory cleanly
    const mockCanvas = modal.querySelector('.mock-video-canvas');
    const videoElement = mockCanvas.querySelector('video.live-video-player');
    if (videoElement) {
      videoElement.pause();
      videoElement.remove();
    }
  };

  closeBtn.addEventListener('click', closeModal);

  // Play/Pause toggler
  playToggle.addEventListener('click', () => {
    isPlaying = !isPlaying;
    
    if (isPlaying) {
      playToggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      `;
      modal.querySelector('.mock-video-canvas').style.filter = 'none';
      const pText = modal.querySelector('.playback-overlay p');
      if (pText) pText.innerText = 'Streaming Quantum Archival Server...';
      startSimulation();
    } else {
      playToggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
          <path d="M8 5v14l11-7z"/>
        </svg>
      `;
      modal.querySelector('.mock-video-canvas').style.filter = 'grayscale(0.6) blur(2px)';
      const pText = modal.querySelector('.playback-overlay p');
      if (pText) pText.innerText = 'Playback Suspended';
      clearInterval(progressInterval);
    }
  });

  // Simulated progress bar moving timeline
  function startSimulation() {
    clearInterval(progressInterval);
    progressInterval = setInterval(() => {
      if (currentPercent < 100) {
        currentPercent += 0.2;
        progressFill.style.width = `${currentPercent}%`;
      } else {
        currentPercent = 0;
      }
    }, 100);
  }
}

// ==========================================================================
// MASTER PORTAL ADMINISTRATION & REALTIME ALLOCATORS
// ==========================================================================

function renderAdminAllocations() {
  const tableBody = document.getElementById('admin-allocation-table-body');
  if (!tableBody) return;
  tableBody.innerHTML = '';

  const batches = ['Unassigned', 'Alpha Cohort', 'Gamma Batch', 'JEE Elite', 'NEET Super-30'];

  studentsData.forEach(student => {
    const row = document.createElement('tr');

    // Build batch dropdown options
    let batchOptions = '';
    batches.forEach(b => {
      const selected = student.batch === b ? 'selected' : '';
      batchOptions += `<option value="${b}" ${selected}>${b}</option>`;
    });

    // Build teacher dropdown options
    let teacherOptions = `<option value="Unassigned" ${!student.teacherId ? 'selected' : ''}>Unassigned</option>`;
    teachersData.forEach(t => {
      const selected = student.teacherId === t.id ? 'selected' : '';
      teacherOptions += `<option value="${t.id}" ${selected}>${t.name} (${t.department})</option>`;
    });

    row.innerHTML = `
      <td>
        <div class="table-user">
          <div class="avatar text-avatar" style="width: 32px; height: 32px; font-size: 0.8rem; background-color: var(--color-yellow-muted); color: var(--color-yellow-primary);">
            ${student.name.split(' ').map(x => x[0]).join('')}
          </div>
          <div class="table-user-info">
            <span class="table-user-name">${student.name}</span>
            <span class="table-user-email">${student.email}</span>
          </div>
        </div>
      </td>
      <td>
        <select class="alloc-select student-batch-select" data-id="${student.id}">
          ${batchOptions}
        </select>
      </td>
      <td>
        <select class="alloc-select student-teacher-select" data-id="${student.id}">
          ${teacherOptions}
        </select>
      </td>
      <td style="text-align: center;">
        <span class="badge" id="sync-${student.id}" style="background: rgba(16, 185, 129, 0.05); color: var(--color-success); border-color: rgba(16, 185, 129, 0.2); font-size: 0.7rem; text-transform: uppercase;">Synced</span>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Bind change events
  tableBody.querySelectorAll('.student-batch-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const studentId = parseInt(select.getAttribute('data-id'));
      const batchValue = select.value;
      const student = studentsData.find(s => s.id === studentId);
      if (student) {
        student.batch = batchValue;
        
        // Show status transition
        const syncBadge = document.getElementById(`sync-${studentId}`);
        if (syncBadge) {
          syncBadge.innerText = 'Syncing...';
          syncBadge.style.color = 'var(--color-yellow-primary)';
          syncBadge.style.borderColor = 'rgba(255, 234, 0, 0.2)';
          syncBadge.style.background = 'rgba(255, 234, 0, 0.05)';
        }

        saveStudents();

        setTimeout(() => {
          const freshBadge = document.getElementById(`sync-${studentId}`);
          if (freshBadge) {
            freshBadge.innerText = 'Synced';
            freshBadge.style.color = 'var(--color-success)';
            freshBadge.style.borderColor = 'rgba(16, 185, 129, 0.2)';
            freshBadge.style.background = 'rgba(16, 185, 129, 0.05)';
          }
        }, 500);

        showToast(`Allocated ${student.name} to ${batchValue}`, 'success');
      }
    });
  });

  tableBody.querySelectorAll('.student-teacher-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const studentId = parseInt(select.getAttribute('data-id'));
      const teacherValue = select.value;
      const student = studentsData.find(s => s.id === studentId);
      if (student) {
        student.teacherId = teacherValue === 'Unassigned' ? null : parseInt(teacherValue);
        
        // Show status transition
        const syncBadge = document.getElementById(`sync-${studentId}`);
        if (syncBadge) {
          syncBadge.innerText = 'Syncing...';
          syncBadge.style.color = 'var(--color-yellow-primary)';
          syncBadge.style.borderColor = 'rgba(255, 234, 0, 0.2)';
          syncBadge.style.background = 'rgba(255, 234, 0, 0.05)';
        }

        saveStudents();

        setTimeout(() => {
          const freshBadge = document.getElementById(`sync-${studentId}`);
          if (freshBadge) {
            freshBadge.innerText = 'Synced';
            freshBadge.style.color = 'var(--color-success)';
            freshBadge.style.borderColor = 'rgba(16, 185, 129, 0.2)';
            freshBadge.style.background = 'rgba(16, 185, 129, 0.05)';
          }
        }, 500);

        if (teacherValue === 'Unassigned') {
          showToast(`Set ${student.name} as unassigned from faculty`, 'success');
        } else {
          const teacher = teachersData.find(t => t.id === student.teacherId);
          const teacherName = teacher ? teacher.name : 'Faculty';
          showToast(`Assigned ${student.name} to ${teacherName}`, 'success');
        }
      }
    });
  });
}

function renderAdminTeachers() {
  const tableBody = document.getElementById('admin-teachers-table-body');
  if (!tableBody) return;
  tableBody.innerHTML = '';

  teachersData.forEach(t => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="table-user">
          <div class="avatar text-avatar" style="width: 32px; height: 32px; font-size: 0.8rem; background-color: rgba(255,255,255,0.05); color: #fff;">
            ${t.name.split(' ').map(x => x[0]).join('')}
          </div>
          <div class="table-user-info">
            <span class="table-user-name">${t.name}</span>
            <span class="table-user-email">${t.email}</span>
          </div>
        </div>
      </td>
      <td>
        <span class="badge" style="background-color: rgba(255, 234, 0, 0.05); color: var(--color-yellow-primary); border-color: rgba(255, 234, 0, 0.15); font-family: var(--font-heading); font-weight: 600;">${t.department}</span>
      </td>
      <td>
        <button class="card-remove-btn delete-teacher-btn" data-id="${t.id}" title="Revoke Faculty" style="padding: 6px; width: 32px; height: 32px;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 14px; height: 14px;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Bind delete events
  tableBody.querySelectorAll('.delete-teacher-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const teacherId = parseInt(btn.getAttribute('data-id'));
      const teacher = teachersData.find(t => t.id === teacherId);
      if (teacher) {
        teachersData = teachersData.filter(t => t.id !== teacherId);
        
        // Remove assignment references from students
        studentsData.forEach(student => {
          if (student.teacherId === teacherId) {
            student.teacherId = null;
          }
        });
        
        saveTeachers();
        saveStudents();
        showToast(`Revoked faculty profile for: ${teacher.name}`, 'success');
      }
    });
  });

  // Sync metrics count
  const countEl = document.getElementById('count-admin-teachers');
  if (countEl) countEl.innerText = `${teachersData.length} Profiles`;
}

function renderAdminStudents() {
  const tableBody = document.getElementById('admin-students-table-body');
  if (!tableBody) return;
  tableBody.innerHTML = '';

  studentsData.forEach(student => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="table-user">
          <div class="avatar text-avatar" style="width: 32px; height: 32px; font-size: 0.8rem; background-color: rgba(255,255,255,0.05); color: #fff;">
            ${student.name.split(' ').map(x => x[0]).join('')}
          </div>
          <div class="table-user-info">
            <span class="table-user-name">${student.name}</span>
            <span class="table-user-email">${student.email}</span>
          </div>
        </div>
      </td>
      <td>
        <span style="font-size: 0.82rem; color: var(--color-text-muted); font-family: var(--font-body);">${student.email}</span>
      </td>
      <td>
        <button class="card-remove-btn delete-student-btn" data-id="${student.id}" title="Deregister Student" style="padding: 6px; width: 32px; height: 32px;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 14px; height: 14px;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Bind delete events
  tableBody.querySelectorAll('.delete-student-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const studentId = parseInt(btn.getAttribute('data-id'));
      const student = studentsData.find(s => s.id === studentId);
      if (student) {
        studentsData = studentsData.filter(s => s.id !== studentId);
        saveStudents();
        showToast(`Deregistered student: ${student.name}`, 'success');
      }
    });
  });

  // Sync metrics count
  const countEl = document.getElementById('count-admin-students');
  if (countEl) countEl.innerText = `${studentsData.length} Registered`;
}

function setupAdminForms() {
  const teacherForm = document.getElementById('admin-create-teacher-form');
  const studentForm = document.getElementById('admin-create-student-form');

  if (teacherForm) {
    teacherForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('admin-teacher-name').value.trim();
      const email = document.getElementById('admin-teacher-email').value.trim();
      const dept = document.getElementById('admin-teacher-dept').value.trim();
      const password = document.getElementById('admin-teacher-password').value;

      const newId = teachersData.reduce((max, t) => t.id > max ? t.id : max, 0) + 1;
      const newTeacher = { id: newId, name, email, department: dept, password: password };

      teachersData.push(newTeacher);
      saveTeachers();

      teacherForm.reset();
      showToast(`Registered Faculty: ${name}`, 'success');
    });
  }

  if (studentForm) {
    studentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('admin-student-name').value.trim();
      const email = document.getElementById('admin-student-email').value.trim();

      const newId = studentsData.reduce((max, s) => s.id > max ? s.id : max, 0) + 1;
      const newStudent = {
        id: newId,
        name,
        email,
        grade: '-',
        attendance: 0,
        teacherId: null,
        batch: 'Unassigned',
        password: 'studentpassword' // Default password for registered students
      };

      studentsData.push(newStudent);
      saveStudents();

      studentForm.reset();
      showToast(`Registered Student: ${name}`, 'success');
    });
  }
}

// Master Admin Access Modal Logic
function setupAdminAuthModal() {
  const authForm = document.getElementById('admin-auth-form');
  const authModal = document.getElementById('admin-auth-modal');
  const passcodeField = document.getElementById('admin-auth-passcode');
  const closeAuthModalBtn = document.getElementById('close-admin-auth-modal');

  if (closeAuthModalBtn) {
    closeAuthModalBtn.addEventListener('click', () => {
      authModal.classList.add('hidden');
    });
  }

  // Click outside modal card to close
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) {
        authModal.classList.add('hidden');
      }
    });
  }

  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredPasscode = passcodeField.value.trim();
      
      if (enteredPasscode === 'admin123') {
        authModal.classList.add('hidden');
        
        const loader = document.getElementById('auth-loader');
        const loaderText = document.getElementById('loader-text');
        loader.classList.remove('hidden');
        loaderText.innerText = 'Securing quantum terminal...';
        
        setTimeout(() => {
          loaderText.innerText = 'Verifying administrator key...';
        }, 600);

        setTimeout(() => {
          loader.classList.add('hidden');
          currentRole = 'admin';
          // Save admin session state
          const sessionObj = { role: 'admin', name: 'Chief Administrator', email: 'admin@theblackboard.edu' };
          sessionStorage.setItem('blackboard_logged_in_user', JSON.stringify(sessionObj));
          localStorage.removeItem('blackboard_logged_in_user');
          window.location.hash = '#/admin';
          showToast('Administrative access granted.', 'success');
        }, 1200);
      } else {
        // Shiver the modal card on invalid passcode entry
        const modalCard = authModal.querySelector('.modal-card');
        modalCard.classList.add('shake-effect');
        modalCard.addEventListener('animationend', () => {
          modalCard.classList.remove('shake-effect');
        }, { once: true });
        
        showToast('SECURITY REFUSED - INVALID ACCESS KEY', 'warning');
      }
    });
  }
}

/* ==========================================================================
   ROSTER SIGNUP & SIMULATED COMMAND EMAIL INBOX LOGIC
   ========================================================================== */

// Admin Messages Telemetry Datastore
let adminMessages = JSON.parse(localStorage.getItem('blackboard_admin_messages')) || [];
if (!localStorage.getItem('blackboard_admin_messages')) {
  localStorage.setItem('blackboard_admin_messages', JSON.stringify(adminMessages));
}

function saveAdminMessages() {
  localStorage.setItem('blackboard_admin_messages', JSON.stringify(adminMessages));
  renderAdminInbox();
}

function setupFormSwaps() {
  const btnShowSignup = document.getElementById('btn-show-signup');
  const btnShowLogin = document.getElementById('btn-show-login');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const demoHelpers = document.getElementById('login-demo-helpers');
  const roleTabs = document.getElementById('login-role-tabs');
  const headerTitle = document.getElementById('login-header-title');

  if (btnShowSignup && btnShowLogin && loginForm && signupForm) {
    btnShowSignup.addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.classList.add('hidden');
      signupForm.classList.remove('hidden');
      if (demoHelpers) demoHelpers.classList.add('hidden');
      if (roleTabs) roleTabs.style.display = 'none';
      headerTitle.innerText = 'Create Account';
      clearAuthErrors();
      clearSignupErrors();
    });

    btnShowLogin.addEventListener('click', (e) => {
      e.preventDefault();
      signupForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
      if (demoHelpers) demoHelpers.classList.remove('hidden');
      if (roleTabs) roleTabs.style.display = 'flex';
      
      if (currentRole === 'student') {
        headerTitle.innerText = 'Welcome Student!';
      } else if (currentRole === 'teacher') {
        headerTitle.innerText = 'Welcome Teacher!';
      } else {
        headerTitle.innerText = 'Welcome Student!';
      }
      clearAuthErrors();
      clearSignupErrors();
    });
  }
}

function setupSignupForm() {
  const form = document.getElementById('signup-form');
  const nameInput = document.getElementById('signup-name');
  const emailInput = document.getElementById('signup-email');
  const passwordInput = document.getElementById('signup-password');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearSignupErrors();

    let hasError = false;

    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim();
    const passwordVal = passwordInput.value;
    const roleVal = 'student'; // Strictly students for signup, role selection removed

    if (!nameVal) {
      nameInput.parentElement.classList.add('error-state');
      document.getElementById('signup-name-error').style.display = 'block';
      hasError = true;
    }

    if (!emailVal || !emailVal.includes('@') || emailVal.length < 5) {
      emailInput.parentElement.classList.add('error-state');
      document.getElementById('signup-email-error').style.display = 'block';
      hasError = true;
    }

    if (passwordVal.length < 6) {
      passwordInput.parentElement.classList.add('error-state');
      document.getElementById('signup-password-error').style.display = 'block';
      hasError = true;
    }

    if (hasError) {
      const card = document.querySelector('.login-card');
      card.classList.add('shake-effect');
      card.addEventListener('animationend', () => {
        card.classList.remove('shake-effect');
      }, { once: true });
      showToast('Please fix registration fields.', 'warning');
      return;
    }

    // Check if email already exists in students or teachers database
    const emailLower = emailVal.toLowerCase();
    const studentExists = studentsData.some(s => s.email.toLowerCase() === emailLower);
    const teacherExists = teachersData.some(t => t.email.toLowerCase() === emailLower);

    if (studentExists || teacherExists) {
      emailInput.parentElement.classList.add('error-state');
      document.getElementById('signup-email-error').innerText = 'This email is already registered on THE BLACKBOARD.';
      document.getElementById('signup-email-error').style.display = 'block';
      showToast('Account already exists.', 'warning');
      return;
    }

    // Perform signup registration
    const loader = document.getElementById('auth-loader');
    const loaderText = document.getElementById('loader-text');
    loader.classList.remove('hidden');
    loaderText.innerText = 'Creating account dossier...';

    setTimeout(() => {
      loaderText.innerText = 'Broadcasting administrative alert...';
    }, 800);

    setTimeout(() => {
      loader.classList.add('hidden');

      // 1. Add to local storage dataset (strictly student)
      const newId = studentsData.reduce((max, s) => s.id > max ? s.id : max, 0) + 1;
      const newStudent = {
        id: newId,
        name: nameVal,
        email: emailVal,
        grade: '-',
        attendance: 90,
        teacherId: null,
        batch: 'Unassigned',
        password: passwordVal
      };
      studentsData.push(newStudent);
      saveStudents();

      // 2. Format and trigger simulated admin notification email
      sendAdminSimulationEmail(nameVal, emailVal, roleVal);

      // 3. Clear signup form, swap back to login and prefill new user's email
      form.reset();
      document.getElementById('btn-show-login').click();
      const loginEmailInput = document.getElementById('login-email');
      if (loginEmailInput) {
        loginEmailInput.value = emailVal;
        document.getElementById('tab-student').click();
      }
      
      showToast('Registration successful! Telemetry alerted.', 'success');
    }, 1600);
  });
}

function clearSignupErrors() {
  document.getElementById('signup-name').parentElement.classList.remove('error-state');
  document.getElementById('signup-email').parentElement.classList.remove('error-state');
  document.getElementById('signup-password').parentElement.classList.remove('error-state');
  document.getElementById('signup-name-error').style.display = 'none';
  document.getElementById('signup-email-error').style.display = 'none';
  document.getElementById('signup-password-error').style.display = 'none';
  document.getElementById('signup-email-error').innerText = 'Please enter a valid academic email address.';
}

function sendAdminSimulationEmail(name, email, role) {
  const formattedTime = new Date().toLocaleString();
  const rawSubject = `[ALERT] New ${role.toUpperCase()} Signup: ${name}`;
  const mailFrom = `THE BLACKBOARD Telemetry <noreply@theblackboard.edu>`;
  const mailTo = `Roster Command <admin@theblackboard.edu>`;
  
  const mailBody = `
========================================
THE BLACKBOARD SYSTEM SECURITY CONSOLE
NEW ACCOUNT SECURITY TELEMETRY DETECTED
========================================

TIMESTAMP: ${formattedTime}
REGISTRY NODE: ACC-30030ACC

PARTICIPANT DETAILS:
----------------------------------------
Full Name     : ${name}
Account Email : ${email}
Academic Role : ${role.toUpperCase()}
Allocation    : UNASSIGNED

ACTION COMPLETED:
A new credential block has been synced into THE BLACKBOARD's decentralised local roster tables.
System alert: New record requires immediate allocation to an academic cohort and mentor faculty member inside the administrator overrides control deck.

LOG DECRYPTION STATUS: SECURED / ONLINE
========================================
  `.trim();

  const newMsg = {
    id: 'msg-' + Date.now(),
    from: mailFrom,
    to: mailTo,
    subject: rawSubject,
    time: formattedTime,
    body: mailBody,
    read: false,
    senderName: name,
    senderEmail: email,
    senderRole: role
  };

  adminMessages.unshift(newMsg);
  saveAdminMessages();
  fireEmailSentAlert(newMsg);
}

function fireEmailSentAlert(msg) {
  const overlay = document.getElementById('email-sent-alert');
  const fromEl = document.getElementById('alert-mail-from');
  const toEl = document.getElementById('alert-mail-to');
  const subjectEl = document.getElementById('alert-mail-subject');
  const timeEl = document.getElementById('alert-mail-time');
  const bodyEl = document.getElementById('alert-mail-body');

  if (!overlay || !fromEl || !toEl || !subjectEl || !timeEl || !bodyEl) return;

  fromEl.innerText = msg.from;
  toEl.innerText = msg.to;
  subjectEl.innerText = msg.subject;
  timeEl.innerText = msg.time;
  bodyEl.innerText = msg.body;

  overlay.classList.remove('hidden');

  const autoCloseTimer = setTimeout(() => {
    overlay.classList.add('hidden');
  }, 5500);

  const closeBtn = document.getElementById('close-email-alert');
  if (closeBtn) {
    closeBtn.onclick = () => {
      clearTimeout(autoCloseTimer);
      overlay.classList.add('hidden');
    };
  }
}

function renderAdminInbox() {
  const listContainer = document.getElementById('admin-mail-list');
  const unreadBadge = document.getElementById('admin-unread-badge');
  
  if (!listContainer) return;

  listContainer.innerHTML = '';

  const unreadCount = adminMessages.filter(m => !m.read).length;
  if (unreadBadge) {
    if (unreadCount > 0) {
      unreadBadge.innerText = unreadCount;
      unreadBadge.style.display = 'inline-block';
    } else {
      unreadBadge.style.display = 'none';
    }
  }

  if (adminMessages.length === 0) {
    listContainer.innerHTML = `
      <div class="mail-empty-state">
        <p>No new system telemetry logs.</p>
      </div>
    `;
    clearMailViewer();
    return;
  }

  adminMessages.forEach((msg) => {
    const mailCard = document.createElement('div');
    mailCard.className = `mail-item ${!msg.read ? 'unread' : ''}`;
    mailCard.setAttribute('data-id', msg.id);
    
    mailCard.innerHTML = `
      <div class="mail-item-header">
        <span class="mail-item-sender">${msg.senderName} (${msg.senderRole.toUpperCase()})</span>
        <span class="mail-item-time">${msg.time.split(', ')[1] || msg.time}</span>
      </div>
      <div class="mail-item-subject">${msg.subject}</div>
      <div class="mail-item-body-preview">${msg.senderEmail} registered under portal database hierarchy.</div>
    `;

    mailCard.addEventListener('click', () => {
      document.querySelectorAll('.mail-item').forEach(c => c.classList.remove('active'));
      mailCard.classList.add('active');

      if (!msg.read) {
        msg.read = true;
        mailCard.classList.remove('unread');
        saveAdminMessages();
      }

      renderMailViewer(msg);
    });

    listContainer.appendChild(mailCard);
  });
}

function clearMailViewer() {
  const viewer = document.getElementById('admin-mail-viewer');
  if (viewer) {
    viewer.innerHTML = `
      <div class="mail-viewer-placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="placeholder-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
        <p>Select a message to decode transmission telemetry.</p>
      </div>
    `;
  }
}

function renderMailViewer(msg) {
  const viewer = document.getElementById('admin-mail-viewer');
  if (!viewer) return;

  viewer.innerHTML = `
    <div class="mail-full-view">
      <div class="mail-details-card">
        <div class="mail-detail-row">
          <span class="mail-detail-label">FROM:</span>
          <span class="mail-detail-value font-mono">${msg.from}</span>
        </div>
        <div class="mail-detail-row">
          <span class="mail-detail-label">TO:</span>
          <span class="mail-detail-value font-mono">${msg.to}</span>
        </div>
        <div class="mail-detail-row">
          <span class="mail-detail-label">SUBJECT:</span>
          <span class="mail-detail-value" style="color: var(--color-yellow-primary); font-weight: 600;">${msg.subject}</span>
        </div>
        <div class="mail-detail-row">
          <span class="mail-detail-label">DATE:</span>
          <span class="mail-detail-value font-mono">${msg.time}</span>
        </div>
      </div>

      <pre class="mail-full-body">${msg.body}</pre>

      <div class="mail-viewer-actions">
        <div class="actions-left">
          <button type="button" class="btn-mail-action action-delete" id="btn-delete-mail">Purge Log</button>
          <button type="button" class="btn-mail-action" id="btn-toggle-unread">Mark Unread</button>
        </div>
        ${msg.senderRole === 'student' ? `<button type="button" class="btn-mail-action action-allocate" id="btn-mail-allocate">Allocate Cohort</button>` : ''}
      </div>
    </div>
  `;

  document.getElementById('btn-delete-mail').addEventListener('click', () => {
    adminMessages = adminMessages.filter(m => m.id !== msg.id);
    saveAdminMessages();
    showToast('System telemetry log purged.', 'success');
  });

  document.getElementById('btn-toggle-unread').addEventListener('click', () => {
    msg.read = false;
    saveAdminMessages();
    showToast('Message flagged as unread.', 'success');
  });

  const allocBtn = document.getElementById('btn-mail-allocate');
  if (allocBtn) {
    allocBtn.addEventListener('click', () => {
      const tabBtn = document.querySelector('[data-target="admin-tab-allocator"]');
      if (tabBtn) tabBtn.click();
      showToast(`Directing override console to: ${msg.senderName}`, 'success');
    });
  }
}
