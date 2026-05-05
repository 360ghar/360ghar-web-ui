/**
 * Structured Data Validation Utility
 * Validates Schema.org markup for completeness and correctness
 * Use in development and CI/CD pipelines
 */

import { realEstateStructuredData } from './structuredData';

// Required properties for each schema type
const REQUIRED_PROPERTIES = {
  Organization: ['@type', 'name', 'url', 'logo'],
  RealEstateAgent: ['@type', 'name', 'url', 'telephone', 'address'],
  LocalBusiness: ['@type', 'name', 'url', 'address', 'telephone'],
  WebSite: ['@type', 'name', 'url'],
  Product: ['@type', 'name', 'offers'],
  Offer: ['@type', 'price', 'priceCurrency', 'availability'],
  FAQPage: ['@type', 'mainEntity'],
  Question: ['@type', 'name', 'acceptedAnswer'],
  Answer: ['@type', 'text'],
  BreadcrumbList: ['@type', 'itemListElement'],
  ListItem: ['@type', 'position', 'name', 'item'],
  Person: ['@type', 'name'],
  Event: ['@type', 'name', 'startDate', 'location'],
  Place: ['@type', 'name'],
  PostalAddress: ['@type', 'addressCountry'],
  GeoCoordinates: ['@type', 'latitude', 'longitude'],
  ImageObject: ['@type', 'url'],
  VideoObject: ['@type', 'name', 'thumbnailUrl'],
  BlogPosting: ['@type', 'headline', 'datePublished'],
  Article: ['@type', 'headline', 'datePublished'],
  Course: ['@type', 'name', 'provider'],
  PodcastSeries: ['@type', 'name', 'publisher'],
  QAPage: ['@type', 'mainEntity'],
  SpeakableSpecification: ['@type', 'cssSelector'],
  JobPosting: ['@type', 'title', 'description', 'hiringOrganization'],
  Review: ['@type', 'reviewBody', 'reviewRating'],
  AggregateRating: ['@type', 'ratingValue', 'reviewCount'],
  HowTo: ['@type', 'name', 'step'],
  HowToStep: ['@type', 'text'],
  SoftwareApplication: ['@type', 'name'],
  MobileApplication: ['@type', 'name'],
  ItemList: ['@type', 'numberOfItems'],
  VideoGallery: ['@type'],
  AggregateOffer: ['@type', 'lowPrice', 'highPrice', 'priceCurrency'],
};

// Validation result structure
class ValidationResult {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.isValid = true;
  }

  addError(message, path = '') {
    this.errors.push({ message, path });
    this.isValid = false;
  }

  addWarning(message, path = '') {
    this.warnings.push({ message, path });
  }

  addInfo(message) {
    this.info.push(message);
  }

  summary() {
    return {
      isValid: this.isValid,
      errorCount: this.errors.length,
      warningCount: this.warnings.length,
      infoCount: this.info.length,
    };
  }
}

/**
 * Validate a single schema object
 */
export function validateSchema(schema, schemaName = 'Unknown') {
  const result = new ValidationResult();

  if (!schema) {
    result.addError(`Schema "${schemaName}" is null or undefined`);
    return result;
  }

  if (!schema['@type']) {
    result.addError('Missing @type property', schemaName);
    return result;
  }

  const types = Array.isArray(schema['@type']) ? schema['@type'] : [schema['@type']];
  
  // Check required properties for each type
  types.forEach(type => {
    const required = REQUIRED_PROPERTIES[type] || [];
    required.forEach(prop => {
      if (!(prop in schema)) {
        result.addError(`Missing required property "${prop}" for type ${type}`, `${schemaName}.${prop}`);
      }
    });

    // Check for recommended properties
    if (type === 'Organization' && !schema.description) {
      result.addWarning(`Missing recommended property "description" for Organization`, `${schemaName}.description`);
    }

    if (type === 'RealEstateAgent' && !schema.areaServed) {
      result.addWarning(`Missing recommended property "areaServed" for RealEstateAgent`, `${schemaName}.areaServed`);
    }

    if (type === 'Event' && !schema.offers) {
      result.addWarning(`Missing recommended property "offers" for Event`, `${schemaName}.offers`);
    }
  });

  // Validate nested objects
  Object.entries(schema).forEach(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (value['@type']) {
        const nestedResult = validateSchema(value, `${schemaName}.${key}`);
        result.errors.push(...nestedResult.errors);
        result.warnings.push(...nestedResult.warnings);
      }
    }

    // Validate arrays
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item && typeof item === 'object' && item['@type']) {
          const nestedResult = validateSchema(item, `${schemaName}.${key}[${index}]`);
          result.errors.push(...nestedResult.errors);
          result.warnings.push(...nestedResult.warnings);
        }
      });
    }
  });

  // Validate URLs
  const urlProps = ['url', 'image', 'thumbnailUrl', 'downloadUrl', 'contentUrl', 'embedUrl'];
  urlProps.forEach(prop => {
    if (schema[prop]) {
      const urls = Array.isArray(schema[prop]) ? schema[prop] : [schema[prop]];
      urls.forEach(url => {
        if (typeof url === 'string' && !url.startsWith('http') && !url.startsWith('/')) {
          result.addWarning(`Invalid URL format for "${prop}": ${url}`, `${schemaName}.${prop}`);
        }
      });
    }
  });

  // Validate dates
  const dateProps = ['startDate', 'endDate', 'datePublished', 'dateModified', 'uploadDate', 'datePosted'];
  dateProps.forEach(prop => {
    if (schema[prop]) {
      const date = new Date(schema[prop]);
      if (isNaN(date.getTime())) {
        result.addError(`Invalid date format for "${prop}": ${schema[prop]}`, `${schemaName}.${prop}`);
      }
    }
  });

  // Validate price
  if (schema.price || schema.price === 0) {
    const price = Number(schema.price);
    if (isNaN(price) || price < 0) {
      result.addError(`Invalid price value: ${schema.price}`, `${schemaName}.price`);
    }
  }

  // Validate rating
  if (schema.ratingValue) {
    const rating = Number(schema.ratingValue);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      result.addError(`Rating value must be between 1 and 5: ${schema.ratingValue}`, `${schemaName}.ratingValue`);
    }
  }

  return result;
}

