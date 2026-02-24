// Quick test to verify the custom templates are working
const { customTemplates } = require('./lib/pages/magazine/config/sections/templates/custom-templates');

console.log('Custom Magazine Templates:');
console.log('=========================');

const templateNames = [
  "The Glam Drop",
  "Cover Pro Feature",
  "Marie's Corner",
  "Rising Star Feature",
  "Top Treatment Showcase",
  "Product Spotlight Complete",
  "Quote Wall"
];

templateNames.forEach(name => {
  const template = customTemplates.find(t => t.name === name);
  if (template) {
    console.log(`✓ ${name} - Found`);
  } else {
    console.log(`✗ ${name} - Missing`);
  }
});

console.log('\nTotal templates found:', customTemplates.length);
console.log('Expected templates:', templateNames.length);

if (customTemplates.length === templateNames.length) {
  console.log('\n✅ All 7 custom templates are present!');
} else {
  console.log('\n❌ Template count mismatch!');
}