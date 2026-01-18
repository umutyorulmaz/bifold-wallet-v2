/**
 * Sample Student ID SVG Template
 *
 * A fully designed Student ID card template with {{placeholders}}
 * for credential data. The logo, colors, and layout are baked in.
 *
 * Placeholders used:
 * - {{FullName}} - Student's full name
 * - {{StudentNumber}} - Student ID number
 * - {{Expiration}} - Card expiration date
 * - {{SchoolName}} - Name of the school
 * - {{Photo}} - Student photo (base64 data URI)
 */

export const STUDENT_ID_TEMPLATE = `<svg width="320" height="202" viewBox="0 0 320 202" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1E3A5F"/>
      <stop offset="100%" stop-color="#0077B6"/>
    </linearGradient>
    <clipPath id="cardClip">
      <rect width="320" height="202" rx="12"/>
    </clipPath>
    <clipPath id="photoClip">
      <rect x="16" y="58" width="70" height="70" rx="6"/>
    </clipPath>
  </defs>

  <g clip-path="url(#cardClip)">
    <!-- Card Background -->
    <rect width="320" height="202" fill="#FFFFFF"/>

    <!-- Header -->
    <rect width="320" height="48" fill="url(#headerGrad)"/>

    <!-- School Name -->
    <text x="60" y="22" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF">{{SchoolName}}</text>
    <text x="60" y="38" font-family="Arial, sans-serif" font-size="10" fill="#FFFFFF" opacity="0.9">STUDENT ID</text>

    <!-- Photo placeholder -->
    <rect x="16" y="58" width="70" height="70" rx="6" fill="#E5E7EB" stroke="#1E3A5F" stroke-width="2"/>
    <g clip-path="url(#photoClip)">
      <!-- Default avatar icon if no photo -->
      <rect x="16" y="58" width="70" height="70" fill="#E5E7EB"/>
      <circle cx="51" cy="83" r="15" fill="#9CA3AF"/>
      <ellipse cx="51" cy="115" rx="25" ry="20" fill="#9CA3AF"/>
    </g>

    <!-- Student Info -->
    <text x="96" y="75" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#1F2937">{{FullName}}</text>

    <text x="96" y="95" font-family="Arial, sans-serif" font-size="9" fill="#6B7280">ID:</text>
    <text x="112" y="95" font-family="Arial, sans-serif" font-size="11" font-weight="600" fill="#1F2937">{{StudentNumber}}</text>

    <text x="96" y="115" font-family="Arial, sans-serif" font-size="9" fill="#6B7280">Expires:</text>
    <text x="134" y="115" font-family="Arial, sans-serif" font-size="11" font-weight="600" fill="#1F2937">{{Expiration}}</text>

    <!-- Barcode area -->
    <rect x="40" y="140" width="240" height="35" fill="#FFFFFF"/>
    <g transform="translate(50, 145)">
      <!-- Simplified barcode visualization -->
      <rect x="0" y="0" width="2" height="22" fill="#1E3A5F"/>
      <rect x="4" y="0" width="1" height="22" fill="#1E3A5F"/>
      <rect x="7" y="0" width="3" height="22" fill="#1E3A5F"/>
      <rect x="12" y="0" width="1" height="22" fill="#1E3A5F"/>
      <rect x="15" y="0" width="2" height="22" fill="#1E3A5F"/>
      <rect x="20" y="0" width="1" height="22" fill="#1E3A5F"/>
      <rect x="23" y="0" width="3" height="22" fill="#1E3A5F"/>
      <rect x="28" y="0" width="1" height="22" fill="#1E3A5F"/>
      <rect x="31" y="0" width="2" height="22" fill="#1E3A5F"/>
      <rect x="36" y="0" width="1" height="22" fill="#1E3A5F"/>
      <rect x="39" y="0" width="3" height="22" fill="#1E3A5F"/>
      <rect x="44" y="0" width="2" height="22" fill="#1E3A5F"/>
      <rect x="48" y="0" width="1" height="22" fill="#1E3A5F"/>
      <rect x="52" y="0" width="2" height="22" fill="#1E3A5F"/>
      <rect x="56" y="0" width="3" height="22" fill="#1E3A5F"/>
      <rect x="61" y="0" width="1" height="22" fill="#1E3A5F"/>
      <rect x="64" y="0" width="2" height="22" fill="#1E3A5F"/>
      <rect x="69" y="0" width="1" height="22" fill="#1E3A5F"/>
      <rect x="72" y="0" width="3" height="22" fill="#1E3A5F"/>
      <rect x="78" y="0" width="1" height="22" fill="#1E3A5F"/>
      <rect x="81" y="0" width="2" height="22" fill="#1E3A5F"/>
      <rect x="86" y="0" width="1" height="22" fill="#1E3A5F"/>
      <rect x="89" y="0" width="3" height="22" fill="#1E3A5F"/>
      <rect x="94" y="0" width="2" height="22" fill="#1E3A5F"/>
      <rect x="99" y="0" width="1" height="22" fill="#1E3A5F"/>
      <rect x="102" y="0" width="2" height="22" fill="#1E3A5F"/>
      <rect x="107" y="0" width="3" height="22" fill="#1E3A5F"/>
      <rect x="112" y="0" width="1" height="22" fill="#1E3A5F"/>
      <rect x="116" y="0" width="2" height="22" fill="#1E3A5F"/>
      <rect x="120" y="0" width="1" height="22" fill="#1E3A5F"/>
      <rect x="124" y="0" width="3" height="22" fill="#1E3A5F"/>
      <rect x="130" y="0" width="1" height="22" fill="#1E3A5F"/>
      <rect x="133" y="0" width="2" height="22" fill="#1E3A5F"/>
      <rect x="138" y="0" width="1" height="22" fill="#1E3A5F"/>
      <rect x="141" y="0" width="3" height="22" fill="#1E3A5F"/>
      <rect x="147" y="0" width="2" height="22" fill="#1E3A5F"/>
      <rect x="152" y="0" width="1" height="22" fill="#1E3A5F"/>
      <rect x="155" y="0" width="2" height="22" fill="#1E3A5F"/>
      <rect x="160" y="0" width="3" height="22" fill="#1E3A5F"/>
      <rect x="166" y="0" width="1" height="22" fill="#1E3A5F"/>
      <rect x="169" y="0" width="2" height="22" fill="#1E3A5F"/>
      <rect x="174" y="0" width="1" height="22" fill="#1E3A5F"/>
      <rect x="177" y="0" width="2" height="22" fill="#1E3A5F"/>
      <rect x="182" y="0" width="1" height="22" fill="#1E3A5F"/>
      <rect x="185" y="0" width="3" height="22" fill="#1E3A5F"/>
      <rect x="191" y="0" width="2" height="22" fill="#1E3A5F"/>
      <rect x="196" y="0" width="1" height="22" fill="#1E3A5F"/>
      <rect x="199" y="0" width="2" height="22" fill="#1E3A5F"/>
      <rect x="204" y="0" width="1" height="22" fill="#1E3A5F"/>
      <rect x="207" y="0" width="3" height="22" fill="#1E3A5F"/>
      <rect x="213" y="0" width="2" height="22" fill="#1E3A5F"/>
      <rect x="218" y="0" width="1" height="22" fill="#1E3A5F"/>
    </g>
    <text x="160" y="177" font-family="monospace" font-size="8" fill="#6B7280" text-anchor="middle">{{StudentNumber}}</text>

    <!-- Bottom accent bar -->
    <rect y="190" width="320" height="12" fill="#0077B6"/>
  </g>
</svg>`

export default STUDENT_ID_TEMPLATE
