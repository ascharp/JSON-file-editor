# Dynamic JSON Configuration Editor

A modern, material design web application that allows users to upload JSON configuration files, edit them through a dynamic form interface, and export the updated configuration.

![Material Design](https://img.shields.io/badge/Material%20Design-v14-blue)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

### Currently Implemented
- ✅ **JSON File Upload**: Upload JSON files via file picker or drag-and-drop
- ✅ **Dynamic Form Generation**: Automatically generates form fields based on JSON structure
- ✅ **Material Design UI**: Clean, modern interface following Material Design principles
- ✅ **Enhanced Styling**: Beautiful gradient backgrounds and improved parent element labels
- ✅ **Multi-type Field Support**: 
  - Text inputs for strings
  - Number inputs for numeric values
  - Switches for boolean values
  - Textareas for long strings
  - Array management with add/remove functionality
  - Nested object grouping with improved visual hierarchy
- ✅ **Real-time Editing**: Live form validation and data collection
- ✅ **Smart Export System**: 
  - Change detection between original and modified JSON
  - Confirmation modal showing all changes before export
  - Visual diff with added, modified, and removed values
- ✅ **Responsive Design**: Mobile-friendly layout
- ✅ **Sample Data**: Built-in sample JSON for testing
- ✅ **Error Handling**: Comprehensive error messages and validation
- ✅ **Help System**: Interactive help dialog

### Functional Entry Points

#### Main Interface (`index.html`)
- **Upload Section**: File picker and drag-drop zone for JSON files
- **Configuration Section**: Dynamic form based on uploaded JSON structure
- **Actions Section**: Export and reset functionality
- **Help Dialog**: User guidance accessible via help button in top bar

#### Key JavaScript Functions
- `handleFileSelect()` - Processes uploaded JSON files
- `loadSampleJSON()` - Loads demonstration data
- `generateConfigForm()` - Creates dynamic form fields from JSON
- `collectFormData()` - Gathers form data for export
- `detectChanges()` - Compares original vs modified JSON data
- `showExportConfirmation()` - Displays change confirmation modal
- `exportJSON()` - Initiates export with change detection
- `performExport()` - Downloads updated configuration file
- `resetForm()` - Clears current session

## 🚀 Usage

1. **Upload JSON File**:
   - Click "Choose JSON File" button or drag-and-drop a JSON file
   - Or click "Load Sample JSON" to try with example data

2. **Edit Configuration**:
   - Form fields are automatically generated based on your JSON structure
   - Edit values directly in the form
   - Add/remove items from arrays using the controls
   - Boolean values are represented as toggle switches

3. **Export Updated JSON**:
   - Click "Export JSON" to see a confirmation dialog
   - Review all changes between original and modified JSON
   - Confirm to download your updated configuration as `updated-config.json`

4. **Reset**:
   - Click "Reset" to clear the current session and start over

## 📁 File Structure

```
project/
├── index.html          # Main HTML file with Material Design components
├── css/
│   └── style.css       # Custom styling and responsive design
├── js/
│   └── main.js         # Core JavaScript functionality
└── README.md           # This documentation
```

## 🛠️ Technical Implementation

### Dependencies
- **Material Components Web**: UI components and styling
- **Material Icons**: Icon set for buttons and interface elements
- **Google Fonts (Roboto)**: Typography

### Supported JSON Data Types
- **Strings**: Rendered as text inputs or textareas (for long content)
- **Numbers**: Rendered as number inputs with validation
- **Booleans**: Rendered as Material Design switches
- **Arrays**: Dynamic list with add/remove functionality
- **Objects**: Grouped form sections with nested field organization

### Browser Compatibility
- Modern browsers supporting ES6+
- File API support required for file upload
- Blob API support required for file download

## 🎨 Design Features

- **Material Design 3**: Latest Material Design components and principles
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Dark Theme Support**: Follows system preferences
- **Smooth Animations**: Transitions and micro-interactions
- **Accessibility**: ARIA labels and keyboard navigation support

## 🔧 Features Not Yet Implemented

- **Schema Validation**: JSON schema validation against predefined schemas
- **Undo/Redo**: History management for configuration changes
- **Multiple File Support**: Batch processing of multiple JSON files
- **Custom Field Types**: Date pickers, color selectors, file uploads
- **Import/Export Profiles**: Save and load editing preferences
- **Real-time Preview**: Live JSON preview alongside form editing
- **Internationalization**: Multi-language support
- **Cloud Storage**: Integration with cloud storage services
- **Version Control**: Track changes and maintain version history

## 📋 Recommended Next Steps

1. **Enhanced Validation**:
   - Add JSON schema validation
   - Implement field-level validation rules
   - Add required field indicators

2. **User Experience Improvements**:
   - Add undo/redo functionality
   - Implement auto-save to localStorage
   - Add configuration templates

3. **Advanced Features**:
   - Support for custom field types (dates, colors, etc.)
   - Bulk operations for array management
   - Search and filter within large configurations

4. **Integration Features**:
   - API endpoints for saving/loading configurations
   - Integration with popular configuration management tools
   - Export to different formats (YAML, TOML, etc.)

## 🚀 Deployment

To deploy this application:

1. **Static Hosting**: Upload all files to any static web server
2. **CDN Requirements**: Ensure internet access for Material Design components
3. **HTTPS Recommended**: For better security and modern web features

### Environment Requirements
- Web server with static file serving capability
- Modern browser with JavaScript enabled
- Internet connection for external dependencies

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ using Material Design Components Web**