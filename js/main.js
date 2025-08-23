// Global variables
let currentJsonData = null;
let originalJsonData = null; // Store original data for comparison
let currentFileType = null; // 'json' or 'python'
let originalFileContent = null; // Store original file content for Python files
let mdcComponents = {};

// Global functions for modal onclick handlers (must be defined at global scope)
window.cancelExportAction = function() {
    console.log('Cancel export action called');
    closeExportDialog();
};

window.confirmExportAction = function() {
    console.log('Confirm export action called');
    console.log('Current export data:', window.currentExportData);
    
    if (window.currentExportData) {
        console.log('Calling performExport...');
        performExport(window.currentExportData);
        closeExportDialog();
    } else {
        console.error('No export data available!');
        showSnackbar('Error: No data to export', 'error');
        closeExportDialog();
    }
};

// Test function to verify download works
window.testExport = function() {
    console.log('Test export called');
    const testData = { test: 'This is a test export', timestamp: new Date().toISOString() };
    performExport(testData);
};

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
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    // Export button click event
    const exportButton = document.getElementById('exportButton');
    if (exportButton) {
        exportButton.addEventListener('click', exportJSON);
        // Also add onclick as backup
        exportButton.onclick = exportJSON;
    }
    
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

    // Determine file type
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.json')) {
        currentFileType = 'json';
    } else if (fileName.endsWith('.py')) {
        currentFileType = 'python';
    } else {
        showSnackbar('Please select a valid JSON (.json) or Python (.py) file', 'error');
        return;
    }

    // Show file info
    showFileInfo(file);

    // Read file content
    const reader = new FileReader();
    reader.onload = function(e) {
        const fileContent = e.target.result;
        originalFileContent = fileContent;

        try {
            if (currentFileType === 'json') {
                processJsonFile(fileContent);
            } else if (currentFileType === 'python') {
                processPythonFile(fileContent);
            }
        } catch (error) {
            showSnackbar(`Invalid ${currentFileType.toUpperCase()} file. Please check the format.`, 'error');
            console.error(`${currentFileType} parsing error:`, error);
        }
    };
    reader.readAsText(file);
}

function processJsonFile(content) {
    const jsonContent = JSON.parse(content);
    currentJsonData = jsonContent;
    originalJsonData = JSON.parse(JSON.stringify(jsonContent)); // Deep copy for comparison
    generateConfigForm(jsonContent);
    showSnackbar('JSON file loaded successfully!', 'success');
}

function processPythonFile(content) {
    const extractedConfig = extractPythonDAGConfig(content);
    
    if (Object.keys(extractedConfig).length === 0) {
        showSnackbar('No configuration parameters found in Python file', 'warning');
        return;
    }
    
    currentJsonData = extractedConfig;
    originalJsonData = JSON.parse(JSON.stringify(extractedConfig)); // Deep copy for comparison
    generateConfigForm(extractedConfig);
    showSnackbar('Python DAG loaded successfully!', 'success');
}

