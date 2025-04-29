const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Puente Tracker API',
      version: '1.0.0',
      description: `
        API documentation for Puente Tracker application.
        
        This API provides real-time financial market data and portfolio management capabilities.
        
        ### Features:
        - Real-time stock and cryptocurrency data
        - Portfolio management
        - Favorite instruments tracking
        - User authentication and authorization
        
        ### Rate Limiting:
        - Alpha Vantage API: 5 requests per minute
        - CoinGecko API: 10 requests per minute
        
        ### Authentication:
        All endpoints except login and register require a valid JWT token in the Authorization header.
      `,
      contact: {
        name: 'API Support',
        email: 'support@markettracker.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from login endpoint'
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the user'
            },
            name: {
              type: 'string',
              description: 'User\'s full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User\'s email address'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User\'s role in the system'
            }
          }
        },
        Instrument: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the instrument'
            },
            symbol: {
              type: 'string',
              description: 'Trading symbol of the instrument'
            },
            name: {
              type: 'string',
              description: 'Full name of the instrument'
            },
            type: {
              type: 'string',
              enum: ['stock', 'crypto'],
              description: 'Type of financial instrument'
            },
            currentPrice: {
              type: 'number',
              description: 'Current market price'
            },
            dailyChange: {
              type: 'number',
              description: 'Daily price change percentage'
            },
            dailyHigh: {
              type: 'number',
              description: 'Daily highest price'
            },
            dailyLow: {
              type: 'number',
              description: 'Daily lowest price'
            },
            volume: {
              type: 'number',
              description: 'Trading volume'
            }
          }
        },
        FinancialInstrument: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            symbol: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string', enum: ['stock', 'crypto'] },
            currentPrice: { type: 'number', format: 'float' },
            dailyChange: { type: 'number', format: 'float' },
            weeklyChange: { type: 'number', format: 'float' },
            dailyHigh: { type: 'number', format: 'float' },
            dailyLow: { type: 'number', format: 'float' },
            volume: { type: 'integer' },
            lastUpdated: { type: 'string', format: 'date-time' }
          }
        },
        Portfolio: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            instrumentId: { type: 'integer' },
            quantity: { type: 'number', format: 'float' },
            averagePrice: { type: 'number', format: 'float' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Favorite: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            instrumentId: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        RateLimitError: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          description: 'Creates a new user account with the provided credentials',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: {
                      type: 'string',
                      description: 'User\'s full name'
                    },
                    email: {
                      type: 'string',
                      format: 'email',
                      description: 'User\'s email address'
                    },
                    password: {
                      type: 'string',
                      format: 'password',
                      description: 'User\'s password (min 8 characters)'
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'User successfully registered',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/User'
                  }
                }
              }
            },
            400: {
              description: 'Invalid input data'
            }
          }
        }
      },
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login user',
          description: 'Authenticates user and returns JWT token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                      description: 'User\'s email address'
                    },
                    password: {
                      type: 'string',
                      format: 'password',
                      description: 'User\'s password'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      token: {
                        type: 'string',
                        description: 'JWT authentication token'
                      },
                      user: {
                        $ref: '#/components/schemas/User'
                      }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Invalid credentials'
            }
          }
        }
      },
      '/api/instruments': {
        get: {
          tags: ['Instruments'],
          summary: 'Get all instruments',
          description: 'Retrieves a list of all financial instruments',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'limit',
              in: 'query',
              description: 'Maximum number of instruments to return',
              schema: {
                type: 'integer',
                default: 20
              }
            },
            {
              name: 'offset',
              in: 'query',
              description: 'Number of instruments to skip',
              schema: {
                type: 'integer',
                default: 0
              }
            }
          ],
          responses: {
            200: {
              description: 'List of instruments',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Instrument'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: [],
    }]
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJsdoc(options); 