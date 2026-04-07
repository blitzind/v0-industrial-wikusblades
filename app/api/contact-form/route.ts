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

function mapFormDataToContactCore(data: ContactFormData, workspaceId: string): ContactCorePayload {
  // Build full name from firstName and lastName, trimming extra spaces
  const name = `${data.firstName} ${data.lastName}`.trim();
  
  // Return native contact fields WITH workspaceId
  return {
    workspaceId: workspaceId,
    name: name, // REQUIRED: NOT NULL constraint
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    phone: data.phone,
    company: data.company,
  };
}

export async function POST(request: NextRequest) {
  try {
    // Validate API key and workspace ID are set
    const apiKey = process.env.API_KEY_FUZOR_FORM;
    const workspaceId = process.env.FUZOR_WORKSPACE_ID;
    
    console.log('[v0] API_KEY_FUZOR_FORM exists:', !!apiKey);
    console.log('[v0] FUZOR_WORKSPACE_ID exists:', !!workspaceId);
    
    if (!apiKey) {
      console.error('[v0] CRITICAL: API_KEY_FUZOR_FORM environment variable is missing');
      return NextResponse.json(
        { error: 'Workspace API key is missing - contact administrator' },
        { status: 500 }
      );
    }

    if (!workspaceId) {
      console.error('[v0] CRITICAL: FUZOR_WORKSPACE_ID environment variable is missing');
      return NextResponse.json(
        { error: 'Workspace ID is missing - contact administrator' },
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
    const coreContactPayload = mapFormDataToContactCore(formData, workspaceId);
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

        // STEP 3: Update contact with custom fields - Try all 4 fallback formats
        if (formSubmissionDetailsFieldId) {
          try {
            console.log('[v0] STEP 3: Starting custom fields update - testing all 4 formats...');
            
            const customFieldsEndpoint = `https://api.workspaceconnector.com/v1/contacts/${contactId}`;
            console.log('[v0] STEP 3: Update Endpoint:', customFieldsEndpoint);

            const formSubmissionDetails = [
              `Industry: ${formData.industry || 'N/A'}`,
              `Materials: ${formData.applicationDescription || 'N/A'}`,
              `Challenges: ${formData.currentChallenges || 'N/A'}`,
              `Contact Consent: ${formData.agreeToContact ? 'Yes' : 'No'}`,
              `Privacy Agreement: ${formData.agreeToPrivacy ? 'Yes' : 'No'}`,
              `Source: Home Page`,
            ].join('\n');

            // FALLBACK FORMAT 1: customFields with id/value
            console.log('[v0] STEP 3: FALLBACK #1 - Trying customFields with id/value...');
            const payload1 = {
              workspaceId: workspaceId,
              customFields: [
                {
                  id: formSubmissionDetailsFieldId,
                  value: formSubmissionDetails,
                },
              ],
            };
            console.log('[v0] STEP 3: FALLBACK #1 - Payload:', JSON.stringify(payload1, null, 2));

            let response1 = await fetch(customFieldsEndpoint, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
              },
              body: JSON.stringify(payload1),
            });

            const responseText1 = await response1.text();
            console.log('[v0] STEP 3: FALLBACK #1 - Status:', response1.status);
            console.log('[v0] STEP 3: FALLBACK #1 - Status Text:', response1.statusText);
            console.log('[v0] STEP 3: FALLBACK #1 - Response Body:', responseText1);

            if (response1.ok) {
              console.log('[v0] STEP 3: FALLBACK #1 - SUCCESS: customFields with id/value worked');
              console.log('[v0] STEP 3: Source field included: Source: Home Page');
            } else {
              // FALLBACK FORMAT 2: customFields with key/value
              console.log('[v0] STEP 3: FALLBACK #1 failed, trying FALLBACK #2 - customFields with key/value...');
              const payload2 = {
                workspaceId: workspaceId,
                customFields: [
                  {
                    key: 'form_submission_details',
                    value: formSubmissionDetails,
                  },
                ],
              };
              console.log('[v0] STEP 3: FALLBACK #2 - Payload:', JSON.stringify(payload2, null, 2));

              let response2 = await fetch(customFieldsEndpoint, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': apiKey,
                },
                body: JSON.stringify(payload2),
              });

              const responseText2 = await response2.text();
              console.log('[v0] STEP 3: FALLBACK #2 - Status:', response2.status);
              console.log('[v0] STEP 3: FALLBACK #2 - Status Text:', response2.statusText);
              console.log('[v0] STEP 3: FALLBACK #2 - Response Body:', responseText2);

              if (response2.ok) {
                console.log('[v0] STEP 3: FALLBACK #2 - SUCCESS: customFields with key/value worked');
                console.log('[v0] STEP 3: Source field included: Source: Home Page');
              } else {
                // FALLBACK FORMAT 3: notes field
                console.log('[v0] STEP 3: FALLBACK #2 failed, trying FALLBACK #3 - notes field...');
                const payload3 = {
                  workspaceId: workspaceId,
                  notes: formSubmissionDetails,
                };
                console.log('[v0] STEP 3: FALLBACK #3 - Payload:', JSON.stringify(payload3, null, 2));

                let response3 = await fetch(customFieldsEndpoint, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                  },
                  body: JSON.stringify(payload3),
                });

                const responseText3 = await response3.text();
                console.log('[v0] STEP 3: FALLBACK #3 - Status:', response3.status);
                console.log('[v0] STEP 3: FALLBACK #3 - Status Text:', response3.statusText);
                console.log('[v0] STEP 3: FALLBACK #3 - Response Body:', responseText3);

                if (response3.ok) {
                  console.log('[v0] STEP 3: FALLBACK #3 - SUCCESS: notes field worked');
                  console.log('[v0] STEP 3: Source field included: Source: Home Page');
                } else {
                  // FALLBACK FORMAT 4: description field
                  console.log('[v0] STEP 3: FALLBACK #3 failed, trying FALLBACK #4 - description field...');
                  const payload4 = {
                    workspaceId: workspaceId,
                    description: formSubmissionDetails,
                  };
                  console.log('[v0] STEP 3: FALLBACK #4 - Payload:', JSON.stringify(payload4, null, 2));

                  let response4 = await fetch(customFieldsEndpoint, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      'x-api-key': apiKey,
                    },
                    body: JSON.stringify(payload4),
                  });

                  const responseText4 = await response4.text();
                  console.log('[v0] STEP 3: FALLBACK #4 - Status:', response4.status);
                  console.log('[v0] STEP 3: FALLBACK #4 - Status Text:', response4.statusText);
                  console.log('[v0] STEP 3: FALLBACK #4 - Response Body:', responseText4);

                  if (response4.ok) {
                    console.log('[v0] STEP 3: FALLBACK #4 - SUCCESS: description field worked');
                    console.log('[v0] STEP 3: Source field included: Source: Home Page');
                  } else {
                    console.error('[v0] STEP 3: ALL 4 FALLBACK FORMATS FAILED');
                    console.log('[v0] STEP 3: Summary of all attempts:');
                    console.log('[v0] STEP 3:   - Fallback #1 (customFields id/value): ' + response1.status);
                    console.log('[v0] STEP 3:   - Fallback #2 (customFields key/value): ' + response2.status);
                    console.log('[v0] STEP 3:   - Fallback #3 (notes): ' + response3.status);
                    console.log('[v0] STEP 3:   - Fallback #4 (description): ' + response4.status);
                  }
                }
              }
            }
          } catch (customFieldsError) {
            console.error('[v0] STEP 3: Custom fields update error:', {
              error: customFieldsError instanceof Error ? customFieldsError.message : 'Unknown error',
              stack: customFieldsError instanceof Error ? customFieldsError.stack : undefined,
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
