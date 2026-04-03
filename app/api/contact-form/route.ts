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
 * 
 * STEP 2: Update Contact with Custom Fields
 * - form_submission_details (custom field): Industry, materials, challenges, consent
 */

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
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
  
  // Return ONLY native contact fields
  return {
    name: name, // REQUIRED: NOT NULL constraint
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    phone: data.phone,
    company: data.company,
  };
}

function buildCustomFieldsPayload(fieldId: string, data: ContactFormData): { customFields: Array<{ id: string; value: string }> } {
  // Build form submission details value
  const formSubmissionDetails = [
    `Industry: ${data.industry || 'N/A'}`,
    `Materials: ${data.applicationDescription || 'N/A'}`,
    `Challenges: ${data.currentChallenges || 'N/A'}`,
    `Contact Consent: ${data.agreeToContact ? 'Yes' : 'No'}`,
    `Privacy Agreement: ${data.agreeToPrivacy ? 'Yes' : 'No'}`,
  ].join('\n');
  
  // Use the actual field ID from the API
  return {
    customFields: [
      {
        id: fieldId, // Use the real field ID from custom fields API
        value: formSubmissionDetails,
      },
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    // Validate API key is set
    const apiKey = process.env.API_KEY_FUZOR_FORM;
    console.log('[v0] API_KEY_FUZOR_FORM exists:', !!apiKey);
    
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
    const coreContactPayload = mapFormDataToContactCore(formData);
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

    // Extract contact ID from response
    const contactId = responseData?.id || responseData?.contact_id;
    console.log('[v0] Created Contact ID:', contactId);

    // STEP 2: Fetch custom fields to find the correct field ID
    if (contactId) {
      try {
        console.log('[v0] STEP 2: Fetching custom fields definitions...');
        
        const customFieldsListEndpoint = 'https://api.workspaceconnector.com/v1/custom-fields';
        console.log('[v0] STEP 2: Custom Fields List Endpoint:', customFieldsListEndpoint);

        const customFieldsListResponse = await fetch(customFieldsListEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
        });

        console.log('[v0] STEP 2: Custom Fields List Response Status:', customFieldsListResponse.status);
        console.log('[v0] STEP 2: Custom Fields List Response Status Text:', customFieldsListResponse.statusText);

        const customFieldsListText = await customFieldsListResponse.text();
        console.log('[v0] STEP 2: Custom Fields List Response Body:', customFieldsListText);

        let customFieldsList;
        try {
          customFieldsList = JSON.parse(customFieldsListText);
        } catch {
          customFieldsList = { raw: customFieldsListText };
        }

        // Find the "Form Submission Details" field
        let formSubmissionDetailsFieldId: string | null = null;
        
        if (Array.isArray(customFieldsList)) {
          const field = customFieldsList.find((f: any) => 
            f.name?.toLowerCase() === 'form submission details' ||
            f.label?.toLowerCase() === 'form submission details'
          );
          if (field) {
            formSubmissionDetailsFieldId = field.id;
            console.log('[v0] STEP 2: Found "Form Submission Details" field');
            console.log('[v0] STEP 2: Matched field name:', field.name || field.label);
            console.log('[v0] STEP 2: Matched field id:', formSubmissionDetailsFieldId);
          }
        } else if (customFieldsList?.data && Array.isArray(customFieldsList.data)) {
          const field = customFieldsList.data.find((f: any) => 
            f.name?.toLowerCase() === 'form submission details' ||
            f.label?.toLowerCase() === 'form submission details'
          );
          if (field) {
            formSubmissionDetailsFieldId = field.id;
            console.log('[v0] STEP 2: Found "Form Submission Details" field');
            console.log('[v0] STEP 2: Matched field name:', field.name || field.label);
            console.log('[v0] STEP 2: Matched field id:', formSubmissionDetailsFieldId);
          }
        }

        if (!formSubmissionDetailsFieldId) {
          console.warn('[v0] STEP 2: "Form Submission Details" field not found in custom fields list');
          console.log('[v0] STEP 2: All available custom fields:', JSON.stringify(customFieldsList, null, 2));
        }

        // STEP 3: Update contact with custom fields if field ID was found
        if (formSubmissionDetailsFieldId) {
          try {
            const customFieldsData = buildCustomFieldsPayload(formSubmissionDetailsFieldId, formData);
            console.log('[v0] STEP 3: Custom Fields Update Payload:', JSON.stringify(customFieldsData, null, 2));

            const customFieldsEndpoint = `https://api.workspaceconnector.com/v1/contacts/${contactId}`;
            console.log('[v0] STEP 3: Custom Fields Update Endpoint:', customFieldsEndpoint);

            const customFieldsResponse = await fetch(customFieldsEndpoint, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
              },
              body: JSON.stringify(customFieldsData),
            });

            console.log('[v0] STEP 3: Custom Fields Update Response Status:', customFieldsResponse.status);
            console.log('[v0] STEP 3: Custom Fields Update Response Status Text:', customFieldsResponse.statusText);

            const customFieldsResponseText = await customFieldsResponse.text();
            console.log('[v0] STEP 3: Custom Fields Update Response Body:', customFieldsResponseText);

            if (!customFieldsResponse.ok) {
              console.warn('[v0] STEP 3: Custom fields update failed (non-critical):', {
                status: customFieldsResponse.status,
                statusText: customFieldsResponse.statusText,
                body: customFieldsResponseText,
              });
            } else {
              console.log('[v0] STEP 3: Custom fields updated successfully for contact', contactId);
            }
          } catch (customFieldsError) {
            console.error('[v0] STEP 3: Custom fields update error (non-critical):', {
              error: customFieldsError instanceof Error ? customFieldsError.message : 'Unknown error',
            });
          }
        } else {
          console.warn('[v0] STEP 3: Skipping custom fields update - field ID not resolved');
        }
      } catch (customFieldsListError) {
        console.error('[v0] STEP 2: Custom fields list fetch error (non-critical):', {
          error: customFieldsListError instanceof Error ? customFieldsListError.message : 'Unknown error',
        });
      }
    } else {
      console.warn('[v0] No contact ID returned - skipping custom fields operations');
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
