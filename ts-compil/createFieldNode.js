"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendGrid = void 0;
// Create the FriendGrid class
class FriendGrid {
    constructor() {
        this.description = {
            displayName: 'FriendGrid',
            name: 'friendGrid',
            properties: [
                {
                    displayName: 'Resource',
                },
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    displayOptions: {
                        show: {
                            resource: [
                                'contact',
                            ],
                        },
                    },
                    options: [
                        {
                            name: 'Create',
                            value: 'create',
                            description: 'Create a contact',
                        },
                    ],
                    default: 'create',
                    description: 'The operation to perform.',
                },
                {
                    displayName: 'Email',
                    name: 'email',
                },
                {
                    displayName: 'Additional Fields',
                    // Sets up optional fields
                },
            ],
        };
    }
    async execute() {
        let responseData;
        const resource = this.getNodeParameter('resource', 0);
        const operation = this.getNodeParameter('operation', 0);
        //Get credentials the user provided for this node
        const credentials = await this.getCredentials('friendGridApi');
        if (resource === 'contact') {
            if (operation === 'create') {
                // Get email input
                const email = this.getNodeParameter('email', 0);
                // Get additional fields input
                const additionalFields = this.getNodeParameter('additionalFields', 0);
                const data = {
                    email,
                };
                Object.assign(data, additionalFields);
                // Make HTTP request as defined in https://sendgrid.com/docs/api-reference/
                const options = {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${credentials.apiKey}`,
                    },
                    method: 'PUT',
                    body: {
                        contacts: [
                            data,
                        ],
                    },
                    url: `https://api.sendgrid.com/v3/marketing/contacts`,
                    json: true,
                };
                responseData = await this.helpers.httpRequest(options);
            }
        }
        // Map data to n8n data
        return [this.helpers.returnJsonArray(responseData)];
    }
}
exports.FriendGrid = FriendGrid;
