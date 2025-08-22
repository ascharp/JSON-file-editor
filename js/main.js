// Global variables
let currentJsonData = null;
let originalJsonData = null; // Store original data for comparison
let mdcComponents = {};

// Initialize Material Design Components
document.addEventListener('DOMContentLoaded', function() {
    // Ensure upload section is visible
    const uploadSection = document.querySelector('.upload-section');
    if (uploadSection) {
        uploadSection.style.display = 'block';
    }
    
    initializeMDCComponents();
    setupEventListeners();
});

function initializeMDCComponents() {
    // Initialize basic components without external libraries
    
    // Initialize buttons with simple hover effects
    document.querySelectorAll('.mdc-button').forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
        });
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Set up simple snackbar
    mdcComponents.snackbar = {
        open: function() {
            const snackbar = document.querySelector('.mdc-snackbar');
            if (snackbar) {
                snackbar.style.display = 'block';
                snackbar.style.opacity = '1';
                snackbar.style.transform = 'translateY(0)';
            }
        },
        close: function() {
            const snackbar = document.querySelector('.mdc-snackbar');
            if (snackbar) {
                snackbar.style.opacity = '0';
                snackbar.style.transform = 'translateY(100%)';
                setTimeout(() => {
                    snackbar.style.display = 'none';
                }, 300);
            }
        }
    };
    
    // Set up simple dialog
    mdcComponents.dialog = {
        open: function() {
            const dialog = document.querySelector('#helpDialog');
            if (dialog) {
                dialog.style.display = 'flex';
                setTimeout(() => {
                    dialog.style.opacity = '1';
                }, 10);
            }
        },
        close: function() {
            const dialog = document.querySelector('#helpDialog');
            if (dialog) {
                dialog.style.opacity = '0';
                setTimeout(() => {
                    dialog.style.display = 'none';
                }, 300);
            }
        }
    };
    
    // Set up export confirmation dialog
    mdcComponents.exportDialog = {
        open: function() {
            const dialog = document.querySelector('#exportConfirmDialog');
            if (dialog) {
                dialog.style.display = 'flex';
                setTimeout(() => {
                    dialog.style.opacity = '1';
                }, 10);
            }
        },
        close: function() {
            const dialog = document.querySelector('#exportConfirmDialog');
            if (dialog) {
                dialog.style.opacity = '0';
                setTimeout(() => {
                    dialog.style.display = 'none';
                }, 300);
            }
        }
    };
}

function setupEventListeners() {
    // File input change event
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
    
    // Export button click event
    document.getElementById('exportButton').addEventListener('click', exportJSON);
    
    // Snackbar action button
    const snackbarAction = document.querySelector('.mdc-snackbar__action');
    if (snackbarAction) {
        snackbarAction.addEventListener('click', () => {
            mdcComponents.snackbar.close();
        });
    }
    
    // Help dialog close functionality
    const helpDialogButton = document.querySelector('#helpDialog .mdc-dialog__button');
    if (helpDialogButton) {
        helpDialogButton.addEventListener('click', () => {
            mdcComponents.dialog.close();
        });
    }
    
    // Help dialog scrim close
    const helpDialogScrim = document.querySelector('#helpDialog .mdc-dialog__scrim');
    if (helpDialogScrim) {
        helpDialogScrim.addEventListener('click', () => {
            mdcComponents.dialog.close();
        });
    }
    
    // Export dialog scrim close
    const exportDialogScrim = document.querySelector('#exportConfirmDialog .mdc-dialog__scrim');
    if (exportDialogScrim) {
        exportDialogScrim.addEventListener('click', () => {
            const dialog = document.getElementById('exportConfirmDialog');
            dialog.style.opacity = '0';
            setTimeout(() => {
                dialog.style.display = 'none';
            }, 300);
        });
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.json')) {
        showSnackbar('Please select a valid JSON file', 'error');
        return;
    }

    // Show file info
    showFileInfo(file);

    // Read file content
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const jsonContent = JSON.parse(e.target.result);
            currentJsonData = jsonContent;
            originalJsonData = JSON.parse(JSON.stringify(jsonContent)); // Deep copy for comparison
            generateConfigForm(jsonContent);
            showSnackbar('JSON file loaded successfully!', 'success');
        } catch (error) {
            showSnackbar('Invalid JSON file. Please check the format.', 'error');
            console.error('JSON parsing error:', error);
        }
    };
    reader.readAsText(file);
}

