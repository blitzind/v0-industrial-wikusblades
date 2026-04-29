import { NextRequest, NextResponse } from 'next/server';

/**
 * FIELD MAPPING: Map form fields to Workspace API contact payload
 * 
 * STEP 1: Core Contact Creation (Native Fields Only)
 * REQUIRED:
 * - name (REQUIRED - NOT NULL): Built from firstName + lastName
 * 
 * CORE FIELDS:
 * - first_name
 * - last_name
 * - email
 * - phone
 * - company
 * - state (maps to address1_stateorprovince or state)
 * - lead_source (static: "wikusblades.com")
 * 
 * STEP 2: Update Contact Notes with full submission summary
 * - Industry, materials, challenges, consent, state, lead source (fallback)
 */

const LEAD_SOURCE = 'wikusblades.com';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  state: string;
  industry: string;
  applicationDescription: string;
  currentChallenges: string;
  agreeToContact: boolean;
  agreeToPrivacy: boolean;
}

interface ContactCorePayload {
  [key: string]: string;
}

function mapFormDataToContactCore(data: ContactFormData): ContactCorePayload {
  // Build full name from firstName and lastName, trimming extra spaces
  const name = `${data.firstName} ${data.lastName}`.trim();
  
  // Return ONLY native contact fields - NO workspaceId in body
  // Workspace scoping is handled via x-api-key header authentication
  return {
    name: name, // REQUIRED: NOT NULL constraint
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    phone: data.phone,
    company: data.company,
    state: data.state,
    lead_source: LEAD_SOURCE,
  };
}

export async function POST(request: NextRequest) {
  try {
    // Validate API key is set
    // Note: Workspace scoping is handled entirely via the x-api-key header - no workspaceId needed in request body
    const apiKey = process.env.API_KEY_FUZOR_FORM;
    
    if (!apiKey) {
      console.error('[v0] CRITICAL: API_KEY_FUZOR_FORM environment variable is missing');
      return NextResponse.json(
        { error: 'Workspace API key is missing - contact administrator' },
        { status: 500 }
      );
    }

    // Parse request body
    const formData: ContactFormData = await request.json();
    console.log('[v0] Form data received:', JSON.stringify(formData, null, 2));

    // Validate required fields (only core contact fields)
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.company
    ) {
      console.warn('[v0] Missing required contact fields:', {
        firstName: !!formData.firstName,
        lastName: !!formData.lastName,
        email: !!formData.email,
        phone: !!formData.phone,
        company: !!formData.company,
      });
      return NextResponse.json(
        { error: 'Missing required contact fields' },
        { status: 400 }
      );
    }

    // Map form data to core contact payload (native fields only)
    // Workspace context is provided via x-api-key header authentication
    const coreContactPayload = mapFormDataToContactCore(formData);
    console.log('[v0] State mapped:', formData.state || 'N/A');
    console.log('[v0] Lead Source mapped:', LEAD_SOURCE);
    console.log('[v0] CORE CONTACT PAYLOAD (step 1):', JSON.stringify(coreContactPayload, null, 2));


    // Workspace API endpoint
    const endpoint = 'https://api.workspaceconnector.com/v1/contacts';
    console.log('[v0] CONTACT CREATION ENDPOINT:', endpoint);
    console.log('[v0] REQUEST METHOD: POST');
    console.log('[v0] AUTH HEADER: x-api-key');

    // STEP 1: Create contact with core fields only
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(coreContactPayload),
    });

    console.log('[v0] STEP 1: Contact Creation Response Status:', response.status);
    console.log('[v0] STEP 1: Contact Creation Response Status Text:', response.statusText);

    // Get response body as text first
    const responseText = await response.text();
    console.log('[v0] STEP 1: Contact Creation Response Body:', responseText);

    if (!response.ok) {
      console.error('[v0] STEP 1: Contact creation failed:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
      });

      return NextResponse.json(
        { 
          error: `Contact creation failed: ${response.status} ${response.statusText}. ${responseText}` 
        },
        { status: response.status || 500 }
      );
    }

    // Try to parse response as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    console.log('[v0] STEP 1: Contact created successfully. API Response:', JSON.stringify(responseData, null, 2));

    // Extract contact ID from response - API returns it in data.id
    const contactId = responseData?.data?.id;
    console.log('[v0] Created Contact ID:', contactId);

        // STEP 2: Update contact notes with form submission details
        // Verified working format: PATCH with notes field
        try {
          console.log('[v0] STEP 2: Updating contact with form submission details via notes field...');
          
          const formSubmissionDetails = [
            `State: ${formData.state || 'N/A'}`,
            `Industry: ${formData.industry || 'N/A'}`,
            `Materials: ${formData.applicationDescription || 'N/A'}`,
            `Challenges: ${formData.currentChallenges || 'N/A'}`,
            `Contact Consent: ${formData.agreeToContact ? 'Yes' : 'No'}`,
            `Privacy Agreement: ${formData.agreeToPrivacy ? 'Yes' : 'No'}`,
            `Lead Source: ${LEAD_SOURCE}`,
          ].join('\n');

          const updateEndpoint = `https://api.workspaceconnector.com/v1/contacts/${contactId}`;
          const updatePayload = {
            notes: formSubmissionDetails,
          };

          console.log('[v0] STEP 2: Update Endpoint:', updateEndpoint);
          console.log('[v0] STEP 2: Update Payload:', JSON.stringify(updatePayload, null, 2));

          const updateResponse = await fetch(updateEndpoint, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
            },
            body: JSON.stringify(updatePayload),
          });

          const updateResponseText = await updateResponse.text();
          console.log('[v0] STEP 2: Update Response Status:', updateResponse.status);
          console.log('[v0] STEP 2: Update Response Body:', updateResponseText);

          if (updateResponse.ok) {
            console.log('[v0] STEP 2: SUCCESS - Form submission details saved to contact notes');
            console.log('[v0] STEP 2: Saved fields:');
            console.log('[v0]   - State: ' + (formData.state || 'N/A') + ' (state field + notes)');
            console.log('[v0]   - Industry: ' + (formData.industry || 'N/A'));
            console.log('[v0]   - Materials: ' + (formData.applicationDescription || 'N/A'));
            console.log('[v0]   - Challenges: ' + (formData.currentChallenges || 'N/A'));
            console.log('[v0]   - Contact Consent: ' + (formData.agreeToContact ? 'Yes' : 'No'));
            console.log('[v0]   - Privacy Agreement: ' + (formData.agreeToPrivacy ? 'Yes' : 'No'));
            console.log('[v0]   - Lead Source: ' + LEAD_SOURCE + ' (notes + lead_source field)');
          } else {
            console.warn('[v0] STEP 2: Failed to update contact notes (non-critical):', {
              status: updateResponse.status,
              body: updateResponseText,
            });
          }
        } catch (updateError) {
          console.error('[v0] STEP 2: Error updating contact notes (non-critical):', {
            error: updateError instanceof Error ? updateError.message : 'Unknown error',
          });
        }

    console.log('[v0] Form submission completed successfully');

    return NextResponse.json(
      { success: true, message: 'Form submitted successfully', data: responseData },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[v0] CRITICAL Form submission error:', {
      message: errorMessage,
      stack: errorStack,
    });

    return NextResponse.json(
      { error: `Form submission failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
