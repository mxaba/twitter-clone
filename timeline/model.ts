interface TimelineSchema {
    timeline: {
      body: {
        type: string;
        required: string[];
        properties: Record<string, unknown>;
        additionalProperties: boolean;
      };
    };
  }
  
  const timeline: TimelineSchema = {
    timeline: {
      body: {
        type: 'object',
        required: [],
        properties: {},
        additionalProperties: false,
      },
    },
  };
  
  export default timeline;
  