function showFileInfo(file) {
    const fileInfo = document.getElementById('fileInfo');
    const fileName = fileInfo.querySelector('.file-name');
    const fileSize = fileInfo.querySelector('.file-size');
    
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.style.display = 'block';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function loadSampleJSON() {
    const sampleData = {
        "application": {
            "name": "MyApp",
            "version": "1.0.0",
            "description": "A sample application configuration"
        },
        "database": {
            "host": "localhost",
            "port": 5432,
            "name": "myapp_db",
            "ssl_enabled": true,
            "connection_pool_size": 10
        },
        "api": {
            "base_url": "https://api.example.com",
            "timeout": 30000,
            "rate_limit": 1000,
            "enable_logging": true
        },
        "features": {
            "dark_mode": false,
            "notifications": true,
            "analytics": true,
            "beta_features": false
        },
        "supported_languages": ["en", "es", "fr", "de"],
        "cache_settings": {
            "enabled": true,
            "ttl": 3600,
            "max_size": "100MB"
        },
        "security": {
            "encryption_key": "your-secret-key-here",
            "session_timeout": 1800,
            "max_login_attempts": 5
        }
    };

    currentJsonData = sampleData;
    originalJsonData = JSON.parse(JSON.stringify(sampleData)); // Deep copy for comparison
    generateConfigForm(sampleData);
    showSnackbar('Sample JSON loaded successfully!', 'success');
}

function generateConfigForm(jsonData) {
    const formContainer = document.getElementById('configForm');
    formContainer.innerHTML = '';

    // Generate form fields recursively
    generateFormFields(jsonData, formContainer, '');

    // Show the configuration section with animation
    const configSection = document.getElementById('configSection');
    const actionsSection = document.getElementById('actionsSection');
    
    configSection.style.display = 'block';
    actionsSection.style.display = 'block';
    
    setTimeout(() => {
        configSection.classList.add('show');
        actionsSection.classList.add('show');
    }, 100);

    // Initialize new MDC components
    initializeFormComponents();
}

function generateFormFields(obj, container, prefix) {
    Object.keys(obj).forEach(key => {
        const value = obj[key];
        const fieldName = prefix ? `${prefix}.${key}` : key;
        const fieldId = fieldName.replace(/\./g, '_');

        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            // Create a group for nested objects
            const groupDiv = document.createElement('div');
            groupDiv.className = 'form-field-group';
            
            const groupTitle = document.createElement('h3');
            groupTitle.textContent = formatFieldLabel(key);
            groupDiv.appendChild(groupTitle);
            
            generateFormFields(value, groupDiv, fieldName);
            container.appendChild(groupDiv);
        } else if (Array.isArray(value)) {
            // Handle arrays
            const arrayField = createArrayField(key, value, fieldName);
            container.appendChild(arrayField);
        } else {
            // Create regular input field
            const fieldDiv = createInputField(key, value, fieldName, fieldId);
            container.appendChild(fieldDiv);
        }
    });
}

function createInputField(key, value, fieldName, fieldId) {
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'form-field';

    const fieldType = getFieldType(value);
    
    if (fieldType === 'boolean') {
        // Create switch for boolean values
        fieldDiv.innerHTML = `
            <div class="mdc-form-field">
                <div class="mdc-switch">
                    <div class="mdc-switch__track"></div>
                    <div class="mdc-switch__handle-track">
                        <div class="mdc-switch__handle">
                            <div class="mdc-switch__shadow">
                                <div class="mdc-elevation-overlay"></div>
                            </div>
                            <div class="mdc-switch__ripple"></div>
                        </div>
                    </div>
                    <input type="checkbox" id="${fieldId}" class="mdc-switch__native-control" 
                           data-field="${fieldName}" ${value ? 'checked' : ''} role="switch">
                </div>
                <label for="${fieldId}">${formatFieldLabel(key)}</label>
            </div>
        `;
    } else if (fieldType === 'textarea') {
        // Create textarea for long strings
        fieldDiv.innerHTML = `
            <label class="mdc-text-field mdc-text-field--outlined mdc-text-field--textarea">
                <span class="mdc-notched-outline">
                    <span class="mdc-notched-outline__leading"></span>
                    <span class="mdc-notched-outline__notch">
                        <span class="mdc-floating-label" id="${fieldId}-label">${formatFieldLabel(key)}</span>
                    </span>
                    <span class="mdc-notched-outline__trailing"></span>
                </span>
                <span class="mdc-text-field__resizer">
                    <textarea class="mdc-text-field__input" id="${fieldId}" 
                              data-field="${fieldName}" rows="4" cols="40">${value}</textarea>
                </span>
            </label>
        `;
    } else {
        // Create regular text input
        const inputType = fieldType === 'number' ? 'number' : 'text';
        fieldDiv.innerHTML = `
            <label class="mdc-text-field mdc-text-field--outlined">
                <span class="mdc-notched-outline">
                    <span class="mdc-notched-outline__leading"></span>
                    <span class="mdc-notched-outline__notch">
                        <span class="mdc-floating-label" id="${fieldId}-label">${formatFieldLabel(key)}</span>
                    </span>
                    <span class="mdc-notched-outline__trailing"></span>
                </span>
                <input type="${inputType}" class="mdc-text-field__input" id="${fieldId}" 
                       data-field="${fieldName}" value="${value}">
            </label>
        `;
    }

    return fieldDiv;
}