/**
 * Validate all structured data exports
 */
export function validateAllStructuredData() {
  const results = {
    realEstateStructuredData: {},
    generators: {},
  };

  // Validate realEstateStructuredData object
  Object.entries(realEstateStructuredData).forEach(([key, schema]) => {
    results.realEstateStructuredData[key] = validateSchema(schema, `realEstateStructuredData.${key}`);
  });

  // Validate generator functions exist
  const generatorFunctions = [
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

  generatorFunctions.forEach(funcName => {
    if (typeof window !== 'undefined') {
      // Browser environment
      const func = window[funcName];
      if (!func || typeof func !== 'function') {
        results.generators[funcName] = {
          isValid: false,
          error: `Generator function ${funcName} not found`,
        };
      } else {
        results.generators[funcName] = {
          isValid: true,
          info: 'Function exists',
        };
      }
    }
  });

  return results;
}

/**
 * Generate validation report
 */
export function generateValidationReport(results) {
  let report = '=== Structured Data Validation Report ===\n\n';

  // RealEstateStructuredData results
  report += '--- realEstateStructuredData ---\n';
  let totalErrors = 0;
  let totalWarnings = 0;

  Object.entries(results.realEstateStructuredData).forEach(([key, result]) => {
    const summary = result.summary();
    totalErrors += summary.errorCount;
    totalWarnings += summary.warningCount;

    report += `\n${key}:\n`;
    report += `  Status: ${summary.isValid ? '✅ VALID' : '❌ INVALID'}\n`;
    report += `  Errors: ${summary.errorCount}, Warnings: ${summary.warningCount}\n`;

    if (summary.errorCount > 0) {
      result.errors.forEach(err => {
        report += `    ❌ ${err.message} (${err.path})\n`;
      });
    }

    if (summary.warningCount > 0) {
      result.warnings.forEach(warn => {
        report += `    ⚠️ ${warn.message} (${warn.path})\n`;
      });
    }
  });

  // Generator functions
  report += '\n--- Generator Functions ---\n';
  Object.entries(results.generators).forEach(([funcName, result]) => {
    report += `${funcName}: ${result.isValid ? '✅' : '❌'} ${result.info || result.error}\n`;
  });

  // Summary
  report += '\n=== Summary ===\n';
  report += `Total Errors: ${totalErrors}\n`;
  report += `Total Warnings: ${totalWarnings}\n`;
  report += `Overall Status: ${totalErrors === 0 ? '✅ ALL VALID' : '❌ FIX ERRORS'}\n`;

  return report;
}

/**
 * Run validation and log results
 */
export function runValidation() {
  const results = validateAllStructuredData();
  const report = generateValidationReport(results);
  console.log(report);
  return { results, report };
}

/**
 * Validate structured data for production build
 * Returns true if valid, false otherwise
 */
export function validateForProduction() {
  const results = validateAllStructuredData();
  const hasErrors = Object.values(results.realEstateStructuredData).some(r => !r.isValid);
  
  if (hasErrors) {
    console.error('❌ Structured data validation failed for production build');
    console.error(generateValidationReport(results));
    return false;
  }

  console.log('✅ Structured data validation passed');
  return true;
}

export default {
  validateSchema,
  validateAllStructuredData,
  generateValidationReport,
  runValidation,
  validateForProduction,
};
