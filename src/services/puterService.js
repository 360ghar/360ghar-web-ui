/**
 * Puter.js Service
 *
 * Wrapper service for Puter.js AI capabilities
 * Uses client-side Puter SDK for image generation
 *
 * Cost Model: Users authenticate with their Puter account
 * and pay their own AI usage costs (free for 360Ghar)
 */

// Check if Puter SDK is loaded
const isPuterLoaded = () => typeof window !== 'undefined' && window.puter;

// Wait for Puter to be ready
const waitForPuter = (timeout = 5000) => {
  return new Promise((resolve, reject) => {
    if (isPuterLoaded()) {
      resolve(window.puter);
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isPuterLoaded()) {
        clearInterval(checkInterval);
        resolve(window.puter);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error('Puter SDK failed to load'));
      }
    }, 100);
  });
};

// Load Puter SDK dynamically
const loadPuterScript = () => {
  return new Promise((resolve, reject) => {
    if (isPuterLoaded()) {
      resolve(window.puter);
      return;
    }

    const existingScript = document.querySelector('script[src*="js.puter.com"]');
    if (existingScript) {
      waitForPuter().then(resolve).catch(reject);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    script.onload = () => waitForPuter().then(resolve).catch(reject);
    script.onerror = () => reject(new Error('Failed to load Puter SDK'));
    document.head.appendChild(script);
  });
};

/**
 * Puter Service API
 */
export const puterService = {
  /**
   * Initialize Puter SDK (lazy load)
   */
  init: async () => {
    return loadPuterScript();
  },

  /**
   * Check if user is authenticated with Puter
   */
  isAuthenticated: () => {
    return isPuterLoaded() && window.puter.auth?.isSignedIn?.() || false;
  },

  /**
   * Sign in with Puter account
   * Must be called from a user gesture (button click)
   */
  signIn: async () => {
    await loadPuterScript();
    return window.puter.auth.signIn();
  },

  /**
   * Sign out from Puter
   */
  signOut: () => {
    if (isPuterLoaded()) {
      window.puter.auth.signOut();
    }
  },

  /**
   * Get current Puter user
   */
  getUser: async () => {
    if (!isPuterLoaded()) return null;
    try {
      return await window.puter.auth.getUser();
    } catch {
      return null;
    }
  },

  /**
   * Text-to-Image generation
   * Uses GPT Image 2 (openai-image-generation) for high-quality results
   *
   * @param {string} prompt - Text description of the image
   * @param {Object} options - Generation options
   * @returns {Promise<string>} - Data URL of generated image
   */
  generateFromText: async (prompt, options = {}) => {
    await loadPuterScript();

    if (!puterService.isAuthenticated()) {
      throw new Error('Please sign in with Puter to generate images');
    }

    const generationOptions = {
      provider: 'openai-image-generation',
      model: 'gpt-image-2',
      quality: options.quality || 'high',
      ratio: options.ratio || { w: 1024, h: 1024 },
    };

    const image = await window.puter.ai.txt2img(prompt, generationOptions);
    return image.src;
  },

  /**
   * Image-to-Image transformation
   * Takes an existing image and transforms it based on prompt
   *
   * @param {string} prompt - Text description for transformation
   * @param {string} imageBase64 - Base64 encoded source image (without data URL prefix)
   * @param {string} mimeType - MIME type of the image
   * @param {Object} options - Generation options
   * @returns {Promise<string>} - Data URL of generated image
   */
  reimagineImage: async (prompt, imageBase64, mimeType, options = {}) => {
    await loadPuterScript();

    if (!puterService.isAuthenticated()) {
      throw new Error('Please sign in with Puter to generate images');
    }

    // Gemini 3.1 Flash Image supports image-to-image via input_image
    const image = await window.puter.ai.txt2img(prompt, {
      provider: 'gemini',
      model: options.model || 'gemini-3.1-flash-image-preview',
      input_image: imageBase64,
      input_image_mime_type: mimeType,
    });

    return image.src;
  },

  /**
   * Convert File to base64 string
   * @param {File} file - Image file
   * @returns {Promise<{base64: string, mimeType: string}>}
   */
  fileToBase64: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        // Extract base64 part (remove "data:image/png;base64," prefix)
        const base64 = dataUrl.split(',')[1];
        resolve({
          base64,
          mimeType: file.type,
          dataUrl,
        });
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  },
};

export default puterService;