function createArrayField(key, array, fieldName) {
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'form-field array-field';
    
    const title = document.createElement('h4');
    title.textContent = formatFieldLabel(key);
    fieldDiv.appendChild(title);

    const arrayContainer = document.createElement('div');
    arrayContainer.className = 'array-container';
    arrayContainer.setAttribute('data-field', fieldName);

    // Add existing array items
    array.forEach((item, index) => {
        const arrayItem = createArrayItem(item, index, fieldName);
        arrayContainer.appendChild(arrayItem);
    });

    const controls = document.createElement('div');
    controls.className = 'array-controls';
    controls.innerHTML = `
        <button type="button" class="btn-add" onclick="addArrayItem('${fieldName}')">
            <i class="material-icons">add</i>
            Add Item
        </button>
    `;

    fieldDiv.appendChild(arrayContainer);
    fieldDiv.appendChild(controls);

    return fieldDiv;
}

function createArrayItem(value, index, fieldName) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'array-item';
    
    const inputType = typeof value === 'number' ? 'number' : 'text';
    itemDiv.innerHTML = `
        <input type="${inputType}" value="${value}" 
               data-field="${fieldName}" data-index="${index}" 
               class="mdc-text-field__input">
        <button type="button" class="btn-remove" onclick="removeArrayItem(this)">
            <i class="material-icons">remove</i>
        </button>
    `;

    return itemDiv;
}

function addArrayItem(fieldName) {
    const container = document.querySelector(`[data-field="${fieldName}"]`);
    const items = container.querySelectorAll('.array-item');
    const newIndex = items.length;
    
    const newItem = createArrayItem('', newIndex, fieldName);
    container.appendChild(newItem);
    
    // Focus on the new input
    const newInput = newItem.querySelector('input');
    newInput.focus();
}

function removeArrayItem(button) {
    const item = button.closest('.array-item');
    const container = item.parentElement;
    item.remove();
    
    // Reindex remaining items
    const remainingItems = container.querySelectorAll('.array-item input');
    remainingItems.forEach((input, index) => {
        input.setAttribute('data-index', index);
    });
}

function getFieldType(value) {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string' && value.length > 50) return 'textarea';
    return 'text';
}

