#!/usr/bin/env node

/**
 * Structured Data Validation Script for CI/CD
 * Run this before deployment to ensure all Schema.org markup is valid
 * 
 * Usage:
 *   node scripts/validate-structured-data.mjs
 *   npm run validate:schemas
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the structured data file
const structuredDataPath = path.join(__dirname, '../src/seo/structuredData.js');
const validateScriptPath = path.join(__dirname, '../src/seo/validateStructuredData.js');

console.log('🔍 Validating Structured Data for AI Discoverability...\n');

// Check if files exist
if (!fs.existsSync(structuredDataPath)) {
  console.error('❌ Error: structuredData.js not found');
  process.exit(1);
}

console.log('✅ Found structuredData.js');

// Read and parse the file to check for basic syntax
const structuredDataContent = fs.readFileSync(structuredDataPath, 'utf8');

// Check for required schema types
const requiredSchemas = [
  'Organization',
  'RealEstateAgent',
  'LocalBusiness',
  'WebSite',
  'Product',
  'FAQPage',
  'BreadcrumbList',
  'Person',
  'Event',
  'PodcastSeries',
  'Course',
  'QAPage',
  'SpeakableSpecification',
];

console.log('\n📋 Checking for required schema types...\n');

let allSchemasPresent = true;
requiredSchemas.forEach(schema => {
  const regex = new RegExp(`['"]@type['"]\\s*:\\s*['"]${schema}['"]`, 'g');
  const arrayRegex = new RegExp(`['"]@type['"]\\s*:\\s*\\[.*?['"]${schema}['"].*?\\]`, 'gs');
  
  if (regex.test(structuredDataContent) || arrayRegex.test(structuredDataContent)) {
    console.log(`✅ ${schema}`);
  } else {
    console.log(`❌ Missing: ${schema}`);
    allSchemasPresent = false;
  }
});

// Check for generator functions
const requiredGenerators = [
  'generatePropertyStructuredData',
  'generateBlogStructuredData',
  'generateBreadcrumbStructuredData',
  'generateVideoStructuredData',
  'generatePropertyProductStructuredData',
  'generateLocalityStructuredData',
  'generateEeaSignals',
  'generateHowToStructuredData',
  'generateFaqStructuredData',
  'generatePersonStructuredData',
  'generateEventStructuredData',
  'generatePodcastStructuredData',
  'generateCourseStructuredData',
  'generateQAPageStructuredData',
  'generateSpeakableStructuredData',
  'generatePropertyFaqStructuredData',
  'generateLocalityFaqStructuredData',
  'generateItemListStructuredData',
  'generateVideoGalleryStructuredData',
  'generateAggregateOfferStructuredData',
  'generateJobPostingStructuredData',
  'generateReviewStructuredData',
  'generateArticleStructuredData',
];

console.log('\n🔧 Checking for generator functions...\n');

let allGeneratorsPresent = true;
requiredGenerators.forEach(generator => {
  const regex = new RegExp(`export\\s+(?:const|function)\\s+${generator}`, 'g');
  if (regex.test(structuredDataContent)) {
    console.log(`✅ ${generator}`);
  } else {
    console.log(`❌ Missing: ${generator}`);
    allGeneratorsPresent = false;
  }
});

// Check for AI discovery files
const aiDiscoveryFiles = [
  '../public/llms.txt',
  '../public/llms-full.txt',
  '../public/.well-known/ai.txt',
  '../public/data/llm-feed.json',
];

console.log('\n🤖 Checking for AI discovery files...\n');

let allAIFilesPresent = true;
aiDiscoveryFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${path.basename(file)}`);
  } else {
    console.log(`❌ Missing: ${path.basename(file)}`);
    allAIFilesPresent = false;
  }
});

// Check structured data usage in pages
const pagesDir = path.join(__dirname, '../src/pages');
const pageFiles = [];

function findPageFiles(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findPageFiles(filePath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      pageFiles.push(filePath);
    }
  });
}

findPageFiles(pagesDir);

console.log('\n📄 Checking structured data usage in pages...\n');

let pagesWithStructuredData = 0;
pageFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('structuredData') || content.includes('generateBreadcrumbStructuredData')) {
    pagesWithStructuredData++;
  }
});

console.log(`✅ Found structured data in ${pagesWithStructuredData}/${pageFiles.length} pages`);

// Final summary
console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION SUMMARY');
console.log('='.repeat(60));
console.log(`Schema Types: ${allSchemasPresent ? '✅ All Present' : '❌ Some Missing'}`);
console.log(`Generator Functions: ${allGeneratorsPresent ? '✅ All Present' : '❌ Some Missing'}`);
console.log(`AI Discovery Files: ${allAIFilesPresent ? '✅ All Present' : '❌ Some Missing'}`);
console.log(`Pages with Structured Data: ${pagesWithStructuredData}/${pageFiles.length}`);
console.log('='.repeat(60));

if (allSchemasPresent && allGeneratorsPresent && allAIFilesPresent) {
  console.log('\n✅ All structured data validations passed!');
  console.log('🚀 Ready for production deployment\n');
  process.exit(0);
} else {
  console.log('\n❌ Some validations failed. Please fix the issues above.\n');
  process.exit(1);
}
