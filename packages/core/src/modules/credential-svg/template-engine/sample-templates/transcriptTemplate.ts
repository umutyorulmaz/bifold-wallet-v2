/**
 * Sample Transcript SVG Template (Hybrid)
 *
 * A transcript template with designed header/footer and
 * {{TERMS_TABLE}} placeholder for dynamic course tables.
 *
 * Static Placeholders:
 * - {{FullName}} - Student's full name
 * - {{StudentNumber}} - Student ID number
 * - {{BirthDate}} - Date of birth
 * - {{GPA}} - Cumulative GPA
 * - {{Credits}} - Total credits earned
 * - {{SchoolName}} - Name of the school
 *
 * Dynamic Placeholders:
 * - {{TERMS_TABLE}} - Where course tables are inserted
 * - {{HEIGHT}} - Total SVG height (calculated)
 * - {{FOOTER_Y}} - Footer Y position (calculated)
 */

export const TRANSCRIPT_TEMPLATE = `<svg width="320" height="{{HEIGHT}}" viewBox="0 0 320 {{HEIGHT}}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="transcriptHeaderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0065A4"/>
      <stop offset="100%" stop-color="#172554"/>
    </linearGradient>
    <clipPath id="transcriptClip">
      <rect width="320" height="{{HEIGHT}}" rx="10"/>
    </clipPath>
  </defs>

  <g clip-path="url(#transcriptClip)">
    <!-- Background -->
    <rect width="320" height="{{HEIGHT}}" fill="#FAFAFA"/>

    <!-- Header -->
    <rect width="320" height="52" fill="url(#transcriptHeaderGrad)"/>
    <text x="160" y="34" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">OFFICIAL TRANSCRIPT</text>

    <!-- Student Information Section -->
    <text x="12" y="70" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#0065A4">Student Information</text>
    <line x1="12" y1="74" x2="308" y2="74" stroke="#0065A4" stroke-width="1"/>

    <text x="12" y="90" font-family="Arial, sans-serif" font-size="9" fill="#333333">Name: {{FullName}}</text>
    <text x="12" y="106" font-family="Arial, sans-serif" font-size="9" fill="#333333">ID: {{StudentNumber}}</text>
    <text x="160" y="106" font-family="Arial, sans-serif" font-size="9" fill="#333333">DOB: {{BirthDate}}</text>

    <!-- Academic Summary Box -->
    <rect x="12" y="116" width="296" height="34" rx="6" fill="#F0F7FF" stroke="#0065A4" stroke-width="1"/>
    <text x="20" y="130" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#0065A4">Academic Summary</text>
    <text x="20" y="144" font-family="Arial, sans-serif" font-size="8" fill="#666666">Cumulative GPA:</text>
    <text x="90" y="144" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#0065A4">{{GPA}}</text>
    <text x="160" y="144" font-family="Arial, sans-serif" font-size="8" fill="#666666">Credits:</text>
    <text x="195" y="144" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#0065A4">{{Credits}}</text>

    <!-- Dynamic Terms Table (inserted by system) -->
    {{TERMS_TABLE}}

    <!-- Footer -->
    <line x1="24" y1="{{FOOTER_Y}}" x2="296" y2="{{FOOTER_Y}}" stroke="#DDDDDD" stroke-width="1"/>
    <text x="160" y="{{FOOTER_Y}}" dy="18" font-family="Arial, sans-serif" font-size="8" fill="#888888" text-anchor="middle">{{SchoolName}}</text>
  </g>
</svg>`

/**
 * Configuration for the transcript template
 */
export const TRANSCRIPT_TEMPLATE_CONFIG = {
  /** Width of the template */
  width: 320,
  /** X position where the table starts */
  tableX: 12,
  /** Y position where the table starts (after header + student info + summary) */
  tableStartY: 160,
  /** Width of the table area */
  tableWidth: 296,
}

export default TRANSCRIPT_TEMPLATE