function formatFieldLabel(key) {
    return key.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function initializeFormComponents() {
    
    // Add focus/blur effects to text fields
    document.querySelectorAll('.mdc-text-field').forEach(textField => {
        const input = textField.querySelector('input, textarea');
        const label = textField.querySelector('.mdc-floating-label');
        
        if (input && label) {
            // Handle label floating
            function updateLabel() {
                if (input.value || input === document.activeElement) {
                    label.style.transform = 'translateY(-16px) scale(0.75)';
                    label.style.color = '#1976d2';
                } else {
                    label.style.transform = 'translateY(0) scale(1)';
                    label.style.color = '#757575';
                }
            }
            
            input.addEventListener('focus', updateLabel);
            input.addEventListener('blur', updateLabel);
            input.addEventListener('input', updateLabel);
            
            // Initial state
            updateLabel();
        }
    });
    
    // Add switch functionality
    document.querySelectorAll('.mdc-switch').forEach(switchElement => {
        const input = switchElement.querySelector('input[type="checkbox"]');
        if (input) {
            input.addEventListener('change', function() {
                if (this.checked) {
                    switchElement.classList.add('mdc-switch--checked');
                } else {
                    switchElement.classList.remove('mdc-switch--checked');
                }
            });
            
            // Initial state
            if (input.checked) {
                switchElement.classList.add('mdc-switch--checked');
            }
        }
    });
}

function collectFormData() {
    const formData = {};
    
    // Collect regular input fields
    document.querySelectorAll('[data-field]').forEach(field => {
        const fieldPath = field.getAttribute('data-field');
        let value;

        if (field.type === 'checkbox') {
            value = field.checked;
        } else if (field.type === 'number') {
            value = parseFloat(field.value) || 0;
        } else {
            value = field.value;
        }

        // Handle array fields differently
        if (field.hasAttribute('data-index')) {
            const arrayPath = fieldPath;
            const index = parseInt(field.getAttribute('data-index'));
            
            if (!getNestedValue(formData, arrayPath)) {
                setNestedValue(formData, arrayPath, []);
            }
            
            const array = getNestedValue(formData, arrayPath);
            array[index] = field.type === 'number' ? parseFloat(field.value) || 0 : field.value;
        } else if (!field.closest('.array-container')) {
            setNestedValue(formData, fieldPath, value);
        }
    });

    // Collect array fields
    document.querySelectorAll('.array-container').forEach(container => {
        const fieldPath = container.getAttribute('data-field');
        const items = container.querySelectorAll('.array-item input');
        const arrayValues = Array.from(items).map(input => {
            return input.type === 'number' ? parseFloat(input.value) || 0 : input.value;
        }).filter(value => value !== ''); // Remove empty values
        
        setNestedValue(formData, fieldPath, arrayValues);
    });

    return formData;
}

function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current) || typeof current[key] !== 'object' || Array.isArray(current[key])) {
            current[key] = {};
        }
        current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
}

function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
}

function exportJSON() {
    if (!currentJsonData || !originalJsonData) {
        showSnackbar('No JSON data to export', 'error');
        return;
    }

    try {
        const updatedData = collectFormData();
        const changes = detectChanges(originalJsonData, updatedData);
        
        // Show confirmation modal with changes
        showExportConfirmation(changes, updatedData);
    } catch (error) {
        showSnackbar('Error preparing export', 'error');
        console.error('Export preparation error:', error);
    }
}

function detectChanges(original, updated, path = '') {
    const changes = [];
    
    // Get all keys from both objects
    const allKeys = new Set([
        ...Object.keys(original || {}),
        ...Object.keys(updated || {})
    ]);
    
    for (const key of allKeys) {
        const currentPath = path ? `${path}.${key}` : key;
        const originalValue = original?.[key];
        const updatedValue = updated?.[key];
        
        if (!(key in (original || {}))) {
            // New key added
            changes.push({
                type: 'added',
                path: currentPath,
                oldValue: undefined,
                newValue: updatedValue
            });
        } else if (!(key in (updated || {}))) {
            // Key removed
            changes.push({
                type: 'removed',
                path: currentPath,
                oldValue: originalValue,
                newValue: undefined
            });
        } else if (Array.isArray(originalValue) && Array.isArray(updatedValue)) {
            // Handle arrays
            if (JSON.stringify(originalValue) !== JSON.stringify(updatedValue)) {
                changes.push({
                    type: 'modified',
                    path: currentPath,
                    oldValue: originalValue,
                    newValue: updatedValue
                });
            }
        } else if (originalValue !== null && typeof originalValue === 'object' && 
                   updatedValue !== null && typeof updatedValue === 'object') {
            // Recursively check nested objects
            const nestedChanges = detectChanges(originalValue, updatedValue, currentPath);
            changes.push(...nestedChanges);
        } else if (originalValue !== updatedValue) {
            // Value changed
            changes.push({
                type: 'modified',
                path: currentPath,
                oldValue: originalValue,
                newValue: updatedValue
            });
        }
    }
    
    return changes;
}

function showExportConfirmation(changes, updatedData) {
    const dialog = document.getElementById('exportConfirmDialog');
    const changesContainer = document.getElementById('changesContainer');
    
    // Clear previous content
    changesContainer.innerHTML = '';
    
    if (changes.length === 0) {
        changesContainer.innerHTML = `
            <div class="no-changes">
                <i class="material-icons">check_circle</i>
                <div>No changes detected. The configuration is identical to the original.</div>
            </div>
        `;
    } else {
        changes.forEach(change => {
            const changeElement = createChangeElement(change);
            changesContainer.appendChild(changeElement);
        });
    }
    
    // Show dialog
    if (mdcComponents.exportDialog) {
        mdcComponents.exportDialog.open();
    } else {
        dialog.style.display = 'flex';
        setTimeout(() => {
            dialog.style.opacity = '1';
        }, 10);
    }
    
    // Set up confirmation handlers
    setupExportConfirmationHandlers(updatedData);
}