function extractPythonDAGConfig(pythonContent) {
    const config = {};
    
    try {
        // Extract variable assignments with various Python data types
        const patterns = {
            // String variables: var_name = "value" or var_name = 'value'
            strings: /^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*["']([^"']*?)["']/gm,
            // Number variables: var_name = 123 or var_name = 12.34
            numbers: /^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(-?\d+(?:\.\d+)?)/gm,
            // Boolean variables: var_name = True/False
            booleans: /^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(True|False)/gm,
            // List variables: var_name = [item1, item2, ...]
            lists: /^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*\[(.*?)\]/gm,
            // Dictionary variables: var_name = {key: value, ...}
            dicts: /^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*\{([^}]*)\}/gm
        };

        // Extract DAG default_args if present
        const dagArgsPattern = /default_args\s*=\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/s;
        const dagArgsMatch = pythonContent.match(dagArgsPattern);
        if (dagArgsMatch) {
            config.default_args = parsePythonDict(dagArgsMatch[1]);
        }

        // Extract DAG definition parameters
        const dagPattern = /DAG\s*\(\s*([^)]*)\)/s;
        const dagMatch = pythonContent.match(dagPattern);
        if (dagMatch) {
            const dagParams = parseDagParameters(dagMatch[1]);
            config.dag_config = dagParams;
        }

        // Extract simple variable assignments
        let match;
        
        // Strings
        while ((match = patterns.strings.exec(pythonContent)) !== null) {
            const varName = match[2];
            const value = match[3];
            setNestedConfigValue(config, varName, value);
        }

        // Reset regex state
        patterns.strings.lastIndex = 0;

        // Numbers
        while ((match = patterns.numbers.exec(pythonContent)) !== null) {
            const varName = match[2];
            const value = parseFloat(match[3]);
            setNestedConfigValue(config, varName, value);
        }

        patterns.numbers.lastIndex = 0;

        // Booleans
        while ((match = patterns.booleans.exec(pythonContent)) !== null) {
            const varName = match[2];
            const value = match[3] === 'True';
            setNestedConfigValue(config, varName, value);
        }

        patterns.booleans.lastIndex = 0;

        // Lists
        while ((match = patterns.lists.exec(pythonContent)) !== null) {
            const varName = match[2];
            const listContent = match[3].trim();
            const value = parsePythonList(listContent);
            setNestedConfigValue(config, varName, value);
        }

        patterns.lists.lastIndex = 0;

        // Dictionaries
        while ((match = patterns.dicts.exec(pythonContent)) !== null) {
            const varName = match[2];
            const dictContent = match[3];
            const value = parsePythonDict(dictContent);
            setNestedConfigValue(config, varName, value);
        }

        patterns.dicts.lastIndex = 0;

        // Extract task configurations
        const taskConfigs = extractTaskConfigurations(pythonContent);
        if (Object.keys(taskConfigs).length > 0) {
            config.tasks = taskConfigs;
        }

        return config;

    } catch (error) {
        console.error('Error parsing Python DAG:', error);
        return {};
    }
}

function parsePythonDict(dictContent) {
    const result = {};
    
    // Handle simple key-value pairs
    const pairs = dictContent.split(',');
    
    for (let pair of pairs) {
        pair = pair.trim();
        if (!pair) continue;
        
        const colonIndex = pair.indexOf(':');
        if (colonIndex === -1) continue;
        
        const key = pair.substring(0, colonIndex).trim().replace(/["']/g, '');
        const value = pair.substring(colonIndex + 1).trim();
        
        result[key] = parsePythonValue(value);
    }
    
    return result;
}

function parsePythonList(listContent) {
    if (!listContent || listContent.trim() === '') return [];
    
    const items = listContent.split(',');
    return items.map(item => parsePythonValue(item.trim())).filter(item => item !== null);
}

function parsePythonValue(value) {
    value = value.trim();
    
    // Remove trailing comma if present
    if (value.endsWith(',')) {
        value = value.slice(0, -1).trim();
    }
    
    // String values
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
        return value.slice(1, -1);
    }
    
    // Boolean values
    if (value === 'True') return true;
    if (value === 'False') return false;
    if (value === 'None') return null;
    
    // Number values
    if (/^-?\d+(\.\d+)?$/.test(value)) {
        return parseFloat(value);
    }
    
    // Default to string if we can't parse it
    return value;
}

function parseDagParameters(paramString) {
    const params = {};
    const lines = paramString.split(',');
    
    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        
        const equalIndex = line.indexOf('=');
        if (equalIndex === -1) continue;
        
        const key = line.substring(0, equalIndex).trim();
        const value = line.substring(equalIndex + 1).trim();
        
        params[key] = parsePythonValue(value);
    }
    
    return params;
}

