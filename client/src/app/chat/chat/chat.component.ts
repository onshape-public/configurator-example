import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Configuration, ConfigurationParameter, ConfigurationParameterEnum, ConfigurationParameterQuantity, Configurator, ParameterValue } from '../../../typescript-generator/configurator';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicMessage {
  role: string;
  content: string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnChanges {
  @Input() configurator: Configurator;
  @Input() configuration: Configuration;
  @Output() updateConfiguration = new EventEmitter<ParameterValue>();

  apiKey: string = '';
  showModal: boolean = true;
  messages: ChatMessage[] = [];
  inputMessage: string = '';
  loading: boolean = false;
  systemPrompt: string = 'You are a helpful AI assistant that helps users configure a 3D model. When users ask to modify the 3D model parameters, describe what changes you\'re making and confirm them clearly.';
  isExpanded: boolean = false;
  showApiJson: boolean = false;
  lastApiRequest: string = '';
  lastApiResponse: string = '';
  jsonTab: string = 'request';
  apiTools: any[] = [];
  
  constructor() { }

  ngOnInit() {
    // Check if API key exists in localStorage
    const savedApiKey = localStorage.getItem('anthropic_api_key');
    if (savedApiKey) {
      this.apiKey = savedApiKey;
      this.showModal = false;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.configurator && this.configurator.parameters) {
      this.generateApiSchema();
    }
  }

  toggleChat(): void {
    this.isExpanded = !this.isExpanded;
  }

  toggleApiJson(): void {
    this.showApiJson = !this.showApiJson;
  }

  handleApiKeySubmit(): void {
    if (this.apiKey.trim()) {
      // Save API key to localStorage
      localStorage.setItem('anthropic_api_key', this.apiKey);
      this.showModal = false;
    }
  }

  generateApiSchema(): void {
    if (!this.configurator || !this.configurator.parameters) return;
    
    // Create properties for each configuration parameter
    const properties: {[key: string]: any} = {};
    
    // Generate current configuration state for the description
    let configState = "";
    this.configurator.parameters.forEach((param, index) => {
      if (this.configuration && this.configuration.values && this.configuration.values[index]) {
        const value = this.configuration.values[index].value;
        if (param.type === 'enum') {
          const enumParam = param as ConfigurationParameterEnum;
          const option = enumParam.options.find(opt => opt.option === value);
          const displayName = option ? option.optionName : value;
          configState += `${param.name}: ${value} (${displayName}), `;
        } else {
          configState += `${param.name}: ${value}, `;
        }
      }
      
      // Create safe property key by replacing spaces and special chars
      const propKey = param.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
      
      // Create schema for each parameter type
      if (param.type === 'enum') {
        const enumParam = param as ConfigurationParameterEnum;
        properties[propKey] = {
          type: "string",
          description: `Select a value for ${param.name}`,
          enum: enumParam.options.map(opt => opt.option)
        };
      } else if (param.type === 'quantity') {
        const quantityParam = param as ConfigurationParameterQuantity;
        properties[propKey] = {
          type: "number",
          description: `Set ${param.name} value between ${quantityParam.minValue} and ${quantityParam.maxValue} ${quantityParam.units}`,
          minimum: quantityParam.minValue,
          maximum: quantityParam.maxValue
        };
      }
    });
    
    // Remove trailing comma and space
    configState = configState.replace(/, $/, '');

    // Create the tools array for Claude following the specific format required
    this.apiTools = [{
      name: "update_model",
      description: `Update the 3D model configuration. Current state: ${configState}`,
      input_schema: {
        type: "object",
        properties: properties
      }
    }];
    
    // Update system prompt with instructions for how to use the tool
    this.systemPrompt = `You are a helpful AI assistant that helps users configure a 3D model.
When users ask to modify the 3D model parameters, use the update_model tool to apply their requested changes.

When responding:
1. Explain what changes you're making in your text response
2. Use the update_model tool to actually apply the changes
3. Only include parameters that need to be changed in your tool call
4. Describe how the changes will affect the appearance or behavior of the model

For example, if a user says "make it blue", identify that they want to change the color parameter and use the update_model tool with the appropriate color parameter value.`;

    console.log("Generated API schema:", this.apiTools);
  }

  async sendMessage(): Promise<void> {
    if (!this.inputMessage.trim()) return;

    // Add user message to chat
    const newMessage: ChatMessage = { role: 'user', content: this.inputMessage };
    const newMessages = [...this.messages, newMessage];
    this.messages = newMessages;
    
    const userMessage = this.inputMessage;
    this.inputMessage = '';
    this.loading = true;

    try {
      // Convert local messages to format expected by Anthropic API
      const apiMessages: AnthropicMessage[] = this.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Generate updated schema based on current configuration
      this.generateApiSchema();

      // Prepare the request body
      const requestBody = {
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        messages: apiMessages,
        system: this.systemPrompt,
        tools: this.apiTools
      };

      // Store the request JSON for display
      this.lastApiRequest = JSON.stringify(requestBody, null, 2);
      
      console.log('Sending request to Anthropic');
      console.log('System prompt:', this.systemPrompt);
      console.log('Tools:', this.apiTools);

      // Call Anthropic API with tools
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      // Store the response JSON for display
      this.lastApiResponse = JSON.stringify(data, null, 2);
      
      console.log('Response from Anthropic:', data);
      
      if (data.error) {
        this.messages.push({ role: 'assistant', content: `Error: ${data.error.message || 'Failed to get response from Claude'}` });
      } else {
        // Process the response
        let assistantResponse = '';
        let hasToolUse = false;
        
        if (data.content) {
          for (const content of data.content) {
            if (content.type === 'text') {
              assistantResponse += content.text;
            } else if (content.type === 'tool_use') {
              hasToolUse = true;
              // use content.name and content.input directly
              const toolUseName = content.name;
              const params = content.input;
              if (toolUseName === 'update_model') {
                console.log('Tool use detected:', content);
                if (params) {
                  Object.keys(params).forEach(propKey => {
                    const paramValue = params[propKey];
                    const param = this.configurator.parameters.find(p => {
                      const key = p.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
                      return key === propKey;
                    });
                    if (param) {
                      this.updateConfigurationParameter(param.name, paramValue);
                    }
                  });
                }
              }
            }
          }
        }
        
        // Add assistant response to chat
        const assistantMessage: ChatMessage = { 
          role: 'assistant', 
          content: assistantResponse || 'No response received'
        };
        this.messages.push(assistantMessage);
        
        // For tool use that requires a result, we would need to continue the conversation
        if (hasToolUse) {
          console.log('Tool use executed, changes applied to model');
        }
      }
    } catch (error) {
      console.error("Error communicating with Anthropic API:", error);
      const errorMessage: ChatMessage = { 
        role: 'assistant', 
        content: `Error communicating with Anthropic API: ${error.message || 'Unknown error'}`
      };
      this.messages.push(errorMessage);
    } finally {
      this.loading = false;
    }
  }

  updateConfigurationParameter(paramName: string, paramValue: any): void {
    console.log(`Updating parameter: ${paramName} to value: ${paramValue}`);
    
    // Find the parameter in the configurator
    const paramIndex = this.configurator.parameters.findIndex(p => p.name === paramName);
    
    if (paramIndex >= 0) {
      // Create a parameter value update
      const parameter = this.configurator.parameters[paramIndex];
      const parameterValue: ParameterValue = {
        parameter: parameter.id,
        value: String(paramValue)
      };
      
      console.log(`Emitting update for parameter ${parameter.id} with value ${paramValue}`);
      
      // Emit the update event to be handled by the configurator component
      this.updateConfiguration.emit(parameterValue);
    } else {
      console.warn(`Parameter not found: ${paramName}`);
    }
  }

  processResponseForConfigChanges(response: string): void {
    if (!this.configurator || !this.configurator.parameters) return;
    
    console.log("Processing response for config changes:", response);
    
    // Process each parameter
    this.configurator.parameters.forEach((param, index) => {
      const paramName = param.name;
      
      // More comprehensive regex patterns to identify parameter changes in the text
      const patterns = [
        // Direct mentions with parameter name
        new RegExp(`${paramName}(?:\\s+(?:parameter|setting))?\\s+(?:to|:)\\s+["']?([\\w\\.]+)["']?`, 'i'),
        // Changing/setting/updating mentions
        new RegExp(`(?:changing|setting|updating|modified|change|set|update|modify)\\s+(?:the\\s+)?${paramName}(?:\\s+(?:parameter|setting))?\\s+(?:to|:)\\s+["']?([\\w\\.]+)["']?`, 'i'),
        // I'll/I will statements
        new RegExp(`I(?:'ll| will)\\s+(?:change|set|update|modify)\\s+(?:the\\s+)?${paramName}(?:\\s+(?:parameter|setting))?\\s+(?:to|:)\\s+["']?([\\w\\.]+)["']?`, 'i')
      ];
      
      // Try each pattern until we find a match
      let match = null;
      for (const pattern of patterns) {
        match = response.match(pattern);
        if (match && match[1]) {
          break;
        }
      }
      
      if (match && match[1]) {
        let newValue = match[1];
        
        // Remove any trailing punctuation
        newValue = newValue.replace(/[.,;:]$/, '');
        console.log(`Found potential change for ${paramName}: ${newValue}`);
        
        // For enum parameters, find the closest matching option
        if (param.type === 'enum') {
          const enumParam = param as ConfigurationParameterEnum;
          
          // Check if the value exactly matches one of the options
          const exactOption = enumParam.options.find(opt => 
            opt.option.toLowerCase() === newValue.toLowerCase() || 
            opt.optionName.toLowerCase() === newValue.toLowerCase()
          );
          
          if (exactOption) {
            console.log(`Found exact enum match for ${paramName}: ${exactOption.option}`);
            this.updateConfigurationParameter(paramName, exactOption.option);
          } else {
            // If no exact match, try to find the closest option
            console.log(`Looking for closest enum match for ${paramName} with value ${newValue}`);
            const lowerNewValue = newValue.toLowerCase();
            for (const option of enumParam.options) {
              if (option.option.toLowerCase().includes(lowerNewValue) || 
                  lowerNewValue.includes(option.option.toLowerCase()) ||
                  option.optionName.toLowerCase().includes(lowerNewValue) ||
                  lowerNewValue.includes(option.optionName.toLowerCase())) {
                console.log(`Found close enum match for ${paramName}: ${option.option}`);
                this.updateConfigurationParameter(paramName, option.option);
                break;
              }
            }
          }
        } 
        // For quantity parameters, try to parse the new value as a number
        else if (param.type === 'quantity') {
          const quantityParam = param as ConfigurationParameterQuantity;
          const numValue = parseFloat(newValue);
          
          if (!isNaN(numValue)) {
            // Ensure the value is within min/max bounds
            const boundedValue = Math.max(quantityParam.minValue, 
                                Math.min(quantityParam.maxValue, numValue));
            console.log(`Updating quantity for ${paramName}: ${boundedValue}`);
            this.updateConfigurationParameter(paramName, boundedValue);
          }
        }
      }
    });
  }
}
