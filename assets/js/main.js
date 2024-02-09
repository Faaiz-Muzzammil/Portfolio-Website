// SHOW MENU 
const navMenu = document.getElementById("nav-menu"),
  navToggle = document.getElementById("nav-toggle"),
  navClose = document.getElementById("nav-close");

// Validate if constant exists
if (navToggle) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.add("show-menu");
  });
}

// Close Menu
// Validate if constants exist
if (navClose) {
  navClose.addEventListener("click", () => {
    navMenu.classList.remove("show-menu");
  });
}

// REMOVE MENU MOBILE  
const navLinks = document.querySelectorAll(".nav__link"); // Use querySelectorAll to get all elements
const linkAction = () => {
  const navMenu = document.getElementById("nav-menu");
  // When we click on each nav__link, we remove the show-menu class
  navMenu.classList.remove("show-menu");
};
navLinks.forEach((n) => n.addEventListener("click", linkAction)); // Apply event listener to each nav__link

// add blur to header
const blurHeader = () =>{
  const header = document.getElementById('header')
  /* When the scroll is greater than 50 viewport height, 
  add the blur header class to the header tag.
  */
 this.scrollY >= 50 ? header.classList.add('blur-header')
                    : header.classList.remove('blur-header')
}
window.addEventListener('scroll', blurHeader)


// Email JS
const contactForm = document.getElementById('contact-form'),
      contactMessage = document.getElementById('contact-message');

const sendEmail = (e) => {
  e.preventDefault();
  // serviceID - template ID - #form - public Key
  emailjs.sendForm('personalUse', 'templateID', '#contact-form', 'ryLN_fCfvqFVwqJUf')
    .then(() => {
      // Show message send
      contactMessage.textContent = 'Message Sent Successfully✅';
    }, (error) => {
      // Properly handle the rejection, log the error, and show a message
      console.error('Failed to send message:', error);
      contactMessage.textContent = 'Message Not Sent (Service Error)☠️';
    });
}

contactForm.addEventListener('submit', sendEmail);




