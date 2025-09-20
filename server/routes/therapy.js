const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken, requirePatient } = require('../middleware/auth');

const router = express.Router();

// Therapy recommendation logic based on patient problems and diseases
const getTherapyRecommendation = (problems, diseases, age, gender) => {
  const recommendations = [];
  
  // Define therapy mappings
  const therapyMappings = {
    // Digestive issues
    'digestive problems': ['Virechana', 'Basti'],
    'constipation': ['Virechana', 'Basti'],
    'indigestion': ['Vamana', 'Virechana'],
    'acid reflux': ['Vamana', 'Virechana'],
    
    // Respiratory issues
    'asthma': ['Vamana', 'Nasya'],
    'bronchitis': ['Vamana', 'Nasya'],
    'sinusitis': ['Nasya', 'Vamana'],
    'allergies': ['Nasya', 'Vamana'],
    
    // Skin conditions
    'psoriasis': ['Virechana', 'Basti', 'Raktamokshana'],
    'eczema': ['Virechana', 'Basti'],
    'acne': ['Virechana', 'Raktamokshana'],
    
    // Musculoskeletal
    'arthritis': ['Basti', 'Abhyanga', 'Pizhichil'],
    'back pain': ['Basti', 'Abhyanga', 'Pizhichil'],
    'joint pain': ['Basti', 'Abhyanga'],
    
    // Neurological
    'migraine': ['Nasya', 'Shirodhara'],
    'anxiety': ['Shirodhara', 'Abhyanga', 'Nasya'],
    'depression': ['Shirodhara', 'Abhyanga'],
    'insomnia': ['Shirodhara', 'Abhyanga'],
    
    // General wellness
    'stress': ['Shirodhara', 'Abhyanga'],
    'fatigue': ['Abhyanga', 'Basti'],
    'immunity': ['Basti', 'Abhyanga']
  };

  // Check problems and diseases for therapy recommendations
  const allConditions = [...(problems || []), ...(diseases || [])];
  
  allConditions.forEach(condition => {
    const lowerCondition = condition.toLowerCase();
    
    // Direct mapping
    if (therapyMappings[lowerCondition]) {
      recommendations.push(...therapyMappings[lowerCondition]);
    }
    
    // Partial matching
    Object.keys(therapyMappings).forEach(key => {
      if (lowerCondition.includes(key) || key.includes(lowerCondition)) {
        recommendations.push(...therapyMappings[key]);
      }
    });
  });

  // Age and gender considerations
  if (age > 60) {
    // Elderly patients - gentler therapies
    if (recommendations.includes('Vamana')) {
      const index = recommendations.indexOf('Vamana');
      recommendations[index] = 'Abhyanga';
    }
  }

  if (gender === 'female' && age >= 18 && age <= 45) {
    // Women of reproductive age - avoid certain therapies during menstruation
    recommendations.push('Note: Avoid Virechana during menstruation');
  }

  // Remove duplicates and return unique recommendations
  const uniqueRecommendations = [...new Set(recommendations)];
  
  // If no specific recommendations, suggest general wellness therapies
  if (uniqueRecommendations.length === 0) {
    uniqueRecommendations.push('Abhyanga', 'Shirodhara');
  }

  return uniqueRecommendations.slice(0, 3); // Return top 3 recommendations
};

// @route   POST /api/therapy/recommend
// @desc    Get therapy recommendations based on patient data
// @access  Private (Patient)
router.post('/recommend', verifyToken, requirePatient, [
  body('problems').isArray().withMessage('Problems must be an array'),
  body('diseases').isArray().withMessage('Diseases must be an array'),
  body('age').isInt({ min: 1, max: 120 }).withMessage('Age must be between 1 and 120'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { problems, diseases, age, gender } = req.body;

    // Get therapy recommendations
    const recommendedTherapies = getTherapyRecommendation(problems, diseases, age, gender);

    // Therapy descriptions
    const therapyDescriptions = {
      'Vamana': {
        name: 'Vamana (Therapeutic Emesis)',
        description: 'A cleansing therapy that eliminates excess Kapha dosha through controlled vomiting. Effective for respiratory and digestive issues.',
        duration: '3-7 days',
        benefits: ['Respiratory health', 'Digestive cleansing', 'Kapha balance']
      },
      'Virechana': {
        name: 'Virechana (Purgation Therapy)',
        description: 'A cleansing therapy that eliminates excess Pitta dosha through controlled purgation. Beneficial for skin and digestive conditions.',
        duration: '3-5 days',
        benefits: ['Skin health', 'Digestive cleansing', 'Pitta balance']
      },
      'Basti': {
        name: 'Basti (Enema Therapy)',
        description: 'A rejuvenating therapy that administers medicated oils or decoctions through the rectum. Excellent for Vata disorders.',
        duration: '8-30 days',
        benefits: ['Joint health', 'Nervous system', 'Vata balance']
      },
      'Nasya': {
        name: 'Nasya (Nasal Therapy)',
        description: 'Administration of medicated oils or powders through the nasal passages. Effective for head and neck disorders.',
        duration: '7-14 days',
        benefits: ['Sinus health', 'Headache relief', 'Mental clarity']
      },
      'Abhyanga': {
        name: 'Abhyanga (Oil Massage)',
        description: 'Full body massage with warm medicated oils. Promotes relaxation, circulation, and overall wellness.',
        duration: '45-60 minutes per session',
        benefits: ['Relaxation', 'Improved circulation', 'Skin health']
      },
      'Shirodhara': {
        name: 'Shirodhara (Oil Pouring)',
        description: 'Continuous pouring of warm oil on the forehead. Highly effective for stress, anxiety, and sleep disorders.',
        duration: '30-45 minutes per session',
        benefits: ['Stress relief', 'Better sleep', 'Mental peace']
      },
      'Pizhichil': {
        name: 'Pizhichil (Oil Bath)',
        description: 'Warm medicated oil is continuously poured over the body while gentle massage is performed.',
        duration: '60-90 minutes per session',
        benefits: ['Muscle relaxation', 'Joint mobility', 'Pain relief']
      },
      'Raktamokshana': {
        name: 'Raktamokshana (Blood Letting)',
        description: 'Therapeutic bloodletting to remove toxins and improve circulation. Used for specific skin and blood disorders.',
        duration: '30-45 minutes per session',
        benefits: ['Toxin removal', 'Improved circulation', 'Skin health']
      }
    };

    // Format recommendations with descriptions
    const formattedRecommendations = recommendedTherapies
      .filter(therapy => therapyDescriptions[therapy])
      .map(therapy => ({
        therapy,
        ...therapyDescriptions[therapy]
      }));

    res.json({
      success: true,
      recommendations: formattedRecommendations,
      totalSessions: Math.floor(Math.random() * 10) + 5, // Random between 5-15 sessions
      estimatedDuration: '4-8 weeks'
    });
  } catch (error) {
    console.error('Therapy recommendation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
