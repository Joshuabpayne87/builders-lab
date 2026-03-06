export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'select';
  placeholder?: string;
  required: boolean;
  options?: Array<{ value: string; label: string }>;
}

export interface FormPreset {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  useCase: string;
}

export const FORM_PRESETS: FormPreset[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Minimal form - just name and email',
    useCase: 'Newsletter, simple lead capture',
    fields: [
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        placeholder: 'John Doe',
        required: true,
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'john@example.com',
        required: true,
      },
    ],
  },
  {
    id: 'contact',
    name: 'Contact',
    description: 'Basic contact form with phone',
    useCase: 'Lead generation, contact forms',
    fields: [
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        placeholder: 'John Doe',
        required: true,
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'john@example.com',
        required: true,
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        placeholder: '(555) 123-4567',
        required: false,
      },
    ],
  },
  {
    id: 'booking',
    name: 'Booking',
    description: 'Appointment scheduling form',
    useCase: 'Service bookings, consultations, demos',
    fields: [
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        placeholder: 'John Doe',
        required: true,
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'john@example.com',
        required: true,
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        placeholder: '(555) 123-4567',
        required: true,
      },
      {
        name: 'preferred_date',
        label: 'Preferred Date',
        type: 'date',
        required: true,
      },
      {
        name: 'message',
        label: 'Message or Notes',
        type: 'textarea',
        placeholder: 'Tell us about your needs...',
        required: false,
      },
    ],
  },
  {
    id: 'consultation',
    name: 'Consultation',
    description: 'Detailed consultation form',
    useCase: 'High-ticket sales, coaching, strategy calls',
    fields: [
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        placeholder: 'John Doe',
        required: true,
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'john@example.com',
        required: true,
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        placeholder: '(555) 123-4567',
        required: true,
      },
      {
        name: 'company',
        label: 'Company Name',
        type: 'text',
        placeholder: 'Your Company',
        required: false,
      },
      {
        name: 'budget',
        label: 'Budget Range',
        type: 'select',
        required: false,
        options: [
          { value: 'under-5k', label: 'Under $5,000' },
          { value: '5k-10k', label: '$5,000 - $10,000' },
          { value: '10k-25k', label: '$10,000 - $25,000' },
          { value: '25k-50k', label: '$25,000 - $50,000' },
          { value: '50k-plus', label: '$50,000+' },
        ],
      },
    ],
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Email signup form',
    useCase: 'Newsletter, content updates, email list building',
    fields: [
      {
        name: 'first_name',
        label: 'First Name',
        type: 'text',
        placeholder: 'John',
        required: false,
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'john@example.com',
        required: true,
      },
    ],
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Build your own form',
    useCase: 'Custom requirements',
    fields: [
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        placeholder: 'John Doe',
        required: true,
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'john@example.com',
        required: true,
      },
    ],
  },
];

/**
 * Get a form preset by ID
 */
export function getFormPreset(presetId: string): FormPreset | undefined {
  return FORM_PRESETS.find(p => p.id === presetId);
}

/**
 * Convert form fields to HTML form markup
 */
export function generateFormHTML(fields: FormField[]): string {
  const fieldHTMLs = fields.map(field => {
    const required = field.required ? 'required' : '';
    const requiredLabel = field.required ? '<span style="color: #ef4444;">*</span>' : '';

    switch (field.type) {
      case 'textarea':
        return `
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 6px; font-weight: 600; font-size: 14px; color: #1f2937;">
              ${field.label} ${requiredLabel}
            </label>
            <textarea
              name="${field.name}"
              placeholder="${field.placeholder || ''}"
              ${required}
              style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; font-family: inherit; resize: vertical; min-height: 100px;"
            ></textarea>
          </div>
        `;

      case 'date':
        return `
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 6px; font-weight: 600; font-size: 14px; color: #1f2937;">
              ${field.label} ${requiredLabel}
            </label>
            <input
              type="date"
              name="${field.name}"
              ${required}
              style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; font-family: inherit;"
            />
          </div>
        `;

      case 'select':
        const options = field.options
          ?.map(
            opt =>
              `<option value="${opt.value}">${opt.label}</option>`
          )
          .join('') || '';
        return `
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 6px; font-weight: 600; font-size: 14px; color: #1f2937;">
              ${field.label} ${requiredLabel}
            </label>
            <select
              name="${field.name}"
              ${required}
              style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; font-family: inherit;"
            >
              <option value="">Select an option...</option>
              ${options}
            </select>
          </div>
        `;

      default:
        return `
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 6px; font-weight: 600; font-size: 14px; color: #1f2937;">
              ${field.label} ${requiredLabel}
            </label>
            <input
              type="${field.type}"
              name="${field.name}"
              placeholder="${field.placeholder || ''}"
              ${required}
              style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; font-family: inherit;"
            />
          </div>
        `;
    }
  });

  return fieldHTMLs.join('');
}
