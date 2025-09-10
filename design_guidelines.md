# AWS Landing Zone Intake Form - Design Guidelines

## Design Approach
**System-Based Approach**: Using clean, enterprise-focused design principles inspired by AWS and modern SaaS platforms. This utility-focused application prioritizes clarity, trust, and efficient data collection.

## Color Palette
- **Primary**: 232 69% 20% (AWS-inspired deep blue)
- **Secondary**: 220 15% 25% (Professional dark gray)
- **Accent**: 142 52% 45% (Success green for cost displays)
- **Background Light**: 0 0% 98%
- **Background Dark**: 222 15% 8%
- **Text**: 220 15% 15% (light mode), 0 0% 95% (dark mode)

## Typography
- **Primary Font**: Inter (Google Fonts)
- **Secondary Font**: JetBrains Mono (for cost/technical data)
- **Hierarchy**: text-3xl for headings, text-lg for section titles, text-base for body

## Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8 (p-4, m-6, gap-8, etc.)
- Consistent 6-unit gaps between major sections
- 4-unit padding for cards and form elements
- 8-unit margins for page-level spacing

## Component Library

### Core Components
- **Configuration Cards**: Large selectable cards with radio buttons, featuring configuration names, descriptions, and key specs
- **Cost Calculator Panel**: Sticky/fixed panel showing real-time cost breakdown with clear monthly/one-time distinctions
- **Slider Controls**: Clean range inputs for VM count and storage with live value display
- **Results Display**: Card-based layout showing final recommendations and total costs

### Form Elements
- Clean, modern form styling with subtle borders
- Focus states with primary color accent
- Radio button cards that highlight entire selection area
- Validation feedback in red with clear messaging

### Navigation
- Simple header with application title
- Progress indicator showing form completion status
- Clear "Calculate" and "Reset" action buttons

## Visual Treatment
- **Minimal approach**: Clean backgrounds with subtle shadows on cards
- **Professional styling**: Enterprise-appropriate color scheme avoiding flashy elements
- **Data emphasis**: Cost calculations prominently displayed with clear typography hierarchy
- **Trust indicators**: AWS branding elements and professional layout inspire confidence

## Interactions
- **Real-time updates**: Cost calculations update immediately on input changes
- **Clear feedback**: Selected configurations highlighted with visual state changes
- **Smooth transitions**: Subtle animations only for state changes, no distracting effects
- **Responsive design**: Mobile-first approach with collapsible cost panel

## Images
No large hero images required. This is a utility-focused application where:
- Small AWS logo in header for brand recognition
- Optional small icons for configuration types (compute, storage, networking)
- Focus remains on form functionality and data display

## Layout Strategy
Single-page application with:
1. **Header**: Simple title and AWS branding
2. **Configuration Selection**: Card-based radio button interface
3. **Cost Calculator**: Side panel (desktop) or bottom section (mobile)
4. **Results Display**: Clear summary with total costs
5. **Actions**: Prominent calculate/submit buttons

The design prioritizes clarity, efficiency, and professional appearance suitable for enterprise AWS customers making infrastructure decisions.