function extractTaskConfigurations(pythonContent) {
    const tasks = {};
    
    // Look for task definitions (common patterns)
    const taskPatterns = [
        // PythonOperator, BashOperator, etc.
        /(\w+)\s*=\s*(\w+Operator)\s*\(\s*([^)]*)\)/g,
        // Task decorators
        /@task[^(]*\([^)]*\)\s*def\s+(\w+)/g
    ];
    
    for (const pattern of taskPatterns) {
        let match;
        while ((match = pattern.exec(pythonContent)) !== null) {
            const taskName = match[1];
            const taskType = match[2] || 'PythonOperator';
            const taskParams = match[3] ? parseDagParameters(match[3]) : {};
            
            tasks[taskName] = {
                type: taskType,
                parameters: taskParams
            };
        }
        pattern.lastIndex = 0;
    }
    
    return tasks;
}

function setNestedConfigValue(config, key, value) {
    // Handle nested keys like "database_config_host" -> database.config.host
    const parts = key.split('_');
    let current = config;
    
    // If it's a simple key, just set it
    if (parts.length <= 2) {
        config[key] = value;
        return;
    }
    
    // For longer keys, try to create nested structure
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!(part in current)) {
            current[part] = {};
        }
        if (typeof current[part] !== 'object') {
            // If it's not an object, we can't nest further, so use the full key
            config[key] = value;
            return;
        }
        current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
}

function showFileInfo(file) {
    const fileInfo = document.getElementById('fileInfo');
    const fileName = fileInfo.querySelector('.file-name');
    const fileSize = fileInfo.querySelector('.file-size');
    
    // Add file type indicator
    const fileType = currentFileType.toUpperCase();
    const typeColor = currentFileType === 'json' ? '#4caf50' : '#ff9800';
    
    fileName.innerHTML = `
        <span style="color: ${typeColor}; font-weight: bold;">[${fileType}]</span> 
        ${file.name}
    `;
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

    currentFileType = 'json';
    currentJsonData = sampleData;
    originalJsonData = JSON.parse(JSON.stringify(sampleData)); // Deep copy for comparison
    originalFileContent = JSON.stringify(sampleData, null, 2);
    generateConfigForm(sampleData);
    showSnackbar('Sample JSON loaded successfully!', 'success');
}

function loadSamplePythonDAG() {
    const samplePythonDAG = `# Sample Airflow DAG Configuration
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from airflow.operators.bash_operator import BashOperator

# DAG Configuration
dag_id = "sample_etl_pipeline"
owner = "data_team"
retries = 3
retry_delay_minutes = 5
email_on_failure = True
email_on_retry = False
start_date = "2024-01-01"

# Database Configuration
database_host = "localhost"
database_port = 5432
database_name = "analytics_db"
database_ssl_enabled = True
connection_timeout = 30

# Processing Configuration
batch_size = 1000
max_parallel_tasks = 4
data_retention_days = 90
enable_monitoring = True
debug_mode = False

# Notification Configuration
slack_webhook = "https://hooks.slack.com/services/your/webhook/url"
notification_channels = ["#data-alerts", "#engineering"]
alert_thresholds = {
    'error_rate': 0.05,
    'processing_time': 3600,
    'memory_usage': 0.8
}

# Default arguments for the DAG
default_args = {
    'owner': owner,
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': email_on_failure,
    'email_on_retry': email_on_retry,
    'retries': retries,
    'retry_delay': timedelta(minutes=retry_delay_minutes)
}

# Create the DAG
dag = DAG(
    dag_id=dag_id,
    default_args=default_args,
    description='Sample ETL pipeline for data processing',
    schedule_interval='@daily',
    catchup=False,
    max_active_runs=1
)

# Task definitions
extract_data = PythonOperator(
    task_id='extract_data',
    python_callable=extract_data_function,
    dag=dag
)

transform_data = PythonOperator(
    task_id='transform_data',
    python_callable=transform_data_function,
    dag=dag
)

load_data = BashOperator(
    task_id='load_data',
    bash_command='python /scripts/load_data.py',
    dag=dag
)

# Set task dependencies
extract_data >> transform_data >> load_data`;

    currentFileType = 'python';
    originalFileContent = samplePythonDAG;
    
    // Process the Python DAG to extract configuration
    const extractedConfig = extractPythonDAGConfig(samplePythonDAG);
    
    currentJsonData = extractedConfig;
    originalJsonData = JSON.parse(JSON.stringify(extractedConfig)); // Deep copy for comparison
    generateConfigForm(extractedConfig);
    showSnackbar('Sample Python DAG loaded successfully!', 'success');
}

