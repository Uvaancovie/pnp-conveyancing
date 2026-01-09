/**
 * Image Registry - Centralized exports for all app imagery
 * 
 * Categories:
 * - consult: Client consultation/meeting imagery
 * - frontOffice: Office/reception professional imagery  
 * - signing: Document signing imagery
 * - team: People/team imagery
 */

// Consultation images - use for login, signup, info screens
export const consultImages = {
  consultation1: require('./images/consult/1.jpg'),
  consultation2: require('./images/consult/2.jpg'),
};

// Front office images - use for home, start screens
export const frontOfficeImages = {
  office1: require('./images/front-office/1.jpg'),
};

// Document signing images - use for legal, transfer, bond screens
export const signingImages = {
  signing1: require('./images/signing/siging.jpg'),
};

// Team images - use for profile, about screens
export const teamImages = {
  team1: require('./images/team/1.jpg'),
};

// Default exports by screen context
export const heroImages = {
  home: frontOfficeImages.office1,
  start: frontOfficeImages.office1,
  login: consultImages.consultation1,
  signup: consultImages.consultation2,
  profile: teamImages.team1,
  legal: signingImages.signing1,
  transfer: signingImages.signing1,
  bond: signingImages.signing1,
  repayment: consultImages.consultation1,
  info: consultImages.consultation2,
};

// Gallery array - all images for sliding carousels
export const galleryImages = [
  frontOfficeImages.office1,
  consultImages.consultation1,
  consultImages.consultation2,
  signingImages.signing1,
  teamImages.team1,
];

export default heroImages;
