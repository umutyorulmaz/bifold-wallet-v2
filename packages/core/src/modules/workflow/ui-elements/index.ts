// Import registries
export { FormFieldRegistry } from './FormFieldRegistry'
export { ContentRegistry } from './ContentRegistry'

// Export types separately
export type { FormFieldProps } from './FormFieldRegistry'
export type { ContentProps } from './ContentRegistry'

// Import and register all form fields (side effects register them)
import './form-fields/TextField'
import './form-fields/RadioField'
import './form-fields/CheckboxField'
import './form-fields/MCQField'
import './form-fields/DateField'
import './form-fields/SliderField'
import './form-fields/DropdownField'
import './form-fields/SubmitButtonField'

// Import and register all content types
import './content/ImageContent'
import './content/TitleContent'
import './content/TextContent'
import './content/ButtonContent'
import './content/FormContent'
import './content/MapContent'
import './content/CalendarContent'
import './content/VideoContent'
import './content/CardContent'
import './content/DialContent'
import './content/BarChartContent'
import './content/PieChartContent'
import './content/DonutChartContent'
import './content/GaugeContent'
import './content/BasicTableContent'
import './content/TimelineContent'
import './content/ShareEntryContent'