function generateConfigForm(jsonData) {
    const formContainer = document.getElementById('configForm');
    formContainer.innerHTML = '';

    // Update UI to reflect file type
    updateConfigUI();

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

function updateConfigUI() {
    const configTitle = document.getElementById('configTitle');
    const configDescription = document.getElementById('configDescription');
    const exportButton = document.getElementById('exportButton');
    
    if (currentFileType === 'python') {
        configTitle.innerHTML = `
            <i class="material-icons" style="vertical-align: middle; color: #ff9800; margin-right: 8px;">code</i>
            Python DAG Configuration
        `;
        configDescription.textContent = 'Edit the DAG configuration parameters extracted from your Python file';
        if (exportButton) {
            exportButton.querySelector('.mdc-button__label').textContent = 'Export Python DAG';
            const icon = exportButton.querySelector('.mdc-button__icon');
            if (icon) icon.textContent = 'code';
        }
    } else {
        configTitle.innerHTML = `
            <i class="material-icons" style="vertical-align: middle; color: #4caf50; margin-right: 8px;">description</i>
            JSON Configuration
        `;
        configDescription.textContent = 'Edit the configuration values below';
        if (exportButton) {
            exportButton.querySelector('.mdc-button__label').textContent = 'Export JSON';
            const icon = exportButton.querySelector('.mdc-button__icon');
            if (icon) icon.textContent = 'download';
        }
    }
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
            <div class="mdc-text-field mdc-text-field--outlined mdc-text-field--textarea">
                <span class="mdc-floating-label" id="${fieldId}-label">${formatFieldLabel(key)}</span>
                <span class="mdc-notched-outline">
                    <span class="mdc-notched-outline__leading"></span>
                    <span class="mdc-notched-outline__notch"></span>
                    <span class="mdc-notched-outline__trailing"></span>
                </span>
                <span class="mdc-text-field__resizer">
                    <textarea class="mdc-text-field__input" id="${fieldId}" 
                              data-field="${fieldName}" rows="4" cols="40">${value}</textarea>
                </span>
            </div>
        `;
    } else {
        // Create regular text input
        const inputType = fieldType === 'number' ? 'number' : 'text';
        fieldDiv.innerHTML = `
            <div class="mdc-text-field mdc-text-field--outlined">
                <span class="mdc-floating-label" id="${fieldId}-label">${formatFieldLabel(key)}</span>
                <span class="mdc-notched-outline">
                    <span class="mdc-notched-outline__leading"></span>
                    <span class="mdc-notched-outline__notch"></span>
                    <span class="mdc-notched-outline__trailing"></span>
                </span>
                <input type="${inputType}" class="mdc-text-field__input" id="${fieldId}" 
                       data-field="${fieldName}" value="${value}">
            </div>
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
            // Simple focus/blur effects for labels
            input.addEventListener('focus', function() {
                label.style.color = '#1976d2';
            });
            
            input.addEventListener('blur', function() {
                label.style.color = '#757575';
            });
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
    console.log('exportJSON called');
    
    if (!currentJsonData || !originalJsonData) {
        console.log('Missing JSON data');
        showSnackbar('No JSON data to export', 'error');
        return;
    }

    try {
        console.log('Collecting form data...');
        const updatedData = collectFormData();
        console.log('Collected data:', updatedData);
        
        console.log('Detecting changes...');
        const changes = detectChanges(originalJsonData, updatedData);
        console.log('Detected changes:', changes);
        
        // TEMPORARY: Skip modal for testing - direct export
        if (false) { // Change to true to test direct export
            console.log('Direct export (testing)');
            performExport(updatedData);
            return;
        }
        
        // Show confirmation modal with changes
        console.log('Showing confirmation modal...');
        showExportConfirmation(changes, updatedData);
    } catch (error) {
        console.error('Export preparation error:', error);
        showSnackbar('Error preparing export', 'error');
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
    console.log('showExportConfirmation called with:', { changesCount: changes.length, updatedData });
    
    const dialog = document.getElementById('exportConfirmDialog');
    const changesContainer = document.getElementById('changesContainer');
    
    console.log('Dialog elements found:', { dialog: !!dialog, changesContainer: !!changesContainer });
    
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
    
    // Update modal button text based on file type
    updateExportModalButton();
    
    // Set up confirmation handlers
    setupExportConfirmationHandlers(updatedData);
}

function updateExportModalButton() {
    const confirmExportLabel = document.getElementById('confirmExportLabel');
    const confirmExportIcon = document.getElementById('confirmExportIcon');
    const exportModalTitle = document.getElementById('exportModalTitle');
    
    if (currentFileType === 'python') {
        if (confirmExportLabel) confirmExportLabel.textContent = 'Export DAG';
        if (confirmExportIcon) confirmExportIcon.textContent = 'code';
        if (exportModalTitle) {
            exportModalTitle.innerHTML = `
                <i class="material-icons" style="vertical-align: middle; margin-right: 8px; color: #ff9800;">code</i>
                Confirm DAG Export Changes
            `;
        }
    } else {
        if (confirmExportLabel) confirmExportLabel.textContent = 'Export JSON';
        if (confirmExportIcon) confirmExportIcon.textContent = 'download';
        if (exportModalTitle) {
            exportModalTitle.innerHTML = `
                <i class="material-icons" style="vertical-align: middle; margin-right: 8px; color: #f57c00;">warning</i>
                Confirm Export Changes
            `;
        }
    }
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
    console.log('setupExportConfirmationHandlers called with:', updatedData);
    
    // Store the data globally for the onclick handlers
    window.currentExportData = updatedData;
}



function closeExportDialog() {
    const dialog = document.getElementById('exportConfirmDialog');
    if (dialog) {
        dialog.style.opacity = '0';
        setTimeout(() => {
            dialog.style.display = 'none';
        }, 300);
    }
}

function performExport(updatedData) {
    if (!updatedData) {
        showSnackbar('Error: No data to export', 'error');
        return;
    }
    
    try {
        let fileContent, fileName, mimeType;
        
        if (currentFileType === 'python') {
            fileContent = generatePythonDAGFromConfig(updatedData);
            fileName = 'updated-dag.py';
            mimeType = 'text/x-python';
        } else {
            fileContent = JSON.stringify(updatedData, null, 2);
            fileName = 'updated-config.json';
            mimeType = 'application/json';
        }
        
        const blob = new Blob([fileContent], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
        
        const fileTypeLabel = currentFileType === 'python' ? 'Python DAG' : 'JSON';
        showSnackbar(`${fileTypeLabel} file exported successfully!`, 'success');
        
    } catch (error) {
        console.error('Export error:', error);
        showSnackbar('Error exporting file', 'error');
    }
}

function generatePythonDAGFromConfig(configData) {
    
    let pythonCode = `# Generated Airflow DAG Configuration
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from airflow.operators.bash_operator import BashOperator

`;

    // Generate variable assignments from config
    const generateVariables = (obj, prefix = '') => {
        let code = '';
        for (const [key, value] of Object.entries(obj)) {
            const varName = prefix ? `${prefix}_${key}` : key;
            
            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                // Handle nested objects
                if (key === 'default_args' || key === 'dag_config') {
                    // These will be handled specially
                    continue;
                }
                code += generateVariables(value, varName);
            } else {
                // Generate variable assignment
                code += `${varName} = ${formatPythonValue(value)}\n`;
            }
        }
        return code;
    };

    // Generate configuration variables
    pythonCode += '# Configuration Variables\n';
    pythonCode += generateVariables(configData);
    pythonCode += '\n';

    // Generate default_args if present
    if (configData.default_args) {
        pythonCode += '# Default arguments for the DAG\n';
        pythonCode += 'default_args = {\n';
        for (const [key, value] of Object.entries(configData.default_args)) {
            pythonCode += `    '${key}': ${formatPythonValue(value)},\n`;
        }
        pythonCode += '}\n\n';
    } else {
        pythonCode += `# Default arguments for the DAG
default_args = {
    'owner': '${configData.owner || 'airflow'}',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': ${configData.email_on_failure || 'False'},
    'email_on_retry': ${configData.email_on_retry || 'False'},
    'retries': ${configData.retries || 1},
    'retry_delay': timedelta(minutes=${configData.retry_delay_minutes || 5})
}

`;
    }

    // Generate DAG definition
    pythonCode += '# Create the DAG\n';
    const dagId = configData.dag_id || configData.dag_config?.dag_id || 'generated_dag';
    pythonCode += `dag = DAG(
    dag_id='${dagId}',
    default_args=default_args,
    description='Generated DAG from configuration',
    schedule_interval='@daily',
    catchup=False,
    max_active_runs=1
)

`;

    // Generate tasks if present
    if (configData.tasks) {
        pythonCode += '# Task definitions\n';
        const taskNames = [];
        
        for (const [taskName, taskConfig] of Object.entries(configData.tasks)) {
            const operatorType = taskConfig.type || 'PythonOperator';
            taskNames.push(taskName);
            
            pythonCode += `${taskName} = ${operatorType}(\n`;
            pythonCode += `    task_id='${taskName}',\n`;
            
            if (taskConfig.parameters) {
                for (const [param, value] of Object.entries(taskConfig.parameters)) {
                    pythonCode += `    ${param}=${formatPythonValue(value)},\n`;
                }
            }
            
            pythonCode += '    dag=dag\n';
            pythonCode += ')\n\n';
        }
        
        // Generate simple task dependencies if there are multiple tasks
        if (taskNames.length > 1) {
            pythonCode += '# Set task dependencies\n';
            pythonCode += taskNames.join(' >> ') + '\n';
        }
    } else {
        // Generate sample tasks
        pythonCode += `# Sample task definitions
sample_task = PythonOperator(
    task_id='sample_task',
    python_callable=lambda: print('Task executed successfully'),
    dag=dag
)
`;
    }

    return pythonCode;
}

function formatPythonValue(value) {
    if (value === null) return 'None';
    if (typeof value === 'boolean') return value ? 'True' : 'False';
    if (typeof value === 'string') return `'${value.replace(/'/g, "\\'")}'`;
    if (typeof value === 'number') return value.toString();
    if (Array.isArray(value)) {
        const items = value.map(item => formatPythonValue(item)).join(', ');
        return `[${items}]`;
    }
    if (typeof value === 'object') {
        const items = Object.entries(value)
            .map(([k, v]) => `'${k}': ${formatPythonValue(v)}`)
            .join(', ');
        return `{${items}}`;
    }
    return `'${String(value)}'`;
}

function resetForm() {
    currentJsonData = null;
    originalJsonData = null;
    currentFileType = null;
    originalFileContent = null;
    document.getElementById('configForm').innerHTML = '';
    document.getElementById('configSection').style.display = 'none';
    document.getElementById('actionsSection').style.display = 'none';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('fileInput').value = '';
    
    // Reset UI elements
    const configTitle = document.getElementById('configTitle');
    const configDescription = document.getElementById('configDescription');
    const exportButton = document.getElementById('exportButton');
    
    if (configTitle) configTitle.textContent = 'Configuration Parameters';
    if (configDescription) configDescription.textContent = 'Edit the configuration values below';
    if (exportButton) {
        exportButton.querySelector('.mdc-button__label').textContent = 'Export JSON';
        const icon = exportButton.querySelector('.mdc-button__icon');
        if (icon) icon.textContent = 'download';
    }
    
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