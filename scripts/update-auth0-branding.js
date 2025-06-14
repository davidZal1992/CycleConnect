const axios = require('axios');

// Your Auth0 configuration
const AUTH0_DOMAIN = 'dev-lwik063shdh4q48o.us.auth0.com';
const MANAGEMENT_API_TOKEN = 'YOUR_MANAGEMENT_API_TOKEN_HERE'; // You'll need to get this from Auth0 dashboard

async function updateAuth0LoginText() {
  try {
    console.log('🔧 Updating Auth0 login text...');
    
    // Update English text
    const englishResponse = await axios.put(
      `https://${AUTH0_DOMAIN}/api/v2/prompts/login/custom-text/en`,
      {
        "login": {
          "description": "Log in to CycleConnect",
          "loginLabel": "Continue to CycleConnect"
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${MANAGEMENT_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ English text updated successfully');

    // Update Hebrew text (if needed)
    const hebrewResponse = await axios.put(
      `https://${AUTH0_DOMAIN}/api/v2/prompts/login/custom-text/he`,
      {
        "login": {
          "description": "התחבר ל-CycleConnect",
          "loginLabel": "המשך ל-CycleConnect"
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${MANAGEMENT_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Hebrew text updated successfully');
    console.log('🎉 Auth0 branding updated! Test your Google login now.');

  } catch (error) {
    console.error('❌ Error updating Auth0 text:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔑 Make sure your Management API token has the correct scopes:');
      console.log('   - update:prompts');
      console.log('   - read:prompts');
    }
  }
}

// Run the update
updateAuth0LoginText(); 