function createChangeElement(change) {
    const element = document.createElement('div');
    element.className = `change-item change-item--${change.type}`;
    
    const icon = getChangeIcon(change.type);
    const formattedPath = formatPath(change.path);
    const valueDisplay = formatValueChange(change);
    
    element.innerHTML = `
        <i class="material-icons change-icon change-icon--${change.type}">${icon}</i>
        <div class="change-details">
            <div class="change-path">${formattedPath}</div>
            <div class="change-values">${valueDisplay}</div>
        </div>
    `;
    
    return element;
}

function getChangeIcon(type) {
    const icons = {
        'added': 'add_circle',
        'modified': 'edit',
        'removed': 'remove_circle'
    };
    return icons[type] || 'help';
}

function formatPath(path) {
    return path.split('.').map(part => 
        part.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    ).join(' → ');
}

function formatValueChange(change) {
    const formatValue = (value) => {
        if (value === undefined) return 'undefined';
        if (value === null) return 'null';
        if (typeof value === 'string') return `"${value}"`;
        if (Array.isArray(value)) return `[${value.length} items]`;
        if (typeof value === 'object') return '{object}';
        return String(value);
    };
    
    if (change.type === 'added') {
        return `<span class="change-new-value">+ ${formatValue(change.newValue)}</span>`;
    } else if (change.type === 'removed') {
        return `<span class="change-old-value">- ${formatValue(change.oldValue)}</span>`;
    } else {
        return `
            <span class="change-old-value">${formatValue(change.oldValue)}</span>
            <span class="change-new-value">→ ${formatValue(change.newValue)}</span>
        `;
    }
}

function setupExportConfirmationHandlers(updatedData) {
    const cancelBtn = document.getElementById('cancelExport');
    const confirmBtn = document.getElementById('confirmExport');
    const dialog = document.getElementById('exportConfirmDialog');
    
    // Remove existing listeners
    cancelBtn.replaceWith(cancelBtn.cloneNode(true));
    confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    
    // Get new references
    const newCancelBtn = document.getElementById('cancelExport');
    const newConfirmBtn = document.getElementById('confirmExport');
    
    newCancelBtn.addEventListener('click', () => {
        dialog.style.opacity = '0';
        setTimeout(() => {
            dialog.style.display = 'none';
        }, 300);
    });
    
    newConfirmBtn.addEventListener('click', () => {
        dialog.style.opacity = '0';
        setTimeout(() => {
            dialog.style.display = 'none';
        }, 300);
        
        // Perform the actual export
        performExport(updatedData);
    });
}

function performExport(updatedData) {
    try {
        const jsonString = JSON.stringify(updatedData, null, 2);
        
        // Create and download file
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = 'updated-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showSnackbar('JSON file exported successfully!', 'success');
    } catch (error) {
        showSnackbar('Error exporting JSON file', 'error');
        console.error('Export error:', error);
    }
}

function resetForm() {
    currentJsonData = null;
    originalJsonData = null;
    document.getElementById('configForm').innerHTML = '';
    document.getElementById('configSection').style.display = 'none';
    document.getElementById('actionsSection').style.display = 'none';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('fileInput').value = '';
    
    showSnackbar('Form reset successfully', 'success');
}

function showSnackbar(message, type = 'info') {
    const snackbar = mdcComponents.snackbar;
    const label = document.querySelector('.mdc-snackbar__label');
    
    label.textContent = message;
    
    // Add type-specific styling
    const surface = document.querySelector('.mdc-snackbar__surface');
    surface.className = `mdc-snackbar__surface ${type}`;
    
    snackbar.open();
}

function showHelp() {
    if (mdcComponents.dialog) {
        mdcComponents.dialog.open();
    }
}

// Error handling for uncaught errors
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    showSnackbar('An unexpected error occurred', 'error');
});

// Handle drag and drop for file upload
document.addEventListener('DOMContentLoaded', function() {
    const uploadSection = document.querySelector('.upload-section');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadSection.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadSection.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadSection.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        uploadSection.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    }

    function unhighlight(e) {
        uploadSection.style.backgroundColor = '';
    }

    uploadSection.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            const file = files[0];
            if (file.name.toLowerCase().endsWith('.json')) {
                document.getElementById('fileInput').files = files;
                handleFileSelect({ target: { files: files } });
            } else {
                showSnackbar('Please drop a valid JSON file', 'error');
            }
        }
    }
});